import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/admin/auth";
import {
  deleteRule,
  getRule,
  TRIGGER_TYPES,
  updateRule,
  type UpdateRulePatch,
} from "@/lib/crm/automations";
import type {
  AutomationAction,
  AutomationTriggerConfig,
  AutomationTriggerType,
} from "@/lib/db/schema";

function isTriggerType(v: unknown): v is AutomationTriggerType {
  return typeof v === "string" && (TRIGGER_TYPES as readonly string[]).includes(v);
}

function sanitizeActions(input: unknown): AutomationAction[] {
  if (!Array.isArray(input)) return [];
  const out: AutomationAction[] = [];
  for (const raw of input) {
    if (!raw || typeof raw !== "object") continue;
    const r = raw as { type?: unknown; config?: unknown };
    const cfg = (r.config && typeof r.config === "object" ? r.config : {}) as Record<string, unknown>;
    if (r.type === "send_email" && typeof cfg.templateSlug === "string") {
      out.push({ type: "send_email", config: { templateSlug: cfg.templateSlug } });
    } else if (r.type === "create_task" && typeof cfg.title === "string") {
      out.push({
        type: "create_task",
        config: {
          title: cfg.title,
          assignedTo: typeof cfg.assignedTo === "string" ? cfg.assignedTo : undefined,
          dueInDays: typeof cfg.dueInDays === "number" ? cfg.dueInDays : undefined,
        },
      });
    } else if (r.type === "add_tag" && typeof cfg.tag === "string") {
      out.push({ type: "add_tag", config: { tag: cfg.tag } });
    } else if (
      r.type === "notify_user" &&
      typeof cfg.recipientSlug === "string" &&
      typeof cfg.title === "string"
    ) {
      out.push({ type: "notify_user", config: { recipientSlug: cfg.recipientSlug, title: cfg.title } });
    }
  }
  return out;
}

function sanitizeTriggerConfig(input: unknown): AutomationTriggerConfig {
  if (!input || typeof input !== "object") return {};
  const r = input as Record<string, unknown>;
  const out: AutomationTriggerConfig = {};
  if (typeof r.toStage === "string" && r.toStage.trim()) out.toStage = r.toStage.trim();
  if (typeof r.source === "string" && r.source.trim()) out.source = r.source.trim();
  return out;
}

function serialize(rule: NonNullable<Awaited<ReturnType<typeof getRule>>>) {
  return {
    ...rule,
    createdAt: rule.createdAt.toISOString(),
    updatedAt: rule.updatedAt.toISOString(),
    lastRunAt: rule.lastRunAt ? rule.lastRunAt.toISOString() : null,
  };
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id: idStr } = await params;
  const id = parseInt(idStr, 10);
  if (Number.isNaN(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  const rule = await getRule(id);
  if (!rule) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ rule: serialize(rule) });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id: idStr } = await params;
  const id = parseInt(idStr, 10);
  if (Number.isNaN(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const patch: UpdateRulePatch = {};
  if (typeof body.name === "string") patch.name = body.name;
  if (body.triggerType !== undefined) {
    if (!isTriggerType(body.triggerType)) {
      return NextResponse.json({ error: "invalid triggerType", allowed: TRIGGER_TYPES }, { status: 400 });
    }
    patch.triggerType = body.triggerType;
  }
  if (body.triggerConfig !== undefined) patch.triggerConfig = sanitizeTriggerConfig(body.triggerConfig);
  if (body.actions !== undefined) patch.actions = sanitizeActions(body.actions);
  if (typeof body.active === "boolean") patch.active = body.active;

  const updated = await updateRule(id, patch);
  if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ rule: serialize(updated) });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id: idStr } = await params;
  const id = parseInt(idStr, 10);
  if (Number.isNaN(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  const ok = await deleteRule(id);
  if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
