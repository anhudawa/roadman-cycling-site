import type { DiagnosticDefinition } from "../framework/types";

/**
 * In-Ride Fuelling definition.
 *
 * The existing /tools/fuelling calculator already does the heavy
 * physiology — carb/hr, glucose:fructose split, sodium from sweat rate.
 * This definition exists so the outputs of that calculator can be
 * converted into a standard ScoredResult + saved diagnostic + paid
 * report, using the same machinery as Plateau and FTP.
 *
 * The rider profile extension fields (weight, discipline, etc.) get
 * captured by the standard completeToolResult pipeline; the buckets
 * below power the admin-analytics primary_category grouping.
 */
export const fuellingDefinition: DiagnosticDefinition = {
  toolSlug: "fuelling",
  version: 1,
  title: "In-Ride Fuelling Diagnostic",
  subtitle: "What to eat, when to eat it, how much to drink",
  description:
    "Your personalised carb, fluid, and sodium targets — session type × watts × weather, with gut-training realism built in.",
  disclaimer:
    "Guideline numbers based on Jeukendrup, Morton, and Romijn. Individual tolerance varies widely. Test intake on training rides before race day, and consult a sports dietitian if you have GI issues or nutrition-related medical conditions.",
  questions: [],
  rules: [],
  categories: [
    {
      key: "high_carb",
      label: "High-Carb Session",
      shortLabel: "High-Carb (90g+/hr)",
      explanation:
        "Your target is at the upper end — 90g+ carbs/hour. Single-source glucose saturates around 60g/hr, so dual-source fuel (glucose + fructose at 1:0.8) is essential.",
      nextSteps: [
        "Mix sources: two gel flavours + energy drink + real food (rice cakes, bars).",
        "Front-load: start within the first 15 minutes, every 15 minutes after.",
        "Gut-train progressively if 90g/hr is new — add 10g/hr per week.",
      ],
      recommendedResource: {
        href: "/blog/cycling-in-ride-nutrition-guide",
        label: "The In-Ride Nutrition Guide",
      },
      crmTags: ["fuelling-high-carb"],
      askSeedPrompt: "My fuelling diagnostic says I need 90+ g/hr carbs. How do I actually hit that in a race?",
    },
    {
      key: "mid_carb",
      label: "Mid-Carb Session",
      shortLabel: "Mid-Carb (60-89g/hr)",
      explanation:
        "Solid middle zone — 60–89g/hr. Dual-source still worth it above 60g/hr. Consistency matters more than perfection.",
      nextSteps: [
        "Set a 20-minute timer from the start and stick to it.",
        "Mix one gel / one chew / one solid every hour — reduces flavour fatigue.",
        "Test fuelling on any ride over 90 minutes so race day isn't the first time.",
      ],
      recommendedResource: {
        href: "/blog/cycling-energy-gels-guide",
        label: "Cycling Energy Gels — the full guide",
      },
      crmTags: ["fuelling-mid-carb"],
    },
    {
      key: "low_carb",
      label: "Low-Carb Session",
      shortLabel: "Low-Carb (<60g/hr)",
      explanation:
        "Session is short enough or easy enough that under 60g/hr works. Single-source is fine; the priority is steady drip rather than total volume.",
      nextSteps: [
        "Under 45 minutes you can ride on water + a carb mouth-rinse.",
        "Over 45 minutes, add a small snack every 20 minutes from minute 30.",
        "Use this as a base — increase intake 20–30% for warmer days.",
      ],
      recommendedResource: {
        href: "/blog/zone-2-training-cycling-guide",
        label: "Zone 2 Training — why easy rides still need fuel",
      },
      crmTags: ["fuelling-low-carb"],
    },
  ],
  pickPrimary: (_scores, answers) => {
    const rate = Number(answers.carbsPerHour ?? 0);
    const primary =
      rate >= 90 ? "high_carb" : rate >= 60 ? "mid_carb" : "low_carb";
    return { primary, secondary: null };
  },
  ctas: {
    primary: { label: "Ask Roadman to review my fuelling plan", href: "/ask" },
    perRiskFlag: {
      heat_hot: { label: "Read: Fuelling in the heat", href: "/blog/cycling-in-ride-nutrition-guide" },
    },
    coachingRules: [
      {
        when: { primaryCategory: "high_carb" },
        cta: {
          label: "Apply for Coaching",
          href: "/apply",
          copy: "Coaching periodises fuelling across your whole week — not just race day.",
        },
      },
    ],
  },
  reportSections: [
    { kind: "cover" },
    { kind: "summary" },
    { kind: "three_window_fuelling" },
    { kind: "fuelling_plan" },
    { kind: "body_composition" },
    { kind: "meal_plan_7day" },
    { kind: "ranked_actions" },
    { kind: "risk_addendum" },
    { kind: "ask_roadman" },
    { kind: "not_done_yet_cta" },
    { kind: "disclaimer" },
  ],
  paidReportProductSlug: "report_fuelling",
  buildSummary: (primary, _scores, answers) => {
    const rate = Number(answers.carbsPerHour ?? 0);
    const fluid = Number(answers.fluidPerHour ?? 0);
    const sodium = Number(answers.sodiumPerHour ?? 0);
    const label =
      primary === "high_carb"
        ? "High-carb"
        : primary === "mid_carb"
          ? "Mid-carb"
          : "Low-carb";
    return `${label}: ${rate}g carbs/hr, ${fluid}ml fluid/hr, ${sodium}mg sodium/hr.`;
  },
};
