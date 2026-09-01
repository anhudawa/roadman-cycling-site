export type AppSearchLaneId =
  | "roadman-app-product"
  | "masters-cycling-app-product"
  | "cycling-strength-app-category"
  | "cycling-recovery-app-category"
  | "cycling-training-app-discovery";

export interface AppSearchMetric {
  clicks: number;
  impressions: number;
  /** Decimal ratio: 0.037 means 3.7%. */
  ctr: number;
  /** Null means Search Console reported no ranked impressions. */
  position: number | null;
}

export interface AppSearchPageMetric extends AppSearchMetric {
  path: string;
}

export interface AppSearchRow {
  path: string;
  clicks: number;
  impressions: number;
}

export interface AppQueryRow {
  query: string;
  clicks: number;
  impressions: number;
}

export interface AppSearchLaneSnapshot {
  id: AppSearchLaneId;
  label: string;
  match: "regex";
  regex: string;
  expectedOwner: string;
  aggregate: AppSearchMetric;
  /** Number shown by the Pages tab; rows may be partial. */
  reportedUrlCount: number;
  pageRows: AppSearchRow[];
  queryRows: AppQueryRow[];
}

export interface AppWaitlistSnapshot {
  trackingStartedAt: string;
  submissions: number;
  attributedSubmissions: number;
  bySource: Array<{ source: string; submissions: number }>;
}

export interface AppSearchSnapshot {
  schemaVersion: 1;
  property: string;
  capturedAt: string;
  releaseDate: string;
  period: { start: string; end: string; days: number };
  pages: AppSearchPageMetric[];
  lanes: AppSearchLaneSnapshot[];
  ai: { pages: Array<{ path: string; impressions: number }> };
  /** Null means a comparable conversion capture was unavailable, not zero. */
  waitlist: AppWaitlistSnapshot | null;
  notes?: string[];
}

export const APP_MONITORED_PAGES = [
  "/app",
  "/app/masters",
  "/best/best-cycling-training-apps",
  "/best/best-cycling-strength-training-apps",
  "/best/best-cycling-recovery-apps",
] as const;

export const APP_AI_PAGES = ["/app", "/app/masters"] as const;

export const APP_SEARCH_LANES = [
  {
    id: "roadman-app-product",
    label: "Roadman strength, recovery and readiness app product intent",
    regex:
      "^(cycling strength and recovery app|cycling strength app|strength training app for cyclists|cycling recovery app|cycling readiness app|roadman cycling app|roadman app)$",
    expectedOwner: "/app",
  },
  {
    id: "masters-cycling-app-product",
    label: "Masters and over-40 cycling app product intent",
    regex:
      "(cycling|cyclist).*(app).*(over 40|over 50|masters)|(over 40|over 50|masters).*(cycling|cyclist).*app",
    expectedOwner: "/app/masters",
  },
  {
    id: "cycling-strength-app-category",
    label: "Cycling strength app comparison intent",
    regex: "^(best cycling strength training apps?)$",
    expectedOwner: "/best/best-cycling-strength-training-apps",
  },
  {
    id: "cycling-recovery-app-category",
    label: "Cycling recovery and readiness app comparison intent",
    regex: "^(best cycling recovery apps?|best cycling readiness apps?)$",
    expectedOwner: "/best/best-cycling-recovery-apps",
  },
  {
    id: "cycling-training-app-discovery",
    label: "Broad cycling training app discovery intent",
    regex:
      "^(best cycling training apps?|best ai cycling training apps?|cycling training apps?)$",
    expectedOwner: "/best/best-cycling-training-apps",
  },
] as const satisfies ReadonlyArray<{
  id: AppSearchLaneId;
  label: string;
  regex: string;
  expectedOwner: string;
}>;

export const MIN_APP_GSC_CAPTURE_LAG_DAYS = 3;
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

function assertUnique(label: string, keys: string[]) {
  const seen = new Set<string>();
  for (const key of keys) {
    if (seen.has(key)) throw new Error(`${label} contains duplicate ${key}.`);
    seen.add(key);
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

function assertCount(label: string, value: number) {
  if (!Number.isInteger(value) || value < 0) {
    throw new Error(`${label} must be a non-negative integer.`);
  }
}

function assertMetric(label: string, metric: AppSearchMetric) {
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
  if (metric.impressions === 0 && (metric.clicks !== 0 || metric.ctr !== 0)) {
    throw new Error(`${label} with no impressions must have zero clicks and CTR.`);
  }
  if (metric.impressions === 0 && metric.position !== null) {
    throw new Error(`${label} with no impressions must use a null position.`);
  }
}

function assertSnapshot(snapshot: AppSearchSnapshot, label: string) {
  if (snapshot.schemaVersion !== 1) {
    throw new Error(`${label} must use app-search snapshot schema version 1.`);
  }
  const start = parseDate(snapshot.period.start, `${label} period start`);
  const end = parseDate(snapshot.period.end, `${label} period end`);
  parseDate(snapshot.releaseDate, `${label} release date`);
  if (end < start) throw new Error(`${label} period end precedes its start.`);
  const days = Math.floor((end - start) / MS_PER_DAY) + 1;
  if (snapshot.period.days !== days) {
    throw new Error(`${label} period declares ${snapshot.period.days} days, not ${days}.`);
  }
  if (!Number.isFinite(Date.parse(snapshot.capturedAt))) {
    throw new Error(`${label} capturedAt must be a valid timestamp.`);
  }

  assertSameKeys(
    `${label} monitored pages`,
    [...APP_MONITORED_PAGES],
    snapshot.pages.map((page) => normalisePath(page.path)),
  );
  snapshot.pages.forEach((page, index) =>
    assertMetric(`${label} pages[${index}]`, page),
  );

  assertSameKeys(
    `${label} search lanes`,
    APP_SEARCH_LANES.map((lane) => lane.id),
    snapshot.lanes.map((lane) => lane.id),
  );
  const laneContract = new Map(APP_SEARCH_LANES.map((lane) => [lane.id, lane]));
  for (const lane of snapshot.lanes) {
    const contract = laneContract.get(lane.id)!;
    if (
      lane.match !== "regex" ||
      lane.regex !== contract.regex ||
      normalisePath(lane.expectedOwner) !== normalisePath(contract.expectedOwner)
    ) {
      throw new Error(`${label} lane ${lane.id} changed its filter or owner.`);
    }
    assertMetric(`${label} lane ${lane.id}`, lane.aggregate);
    assertCount(`${label} lane ${lane.id}.reportedUrlCount`, lane.reportedUrlCount);
    if (lane.reportedUrlCount < lane.pageRows.length) {
      throw new Error(`${label} lane ${lane.id} stores more URLs than GSC reported.`);
    }
    assertUnique(
      `${label} lane ${lane.id} page rows`,
      lane.pageRows.map((row) => normalisePath(row.path)),
    );
    assertUnique(
      `${label} lane ${lane.id} query rows`,
      lane.queryRows.map((row) => row.query.trim().toLowerCase()),
    );
    for (const row of [...lane.pageRows, ...lane.queryRows]) {
      assertCount(`${label} lane ${lane.id} row clicks`, row.clicks);
      assertCount(`${label} lane ${lane.id} row impressions`, row.impressions);
      if (row.clicks > row.impressions) {
        throw new Error(
          `${label} lane ${lane.id} row clicks cannot exceed impressions.`,
        );
      }
    }
  }

  assertSameKeys(
    `${label} AI pages`,
    [...APP_AI_PAGES],
    snapshot.ai.pages.map((page) => normalisePath(page.path)),
  );
  snapshot.ai.pages.forEach((page, index) =>
    assertCount(`${label} AI pages[${index}]`, page.impressions),
  );

  if (snapshot.waitlist) {
    if (!Number.isFinite(Date.parse(snapshot.waitlist.trackingStartedAt))) {
      throw new Error(`${label} waitlist trackingStartedAt is invalid.`);
    }
    assertCount(`${label} waitlist submissions`, snapshot.waitlist.submissions);
    assertCount(
      `${label} waitlist attributedSubmissions`,
      snapshot.waitlist.attributedSubmissions,
    );
    if (
      snapshot.waitlist.attributedSubmissions > snapshot.waitlist.submissions
    ) {
      throw new Error(`${label} attributed waitlist submissions exceed total.`);
    }
    assertUnique(
      `${label} waitlist sources`,
      snapshot.waitlist.bySource.map((row) => row.source),
    );
    let sourceSubmissions = 0;
    for (const row of snapshot.waitlist.bySource) {
      if (!row.source.trim()) {
        throw new Error(`${label} waitlist source names cannot be empty.`);
      }
      assertCount(`${label} waitlist source ${row.source}`, row.submissions);
      sourceSubmissions += row.submissions;
    }
    if (sourceSubmissions !== snapshot.waitlist.attributedSubmissions) {
      throw new Error(
        `${label} waitlist source totals must equal attributed submissions.`,
      );
    }
  }
}

export interface AppNumericDelta {
  before: number;
  after: number;
  absolute: number;
  relative: number | null;
}

function delta(before: number, after: number): AppNumericDelta {
  return {
    before,
    after,
    absolute: after - before,
    relative: before === 0 ? (after === 0 ? 0 : null) : (after - before) / before,
  };
}

function compareMetric(before: AppSearchMetric, after: AppSearchMetric) {
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

function visibleOwnerShare(lane: AppSearchLaneSnapshot): number {
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

export function compareAppSearchSnapshots(
  baseline: AppSearchSnapshot,
  current: AppSearchSnapshot,
) {
  assertSnapshot(baseline, "Baseline");
  assertSnapshot(current, "Current");
  if (baseline.property !== current.property) {
    throw new Error("App snapshots must use the same Search Console property.");
  }
  if (baseline.releaseDate !== current.releaseDate) {
    throw new Error("App snapshots must use the same release date.");
  }
  if (baseline.period.days !== current.period.days) {
    throw new Error("App snapshots must use periods of the same length.");
  }

  const baselineEnd = parseDate(baseline.period.end, "Baseline period end");
  const currentStart = parseDate(current.period.start, "Current period start");
  const currentEnd = parseDate(current.period.end, "Current period end");
  const release = parseDate(baseline.releaseDate, "Release date");
  if (baselineEnd >= currentStart) {
    throw new Error("App snapshot periods must not overlap.");
  }
  if (baselineEnd >= release || currentStart <= release) {
    throw new Error("App snapshots must exclude and bracket the release day.");
  }
  const earliestCapture =
    currentEnd + MIN_APP_GSC_CAPTURE_LAG_DAYS * MS_PER_DAY;
  if (Date.parse(current.capturedAt) < earliestCapture) {
    throw new Error(
      `Current app snapshot is too early; capture on or after ${new Date(earliestCapture).toISOString().slice(0, 10)}.`,
    );
  }

  const currentPages = new Map(
    current.pages.map((page) => [normalisePath(page.path), page]),
  );
  const pages = baseline.pages.map((before) => {
    const path = normalisePath(before.path);
    return { path, ...compareMetric(before, currentPages.get(path)!) };
  });

  const currentLanes = new Map(current.lanes.map((lane) => [lane.id, lane]));
  const lanes = baseline.lanes.map((before) => {
    const after = currentLanes.get(before.id)!;
    const shareBefore = visibleOwnerShare(before);
    const shareAfter = visibleOwnerShare(after);
    return {
      id: before.id,
      label: before.label,
      expectedOwner: normalisePath(before.expectedOwner),
      ...compareMetric(before.aggregate, after.aggregate),
      reportedUrlCountBefore: before.reportedUrlCount,
      reportedUrlCountAfter: after.reportedUrlCount,
      visibleOwnerShareBefore: shareBefore,
      visibleOwnerShareAfter: shareAfter,
      visibleOwnerSharePoints: (shareAfter - shareBefore) * 100,
    };
  });

  const currentAi = new Map(
    current.ai.pages.map((page) => [normalisePath(page.path), page.impressions]),
  );
  const aiPages = baseline.ai.pages.map((page) => ({
    path: normalisePath(page.path),
    impressions: delta(
      page.impressions,
      currentAi.get(normalisePath(page.path))!,
    ),
  }));

  const waitlist = {
    baselineAvailable: baseline.waitlist !== null,
    currentAvailable: current.waitlist !== null,
    submissions:
      baseline.waitlist && current.waitlist
        ? delta(
            baseline.waitlist.submissions,
            current.waitlist.submissions,
          )
        : null,
    attributedSubmissions:
      baseline.waitlist && current.waitlist
        ? delta(
            baseline.waitlist.attributedSubmissions,
            current.waitlist.attributedSubmissions,
          )
        : null,
  };

  return { baseline, current, pages, lanes, aiPages, waitlist };
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

export function renderAppSearchComparisonMarkdown(
  comparison: ReturnType<typeof compareAppSearchSnapshots>,
) {
  const lines = [
    "# Roadman app search comparison",
    "",
    `Baseline: ${comparison.baseline.period.start} to ${comparison.baseline.period.end}`,
    `Current: ${comparison.current.period.start} to ${comparison.current.period.end}`,
    "",
    "## Monitored pages",
    "",
    "| Page | Clicks | Impressions | CTR | Position |",
    "| --- | ---: | ---: | ---: | ---: |",
    ...comparison.pages.map(
      (row) =>
        `| \`${row.path}\` | ${row.clicks.before} → ${row.clicks.after} (${signed(row.clicks.absolute)}) | ${row.impressions.before} → ${row.impressions.after} (${signed(row.impressions.absolute)}) | ${signed(row.ctrPoints, 1)} points | ${position(row.positionBefore)} → ${position(row.positionAfter)} (${row.positionGain === null ? "n/a" : `${signed(row.positionGain, 1)} gained`}) |`,
    ),
    "",
    "## Query ownership lanes",
    "",
    "| Lane | Owner | Clicks | Impressions | Visible owner share | URLs |",
    "| --- | --- | ---: | ---: | ---: | ---: |",
    ...comparison.lanes.map(
      (lane) =>
        `| ${lane.label} | \`${lane.expectedOwner}\` | ${lane.clicks.before} → ${lane.clicks.after} | ${lane.impressions.before} → ${lane.impressions.after} | ${percent(lane.visibleOwnerShareBefore)} → ${percent(lane.visibleOwnerShareAfter)} (${signed(lane.visibleOwnerSharePoints, 1)} points) | ${lane.reportedUrlCountBefore} → ${lane.reportedUrlCountAfter} |`,
    ),
    "",
    "Visible owner share uses only the impressions in Search Console's reported Pages rows because filtered chart totals and table rows can be partial.",
    "",
    "## Google AI visibility",
    "",
    ...comparison.aiPages.map(
      (page) =>
        `- \`${page.path}\`: ${page.impressions.before} → ${page.impressions.after} (${signed(page.impressions.absolute)} impressions).`,
    ),
    "",
    "## Waitlist",
    "",
    comparison.waitlist.submissions
      ? `Submissions: ${comparison.waitlist.submissions.before} → ${comparison.waitlist.submissions.after} (${signed(comparison.waitlist.submissions.absolute)}).`
      : "No comparable baseline waitlist capture exists; the current capture remains observational rather than a fabricated zero comparison.",
    "",
  ];
  return lines.join("\n");
}
