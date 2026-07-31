import { format } from "date-fns";
import { and, asc, desc, eq, gte, lte } from "drizzle-orm";
import { db } from "@/lib/db";
import { cohortApplications, marketingSpend } from "@/lib/db/schema";
import {
  buildMarketingPerformance,
  type MarketingSpendRecord,
} from "./marketing-attribution";
import type { AttributionTouch } from "@/lib/marketing/attribution";

export async function getMarketingDashboard(
  from: Date,
  to: Date,
  touch: AttributionTouch,
) {
  const fromDate = format(from, "yyyy-MM-dd");
  const toDate = format(to, "yyyy-MM-dd");
  const [applications, spend] = await Promise.all([
    db
      .select({
        status: cohortApplications.status,
        attribution: cohortApplications.attribution,
      })
      .from(cohortApplications)
      .where(
        and(
          eq(cohortApplications.cohort, "ndy"),
          gte(cohortApplications.createdAt, from),
          lte(cohortApplications.createdAt, to),
        ),
      ),
    db
      .select({
        id: marketingSpend.id,
        spendDate: marketingSpend.spendDate,
        channel: marketingSpend.channel,
        campaign: marketingSpend.campaign,
        amountCents: marketingSpend.amountCents,
        currency: marketingSpend.currency,
        notes: marketingSpend.notes,
        source: marketingSpend.source,
      })
      .from(marketingSpend)
      .where(
        and(
          gte(marketingSpend.spendDate, fromDate),
          lte(marketingSpend.spendDate, toDate),
        ),
      )
      .orderBy(asc(marketingSpend.spendDate)),
  ]);

  return {
    performance: buildMarketingPerformance(
      applications,
      spend as MarketingSpendRecord[],
      touch,
    ),
    spend: [...spend].sort(
      (a, b) =>
        b.spendDate.localeCompare(a.spendDate) ||
        b.id - a.id,
    ),
  };
}

export async function listRecentMarketingSpend(limit = 20) {
  return db
    .select({
      id: marketingSpend.id,
      spendDate: marketingSpend.spendDate,
      channel: marketingSpend.channel,
      campaign: marketingSpend.campaign,
      amountCents: marketingSpend.amountCents,
      currency: marketingSpend.currency,
      notes: marketingSpend.notes,
      source: marketingSpend.source,
    })
    .from(marketingSpend)
    .orderBy(desc(marketingSpend.spendDate), desc(marketingSpend.id))
    .limit(limit);
}
