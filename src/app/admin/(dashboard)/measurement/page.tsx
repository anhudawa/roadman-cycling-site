import { redirect } from "next/navigation";
import { Suspense } from "react";
import { requireAuth } from "@/lib/admin/auth";
import { parseTimeRangeWithComparison } from "@/lib/admin/time-ranges";
import { PageHeader } from "@/components/admin/ui";
import { TimeRangePicker } from "../components/TimeRangePicker";
import { OrganicSearchPanel } from "./_components/OrganicSearchPanel";
import { AIReferralPanel } from "./_components/AIReferralPanel";
import { CitationsPanel } from "./_components/CitationsPanel";
import { ContentCoachingFunnel } from "./_components/ContentCoachingFunnel";

export const dynamic = "force-dynamic";

/**
 * /admin/measurement — single page surfacing the four signals from
 * Workstream 5 (DEV-DATA-01):
 *   1. Organic search (GA4)
 *   2. AI referrals (events.ai_referrer)
 *   3. Answer-engine citations (brand_citation_runs)
 *   4. Content -> coaching funnel (events)
 *
 * Each panel renders graceful "no data" / "not configured" states so the
 * page is useful from day one (before GA4 OAuth is hooked up, before the
 * citation cron has run, etc.).
 */
export default async function MeasurementPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const user = await requireAuth();
  if (user.role !== "admin") redirect("/admin/my-day");

  const params = await searchParams;
  const rangeParam =
    typeof params.range === "string" ? params.range : "30d";
  const { from, to, label: rangeLabel } =
    parseTimeRangeWithComparison(rangeParam);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Measurement"
        subtitle={`Organic, AI referrals, citations, content → coaching · ${rangeLabel}`}
        actions={
          <Suspense fallback={null}>
            <TimeRangePicker />
          </Suspense>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <OrganicSearchPanel from={from} to={to} />
        <AIReferralPanel from={from} to={to} />
      </div>

      <CitationsPanel />

      <ContentCoachingFunnel from={from} to={to} />
    </div>
  );
}
