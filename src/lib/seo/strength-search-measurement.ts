export type StrengthSearchLaneId =
  "strength-conditioning-head" | "cycling-gym-head";

export interface StrengthSearchMetric {
  clicks: number;
  impressions: number;
  /** Decimal ratio: 0.047 means 4.7%. */
  ctr: number;
  /** Null means Search Console reported no ranked impressions. */
  position: number | null;
}

export interface StrengthSearchPageRow {
  path: string;
  clicks: number;
  impressions: number;
}

export interface StrengthSearchQueryRow {
  query: string;
  clicks: number;
  impressions: number;
}

export interface StrengthSearchLaneSnapshot {
  id: StrengthSearchLaneId;
  label: string;
  match: "regex";
  regex: string;
  expectedOwner: string;
  aggregate: StrengthSearchMetric;
  reportedPageCount: number;
  reportedQueryCount: number;
  pageRows: StrengthSearchPageRow[];
  queryRows: StrengthSearchQueryRow[];
}

export interface StrengthSearchSnapshot {
  schemaVersion: 1;
  property: string;
  capturedAt: string;
  releaseDate: string;
  period: { start: string; end: string; days: number };
  lanes: StrengthSearchLaneSnapshot[];
  notes?: string[];
}

export const STRENGTH_SEARCH_LANES = [
  {
    id: "strength-conditioning-head",
    label: "Cycling strength and conditioning synonym intent",
    regex:
      "^(strength and conditioning for cyclists|cycling strength and conditioning|strength conditioning cycling|s&c for cyclists)$",
    expectedOwner: "/blog/cycling-strength-training-guide",
  },
  {
    id: "cycling-gym-head",
    label: "Cycling gym head term",
    regex: "^cycling gym$",
    expectedOwner: "/blog/cycling-gym-exercises-best",
  },
] as const satisfies ReadonlyArray<{
  id: StrengthSearchLaneId;
  label: string;
  regex: string;
  expectedOwner: string;
}>;

export const MIN_STRENGTH_GSC_CAPTURE_LAG_DAYS = 3;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

function normalisePath(path: string): string {
  const withoutOrigin = path.replace(/^https?:\/\/[^/]+/i, "");
  return withoutOrigin.replace(/\/$/, "") || "/";
}

function parseDate(value: string, label: string): number {
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

function assertCount(label: string, value: number) {
  if (!Number.isInteger(value) || value < 0) {
    throw new Error(`${label} must be a non-negative integer.`);
  }
}

function assertUnique(label: string, values: string[]) {
  const seen = new Set<string>();
  for (const value of values) {
    if (seen.has(value))
      throw new Error(`${label} contains duplicate ${value}.`);
    seen.add(value);
  }
}

function assertSameKeys(label: string, expected: string[], actual: string[]) {
  assertUnique(`${label} expected keys`, expected);
  assertUnique(`${label} actual keys`, actual);
  const expectedSet = new Set(expected);
  const actualSet = new Set(actual);
  const missing = expected.filter((key) => !actualSet.has(key));
  const extra = actual.filter((key) => !expectedSet.has(key));
  if (missing.length || extra.length) {
    throw new Error(
      `${label} must stay fixed (missing: ${missing.join(", ") || "none"}; extra: ${extra.join(", ") || "none"}).`,
    );
  }
}

function assertMetric(label: string, metric: StrengthSearchMetric) {
  assertCount(`${label}.clicks`, metric.clicks);
  assertCount(`${label}.impressions`, metric.impressions);
  if (metric.clicks > metric.impressions) {
    throw new Error(`${label}.clicks cannot exceed impressions.`);
  }
  if (!Number.isFinite(metric.ctr) || metric.ctr < 0 || metric.ctr > 1) {
    throw new Error(`${label}.ctr must be a decimal ratio from 0 to 1.`);
  }
  if (
    metric.position !== null &&
    (!Number.isFinite(metric.position) || metric.position <= 0)
  ) {
    throw new Error(`${label}.position must be positive or null.`);
  }
  if (
    metric.impressions === 0 &&
    (metric.clicks !== 0 || metric.ctr !== 0 || metric.position !== null)
  ) {
    throw new Error(
      `${label} with no impressions must use zero clicks, zero CTR and null position.`,
    );
  }
}

function assertSnapshot(snapshot: StrengthSearchSnapshot, label: string) {
  if (snapshot.schemaVersion !== 1) {
    throw new Error(`${label} must use strength-search schema version 1.`);
  }
  const start = parseDate(snapshot.period.start, `${label} period start`);
  const end = parseDate(snapshot.period.end, `${label} period end`);
  parseDate(snapshot.releaseDate, `${label} release date`);
  if (end < start) throw new Error(`${label} period end precedes its start.`);
  const days = Math.floor((end - start) / MS_PER_DAY) + 1;
  if (snapshot.period.days !== days) {
    throw new Error(
      `${label} period declares ${snapshot.period.days} days, not ${days}.`,
    );
  }
  if (!Number.isFinite(Date.parse(snapshot.capturedAt))) {
    throw new Error(`${label} capturedAt must be a valid timestamp.`);
  }

  assertSameKeys(
    `${label} search lanes`,
    STRENGTH_SEARCH_LANES.map((lane) => lane.id),
    snapshot.lanes.map((lane) => lane.id),
  );
  const contracts = new Map(
    STRENGTH_SEARCH_LANES.map((lane) => [lane.id, lane]),
  );

  for (const lane of snapshot.lanes) {
    const contract = contracts.get(lane.id)!;
    if (
      lane.match !== "regex" ||
      lane.regex !== contract.regex ||
      normalisePath(lane.expectedOwner) !==
        normalisePath(contract.expectedOwner)
    ) {
      throw new Error(
        `${label} lane ${lane.id} changed its measurement contract.`,
      );
    }
    assertMetric(`${label} lane ${lane.id}`, lane.aggregate);
    assertCount(
      `${label} lane ${lane.id}.reportedPageCount`,
      lane.reportedPageCount,
    );
    assertCount(
      `${label} lane ${lane.id}.reportedQueryCount`,
      lane.reportedQueryCount,
    );
    if (lane.reportedPageCount < lane.pageRows.length) {
      throw new Error(
        `${label} lane ${lane.id} stores more pages than GSC reported.`,
      );
    }
    if (lane.reportedQueryCount < lane.queryRows.length) {
      throw new Error(
        `${label} lane ${lane.id} stores more queries than GSC reported.`,
      );
    }
    assertUnique(
      `${label} lane ${lane.id} pages`,
      lane.pageRows.map((row) => normalisePath(row.path)),
    );
    assertUnique(
      `${label} lane ${lane.id} queries`,
      lane.queryRows.map((row) => row.query.trim().toLowerCase()),
    );
    for (const row of [...lane.pageRows, ...lane.queryRows]) {
      assertCount(`${label} lane ${lane.id} row clicks`, row.clicks);
      assertCount(`${label} lane ${lane.id} row impressions`, row.impressions);
      if (row.clicks > row.impressions) {
        throw new Error(
          `${label} lane ${lane.id} row clicks exceed impressions.`,
        );
      }
    }
  }
}

function delta(before: number, after: number) {
  return {
    before,
    after,
    absolute: after - before,
    relative:
      before === 0 ? (after === 0 ? 0 : null) : (after - before) / before,
  };
}

function visibleOwnerShare(lane: StrengthSearchLaneSnapshot): number {
  const visibleImpressions = lane.pageRows.reduce(
    (sum, row) => sum + row.impressions,
    0,
  );
  if (visibleImpressions === 0) return 0;
  const owner = lane.pageRows.find(
    (row) => normalisePath(row.path) === normalisePath(lane.expectedOwner),
  );
  return (owner?.impressions ?? 0) / visibleImpressions;
}

export function compareStrengthSearchSnapshots(
  baseline: StrengthSearchSnapshot,
  current: StrengthSearchSnapshot,
) {
  assertSnapshot(baseline, "Baseline");
  assertSnapshot(current, "Current");
  if (baseline.property !== current.property) {
    throw new Error(
      "Strength snapshots must use the same Search Console property.",
    );
  }
  if (baseline.releaseDate !== current.releaseDate) {
    throw new Error("Strength snapshots must use the same release date.");
  }
  if (baseline.period.days !== current.period.days) {
    throw new Error("Strength snapshots must use periods of the same length.");
  }

  const baselineEnd = parseDate(baseline.period.end, "Baseline period end");
  const currentStart = parseDate(current.period.start, "Current period start");
  const currentEnd = parseDate(current.period.end, "Current period end");
  const release = parseDate(baseline.releaseDate, "Release date");
  if (baselineEnd >= currentStart) {
    throw new Error("Strength snapshot periods must not overlap.");
  }
  if (baselineEnd >= release || currentStart <= release) {
    throw new Error(
      "Strength snapshots must exclude and bracket the release day.",
    );
  }
  const earliestCapture =
    currentEnd + MIN_STRENGTH_GSC_CAPTURE_LAG_DAYS * MS_PER_DAY;
  if (Date.parse(current.capturedAt) < earliestCapture) {
    throw new Error(
      `Current strength snapshot is too early; capture on or after ${new Date(earliestCapture).toISOString().slice(0, 10)}.`,
    );
  }

  const currentLanes = new Map(current.lanes.map((lane) => [lane.id, lane]));
  const lanes = baseline.lanes.map((before) => {
    const after = currentLanes.get(before.id)!;
    const ownerShareBefore = visibleOwnerShare(before);
    const ownerShareAfter = visibleOwnerShare(after);
    return {
      id: before.id,
      label: before.label,
      expectedOwner: normalisePath(before.expectedOwner),
      clicks: delta(before.aggregate.clicks, after.aggregate.clicks),
      impressions: delta(
        before.aggregate.impressions,
        after.aggregate.impressions,
      ),
      ctrPoints: (after.aggregate.ctr - before.aggregate.ctr) * 100,
      positionBefore: before.aggregate.position,
      positionAfter: after.aggregate.position,
      positionGain:
        before.aggregate.position === null || after.aggregate.position === null
          ? null
          : before.aggregate.position - after.aggregate.position,
      reportedPageCountBefore: before.reportedPageCount,
      reportedPageCountAfter: after.reportedPageCount,
      visibleOwnerShareBefore: ownerShareBefore,
      visibleOwnerShareAfter: ownerShareAfter,
      visibleOwnerSharePoints: (ownerShareAfter - ownerShareBefore) * 100,
    };
  });

  return { baseline, current, lanes };
}

function signed(value: number, digits = 0) {
  const rendered = value.toFixed(digits);
  return value > 0 ? `+${rendered}` : rendered;
}

function percent(value: number) {
  return `${(value * 100).toFixed(1)}%`;
}

function position(value: number | null) {
  return value === null ? "n/a" : value.toFixed(1);
}

export function renderStrengthSearchComparisonMarkdown(
  comparison: ReturnType<typeof compareStrengthSearchSnapshots>,
) {
  return [
    "# Roadman cycling strength search comparison",
    "",
    `Baseline: ${comparison.baseline.period.start} to ${comparison.baseline.period.end}`,
    `Current: ${comparison.current.period.start} to ${comparison.current.period.end}`,
    "",
    "| Lane | Owner | Clicks | Impressions | CTR | Position | Visible owner share | Pages |",
    "| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |",
    ...comparison.lanes.map(
      (lane) =>
        `| ${lane.label} | \`${lane.expectedOwner}\` | ${lane.clicks.before} → ${lane.clicks.after} (${signed(lane.clicks.absolute)}) | ${lane.impressions.before} → ${lane.impressions.after} (${signed(lane.impressions.absolute)}) | ${signed(lane.ctrPoints, 1)} points | ${position(lane.positionBefore)} → ${position(lane.positionAfter)} (${lane.positionGain === null ? "n/a" : `${signed(lane.positionGain, 1)} gained`}) | ${percent(lane.visibleOwnerShareBefore)} → ${percent(lane.visibleOwnerShareAfter)} (${signed(lane.visibleOwnerSharePoints, 1)} points) | ${lane.reportedPageCountBefore} → ${lane.reportedPageCountAfter} |`,
    ),
    "",
    "Visible owner share uses Search Console's stored Pages rows. Filtered card totals and table rows can be partial and must not be added together.",
    "",
  ].join("\n");
}
