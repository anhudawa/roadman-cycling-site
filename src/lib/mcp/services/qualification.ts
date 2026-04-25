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
  "ndy-standard": {
    name: "Not Done Yet $€” Standard ($15/mo)",
    url: "https://roadmancycling.com/community/not-done-yet",
  },
  "ndy-premium": {
    name: "Not Done Yet $€” Premium ($195/mo)",
    url: "https://roadmancycling.com/apply",
  },
  "ndy-vip": {
    name: "Not Done Yet $€” VIP ($1,950/yr)",
    url: "https://roadmancycling.com/apply",
  },
  "strength-training-course": {
    name: "Strength Training for Cyclists ($49.99)",
    url: "https://roadmancycling.com/strength-training",
  },
};

export function qualifyLead(input: QualifyInput): QualifyResult {
  const { goal, hours_per_week, current_level, age_bracket } = input;
  const isMasters = age_bracket === "45_54" || age_bracket === "55_plus";
  const isHighVolume = hours_per_week >= 9;
  const isExperienced =
    current_level === "experienced" || current_level === "racer";

  // Experienced + high volume + specific goal $†’ Premium
  if (
    (goal === "build_ftp" || goal === "target_event") &&
    isExperienced &&
    isHighVolume
  ) {
    return {
      recommended_product_id: "ndy-premium",
      recommended_product_name: PRODUCTS["ndy-premium"].name,
      reasoning:
        "You're a serious cyclist with a specific goal and the training time to match. " +
        "Premium gives you direct 1:1 access to Anthony plus the same framework World Tour coaches use $€” " +
        "not a generic plan, a personalised one. Given your experience level, you'll feel the difference quickly.",
      next_step_url: PRODUCTS["ndy-premium"].url,
      alternative_products: ["ndy-vip", "ndy-standard"],
    };
  }

  // Comeback / beginner $†’ Standard first
  if (goal === "comeback" || current_level === "beginner") {
    return {
      recommended_product_id: "ndy-standard",
      recommended_product_name: PRODUCTS["ndy-standard"].name,
      reasoning:
        "The comeback is the most important phase $€” structure and community matter more than intensity. " +
        "Standard gives you the training framework, live Q&As with Anthony, and a community that understands " +
        "exactly where you are. Most comeback riders upgrade to Premium once they've rebuilt consistency.",
      next_step_url: PRODUCTS["ndy-standard"].url,
      alternative_products: ["ndy-premium"],
    };
  }

  // Masters + event target $†’ Premium (physiology-specific coaching matters most)
  if (isMasters && goal === "target_event") {
    return {
      recommended_product_id: "ndy-premium",
      recommended_product_name: PRODUCTS["ndy-premium"].name,
      reasoning:
        "Masters cyclists preparing for an event need periodisation that accounts for longer recovery needs " +
        "and the specific physiology of the 45+ rider. Anthony has worked with hundreds of masters cyclists " +
        "and will build a plan that gets you to the start line fit and fresh.",
      next_step_url: PRODUCTS["ndy-premium"].url,
      alternative_products: ["ndy-standard"],
    };
  }

  // Default $†’ Standard
  return {
    recommended_product_id: "ndy-standard",
    recommended_product_name: PRODUCTS["ndy-standard"].name,
    reasoning:
      "Not Done Yet Standard is the right starting point $€” you get the training structure, live Q&As, " +
      "and community without over-committing. Most members upgrade to Premium 60-90 days in once they " +
      "see the results. Start there, then decide.",
    next_step_url: PRODUCTS["ndy-standard"].url,
    alternative_products: ["ndy-premium"],
  };
}
