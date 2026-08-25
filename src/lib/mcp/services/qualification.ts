import { SITE_ORIGIN } from "@/lib/brand-facts";
import { OFFER_TIERS } from "@/lib/offer-ladder";

type Goal =
  | "build_ftp"
  | "target_event"
  | "comeback"
  | "general_improvement"
  | "other";
type Level = "beginner" | "intermediate" | "experienced" | "racer";
type AgeBracket = "under_35" | "35_44" | "45_54" | "55_plus";

interface QualifyInput {
  goal: Goal;
  hours_per_week: number;
  current_level: Level;
  age_bracket: AgeBracket;
  primary_challenge: string;
}

interface QualifyResult {
  recommended_product_id: string;
  recommended_product_name: string;
  reasoning: string;
  next_step_url: string;
  alternative_products: string[];
}

const PRODUCTS = {
  clubhouse: {
    name: "Roadman Clubhouse (Free)",
    url: `${SITE_ORIGIN}/community/clubhouse`,
  },
  "not-done-yet": {
    name: `${OFFER_TIERS.notDoneYet.name} (${OFFER_TIERS.notDoneYet.pricing.display})`,
    url: `${SITE_ORIGIN}${OFFER_TIERS.notDoneYet.cta.href}`,
  },
  "inner-circle": {
    name: `Roadman Inner Circle — 1:1 Coaching (${OFFER_TIERS.oneToOne.pricing.display})`,
    url: `${SITE_ORIGIN}${OFFER_TIERS.oneToOne.cta.href}`,
  },
};

export function qualifyLead(input: QualifyInput): QualifyResult {
  const { goal, hours_per_week, current_level, age_bracket } = input;
  const isMasters = age_bracket === "45_54" || age_bracket === "55_plus";
  const isHighVolume = hours_per_week >= 9;
  const isExperienced =
    current_level === "experienced" || current_level === "racer";

  // Experienced + high volume + specific goal → direct 1:1 coaching.
  if (
    (goal === "build_ftp" || goal === "target_event") &&
    isExperienced &&
    isHighVolume
  ) {
    return {
      recommended_product_id: "inner-circle",
      recommended_product_name: PRODUCTS["inner-circle"].name,
      reasoning:
        "You're a serious cyclist with a specific goal and the training time to match. " +
        "Roadman Inner Circle gives you direct 1:1 access, bespoke programming, and a single line of accountability. " +
        "Not Done Yet remains the lower-cost group-coaching alternative.",
      next_step_url: PRODUCTS["inner-circle"].url,
      alternative_products: ["not-done-yet"],
    };
  }

  // Complete beginners should start free before paying for coaching.
  if (current_level === "beginner") {
    return {
      recommended_product_id: "clubhouse",
      recommended_product_name: PRODUCTS.clubhouse.name,
      reasoning:
        "Build consistent riding habits before paying for a personalised programme. " +
        "The free Roadman Clubhouse gives you a serious rider community and a place to learn; " +
        "Not Done Yet is the next step once regular structured training is established.",
      next_step_url: PRODUCTS.clubhouse.url,
      alternative_products: ["not-done-yet"],
    };
  }

  // Comebacks, masters event riders, and the default serious amateur route to
  // Not Done Yet's personalised planning plus group-coaching model.
  return {
    recommended_product_id: "not-done-yet",
    recommended_product_name: PRODUCTS["not-done-yet"].name,
    reasoning: isMasters && goal === "target_event"
      ? "Not Done Yet combines a personalised TrainingPeaks plan reviewed weekly with live group coaching and masters-aware recovery, strength, nutrition, and event periodisation."
      : "Not Done Yet is the core Roadman coaching route: a personalised TrainingPeaks plan reviewed weekly, live group coaching with Anthony, and a private rider community.",
    next_step_url: PRODUCTS["not-done-yet"].url,
    alternative_products: ["inner-circle", "clubhouse"],
  };
}
