import { Card, CardBody } from "@/components/admin/ui";
import {
  getSearchOwnerClickStats,
  type SearchOwnerClickStats,
} from "@/lib/admin/events-store";
import { SEARCH_OWNERS } from "@/lib/seo/search-ownership";

const SECTION_H2 =
  "font-body font-semibold text-[13px] text-[var(--color-fg)]";

export async function SearchOwnerClicksPanel({
  from,
  to,
}: {
  from: Date;
  to: Date;
}) {
  let stats: SearchOwnerClickStats[] = [];

  try {
    stats = await getSearchOwnerClickStats(from, to);
  } catch {
    // The panel remains useful while the database is unavailable.
  }

  const byOwner = new Map(stats.map((row) => [row.ownerId, row]));
  const total = stats.reduce((sum, row) => sum + row.clicks, 0);

  return (
    <Card as="section">
      <CardBody compact>
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h2 className={SECTION_H2}>Supporting content → definitive guides</h2>
            <p className="text-xs text-[var(--color-fg-subtle)] mt-1">
              Consented clicks from articles and episodes into each search owner.
            </p>
          </div>
          <span className="text-xs text-[var(--color-fg-subtle)] font-mono tabular-nums whitespace-nowrap">
            {total.toLocaleString()} clicks
          </span>
        </div>

        {total === 0 ? (
          <p className="text-sm text-[var(--color-fg-subtle)]">
            No tracked guide clicks in this range yet. Tracking starts with the
            search measurement release and only counts visitors who accept
            analytics.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--color-border)] text-left text-xs text-[var(--color-fg-subtle)]">
                  <th className="font-medium py-2 pr-3">Definitive guide</th>
                  <th className="font-medium py-2 px-3 text-right">Clicks</th>
                  <th className="font-medium py-2 pl-3 text-right">Source pages</th>
                </tr>
              </thead>
              <tbody>
                {SEARCH_OWNERS.map((owner) => {
                  const row = byOwner.get(owner.id);

                  return (
                    <tr
                      key={owner.id}
                      className="border-b border-[var(--color-border)] last:border-0"
                    >
                      <td className="py-2.5 pr-3">
                        <span className="text-[var(--color-fg)]">{owner.label}</span>
                        <span className="block text-xs text-[var(--color-fg-subtle)] font-mono">
                          {owner.path}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums text-[var(--color-fg)]">
                        {(row?.clicks ?? 0).toLocaleString()}
                      </td>
                      <td className="py-2.5 pl-3 text-right font-mono tabular-nums text-[var(--color-fg-muted)]">
                        {(row?.sourcePages ?? 0).toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </CardBody>
    </Card>
  );
}
