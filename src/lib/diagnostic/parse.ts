import { AGE_BRACKETS, HOURS_BRACKETS, type Answers } from "./types";

/**
 * Request-body parser for the diagnostic submit endpoint. Strict $— we
 * refuse the request if any of the 12 scored questions is missing or
 * out of range. Returns null if invalid so the caller returns 400.
 */

const AGE_SET = new Set<string>(AGE_BRACKETS);
const HOURS_SET = new Set<string>(HOURS_BRACKETS);
const SCORED_KEYS = [
  "Q1",
  "Q2",
  "Q3",
  "Q4",
  "Q5",
  "Q6",
  "Q7",
  "Q8",
  "Q9",
  "Q10",
  "Q11",
  "Q12",
] as const;

function isScore(value: unknown): value is 0 | 1 | 2 | 3 {
  return value === 0 || value === 1 || value === 2 || value === 3;
}

export function parseAnswers(raw: unknown): Answers | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;

  const age = typeof r.age === "string" ? r.age : null;
  const hours = typeof r.hoursPerWeek === "string" ? r.hoursPerWeek : null;
  if (!age || !AGE_SET.has(age)) return null;
  if (!hours || !HOURS_SET.has(hours)) return null;

  let ftp: number | null = null;
  if (typeof r.ftp === "number" && r.ftp > 0 && r.ftp < 1000) ftp = Math.round(r.ftp);
  else if (typeof r.ftp === "string" && r.ftp.trim()) {
    const n = Number(r.ftp);
    if (Number.isFinite(n) && n > 0 && n < 1000) ftp = Math.round(n);
  }

  const goal =
    typeof r.goal === "string" && r.goal.trim() ? r.goal.trim().slice(0, 500) : null;

  const scores: Partial<Answers> = {};
  for (const key of SCORED_KEYS) {
    const v = r[key];
    if (!isScore(v)) return null;
    (scores as Record<string, number>)[key] = v;
  }

  const q13 =
    typeof r.Q13 === "string" && r.Q13.trim() ? r.Q13.trim().slice(0, 500) : null;

  return {
    age: age as Answers["age"],
    hoursPerWeek: hours as Answers["hoursPerWeek"],
    ftp,
    goal,
    Q1: scores.Q1!,
    Q2: scores.Q2!,
    Q3: scores.Q3!,
    Q4: scores.Q4!,
    Q5: scores.Q5!,
    Q6: scores.Q6!,
    Q7: scores.Q7!,
    Q8: scores.Q8!,
    Q9: scores.Q9!,
    Q10: scores.Q10!,
    Q11: scores.Q11!,
    Q12: scores.Q12!,
    Q13: q13,
  };
}

export interface ParsedUtm {
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmContent: string | null;
  utmTerm: string | null;
}

export function parseUtm(raw: unknown): ParsedUtm {
  const empty: ParsedUtm = {
    utmSource: null,
    utmMedium: null,
    utmCampaign: null,
    utmContent: null,
    utmTerm: null,
  };
  if (!raw || typeof raw !== "object") return empty;
  const r = raw as Record<string, unknown>;
  const pick = (k: string) => {
    const v = r[k];
    return typeof v === "string" && v.trim() ? v.trim().slice(0, 100) : null;
  };
  return {
    utmSource: pick("source"),
    utmMedium: pick("medium"),
    utmCampaign: pick("campaign"),
    utmContent: pick("content"),
    utmTerm: pick("term"),
  };
}
