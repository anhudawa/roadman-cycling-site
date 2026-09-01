export type RecoverySearchLaneId =
  "cycling-recovery-head" | "cycling-recovery-broad" | "cycling-recovery-app";

export interface RecoverySearchMetric {
  clicks: number;
  impressions: number;
  /** Decimal ratio: 0.03 means 3%. */
  ctr: number;
  /** Null means Search Console reported no ranked impressions. */
  position: number | null;
}

export interface RecoverySearchPageRow {
  path: string;
  clicks: number;
  impressions: number;
}

export interface RecoverySearchQueryRow {
  query: string;
  clicks: number;
  impressions: number;
}

export interface RecoverySearchLaneSnapshot {
  id: RecoverySearchLaneId;
  label: string;
  match: "regex";
  regex: string;
  expectedOwner: string;
  interpretation:
    "canonical-owner" | "portfolio-fragmentation" | "product-owner";
  aggregate: RecoverySearchMetric;
  reportedPageCount: number;
  reportedQueryCount: number;
  pageRows: RecoverySearchPageRow[];
  queryRows: RecoverySearchQueryRow[];
}

export interface RecoverySearchSnapshot {
  schemaVersion: 1;
  property: string;
  capturedAt: string;
  releaseDate: string;
  period: { start: string; end: string; days: number };
  lanes: RecoverySearchLaneSnapshot[];
  notes?: string[];
}

export const RECOVERY_SEARCH_LANES = [
  {
    id: "cycling-recovery-head",
    label: "Clean cycling recovery head terms",
    regex:
      "^(cycling recovery|cyclist recovery|recovery after cycling|cycling recovery tips|recovery strategies for cyclists|how to recover after cycling|road cycling recovery tips|recovery cycling)$",
    expectedOwner: "/blog/cycling-recovery-tips",
    interpretation: "canonical-owner",
  },
  {
    id: "cycling-recovery-broad",
    label: "Broad cycling recovery portfolio and fragmentation monitor",
    regex:
      "(cyclist|cycling).*(recovery|recover|rest.?day|soreness|sleep)|(recovery|recover|rest.?day|soreness|sleep).*(cyclist|cycling)",
    expectedOwner: "/blog/cycling-recovery-tips",
    interpretation: "portfolio-fragmentation",
  },
  {
    id: "cycling-recovery-app",
    label: "Cycling recovery and readiness app product intent",
    regex:
      "^(cycling recovery app|cycling readiness app|roadman cycling app|roadman app)$",
    expectedOwner: "/app",
    interpretation: "product-owner",
  },
] as const satisfies ReadonlyArray<{
  id: RecoverySearchLaneId;
  label: string;
  regex: string;
  expectedOwner: string;
  interpretation: RecoverySearchLaneSnapshot["interpretation"];
}>;

export const RECOVERY_SEARCH_CONFOUNDER_QUERY =
  "masters cyclists lower back pain recovery tips questions";
export const MIN_RECOVERY_GSC_CAPTURE_LAG_DAYS = 3;
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
  const actualSet = new Set(actual);
  const expectedSet = new Set(expected);
  const missing = expected.filter((key) => !actualSet.has(key));
  const extra = actual.filter((key) => !expectedSet.has(key));
  if (missing.length || extra.length) {
    throw new Error(
      `${label} must stay fixed (missing: ${missing.join(", ") || "none"}; extra: ${extra.join(", ") || "none"}).`,
    );
  }
}

function assertMetric(label: string, metric: RecoverySearchMetric) {
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

function assertRows(
  label: string,
  rows: Array<{ clicks: number; impressions: number }>,
) {
  for (const row of rows) {
    assertCount(`${label} row clicks`, row.clicks);
    assertCount(`${label} row impressions`, row.impressions);
    if (row.clicks > row.impressions) {
      throw new Error(`${label} row clicks cannot exceed impressions.`);
    }
  }
}

function assertSnapshot(snapshot: RecoverySearchSnapshot, label: string) {
  if (snapshot.schemaVersion !== 1) {
    throw new Error(`${label} must use recovery-search schema version 1.`);
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
    RECOVERY_SEARCH_LANES.map((lane) => lane.id),
    snapshot.lanes.map((lane) => lane.id),
  );
  const contracts = new Map(
    RECOVERY_SEARCH_LANES.map((lane) => [lane.id, lane]),
  );

  for (const lane of snapshot.lanes) {
    const contract = contracts.get(lane.id)!;
    if (
      lane.match !== "regex" ||
      lane.regex !== contract.regex ||
      normalisePath(lane.expectedOwner) !==
        normalisePath(contract.expectedOwner) ||
      lane.interpretation !== contract.interpretation
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
    assertRows(`${label} lane ${lane.id}`, lane.pageRows);
    assertRows(`${label} lane ${lane.id}`, lane.queryRows);
  }
}

export interface RecoveryNumericDelta {
  before: number;
  after: number;
  absolute: number;
  relative: number | null;
}

function delta(before: number, after: number): RecoveryNumericDelta {
  return {
    before,
    after,
    absolute: after - before,
    relative:
      before === 0 ? (after === 0 ? 0 : null) : (after - before) / before,
  };
}

function visibleOwnerShare(lane: RecoverySearchLaneSnapshot): number {
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

function visibleConfounderShare(lane: RecoverySearchLaneSnapshot): number {
  const visibleImpressions = lane.queryRows.reduce(
    (sum, row) => sum + row.impressions,
    0,
  );
  if (visibleImpressions === 0) return 0;
  const confounder = lane.queryRows.find(
    (row) =>
      row.query.trim().toLowerCase() === RECOVERY_SEARCH_CONFOUNDER_QUERY,
  );
  return (confounder?.impressions ?? 0) / visibleImpressions;
}

function compareMetric(
  before: RecoverySearchMetric,
  after: RecoverySearchMetric,
) {
  return {
    clicks: delta(before.clicks, after.clicks),
    impressions: delta(before.impressions, after.impressions),
    ctrPoints: (after.ctr - before.ctr) * 100,
    positionGain:
      before.position === null || after.position === null
        ? null
        : before.position - after.position,
    positionBefore: before.position,
    positionAfter: after.position,
  };
}

export function compareRecoverySearchSnapshots(
  baseline: RecoverySearchSnapshot,
  current: RecoverySearchSnapshot,
) {
  assertSnapshot(baseline, "Baseline");
  assertSnapshot(current, "Current");
  if (baseline.property !== current.property) {
    throw new Error(
      "Recovery snapshots must use the same Search Console property.",
    );
  }
  if (baseline.releaseDate !== current.releaseDate) {
    throw new Error("Recovery snapshots must use the same release date.");
  }
  if (baseline.period.days !== current.period.days) {
    throw new Error("Recovery snapshots must use periods of the same length.");
  }

  const baselineEnd = parseDate(baseline.period.end, "Baseline period end");
  const currentStart = parseDate(current.period.start, "Current period start");
  const currentEnd = parseDate(current.period.end, "Current period end");
  const release = parseDate(baseline.releaseDate, "Release date");
  if (baselineEnd >= currentStart) {
    throw new Error("Recovery snapshot periods must not overlap.");
  }
  if (baselineEnd >= release || currentStart <= release) {
    throw new Error(
      "Recovery snapshots must exclude and bracket the release day.",
    );
  }
  const earliestCapture =
    currentEnd + MIN_RECOVERY_GSC_CAPTURE_LAG_DAYS * MS_PER_DAY;
  if (Date.parse(current.capturedAt) < earliestCapture) {
    throw new Error(
      `Current recovery snapshot is too early; capture on or after ${new Date(earliestCapture).toISOString().slice(0, 10)}.`,
    );
  }

  const currentLanes = new Map(current.lanes.map((lane) => [lane.id, lane]));
  const lanes = baseline.lanes.map((before) => {
    const after = currentLanes.get(before.id)!;
    const ownerShareBefore = visibleOwnerShare(before);
    const ownerShareAfter = visibleOwnerShare(after);
    const confounderShareBefore = visibleConfounderShare(before);
    const confounderShareAfter = visibleConfounderShare(after);
    return {
      id: before.id,
      label: before.label,
      interpretation: before.interpretation,
      expectedOwner: normalisePath(before.expectedOwner),
      ...compareMetric(before.aggregate, after.aggregate),
      reportedPageCountBefore: before.reportedPageCount,
      reportedPageCountAfter: after.reportedPageCount,
      reportedQueryCountBefore: before.reportedQueryCount,
      reportedQueryCountAfter: after.reportedQueryCount,
      visibleOwnerShareBefore: ownerShareBefore,
      visibleOwnerShareAfter: ownerShareAfter,
      visibleOwnerSharePoints: (ownerShareAfter - ownerShareBefore) * 100,
      visibleConfounderShareBefore: confounderShareBefore,
      visibleConfounderShareAfter: confounderShareAfter,
      visibleConfounderSharePoints:
        (confounderShareAfter - confounderShareBefore) * 100,
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

export function renderRecoverySearchComparisonMarkdown(
  comparison: ReturnType<typeof compareRecoverySearchSnapshots>,
) {
  const lines = [
    "# Roadman cycling recovery search comparison",
    "",
    `Baseline: ${comparison.baseline.period.start} to ${comparison.baseline.period.end}`,
    `Current: ${comparison.current.period.start} to ${comparison.current.period.end}`,
    "",
    "| Lane | Job | Owner | Clicks | Impressions | CTR | Position | Visible owner share | Pages / queries |",
    "| --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |",
    ...comparison.lanes.map(
      (lane) =>
        `| ${lane.label} | ${lane.interpretation} | \`${lane.expectedOwner}\` | ${lane.clicks.before} → ${lane.clicks.after} (${signed(lane.clicks.absolute)}) | ${lane.impressions.before} → ${lane.impressions.after} (${signed(lane.impressions.absolute)}) | ${signed(lane.ctrPoints, 1)} points | ${position(lane.positionBefore)} → ${position(lane.positionAfter)} (${lane.positionGain === null ? "n/a" : `${signed(lane.positionGain, 1)} gained`}) | ${percent(lane.visibleOwnerShareBefore)} → ${percent(lane.visibleOwnerShareAfter)} (${signed(lane.visibleOwnerSharePoints, 1)} points) | ${lane.reportedPageCountBefore}/${lane.reportedQueryCountBefore} → ${lane.reportedPageCountAfter}/${lane.reportedQueryCountAfter} |`,
    ),
    "",
    "Visible owner share uses only stored Search Console Pages rows. The broad lane is a portfolio-fragmentation monitor, not a target for forcing every narrow recovery query onto the broad owner.",
    "",
    "## Broad-lane confounder",
    "",
    ...comparison.lanes
      .filter((lane) => lane.id === "cycling-recovery-broad")
      .map(
        (lane) =>
          `- The known lower-back query represented ${percent(lane.visibleConfounderShareBefore)} of stored baseline query-row impressions and ${percent(lane.visibleConfounderShareAfter)} after release (${signed(lane.visibleConfounderSharePoints, 1)} points). Interpret broad-card movement alongside the clean head-term lane.`,
      ),
    "",
  ];
  return lines.join("\n");
}
