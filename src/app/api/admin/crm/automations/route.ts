import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/admin/auth";
import { createRule, listRules, TRIGGER_TYPES, ACTION_TYPES } from "@/lib/crm/automations";
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
      out.push({
        type: "notify_user",
        config: { recipientSlug: cfg.recipientSlug, title: cfg.title },
      });
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

export async function GET() {
  try {
    await requireAuth();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const rules = await listRules();
  return NextResponse.json({
    rules: rules.map((r) => ({
      ...r,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
      lastRunAt: r.lastRunAt ? r.lastRunAt.toISOString() : null,
    })),
    triggerTypes: TRIGGER_TYPES,
    actionTypes: ACTION_TYPES,
  });
}

export async function POST(request: Request) {
  let user;
  try {
    user = await requireAuth();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  if (!name) return NextResponse.json({ error: "name required" }, { status: 400 });
  if (!isTriggerType(body.triggerType)) {
    return NextResponse.json({ error: "invalid triggerType", allowed: TRIGGER_TYPES }, { status: 400 });
  }

  const rule = await createRule({
    name,
    triggerType: body.triggerType,
    triggerConfig: sanitizeTriggerConfig(body.triggerConfig),
    actions: sanitizeActions(body.actions),
    active: typeof body.active === "boolean" ? body.active : true,
    createdBySlug: user.slug,
    maxRunsPerDay:
      typeof body.maxRunsPerDay === "number" && body.maxRunsPerDay >= 0
        ? Math.floor(body.maxRunsPerDay)
        : 0,
    dedupeWindowMinutes:
      typeof body.dedupeWindowMinutes === "number" && body.dedupeWindowMinutes >= 0
        ? Math.floor(body.dedupeWindowMinutes)
        : 0,
  });

  return NextResponse.json({
    rule: {
      ...rule,
      createdAt: rule.createdAt.toISOString(),
      updatedAt: rule.updatedAt.toISOString(),
      lastRunAt: rule.lastRunAt ? rule.lastRunAt.toISOString() : null,
    },
  });
}
