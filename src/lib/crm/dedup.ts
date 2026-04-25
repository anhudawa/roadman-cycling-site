import { db } from "@/lib/db";
import { contacts, cohortApplications } from "@/lib/db/schema";
import { eq, ne, and, or, isNotNull, sql, type SQL } from "drizzle-orm";

export type DuplicateReason = "phone" | "name+metadata" | "name-only";

export interface DuplicateCandidate {
  id: number;
  email: string;
  name: string | null;
  phone: string | null;
  owner: string | null;
  lifecycleStage: string;
  lastActivityAt: string | null;
  createdAt: string;
}

export interface DuplicateGroup {
  reason: DuplicateReason;
  confidence: number; // 1=high .. 3=low
  contacts: DuplicateCandidate[];
}

type ContactRow = typeof contacts.$inferSelect;

/** Normalize a phone number: digits only, last 9 digits, or null if too short. */
export function normalizePhone(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const digits = raw.replace(/\D+/g, "");
  if (digits.length < 7) return null;
  return digits.slice(-9);
}

function normalizeName(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const n = raw.trim().toLowerCase().replace(/\s+/g, " ");
  if (n.length < 2) return null;
  return n;
}

function emailLocalPart(email: string): string {
  const at = email.indexOf("@");
  return (at === -1 ? email : email.slice(0, at)).toLowerCase();
}

function localpartOverlap(a: string, b: string): boolean {
  if (!a || !b) return false;
  if (a === b) return true;
  // Strip non-alphanumerics for comparison
  const aa = a.replace(/[^a-z0-9]/g, "");
  const bb = b.replace(/[^a-z0-9]/g, "");
  if (aa.length < 4 || bb.length < 4) return false;
  // Shared prefix of 4+ chars, or one contains the other (min 4)
  const minLen = Math.min(aa.length, bb.length);
  let shared = 0;
  for (let i = 0; i < minLen; i++) {
    if (aa[i] === bb[i]) shared++;
    else break;
  }
  if (shared >= 4) return true;
  if (aa.length >= 4 && bb.includes(aa)) return true;
  if (bb.length >= 4 && aa.includes(bb)) return true;
  return false;
}

function serialize(c: ContactRow): DuplicateCandidate {
  return {
    id: c.id,
    email: c.email,
    name: c.name,
    phone: c.phone,
    owner: c.owner,
    lifecycleStage: c.lifecycleStage,
    lastActivityAt: c.lastActivityAt ? c.lastActivityAt.toISOString() : null,
    createdAt: c.createdAt.toISOString(),
  };
}

interface Pair {
  a: ContactRow;
  b: ContactRow;
  reason: DuplicateReason;
  confidence: number;
}

async function loadApplicationEmailSet(): Promise<Set<string>> {
  const rows = await db.select({ email: cohortApplications.email }).from(cohortApplications);
  return new Set(rows.map((r) => r.email.toLowerCase()));
}

function classifyPair(
  a: ContactRow,
  b: ContactRow,
  appEmails: Set<string>
): { reason: DuplicateReason; confidence: number } | null {
  const phoneA = normalizePhone(a.phone);
  const phoneB = normalizePhone(b.phone);
  if (phoneA && phoneB && phoneA === phoneB) {
    return { reason: "phone", confidence: 1 };
  }

  const nameA = normalizeName(a.name);
  const nameB = normalizeName(b.name);

  if (nameA && nameB && nameA === nameB) {
    // Exact name match $€” need at least one of: same phone (covered), same owner, both in applications
    const sameOwner = a.owner && b.owner && a.owner === b.owner;
    const bothInApps =
      appEmails.has(a.email.toLowerCase()) && appEmails.has(b.email.toLowerCase());
    if (sameOwner || bothInApps) {
      return { reason: "name+metadata", confidence: 2 };
    }
  }

  // Weaker: same first 8 chars of name OR email localpart overlap 4+ chars
  const namePrefixMatch =
    nameA && nameB && nameA.length >= 8 && nameB.length >= 8 && nameA.slice(0, 8) === nameB.slice(0, 8);
  const localA = emailLocalPart(a.email);
  const localB = emailLocalPart(b.email);
  const localMatch = localpartOverlap(localA, localB);

  if (namePrefixMatch && localMatch) {
    return { reason: "name-only", confidence: 3 };
  }
  // If both same exact normalized name but no metadata, still weak match
  if (nameA && nameB && nameA === nameB) {
    return { reason: "name-only", confidence: 3 };
  }

  return null;
}

/** Find duplicate groups across all contacts. Returns up to `limit` groups ordered by confidence. */
export async function findDuplicateGroups(limit = 50): Promise<DuplicateGroup[]> {
  const rows = await db.select().from(contacts);
  if (rows.length < 2) return [];

  const appEmails = await loadApplicationEmailSet();

  // Bucket candidates cheaply $€” avoid full O(n^2) where possible
  const byPhone = new Map<string, ContactRow[]>();
  const byName = new Map<string, ContactRow[]>();
  const byNamePrefix = new Map<string, ContactRow[]>();

  for (const r of rows) {
    const p = normalizePhone(r.phone);
    if (p) {
      const arr = byPhone.get(p) ?? [];
      arr.push(r);
      byPhone.set(p, arr);
    }
    const n = normalizeName(r.name);
    if (n) {
      const arr = byName.get(n) ?? [];
      arr.push(r);
      byName.set(n, arr);
      if (n.length >= 8) {
        const pref = n.slice(0, 8);
        const arr2 = byNamePrefix.get(pref) ?? [];
        arr2.push(r);
        byNamePrefix.set(pref, arr2);
      }
    }
  }

  const pairs: Pair[] = [];
  const seen = new Set<string>();
  function pairKey(a: number, b: number) {
    return a < b ? `${a}-${b}` : `${b}-${a}`;
  }

  function consider(a: ContactRow, b: ContactRow) {
    if (a.id === b.id) return;
    const k = pairKey(a.id, b.id);
    if (seen.has(k)) return;
    const cls = classifyPair(a, b, appEmails);
    if (!cls) return;
    seen.add(k);
    pairs.push({ a, b, ...cls });
  }

  for (const bucket of byPhone.values()) {
    if (bucket.length < 2) continue;
    for (let i = 0; i < bucket.length; i++) {
      for (let j = i + 1; j < bucket.length; j++) {
        consider(bucket[i], bucket[j]);
      }
    }
  }
  for (const bucket of byName.values()) {
    if (bucket.length < 2) continue;
    for (let i = 0; i < bucket.length; i++) {
      for (let j = i + 1; j < bucket.length; j++) {
        consider(bucket[i], bucket[j]);
      }
    }
  }
  for (const bucket of byNamePrefix.values()) {
    if (bucket.length < 2) continue;
    for (let i = 0; i < bucket.length; i++) {
      for (let j = i + 1; j < bucket.length; j++) {
        consider(bucket[i], bucket[j]);
      }
    }
  }

  // Sort by confidence (lower = better), then by most recent activity on either side
  pairs.sort((x, y) => {
    if (x.confidence !== y.confidence) return x.confidence - y.confidence;
    const xTs = Math.max(
      x.a.lastActivityAt?.getTime() ?? 0,
      x.b.lastActivityAt?.getTime() ?? 0
    );
    const yTs = Math.max(
      y.a.lastActivityAt?.getTime() ?? 0,
      y.b.lastActivityAt?.getTime() ?? 0
    );
    return yTs - xTs;
  });

  // Union-find to merge pairs into groups
  const parent = new Map<number, number>();
  function find(x: number): number {
    let r = x;
    while (parent.get(r) !== r) {
      r = parent.get(r)!;
    }
    // path compression
    let cur = x;
    while (parent.get(cur) !== r) {
      const next = parent.get(cur)!;
      parent.set(cur, r);
      cur = next;
    }
    return r;
  }
  function union(a: number, b: number) {
    if (!parent.has(a)) parent.set(a, a);
    if (!parent.has(b)) parent.set(b, b);
    const ra = find(a);
    const rb = find(b);
    if (ra !== rb) parent.set(ra, rb);
  }

  const pairMeta = new Map<number, { reason: DuplicateReason; confidence: number }>();
  for (const p of pairs) {
    union(p.a.id, p.b.id);
    // track best (lowest confidence number) reason for the component
    for (const id of [p.a.id, p.b.id]) {
      const existing = pairMeta.get(id);
      if (!existing || p.confidence < existing.confidence) {
        pairMeta.set(id, { reason: p.reason, confidence: p.confidence });
      }
    }
  }

  const groupsByRoot = new Map<number, ContactRow[]>();
  const rowById = new Map<number, ContactRow>();
  for (const r of rows) rowById.set(r.id, r);

  for (const id of parent.keys()) {
    const root = find(id);
    const arr = groupsByRoot.get(root) ?? [];
    arr.push(rowById.get(id)!);
    groupsByRoot.set(root, arr);
  }

  const groups: DuplicateGroup[] = [];
  for (const arr of groupsByRoot.values()) {
    if (arr.length < 2) continue;
    // Best confidence within the group
    let bestConf = 3;
    let bestReason: DuplicateReason = "name-only";
    for (const c of arr) {
      const m = pairMeta.get(c.id);
      if (m && m.confidence < bestConf) {
        bestConf = m.confidence;
        bestReason = m.reason;
      }
    }
    groups.push({
      reason: bestReason,
      confidence: bestConf,
      contacts: arr
        .sort((a, b) => {
          const at = a.lastActivityAt?.getTime() ?? 0;
          const bt = b.lastActivityAt?.getTime() ?? 0;
          return bt - at;
        })
        .map(serialize),
    });
  }

  groups.sort((x, y) => x.confidence - y.confidence);
  return groups.slice(0, limit);
}

/** Find potential duplicates for a single contact. */
export async function getPotentialDuplicatesFor(
  contactId: number
): Promise<Array<DuplicateCandidate & { reason: DuplicateReason; confidence: number }>> {
  const target = await db.select().from(contacts).where(eq(contacts.id, contactId)).limit(1);
  if (target.length === 0) return [];
  const me = target[0];

  const phone = normalizePhone(me.phone);
  const name = normalizeName(me.name);
  if (!phone && !name) return [];

  // Pull a small candidate set with SQL prefilter
  const orClauses: SQL[] = [];
  if (phone) {
    orClauses.push(
      sql`right(regexp_replace(${contacts.phone}, '\\D', '', 'g'), 9) = ${phone}`
    );
  }
  if (name) {
    orClauses.push(sql`lower(${contacts.name}) = ${name}`);
    if (name.length >= 8) {
      orClauses.push(sql`lower(${contacts.name}) like ${name.slice(0, 8) + "%"}`);
    }
  }
  if (orClauses.length === 0) return [];

  const rows = await db
    .select()
    .from(contacts)
    .where(and(ne(contacts.id, contactId), or(...orClauses), isNotNull(contacts.email)))
    .limit(100);

  const appEmails = await loadApplicationEmailSet();
  const out: Array<DuplicateCandidate & { reason: DuplicateReason; confidence: number }> = [];
  for (const r of rows) {
    const cls = classifyPair(me, r, appEmails);
    if (!cls) continue;
    out.push({ ...serialize(r), reason: cls.reason, confidence: cls.confidence });
  }
  out.sort((a, b) => a.confidence - b.confidence);
  return out.slice(0, 10);
}

export function reasonLabel(r: DuplicateReason): string {
  switch (r) {
    case "phone":
      return "Phone match";
    case "name+metadata":
      return "Name + metadata";
    case "name-only":
      return "Name match";
  }
}
