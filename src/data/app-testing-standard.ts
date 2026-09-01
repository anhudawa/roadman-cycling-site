import { SITE_ORIGIN } from "@/lib/brand-facts";

export const ROADMAN_APP_TESTING_STANDARD = {
  version: "prelaunch-0.1",
  status: "public-prelaunch-protocol",
  canonicalPath: "/app/testing",
  canonicalUrl: `${SITE_ORIGIN}/app/testing`,
  updatedDate: "2026-09-01",
  reviewedBy: "Anthony Walsh",
  answer:
    "Roadman will test its cycling strength and recovery app in stages: first whether every decision obeys the published rules, then whether riders can use and understand it, then whether coach review agrees with its decisions, and only after that whether prospective rider outcomes justify an effectiveness claim. Usability, adherence and performance are separate results; no beta result will be presented as injury prevention, diagnosis or proof of performance.",
  currentClaimState: {
    label: "Prelaunch: no product-effectiveness claim",
    detail:
      "The app has a published rationale and decision policy, but the product itself has not yet produced evidence that it improves cycling performance, prevents injury or measures recovery.",
  },
  phases: [
    {
      id: "rules",
      stage: "01",
      title: "Decision-rule verification",
      question: "Does every output stay inside the public decision policy?",
      method:
        "Run automated and scenario-based tests against each versioned rule, including conflicting inputs, missing data and stop conditions.",
      publish:
        "Rule version, scenarios tested, pass/fail count, unresolved failures and the app build tested.",
      claimAllowed:
        "The tested build followed its specified rules in the reported scenarios.",
      claimNotAllowed: "The rules improve performance or recovery.",
    },
    {
      id: "usability",
      stage: "02",
      title: "Closed-beta usability",
      question:
        "Can intended riders complete the workflow and understand the reason?",
      method:
        "Observe task completion, friction, explanation comprehension, drop-off and support requests across the intended rider groups.",
      publish:
        "Invited, activated and analysed denominators; task completion; comprehension; attrition; participant characteristics and known sampling limits.",
      claimAllowed:
        "The tested riders could or could not use and understand the tested workflow.",
      claimNotAllowed:
        "The app is effective because riders liked or completed it.",
    },
    {
      id: "agreement",
      stage: "03",
      title: "Coach-review agreement",
      question:
        "Would a qualified reviewer accept, change or stop the same decision?",
      method:
        "Sample versioned decisions for independent review using the same available inputs; record agreement, direction of disagreement, overrides and reasons.",
      publish:
        "Review sample, reviewer role, agreement definition, raw counts, percentage agreement, uncertainty and material disagreement cases.",
      claimAllowed:
        "Reviewers agreed with a stated proportion of sampled decisions under the reported protocol.",
      claimNotAllowed:
        "Agreement proves that a prescription is optimal or medically safe.",
    },
    {
      id: "pilot",
      stage: "04",
      title: "Prospective real-world pilot",
      question:
        "What happens when riders use the product during a real cycling block?",
      method:
        "Pre-specify the product version, population, duration, outcomes and analysis before enrolment; track use, missingness, overrides and priority-ride interference.",
      publish:
        "Protocol date, eligibility, flow, baseline, exposure, all pre-specified outcomes, missing data, adverse or escalation events and limitations.",
      claimAllowed:
        "The reported outcomes were observed during use of the tested build.",
      claimNotAllowed: "An uncontrolled association was caused by the app.",
    },
    {
      id: "effectiveness",
      stage: "05",
      title: "Comparative effectiveness",
      question:
        "Does the product outperform a defined alternative on a pre-specified outcome?",
      method:
        "Use a prospective comparator design appropriate to the claim, with a public protocol, defined primary outcome and analysis plan.",
      publish:
        "Registration, allocation and comparator details, participant flow, effect estimate with uncertainty, harms, attrition, protocol deviations and null findings.",
      claimAllowed:
        "Only the claim directly supported by the design, population, outcome and tested version.",
      claimNotAllowed:
        "A broader, permanent or medical claim beyond the study.",
    },
  ],
  measures: [
    {
      name: "Activation and exposure",
      definition:
        "Invited riders, accounts created, first readiness check, first session viewed and first session started—reported as separate denominators.",
    },
    {
      name: "Session adherence",
      definition:
        "Assigned, viewed, started and completed sessions, with the time window and definition of completion stated.",
    },
    {
      name: "Reason comprehension",
      definition:
        "Whether the rider can identify why a session proceeded, held, reduced, substituted or stopped—not whether they merely liked the message.",
    },
    {
      name: "Decision agreement and override",
      definition:
        "Coach-review agreement plus rider or coach overrides, direction of change and reason; raw numerator and denominator accompany every rate.",
    },
    {
      name: "Cycling interference",
      definition:
        "Reported or logged cases where strength work compromised a declared priority ride, with timing and competing load described.",
    },
    {
      name: "Boundary and escalation events",
      definition:
        "Pain, symptom or illness reports that trigger a stop, substitution or referral outside the automated decision; this is not an injury-prevention measure.",
    },
    {
      name: "Strength and cycling outcomes",
      definition:
        "Only pre-specified measures collected with a stated protocol, timeframe and missing-data rule; exploratory findings remain labelled exploratory.",
    },
  ],
  reportingCommitments: [
    "Freeze the app build, decision-policy version, population, dates, primary outcomes and analysis before interpreting outcome data.",
    "Report every denominator: invited, eligible, enrolled, activated, exposed, analysed and lost to follow-up.",
    "Separate usability, adherence, decision agreement, association and comparative effectiveness in every headline and summary.",
    "Publish null and negative findings alongside favourable findings, plus protocol deviations and material product changes.",
    "Identify whether a result is automated test data, beta feedback, observational evidence or a comparative study.",
    "Do not convert a readiness input, override or escalation event into a diagnosis, injury-prevention result or medical clearance.",
  ],
  sources: [
    {
      name: "NICE evidence standards framework for digital health technologies",
      href: "https://www.nice.org.uk/corporate/ecd7",
      publisher: "NICE",
      note: "Informs the staged separation of design assurance and evidence of effectiveness; it is not a certification of this product.",
    },
    {
      name: "DECIDE-AI early-stage evaluation reporting guideline",
      href: "https://www.nature.com/articles/s41591-022-01772-9",
      publisher: "Nature Medicine",
      note: "Informs version identification, human factors, workflow, errors and transparent early-stage reporting. Roadman is not presenting the app as a clinical AI system.",
    },
    {
      name: "CONSORT-EHEALTH reporting guidance",
      href: "https://www.jmir.org/2011/4/e126/",
      publisher: "Journal of Medical Internet Research",
      note: "Informs explicit reporting of engagement, use, non-use, attrition and the digital intervention tested.",
    },
    {
      name: "TIDieR intervention description and replication checklist",
      href: "https://www.bmj.com/content/348/bmj.g1687",
      publisher: "The BMJ",
      note: "Informs reproducible description of what was delivered, how much, tailoring, modifications and actual fidelity.",
    },
    {
      name: "STROBE observational-study reporting guideline",
      href: "https://www.equator-network.org/reporting-guidelines/strobe/",
      publisher: "EQUATOR Network",
      note: "Will guide reporting of a prospective observational pilot; adherence does not by itself establish study quality or causality.",
    },
    {
      name: "CONSORT 2025 randomised-trial reporting guideline",
      href: "https://www.equator-network.org/reporting-guidelines/consort/",
      publisher: "EQUATOR Network",
      note: "Will guide reporting if Roadman later runs a randomised comparative trial; it is not evidence that such a trial has occurred.",
    },
  ],
} as const;

export type RoadmanAppTestingStandard = typeof ROADMAN_APP_TESTING_STANDARD;
