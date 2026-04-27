import { Card, CardBody } from "@/components/admin/ui";
import { StatCard } from "../../components/charts/StatCard";
import { getOrganicSearchTotals } from "@/lib/analytics/ga4";

const SECTION_H2 =
  "font-body font-semibold text-[13px] text-[var(--color-fg)] mb-4";

export async function OrganicSearchPanel({
  from,
  to,
}: {
  from: Date;
  to: Date;
}) {
  const totals = await getOrganicSearchTotals(from, to);

  return (
    <Card>
      <CardBody compact>
        <h2 className={SECTION_H2}>Organic search</h2>
        {!totals.configured ? (
          <p className="text-sm text-[var(--color-fg-subtle)]">
            GA4 not configured. Set{" "}
            <code className="text-[10px] px-1 py-0.5 rounded bg-white/5">
              GA4_PROPERTY_ID
            </code>{" "}
            and{" "}
            <code className="text-[10px] px-1 py-0.5 rounded bg-white/5">
              GOOGLE_APPLICATION_CREDENTIALS_JSON
            </code>{" "}
            to populate this panel.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <StatCard label="Organic sessions" value={totals.sessions} />
            <StatCard label="Organic users" value={totals.users} />
          </div>
        )}
      </CardBody>
    </Card>
  );
}
