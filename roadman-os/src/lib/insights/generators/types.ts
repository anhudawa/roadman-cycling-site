/**
 * T64 — Insight Generator Framework: shared types and contract.
 *
 * Every generator must implement InsightGenerator:
 *   run() → CandidateInsight[]
 *
 * Numbers in statements are ALWAYS SQL-computed and templated here —
 * an LLM never touches the figures.
 */

import type { InsightType, TrendConfidence } from '@/types/database'

/** A candidate insight ready to be inserted into the `insights` table. */
export interface CandidateInsight {
  type: InsightType
  statement: string
  topic_id: string | null
  commercial_category: string | null
  evidence: Record<string, unknown>
  confidence_score: number
  confidence: TrendConfidence
  valid_from: string | null
  valid_until: string | null
  sponsor_safe: boolean
}

/** Common interface every generator implements. */
export interface InsightGenerator {
  /** Human-readable name for logging. */
  name: string
  /** The insight_type this generator produces. */
  type: InsightType
  /** Run the generator. Returns zero or more candidate insights. */
  run(): Promise<CandidateInsight[]>
}

/** Confidence tier thresholds matching the SQL compute_seasonal_indices logic. */
export function confidenceTier(score: number): TrendConfidence {
  if (score >= 75) return 'established'
  if (score >= 50) return 'probable'
  if (score >= 25) return 'emerging'
  return 'noise'
}

/** ISO week number from a Date. */
export function isoWeek(d: Date): number {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))
  date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7))
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1))
  return Math.ceil(((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)
}

/** Approximate month label from ISO week. */
export function weekToMonth(w: number): string {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ]
  const idx = Math.min(11, Math.floor(((w - 1) / 52) * 12))
  return months[idx]
}
