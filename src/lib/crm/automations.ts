import { db } from "@/lib/db";
import {
  automationRules,
  automationRuns,
  contacts,
  tasks,
  teamUsers,
  type AutomationAction,
  type AutomationTriggerConfig,
  type AutomationTriggerType,
} from "@/lib/db/schema";
import { and, desc, eq, gte, sql } from "drizzle-orm";
import { addActivity, getContactById } from "@/lib/crm/contacts";
import { getTemplate, renderTemplate, buildContactVars, sendEmailToContact } from "@/lib/crm/email";
import { createNotification } from "@/lib/crm/notifications";

export type AutomationRule = typeof automationRules.$inferSelect;
export type AutomationRun = typeof automationRuns.$inferSelect;

export const TRIGGER_TYPES: AutomationTriggerType[] = [
  "application.stage_changed",
  "deal.stage_changed",
  "contact.created",
  "contact.lifecycle_changed",
];

export const ACTION_TYPES = ["send_email", "create_task", "add_tag", "notify_user"] as const;

export interface AutomationEventBase {
  type: AutomationTriggerType;
  contactId?: number | null;
}

export interface ApplicationStageEvent extends AutomationEventBase {
  type: "application.stage_changed";
  applicationId: number;
  toStage: string;
  fromStage?: string;
}

export interface DealStageEvent extends AutomationEventBase {
  type: "deal.stage_changed";
  dealId: number;
  toStage: string;
  fromStage?: string;
}

export interface ContactCreatedEvent extends AutomationEventBase {
  type: "contact.created";
  contactId: number;
  source?: string | null;
}

export interface ContactLifecycleEvent extends AutomationEventBase {
  type: "contact.lifecycle_changed";
  contactId: number;
  toStage: string;
  fromStage?: string;
}

export type AutomationEvent =
  | ApplicationStageEvent
  | DealStageEvent
  | ContactCreatedEvent
  | ContactLifecycleEvent;

// $”€$”€ Rule CRUD $”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€

export async function listRules(): Promise<AutomationRule[]> {
  return db.select().from(automationRules).orderBy(desc(automationRules.updatedAt));
}

export async function getRule(id: number): Promise<AutomationRule | null> {
  const rows = await db.select().from(automationRules).where(eq(automationRules.id, id)).limit(1);
  return rows[0] ?? null;
}

export interface CreateRulePatch {
  name: string;
  triggerType: AutomationTriggerType;
  triggerConfig?: AutomationTriggerConfig;
  actions?: AutomationAction[];
  active?: boolean;
  createdBySlug?: string | null;
  maxRunsPerDay?: number;
  dedupeWindowMinutes?: number;
}

export async function createRule(patch: CreateRulePatch): Promise<AutomationRule> {
  const inserted = await db
    .insert(automationRules)
    .values({
      name: patch.name.trim(),
      triggerType: patch.triggerType,
      triggerConfig: patch.triggerConfig ?? {},
      actions: patch.actions ?? [],
      active: patch.active ?? true,
      createdBySlug: patch.createdBySlug ?? null,
      maxRunsPerDay: patch.maxRunsPerDay ?? 0,
      dedupeWindowMinutes: patch.dedupeWindowMinutes ?? 0,
    })
    .returning();
  return inserted[0];
}

export interface UpdateRulePatch {
  name?: string;
  triggerType?: AutomationTriggerType;
  triggerConfig?: AutomationTriggerConfig;
  actions?: AutomationAction[];
  active?: boolean;
  maxRunsPerDay?: number;
  dedupeWindowMinutes?: number;
}

export async function updateRule(id: number, patch: UpdateRulePatch): Promise<AutomationRule | null> {
  const updates: Partial<typeof automationRules.$inferInsert> = {
    updatedAt: new Date(),
  };
  if (patch.name !== undefined) updates.name = patch.name.trim();
  if (patch.triggerType !== undefined) updates.triggerType = patch.triggerType;
  if (patch.triggerConfig !== undefined) updates.triggerConfig = patch.triggerConfig;
  if (patch.actions !== undefined) updates.actions = patch.actions;
  if (patch.active !== undefined) updates.active = patch.active;
  if (patch.maxRunsPerDay !== undefined) updates.maxRunsPerDay = patch.maxRunsPerDay;
  if (patch.dedupeWindowMinutes !== undefined) updates.dedupeWindowMinutes = patch.dedupeWindowMinutes;

  const updated = await db
    .update(automationRules)
    .set(updates)
    .where(eq(automationRules.id, id))
    .returning();
  return updated[0] ?? null;
}

export async function deleteRule(id: number): Promise<boolean> {
  const deleted = await db
    .delete(automationRules)
    .where(eq(automationRules.id, id))
    .returning({ id: automationRules.id });
  return deleted.length > 0;
}

export async function listRuns(ruleId: number, limit = 50): Promise<AutomationRun[]> {
  return db
    .select()
    .from(automationRuns)
    .where(eq(automationRuns.ruleId, ruleId))
    .orderBy(desc(automationRuns.createdAt))
    .limit(limit);
}

// $”€$”€ Helpers $”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€

export function interpolate(
  template: string,
  contact: { name: string | null; email: string } | null
): string {
  if (!contact) return template;
  const name = contact.name?.trim() ?? "";
  let firstName = name ? name.split(/\s+/)[0] : "";
  if (!firstName) {
    firstName = contact.email.split("@")[0] ?? "there";
  }
  return template.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (match, key: string) => {
    if (key === "first_name") return firstName;
    if (key === "name") return name || contact.email;
    if (key === "email") return contact.email;
    return match;
  });
}

function eventMatches(
  rule: AutomationRule,
  event: AutomationEvent
): boolean {
  if (rule.triggerType !== event.type) return false;
  const cfg = (rule.triggerConfig ?? {}) as AutomationTriggerConfig;
  if (rule.triggerType === "application.stage_changed" || rule.triggerType === "deal.stage_changed" || rule.triggerType === "contact.lifecycle_changed") {
    if (cfg.toStage && cfg.toStage.trim() !== "") {
      const eventStage = (event as { toStage?: string }).toStage;
      if (eventStage !== cfg.toStage) return false;
    }
  }
  if (rule.triggerType === "contact.created") {
    if (cfg.source && cfg.source.trim() !== "") {
      const src = (event as ContactCreatedEvent).source;
      if (src !== cfg.source) return false;
    }
  }
  return true;
}

interface ActionResult {
  type: string;
  status: "success" | "skipped" | "error";
  message?: string;
  detail?: Record<string, unknown>;
}

async function resolveCreator(slug: string | null | undefined) {
  const targetSlug = slug || "ted";
  const rows = await db
    .select()
    .from(teamUsers)
    .where(eq(teamUsers.slug, targetSlug))
    .limit(1);
  if (rows[0] && rows[0].active) {
    return {
      id: rows[0].id,
      slug: rows[0].slug,
      name: rows[0].name,
      email: rows[0].email,
      role: (rows[0].role as "admin" | "member") ?? "member",
    };
  }
  // Fallback to ted
  const tedRows = await db
    .select()
    .from(teamUsers)
    .where(eq(teamUsers.slug, "ted"))
    .limit(1);
  if (tedRows[0]) {
    return {
      id: tedRows[0].id,
      slug: tedRows[0].slug,
      name: tedRows[0].name,
      email: tedRows[0].email,
      role: (tedRows[0].role as "admin" | "member") ?? "admin",
    };
  }
  return null;
}

async function executeAction(
  action: AutomationAction,
  event: AutomationEvent,
  rule: AutomationRule
): Promise<ActionResult> {
  try {
    const contactId = event.contactId ?? null;
    const contact = contactId ? await getContactById(contactId) : null;

    switch (action.type) {
      case "send_email": {
        if (!contact) return { type: action.type, status: "skipped", message: "no contact" };
        const tmpl = await getTemplate(action.config.templateSlug);
        if (!tmpl) return { type: action.type, status: "error", message: `template not found: ${action.config.templateSlug}` };
        const sender = await resolveCreator(rule.createdBySlug);
        if (!sender) return { type: action.type, status: "error", message: "no sender user available" };
        const vars = buildContactVars(contact, sender);
        const subject = renderTemplate(tmpl.subject, vars);
        const body = renderTemplate(tmpl.body, vars);
        const res = await sendEmailToContact({
          contactId: contact.id,
          user: sender,
          subject,
          body,
          templateId: tmpl.id,
        });
        return {
          type: action.type,
          status: res.status === "sent" ? "success" : "error",
          message: res.errorMessage,
          detail: { messageId: res.messageId, resendId: res.resendId },
        };
      }

      case "create_task": {
        const title = interpolate(action.config.title ?? "", contact);
        if (!title.trim()) return { type: action.type, status: "error", message: "empty title" };
        let dueAt: Date | null = null;
        if (typeof action.config.dueInDays === "number") {
          const d = new Date();
          d.setDate(d.getDate() + action.config.dueInDays);
          dueAt = d;
        }
        const inserted = await db
          .insert(tasks)
          .values({
            contactId: contact?.id ?? null,
            title,
            assignedTo: action.config.assignedTo ?? rule.createdBySlug ?? null,
            createdBy: rule.createdBySlug ?? "automation",
            dueAt,
          })
          .returning();
        const task = inserted[0];
        if (contact) {
          try {
            await addActivity(contact.id, {
              type: "task_created",
              title: `Task created by automation: ${title}`,
              meta: { taskId: task.id, ruleId: rule.id },
              authorName: "Automation",
              authorSlug: rule.createdBySlug ?? null,
            });
          } catch (err) {
            console.error("[Automations] addActivity failed:", err);
          }
        }
        return { type: action.type, status: "success", detail: { taskId: task.id } };
      }

      case "add_tag": {
        if (!contact) return { type: action.type, status: "skipped", message: "no contact" };
        const tag = action.config.tag?.trim();
        if (!tag) return { type: action.type, status: "error", message: "empty tag" };
        const existingTags = Array.isArray(contact.tags) ? contact.tags : [];
        if (existingTags.includes(tag)) {
          return { type: action.type, status: "skipped", message: "tag already present" };
        }
        const nextTags = [...existingTags, tag];
        await db
          .update(contacts)
          .set({ tags: nextTags, updatedAt: new Date() })
          .where(eq(contacts.id, contact.id));
        try {
          await addActivity(contact.id, {
            type: "tag_added",
            title: `Tag added by automation: ${tag}`,
            meta: { tag, ruleId: rule.id },
            authorName: "Automation",
            authorSlug: rule.createdBySlug ?? null,
          });
        } catch (err) {
          console.error("[Automations] addActivity(tag) failed:", err);
        }
        return { type: action.type, status: "success", detail: { tag } };
      }

      case "notify_user": {
        const title = interpolate(action.config.title ?? "", contact);
        const slug = action.config.recipientSlug?.trim();
        if (!slug) return { type: action.type, status: "error", message: "no recipientSlug" };
        await createNotification({
          recipientSlug: slug,
          type: "stage_change",
          title,
          body: `Automation: ${rule.name}`,
          link: contact ? `/admin/contacts/${contact.id}` : null,
        });
        return { type: action.type, status: "success" };
      }

      default: {
        return { type: (action as { type: string }).type, status: "error", message: "unknown action type" };
      }
    }
  } catch (err) {
    return {
      type: action.type,
      status: "error",
      message: err instanceof Error ? err.message : String(err),
    };
  }
}

export function automationsDisabled(): boolean {
  return process.env.AUTOMATIONS_DISABLED === "true";
}

export async function runAutomations(event: AutomationEvent): Promise<void> {
  if (automationsDisabled()) {
    console.log("[automations] no-op: AUTOMATIONS_DISABLED=true");
    return;
  }
  try {
    const rules = await db
      .select()
      .from(automationRules)
      .where(and(eq(automationRules.active, true), eq(automationRules.triggerType, event.type)));

    for (const rule of rules) {
      if (!eventMatches(rule, event)) continue;

      // Safety guard: max runs per day
      if (rule.maxRunsPerDay && rule.maxRunsPerDay > 0) {
        const dayStart = new Date();
        dayStart.setHours(0, 0, 0, 0);
        const countRows = await db
          .select({ c: sql<number>`count(*)::int` })
          .from(automationRuns)
          .where(and(eq(automationRuns.ruleId, rule.id), gte(automationRuns.createdAt, dayStart)));
        const todayCount = countRows[0]?.c ?? 0;
        if (todayCount >= rule.maxRunsPerDay) {
          console.log(`[automations] rule ${rule.id} skipped: max_runs_per_day cap reached (${todayCount}/${rule.maxRunsPerDay})`);
          continue;
        }
      }

      // Safety guard: dedupe window per contact
      if (
        rule.dedupeWindowMinutes &&
        rule.dedupeWindowMinutes > 0 &&
        event.contactId != null
      ) {
        const since = new Date(Date.now() - rule.dedupeWindowMinutes * 60_000);
        const existing = await db
          .select({ id: automationRuns.id })
          .from(automationRuns)
          .where(
            and(
              eq(automationRuns.ruleId, rule.id),
              eq(automationRuns.contactId, event.contactId),
              gte(automationRuns.createdAt, since)
            )
          )
          .limit(1);
        if (existing.length > 0) {
          console.log(`[automations] rule ${rule.id} skipped: dedup window for contact ${event.contactId}`);
          continue;
        }
      }

      const results: ActionResult[] = [];
      let hadError = false;
      let hadSuccess = false;

      const actions = Array.isArray(rule.actions) ? rule.actions : [];
      for (const action of actions) {
        const res = await executeAction(action, event, rule);
        results.push(res);
        if (res.status === "error") hadError = true;
        if (res.status === "success") hadSuccess = true;
      }

      const status =
        hadError && hadSuccess ? "partial" : hadError ? "error" : "success";

      try {
        await db.insert(automationRuns).values({
          ruleId: rule.id,
          contactId: event.contactId ?? null,
          status,
          event: event as unknown as Record<string, unknown>,
          result: { actions: results } as Record<string, unknown>,
          error: hadError ? results.find((r) => r.status === "error")?.message ?? null : null,
        });
        await db
          .update(automationRules)
          .set({
            lastRunAt: new Date(),
            runCount: sql`${automationRules.runCount} + 1`,
          })
          .where(eq(automationRules.id, rule.id));
      } catch (err) {
        console.error("[automations] run log failed", err);
      }
    }
  } catch (err) {
    console.error("[automations] engine failed", err);
  }
}
