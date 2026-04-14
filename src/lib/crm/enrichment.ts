import { db } from "@/lib/db";
import { contacts } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { addActivity, getContactById, listContacts, type Contact } from "./contacts";

const BEEHIIV_BASE = "https://api.beehiiv.com/v2";
const STRIPE_API = "https://api.stripe.com/v1";
const FETCH_TIMEOUT = 15_000;

function fetchWithTimeout(url: string, options: RequestInit = {}): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT);
  return fetch(url, { ...options, signal: controller.signal }).finally(() => clearTimeout(timeout));
}

// ── Types ────────────────────────────────────────────────

export type BeehiivStatus = "active" | "unsubscribed" | "pending" | "inactive";

export interface BeehiivEnrichment {
  subscriberId: string;
  status: BeehiivStatus;
  subscribedAt: string | null;
  tier: string | null;
  totalOpens: number;
  totalClicks: number;
  lastOpenedAt: string | null;
  lastClickedAt: string | null;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
}

export interface StripeSubscriptionSummary {
  id: string;
  status: string;
  priceId: string;
  productName: string;
  currentPeriodEnd: string | null;
  amountCents: number;
}

export interface StripeEnrichment {
  customerId: string;
  lifetimeValueCents: number;
  subscriptions: StripeSubscriptionSummary[];
  lastPaymentAt: string | null;
  totalPayments: number;
}

export interface ContactEnrichmentBlob {
  beehiiv: BeehiivEnrichment | null;
  stripe: StripeEnrichment | null;
  enrichedAt: string;
}

export interface EnrichmentResult {
  beehiiv: BeehiivEnrichment | null;
  stripe: StripeEnrichment | null;
  changed: boolean;
}

// ── Beehiiv ──────────────────────────────────────────────

function beehiivHeaders(): HeadersInit {
  const apiKey = process.env.BEEHIIV_API_KEY;
  if (!apiKey) throw new Error("BEEHIIV_API_KEY is not set");
  return {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  };
}

function beehiivPublicationId(): string {
  const id = process.env.BEEHIIV_PUBLICATION_ID;
  if (!id) throw new Error("BEEHIIV_PUBLICATION_ID is not set");
  return id;
}

function normalizeBeehiivStatus(s: unknown): BeehiivStatus {
  if (s === "active" || s === "unsubscribed" || s === "pending" || s === "inactive") return s;
  return "inactive";
}

function isoFromMaybeUnix(v: unknown): string | null {
  if (typeof v === "number" && Number.isFinite(v) && v > 0) {
    return new Date(v * 1000).toISOString();
  }
  if (typeof v === "string" && v) {
    const d = new Date(v);
    if (!Number.isNaN(d.getTime())) return d.toISOString();
  }
  return null;
}

function asString(v: unknown): string | null {
  return typeof v === "string" && v ? v : null;
}

function asNumber(v: unknown): number {
  return typeof v === "number" && Number.isFinite(v) ? v : 0;
}

export async function getBeehiivData(email: string): Promise<BeehiivEnrichment | null> {
  try {
    const pubId = beehiivPublicationId();
    const url = new URL(`${BEEHIIV_BASE}/publications/${pubId}/subscriptions/by_email/${encodeURIComponent(email)}`);
    url.searchParams.append("expand[]", "stats");
    url.searchParams.append("expand[]", "custom_fields");

    const res = await fetchWithTimeout(url.toString(), { headers: beehiivHeaders() });

    if (res.status === 404) return null;
    if (!res.ok) {
      console.error(`[Enrichment] Beehiiv lookup failed (${email}): ${res.status}`);
      return null;
    }

    const json = (await res.json()) as { data?: unknown };
    const data = json.data;
    if (!data || typeof data !== "object") return null;
    const sub = data as Record<string, unknown>;

    const stats = (sub.stats && typeof sub.stats === "object" ? (sub.stats as Record<string, unknown>) : {}) as Record<string, unknown>;
    const utm = (sub.utm_source || sub.utm_medium || sub.utm_campaign)
      ? sub
      : ((sub.subscription_tier && typeof sub.subscription_tier === "object") ? (sub.subscription_tier as Record<string, unknown>) : sub);

    let tier: string | null = null;
    const tierRaw = sub.subscription_tier ?? sub.tier;
    if (typeof tierRaw === "string") tier = tierRaw;
    else if (tierRaw && typeof tierRaw === "object") {
      const t = tierRaw as Record<string, unknown>;
      tier = asString(t.name) ?? asString(t.tier) ?? null;
    }

    return {
      subscriberId: asString(sub.id) ?? "",
      status: normalizeBeehiivStatus(sub.status),
      subscribedAt: isoFromMaybeUnix(sub.created) ?? isoFromMaybeUnix(sub.subscribed_at),
      tier,
      totalOpens: asNumber(stats.email_opens ?? stats.total_opens ?? stats.opens),
      totalClicks: asNumber(stats.email_clicks ?? stats.total_clicks ?? stats.clicks),
      lastOpenedAt: isoFromMaybeUnix(stats.last_opened ?? stats.last_opened_at),
      lastClickedAt: isoFromMaybeUnix(stats.last_clicked ?? stats.last_clicked_at),
      utmSource: asString(utm.utm_source),
      utmMedium: asString(utm.utm_medium),
      utmCampaign: asString(utm.utm_campaign),
    };
  } catch (err) {
    console.error(`[Enrichment] getBeehiivData error (${email}):`, err);
    return null;
  }
}

// ── Stripe ───────────────────────────────────────────────

function stripeHeaders(): HeadersInit {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
  return {
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/x-www-form-urlencoded",
  };
}

interface StripeListResponse<T> {
  data: T[];
  has_more?: boolean;
}

async function stripeGet<T>(path: string, params: Record<string, string>): Promise<StripeListResponse<T> | null> {
  const qs = new URLSearchParams(params).toString();
  const res = await fetchWithTimeout(`${STRIPE_API}${path}?${qs}`, { headers: stripeHeaders() });
  if (!res.ok) {
    console.error(`[Enrichment] Stripe ${path} failed: ${res.status}`);
    return null;
  }
  return (await res.json()) as StripeListResponse<T>;
}

interface StripeCustomerRaw {
  id: string;
}

interface StripeChargeRaw {
  id: string;
  amount: number;
  status: string;
  created: number;
  paid: boolean;
}

interface StripeSubscriptionItemRaw {
  price?: {
    id?: string;
    unit_amount?: number | null;
    product?: string | { id?: string; name?: string };
    nickname?: string | null;
  };
}

interface StripeSubscriptionRaw {
  id: string;
  status: string;
  current_period_end: number | null;
  items?: { data?: StripeSubscriptionItemRaw[] };
}

interface StripeProductRaw {
  id: string;
  name: string;
}

export async function getStripeData(email: string): Promise<StripeEnrichment | null> {
  try {
    const customersResp = await stripeGet<StripeCustomerRaw>("/customers", {
      email,
      limit: "10",
    });
    if (!customersResp || customersResp.data.length === 0) return null;

    const customers = customersResp.data;
    let lifetimeValueCents = 0;
    let totalPayments = 0;
    let lastPaymentUnix = 0;
    const subscriptions: StripeSubscriptionSummary[] = [];
    const productCache = new Map<string, string>();

    async function getProductName(productId: string): Promise<string> {
      const cached = productCache.get(productId);
      if (cached) return cached;
      try {
        const res = await fetchWithTimeout(`${STRIPE_API}/products/${productId}`, {
          headers: stripeHeaders(),
        });
        if (!res.ok) {
          productCache.set(productId, productId);
          return productId;
        }
        const prod = (await res.json()) as StripeProductRaw;
        const name = prod.name ?? productId;
        productCache.set(productId, name);
        return name;
      } catch {
        productCache.set(productId, productId);
        return productId;
      }
    }

    for (const c of customers) {
      // Charges
      let startingAfter: string | null = null;
      let pages = 0;
      while (pages < 5) {
        const params: Record<string, string> = { customer: c.id, limit: "100" };
        if (startingAfter) params.starting_after = startingAfter;
        const chargesResp = await stripeGet<StripeChargeRaw>("/charges", params);
        if (!chargesResp) break;
        for (const ch of chargesResp.data) {
          if (ch.status === "succeeded" && ch.paid) {
            lifetimeValueCents += ch.amount;
            totalPayments += 1;
            if (ch.created > lastPaymentUnix) lastPaymentUnix = ch.created;
          }
        }
        if (!chargesResp.has_more || chargesResp.data.length === 0) break;
        startingAfter = chargesResp.data[chargesResp.data.length - 1].id;
        pages++;
      }

      // Subscriptions
      const subsResp = await stripeGet<StripeSubscriptionRaw>("/subscriptions", {
        customer: c.id,
        status: "all",
        limit: "100",
      });
      if (subsResp) {
        for (const s of subsResp.data) {
          const item = s.items?.data?.[0];
          const price = item?.price;
          const priceId = price?.id ?? "";
          const amountCents = price?.unit_amount ?? 0;
          let productName = price?.nickname ?? "";
          if (!productName && price?.product) {
            if (typeof price.product === "string") {
              productName = await getProductName(price.product);
            } else if (price.product.name) {
              productName = price.product.name;
            } else if (price.product.id) {
              productName = await getProductName(price.product.id);
            }
          }
          subscriptions.push({
            id: s.id,
            status: s.status,
            priceId,
            productName: productName || priceId || "Subscription",
            currentPeriodEnd: s.current_period_end
              ? new Date(s.current_period_end * 1000).toISOString()
              : null,
            amountCents,
          });
        }
      }
    }

    return {
      customerId: customers[0].id,
      lifetimeValueCents,
      subscriptions,
      lastPaymentAt: lastPaymentUnix > 0 ? new Date(lastPaymentUnix * 1000).toISOString() : null,
      totalPayments,
    };
  } catch (err) {
    console.error(`[Enrichment] getStripeData error (${email}):`, err);
    return null;
  }
}

// ── Orchestration ────────────────────────────────────────

function extractEnrichment(customFields: unknown): ContactEnrichmentBlob | null {
  if (!customFields || typeof customFields !== "object") return null;
  const cf = customFields as Record<string, unknown>;
  const e = cf.enrichment;
  if (!e || typeof e !== "object") return null;
  return e as ContactEnrichmentBlob;
}

function determineLifecycleStage(
  current: string,
  beehiiv: BeehiivEnrichment | null,
  stripe: StripeEnrichment | null
): string {
  const hasActiveSub = stripe?.subscriptions.some((s) => s.status === "active" || s.status === "trialing") ?? false;
  const hasPayments = (stripe?.totalPayments ?? 0) > 0;
  if (hasActiveSub || hasPayments) return "customer";
  if (beehiiv?.status === "active") {
    // Don't downgrade an existing customer
    if (current === "customer") return current;
    return "qualified";
  }
  return current;
}

function formatGbp(cents: number): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

export async function enrichContact(contactId: number): Promise<EnrichmentResult> {
  const contact = await getContactById(contactId);
  if (!contact) throw new Error(`Contact ${contactId} not found`);

  const [beehiiv, stripe] = await Promise.all([
    getBeehiivData(contact.email),
    getStripeData(contact.email),
  ]);

  const prior = extractEnrichment(contact.customFields);
  const now = new Date().toISOString();

  const newBlob: ContactEnrichmentBlob = {
    beehiiv,
    stripe,
    enrichedAt: now,
  };

  const mergedCustomFields: Record<string, unknown> = {
    ...((contact.customFields ?? {}) as Record<string, unknown>),
    enrichment: newBlob,
  };

  const nextStage = determineLifecycleStage(contact.lifecycleStage, beehiiv, stripe);
  const stageChanged = nextStage !== contact.lifecycleStage;

  await db
    .update(contacts)
    .set({
      customFields: mergedCustomFields,
      lifecycleStage: nextStage,
      updatedAt: new Date(),
    })
    .where(eq(contacts.id, contactId));

  let changed = false;

  // Beehiiv snapshot activity — only when status/tier changes
  const priorBeehiiv = prior?.beehiiv ?? null;
  const beehiivChanged =
    (beehiiv?.status ?? null) !== (priorBeehiiv?.status ?? null) ||
    (beehiiv?.tier ?? null) !== (priorBeehiiv?.tier ?? null);
  if (beehiiv && beehiivChanged) {
    await addActivity(contactId, {
      type: "enrichment_beehiiv",
      title: `Beehiiv: ${beehiiv.status}${beehiiv.tier ? ` (${beehiiv.tier})` : ""}`,
      meta: { kind: "beehiiv_snapshot", ...beehiiv },
      authorName: "system",
    });
    changed = true;
  }

  // Stripe snapshot activity — only when LTV changes
  const priorStripe = prior?.stripe ?? null;
  const stripeChanged = (stripe?.lifetimeValueCents ?? 0) !== (priorStripe?.lifetimeValueCents ?? 0);
  if (stripe && stripeChanged) {
    await addActivity(contactId, {
      type: "enrichment_stripe_purchase",
      title: `Stripe: ${stripe.totalPayments} payments, ${formatGbp(stripe.lifetimeValueCents)} LTV`,
      meta: { kind: "stripe_snapshot", ...stripe },
      authorName: "system",
    });
    changed = true;
  }

  if (stageChanged) {
    await addActivity(contactId, {
      type: "stage_change",
      title: `Stage changed: ${contact.lifecycleStage} -> ${nextStage}`,
      meta: { prev: contact.lifecycleStage, next: nextStage, kind: "enrichment_stage_change" },
      authorName: "system",
    });
    changed = true;
  }

  return { beehiiv, stripe, changed };
}

export async function enrichAllContacts(): Promise<{ enriched: number; errors: number }> {
  const BATCH_SIZE = 5;
  const DELAY_MS = 400;
  let enriched = 0;
  let errors = 0;

  // Page through contacts
  const pageSize = 200;
  let offset = 0;
  // Collect ids
  const allIds: number[] = [];
  while (true) {
    const { rows } = await listContacts({ limit: pageSize, offset });
    allIds.push(...rows.map((r: Contact) => r.id));
    if (rows.length < pageSize) break;
    offset += pageSize;
  }

  for (let i = 0; i < allIds.length; i += BATCH_SIZE) {
    const batch = allIds.slice(i, i + BATCH_SIZE);
    const results = await Promise.allSettled(batch.map((id) => enrichContact(id)));
    for (const r of results) {
      if (r.status === "fulfilled") enriched++;
      else errors++;
    }
    if (i + BATCH_SIZE < allIds.length) {
      await new Promise((resolve) => setTimeout(resolve, DELAY_MS));
    }
  }

  return { enriched, errors };
}
