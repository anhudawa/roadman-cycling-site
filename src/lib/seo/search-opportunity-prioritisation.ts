export type OpportunityState = "act" | "measure" | "hold";

export interface RollingPageOpportunity {
  path: string;
  currentClicks: number;
  currentImpressions: number;
  previousClicks: number;
  previousImpressions: number;
  currentCtr?: number;
  previousCtr?: number;
  currentPosition?: number;
  previousPosition?: number;
}

export interface OpportunityPageContext {
  sourceFile: string | null;
  lastChangedAt: string | null;
  commercialRelevance?: number;
}

export interface PrioritisedSearchOpportunity extends RollingPageOpportunity {
  sourceFile: string | null;
  lastChangedAt: string | null;
  daysSinceChange: number | null;
  protectedUntil: string | null;
  state: OpportunityState;
  score: number;
  commercialRelevance: number;
  expectedCtr: number | null;
  currentCtrResolved: number;
  clickChangePercent: number | null;
  impressionChangePercent: number | null;
  recommendation: string;
  scoreReasons: string[];
}

const DAY_MS = 24 * 60 * 60 * 1000;
const HOLD_DAYS = 7;
const MEASURE_DAYS = 14;

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, value));
}

function round(value: number, places = 1): number {
  const factor = 10 ** places;
  return Math.round(value * factor) / factor;
}

function parseCalendarDate(value: string): number {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new Error(`Expected YYYY-MM-DD, received ${value}.`);
  }

  const timestamp = Date.parse(`${value}T00:00:00.000Z`);
  if (!Number.isFinite(timestamp)) {
    throw new Error(`Invalid calendar date: ${value}.`);
  }
  return timestamp;
}

function addCalendarDays(value: string, days: number): string {
  return new Date(parseCalendarDate(value) + days * DAY_MS)
    .toISOString()
    .slice(0, 10);
}

function percentageChange(before: number, after: number): number | null {
  if (before === 0) return after === 0 ? 0 : null;
  return (after - before) / before;
}

export function expectedCtrForPosition(position: number): number {
  if (position <= 1) return 0.25;
  if (position <= 2) return 0.15;
  if (position <= 3) return 0.1;
  if (position <= 5) return 0.06;
  if (position <= 10) return 0.035;
  if (position <= 20) return 0.015;
  return 0.008;
}

export function inferCommercialRelevance(path: string): number {
  const conversionIntent =
    /(coach|coaching|training-plan|training-camp|strength|recovery|nutrition|calculator|app)/i;
  const buyingIntent = /(best-|review|versus|-vs-|computer|watch|gear)/i;

  if (conversionIntent.test(path)) return 15;
  if (buyingIntent.test(path)) return 10;
  return 5;
}

function resolveCtr(row: RollingPageOpportunity): number {
  if (row.currentCtr !== undefined) return row.currentCtr;
  if (row.currentImpressions === 0) return 0;
  return row.currentClicks / row.currentImpressions;
}

function positionPoints(position?: number): number {
  if (position === undefined) return 5;
  if (position > 3 && position <= 15) return 15;
  if (position <= 3) return 7;
  if (position <= 25) return 9;
  return 3;
}

function stateForAge(daysSinceChange: number | null): OpportunityState {
  if (daysSinceChange === null) return "measure";
  if (daysSinceChange >= MEASURE_DAYS) return "act";
  if (daysSinceChange < HOLD_DAYS) return "hold";
  return "measure";
}

function recommendationFor(
  opportunity: Pick<
    PrioritisedSearchOpportunity,
    | "state"
    | "protectedUntil"
    | "currentPosition"
    | "currentCtrResolved"
    | "expectedCtr"
    | "clickChangePercent"
  >,
): string {
  if (opportunity.state === "hold") {
    return `Protect the page until ${opportunity.protectedUntil}; verify indexing and collect exact-page/query data without rewriting it.`;
  }
  if (opportunity.state === "measure") {
    if (opportunity.protectedUntil === null) {
      return "Resolve the source file and last material change before editing; missing freshness data is not permission to rewrite.";
    }
    return "Measure exact-page queries, intended-owner share and conversion-path clicks; intervene only if the same weakness persists after day 14.";
  }
  if (
    opportunity.currentPosition !== undefined &&
    opportunity.currentPosition <= 5 &&
    opportunity.expectedCtr !== null &&
    opportunity.currentCtrResolved < opportunity.expectedCtr * 0.6
  ) {
    return "Run a query-to-snippet audit: check SERP intent, title promise and rich-result eligibility before changing article depth.";
  }
  if (
    opportunity.clickChangePercent !== null &&
    opportunity.clickChangePercent <= -0.2
  ) {
    return "Diagnose the click loss by query and competing URL; repair intent or ownership before adding more content.";
  }
  if (
    opportunity.currentPosition !== undefined &&
    opportunity.currentPosition > 5 &&
    opportunity.currentPosition <= 15
  ) {
    return "Strengthen evidence, internal authority and the next-step path for the queries already ranking on page one or two.";
  }
  return "Audit query ownership, answer completeness and the commercial handoff; make one measurable change rather than a broad rewrite.";
}

export function prioritiseSearchOpportunity(
  row: RollingPageOpportunity,
  context: OpportunityPageContext,
  asOf: string,
): PrioritisedSearchOpportunity {
  const asOfTimestamp = parseCalendarDate(asOf);
  const daysSinceChange = context.lastChangedAt
    ? Math.max(
        0,
        Math.floor(
          (asOfTimestamp - parseCalendarDate(context.lastChangedAt)) / DAY_MS,
        ),
      )
    : null;
  const state = stateForAge(daysSinceChange);
  const currentCtrResolved = resolveCtr(row);
  const expectedCtr =
    row.currentPosition === undefined
      ? null
      : expectedCtrForPosition(row.currentPosition);
  const clickChangePercent = percentageChange(
    row.previousClicks,
    row.currentClicks,
  );
  const impressionChangePercent = percentageChange(
    row.previousImpressions,
    row.currentImpressions,
  );
  const commercialRelevance = clamp(
    context.commercialRelevance ?? inferCommercialRelevance(row.path),
    0,
    15,
  );

  const demandPoints = clamp(
    Math.log10(row.currentImpressions + 1) * 7.5,
    0,
    30,
  );
  const clickLossPoints =
    clickChangePercent === null ? 0 : clamp(-clickChangePercent * 30, 0, 20);
  const impressionLossPoints =
    impressionChangePercent === null
      ? 0
      : clamp(-impressionChangePercent * 20, 0, 10);
  const ctrGapPoints =
    expectedCtr === null || expectedCtr === 0
      ? 0
      : clamp(((expectedCtr - currentCtrResolved) / expectedCtr) * 15, 0, 15);
  const rankingPoints = positionPoints(row.currentPosition);

  const score = round(
    demandPoints +
      clickLossPoints +
      impressionLossPoints +
      ctrGapPoints +
      rankingPoints +
      commercialRelevance,
  );
  const scoreReasons = [
    `${round(demandPoints)} demand`,
    `${round(clickLossPoints)} click loss`,
    `${round(impressionLossPoints)} impression loss`,
    `${round(ctrGapPoints)} CTR gap`,
    `${round(rankingPoints)} ranking band`,
    `${round(commercialRelevance)} commercial relevance`,
  ];

  const opportunity: PrioritisedSearchOpportunity = {
    ...row,
    sourceFile: context.sourceFile,
    lastChangedAt: context.lastChangedAt,
    daysSinceChange,
    protectedUntil: context.lastChangedAt
      ? addCalendarDays(context.lastChangedAt, MEASURE_DAYS)
      : null,
    state,
    score,
    commercialRelevance,
    expectedCtr,
    currentCtrResolved,
    clickChangePercent,
    impressionChangePercent,
    recommendation: "",
    scoreReasons,
  };

  opportunity.recommendation = recommendationFor(opportunity);
  return opportunity;
}

const STATE_ORDER: Record<OpportunityState, number> = {
  act: 0,
  measure: 1,
  hold: 2,
};

export function prioritiseSearchOpportunities(
  rows: RollingPageOpportunity[],
  contexts: Map<string, OpportunityPageContext>,
  asOf: string,
): PrioritisedSearchOpportunity[] {
  return rows
    .map((row) =>
      prioritiseSearchOpportunity(
        row,
        contexts.get(row.path) ?? {
          sourceFile: null,
          lastChangedAt: null,
        },
        asOf,
      ),
    )
    .sort(
      (left, right) =>
        STATE_ORDER[left.state] - STATE_ORDER[right.state] ||
        right.score - left.score ||
        left.path.localeCompare(right.path),
    );
}

function percent(value: number | null): string {
  return value === null ? "new" : `${round(value * 100)}%`;
}

function escapeCell(value: string): string {
  return value.replaceAll("|", "\\|").replaceAll("\n", " ");
}

export function renderSearchOpportunityReport(input: {
  property: string;
  capturedAt: string;
  dataThrough: string;
  asOf: string;
  opportunities: PrioritisedSearchOpportunity[];
  queryInvestigations?: Array<{
    query: string;
    currentClicks: number;
    currentImpressions: number;
    previousClicks: number;
    previousImpressions: number;
  }>;
}): string {
  const counts = {
    act: input.opportunities.filter((row) => row.state === "act").length,
    measure: input.opportunities.filter((row) => row.state === "measure")
      .length,
    hold: input.opportunities.filter((row) => row.state === "hold").length,
  };
  const lines = [
    "# Weekly search opportunity queue",
    "",
    `Property: \`${input.property}\`  `,
    `Search data through: **${input.dataThrough}** (captured ${input.capturedAt})  `,
    `Queue evaluated: **${input.asOf}**`,
    "",
    `**Queue:** ${counts.act} act now · ${counts.measure} measure · ${counts.hold} protected`,
    "",
    "The score is deterministic and combines demand, click and impression loss, CTR opportunity, ranking band and commercial relevance. Freshness is a gate: pages are protected for seven days, measured through day 13 and become eligible on day 14.",
    "",
  ];

  for (const state of ["act", "measure", "hold"] as const) {
    const labels: Record<OpportunityState, string> = {
      act: "Act now",
      measure: "Measure before changing",
      hold: "Protected — do not rewrite",
    };
    const rows = input.opportunities.filter((row) => row.state === state);
    lines.push(`## ${labels[state]}`, "");
    if (rows.length === 0) {
      lines.push("No pages in this state.", "");
      continue;
    }
    lines.push(
      "| Page | Score | Click change | Impression change | Last change | Recommendation |",
      "| --- | ---: | ---: | ---: | --- | --- |",
      ...rows.map(
        (row) =>
          `| \`${row.path}\` | ${row.score} | ${percent(row.clickChangePercent)} | ${percent(row.impressionChangePercent)} | ${row.lastChangedAt ?? "unknown"} | ${escapeCell(row.recommendation)} |`,
      ),
      "",
    );
  }

  const investigations = input.queryInvestigations ?? [];
  lines.push("## Query investigations", "");
  if (investigations.length === 0) {
    lines.push("No unmapped query investigations supplied.", "");
  } else {
    lines.push(
      "These queries are diagnostic leads, not automatic rewrite instructions. Confirm the intended owner and visible competing URLs in Search Console first.",
      "",
      "| Query | Clicks | Impressions | Click change | Impression change |",
      "| --- | ---: | ---: | ---: | ---: |",
      ...investigations.map(
        (row) =>
          `| ${escapeCell(row.query)} | ${row.currentClicks} | ${row.currentImpressions} | ${percent(percentageChange(row.previousClicks, row.currentClicks))} | ${percent(percentageChange(row.previousImpressions, row.currentImpressions))} |`,
      ),
      "",
    );
  }

  lines.push(
    "## Operating rule",
    "",
    "Work from the top eligible row. Make one bounded change, record its release date and move the page back into protection. A high score never overrides canonical ownership, medical evidence boundaries or a live measurement window.",
    "",
  );

  return lines.join("\n");
}
