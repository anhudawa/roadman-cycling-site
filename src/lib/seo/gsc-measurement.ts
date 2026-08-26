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

export interface GscVideoIndexIssue {
  reason: string;
  videos: number;
  validation: string;
}

/**
 * Point-in-time Video indexing report state. Unlike Search performance, this
 * report is not filtered to the snapshot period; `lastUpdated` preserves the
 * reporting date so checkpoint comparisons remain honest about Google lag.
 */
export interface GscVideoIndexSnapshot {
  lastUpdated: string;
  indexed: number;
  notIndexed: number;
  issues: GscVideoIndexIssue[];
}

export interface SearchOwnerClickSnapshot {
  trackingStartedAt: string;
  total: number;
  byOwner: { ownerId: SearchOwnerId; clicks: number }[];
  bySource: { ownerId: SearchOwnerId; path: string; clicks: number }[];
}

export interface GscSnapshot {
  schemaVersion: 2;
  property: string;
  capturedAt: string;
  deploymentDate: string;
  period: {
    start: string;
    end: string;
    days: number;
  };
  site: GscMetric;
  /** Exact-URL Web-search metrics for all five canonical search owners. */
  ownerPages: GscPageMetric[];
  queries: GscQueryMetric[];
  urlSplits: GscUrlSplit[];
  ai: GscAiSnapshot;
  videoIndex: GscVideoIndexSnapshot;
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
  ownerPages: Array<
    GscMetricComparison & {
      ownerId: SearchOwnerId;
      label: string;
      path: string;
      ctrBefore: number;
      ctrAfter: number;
      positionBefore: number;
      positionAfter: number;
    }
  >;
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
  videoIndex: {
    baselineLastUpdated: string;
    currentLastUpdated: string;
    indexed: NumericDelta;
    notIndexed: NumericDelta;
    issues: Array<{
      reason: string;
      videos: NumericDelta;
      currentValidation: string;
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

function keyForVideoIssue(reason: string): string {
  return reason.trim().toLowerCase();
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

const MS_PER_DAY = 24 * 60 * 60 * 1000;
export const MIN_GSC_CAPTURE_LAG_DAYS = 3;

function parseCalendarDate(value: string, label: string): number {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new Error(`${label} must use YYYY-MM-DD.`);
  }

  const timestamp = Date.parse(`${value}T00:00:00.000Z`);
  if (
    !Number.isFinite(timestamp) ||
    new Date(timestamp).toISOString().slice(0, 10) !== value
  ) {
    throw new Error(`${label} is not a valid calendar date.`);
  }

  return timestamp;
}

function assertMetric(label: string, metric: GscMetric): void {
  const values: Array<[keyof GscMetric, number]> = [
    ["clicks", metric.clicks],
    ["impressions", metric.impressions],
    ["ctr", metric.ctr],
    ["position", metric.position],
  ];
  for (const [name, value] of values) {
    if (!Number.isFinite(value) || value < 0) {
      throw new Error(`${label}.${name} must be a non-negative number.`);
    }
  }
  if (metric.ctr > 1) {
    throw new Error(`${label}.ctr must be a decimal ratio between 0 and 1.`);
  }
}

function assertUniqueKeys(label: string, keys: string[]): void {
  const seen = new Set<string>();
  for (const key of keys) {
    if (seen.has(key)) {
      throw new Error(`${label} contains a duplicate key: ${key}`);
    }
    seen.add(key);
  }
}

function assertSameKeySet(
  label: string,
  baselineKeys: string[],
  currentKeys: string[],
): void {
  assertUniqueKeys(`Baseline ${label}`, baselineKeys);
  assertUniqueKeys(`Current ${label}`, currentKeys);

  const baselineSet = new Set(baselineKeys);
  const currentSet = new Set(currentKeys);
  const missing = baselineKeys.filter((key) => !currentSet.has(key));
  const extra = currentKeys.filter((key) => !baselineSet.has(key));

  if (missing.length > 0 || extra.length > 0) {
    const details = [
      missing.length > 0 ? `missing: ${missing.join(", ")}` : "",
      extra.length > 0 ? `extra: ${extra.join(", ")}` : "",
    ]
      .filter(Boolean)
      .join("; ");
    throw new Error(`GSC snapshots must use the same ${label} (${details}).`);
  }
}

function metricValuesMatch(left: GscMetric, right: GscMetric): boolean {
  return (
    left.clicks === right.clicks &&
    left.impressions === right.impressions &&
    left.ctr === right.ctr &&
    left.position === right.position
  );
}

function validateSnapshot(snapshot: GscSnapshot, label: string): void {
  const start = parseCalendarDate(
    snapshot.period.start,
    `${label} period start`,
  );
  const end = parseCalendarDate(snapshot.period.end, `${label} period end`);
  parseCalendarDate(snapshot.deploymentDate, `${label} deployment date`);

  if (end < start) {
    throw new Error(`${label} period end must not precede its start.`);
  }
  const inclusiveDays = Math.floor((end - start) / MS_PER_DAY) + 1;
  if (snapshot.period.days !== inclusiveDays) {
    throw new Error(
      `${label} period declares ${snapshot.period.days} days but its dates span ${inclusiveDays}.`,
    );
  }
  if (!Number.isFinite(Date.parse(snapshot.capturedAt))) {
    throw new Error(`${label} capturedAt must be a valid timestamp.`);
  }

  assertMetric(`${label} site`, snapshot.site);
  const ownerPageKeys = snapshot.ownerPages.map((row) =>
    normalisePath(row.path),
  );
  assertSameKeySet(
    "canonical owner pages",
    SEARCH_OWNERS.map((owner) => normalisePath(owner.path)),
    ownerPageKeys,
  );
  snapshot.ownerPages.forEach((row, index) =>
    assertMetric(`${label} ownerPages[${index}]`, row),
  );
  const queryKeys = snapshot.queries.map((row) =>
    keyForQuery(row.query, row.match),
  );
  assertUniqueKeys(`${label} priority queries`, queryKeys);
  snapshot.queries.forEach((row, index) =>
    assertMetric(`${label} queries[${index}]`, row),
  );

  assertUniqueKeys(
    `${label} URL splits`,
    snapshot.urlSplits.map((split) => split.id),
  );
  for (const split of snapshot.urlSplits) {
    if (
      !Number.isInteger(split.reportedUrlCount) ||
      split.reportedUrlCount < split.rows.length
    ) {
      throw new Error(
        `${label} URL split ${split.id} must report at least as many URLs as it stores.`,
      );
    }
    const query = snapshot.queries.find(
      (row) =>
        keyForQuery(row.query, row.match) ===
        keyForQuery(split.query, split.match),
    );
    if (!query) {
      throw new Error(
        `${label} URL split ${split.id} has no matching priority query.`,
      );
    }
    assertMetric(`${label} URL split ${split.id} aggregate`, split.aggregate);
    if (!metricValuesMatch(query, split.aggregate)) {
      throw new Error(
        `${label} URL split ${split.id} aggregate must match its priority query metric.`,
      );
    }
    split.rows.forEach((row, index) =>
      assertMetric(`${label} URL split ${split.id} rows[${index}]`, row),
    );
  }

  if (
    !Number.isFinite(snapshot.ai.impressions) ||
    snapshot.ai.impressions < 0
  ) {
    throw new Error(`${label} AI impressions must be a non-negative number.`);
  }
  const aiPageKeys = snapshot.ai.pages.map((page) => normalisePath(page.path));
  assertUniqueKeys(`${label} AI pages`, aiPageKeys);
  snapshot.ai.pages.forEach((page, index) => {
    if (!Number.isFinite(page.impressions) || page.impressions < 0) {
      throw new Error(
        `${label} AI pages[${index}].impressions must be a non-negative number.`,
      );
    }
  });

  parseCalendarDate(
    snapshot.videoIndex.lastUpdated,
    `${label} video index lastUpdated`,
  );
  for (const [name, value] of [
    ["indexed", snapshot.videoIndex.indexed],
    ["notIndexed", snapshot.videoIndex.notIndexed],
  ] as const) {
    if (!Number.isInteger(value) || value < 0) {
      throw new Error(
        `${label} video index ${name} must be a non-negative integer.`,
      );
    }
  }
  assertUniqueKeys(
    `${label} video index issues`,
    snapshot.videoIndex.issues.map((issue) => keyForVideoIssue(issue.reason)),
  );
  snapshot.videoIndex.issues.forEach((issue, index) => {
    if (!issue.reason.trim()) {
      throw new Error(
        `${label} video index issues[${index}].reason must not be empty.`,
      );
    }
    if (!Number.isInteger(issue.videos) || issue.videos < 0) {
      throw new Error(
        `${label} video index issues[${index}].videos must be a non-negative integer.`,
      );
    }
    if (!issue.validation.trim()) {
      throw new Error(
        `${label} video index issues[${index}].validation must not be empty.`,
      );
    }
  });
}

function assertComparable(baseline: GscSnapshot, current: GscSnapshot): void {
  if (baseline.schemaVersion !== 2 || current.schemaVersion !== 2) {
    throw new Error("Only GSC snapshot schema version 2 is supported.");
  }
  validateSnapshot(baseline, "Baseline");
  validateSnapshot(current, "Current");
  if (baseline.property !== current.property) {
    throw new Error("GSC snapshots must use the same property.");
  }
  if (baseline.deploymentDate !== current.deploymentDate) {
    throw new Error("GSC snapshots must use the same deployment date.");
  }
  if (baseline.period.days !== current.period.days) {
    throw new Error("GSC snapshots must use periods of the same length.");
  }

  assertSameKeySet(
    "priority query filters",
    baseline.queries.map((row) => keyForQuery(row.query, row.match)),
    current.queries.map((row) => keyForQuery(row.query, row.match)),
  );
  assertSameKeySet(
    "URL split IDs",
    baseline.urlSplits.map((split) => split.id),
    current.urlSplits.map((split) => split.id),
  );
  assertSameKeySet(
    "AI page filters",
    baseline.ai.pages.map((page) => normalisePath(page.path)),
    current.ai.pages.map((page) => normalisePath(page.path)),
  );

  const currentSplits = new Map(
    current.urlSplits.map((split) => [split.id, split]),
  );
  for (const before of baseline.urlSplits) {
    const after = currentSplits.get(before.id)!;
    if (
      keyForQuery(before.query, before.match) !==
      keyForQuery(after.query, after.match)
    ) {
      throw new Error(
        `URL split ${before.id} must use the same query and match mode.`,
      );
    }
    if (
      normalisePath(before.expectedOwner) !== normalisePath(after.expectedOwner)
    ) {
      throw new Error(
        `URL split ${before.id} must use the same expected owner.`,
      );
    }
  }

  const baselineEnd = parseCalendarDate(
    baseline.period.end,
    "Baseline period end",
  );
  const currentStart = parseCalendarDate(
    current.period.start,
    "Current period start",
  );
  const currentEnd = parseCalendarDate(
    current.period.end,
    "Current period end",
  );
  const deployment = parseCalendarDate(
    baseline.deploymentDate,
    "Deployment date",
  );
  if (baselineEnd >= currentStart) {
    throw new Error("GSC snapshot periods must not overlap.");
  }
  if (baselineEnd >= deployment || currentStart <= deployment) {
    throw new Error(
      "GSC snapshots must bracket the deployment with full pre- and post-deployment days.",
    );
  }

  const earliestCapture =
    currentEnd + MIN_GSC_CAPTURE_LAG_DAYS * MS_PER_DAY;
  if (Date.parse(current.capturedAt) < earliestCapture) {
    throw new Error(
      `Current GSC snapshot must be captured at least ${MIN_GSC_CAPTURE_LAG_DAYS} calendar days after its period end (earliest ${new Date(earliestCapture).toISOString().slice(0, 10)}).`,
    );
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

  const baselineOwnerPages = new Map(
    baseline.ownerPages.map((row) => [normalisePath(row.path), row]),
  );
  const currentOwnerPages = new Map(
    current.ownerPages.map((row) => [normalisePath(row.path), row]),
  );
  const ownerPages = SEARCH_OWNERS.map((owner) => {
    const path = normalisePath(owner.path);
    const before = baselineOwnerPages.get(path)!;
    const after = currentOwnerPages.get(path)!;
    return {
      ownerId: owner.id,
      label: owner.label,
      path,
      ctrBefore: before.ctr,
      ctrAfter: after.ctr,
      positionBefore: before.position,
      positionAfter: after.position,
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

  const baselineVideoIssues = new Map(
    baseline.videoIndex.issues.map((issue) => [
      keyForVideoIssue(issue.reason),
      issue,
    ]),
  );
  const currentVideoIssues = new Map(
    current.videoIndex.issues.map((issue) => [
      keyForVideoIssue(issue.reason),
      issue,
    ]),
  );
  const videoIssueKeys = new Set([
    ...baselineVideoIssues.keys(),
    ...currentVideoIssues.keys(),
  ]);
  const videoIssues = [...videoIssueKeys]
    .map((key) => {
      const before = baselineVideoIssues.get(key);
      const after = currentVideoIssues.get(key);
      return {
        reason: after?.reason ?? before?.reason ?? key,
        videos: numericDelta(before?.videos ?? 0, after?.videos ?? 0),
        currentValidation: after?.validation ?? "Not present",
      };
    })
    .sort((left, right) => left.reason.localeCompare(right.reason));

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
    ownerPages,
    queries,
    urlSplits,
    ai: {
      impressions: numericDelta(
        baseline.ai.impressions,
        current.ai.impressions,
      ),
      pages: aiPages,
    },
    videoIndex: {
      baselineLastUpdated: baseline.videoIndex.lastUpdated,
      currentLastUpdated: current.videoIndex.lastUpdated,
      indexed: numericDelta(
        baseline.videoIndex.indexed,
        current.videoIndex.indexed,
      ),
      notIndexed: numericDelta(
        baseline.videoIndex.notIndexed,
        current.videoIndex.notIndexed,
      ),
      issues: videoIssues,
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
    "## Canonical owner pages",
    "",
    "| Owner | Clicks | Impressions | CTR | Position |",
    "| --- | ---: | ---: | ---: | ---: |",
    ...comparison.ownerPages.map(
      (row) =>
        `| [${row.label}](${row.path}) | ${row.clicks.before.toLocaleString()} → ${row.clicks.after.toLocaleString()} (${signed(row.clicks.absolute)}) | ${row.impressions.before.toLocaleString()} → ${row.impressions.after.toLocaleString()} (${signed(row.impressions.absolute)}) | ${percent(row.ctrBefore)} → ${percent(row.ctrAfter)} (${signed(row.ctrPoints, 1)} points) | ${row.positionBefore.toFixed(1)} → ${row.positionAfter.toFixed(1)} (${signed(row.positionGain, 1)} gained) |`,
    ),
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
    "## Video indexing",
    "",
    `Point-in-time report dates: ${comparison.videoIndex.baselineLastUpdated} → ${comparison.videoIndex.currentLastUpdated}. Video indexing is not filtered to the Search performance period.`,
    "",
    "| Signal | Before | After | Change |",
    "| --- | ---: | ---: | ---: |",
    `| Video indexed | ${comparison.videoIndex.indexed.before.toLocaleString()} | ${comparison.videoIndex.indexed.after.toLocaleString()} | ${signed(comparison.videoIndex.indexed.absolute)} |`,
    `| No video indexed | ${comparison.videoIndex.notIndexed.before.toLocaleString()} | ${comparison.videoIndex.notIndexed.after.toLocaleString()} | ${signed(comparison.videoIndex.notIndexed.absolute)} |`,
    "",
    "| Video indexing reason | Before | After | Change | Current validation |",
    "| --- | ---: | ---: | ---: | --- |",
    ...comparison.videoIndex.issues.map(
      (issue) =>
        `| ${issue.reason} | ${issue.videos.before.toLocaleString()} | ${issue.videos.after.toLocaleString()} | ${signed(issue.videos.absolute)} | ${issue.currentValidation} |`,
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
