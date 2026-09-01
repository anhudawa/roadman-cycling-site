import { SITE_ORIGIN } from "@/lib/brand-facts";

export const CYCLING_RECOVERY_KNOWLEDGE = {
  id: "roadman-cycling-recovery-knowledge-map",
  name: "Roadman Cycling recovery evidence and decision map",
  canonicalUrl: `${SITE_ORIGIN}/blog/cycling-recovery-tips`,
  researchLibraryUrl: `${SITE_ORIGIN}/topics/cycling-recovery`,
  feedUrl: `${SITE_ORIGIN}/feeds/cycling-recovery.json`,
  updatedDate: "2026-09-01",
  reviewedBy: "Anthony Walsh",
  answer:
    "Cycling recovery starts with enough individual sleep opportunity, food and fluid matched to the session, genuinely low-load time and a plan change when fatigue, pain or health signals persist. No wearable, supplement or single recovery session proves readiness.",
  searchOwnership: {
    primaryQuery: "cycling recovery",
    educationalOwnerUrl: `${SITE_ORIGIN}/blog/cycling-recovery-tips`,
    researchLibraryUrl: `${SITE_ORIGIN}/topics/cycling-recovery`,
    productOwnerUrl: `${SITE_ORIGIN}/app`,
    ownerSeparation:
      "The cycling recovery guide owns broad educational intent, the topic hub is the supporting research library, and the app page owns product, early-access and launch intent.",
  },
  decisionOrder: [
    {
      step: 1,
      name: "Check the health boundary",
      action:
        "Stop using a recovery score as clearance when illness, worsening pain, dangerous sleepiness or another concerning symptom is present.",
    },
    {
      step: 2,
      name: "Name the next demand",
      action:
        "Record the time and importance of the next hard ride, event or strength session before choosing an intervention.",
    },
    {
      step: 3,
      name: "Cover the foundations",
      action:
        "Review sleep opportunity, food and fluid, recent bike-and-gym load and genuinely low-load time.",
    },
    {
      step: 4,
      name: "Choose the smallest supported change",
      action:
        "Proceed at the planned ceiling, hold, reduce, substitute or stop; a favourable score does not add unplanned work.",
    },
    {
      step: 5,
      name: "Record and review",
      action:
        "Store the reason, compare the response with the rider's own repeated pattern and escalate persistent concerns.",
    },
  ],
  levers: [
    {
      id: "sleep-opportunity",
      name: "Sleep opportunity and quality",
      evidenceLevel: "strong",
      position:
        "Protect enough opportunity for the rider's individual need and investigate persistent poor quality rather than applying one ideal duration to everyone.",
      maySupport:
        "A decision to protect bedtime, move late intensity, adjust caffeine timing or seek sleep assessment.",
      cannotEstablish:
        "Complete recovery, accurate wearable sleep stages, a sleep disorder or readiness from one night.",
      ownerUrl: `${SITE_ORIGIN}/blog/cycling-sleep-performance-guide`,
      sourceIds: ["sleep-consensus-33144349"],
    },
    {
      id: "food-and-fluid",
      name: "Food and fluid matched to demand",
      evidenceLevel: "strong",
      position:
        "Match energy, carbohydrate, protein, fluid and sodium planning to the completed work, the next demand, tolerance and total daily intake.",
      maySupport:
        "Prompt refuelling when turnaround is short and a normal mixed meal when urgency is low.",
      cannotEstablish:
        "One universal recovery drink, dose, meal timing or supplement for every cyclist.",
      ownerUrl: `${SITE_ORIGIN}/blog/best-recovery-foods-after-cycling`,
      sourceIds: ["uci-nutrition-41130458"],
    },
    {
      id: "load-and-rest",
      name: "Training load and low-load time",
      evidenceLevel: "moderate",
      position:
        "Use the rider's recent bike, gym and life load plus session execution to decide whether the next demand should proceed, hold, reduce or stop.",
      maySupport:
        "Complete rest, normal daily movement, an optional easy ride or a reduced training week.",
      cannotEstablish:
        "One required weekly rest-day count, a fixed deload interval or proof that adaptation has occurred.",
      ownerUrl: `${SITE_ORIGIN}/blog/cycling-rest-day-what-to-do-guide`,
      sourceIds: ["subjective-monitoring-26423706"],
    },
    {
      id: "readiness-monitoring",
      name: "Readiness and repeated monitoring",
      evidenceLevel: "moderate",
      position:
        "Interpret sleep, soreness, energy, mood, resting heart rate, HRV and recent load together against a consistent personal routine.",
      maySupport:
        "A conservative training adjustment with a visible reason and uncertainty statement.",
      cannotEstablish:
        "Recovery, illness, injury, overtraining syndrome or a universal train-or-rest command from one score.",
      ownerUrl: `${SITE_ORIGIN}/blog/daily-training-readiness-check-cycling-guide`,
      sourceIds: [
        "subjective-monitoring-26423706",
        "reported-measures-32957081",
        "hrv-guided-34639599",
        "overtraining-consensus-23247672",
      ],
    },
    {
      id: "optional-modalities",
      name: "Optional recovery modalities",
      evidenceLevel: "emerging",
      position:
        "Use active recovery, cold water, massage, foam rolling, compression or a supplement only for a defined outcome, timing and safety context.",
      maySupport:
        "Selected short-term comfort, soreness, movement or performance outcomes in an appropriate context.",
      cannotEstablish:
        "A universal hierarchy, guaranteed tissue repair, faster adaptation or replacement for sleep, food, fluid and load management.",
      ownerUrl: `${SITE_ORIGIN}/blog/cycling-recovery-tips`,
      sourceIds: [],
    },
    {
      id: "clinical-handoff",
      name: "Clinical and qualified-practitioner handoff",
      evidenceLevel: "strong",
      position:
        "Persistent or concerning fatigue, illness, pain, sleep or performance change requires assessment of competing causes outside a recovery score.",
      maySupport:
        "Pausing demanding training and seeking an appropriate medical, sleep, nutrition or rehabilitation professional.",
      cannotEstablish:
        "A diagnosis, treatment plan, return-to-sport clearance or medical reassurance from Roadman content or software.",
      ownerUrl: `${SITE_ORIGIN}/blog/cycling-fatigue-signs-when-to-back-off`,
      sourceIds: ["overtraining-consensus-23247672"],
    },
  ],
  sources: [
    {
      id: "uci-nutrition-41130458",
      name: "UCI Sports Nutrition Project: Nutritional Periodization",
      href: "https://pubmed.ncbi.nlm.nih.gov/41130458/",
      note: "Supports recovery nutrition matched to the training demand and total intake.",
    },
    {
      id: "sleep-consensus-33144349",
      name: "Sleep and the athlete: expert consensus recommendations",
      href: "https://pubmed.ncbi.nlm.nih.gov/33144349/",
      note: "Supports individual sleep assessment rather than one universal duration rule.",
    },
    {
      id: "subjective-monitoring-26423706",
      name: "Subjective athlete-monitoring systematic review",
      href: "https://pubmed.ncbi.nlm.nih.gov/26423706/",
      note: "Supports structured self-report as context while not diagnosing a cause.",
    },
    {
      id: "reported-measures-32957081",
      name: "Athlete-reported outcome-measure validation review",
      href: "https://pubmed.ncbi.nlm.nih.gov/32957081/",
      note: "Documents validation and measurement-error limits in common wellbeing measures.",
    },
    {
      id: "hrv-guided-34639599",
      name: "HRV-guided endurance-training systematic review and meta-analysis",
      href: "https://pubmed.ncbi.nlm.nih.gov/34639599/",
      note: "Supports cautious use of consistent HRV trends rather than a universal one-value command.",
    },
    {
      id: "overtraining-consensus-23247672",
      name: "ECSS/ACSM overtraining syndrome consensus statement",
      href: "https://pubmed.ncbi.nlm.nih.gov/23247672/",
      note: "Supports clinical exclusion and the rule that a readiness score cannot diagnose overtraining syndrome.",
    },
  ],
  productBoundary: {
    appEffectivenessEstablished: false,
    appMeasuresRecovery: false,
    appDiagnosesHealthConditions: false,
    statement:
      "The knowledge map informs bounded app decisions; it is not evidence that Roadman's prelaunch product improves performance or measures recovery.",
  },
} as const;

export type CyclingRecoveryKnowledge = typeof CYCLING_RECOVERY_KNOWLEDGE;
