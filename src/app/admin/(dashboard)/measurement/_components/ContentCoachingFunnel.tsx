import { Card, CardBody } from "@/components/admin/ui";
import { FunnelDisplay } from "../../components/charts/FunnelDisplay";
import {
  getContentCoachingFunnel,
  type CoachingFunnelStats,
} from "@/lib/admin/events-store";

const SECTION_H2 =
  "font-body font-semibold text-[13px] text-[var(--color-fg)] mb-4";

const EMPTY: CoachingFunnelStats = {
  contentViews: 0,
  newsletterSignups: 0,
  coachingPageViews: 0,
  applyPageViews: 0,
  applySubmits: 0,
};

export async function ContentCoachingFunnel({
  from,
  to,
}: {
  from: Date;
  to: Date;
}) {
  let stats = EMPTY;
  try {
    stats = await getContentCoachingFunnel(from, to);
  } catch {
    // empty
  }

  return (
    <Card>
      <CardBody compact>
        <h2 className={SECTION_H2}>Content → coaching funnel</h2>
        <FunnelDisplay
          steps={[
            { label: "Content pageviews", value: stats.contentViews },
            { label: "Newsletter signups", value: stats.newsletterSignups },
            { label: "/coaching views", value: stats.coachingPageViews },
            { label: "/apply views", value: stats.applyPageViews },
            { label: "Apply submits", value: stats.applySubmits },
          ]}
        />
      </CardBody>
    </Card>
  );
}
