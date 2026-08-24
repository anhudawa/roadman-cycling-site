import { SEARCH_OWNERS, type SearchOwnerId } from "./search-ownership";

export type GscQueryMatch = "exact" | "contains";

export interface GscMetric {
  clicks: number;
  impressions: number;
  /** Decimal ratio: 0.041 means 4.1%. */
  ctr: number;
  position: number;
}

export interface GscQueryMetric extends GscMetric {
  query: string;
  match: GscQueryMatch;
}

export interface GscPageMetric extends GscMetric {
  path: string;
}

export interface GscUrlSplit {
  id: string;
  label: string;
  query: string;
  match: GscQueryMatch;
  expectedOwner: string;
  reportedUrlCount: number;
  aggregate: GscMetric;
  rows: GscPageMetric[];
}

export interface GscAiSnapshot {
  impressions: number;
  pages: { path: string; impressions: number }[];
}

export interface SearchOwnerClickSnapshot {
  trackingStartedAt: string;
  total: number;
  byOwner: { ownerId: SearchOwnerId; clicks: number }[];
  bySource: { ownerId: SearchOwnerId; path: string; clicks: number }[];
}

export interface GscSnapshot {
  schemaVersion: 1;
  property: string;
  capturedAt: string;
  deploymentDate: string;
  period: {
    start: string;
    end: string;
    days: number;
  };
  site: GscMetric;
  queries: GscQueryMetric[];
  urlSplits: GscUrlSplit[];
  ai: GscAiSnapshot;
  /** Null means tracking did not exist, which is different from zero clicks. */
  ownerLinkClicks: SearchOwnerClickSnapshot | null;
  notes?: string[];
}

export interface NumericDelta {
  before: number;
  after: number;
  absolute: number;
  relative: number | null;
}

export interface GscMetricComparison {
  clicks: NumericDelta;
  impressions: NumericDelta;
  ctrPoints: number;
  positionGain: number;
}

export interface GscComparison {
  baseline: GscSnapshot;
  current: GscSnapshot;
  site: GscMetricComparison;
  queries: Array<
    GscMetricComparison & {
      query: string;
      match: GscQueryMatch;
    }
  >;
  urlSplits: Array<{
    id: string;
    label: string;
    expectedOwner: string;
    reportedUrlCountBefore: number;
    reportedUrlCountAfter: number;
    reportedUrlCountDelta: number;
    ownerImpressionShareBefore: number;
    ownerImpressionShareAfter: number;
    ownerImpressionSharePoints: number;
  }>;
  ai: {
    impressions: NumericDelta;
    pages: Array<{
      path: string;
      impressions: NumericDelta;
    }>;
  };
  ownerLinkClicks: {
    baselineAvailable: boolean;
    baselineTotal: number | null;
    currentTotal: number | null;
    totalDelta: number | null;
    owners: Array<{
      ownerId: SearchOwnerId;
      baselineClicks: number | null;
      currentClicks: number | null;
      delta: number | null;
    }>;
    currentSources: Array<{
      ownerId: SearchOwnerId;
      path: string;
      clicks: number;
    }>;
  };
}

function keyForQuery(query: string, match: GscQueryMatch): string {
  return `${match}:${query.trim().toLowerCase()}`;
}

function normalisePath(path: string): string {
  const withoutOrigin = path.replace(/^https?:\/\/[^/]+/i, "");
  return (withoutOrigin || "/").replace(/\/$/, "") || "/";
}

function numericDelta(before: number, after: number): NumericDelta {
  return {
    before,
    after,
    absolute: after - before,
    relative:
      before === 0 ? (after === 0 ? 0 : null) : (after - before) / before,
  };
}

function compareMetric(
  before: GscMetric,
  after: GscMetric,
): GscMetricComparison {
  return {
    clicks: numericDelta(before.clicks, after.clicks),
    impressions: numericDelta(before.impressions, after.impressions),
    ctrPoints: (after.ctr - before.ctr) * 100,
    positionGain: before.position - after.position,
  };
}

function ownerImpressionShare(split: GscUrlSplit): number {
  if (split.aggregate.impressions === 0) return 0;
  const ownerPath = normalisePath(split.expectedOwner);
  const owner = split.rows.find((row) => normalisePath(row.path) === ownerPath);
  return (owner?.impressions ?? 0) / split.aggregate.impressions;
}

function assertComparable(baseline: GscSnapshot, current: GscSnapshot): void {
  if (baseline.schemaVersion !== 1 || current.schemaVersion !== 1) {
    throw new Error("Only GSC snapshot schema version 1 is supported.");
  }
  if (baseline.property !== current.property) {
    throw new Error("GSC snapshots must use the same property.");
  }
  if (baseline.period.days !== current.period.days) {
    throw new Error("GSC snapshots must use periods of the same length.");
  }
}

export function compareGscSnapshots(
  baseline: GscSnapshot,
  current: GscSnapshot,
): GscComparison {
  assertComparable(baseline, current);

  const currentQueries = new Map(
    current.queries.map((row) => [keyForQuery(row.query, row.match), row]),
  );
  const queries = baseline.queries.map((before) => {
    const after = currentQueries.get(keyForQuery(before.query, before.match));
    if (!after) {
      throw new Error(
        `Current snapshot is missing ${before.match} query: ${before.query}`,
      );
    }
    return {
      query: before.query,
      match: before.match,
      ...compareMetric(before, after),
    };
  });

  const currentSplits = new Map(
    current.urlSplits.map((split) => [split.id, split]),
  );
  const urlSplits = baseline.urlSplits.map((before) => {
    const after = currentSplits.get(before.id);
    if (!after) {
      throw new Error(`Current snapshot is missing URL split: ${before.id}`);
    }
    const shareBefore = ownerImpressionShare(before);
    const shareAfter = ownerImpressionShare(after);
    return {
      id: before.id,
      label: before.label,
      expectedOwner: before.expectedOwner,
      reportedUrlCountBefore: before.reportedUrlCount,
      reportedUrlCountAfter: after.reportedUrlCount,
      reportedUrlCountDelta: after.reportedUrlCount - before.reportedUrlCount,
      ownerImpressionShareBefore: shareBefore,
      ownerImpressionShareAfter: shareAfter,
      ownerImpressionSharePoints: (shareAfter - shareBefore) * 100,
    };
  });

  const currentAiPages = new Map(
    current.ai.pages.map((page) => [normalisePath(page.path), page]),
  );
  const aiPages = baseline.ai.pages.map((before) => {
    const after = currentAiPages.get(normalisePath(before.path));
    if (!after) {
      throw new Error(`Current snapshot is missing AI page: ${before.path}`);
    }
    return {
      path: before.path,
      impressions: numericDelta(before.impressions, after.impressions),
    };
  });

  const baselineTotal = baseline.ownerLinkClicks?.total ?? null;
  const currentTotal = current.ownerLinkClicks?.total ?? null;
  const baselineOwnerClicks = new Map(
    baseline.ownerLinkClicks?.byOwner.map((row) => [row.ownerId, row.clicks]) ??
      [],
  );
  const currentOwnerClicks = new Map(
    current.ownerLinkClicks?.byOwner.map((row) => [row.ownerId, row.clicks]) ??
      [],
  );
  const ownerClicks = SEARCH_OWNERS.map((owner) => {
    const before = baseline.ownerLinkClicks
      ? (baselineOwnerClicks.get(owner.id) ?? 0)
      : null;
    const after = current.ownerLinkClicks
      ? (currentOwnerClicks.get(owner.id) ?? 0)
      : null;

    return {
      ownerId: owner.id,
      baselineClicks: before,
      currentClicks: after,
      delta: before === null || after === null ? null : after - before,
    };
  });

  return {
    baseline,
    current,
    site: compareMetric(baseline.site, current.site),
    queries,
    urlSplits,
    ai: {
      impressions: numericDelta(
        baseline.ai.impressions,
        current.ai.impressions,
      ),
      pages: aiPages,
    },
    ownerLinkClicks: {
      baselineAvailable: baseline.ownerLinkClicks !== null,
      baselineTotal,
      currentTotal,
      totalDelta:
        baselineTotal === null || currentTotal === null
          ? null
          : currentTotal - baselineTotal,
      owners: ownerClicks,
      currentSources: current.ownerLinkClicks?.bySource ?? [],
    },
  };
}

function signed(value: number, digits = 0): string {
  const rendered = value.toFixed(digits);
  return value > 0 ? `+${rendered}` : rendered;
}

function percent(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

function relative(value: number | null): string {
  return value === null ? "n/a" : `${signed(value * 100, 1)}%`;
}

export function renderGscComparisonMarkdown(comparison: GscComparison): string {
  const { baseline, current } = comparison;
  const lines = [
    "# Roadman search comparison",
    "",
    `Property: \`${baseline.property}\``,
    `Baseline: ${baseline.period.start} to ${baseline.period.end}`,
    `Current: ${current.period.start} to ${current.period.end}`,
    "",
    "## Site result",
    "",
    "| Signal | Before | After | Change |",
    "| --- | ---: | ---: | ---: |",
    `| Clicks | ${comparison.site.clicks.before.toLocaleString()} | ${comparison.site.clicks.after.toLocaleString()} | ${signed(comparison.site.clicks.absolute)} (${relative(comparison.site.clicks.relative)}) |`,
    `| Impressions | ${comparison.site.impressions.before.toLocaleString()} | ${comparison.site.impressions.after.toLocaleString()} | ${signed(comparison.site.impressions.absolute)} (${relative(comparison.site.impressions.relative)}) |`,
    `| CTR | ${percent(baseline.site.ctr)} | ${percent(current.site.ctr)} | ${signed(comparison.site.ctrPoints, 1)} points |`,
    `| Average position | ${baseline.site.position.toFixed(1)} | ${current.site.position.toFixed(1)} | ${signed(comparison.site.positionGain, 1)} positions gained |`,
    "",
    "## Priority queries",
    "",
    "| Query | Match | Click change | Impression change | CTR change | Position gain |",
    "| --- | --- | ---: | ---: | ---: | ---: |",
    ...comparison.queries.map(
      (row) =>
        `| ${row.query} | ${row.match} | ${signed(row.clicks.absolute)} (${relative(row.clicks.relative)}) | ${signed(row.impressions.absolute)} (${relative(row.impressions.relative)}) | ${signed(row.ctrPoints, 1)} points | ${signed(row.positionGain, 1)} |`,
    ),
    "",
    "## URL ownership",
    "",
    "| Query family | Intended owner | URLs before → after | Owner impression share | Change |",
    "| --- | --- | ---: | ---: | ---: |",
    ...comparison.urlSplits.map(
      (row) =>
        `| ${row.label} | \`${row.expectedOwner}\` | ${row.reportedUrlCountBefore} → ${row.reportedUrlCountAfter} | ${percent(row.ownerImpressionShareBefore)} → ${percent(row.ownerImpressionShareAfter)} | ${signed(row.ownerImpressionSharePoints, 1)} points |`,
    ),
    "",
    "## Google AI visibility",
    "",
    `Total impressions: ${comparison.ai.impressions.before.toLocaleString()} → ${comparison.ai.impressions.after.toLocaleString()} (${signed(comparison.ai.impressions.absolute)}, ${relative(comparison.ai.impressions.relative)}).`,
    "",
    "| Priority page | Before | After | Change |",
    "| --- | ---: | ---: | ---: |",
    ...comparison.ai.pages.map(
      (row) =>
        `| \`${row.path}\` | ${row.impressions.before.toLocaleString()} | ${row.impressions.after.toLocaleString()} | ${signed(row.impressions.absolute)} (${relative(row.impressions.relative)}) |`,
    ),
    "",
    "## Assisted guide clicks",
    "",
    comparison.ownerLinkClicks.baselineAvailable
      ? `Consented clicks: ${comparison.ownerLinkClicks.baselineTotal ?? 0} → ${comparison.ownerLinkClicks.currentTotal ?? 0} (${signed(comparison.ownerLinkClicks.totalDelta ?? 0)}).`
      : `Tracking did not exist in the baseline window. The current window recorded ${comparison.ownerLinkClicks.currentTotal ?? 0} consented clicks; treat this as a new signal, not a before/after lift.`,
    "",
    "| Definitive guide | Before | After | Change |",
    "| --- | ---: | ---: | ---: |",
    ...comparison.ownerLinkClicks.owners.map((row) => {
      const before = row.baselineClicks?.toLocaleString() ?? "n/a";
      const after = row.currentClicks?.toLocaleString() ?? "n/a";
      const change = row.delta === null ? "n/a" : signed(row.delta);
      return `| ${row.ownerId} | ${before} | ${after} | ${change} |`;
    }),
    "",
    "### Current assisted source pages",
    "",
    ...(comparison.ownerLinkClicks.currentSources.length > 0
      ? [
          "| Source page | Definitive guide | Clicks |",
          "| --- | --- | ---: |",
          ...comparison.ownerLinkClicks.currentSources
            .slice()
            .sort((a, b) => b.clicks - a.clicks || a.path.localeCompare(b.path))
            .map(
              (row) =>
                `| \`${row.path}\` | ${row.ownerId} | ${row.clicks.toLocaleString()} |`,
            ),
        ]
      : ["No source-page clicks were recorded in the current window."]),
    "",
  ];

  return lines.join("\n");
}
