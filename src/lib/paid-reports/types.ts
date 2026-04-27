/**
 * Shared types for the paid-report domain: products → orders → reports.
 *
 * Status lifecycles are enforced as string unions so callers can exhaustively
 * switch on them. The database columns are `text` — if a row comes back with
 * an unexpected value, `asOrderStatus`/`asPaidReportStatus` clamps it to the
 * nearest valid state so code never breaks on bad data.
 */

import type { ToolSlug } from "@/lib/tool-results/types";

export const PAID_PRODUCT_SLUGS = [
  "report_plateau",
  "report_fuelling",
  "report_ftp",
  "report_race",
  "bundle_performance",
] as const;
export type PaidProductSlug = (typeof PAID_PRODUCT_SLUGS)[number];

export function isPaidProductSlug(x: unknown): x is PaidProductSlug {
  return (
    typeof x === "string" &&
    (PAID_PRODUCT_SLUGS as readonly string[]).includes(x)
  );
}

export interface ReportProduct {
  id: number;
  slug: PaidProductSlug;
  name: string;
  description: string;
  toolSlug: ToolSlug | null;
  bundleItems: PaidProductSlug[] | null;
  priceCents: number;
  currency: string;
  stripePriceId: string | null;
  active: boolean;
  pageCountTarget: number | null;
}

export type OrderStatus = "pending" | "paid" | "refunded" | "failed";

export function asOrderStatus(x: unknown): OrderStatus {
  const allowed: OrderStatus[] = ["pending", "paid", "refunded", "failed"];
  return typeof x === "string" && (allowed as string[]).includes(x)
    ? (x as OrderStatus)
    : "pending";
}

export interface Order {
  id: number;
  riderProfileId: number | null;
  email: string;
  productSlug: string;
  toolResultId: number | null;
  amountCents: number;
  currency: string;
  status: OrderStatus;
  stripeCheckoutSessionId: string | null;
  stripePaymentIntentId: string | null;
  stripeEventIds: string[];
  receiptUrl: string | null;
  utm: Record<string, string | null> | null;
  createdAt: Date;
  paidAt: Date | null;
  updatedAt: Date;
}

export type PaidReportStatus =
  | "pending_payment"
  | "payment_confirmed"
  | "generating"
  | "generated"
  | "delivered"
  | "failed"
  | "refunded"
  | "revoked";

export function asPaidReportStatus(x: unknown): PaidReportStatus {
  const allowed: PaidReportStatus[] = [
    "pending_payment",
    "payment_confirmed",
    "generating",
    "generated",
    "delivered",
    "failed",
    "refunded",
    "revoked",
  ];
  return typeof x === "string" && (allowed as string[]).includes(x)
    ? (x as PaidReportStatus)
    : "pending_payment";
}

export interface PaidReport {
  id: number;
  orderId: number;
  riderProfileId: number | null;
  email: string;
  productSlug: string;
  toolResultId: number | null;
  status: PaidReportStatus;
  statusReason: string | null;
  secureTokenHash: string | null;
  pdfUrl: string | null;
  webReportHtml: string | null;
  pageCount: number | null;
  generatorVersion: string | null;
  deliveredAt: Date | null;
  revokedAt: Date | null;
  lastResentAt: Date | null;
  downloadCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export type ConsentType =
  | "save_profile"
  | "email_result"
  | "marketing"
  | "research"
  | "data_storage"
  | "report_delivery";

export interface ConsentRecord {
  id: number;
  riderProfileId: number | null;
  email: string;
  consentType: ConsentType;
  granted: boolean;
  source: string;
  copyVersion: string | null;
  ipHash: string | null;
  userAgent: string | null;
  createdAt: Date;
}
