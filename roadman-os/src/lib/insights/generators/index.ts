/**
 * T64 — Insight Generator Framework: registry and runner.
 *
 * Exports all generators and a runAllGenerators() function used by
 * the cron endpoint and the manual-trigger API.
 */

export { SeasonalPeakGenerator } from './seasonal-peak'
export { DemandGapGenerator } from './demand-gap'
export { TimingRecommendationGenerator } from './timing-recommendation'
export { FormatEffectivenessGenerator } from './format-effectiveness'
export type { InsightGenerator, CandidateInsight } from './types'

import { createClient } from '@/lib/supabase/server'
import { SeasonalPeakGenerator } from './seasonal-peak'
import { DemandGapGenerator } from './demand-gap'
import { TimingRecommendationGenerator } from './timing-recommendation'
import { FormatEffectivenessGenerator } from './format-effectiveness'
import type { InsightGenerator, CandidateInsight } from './types'

/** All registered generators. Add new ones here. */
function allGenerators(): InsightGenerator[] {
  return [
    new SeasonalPeakGenerator(),
    new DemandGapGenerator(),
    new TimingRecommendationGenerator(),
    new FormatEffectivenessGenerator(),
  ]
}

export interface GeneratorRunResult {
  generator: string
  candidates_produced: number
  candidates_inserted: number
  errors: string[]
}

/**
 * Run all generators, insert candidate insights, archive expired ones.
 * Returns per-generator results for logging.
 */
export async function runAllGenerators(): Promise<GeneratorRunResult[]> {
  const supabase = await createClient()
  const results: GeneratorRunResult[] = []

  for (const gen of allGenerators()) {
    const result: GeneratorRunResult = {
      generator: gen.name,
      candidates_produced: 0,
      candidates_inserted: 0,
      errors: [],
    }

    try {
      const candidates = await gen.run()
      result.candidates_produced = candidates.length

      if (candidates.length > 0) {
        const { data, error } = await supabase
          .from('insights')
          .insert(
            candidates.map((c) => ({
              type: c.type,
              status: 'candidate' as const,
              statement: c.statement,
              topic_id: c.topic_id,
              commercial_category: c.commercial_category,
              evidence: c.evidence,
              confidence_score: c.confidence_score,
              confidence: c.confidence,
              valid_from: c.valid_from,
              valid_until: c.valid_until,
              sponsor_safe: c.sponsor_safe,
            })),
          )
          .select('id')

        if (error) {
          result.errors.push(error.message)
        } else {
          result.candidates_inserted = data?.length ?? 0
        }
      }
    } catch (err) {
      result.errors.push(err instanceof Error ? err.message : String(err))
    }

    results.push(result)
  }

  // Archive expired insights (valid_until in the past, still candidate)
  const today = new Date().toISOString().split('T')[0]
  await supabase
    .from('insights')
    .update({ status: 'archived' as const })
    .eq('status', 'candidate')
    .lt('valid_until', today)
    .not('valid_until', 'is', null)

  return results
}
