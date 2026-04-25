import { db } from "@/lib/db";
import {
  contacts,
  customFieldDefs,
  type CustomFieldOption,
  type CustomFieldType,
} from "@/lib/db/schema";
import { asc, eq, sql } from "drizzle-orm";

export type CustomFieldDef = typeof customFieldDefs.$inferSelect;

export interface CustomFieldDefRow {
  id: number;
  key: string;
  label: string;
  type: CustomFieldType;
  options: CustomFieldOption[];
  helpText: string | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

const FIELD_TYPES: CustomFieldType[] = [
  "text",
  "longtext",
  "number",
  "date",
  "url",
  "select",
  "boolean",
];

function serialize(d: CustomFieldDef): CustomFieldDefRow {
  return {
    id: d.id,
    key: d.key,
    label: d.label,
    type: d.type as CustomFieldType,
    options: Array.isArray(d.options) ? d.options : [],
    helpText: d.helpText,
    sortOrder: d.sortOrder,
    createdAt: d.createdAt.toISOString(),
    updatedAt: d.updatedAt.toISOString(),
  };
}

export function isValidKey(key: string): boolean {
  return /^[a-z0-9_]{1,40}$/.test(key);
}

export function isValidType(type: string): type is CustomFieldType {
  return (FIELD_TYPES as string[]).includes(type);
}

export async function listFieldDefs(): Promise<CustomFieldDefRow[]> {
  const rows = await db
    .select()
    .from(customFieldDefs)
    .orderBy(asc(customFieldDefs.sortOrder), asc(customFieldDefs.label));
  return rows.map(serialize);
}

export async function getFieldDef(id: number): Promise<CustomFieldDefRow | null> {
  const rows = await db
    .select()
    .from(customFieldDefs)
    .where(eq(customFieldDefs.id, id))
    .limit(1);
  return rows[0] ? serialize(rows[0]) : null;
}

export async function getFieldDefByKey(key: string): Promise<CustomFieldDefRow | null> {
  const rows = await db
    .select()
    .from(customFieldDefs)
    .where(eq(customFieldDefs.key, key))
    .limit(1);
  return rows[0] ? serialize(rows[0]) : null;
}

export interface CreateFieldDefParams {
  key: string;
  label: string;
  type: CustomFieldType;
  options?: CustomFieldOption[];
  helpText?: string | null;
  sortOrder?: number;
}

export async function createFieldDef(
  params: CreateFieldDefParams
): Promise<CustomFieldDefRow> {
  const key = params.key.trim().toLowerCase();
  if (!isValidKey(key)) {
    throw new Error("Invalid key: must be 1$–40 chars, lowercase letters/digits/underscore");
  }
  if (!isValidType(params.type)) {
    throw new Error("Invalid type");
  }
  const label = params.label.trim();
  if (!label) throw new Error("Label required");

  const existing = await getFieldDefByKey(key);
  if (existing) throw new Error(`Key already exists: ${key}`);

  const options = normalizeOptions(params.options, params.type);

  const inserted = await db
    .insert(customFieldDefs)
    .values({
      key,
      label,
      type: params.type,
      options,
      helpText: params.helpText?.trim() || null,
      sortOrder: params.sortOrder ?? 0,
    })
    .returning();
  return serialize(inserted[0]);
}

export interface UpdateFieldDefPatch {
  label?: string;
  helpText?: string | null;
  sortOrder?: number;
  options?: CustomFieldOption[];
}

export async function updateFieldDef(
  id: number,
  patch: UpdateFieldDefPatch
): Promise<CustomFieldDefRow | null> {
  const current = await getFieldDef(id);
  if (!current) return null;
  const updates: Partial<typeof customFieldDefs.$inferInsert> = { updatedAt: new Date() };
  if (patch.label !== undefined) {
    const label = patch.label.trim();
    if (!label) throw new Error("Label required");
    updates.label = label;
  }
  if (patch.helpText !== undefined) {
    updates.helpText = patch.helpText?.trim() || null;
  }
  if (patch.sortOrder !== undefined) updates.sortOrder = patch.sortOrder;
  if (patch.options !== undefined) {
    updates.options = normalizeOptions(patch.options, current.type);
  }
  const updated = await db
    .update(customFieldDefs)
    .set(updates)
    .where(eq(customFieldDefs.id, id))
    .returning();
  return updated[0] ? serialize(updated[0]) : null;
}

function normalizeOptions(
  options: CustomFieldOption[] | undefined,
  type: CustomFieldType
): CustomFieldOption[] {
  if (type !== "select") return [];
  if (!Array.isArray(options)) return [];
  const out: CustomFieldOption[] = [];
  const seen = new Set<string>();
  for (const o of options) {
    if (!o || typeof o !== "object") continue;
    const value = String(o.value ?? "").trim();
    const label = String(o.label ?? "").trim() || value;
    if (!value || seen.has(value)) continue;
    seen.add(value);
    out.push({ label, value });
  }
  return out;
}

export async function deleteFieldDef(id: number): Promise<boolean> {
  const def = await getFieldDef(id);
  if (!def) return false;
  // Strip this key off every contact's custom_fields.user
  await db.execute(sql`
    UPDATE ${contacts}
    SET custom_fields = jsonb_set(
      custom_fields,
      '{user}',
      COALESCE(custom_fields->'user', '{}'::jsonb) - ${def.key},
      true
    )
    WHERE custom_fields ? 'user' AND custom_fields->'user' ? ${def.key}
  `);
  const deleted = await db
    .delete(customFieldDefs)
    .where(eq(customFieldDefs.id, id))
    .returning({ id: customFieldDefs.id });
  return deleted.length > 0;
}

export async function getContactCustomValues(
  contactId: number
): Promise<Record<string, unknown>> {
  const rows = await db
    .select({ customFields: contacts.customFields })
    .from(contacts)
    .where(eq(contacts.id, contactId))
    .limit(1);
  if (rows.length === 0) return {};
  const cf = rows[0].customFields as Record<string, unknown> | null;
  const user = cf && typeof cf === "object" ? (cf as Record<string, unknown>).user : undefined;
  return user && typeof user === "object" ? (user as Record<string, unknown>) : {};
}

export function coerceValue(def: CustomFieldDefRow, raw: unknown): unknown {
  if (raw === null || raw === undefined) return null;
  if (typeof raw === "string" && raw.trim() === "") return null;

  switch (def.type) {
    case "number": {
      const n = typeof raw === "number" ? raw : parseFloat(String(raw));
      if (Number.isNaN(n)) throw new Error(`Invalid number for ${def.key}`);
      return n;
    }
    case "boolean": {
      if (typeof raw === "boolean") return raw;
      const s = String(raw).toLowerCase();
      if (s === "true" || s === "1" || s === "yes") return true;
      if (s === "false" || s === "0" || s === "no") return false;
      throw new Error(`Invalid boolean for ${def.key}`);
    }
    case "select": {
      const s = String(raw);
      if (!def.options.some((o) => o.value === s)) {
        throw new Error(`Value '${s}' not in options for ${def.key}`);
      }
      return s;
    }
    case "date": {
      const s = String(raw);
      const d = new Date(s);
      if (Number.isNaN(d.getTime())) throw new Error(`Invalid date for ${def.key}`);
      // Keep as YYYY-MM-DD if input matches, else ISO
      return /^\d{4}-\d{2}-\d{2}$/.test(s) ? s : d.toISOString();
    }
    case "url": {
      const s = String(raw).trim();
      if (!/^https?:\/\//i.test(s)) {
        throw new Error(`Invalid URL for ${def.key}`);
      }
      return s;
    }
    case "text":
    case "longtext":
    default:
      return String(raw);
  }
}

export async function setContactCustomValue(
  contactId: number,
  key: string,
  rawValue: unknown
): Promise<Record<string, unknown>> {
  const def = await getFieldDefByKey(key);
  if (!def) throw new Error(`Unknown custom field: ${key}`);

  const coerced = coerceValue(def, rawValue);

  if (coerced === null) {
    // Remove the key from custom_fields.user
    await db.execute(sql`
      UPDATE ${contacts}
      SET custom_fields = jsonb_set(
        custom_fields,
        '{user}',
        COALESCE(custom_fields->'user', '{}'::jsonb) - ${key},
        true
      ),
      updated_at = now()
      WHERE id = ${contactId}
    `);
  } else {
    // Ensure user object exists, then set key
    const jsonValue = JSON.stringify(coerced);
    await db.execute(sql`
      UPDATE ${contacts}
      SET custom_fields = jsonb_set(
        jsonb_set(
          COALESCE(custom_fields, '{}'::jsonb),
          '{user}',
          COALESCE(custom_fields->'user', '{}'::jsonb),
          true
        ),
        ${`{user,${key}}`},
        ${jsonValue}::jsonb,
        true
      ),
      updated_at = now()
      WHERE id = ${contactId}
    `);
  }

  return getContactCustomValues(contactId);
}
