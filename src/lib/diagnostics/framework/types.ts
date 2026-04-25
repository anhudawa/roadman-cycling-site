/**
 * Reusable diagnostic framework.
 *
 * Each calculator/diagnostic on the site is expressed as a single
 * `DiagnosticDefinition` — questions, scoring rules, result categories,
 * recommendations, CTAs and report sections in one config object.
 *
 * The engine in ./engine.ts takes a definition + an answer set and
 * emits a deterministic ScoredResult. That result is what the free
 * result page renders, what gets saved to `diagnostic_results`, and
 * what the paid-report generator reads to produce the PDF.
 *
 * Framework-driven tools get:
 *   · deterministic scoring (no LLM in the hot path)
 *   · automatic admin-analytics keys (primary category, risk flags)
 *   · paid-report compatibility for free
 *   · config versioning via diagnostic_definitions
 *
 * Existing tools (Plateau already-scored in src/lib/diagnostic) register
 * a slim adapter so they participate in the framework without forcing
 * a rewrite.
 */

import type { ToolSlug } from "@/lib/tool-results/types";

// ─────────────────────────────────────────────────────────────
// Questions
// ─────────────────────────────────────────────────────────────

export type QuestionKind =
  | "single_choice"
  | "multi_choice"
  | "number"
  | "slider"
  | "boolean"
  | "text";

export interface QuestionOption {
  value: string;
  label: string;
  hint?: string;
  /** Marks an answer as risk-flagged (e.g. red-zone RPE, very-low carbs). */
  riskFlag?: string;
  /** Contribution to each score bucket. */
  weights?: Record<string, number>;
}

export interface Question {
  id: string;
  kind: QuestionKind;
  prompt: string;
  helper?: string;
  required?: boolean;
  /** For single/multi_choice. */
  options?: QuestionOption[];
  /** For number/slider. */
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  /** Which rider_profile field this answer maps to (if any). */
  riderProfileField?:
    | "firstName"
    | "ageRange"
    | "discipline"
    | "weeklyTrainingHours"
    | "currentFtp"
    | "mainGoal"
    | "biggestLimiter"
    | "coachingInterest"
    | "selfCoachedOrCoached"
    | "targetEvent"
    | "targetEventDate"
    | "currentWeight"
    | "weightUnit"
    | "trainingTool"
    | "coachingStatus"
    | "coachingInterestLevel";
  /** If the answer equals any of these values, show ONLY this follow-up. */
  branches?: Array<{ when: string | number | boolean; showQuestionIds: string[] }>;
}

// ─────────────────────────────────────────────────────────────
// Scoring rules — pure functions on the answer set.
// ─────────────────────────────────────────────────────────────

export type AnswerValue = string | number | boolean | string[];
export type AnswerSet = Record<string, AnswerValue>;

/**
 * Returns a per-bucket score delta and any risk flags emitted by
 * this rule. The engine sums deltas across all rules and emits the
 * union of risk flags.
 */
export interface ScoringRule {
  id: string;
  description?: string;
  apply: (answers: AnswerSet) => {
    deltas?: Record<string, number>;
    riskFlags?: string[];
  };
}

// ─────────────────────────────────────────────────────────────
// Result categories + recommendations
// ─────────────────────────────────────────────────────────────

export interface ResultCategory {
  key: string;
  label: string;
  shortLabel?: string;
  /** One-paragraph plain-English explanation shown on the free page. */
  explanation: string;
  /** Top 3 next steps the rider can act on immediately. */
  nextSteps: string[];
  /** Linked on-site resource (blog post / hub) — exactly one. */
  recommendedResource: { href: string; label: string };
  /** Optional risk copy shown when a risk flag is present. */
  riskAdvice?: Record<string, string>;
  /** Tags pushed to CRM + Beehiiv on completion. */
  crmTags?: string[];
  /** Which Ask Roadman prompt seed to use when the rider clicks handoff. */
  askSeedPrompt?: string;
}

// ─────────────────────────────────────────────────────────────
// CTA logic
// ─────────────────────────────────────────────────────────────

export interface CtaConfig {
  /** Always shown. */
  primary: { label: string; href: string };
  /** Shown only when the matching risk flag is present. */
  perRiskFlag?: Record<string, { label: string; href: string }>;
  /** Coaching upsell rules — evaluated in order, first match wins. */
  coachingRules?: Array<{
    when: { primaryCategory?: string; riskFlag?: string; minScore?: Record<string, number> };
    cta: { label: string; href: string; copy: string };
  }>;
}

// ─────────────────────────────────────────────────────────────
// Report sections (paid PDF templates read this)
// ─────────────────────────────────────────────────────────────

export type ReportSectionKind =
  | "cover"
  | "summary"
  | "primary_limiter"
  | "secondary_limiter"
  | "next_12_weeks"
  | "week_by_week"
  | "fuelling_plan"
  | "zones_plan"
  | "recovery_plan"
  | "risk_addendum"
  | "ask_roadman"
  | "community_invite"
  | "disclaimer"
  // Value-stack additions
  | "world_tour_comparison"
  | "session_protocols"
  | "ranked_actions"
  | "body_composition"
  | "meal_plan_7day"
  | "three_window_fuelling"
  | "ftp_5reasons"
  | "ftp_6week_plan"
  | "ftp_trajectory"
  | "roadmap_90day"
  | "not_done_yet_cta";

export interface ReportSection {
  kind: ReportSectionKind;
  /** Applies only when the matching category is the primary/secondary result. */
  onlyForCategory?: string[];
  /** Optional section title override. */
  title?: string;
  /** Markdown-ish copy template — `{token}` substitutions resolved by generator. */
  body?: string;
}

// ─────────────────────────────────────────────────────────────
// Full definition
// ─────────────────────────────────────────────────────────────

export interface DiagnosticDefinition {
  /** Must be a registered ToolSlug — ensures the save-pipeline accepts it. */
  toolSlug: ToolSlug;
  version: number;
  title: string;
  subtitle: string;
  description: string;
  disclaimer: string;
  questions: Question[];
  rules: ScoringRule[];
  categories: ResultCategory[];
  /** How we pick the primary category after rules run. */
  pickPrimary: (scores: Record<string, number>, answers: AnswerSet) => {
    primary: string;
    secondary: string | null;
  };
  ctas: CtaConfig;
  reportSections: ReportSection[];
  /** Product slug unlocked by this tool's upsell card. */
  paidReportProductSlug?: string;
  /** Custom one-liner summary for history lists + emails. */
  buildSummary: (primary: string, scores: Record<string, number>, answers: AnswerSet) => string;
}

// ─────────────────────────────────────────────────────────────
// Scoring output
// ─────────────────────────────────────────────────────────────

export interface ScoredResult {
  toolSlug: ToolSlug;
  definitionVersion: number;
  primaryCategory: string;
  secondaryCategory: string | null;
  scores: Record<string, number>;
  riskFlags: string[];
  recommendations: Array<{ title: string; body: string; href?: string }>;
  resourceSlug: string | null;
  summary: string;
  crmTags: string[];
}
