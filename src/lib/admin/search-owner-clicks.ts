import {
  SEARCH_OWNER_BY_ID,
  type SearchOwnerId,
} from "@/lib/seo/search-ownership";

export const SEARCH_OWNER_TRACK_PREFIX = "search_owner_";

export interface SearchOwnerClickSourceStats {
  page: string;
  clicks: number;
}

export interface SearchOwnerClickStats {
  ownerId: SearchOwnerId;
  destination: string;
  clicks: number;
  sourcePages: number;
  sources: SearchOwnerClickSourceStats[];
}

export interface SearchOwnerClickRow {
  trackId: string;
  destination: string;
  page: string;
  clicks: number;
}

/**
 * Turns the database's owner-and-source rows into dashboard totals while
 * retaining the exact article or episode that generated each click.
 */
export function aggregateSearchOwnerClickRows(
  rows: SearchOwnerClickRow[],
): SearchOwnerClickStats[] {
  const owners = new Map<
    SearchOwnerId,
    {
      destination: string;
      clicks: number;
      sources: Map<string, number>;
    }
  >();

  for (const row of rows) {
    if (!row.trackId.startsWith(SEARCH_OWNER_TRACK_PREFIX)) continue;

    const ownerId = row.trackId.slice(
      SEARCH_OWNER_TRACK_PREFIX.length,
    ) as SearchOwnerId;
    const owner = SEARCH_OWNER_BY_ID.get(ownerId);
    const clicks = Number(row.clicks);

    if (!owner || !Number.isFinite(clicks) || clicks <= 0) continue;

    const existing = owners.get(ownerId) ?? {
      destination: row.destination || owner.path,
      clicks: 0,
      sources: new Map<string, number>(),
    };

    existing.clicks += clicks;
    existing.sources.set(
      row.page,
      (existing.sources.get(row.page) ?? 0) + clicks,
    );
    if (!existing.destination && row.destination) {
      existing.destination = row.destination;
    }
    owners.set(ownerId, existing);
  }

  return [...owners.entries()]
    .map(([ownerId, row]) => {
      const sources = [...row.sources.entries()]
        .map(([page, clicks]) => ({ page, clicks }))
        .sort((a, b) => b.clicks - a.clicks || a.page.localeCompare(b.page));

      return {
        ownerId,
        destination: row.destination,
        clicks: row.clicks,
        sourcePages: sources.length,
        sources,
      };
    })
    .sort((a, b) => b.clicks - a.clicks || a.ownerId.localeCompare(b.ownerId));
}
