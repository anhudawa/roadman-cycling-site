import type { DiagnosticDefinition } from "../framework/types";

/**
 * FTP Zones definition.
 *
 * The /tools/ftp-zones calculator is essentially a lookup — FTP in,
 * seven-zone table out. Its "diagnostic" value is the W/kg bucket,
 * which is what the paid report + coaching upsell key off.
 */
export const ftpZonesDefinition: DiagnosticDefinition = {
  toolSlug: "ftp_zones",
  version: 1,
  title: "FTP Zone Diagnostic",
  subtitle: "Know exactly where to train for every session",
  description:
    "Your FTP and body weight, converted into the 7-zone power table and a W/kg bucket — paired with a polarised week built around your numbers.",
  disclaimer:
    "Zone boundaries are the standard Coggan 7-zone model. A recent FTP test gives the most accurate zones — re-test every 8–12 weeks or after a block shift.",
  questions: [],
  rules: [],
  categories: [
    {
      key: "cat_4plus",
      label: "Cat 1/2 Power — 4.0 W/kg+",
      shortLabel: "4.0+ W/kg",
      explanation:
        "You're in the top band for amateur cycling. Gains from here are specificity — sharpening the edges — not raw volume.",
      nextSteps: [
        "Race-specific work: over-unders, race-duration efforts, tactical intervals.",
        "Polish your weakness — anaerobic capacity, repeat punches, or TT economy.",
        "Keep Z2 honest — grey-zone drift at this level eats freshness.",
      ],
      recommendedResource: {
        href: "/blog/how-to-improve-ftp-cycling",
        label: "Improving FTP when you're already strong",
      },
      crmTags: ["wkg-bucket-4-plus"],
      askSeedPrompt: "I'm 4+ W/kg and plateaued. What does a 12-week block look like from here?",
    },
    {
      key: "cat_3",
      label: "Cat 3 Power — 3.5–4.0 W/kg",
      shortLabel: "3.5–4.0 W/kg",
      explanation:
        "Strong amateur level. Biggest returns here come from a proper polarised plan — 80% Z2, two real hard sessions, and strength work.",
      nextSteps: [
        "Two quality days per week — one threshold, one VO2.",
        "Long Saturday Z2, non-negotiable.",
        "Strength twice a week — cyclists at this level usually leave watts on the table here.",
      ],
      recommendedResource: {
        href: "/blog/ftp-training-zones-cycling-complete-guide",
        label: "The Complete FTP Zone Guide",
      },
      crmTags: ["wkg-bucket-3-5-4"],
    },
    {
      key: "cat_4",
      label: "Cat 4 Power — 3.0–3.5 W/kg",
      shortLabel: "3.0–3.5 W/kg",
      explanation:
        "Solid base. The quickest gain from here is more Z2 volume plus disciplined threshold work — no grey-zone grinding.",
      nextSteps: [
        "Hit 6–8 hours a week with 80% in Z2.",
        "2×20 at threshold once a week.",
        "Fuel every ride over 60 minutes — under-fuelling is common at this level.",
      ],
      recommendedResource: {
        href: "/blog/zone-2-training-cycling-guide",
        label: "Zone 2 Training — the base you're missing",
      },
      crmTags: ["wkg-bucket-3-3-5"],
    },
    {
      key: "beginner",
      label: "Building — below 3.0 W/kg",
      shortLabel: "Under 3.0 W/kg",
      explanation:
        "Early-stage endurance. The wins are easy here — consistent weekly volume and honest zones. Don't skip the strength work.",
      nextSteps: [
        "4–6 hours a week, same days every week.",
        "One threshold session (2×20 or 3×15) per week.",
        "Two short strength sessions — 20 minutes each is enough.",
      ],
      recommendedResource: {
        href: "/blog/how-to-improve-ftp-cycling",
        label: "How to Improve Your FTP — the beginner's path",
      },
      crmTags: ["wkg-bucket-under-3"],
    },
  ],
  pickPrimary: (_scores, answers) => {
    const wkg = Number(answers.wkg ?? 0);
    const primary =
      wkg >= 4.0 ? "cat_4plus" : wkg >= 3.5 ? "cat_3" : wkg >= 3.0 ? "cat_4" : "beginner";
    return { primary, secondary: null };
  },
  ctas: {
    primary: { label: "Ask Roadman to build my week", href: "/ask" },
    coachingRules: [
      {
        when: { primaryCategory: "cat_4plus" },
        cta: {
          label: "Apply for Coaching",
          href: "/apply",
          copy: "Cat 1/2 riders need periodisation, not generic plans. Coaching builds around your calendar.",
        },
      },
    ],
  },
  reportSections: [
    { kind: "cover" },
    { kind: "summary" },
    { kind: "zones_plan" },
    { kind: "week_by_week" },
    { kind: "ask_roadman" },
    { kind: "community_invite" },
    { kind: "disclaimer" },
  ],
  paidReportProductSlug: "report_ftp",
  buildSummary: (_primary, _scores, answers) => {
    const ftp = Number(answers.ftp ?? 0);
    const wkg = Number(answers.wkg ?? 0);
    if (wkg > 0) return `FTP ${ftp}W · ${wkg.toFixed(2)} W/kg.`;
    return `FTP ${ftp}W · 7-zone power table.`;
  },
};
