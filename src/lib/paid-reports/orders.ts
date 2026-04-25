import { desc, eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { asOrderStatus, type Order, type OrderStatus } from "./types";

/**
 * Orders store $€” one row per Stripe checkout session. Idempotency is
 * enforced by the UNIQUE constraint on `stripe_checkout_session_id`:
 * a duplicate webhook call will land on the same row, not create a
 * second one. Event IDs accumulate in `stripe_event_ids` so we can
 * dedupe webhook replay without relying on Stripe's signing alone.
 */

type Row = typeof orders.$inferSelect;

function rowToDomain(row: Row): Order {
  return {
    id: row.id,
    riderProfileId: row.riderProfileId,
    email: row.email,
    productSlug: row.productSlug,
    toolResultId: row.toolResultId,
    amountCents: row.amountCents,
    currency: row.currency,
    status: asOrderStatus(row.status),
    stripeCheckoutSessionId: row.stripeCheckoutSessionId,
    stripePaymentIntentId: row.stripePaymentIntentId,
    stripeEventIds: Array.isArray(row.stripeEventIds) ? row.stripeEventIds : [],
    receiptUrl: row.receiptUrl,
    utm: (row.utm ?? null) as Record<string, string | null> | null,
    createdAt: row.createdAt,
    paidAt: row.paidAt,
    updatedAt: row.updatedAt,
  };
}

export interface CreateOrderInput {
  riderProfileId: number | null;
  email: string;
  productSlug: string;
  toolResultId: number | null;
  amountCents: number;
  currency: string;
  stripeCheckoutSessionId: string | null;
  utm?: Record<string, string | null> | null;
}

export async function createOrder(input: CreateOrderInput): Promise<Order> {
  const [row] = await db
    .insert(orders)
    .values({
      riderProfileId: input.riderProfileId,
      email: input.email,
      productSlug: input.productSlug,
      toolResultId: input.toolResultId,
      amountCents: input.amountCents,
      currency: input.currency,
      status: "pending",
      stripeCheckoutSessionId: input.stripeCheckoutSessionId,
      utm: input.utm ?? null,
    })
    .returning();
  return rowToDomain(row);
}

export async function getOrderById(id: number): Promise<Order | null> {
  const [row] = await db
    .select()
    .from(orders)
    .where(eq(orders.id, id))
    .limit(1);
  return row ? rowToDomain(row) : null;
}

export async function getOrderByCheckoutSessionId(
  sessionId: string,
): Promise<Order | null> {
  const [row] = await db
    .select()
    .from(orders)
    .where(eq(orders.stripeCheckoutSessionId, sessionId))
    .limit(1);
  return row ? rowToDomain(row) : null;
}

export async function listOrdersByEmail(
  email: string,
  limit = 50,
): Promise<Order[]> {
  const rows = await db
    .select()
    .from(orders)
    .where(eq(orders.email, email))
    .orderBy(desc(orders.createdAt))
    .limit(limit);
  return rows.map(rowToDomain);
}

export interface MarkOrderPaidInput {
  orderId: number;
  paymentIntentId: string | null;
  receiptUrl: string | null;
  stripeEventId: string;
}

/**
 * Mark an order paid. Appends the Stripe event id to the dedup list and
 * sets paid_at only if it isn't already set $€” so a replayed webhook
 * doesn't move the timestamp. Returns true if this call was the one
 * that flipped the state (useful for "should we kick off generation?").
 */
export async function markOrderPaid(
  input: MarkOrderPaidInput,
): Promise<{ flipped: boolean; order: Order | null }> {
  const existing = await getOrderById(input.orderId);
  if (!existing) return { flipped: false, order: null };

  if (existing.stripeEventIds.includes(input.stripeEventId)) {
    return { flipped: false, order: existing };
  }

  const now = new Date();
  const [row] = await db
    .update(orders)
    .set({
      status: existing.status === "paid" ? existing.status : "paid",
      paidAt: existing.paidAt ?? now,
      stripePaymentIntentId:
        existing.stripePaymentIntentId ?? input.paymentIntentId,
      receiptUrl: existing.receiptUrl ?? input.receiptUrl,
      stripeEventIds: sql`(
        SELECT COALESCE(${orders.stripeEventIds}, '[]'::jsonb) || ${JSON.stringify([input.stripeEventId])}::jsonb
      )`,
      updatedAt: now,
    })
    .where(eq(orders.id, input.orderId))
    .returning();

  return {
    flipped: existing.status !== "paid",
    order: row ? rowToDomain(row) : null,
  };
}

export async function markOrderFailed(
  orderId: number,
  reason: string,
  stripeEventId: string | null,
): Promise<Order | null> {
  const now = new Date();
  const [row] = await db
    .update(orders)
    .set({
      status: "failed",
      updatedAt: now,
      ...(stripeEventId
        ? {
            stripeEventIds: sql`(
              SELECT COALESCE(${orders.stripeEventIds}, '[]'::jsonb) || ${JSON.stringify([stripeEventId])}::jsonb
            )`,
          }
        : {}),
    })
    .where(eq(orders.id, orderId))
    .returning();
  if (row) {
    // swallow reason into updated_at metadata via receipt_url isn't right;
    // we could store in a dedicated column but status + crm log is sufficient
    // for MVP. Callers are expected to also write to crm_sync_logs on failure.
    void reason;
  }
  return row ? rowToDomain(row) : null;
}

export async function markOrderRefunded(
  orderId: number,
  stripeEventId: string,
): Promise<Order | null> {
  const now = new Date();
  const [row] = await db
    .update(orders)
    .set({
      status: "refunded",
      updatedAt: now,
      stripeEventIds: sql`(
        SELECT COALESCE(${orders.stripeEventIds}, '[]'::jsonb) || ${JSON.stringify([stripeEventId])}::jsonb
      )`,
    })
    .where(eq(orders.id, orderId))
    .returning();
  return row ? rowToDomain(row) : null;
}

export type { Order, OrderStatus };
