import { SITE_ORIGIN } from "@/lib/brand-facts";

export const ROADMAN_APP_EVIDENCE_REGISTER = {
  version: "prelaunch-0.1",
  status: "public-prelaunch-register",
  canonicalPath: "/app/evidence",
  canonicalUrl: `${SITE_ORIGIN}/app/evidence`,
  feedUrl: `${SITE_ORIGIN}/feeds/app-evidence.json`,
  updatedDate: "2026-09-01",
  reviewedBy: "Anthony Walsh",
  answer:
    "Roadman's cycling strength and recovery app has a published evidence rationale, decision methodology and testing protocol, but it does not yet have a public product-effectiveness result. No current Roadman claim says that the app improves cycling performance, measures recovery, prevents injury, diagnoses illness or provides medical clearance.",
  productEffectivenessEstablished: false,
  publicProductResultCount: 0,
  claims: [
    {
      id: "strength-rationale",
      question: "Can strength training support endurance cyclists?",
      status: "external-evidence-informs-rationale",
      statusLabel: "External evidence informs the rationale",
      currentEvidence:
        "A cyclist-specific systematic review and meta-analysis reports potential performance benefits from heavy strength training while grading the certainty as low and not establishing one universal protocol.",
      supports:
        "Building a bounded cyclist-specific strength feature and testing the exact implementation.",
      doesNotSupport:
        "That Roadman's app, programme structure or readiness adjustments improve performance.",
      nextEvidence:
        "Product-specific rule verification, use data and an appropriately designed outcome study.",
      sourceUrls: ["https://pubmed.ncbi.nlm.nih.gov/40632222/"],
    },
    {
      id: "decision-policy",
      question: "Are the app's training decisions specified and inspectable?",
      status: "specified-not-yet-verified-publicly",
      statusLabel: "Specified; no public verification result yet",
      currentEvidence:
        "Roadman has published a versioned four-stage decision policy, six invariant guardrails and input-by-input limits.",
      supports:
        "Auditing a future app build against a stable public specification.",
      doesNotSupport:
        "That the product always follows the policy or that the policy produces better outcomes.",
      nextEvidence:
        "A build-specific rule-verification report with scenarios, pass/fail counts and unresolved failures.",
      sourceUrls: [`${SITE_ORIGIN}/app/methodology`],
    },
    {
      id: "usability",
      question: "Can intended riders use and understand the app?",
      status: "no-public-product-result",
      statusLabel: "No public product result",
      currentEvidence: "No closed-beta usability result has been published.",
      supports: "No product-usability claim yet.",
      doesNotSupport:
        "Claims about ease of use, comprehension, adherence, engagement or rider satisfaction.",
      nextEvidence:
        "Report invited, activated and analysed denominators, task completion, comprehension, attrition and sampling limits.",
      sourceUrls: [`${SITE_ORIGIN}/app/testing#usability`],
    },
    {
      id: "decision-agreement",
      question: "Do qualified reviewers agree with app decisions?",
      status: "no-public-product-result",
      statusLabel: "No public product result",
      currentEvidence:
        "No coach-review agreement study or result has been published.",
      supports: "No reviewer-agreement claim yet.",
      doesNotSupport:
        "Claims that prescriptions are coach-equivalent, optimal or medically safe.",
      nextEvidence:
        "A pre-specified review sample with reviewer roles, agreement definition, raw counts, uncertainty and material disagreement cases.",
      sourceUrls: [`${SITE_ORIGIN}/app/testing#agreement`],
    },
    {
      id: "cycling-outcomes",
      question: "Does the app improve strength or cycling performance?",
      status: "no-public-product-result",
      statusLabel: "No public product result",
      currentEvidence:
        "No prospective Roadman product-outcome study has been published.",
      supports: "No product-effectiveness claim yet.",
      doesNotSupport:
        "Claims that the app increases FTP, power, speed, strength, durability or event performance.",
      nextEvidence:
        "A pre-specified prospective study and, for a causal claim, an appropriate comparator design with effect estimates and uncertainty.",
      sourceUrls: [`${SITE_ORIGIN}/app/testing#effectiveness`],
    },
    {
      id: "recovery-measurement",
      question: "Does the app measure or diagnose recovery?",
      status: "claim-not-made",
      statusLabel: "Claim not made",
      currentEvidence:
        "Sleep, energy, soreness, stress and recent training are treated as decision context, not a direct recovery measurement or diagnosis.",
      supports:
        "A conservative check that may hold, reduce, substitute or stop planned strength work.",
      doesNotSupport:
        "A validated recovery score, biological readiness measurement, illness diagnosis or universal train-or-rest threshold.",
      nextEvidence:
        "Any future measurement claim would require a separately specified construct, reference, validation population and error analysis.",
      sourceUrls: [
        "https://pubmed.ncbi.nlm.nih.gov/26423706/",
        "https://pubmed.ncbi.nlm.nih.gov/32957081/",
        "https://pubmed.ncbi.nlm.nih.gov/34639599/",
      ],
    },
    {
      id: "injury-medical",
      question: "Does the app prevent injury or provide medical clearance?",
      status: "claim-not-made",
      statusLabel: "Claim not made",
      currentEvidence:
        "Pain, concerning symptoms and illness concerns are exit conditions from automated training clearance.",
      supports:
        "Stopping or escalating when a rider's report is outside the product's training-decision boundary.",
      doesNotSupport:
        "Injury prevention, injury diagnosis, rehabilitation, medical advice or clearance to train.",
      nextEvidence:
        "These claims remain outside the stated intended use of the prelaunch product.",
      sourceUrls: [`${SITE_ORIGIN}/app/methodology`],
    },
  ],
  reportingQueue: [
    {
      id: "rule-verification",
      report: "Decision-rule verification record",
      status: "pending",
      scheduledDate: null,
      resultUrl: null,
      protocolUrl: `${SITE_ORIGIN}/app/testing#rules`,
    },
    {
      id: "beta-usability",
      report: "Closed-beta usability report",
      status: "pending",
      scheduledDate: null,
      resultUrl: null,
      protocolUrl: `${SITE_ORIGIN}/app/testing#usability`,
    },
    {
      id: "coach-agreement",
      report: "Coach-review agreement report",
      status: "pending",
      scheduledDate: null,
      resultUrl: null,
      protocolUrl: `${SITE_ORIGIN}/app/testing#agreement`,
    },
    {
      id: "prospective-pilot",
      report: "Prospective real-world pilot",
      status: "not-scheduled",
      scheduledDate: null,
      resultUrl: null,
      protocolUrl: `${SITE_ORIGIN}/app/testing#pilot`,
    },
    {
      id: "comparative-effectiveness",
      report: "Comparative effectiveness study",
      status: "not-scheduled",
      scheduledDate: null,
      resultUrl: null,
      protocolUrl: `${SITE_ORIGIN}/app/testing#effectiveness`,
    },
  ],
  sources: [
    {
      name: "Heavy strength training effects in endurance cyclists: systematic review and meta-analysis",
      href: "https://pubmed.ncbi.nlm.nih.gov/40632222/",
      publisher: "PubMed",
      note: "Informs the strength-training rationale; it is not evidence for Roadman's product.",
    },
    {
      name: "Subjective and objective athlete-monitoring systematic review",
      href: "https://pubmed.ncbi.nlm.nih.gov/26423706/",
      publisher: "PubMed",
      note: "Supports monitoring context while rejecting a one-measure recovery conclusion.",
    },
    {
      name: "Athlete-reported outcome-measure validation review",
      href: "https://pubmed.ncbi.nlm.nih.gov/32957081/",
      publisher: "PubMed",
      note: "Defines limitations around treating athlete wellbeing inputs as validated measurements.",
    },
    {
      name: "HRV-guided endurance-training systematic review and meta-analysis",
      href: "https://pubmed.ncbi.nlm.nih.gov/34639599/",
      publisher: "PubMed",
      note: "Informs cautious trend use; it does not validate Roadman's readiness decisions.",
    },
    {
      name: "Athlete sleep consensus recommendations",
      href: "https://pubmed.ncbi.nlm.nih.gov/33144349/",
      publisher: "PubMed",
      note: "Supports individual sleep context rather than one universal readiness threshold.",
    },
    {
      name: "ECSS/ACSM overtraining syndrome consensus statement",
      href: "https://pubmed.ncbi.nlm.nih.gov/23247672/",
      publisher: "PubMed",
      note: "Supports the boundary that an app score cannot diagnose overtraining syndrome.",
    },
  ],
} as const;

export type RoadmanAppEvidenceRegister = typeof ROADMAN_APP_EVIDENCE_REGISTER;
