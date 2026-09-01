import { SITE_ORIGIN } from "@/lib/brand-facts";

export const ROADMAN_APP_DECISION_POLICY = {
  version: "prelaunch-0.1",
  status: "public-prelaunch-draft",
  canonicalPath: "/app/methodology",
  canonicalUrl: `${SITE_ORIGIN}/app/methodology`,
  updatedDate: "2026-09-01",
  reviewedBy: "Anthony Walsh",
  answer:
    "Roadman's app starts with the cycling week the rider already intends to follow, places a 30, 45 or 60-minute strength session around protected key rides, then uses a short same-day check to hold or reduce working-set volume when context is unfavourable. A favourable score never adds work, no score diagnoses recovery or illness, and every material change must carry a plain-language reason.",
  stages: [
    {
      id: "map",
      title: "Map the existing week",
      inputs:
        "Planned rides, priority days, available gym time, equipment, strength experience and movement constraints.",
      output:
        "A strength-session length and position that does not silently replace the external cycling plan.",
    },
    {
      id: "gate",
      title: "Apply the same-day guardrail",
      inputs:
        "Sleep opportunity and quality, energy, soreness, life stress, recent bike and gym work, plus rider-reported symptoms or pain.",
      output:
        "Proceed at the planned ceiling, hold progression, reduce working-set volume, substitute conservatively, or stop and reassess.",
    },
    {
      id: "execute",
      title: "Record the actual work",
      inputs:
        "Exercise, load, repetitions, sets, target reps in reserve, joint comfort and completion.",
      output:
        "A reproducible session record; the app does not reward extra work merely because the day feels good.",
    },
    {
      id: "progress",
      title: "Set the next exposure",
      inputs:
        "Previous performance, completed cycling context, soreness, joint comfort and whether priority riding remained productive.",
      output:
        "A versioned progression decision with the smallest supported change and a visible reason.",
    },
  ],
  invariantRules: [
    "A favourable readiness result cannot raise the planned training ceiling or add unplanned sets, load or intervals.",
    "Acute illness concerns, meaningful movement-altering pain and concerning symptoms sit outside an automated training clearance.",
    "The app may hold or reduce strength demand; it does not silently rewrite an external cycling plan.",
    "One unusual HRV, resting-heart-rate, sleep or soreness value cannot diagnose under-recovery, overtraining syndrome, illness or injury.",
    "Every material prescription change must store a versioned rule identifier and a plain-language reason.",
    "When several interpretations are possible, the system chooses the smallest supported change and exposes uncertainty.",
  ],
  inputBoundaries: [
    {
      input: "Sleep",
      maySupport: "Context on recent sleep opportunity and perceived quality.",
      cannotEstablish: "Complete recovery, sleep stages or a sleep disorder.",
    },
    {
      input: "Energy, mood and life stress",
      maySupport: "A repeatable subjective pattern that can be compared with the rider's baseline.",
      cannotEstablish: "The cause of fatigue or a mental-health diagnosis.",
    },
    {
      input: "Soreness and joint comfort",
      maySupport: "Whether familiar strength volume or an exercise choice deserves caution.",
      cannotEstablish: "Tissue damage, injury diagnosis or rehabilitation clearance.",
    },
    {
      input: "Resting heart rate or HRV",
      maySupport: "A trend collected under a consistent personal routine.",
      cannotEstablish: "A universal train-or-rest threshold from one value.",
    },
    {
      input: "Recent bike and gym load",
      maySupport: "Placement conflicts, training density and likely competing demands.",
      cannotEstablish: "That adaptation has occurred or that one load metric captures all fatigue.",
    },
  ],
  sources: [
    {
      name: "Heavy strength training effects in endurance cyclists: systematic review and meta-analysis",
      href: "https://pubmed.ncbi.nlm.nih.gov/40632222/",
      publisher: "PubMed",
      note: "Supports a bounded performance rationale while reporting low certainty and no universal implementation protocol.",
    },
    {
      name: "Subjective and objective athlete-monitoring systematic review",
      href: "https://pubmed.ncbi.nlm.nih.gov/26423706/",
      publisher: "PubMed",
      note: "Supports structured subjective monitoring as context, not a direct recovery measurement.",
    },
    {
      name: "Athlete-reported outcome-measure validation review",
      href: "https://pubmed.ncbi.nlm.nih.gov/32957081/",
      publisher: "PubMed",
      note: "Defines the validation limits of common athlete wellbeing measures.",
    },
    {
      name: "HRV-guided endurance-training systematic review and meta-analysis",
      href: "https://pubmed.ncbi.nlm.nih.gov/34639599/",
      publisher: "PubMed",
      note: "Supports cautious use of HRV trends and rejects a universal one-value command.",
    },
    {
      name: "Athlete sleep consensus recommendations",
      href: "https://pubmed.ncbi.nlm.nih.gov/33144349/",
      publisher: "PubMed",
      note: "Supports individual sleep context rather than one universal duration rule.",
    },
    {
      name: "ECSS/ACSM overtraining syndrome consensus statement",
      href: "https://pubmed.ncbi.nlm.nih.gov/23247672/",
      publisher: "PubMed",
      note: "Supports the explicit rule that a readiness score cannot diagnose overtraining syndrome.",
    },
  ],
} as const;

export type RoadmanAppDecisionPolicy = typeof ROADMAN_APP_DECISION_POLICY;
