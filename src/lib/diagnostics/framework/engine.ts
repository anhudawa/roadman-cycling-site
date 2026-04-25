import type {
  AnswerSet,
  DiagnosticDefinition,
  ScoredResult,
} from "./types";

/**
 * Deterministic evaluator. No LLM in the hot path — riders see their
 * result instantly, and admin can re-run the same inputs and get the
 * same output forever.
 */
export function scoreDiagnostic(
  def: DiagnosticDefinition,
  answers: AnswerSet,
): ScoredResult {
  // 1. Run every rule and sum score deltas.
  const scores: Record<string, number> = {};
  for (const cat of def.categories) scores[cat.key] = 0;
  const riskFlagSet = new Set<string>();

  for (const rule of def.rules) {
    const out = rule.apply(answers);
    if (out.deltas) {
      for (const [bucket, delta] of Object.entries(out.deltas)) {
        scores[bucket] = (scores[bucket] ?? 0) + delta;
      }
    }
    if (out.riskFlags) {
      for (const flag of out.riskFlags) riskFlagSet.add(flag);
    }
  }

  // 2. Emit risk flags from option-level `riskFlag` props too.
  for (const q of def.questions) {
    const answer = answers[q.id];
    if (!q.options || answer === undefined) continue;
    const selected = Array.isArray(answer) ? answer : [answer];
    for (const opt of q.options) {
      if (opt.riskFlag && selected.includes(opt.value)) {
        riskFlagSet.add(opt.riskFlag);
      }
      if (opt.weights && selected.includes(opt.value)) {
        for (const [bucket, weight] of Object.entries(opt.weights)) {
          scores[bucket] = (scores[bucket] ?? 0) + weight;
        }
      }
    }
  }

  // 3. Pick the winning category.
  const { primary, secondary } = def.pickPrimary(scores, answers);

  // 4. Build recommendations from the winning category.
  const primaryCat = def.categories.find((c) => c.key === primary);
  const recommendations: ScoredResult["recommendations"] = [];
  if (primaryCat) {
    for (const step of primaryCat.nextSteps) {
      recommendations.push({ title: step, body: step });
    }
    recommendations.push({
      title: primaryCat.recommendedResource.label,
      body: "Recommended deep-dive on this topic.",
      href: primaryCat.recommendedResource.href,
    });
    // Risk advice becomes additional recommendations.
    if (primaryCat.riskAdvice) {
      for (const flag of riskFlagSet) {
        const advice = primaryCat.riskAdvice[flag];
        if (advice) recommendations.push({ title: `Risk flag: ${flag}`, body: advice });
      }
    }
  }

  const summary = def.buildSummary(primary, scores, answers);

  const crmTags = [
    ...(primaryCat?.crmTags ?? []),
    `${def.toolSlug}-primary-${primary}`,
    ...(secondary ? [`${def.toolSlug}-secondary-${secondary}`] : []),
    ...Array.from(riskFlagSet).map((f) => `risk-${f}`),
  ];

  return {
    toolSlug: def.toolSlug,
    definitionVersion: def.version,
    primaryCategory: primary,
    secondaryCategory: secondary,
    scores,
    riskFlags: Array.from(riskFlagSet),
    recommendations,
    resourceSlug: primaryCat?.recommendedResource.href ?? null,
    summary,
    crmTags,
  };
}
