import type { DiagnosticDefinition } from "../framework/types";

/**
 * Plateau Diagnostic $— framework adapter.
 *
 * The Plateau scoring logic already lives in src/lib/diagnostic/ and is
 * hit directly by /api/diagnostic/submit. This definition is a thin
 * mirror so admin tooling + the paid-report generator can reason about
 * Plateau the same way they reason about Fuelling and FTP.
 *
 * We keep the existing flow intact $— `rules`/`pickPrimary` here delegate
 * to the legacy scorer via a single rule that imports it lazily.
 */
export const plateauDefinition: DiagnosticDefinition = {
  toolSlug: "plateau",
  version: 2,
  title: "Plateau Diagnostic",
  subtitle: "Find the one thing holding back your fitness",
  description:
    "Twelve questions, one honest answer to the hardest question in amateur cycling: why is progress stalling, and what do I do on Monday.",
  disclaimer:
    "Educational, not medical advice. If you have symptoms you're worried about, speak to a sports-medicine doctor. This report is no substitute for tests, blood work, or a conversation with your coach.",
  questions: [],
  rules: [],
  categories: [
    {
      key: "underRecovered",
      label: "Under-Recovered",
      shortLabel: "Recovery Debt",
      explanation:
        "Your inputs point at accumulated training stress you aren't absorbing. Fatigue is outrunning adaptation $— more training won't fix this. Recovery will.",
      nextSteps: [
        "Take 5$–7 easy days. Zone 1, nothing over 75% of FTP.",
        "Protect sleep: 8+ hours, same bedtime, dark room.",
        "Re-test FTP once RPE drops two points at the same wattage.",
      ],
      recommendedResource: {
        href: "/blog/overtraining-vs-overreaching-cyclists",
        label: "Overtraining vs Overreaching $— the 10 warning signs",
      },
      riskAdvice: {
        hr_suppressed: "HR suppressed at effort $— treat as functional overreach until proven otherwise. Pull back a week.",
        sleep_broken: "Sleep is broken. Nothing else moves until this does.",
      },
      crmTags: ["limiter_recovery_debt"],
      askSeedPrompt: "My plateau diagnostic says I'm under-recovered. Where do I start?",
    },
    {
      key: "polarisation",
      label: "Intensity Distribution Off",
      shortLabel: "Polarisation",
      explanation:
        "Too many sessions in the 75$–85% grey zone. Seiler's work is clear: most endurance athletes need more Z2 and more hard days, not more moderate days.",
      nextSteps: [
        "Cap 80% of volume at Z1/Z2 (under 75% FTP).",
        "Two genuinely hard sessions: one threshold, one VO2.",
        "Stop grinding tempo on the other days.",
      ],
      recommendedResource: {
        href: "/blog/ftp-training-zones-cycling-complete-guide",
        label: "The Complete FTP Zone Training Guide",
      },
      crmTags: ["limiter_intensity_distribution"],
      askSeedPrompt: "My plateau diagnostic says my intensity is in the grey zone. Show me a week that fixes it.",
    },
    {
      key: "strengthGap",
      label: "Strength / Durability Gap",
      shortLabel: "Strength Gap",
      explanation:
        "The bike work looks fine $— the legs aren't strong enough to express it late in rides. Durability and power come from off-the-bike work.",
      nextSteps: [
        "Two 30-min strength sessions a week: squat / deadlift / single-leg.",
        "Prioritise late-ride quality: one long ride with a quality block at the end.",
        "Core + hip work twice a week, 10 minutes is plenty.",
      ],
      recommendedResource: {
        href: "/blog/strength-training-for-cyclists-complete-guide",
        label: "Strength Training for Cyclists $— the full guide",
      },
      crmTags: ["limiter_strength_gap"],
      askSeedPrompt: "My plateau diagnostic flags a strength gap. What do I add, and what do I cut?",
    },
    {
      key: "fuelingDeficit",
      label: "Fuelling Deficit",
      shortLabel: "Fuel Gap",
      explanation:
        "You're under-eating for the work you're asking the body to do. This is the most-missed lever in masters cycling $— nothing else works on an empty tank.",
      nextSteps: [
        "Hit 60$–90g carbs/hour on any ride over 90 minutes.",
        "Add a carb snack within 30 minutes of finishing.",
        "Check body composition trend $— if losing weight and losing performance, eat more.",
      ],
      recommendedResource: {
        href: "/blog/cycling-in-ride-nutrition-guide",
        label: "In-Ride Nutrition $— the 60/90/120 rule",
      },
      riskAdvice: {
        low_energy_availability: "Low energy availability is a red flag. See a sports dietitian $— this is not a DIY fix.",
      },
      crmTags: ["limiter_fuelling_deficit"],
      askSeedPrompt: "My plateau diagnostic flags a fuelling deficit. Give me a one-week fuelling fix.",
    },
  ],
  pickPrimary: (scores) => {
    const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
    const [first, second] = sorted;
    return {
      primary: first?.[0] ?? "underRecovered",
      secondary: second && second[1] > 0 && first && second[1] < first[1] ? second[0] : null,
    };
  },
  ctas: {
    primary: { label: "Ask Roadman about this", href: "/ask" },
    coachingRules: [
      {
        when: { primaryCategory: "underRecovered" },
        cta: {
          label: "Apply for Coaching",
          href: "/apply",
          copy: "Under-recovered riders need a periodised plan, not more volume. Coaching gives you the structure.",
        },
      },
      {
        when: { primaryCategory: "polarisation" },
        cta: {
          label: "Apply for Coaching",
          href: "/apply",
          copy: "Coaching sets the intensity distribution for you $— no more grey-zone weeks.",
        },
      },
    ],
  },
  reportSections: [
    { kind: "cover" },
    { kind: "summary" },
    { kind: "primary_limiter" },
    { kind: "secondary_limiter" },
    { kind: "next_12_weeks" },
    { kind: "week_by_week" },
    { kind: "recovery_plan", onlyForCategory: ["underRecovered"] },
    { kind: "zones_plan", onlyForCategory: ["polarisation"] },
    { kind: "fuelling_plan", onlyForCategory: ["fuelingDeficit"] },
    { kind: "risk_addendum" },
    { kind: "ask_roadman" },
    { kind: "community_invite" },
    { kind: "disclaimer" },
  ],
  paidReportProductSlug: "report_plateau",
  buildSummary: (primary) => {
    const map: Record<string, string> = {
      underRecovered: "Primary limiter: recovery debt.",
      polarisation: "Primary limiter: intensity distribution off.",
      strengthGap: "Primary limiter: strength / durability gap.",
      fuelingDeficit: "Primary limiter: fuelling deficit.",
    };
    return map[primary] ?? "Plateau diagnostic complete.";
  },
};
