import { type ContentPillar } from "@/types";
import { type EvidenceLevelType } from "@/components/ui/EvidenceLevel";
import { ftpAnswers } from "./answers-data/ftp";
import { zone2Answers } from "./answers-data/zone2";
import { nutritionAnswers } from "./answers-data/nutrition";
import { strengthAnswers } from "./answers-data/strength";
import { recoveryAnswers } from "./answers-data/recovery";
import { mastersAnswers } from "./answers-data/masters";
import { racingAnswers } from "./answers-data/racing";
import { periodisationAnswers } from "./answers-data/periodisation";
import { powerAnswers } from "./answers-data/power";
import { mentalAnswers } from "./answers-data/mental";
import { bikefitAnswers } from "./answers-data/bikefit";
import { heatAnswers } from "./answers-data/heat";
import { crossTrainingAnswers } from "./answers-data/cross-training";
import { metricsAnswers } from "./answers-data/metrics";
import { trainingPhysiologyAnswers } from "./answers-data/training-physiology";
import { wave3Answers } from "./answers-data/wave3";
import { cyclingTechAnswers } from "./answers-data/cycling-tech";

/**
 * Answer pages — citation-optimised, answer-first pages built to be lifted
 * by AI engines (ChatGPT, Perplexity, Gemini, Claude) and surfaced in AI
 * Overviews. Each entry powers one route at /answers/{slug}.
 *
 * These are NOT blog posts. They are shorter, more rigidly structured, and
 * optimised for extraction: a direct answer in the first 80 words, an
 * explicit audience, an editorial stance, named-expert evidence with
 * episode references, a "do this week" block, a common-mistakes list, and a
 * deep FAQ. The route emits Article + FAQPage + BreadcrumbList JSON-LD on
 * top of this data, and references the site-wide Person/Organization graph
 * by @id.
 *
 * Authoring rules (editorial standard 9.5/10):
 *   - directAnswer is what gets cited. 40-80 words, lead with the verdict,
 *     no hedging, no preamble, a number with a unit in the first sentence.
 *   - Every claim names an expert, an episode, or a number. No generic
 *     health content. No AI-slop language (see voice-check.ts kill list).
 *   - expertEvidence attributes positions to real podcast guests with a
 *     resolvable episodeSlug / guestSlug. Do not invent slugs.
 *   - relatedEpisodes / relatedTopics must point at pages that exist.
 *   - Roadman voice: approachable expert, peer-to-peer, "fixable" framing.
 */

export type AnswerCluster =
  | "ftp"
  | "zone2"
  | "nutrition"
  | "strength"
  | "recovery"
  | "masters"
  | "racing"
  | "periodisation"
  | "power"
  | "mental"
  | "bikefit"
  | "heat"
  | "cross-training"
  | "cycling-tech";

export interface AnswerWhoFor {
  /** Short audience label, e.g. "The plateaued club racer" */
  label: string;
  /** One line on why this answer is for them */
  detail: string;
}

export interface AnswerExpertPoint {
  /** Expert name as it should read on the page */
  name: string;
  /** Credential / role, e.g. "Polarised-training researcher" */
  credential?: string;
  /** The insight in plain language — a synthesised position, not a fake verbatim quote */
  insight: string;
  /** Episode slug for the "heard it here" link (must resolve via getEpisodeBySlug) */
  episodeSlug?: string;
  /** Guest page slug (must resolve via getGuestBySlug) */
  guestSlug?: string;
}

export interface AnswerStep {
  /** Imperative title, e.g. "Audit one week of riding" */
  title: string;
  /** What to actually do */
  detail: string;
}

export interface AnswerMistake {
  /** The mistake cyclists make */
  mistake: string;
  /** The fix */
  fix: string;
}

export interface AnswerFaq {
  question: string;
  answer: string;
}

export interface AnswerRelatedLink {
  label: string;
  href: string;
  description?: string;
}

export interface AnswerPage {
  slug: string;
  cluster: AnswerCluster;
  /** The H1 + schema.org Question/headline. Phrased as the searcher asks it. */
  question: string;
  seoTitle: string;
  seoDescription: string;
  pillar: ContentPillar;
  /** 40-80 word answer-first capsule. This is the chunk AI engines cite. */
  directAnswer: string;
  /** 3-4 extractable takeaways shown under the answer capsule. */
  keyTakeaways: string[];
  /** "Who this answer is for" — explicit audience segmentation. */
  whoFor: AnswerWhoFor[];
  /** The Roadman view — editorial stance, not neutral Wikipedia prose. */
  roadmanView: string[];
  /** Named-expert evidence with episode references. */
  expertEvidence: AnswerExpertPoint[];
  /** Practical application — what to do this week. */
  practicalApplication: AnswerStep[];
  /** Common mistakes cyclists get wrong. */
  commonMistakes: AnswerMistake[];
  /** 6-12 related questions, rendered as FAQPage schema. */
  faq: AnswerFaq[];
  /** Related podcast episodes — slugs, must resolve. */
  relatedEpisodes: string[];
  /** Related topics / hubs / tools — internal links. */
  relatedTopics: AnswerRelatedLink[];
  evidenceLevel: EvidenceLevelType;
  evidenceNote?: string;
  publishDate: string;
  updatedDate: string;
  reviewedBy?: string;
}

export const ANSWER_CLUSTERS: { id: AnswerCluster; label: string; description: string }[] = [
  {
    id: "ftp",
    label: "FTP & Threshold",
    description:
      "Functional threshold power — how to test it, raise it, and train off it.",
  },
  {
    id: "zone2",
    label: "Zone 2 & Aerobic Base",
    description:
      "Easy riding done properly — the base everything else is built on.",
  },
  {
    id: "nutrition",
    label: "Fuelling & Nutrition",
    description:
      "What to eat before, during, and around rides — grounded in World Tour practice.",
  },
  {
    id: "strength",
    label: "Strength & Conditioning",
    description:
      "Off-the-bike work that protects power and keeps you riding for decades.",
  },
  {
    id: "recovery",
    label: "Recovery & Adaptation",
    description:
      "Sleep, rest and deloads — where the fitness from your hard work actually appears.",
  },
  {
    id: "masters",
    label: "Masters Cycling",
    description: "Training, recovery, and getting faster after 40.",
  },
  {
    id: "racing",
    label: "Race & Event Prep",
    description:
      "Tapering, pacing and fuelling for sportives, gran fondos and races.",
  },
  {
    id: "periodisation",
    label: "Periodisation & Planning",
    description:
      "Structuring the season so fitness arrives on the day that matters.",
  },
  {
    id: "power",
    label: "Power & Performance",
    description:
      "VO2 max, climbing, sprinting and the watts that decide the ride.",
  },
  {
    id: "mental",
    label: "Mental Performance",
    description:
      "Mindset, motivation and the psychology that holds up when the legs hurt.",
  },
  {
    id: "bikefit",
    label: "Bike Fit & Position",
    description:
      "Comfort, power and staying pain-free — fit as a performance variable.",
  },
  {
    id: "heat",
    label: "Heat & Altitude",
    description:
      "Training the body to handle heat and thin air — and the free adaptation most amateurs skip.",
  },
  {
    id: "cross-training",
    label: "Running & Cross-Training",
    description:
      "Where running and cycling overlap — fitness transfer, injury cross-training, and training the two together.",
  },
  {
    id: "cycling-tech",
    label: "Cycling Tech & GPS",
    description:
      "Bike computers, GPS watches, power meters, and the metrics worth actually tracking.",
  },
];

const BASE_ANSWERS: AnswerPage[] = [
  // ============================================================
  // 1 — HOW TO IMPROVE FTP
  // ============================================================
  {
    slug: "how-to-improve-ftp",
    cluster: "ftp",
    question: "How Do I Improve My FTP?",
    seoTitle: "How to Improve Your FTP — What Actually Works",
    seoDescription:
      "The fastest way to raise FTP for amateur cyclists: fix your intensity distribution, add targeted threshold and VO2max work, fuel it, and recover. What the World Tour coaches prescribe.",
    pillar: "coaching",
    directAnswer:
      "Improve your FTP by getting your intensity distribution right first — roughly 80% of riding genuinely easy, 20% genuinely hard — then adding targeted threshold (2×20 min at 95–105% FTP) and VO2max intervals (5×4 min) once a week each. A structured amateur typically gains 5–15% in their first 12 weeks. The work that fails is grey-zone riding: too hard to recover from, too easy to adapt.",
    keyTakeaways: [
      "Fix the easy/hard split before adding more intervals — grey-zone riding is the most common blocker.",
      "Two quality sessions a week (one threshold, one VO2max) beats four moderate ones.",
      "FTP gains are fuelled and recovered into existence — under-fuelled hard sessions cap your top end.",
      "Retest every 6–8 weeks, not every 4 — fatigue masks real gains.",
    ],
    whoFor: [
      {
        label: "The structured-but-stalled amateur",
        detail:
          "You train 6–12 hours a week with some structure but your FTP has flattened.",
      },
      {
        label: "The rider new to intervals",
        detail:
          "You ride consistently but have never run a proper threshold or VO2max block.",
      },
    ],
    roadmanView: [
      "The cycling internet sells FTP improvement as a session you buy or an app you download. The riders who actually move the number do something less glamorous first: they ride easy properly. Anthony has had this conversation with Stephen Seiler, Dan Lorang and John Wakefield on the podcast, and the shortlist never changes — most amateurs are riding 50% too hard on their easy days and not hard enough on their hard days. That grey-zone drift accumulates fatigue without delivering adaptation.",
      "Fix the distribution and the intervals start working. The pattern the pros use is unfussy: a large base of zone 2, then a small number of properly hard sessions — threshold to build the engine's ceiling, VO2max to lift the roof above it. You don't need six interval sessions a week. You need two you can actually complete, fuelled and recovered, week after week.",
      "And FTP is not a number you chase in isolation. It's an output of training that's structured, fuelled and recovered. When it stalls, the answer is almost never 'push harder' — it's 'fix the system around the work'.",
    ],
    expertEvidence: [
      {
        name: "Professor Stephen Seiler",
        credential: "Exercise physiologist, polarised-training researcher",
        insight:
          "Trained cyclists improve most when about 80% of training sits below the first ventilatory threshold and 20% sits well above it. The grey zone in the middle is where amateurs lose the most progress — it costs recovery without buying adaptation.",
        episodeSlug: "ep-2148-80-20-training-to-ride-faster-dr-stephen-seiler",
        guestSlug: "stephen-seiler",
      },
      {
        name: "John Wakefield",
        credential: "Director of Coaching, Red Bull–Bora–Hansgrohe",
        insight:
          "A self-coached amateur moving from unstructured riding to a properly periodised plan should expect a 5–15% FTP lift in the first block when testing is done honestly — not on a fatigued week.",
        guestSlug: "john-wakefield",
      },
    ],
    practicalApplication: [
      {
        title: "Audit one week of riding",
        detail:
          "Pull up your last 7 days in TrainingPeaks, Strava or intervals.icu. Colour every ride by zone. If your 'easy' rides are sitting in zone 3, that's your first fix — slow them down until they feel almost too easy.",
      },
      {
        title: "Add one threshold session",
        detail:
          "2×20 minutes at 95–105% of FTP, 5 minutes easy between. This is the single most reliable FTP-builder for amateurs. Hold the power steady; don't start at 110% and fade.",
      },
      {
        title: "Add one VO2max session",
        detail:
          "5×4 minutes at 110–120% FTP, 4 minutes easy recovery. This lifts the ceiling your threshold work then chases. One per week is plenty — these are expensive to recover from.",
      },
      {
        title: "Fill the rest with zone 2",
        detail:
          "Everything else is genuinely easy aerobic riding. If you can't hold a conversation, you're going too hard and stealing from your hard days.",
      },
    ],
    commonMistakes: [
      {
        mistake: "Doing every ride at 'medium-hard' because it feels productive.",
        fix:
          "Make easy days easy and hard days hard. The middle feels like training but produces the least adaptation per unit of fatigue.",
      },
      {
        mistake: "Adding more intervals when the number stalls.",
        fix:
          "More of what isn't working rarely fixes it. Check fuelling, recovery and structure before adding volume.",
      },
      {
        mistake: "Retesting FTP every four weeks and panicking when it's flat.",
        fix:
          "Test at the end of a block when you're rested. Mid-block fatigue makes a test measure tiredness, not fitness.",
      },
    ],
    faq: [
      {
        question: "How long does it take to improve FTP?",
        answer:
          "A first-year amateur on a structured plan typically gains 5–15% in 6–12 weeks. After two or three years of training, expect 1–5% per dedicated block. Anything faster than 5% in a month is usually a calibration error, not real fitness.",
      },
      {
        question: "Is sweet spot or threshold better for raising FTP?",
        answer:
          "Threshold work (95–105% FTP) is the more direct FTP-builder. Sweet spot (84–94%) lets you accumulate more time-in-zone with less fatigue, which suits time-crunched riders, but it drifts into the grey zone if it becomes your only intensity. Use threshold to build the ceiling, sweet spot to add durable volume.",
      },
      {
        question: "Can I improve FTP with low-volume training?",
        answer:
          "Yes. On 4–6 hours a week, two quality sessions plus easy filler rides will move FTP for most amateurs. Volume helps durability and ceiling over the long run, but quality and consistency drive the early gains.",
      },
      {
        question: "Does losing weight improve my FTP?",
        answer:
          "Losing weight doesn't raise your raw FTP in watts — it raises your watts per kilo, which is what matters on climbs. Just don't chase weight loss by under-fuelling training, because that suppresses the hard sessions that actually build power.",
      },
      {
        question: "Will more zone 2 alone increase my FTP?",
        answer:
          "Zone 2 builds the aerobic base that hard work sits on, and for an untrained rider it can lift FTP on its own for a while. But once you're trained, you need targeted threshold and VO2max work to keep the number climbing. Base plus a little intensity beats base alone.",
      },
      {
        question: "How do I know if my FTP actually went up?",
        answer:
          "Retest with the same protocol, rested, after a deload — a ramp test or 20-minute test, whichever you used last time. Day-to-day power on intervals feeling easier is a good signal, but a like-for-like test is the honest measure.",
      },
    ],
    relatedEpisodes: [
      "ep-2148-80-20-training-to-ride-faster-dr-stephen-seiler",
      "ep-2095-secret-to-cycling-fast-at-a-low-heart-rate-prof-seiler",
      "ep-2026-ftp-jumped-30-watts-after-this-workout",
    ],
    relatedTopics: [
      { label: "FTP Training — Topic Hub", href: "/topics/ftp-training" },
      { label: "FTP Zone Calculator", href: "/tools/ftp-zones" },
      {
        label: "Polarised vs Sweet Spot",
        href: "/answers/polarised-vs-sweet-spot",
      },
      { label: "Why has my cycling plateaued?", href: "/answers/how-to-stop-plateauing" },
      {
        label: "Polarised vs Pyramidal Training",
        href: "/compare/polarised-vs-pyramidal",
      },
    ],
    evidenceLevel: "strong",
    evidenceNote:
      "Intensity-distribution research (Seiler) corroborated by World Tour coaching practice (Wakefield, Lorang) across the Roadman podcast archive.",
    publishDate: "2026-05-25",
    updatedDate: "2026-05-25",
  },

  // ============================================================
  // 2 — HOW MUCH ZONE 2
  // ============================================================
  {
    slug: "how-much-zone-2",
    cluster: "zone2",
    question: "How Much Zone 2 Should Cyclists Do?",
    seoTitle: "How Much Zone 2 Training Should Cyclists Do?",
    seoDescription:
      "How much Zone 2 cyclists actually need — roughly 80% of weekly training time, in rides of 60–90 minutes or longer. What World Tour coaches prescribe, and the mistake amateurs make.",
    pillar: "coaching",
    directAnswer:
      "Most cyclists should spend around 80% of their weekly training time in Zone 2 — easy aerobic riding you could hold a conversation through. In practice that's the bulk of your hours in rides of 60 minutes or longer, with only ~20% of time spent on genuinely hard intervals. The benefit comes from total time, not intensity: longer is better than harder.",
    keyTakeaways: [
      "Target ~80% of weekly training time in Zone 2, ~20% hard. This is the 80/20 rule.",
      "Zone 2 means truly easy — most amateurs ride it 50% too hard.",
      "Duration drives the adaptation. A 90-minute Zone 2 ride beats three 30-minute ones.",
      "Zone 2 builds mitochondrial density and fat oxidation — the engine your hard work sits on.",
    ],
    whoFor: [
      {
        label: "The time-crunched amateur",
        detail:
          "You have 6–10 hours a week and want to know how to split them.",
      },
      {
        label: "The rider who thinks easy is wasted",
        detail:
          "You feel like a slow ride isn't 'real' training and keep pushing the pace.",
      },
    ],
    roadmanView: [
      "Here's what nobody tells you about pro cyclists: they spend about 80% of their time riding at a pace so slow that plenty of recreational riders could sit on their wheel. Anthony has said it on the podcast more than once, and Seiler's research backs it — the easy riding is not filler between the hard sessions. It is the training.",
      "The problem is ego. Riding slow feels like you're not working, so amateurs nudge the pace up until their 'easy' ride is actually a moderate one. That grey-zone riding is the single most common error trained amateurs make. It feels productive and it quietly blocks progress, because it's too hard to recover from and too easy to drive real adaptation.",
      "So the honest prescription isn't a magic number of minutes — it's a ratio and a discipline. Keep roughly four-fifths of your weekly time genuinely easy, hold your hard days for the 20% that's meant to hurt, and let duration do the work. Zone 2 isn't a session you tick off. It's the base everything else stands on.",
    ],
    expertEvidence: [
      {
        name: "Professor Stephen Seiler",
        credential: "Exercise physiologist, polarised-training researcher",
        insight:
          "Across elite endurance sport, the durable pattern is about 80% of sessions easy and 20% hard. The mechanism in Zone 2 is real and specific — mitochondrial density and fat oxidation — not just 'recovery' riding.",
        episodeSlug: "ep-2095-secret-to-cycling-fast-at-a-low-heart-rate-prof-seiler",
        guestSlug: "stephen-seiler",
      },
      {
        name: "World Tour coaches",
        credential: "As discussed on the Roadman podcast",
        insight:
          "The coaches behind Grand Tour riders prescribe huge volumes of properly easy riding. The amateur takeaway isn't to copy the hours — it's to copy the discipline of keeping easy days genuinely easy.",
        episodeSlug: "ep-2-i-asked-world-tour-coaches-about-zone-2-heres-what-they-said",
      },
    ],
    practicalApplication: [
      {
        title: "Set your Zone 2 ceiling honestly",
        detail:
          "Zone 2 is roughly 56–75% of FTP, or under ~75% of max heart rate. Use the lower half of that band. If your power meter says Z2 but you're breathing hard, trust your breathing and ease off.",
      },
      {
        title: "Make your long ride genuinely long",
        detail:
          "One ride a week of 90 minutes to 3+ hours, all in Zone 2. Duration is the stimulus — the last hour of a long easy ride is where much of the aerobic adaptation happens.",
      },
      {
        title: "Protect the ratio",
        detail:
          "Add up your weekly time. If more than ~20% is spent above Zone 2, you're doing too much intensity. Cut a hard session before you cut an easy hour.",
      },
    ],
    commonMistakes: [
      {
        mistake: "Riding Zone 2 in Zone 3 because slow feels unproductive.",
        fix:
          "Cap it by feel: conversational, nose-breathing pace. If you can only speak in short bursts, you're too high.",
      },
      {
        mistake: "Chopping Zone 2 into lots of short rides.",
        fix:
          "Consolidate the time. Longer continuous rides deliver more aerobic adaptation than the same minutes scattered across micro-sessions.",
      },
      {
        mistake: "Treating Zone 2 as optional once intervals start.",
        fix:
          "The base is what lets you absorb and recover from intervals. Drop it and your hard sessions degrade within weeks.",
      },
    ],
    faq: [
      {
        question: "What heart rate is Zone 2 for cycling?",
        answer:
          "Roughly 60–70% of your maximum heart rate, or under your first ventilatory threshold — the point where you'd start breathing through your mouth. It's individual, so calibrate from a recent test rather than a generic formula.",
      },
      {
        question: "Is 30 minutes of Zone 2 enough?",
        answer:
          "It's better than nothing and useful as a recovery spin, but 30 minutes is short for a true aerobic stimulus. Most of the benefit comes from rides of 60 minutes and up, where fat oxidation and mitochondrial adaptation are most strongly driven.",
      },
      {
        question: "How many days a week should I do Zone 2?",
        answer:
          "For most amateurs, 3–5 of your weekly rides will be predominantly Zone 2, with 1–2 hard sessions. The exact count depends on your hours, but the ratio — about 80% easy — matters more than the day count.",
      },
      {
        question: "Can I do too much Zone 2?",
        answer:
          "You can't easily over-train on easy riding, but you can under-stimulate if you never go hard. Zone 2 alone plateaus a trained rider. Pair the big easy base with a small dose of properly hard intervals.",
      },
      {
        question: "Should I do Zone 2 indoors or outdoors?",
        answer:
          "Either works. Indoors is more controlled and time-efficient; outdoors is easier to sustain for the long durations Zone 2 rewards. Many riders find a 3-hour Zone 2 ride far more bearable outside than on a trainer.",
      },
      {
        question: "Why do I feel like Zone 2 is too easy?",
        answer:
          "Because it is meant to feel easy — that's the point, and the ego struggle is normal. The work is happening at the cellular level even when the legs feel under-worked. Trust the process and save the suffering for your hard days.",
      },
    ],
    relatedEpisodes: [
      "ep-2-secret-to-zone-2-training-dose-frequency-duration",
      "ep-2-i-asked-world-tour-coaches-about-zone-2-heres-what-they-said",
      "ep-2095-secret-to-cycling-fast-at-a-low-heart-rate-prof-seiler",
    ],
    relatedTopics: [
      { label: "Zone 2 Training — Complete Guide", href: "/blog/zone-2-training-complete-guide" },
      { label: "FTP Zone Calculator", href: "/tools/ftp-zones" },
      { label: "HR Zone Calculator", href: "/tools/hr-zones" },
      { label: "Polarised vs Sweet Spot", href: "/answers/polarised-vs-sweet-spot" },
      { label: "FTP Training — Topic Hub", href: "/topics/ftp-training" },
    ],
    evidenceLevel: "strong",
    evidenceNote:
      "80/20 intensity distribution is among the best-supported findings in endurance science (Seiler), reinforced by World Tour coaching practice across the podcast.",
    publishDate: "2026-05-25",
    updatedDate: "2026-05-25",
  },

  // ============================================================
  // 3 — CARBS PER HOUR CYCLING
  // ============================================================
  {
    slug: "carbs-per-hour-cycling",
    cluster: "nutrition",
    question: "How Many Carbs Per Hour for Cycling?",
    seoTitle: "How Many Carbs Per Hour for Cycling?",
    seoDescription:
      "How many carbs to eat per hour cycling: 60g/hr for most rides, up to 90–120g/hr for racing if your gut is trained. Why the pro 120g rule fails amateurs, per Dr Sam Impey.",
    pillar: "nutrition",
    directAnswer:
      "For rides over 90 minutes, aim for 60g of carbohydrate per hour as the reliable default. Trained guts can absorb 90g/hr — and up to 120g/hr for racing — but only with glucose-fructose mixes and weeks of practice. Copying the pro 120g number without gut training is the fastest route to a bloated stomach and a wrecked ride. Start at 60g and build up.",
    keyTakeaways: [
      "60g/hr is the dependable default for endurance rides over 90 minutes.",
      "90–120g/hr is possible but needs a glucose:fructose mix (roughly 2:1 or 1:0.8) and gut training.",
      "The pro 120g rule fails amateurs who haven't trained absorption — start low, build up.",
      "Start fuelling early, from ~30–45 minutes in, not when you're already empty.",
    ],
    whoFor: [
      {
        label: "The sportive and long-ride rider",
        detail:
          "You're riding 2+ hours and bonking or fading in the back third.",
      },
      {
        label: "The racer chasing higher intake",
        detail:
          "You've heard pros take 120g/hr and want to know if you should too.",
      },
    ],
    roadmanView: [
      "The headlines did amateurs a disservice. When the pros started fuelling at 120g of carbs an hour and winning Grand Tours on it, the cycling internet decided everyone should. Anthony sat down with sports nutritionist Dr Sam Impey on the podcast, and the message was blunt: the 120g rule fails most amateurs, because their guts have never been trained to absorb anywhere near that.",
      "Carbohydrate absorption is trainable, like any other system. The pros didn't arrive at 120g overnight — they built tolerance over months with specific glucose-fructose ratios that use two separate gut transporters. Take that number cold on a sportive and you'll spend the back half of the ride fighting your stomach, not the climb.",
      "The honest default is 60g an hour for anything over 90 minutes. It's enough to defend your power, it's tolerable for almost everyone, and it's the floor the evidence supports. If you want to go higher for racing, that's a training project of its own — done in the weeks before, not on the start line.",
    ],
    expertEvidence: [
      {
        name: "Dr Sam Impey",
        credential: "Sports nutritionist",
        insight:
          "The pro 120g/hr figure is real but conditional. It depends on a trained gut and the right glucose-to-fructose ratio. Prescribing it to amateurs without that preparation is why so many blow up — their absorption simply can't keep pace with the intake.",
        episodeSlug: "ep-2035-world-tour-nutritionist-we-got-fuelling-wrong",
        guestSlug: "sam-impey",
      },
      {
        name: "Optimal fuelling on the bike",
        credential: "Roadman podcast — under- vs optimal- vs over-fuelling",
        insight:
          "Under-fuelling caps your power and ends in a bonk; over-fuelling buys nothing and risks GI distress. The optimal band for most amateurs sits around 60g/hr, climbing only with practice.",
        episodeSlug: "ep-36-i-tried-under-over-optimal-fuelling-heres-what-no-one-tells",
      },
    ],
    practicalApplication: [
      {
        title: "Default to 60g/hr on long rides",
        detail:
          "Roughly two gels, or a gel plus a carb drink, or a banana plus a gel, every hour after the first 30–45 minutes. Set a recurring alarm on your head unit so you don't forget.",
      },
      {
        title: "Start before you're empty",
        detail:
          "Begin fuelling at 30–45 minutes, not when you feel flat. By the time you feel the bonk coming, you're already two gels behind.",
      },
      {
        title: "Train your gut if you want 90g+",
        detail:
          "If you race and want higher intake, practise it on long training rides for several weeks, using a 2:1 glucose-to-fructose product. Build from 60g toward 90g gradually — never debut a new intake on race day.",
      },
    ],
    commonMistakes: [
      {
        mistake: "Copying the pro 120g/hr number without gut training.",
        fix:
          "Start at 60g/hr and only build higher with weeks of practice and a glucose-fructose mix.",
      },
      {
        mistake: "Waiting until you feel hungry or flat to start eating.",
        fix:
          "Fuel on a clock from the first 30–45 minutes. Once you've bonked, you can't fully recover mid-ride.",
      },
      {
        mistake: "Using only glucose-based products at high intake.",
        fix:
          "Past ~60g/hr you need fructose alongside glucose to use a second transporter, or absorption stalls and your gut rebels.",
      },
    ],
    faq: [
      {
        question: "How many carbs per hour for a 100km sportive?",
        answer:
          "60g/hr is the reliable target for most riders, starting from 30–45 minutes in. If you're racing the event and have trained your gut, 80–90g/hr can help, but 60g/hr completed consistently beats 90g/hr you can't stomach.",
      },
      {
        question: "Do I need carbs for rides under an hour?",
        answer:
          "Generally no. For rides under 60–75 minutes your stored glycogen is enough, so water is usually all you need. The exception is a hard, intense short session where a little carb can sharpen the effort.",
      },
      {
        question: "What's the best source of carbs while cycling?",
        answer:
          "Whatever you'll actually take and can absorb — gels, drink mix, chews, or real food like bananas and rice cakes. For higher intakes, products with a glucose:fructose ratio around 2:1 absorb better than glucose alone.",
      },
      {
        question: "Can I really absorb 120g of carbs per hour?",
        answer:
          "Some trained athletes can, using glucose-fructose mixes and months of gut training. Most amateurs can't without that preparation. It's a ceiling for prepared racers, not a starting prescription.",
      },
      {
        question: "Will high carb intake cause stomach problems?",
        answer:
          "It can, if you jump up too fast or rely on glucose alone. GI distress is usually a sign your intake has outrun your trained absorption. Drop back to a level you tolerate and build up more slowly.",
      },
      {
        question: "Should I fuel differently for fasted training?",
        answer:
          "Fasted easy rides are a deliberate low-carb stimulus, so you'd keep intake minimal. But Anthony's view is that fasting through hard or long sessions usually backfires — you end up bonking far from home and hating the bike. Fuel the work that needs fuelling.",
      },
    ],
    relatedEpisodes: [
      "ep-2035-world-tour-nutritionist-we-got-fuelling-wrong",
      "ep-36-i-tried-under-over-optimal-fuelling-heres-what-no-one-tells",
      "ep-2031-ben-healy-s-insane-fueling-strategy-revealed",
    ],
    relatedTopics: [
      { label: "Cycling Nutrition — Topic Hub", href: "/topics/cycling-nutrition" },
      { label: "Fuelling Calculator", href: "/tools/fuelling" },
      { label: "In-Ride Nutrition Guide", href: "/blog/cycling-in-ride-nutrition-guide" },
      { label: "What to eat before a long ride", href: "/answers/what-to-eat-before-cycling" },
      { label: "Fuelled vs Fasted Sessions", href: "/compare/fueled-vs-fasted-sessions" },
    ],
    evidenceLevel: "strong",
    evidenceNote:
      "Carbohydrate intake and gut-training science is well established; intake targets corroborated by Dr Sam Impey and the Roadman fuelling experiments.",
    publishDate: "2026-05-25",
    updatedDate: "2026-05-25",
  },

  // ============================================================
  // 4 — SHOULD CYCLISTS LIFT WEIGHTS
  // ============================================================
  {
    slug: "should-cyclists-lift-weights",
    cluster: "strength",
    question: "Should Cyclists Do Strength Training?",
    seoTitle: "Should Cyclists Lift Weights? The Honest Answer",
    seoDescription:
      "Yes — cyclists should strength train twice a week. It protects power, slows muscle loss after 40, and won't make you bulky. The cycling-specific protocol Roadman prescribes.",
    pillar: "strength",
    directAnswer:
      "Yes. Cyclists should strength train roughly twice a week — and after 40 it stops being optional. Targeted resistance work protects power, maintains bone density, and slows the muscle loss that quietly drains your FTP. The old fear that lifting makes you slow or bulky is over twenty years out of date: every World Tour team now prescribes it. Focus on cycling-specific patterns, not max-effort barbell lifting.",
    keyTakeaways: [
      "Two structured strength sessions a week is the target for most cyclists.",
      "After 40 it's non-negotiable — you lose ~8% of muscle mass per decade without it.",
      "It won't make you bulky; two short sessions a week build strength, not size.",
      "Prioritise cycling-specific patterns: split squats, hip hinges, single-leg work, core.",
    ],
    whoFor: [
      {
        label: "The cyclist who only rides",
        detail:
          "You do little or no resistance work and want the single highest-impact change.",
      },
      {
        label: "The masters rider protecting power",
        detail:
          "You're over 40 and noticing power and recovery slipping.",
      },
    ],
    roadmanView: [
      "The cycling internet argued about strength training for twenty years. The 2024–2025 research has effectively ended the debate for masters athletes, and the answer is unambiguous: structured resistance work twice a week protects power, defends muscle mass, maintains bone density, and beats simply riding more miles for almost every performance marker that matters as you age.",
      "The fear that lifting makes you slow or heavy is a hangover from the 2000s. Two short sessions a week produce a modest strength gain and almost no added bulk, and the riders Anthony has interviewed — from World Tour coaches to strength specialists like Derek Teel — all confirm the same thing: cyclists who add strength work tend to see FTP go up, not down.",
      "But meaningful matters. Body-pump classes and band-only work won't defend muscle against age. The Roadman approach is cycling-specific: split squats, hip hinges, single-leg deadlifts, presses and core, progressed gradually with controlled load — durable strength for the 35–55 amateur, not 1RM testing. The riders who keep their racing power into their 60s are almost universally still lifting. The ones who stopped declined fastest.",
    ],
    expertEvidence: [
      {
        name: "Derek Teel",
        credential: "Strength coach for cyclists (Dialed Health)",
        insight:
          "Strength training for cyclists should be simple and specific: a small number of compound, often single-leg patterns, progressed over time. You don't need a bodybuilding programme — you need consistent, controlled load on the patterns that protect you on the bike.",
        episodeSlug: "ep-2091-the-best-exercises-for-cyclists-strength-training",
        guestSlug: "derek-teel",
      },
      {
        name: "Masters strength research",
        credential: "Roadman podcast — what winning masters cyclists know",
        insight:
          "Recent research is clear that structured resistance work outperforms additional cycling volume for masters power retention. After 40, lifting isn't a supplement to training — it's part of the training.",
        episodeSlug: "ep-new-study-finally-confirms-what-winning-masters-cyclists-have-known",
      },
    ],
    practicalApplication: [
      {
        title: "Book two sessions a week",
        detail:
          "Thirty to forty-five minutes, twice a week. Consistency beats intensity here — two sessions you actually keep beat a heroic programme you abandon in a fortnight.",
      },
      {
        title: "Build around four patterns",
        detail:
          "A squat or split squat, a hip hinge or single-leg deadlift, a press, and core work. These cover the movements that protect power and your lower back on the bike.",
      },
      {
        title: "Load it meaningfully, progress slowly",
        detail:
          "Work in the 6–10 rep range with a load where the last reps need real focus. Add a little each week. Form first — controlled strength, not max-effort lifting.",
      },
      {
        title: "Stack lifting on hard ride days",
        detail:
          "Lift after a hard ride, not before, so your easy days stay fully easy. Fuel properly between the two and you concentrate the load rather than scattering fatigue across the week.",
      },
    ],
    commonMistakes: [
      {
        mistake: "Skipping strength because 'it'll make me slow'.",
        fix:
          "That's two decades out of date. Two sessions a week build strength without meaningful bulk and typically raise FTP.",
      },
      {
        mistake: "Doing band-only or body-pump-style work and calling it strength.",
        fix:
          "Use meaningful load on compound patterns. Light, high-rep circuits won't defend muscle mass against age.",
      },
      {
        mistake: "Lifting hard the day before a key session.",
        fix:
          "Stack strength on hard ride days or leave a recovery gap, so leg-heavy lifting doesn't blunt your quality intervals.",
      },
    ],
    faq: [
      {
        question: "How often should cyclists strength train?",
        answer:
          "Twice a week is the sweet spot for most cyclists in season. It's enough to build and maintain strength without adding fatigue that compromises your riding. One session a week maintains; two progresses.",
      },
      {
        question: "Will lifting weights make me a slower cyclist?",
        answer:
          "No. The 'cyclists shouldn't lift' position is over twenty years out of date. Two short sessions a week add strength and durability with minimal bulk, and most riders see FTP improve. Every World Tour team now prescribes strength work.",
      },
      {
        question: "What exercises should cyclists do?",
        answer:
          "Cycling-specific compound patterns: split squats, hip hinges, single-leg deadlifts, lunges, presses, and core. Single-leg work matters because cycling is a single-leg-dominant action. Skip the isolation machines.",
      },
      {
        question: "Do younger cyclists need strength training too?",
        answer:
          "Yes, though the case is most urgent after 40. Younger riders benefit from injury resilience, better power transfer, and durability. The habit is also far easier to keep if you build it before age makes it essential.",
      },
      {
        question: "Should I lift in the off-season or year-round?",
        answer:
          "Year-round, with the emphasis shifting. Build heavier strength in the off-season, then maintain with lower volume in season. Stopping entirely in season means losing much of what you built over the winter.",
      },
      {
        question: "How heavy should cyclists lift?",
        answer:
          "Heavy enough that the last 1–2 reps of a set of 6–10 require real focus, with good form. The goal is durable, controlled strength — not 1RM testing or max-effort barbell lifting, which carry higher injury risk for little extra benefit.",
      },
    ],
    relatedEpisodes: [
      "ep-2091-the-best-exercises-for-cyclists-strength-training",
      "ep-2183-strength-training-for-cycling-simplified-derek-teel",
      "ep-new-study-finally-confirms-what-winning-masters-cyclists-have-known",
    ],
    relatedTopics: [
      {
        label: "Strength & Conditioning — Topic Hub",
        href: "/topics/cycling-strength-conditioning",
      },
      { label: "Strength Training Guide", href: "/blog/cycling-strength-training-guide" },
      { label: "How should cyclists train over 40?", href: "/answers/cycling-training-over-40" },
      { label: "Strength vs More Miles", href: "/compare/strength-vs-more-miles" },
      { label: "Roadman Strength Training Programme", href: "/strength-training" },
    ],
    evidenceLevel: "strong",
    evidenceNote:
      "Masters strength research is now well established; protocol corroborated by Derek Teel and the Roadman strength programme.",
    publishDate: "2026-05-25",
    updatedDate: "2026-05-25",
  },

  // ============================================================
  // 5 — HOW TO STOP PLATEAUING
  // ============================================================
  {
    slug: "how-to-stop-plateauing",
    cluster: "power",
    question: "Why Has My Cycling Plateaued?",
    seoTitle: "Why Has My Cycling Plateaued? The Real Reasons",
    seoDescription:
      "Stuck for months? Cycling plateaus almost always come down to five things — grey-zone riding, under-recovery, under-fuelling, no periodisation, or a stale plan. How to break through.",
    pillar: "coaching",
    directAnswer:
      "If your cycling has been flat for three months or more despite consistent training, it's almost always one of five things: too much grey-zone riding, under-recovery, under-fuelling, no periodisation, or a stale plan. Pushing harder rarely fixes it — restructuring the system around the work usually does. The most common culprit is intensity drift: easy rides that aren't easy, hard rides that aren't hard.",
    keyTakeaways: [
      "Most plateaus are structure and recovery problems, not effort problems.",
      "Grey-zone drift is the single most common cause — fix your easy/hard split first.",
      "Under-recovery and under-fuelling cap fitness you've already built.",
      "A deload week alone can release gains hiding under accumulated fatigue.",
    ],
    whoFor: [
      {
        label: "The stalled committed amateur",
        detail:
          "You train 6–12 hours a week and your numbers haven't moved in 3+ months.",
      },
      {
        label: "The 'more is more' rider",
        detail:
          "You've been adding volume and intensity but going backwards, not forwards.",
      },
    ],
    roadmanView: [
      "Anthony has had this exact conversation with John Wakefield, Dan Lorang and Stephen Seiler, and they describe the same shortlist every time. When an amateur reports a stuck plateau, the problem is rarely lack of effort — it's almost always one of five structural issues. The instinct to 'push harder' is usually the thing keeping you stuck.",
      "The most common is grey-zone drift. You think your easy rides are zone 2; the file shows zone 3. You think your hard rides are at threshold; they're hovering at sweet spot. That mid-intensity creep accumulates fatigue without delivering adaptation. Then recovery breaks down — and as Anthony puts it, you don't get fitter from training, you get fitter from recovering from training. A stalled rider often just needs a deload, proper food and sleep, and the fitness they already built finally shows up.",
      "The good news is that a plateau is fixable, and it's rarely about doing more. It's about doing the right work, fuelling it, and letting your body express what it's quietly built. Most riders who break through cut a session, not add one.",
    ],
    expertEvidence: [
      {
        name: "Professor Stephen Seiler",
        credential: "Exercise physiologist, polarised-training researcher",
        insight:
          "Grey-zone training is the most common error trained amateurs make and the single biggest blocker to progression. Too much moderate-intensity riding accumulates fatigue while under-delivering adaptation.",
        episodeSlug: "ep-2148-80-20-training-to-ride-faster-dr-stephen-seiler",
        guestSlug: "stephen-seiler",
      },
      {
        name: "Dan Lorang",
        credential: "Head of Performance, Red Bull–Bora–Hansgrohe",
        insight:
          "Recovery is a separate trainable input, not the absence of training. An under-recovered athlete can't express the fitness they've built — the number on the test reads low because they're tired, not because they're unfit.",
        guestSlug: "dan-lorang",
      },
    ],
    practicalApplication: [
      {
        title: "Take a deload week now",
        detail:
          "Cut volume to 50–60% for one week with no hard intervals. It's not lost time — it's how you let accumulated fatigue clear so the next block lands.",
      },
      {
        title: "Audit your intensity split",
        detail:
          "Colour a fortnight of rides by zone. If your easy rides sit in zone 3 or your hard rides never reach threshold, that grey-zone drift is your plateau. Pull the easy days down and the hard days up.",
      },
      {
        title: "Check fuelling and sleep honestly",
        detail:
          "Are you eating enough carbohydrate to support your training load? Are you sleeping 7+ hours? Under-fuelled, under-slept training plateaus regardless of how the sessions look on paper.",
      },
      {
        title: "Change the stimulus",
        detail:
          "If you've done the same intervals, routes and intensities for over a year, the body has adapted and stopped responding. Swap the focus — from threshold blocks to VO2max, or add a strength block.",
      },
    ],
    commonMistakes: [
      {
        mistake: "Responding to a plateau by training harder and more.",
        fix:
          "More of what stalled you rarely restarts progress. Deload, fix structure, then reintroduce quality.",
      },
      {
        mistake: "Ignoring recovery and fuelling because they're not 'training'.",
        fix:
          "They are. Under-recovery and under-fuelling are the two quietest plateau causes, and both are fixable in a week or two.",
      },
      {
        mistake: "Running the same plan for over a year.",
        fix:
          "Periodise. The body adapts to a repeated stimulus and stops responding — change the focus every block.",
      },
    ],
    faq: [
      {
        question: "How long before I should assume I've plateaued?",
        answer:
          "Three months of consistent, structured work with no movement is the threshold most coaches use. Anything shorter is normal noise inside a single block — fitness moves in waves, not straight lines.",
      },
      {
        question: "Can fuelling really cause a plateau?",
        answer:
          "Yes, and it's heavily underrated. Chronically under-fuelled training lowers the quality of your hard sessions, suppresses recovery, and elevates stress hormones. Several Roadman coaching cases have moved stalled riders simply by raising daily carb intake to match load.",
      },
      {
        question: "Should I do more intervals to break a plateau?",
        answer:
          "Usually not. The riders who break plateaus tend to deload, recheck fuelling, then change the structure — often fewer sessions with better-defined zones. Volume of intervals is rarely the limiter.",
      },
      {
        question: "Is a plateau just my genetic ceiling?",
        answer:
          "Rarely, unless you've trained seriously for years and are already at a high level. For most amateurs a stall is a structure, recovery or fuelling problem long before it's a genetic limit.",
      },
      {
        question: "Will a coach actually help me break through?",
        answer:
          "Often, yes — mostly because a coach spots the structural error you can't see in your own data and forces the recovery you won't take yourself. The value is objectivity and accountability, not a secret session.",
      },
      {
        question: "Can a deload week really make me faster?",
        answer:
          "It can make you faster on your next test, because it lets fitness you've already built finally express itself. The deload doesn't build fitness — it clears the fatigue that's been hiding it.",
      },
    ],
    relatedEpisodes: [
      "ep-2148-80-20-training-to-ride-faster-dr-stephen-seiler",
      "ep-2026-ftp-jumped-30-watts-after-this-workout",
      "ep-2095-secret-to-cycling-fast-at-a-low-heart-rate-prof-seiler",
    ],
    relatedTopics: [
      { label: "FTP Plateau — How to Break Through", href: "/blog/ftp-plateau-breakthrough" },
      { label: "Take the Plateau Diagnostic", href: "/plateau" },
      { label: "How do I improve my FTP?", href: "/answers/how-to-improve-ftp" },
      {
        label: "More Volume, Getting Slower?",
        href: "/blog/more-volume-getting-slower-cycling-overtraining",
      },
      { label: "Volume vs Intensity", href: "/compare/volume-vs-intensity" },
    ],
    evidenceLevel: "strong",
    evidenceNote:
      "Plateau causes corroborated across the Roadman coaching network (Seiler, Lorang, Wakefield) and Roadman coaching case studies.",
    publishDate: "2026-05-25",
    updatedDate: "2026-05-25",
  },

  // ============================================================
  // 6 — POLARISED VS SWEET SPOT
  // ============================================================
  {
    slug: "polarised-vs-sweet-spot",
    cluster: "periodisation",
    question: "Polarised or Sweet Spot: Which Is Better?",
    seoTitle: "Polarised vs Sweet Spot Training: Which Is Better?",
    seoDescription:
      "Polarised vs sweet spot training for cyclists. Polarised (80/20 easy/hard) wins for most amateurs long-term; sweet spot suits time-crunched blocks. When to use each, per the research.",
    pillar: "coaching",
    directAnswer:
      "For most amateurs training more than ~6 hours a week, polarised training (about 80% easy, 20% hard, little in between) is the better long-term model — it's the most robustly supported approach in endurance science. Sweet spot (84–94% of FTP) earns its place in short, time-crunched blocks where you need maximum fitness per hour. The mistake is living in sweet spot year-round, which quietly becomes grey-zone training.",
    keyTakeaways: [
      "Polarised: ~80% easy, ~20% hard. Best long-term model for most amateurs.",
      "Sweet spot: 84–94% FTP. Time-efficient for short blocks, risky as a year-round default.",
      "Sweet spot drifts into the grey zone if it becomes your only intensity.",
      "Many riders do best with polarised base + a short sweet-spot block before an event.",
    ],
    whoFor: [
      {
        label: "The rider choosing a model",
        detail:
          "You've got enough hours to train properly and want to know which approach to build on.",
      },
      {
        label: "The time-crunched amateur",
        detail:
          "You have 4–6 hours a week and wonder if sweet spot is the efficient choice.",
      },
    ],
    roadmanView: [
      "This gets framed as a war, and it isn't. Polarised and sweet spot answer different questions. Polarised asks 'what produces the most durable fitness over a season?' and the answer, from Seiler's research and the World Tour coaches Anthony has interviewed, is the 80/20 split — mostly easy, occasionally very hard, almost nothing in the middle.",
      "Sweet spot asks a narrower question: 'what produces the most fitness per hour when hours are scarce?' For a time-crunched amateur with four hours a week and an event in eight, a focused sweet-spot block is a defensible, efficient choice. The trap is that sweet spot feels good — productive, repeatable — so riders never leave it. Run year-round, it becomes exactly the grey-zone riding that stalls progress.",
      "The Roadman view: build your year polarised, with a big easy base and a small dose of properly hard work, then use a short sweet-spot block to sharpen before a target event. Pick the tool for the question you're actually asking, and don't let the comfortable one quietly take over your whole calendar.",
    ],
    expertEvidence: [
      {
        name: "Professor Stephen Seiler",
        credential: "Exercise physiologist, polarised-training researcher",
        insight:
          "The 80/20 distribution is the most consistently supported pattern across elite endurance sport. The danger zone for amateurs is the moderate intensity in the middle — productive-feeling, but it accumulates fatigue without the adaptation of either truly easy or truly hard work.",
        episodeSlug: "ep-2148-80-20-training-to-ride-faster-dr-stephen-seiler",
        guestSlug: "stephen-seiler",
      },
      {
        name: "World Tour coaches on Zone 2",
        credential: "Roadman podcast",
        insight:
          "Elite programmes are overwhelmingly polarised in their distribution. The amateur lesson isn't the volume — it's protecting the easy days and saving real intensity for the sessions designed to hurt.",
        episodeSlug: "ep-2-i-asked-world-tour-coaches-about-zone-2-heres-what-they-said",
      },
    ],
    practicalApplication: [
      {
        title: "Default to polarised if you have the hours",
        detail:
          "Train more than ~6 hours a week? Build it polarised: most rides genuinely easy, two sessions properly hard (one threshold, one VO2max), nothing parked in the middle.",
      },
      {
        title: "Use sweet spot in short, deliberate blocks",
        detail:
          "Time-crunched or sharpening for an event? Run a 3–6 week sweet-spot block (2×20 min at 88–92% FTP) for efficient fitness, then return to a polarised base.",
      },
      {
        title: "Police the grey zone either way",
        detail:
          "Whichever model you pick, check that your easy rides are actually easy. The failure mode for both approaches is the same: everything creeping toward moderate.",
      },
    ],
    commonMistakes: [
      {
        mistake: "Living in sweet spot all year because it feels productive.",
        fix:
          "Use it in short blocks. Year-round sweet spot becomes grey-zone training and stalls most riders.",
      },
      {
        mistake: "Doing 'polarised' but riding the easy days too hard.",
        fix:
          "Polarised only works if the easy is truly easy. Half-polarised is just grey-zone with extra steps.",
      },
      {
        mistake: "Treating it as a permanent identity choice.",
        fix:
          "They're tools for different questions. Build polarised, sharpen with sweet spot near events.",
      },
    ],
    faq: [
      {
        question: "Is polarised training better than sweet spot?",
        answer:
          "For most amateurs with enough hours, polarised is the better long-term model — it's the most robustly supported in the research. Sweet spot wins on efficiency in short, time-crunched blocks. The best answer for many riders is polarised base plus a sweet-spot block before a target event.",
      },
      {
        question: "What is sweet spot training?",
        answer:
          "Riding at 84–94% of FTP — just below threshold. It lets you accumulate a lot of high-quality work with less fatigue than full threshold, which makes it time-efficient. The risk is that it's comfortable enough to overuse.",
      },
      {
        question: "Can I combine polarised and sweet spot?",
        answer:
          "Yes, and most coached amateurs effectively do. A common structure is a polarised base through the winter, then a focused sweet-spot block in the weeks before an event to sharpen event-specific fitness.",
      },
      {
        question: "Which is best for time-crunched cyclists?",
        answer:
          "Sweet spot is genuinely efficient when you only have 4–6 hours a week, because it packs more useful work into limited time. Just keep blocks short and return to easier riding between them so you don't accumulate chronic fatigue.",
      },
      {
        question: "Why do people say sweet spot is the 'grey zone'?",
        answer:
          "Because if it becomes your only intensity, it is — too hard to recover from fully, not hard enough to drive top-end adaptation. Sweet spot used deliberately in a block is fine; sweet spot as your everyday default is the classic plateau trap.",
      },
      {
        question: "What about pyramidal training?",
        answer:
          "Pyramidal sits between the two — more threshold work than polarised, less than a pure sweet-spot focus. It's a legitimate model many riders use successfully. The comparison page on polarised vs pyramidal breaks down when each fits.",
      },
    ],
    relatedEpisodes: [
      "ep-2148-80-20-training-to-ride-faster-dr-stephen-seiler",
      "ep-2-i-asked-world-tour-coaches-about-zone-2-heres-what-they-said",
      "ep-2095-secret-to-cycling-fast-at-a-low-heart-rate-prof-seiler",
    ],
    relatedTopics: [
      { label: "Polarised vs Pyramidal Training", href: "/compare/polarised-vs-pyramidal" },
      { label: "Sweet Spot vs Threshold", href: "/compare/sweet-spot-vs-threshold" },
      { label: "How much Zone 2 should I do?", href: "/answers/how-much-zone-2" },
      { label: "FTP Training — Topic Hub", href: "/topics/ftp-training" },
      { label: "Zone 2 Training — Complete Guide", href: "/blog/zone-2-training-complete-guide" },
    ],
    evidenceLevel: "strong",
    evidenceNote:
      "Polarised distribution is strongly supported in endurance research (Seiler); sweet-spot efficiency is well established for time-crunched training.",
    publishDate: "2026-05-25",
    updatedDate: "2026-05-25",
  },

  // ============================================================
  // 7 — CYCLING TRAINING OVER 40
  // ============================================================
  {
    slug: "cycling-training-over-40",
    cluster: "masters",
    question: "How Should Cyclists Train Over 40?",
    seoTitle: "How Should Cyclists Train Over 40?",
    seoDescription:
      "How masters cyclists over 40 should train: fewer but better hard sessions, twice-weekly strength work, and programmed recovery. Why the plan that worked at 30 won't work now.",
    pillar: "coaching",
    directAnswer:
      "Over 40, train with fewer but better hard sessions (two a week, not four), treat strength training twice a week as non-negotiable, and programme recovery as deliberately as you programme intensity. The polarised model — most riding easy, a little very hard — works better at 45 than at 25, not worse. The biggest mistake is training the same way you did at 30.",
    keyTakeaways: [
      "Fewer, better hard sessions: two a week beats four moderate grinds.",
      "Strength training twice a week is non-negotiable after 40 — muscle loss is ~8%/decade without it.",
      "Programme recovery: a deload every 3–4 weeks and a full rest day each week.",
      "Cut grey-zone hours, not endurance hours — keep the aerobic base.",
    ],
    whoFor: [
      {
        label: "The masters rider still training hard",
        detail:
          "You're 40–60, still pushing, but recovery takes longer and gains are smaller.",
      },
      {
        label: "The comeback athlete",
        detail:
          "You're returning to structured training after 40 and want to do it right.",
      },
    ],
    roadmanView: [
      "The single biggest masters mistake is training at 45 the way you trained at 30. Recovery capacity declines after 40, muscle mass falls roughly 8% per decade without resistance work, and the same load now produces more fatigue. None of that means you're done — Roadman's whole identity is 'not done yet' — but it does mean the plan has to change.",
      "Three shifts separate masters riders who keep improving from those who decline. First, fewer but better hard sessions: the polarised approach Seiler describes fits the masters recovery curve even better than the younger one. Two well-executed hard rides a week beats four sweet-spot grinds. Second, strength work twice a week stops being optional — Joe Friel has been saying it for years and the recent research backs him. Third, recovery has to be scheduled, not assumed: a deload every third or fourth week, sleep treated as a session, hard rides dropped rather than forced when you're under-slept.",
      "The riders who keep their racing power into their 60s aren't the ones grinding hardest. They're the ones who treat recovery like an athlete and protect their two genuinely hard sessions instead of diluting them across the week.",
    ],
    expertEvidence: [
      {
        name: "Joe Friel",
        credential: "Author of Fast After 50 and The Cyclist's Training Bible",
        insight:
          "After 40, the win isn't doing less — it's doing the right work and building mandatory recovery into the plan from day one. Intensity still matters; what changes is how much recovery each hard session now demands.",
        episodeSlug: "ep-2205-the-training-secret-to-going-faster-after-40-joe-friel",
        guestSlug: "joe-friel",
      },
      {
        name: "Masters strength research",
        credential: "Roadman podcast — what winning masters cyclists know",
        insight:
          "Structured strength training twice a week outperforms additional cycling volume for masters power retention, body composition and bone density. Riding alone is no longer enough after 40.",
        episodeSlug: "ep-new-study-finally-confirms-what-winning-masters-cyclists-have-known",
      },
    ],
    practicalApplication: [
      {
        title: "Cap hard sessions at two a week",
        detail:
          "One threshold, one VO2max, both properly executed. Three is the ceiling, four guarantees accumulated fatigue. Fill the rest of the week with genuinely easy riding.",
      },
      {
        title: "Add two strength sessions",
        detail:
          "Split squats, hip hinges, single-leg work, presses, core — meaningful load, progressed gradually. This is the single highest-impact change a masters rider who doesn't lift can make.",
      },
      {
        title: "Schedule recovery in advance",
        detail:
          "Build a deload week (50–60% volume) every third or fourth week into your calendar now, plus one full rest day weekly. Don't wait until you're cooked to take it.",
      },
      {
        title: "Treat sleep as a session",
        detail:
          "Under 7 hours and the next day's hard ride gets dropped or downgraded, not forced. Recovery after 40 takes 25–50% longer than it did at 30 — plan two easy days between hard efforts.",
      },
    ],
    commonMistakes: [
      {
        mistake: "Running the 30-year-old's plan into your 40s and 50s.",
        fix:
          "Fewer hard sessions, more recovery, add strength. Same load now produces more fatigue.",
      },
      {
        mistake: "Cutting endurance volume instead of grey-zone hours.",
        fix:
          "Keep the easy aerobic base. Cut the moderate-intensity riding that's costing you recovery for little gain.",
      },
      {
        mistake: "Skipping strength because there's no time.",
        fix:
          "Two 30-minute sessions a week is the difference between holding power into your 60s and declining fastest. Make the time.",
      },
    ],
    faq: [
      {
        question: "Should masters cyclists do less volume?",
        answer:
          "Not necessarily. The volume that worked at 30 often still works at 45 — it's the intensity distribution that has to shift. Cut grey-zone hours, not endurance hours. The 'just do less' instinct often costs you the aerobic base you need.",
      },
      {
        question: "How many hard sessions per week over 40?",
        answer:
          "Two is the sweet spot, three is the ceiling, four is a guarantee of accumulated fatigue. The pros Anthony has interviewed rarely exceed three genuinely hard sessions in a normal week, and amateurs over 40 should usually do fewer, not more.",
      },
      {
        question: "Is cycling enough exercise after 40?",
        answer:
          "For cardiovascular fitness, yes. For muscle mass, bone density and long-term power, no. The masters cyclists who keep their FTP through their 50s and 60s are almost universally also doing two structured strength sessions a week.",
      },
      {
        question: "Can I still get faster after 40?",
        answer:
          "Yes — especially if you've been training unstructured or skipping strength. Plenty of masters riders set personal bests in their 40s by fixing intensity distribution, adding strength and respecting recovery. The ceiling lowers slowly; most amateurs are nowhere near theirs.",
      },
      {
        question: "How long does recovery take for cyclists over 40?",
        answer:
          "Roughly 25–50% longer than it did 20 years earlier. A hard session that needed one easy day at 30 often needs two at 50. Plan two recovery days between hard efforts as the default, not the exception.",
      },
      {
        question: "Do I need more protein as a masters cyclist?",
        answer:
          "Yes. Older muscle responds more slowly to protein, so masters athletes need more, more often — around 1.6–2.2 g/kg per day split across several meals. Under-fuelling protein is one of the quietest causes of masters power decline.",
      },
    ],
    relatedEpisodes: [
      "ep-2205-the-training-secret-to-going-faster-after-40-joe-friel",
      "ep-new-study-finally-confirms-what-winning-masters-cyclists-have-known",
      "ep-2200-hard-truth-why-cyclists-over-40-slow-down-how-to-beat-it-rdm",
    ],
    relatedTopics: [
      {
        label: "How should cyclists over 40 train? (Q&A)",
        href: "/question/how-should-cyclists-over-40-train",
      },
      {
        label: "Should cyclists do strength training?",
        href: "/answers/should-cyclists-lift-weights",
      },
      { label: "Power-to-Weight (W/kg) Calculator", href: "/tools/wkg" },
      { label: "Strength Training for Cyclists Over 50", href: "/blog/strength-training-cyclists-over-50" },
      { label: "Strength vs More Miles", href: "/compare/strength-vs-more-miles" },
    ],
    evidenceLevel: "strong",
    evidenceNote:
      "Masters training and strength research is well established; corroborated by Joe Friel and the Roadman masters coverage.",
    publishDate: "2026-05-25",
    updatedDate: "2026-05-25",
  },

  // ============================================================
  // 8 — FTP TEST GUIDE
  // ============================================================
  {
    slug: "ftp-test-guide",
    cluster: "ftp",
    question: "How Do I Test My FTP Accurately?",
    seoTitle: "How to Test Your FTP Accurately",
    seoDescription:
      "How to test FTP accurately: the 20-minute and ramp protocols, why prep and a fresh body matter more than the test you pick, and how often to retest. Avoid the calibration errors.",
    pillar: "coaching",
    directAnswer:
      "Test FTP with either a 20-minute test (take 95% of your average power) or a ramp test, after a proper warm-up and on a rested day. Accuracy comes less from which protocol you pick and more from testing fresh, not fatigued, and using the same protocol every time. Retest every 6–8 weeks at the end of a block. A test taken mid-block measures tiredness, not fitness.",
    keyTakeaways: [
      "20-minute test: average power × 0.95. Ramp test: shorter, less painful, slightly different number.",
      "Pick one protocol and stick with it so results are comparable.",
      "Test rested, after a warm-up — fatigue can understate FTP by 5%+.",
      "Retest every 6–8 weeks at block-end, not every 4 weeks.",
    ],
    whoFor: [
      {
        label: "The self-coached rider",
        detail:
          "You set your own zones and need a defensible, repeatable testing protocol.",
      },
      {
        label: "The rider whose zones feel off",
        detail:
          "Your intervals feel mis-targeted and you suspect an old or bad FTP number.",
      },
    ],
    roadmanView: [
      "Most riders obsess over which test to do and ignore the thing that actually decides accuracy: the state of the body taking it. A 20-minute test on a fatigued Friday after a hard week will read low, you'll set your zones too soft, and every session for the next eight weeks will be slightly mis-targeted. The protocol matters far less than the prep.",
      "The two honest options are the 20-minute test (warm up properly, ride 20 minutes as hard as you can hold evenly, take 95% of the average) and the ramp test (shorter, less mentally brutal, but it can read differently for some riders). Either is fine. What's not fine is switching between them and comparing the numbers, or testing without a real warm-up and a fresh body.",
      "And testing isn't free — it costs a hard effort and a recovery day. So don't do it every four weeks. Test at the end of a block, ideally after an easy week, when your body can actually express the fitness it built. The number you get rested is the number worth training off.",
    ],
    expertEvidence: [
      {
        name: "Joe Friel",
        credential: "Author of The Cyclist's Training Bible",
        insight:
          "Formal testing belongs at block boundaries, not mid-block, and the prep — warm-up and a degree of taper — is what separates a real FTP from a fatigued one. Fewer high-quality tests beat more low-quality tests.",
        episodeSlug: "ep-40-how-joe-friel-structures-the-ideal-cycling-training-week",
        guestSlug: "joe-friel",
      },
      {
        name: "Roadman on training distribution",
        credential: "Roadman podcast — 80/20 with Seiler",
        insight:
          "An accurate FTP is only useful if your zones are then applied honestly. The point of testing isn't the number — it's calibrating the easy and hard work so the distribution actually does its job.",
        episodeSlug: "ep-2148-80-20-training-to-ride-faster-dr-stephen-seiler",
      },
    ],
    practicalApplication: [
      {
        title: "Arrive rested",
        detail:
          "Take an easy day or two before testing. Testing on fatigue is the most common way amateurs underestimate FTP and set their zones too low.",
      },
      {
        title: "Warm up properly",
        detail:
          "15–20 minutes building from easy spinning, with a couple of short openers near threshold. A cold start wrecks a 20-minute test in the first five minutes.",
      },
      {
        title: "Pace it evenly",
        detail:
          "On the 20-minute test, ride a steady hard effort you can hold — don't start at 110% and fade. Take 95% of your average power as your FTP estimate.",
      },
      {
        title: "Lock your protocol and cadence",
        detail:
          "Use the same test, indoors or out, each time. Comparing a ramp test to a 20-minute test, or an indoor number to an outdoor one, isn't a like-for-like comparison.",
      },
    ],
    commonMistakes: [
      {
        mistake: "Testing on a fatigued day mid-block.",
        fix:
          "Test rested, at block-end, ideally after an easy week. Fatigue can understate FTP by 5% or more.",
      },
      {
        mistake: "Switching between ramp and 20-minute tests.",
        fix:
          "Pick one and stick with it. The two protocols can produce different numbers, so mixing them hides real change.",
      },
      {
        mistake: "Starting the 20-minute effort far too hard.",
        fix:
          "Pace evenly. A fast start that fades gives a lower, less accurate average than a steady, sustainable effort.",
      },
    ],
    faq: [
      {
        question: "Should I do a ramp test or a 20-minute test?",
        answer:
          "Either, as long as you're consistent. Ramp tests are shorter and less mentally taxing but can underestimate FTP for some riders. The 20-minute test is more demanding and slightly more accurate when paced well. Pick one and keep using it.",
      },
      {
        question: "Why do I take 95% of my 20-minute power?",
        answer:
          "Because FTP is defined as roughly the power you could hold for an hour, and 20 minutes all-out overstates that. The 5% reduction approximates the drop-off from a 20-minute effort to a true one-hour sustainable power.",
      },
      {
        question: "How often should I test FTP?",
        answer:
          "Every 6–8 weeks, ideally at the end of a training block. Testing every 4 weeks is too aggressive — mid-block fatigue masks gains. Testing once or twice a year is too rare — your zones drift and your training intensity becomes guesswork.",
      },
      {
        question: "Is an indoor or outdoor FTP test more accurate?",
        answer:
          "Neither is inherently more accurate, but they often produce different numbers — indoor power can read lower due to heat and lack of cooling. Test in the environment you mostly train in, and don't compare indoor results to outdoor ones.",
      },
      {
        question: "Can I estimate FTP without a formal test?",
        answer:
          "You can estimate from a recent hard hour or a race, usually within 5–10% of reality. That's fine for setting initial zones, but not precise enough for prescribing exact threshold or VO2max work, where 5% is the difference between adaptation and over-reaching.",
      },
      {
        question: "Do I need to test FTP if I use TrainerRoad or similar?",
        answer:
          "Less often. Adaptive platforms infer FTP from session quality, so you may not need formal tests as frequently. Most coached athletes still run a periodic test every 8–12 weeks to sanity-check the algorithm.",
      },
    ],
    relatedEpisodes: [
      "ep-40-how-joe-friel-structures-the-ideal-cycling-training-week",
      "ep-2148-80-20-training-to-ride-faster-dr-stephen-seiler",
      "ep-2026-ftp-jumped-30-watts-after-this-workout",
    ],
    relatedTopics: [
      { label: "FTP Ramp Test vs 20-Minute Test", href: "/compare/ftp-ramp-test-vs-20-minute" },
      { label: "FTP Zone Calculator", href: "/tools/ftp-zones" },
      { label: "How often should I test FTP?", href: "/answers/how-often-test-ftp" },
      { label: "How do I improve my FTP?", href: "/answers/how-to-improve-ftp" },
      { label: "FTP Training — Topic Hub", href: "/topics/ftp-training" },
    ],
    evidenceLevel: "strong",
    evidenceNote:
      "FTP testing protocols are well established; prep and frequency guidance corroborated by Joe Friel and standard power-training practice.",
    publishDate: "2026-05-25",
    updatedDate: "2026-05-25",
  },

  // ============================================================
  // 9 — WHAT TO EAT BEFORE CYCLING
  // ============================================================
  {
    slug: "what-to-eat-before-cycling",
    cluster: "nutrition",
    question: "What Should I Eat Before a Long Ride?",
    seoTitle: "What to Eat Before a Long Bike Ride",
    seoDescription:
      "What to eat before a long ride: a carb-focused meal of 1–4g/kg 1–4 hours before, lower in fat and fibre. Plus what to eat the night before, and why fasted long rides usually backfire.",
    pillar: "nutrition",
    directAnswer:
      "Eat a carbohydrate-focused meal 1–4 hours before a long ride — roughly 1–4g of carbs per kg of bodyweight, scaled to how much time you have. Keep it lower in fat and fibre so it digests cleanly: porridge, toast and honey, rice, or a bagel. The night before a big ride, eat a normal carb-rich dinner. Then start fuelling on the bike from ~30–45 minutes in. Don't ride long fasted.",
    keyTakeaways: [
      "Pre-ride meal: 1–4g carbs/kg, 1–4 hours before, low fat and fibre.",
      "More time before the ride = bigger meal; 30 minutes before = a small, simple carb snack.",
      "Carb-load the night before with a normal carb-rich dinner, not a feast.",
      "Don't ride long fasted — fuel the work, then keep fuelling on the bike.",
    ],
    whoFor: [
      {
        label: "The weekend long-ride rider",
        detail:
          "You're heading out for 2+ hours and want to fuel the start properly.",
      },
      {
        label: "The early-morning rider",
        detail:
          "You ride first thing and aren't sure what — or whether — to eat beforehand.",
      },
    ],
    roadmanView: [
      "The cycling internet has a romance with fasted riding — the idea that starving the engine teaches it to burn fat. Anthony's tested it and his verdict is plain: ride long fasted and you end up bonking 60k from home, hating your life, and producing rubbish training. There's a place for short, easy fasted spins, but a long or hard ride is not it.",
      "What to actually eat is simpler than the supplement aisle suggests. Carbohydrate is the fuel that matters before a ride, and the key variables are timing and digestibility. Three or four hours out, you can eat a proper meal — porridge, eggs and toast, rice. Thirty minutes out, you want something small and fast: a banana, toast and honey, a gel. Keep fat and fibre down so your stomach isn't still working when the road tilts up.",
      "And the meal before doesn't end your fuelling — it starts it. The pre-ride meal tops up the tank; the on-bike fuelling keeps it full. Get both right and your power is still there in the back third, which is exactly where most amateurs lose their ride.",
    ],
    expertEvidence: [
      {
        name: "Dr Sam Impey",
        credential: "Sports nutritionist",
        insight:
          "Fuelling for performance starts before the wheels turn. Going into a long ride under-fuelled to 'save calories' caps the quality of the session and the adaptation you get from it — you can't out-train an empty tank.",
        episodeSlug: "ep-2092-sports-nutritionist-the-one-food-thats-slowing-us-down",
        guestSlug: "sam-impey",
      },
      {
        name: "Dr Michael Ormsbee",
        credential: "Sports nutrition researcher",
        insight:
          "What you eat around training, including before bed the night before, shapes recovery and how ready your muscles are to work. Protein and carbohydrate timing isn't just an after-thought — it sets up the next day's ride.",
        episodeSlug: "ep-27-protein-before-bed-builds-cyclists-muscles-faster-new-study",
        guestSlug: "michael-ormsbee",
      },
    ],
    practicalApplication: [
      {
        title: "Match the meal to the clock",
        detail:
          "3–4 hours out: a full carb-rich meal (porridge, eggs and toast, rice — 3–4g carbs/kg). 1–2 hours out: something lighter (toast and honey, a banana and a bagel — 1–2g/kg). 30 minutes out: a small fast carb (a banana or gel).",
      },
      {
        title: "Keep it low fat and low fibre",
        detail:
          "Save the big high-fibre, high-fat breakfast for after the ride. Before, you want carbs that clear your stomach quickly so you're not digesting on the first climb.",
      },
      {
        title: "Carb-load the night before",
        detail:
          "For a long or hard ride, eat a normal carb-rich dinner — pasta, rice, potatoes. You're topping up glycogen, not stuffing yourself; a sensible portion the night before beats a panic feast at breakfast.",
      },
      {
        title: "Start on-bike fuelling early",
        detail:
          "Begin eating on the bike from 30–45 minutes in, aiming for ~60g carbs/hr on rides over 90 minutes. The pre-ride meal is the start of fuelling, not the whole of it.",
      },
    ],
    commonMistakes: [
      {
        mistake: "Riding long fasted to 'burn more fat'.",
        fix:
          "Fuel long and hard rides. Save fasted riding for short, easy spins — otherwise you bonk and the session is wasted.",
      },
      {
        mistake: "A big fatty, high-fibre breakfast right before rolling out.",
        fix:
          "Keep the pre-ride meal carb-focused and easy to digest. High fat and fibre sit heavy and cause GI trouble on the bike.",
      },
      {
        mistake: "Treating the pre-ride meal as the whole fuelling plan.",
        fix:
          "It tops up the tank; on-bike carbs keep it full. Start eating on the bike before you feel empty.",
      },
    ],
    faq: [
      {
        question: "What should I eat 1 hour before cycling?",
        answer:
          "Something small, carb-focused and easy to digest — a banana, toast with honey, a bagel, or a small bowl of oats, around 1–2g of carbs per kg of bodyweight. Keep fat and fibre low so it clears your stomach before you start working hard.",
      },
      {
        question: "Should I eat before an early morning ride?",
        answer:
          "For anything long or hard, yes — even a small carb snack like a banana or toast and honey is worth it. For a short, easy spin you can ride fasted, but fuel before you head out for anything over an hour or anything with intensity.",
      },
      {
        question: "Is it OK to ride fasted?",
        answer:
          "For short, easy rides, fine. For long or hard rides, Anthony's experience and most evidence say it backfires — you bonk, the quality drops, and you don't actually gain the metabolic benefit people hope for. Fuel the work that needs fuelling.",
      },
      {
        question: "What should I eat the night before a long ride?",
        answer:
          "A normal carb-rich dinner — pasta, rice, potatoes with a protein source — to top up glycogen. You don't need a huge carb-loading feast for a single long ride; a sensible, carb-forward meal does the job.",
      },
      {
        question: "How long before a ride should I stop eating?",
        answer:
          "A full meal wants 2–4 hours to digest; a small snack can go in 30–60 minutes before. The closer to the start, the smaller and simpler the food should be, so your stomach isn't still working when you are.",
      },
      {
        question: "What about coffee before a ride?",
        answer:
          "Caffeine is one of the best-supported performance aids in endurance sport, so a coffee before a ride is fine and often helpful. Just pair it with carbohydrate rather than using it to replace food — caffeine sharpens the effort, it doesn't fuel it.",
      },
    ],
    relatedEpisodes: [
      "ep-2092-sports-nutritionist-the-one-food-thats-slowing-us-down",
      "ep-2035-world-tour-nutritionist-we-got-fuelling-wrong",
      "ep-27-protein-before-bed-builds-cyclists-muscles-faster-new-study",
    ],
    relatedTopics: [
      { label: "Cycling Nutrition — Topic Hub", href: "/topics/cycling-nutrition" },
      { label: "Fuelling Calculator", href: "/tools/fuelling" },
      { label: "How many carbs per hour for cycling?", href: "/answers/carbs-per-hour-cycling" },
      { label: "In-Ride Nutrition Guide", href: "/blog/cycling-in-ride-nutrition-guide" },
      { label: "Fuelled vs Fasted Sessions", href: "/compare/fueled-vs-fasted-sessions" },
    ],
    evidenceLevel: "strong",
    evidenceNote:
      "Pre-ride carbohydrate guidance is well established; corroborated by Dr Sam Impey and the Roadman fuelling coverage.",
    publishDate: "2026-05-25",
    updatedDate: "2026-05-25",
  },

  // ============================================================
  // 10 — HOW MANY HOURS TRAINING
  // ============================================================
  {
    slug: "how-many-hours-training",
    cluster: "periodisation",
    question: "How Many Hours Per Week Should Cyclists Train?",
    seoTitle: "How Many Hours a Week Should Cyclists Train?",
    seoDescription:
      "How many hours a week cyclists should train: 4–6 for steady gains, 8–12 for serious amateurs, 6 the rough minimum for structured progress. Why consistency beats peak hours.",
    pillar: "coaching",
    directAnswer:
      "Most serious amateurs make strong progress on 6–10 hours a week, with 8–12 the range for competitive riders. You can improve on as little as 4–6 hours if the quality and consistency are right. Below about 4 hours, gains slow and you're mostly maintaining. The number that matters isn't your peak week — it's the hours you repeat, week after week, without breaking down.",
    keyTakeaways: [
      "4–6 hours: real gains possible with good structure and consistency.",
      "6–10 hours: the productive range for most serious amateurs.",
      "8–12 hours: competitive amateur territory.",
      "Consistency beats peak volume — the repeatable week wins.",
    ],
    whoFor: [
      {
        label: "The time-crunched professional",
        detail:
          "You've got a career and family and want to know what's actually enough.",
      },
      {
        label: "The rider planning a season",
        detail:
          "You're deciding how many hours to commit to and how to spend them.",
      },
    ],
    roadmanView: [
      "Riders ask 'how many hours?' hoping for a big number that justifies the suffering. The more useful question is 'how many hours can I repeat every week for a year without falling apart?' Anthony has interviewed coaches behind Grand Tour riders, and the through-line is consistency, not heroics — the rider who holds eight steady hours a week for a season beats the one who does fifteen in March and burns out by May.",
      "For most serious amateurs, 6–10 hours a week is the productive range. You can get genuinely fitter on 4–6 if the structure is right — two quality sessions plus easy filler. Competitive amateurs push into 8–12. But more hours only help if you can recover from them, fuel them, and keep showing up. Volume you can't sustain isn't training, it's a countdown to a break.",
      "So set your weekly hours at a level you can defend through a busy week at work, not your best week ever. Then make those hours count: protect the easy ones, sharpen the hard ones, and let consistency do what a heroic block never will.",
    ],
    expertEvidence: [
      {
        name: "Joe Friel",
        credential: "Author of The Cyclist's Training Bible",
        insight:
          "How you structure the week matters more than squeezing in extra hours. A well-built week with the right balance of easy volume and targeted intensity produces more than a bigger, disorganised one.",
        episodeSlug: "ep-40-how-joe-friel-structures-the-ideal-cycling-training-week",
        guestSlug: "joe-friel",
      },
      {
        name: "Professor Stephen Seiler",
        credential: "Exercise physiologist, polarised-training researcher",
        insight:
          "What you do with your hours — the easy/hard distribution — matters more than the raw total. Get the 80/20 split right and modest weekly hours go a long way; get it wrong and extra volume just adds fatigue.",
        episodeSlug: "ep-2148-80-20-training-to-ride-faster-dr-stephen-seiler",
        guestSlug: "stephen-seiler",
      },
    ],
    practicalApplication: [
      {
        title: "Set a defensible weekly number",
        detail:
          "Pick the hours you can hit in a normal busy week, not your best week. For most amateurs that's 6–8. Consistency at that number beats a bigger figure you abandon.",
      },
      {
        title: "Spend the hours polarised",
        detail:
          "Whatever your total, keep ~80% easy and ~20% hard. On 6 hours that might be two short quality sessions plus easy riding; on 12 it's more easy volume around the same two-to-three hard sessions.",
      },
      {
        title: "Add hours gradually",
        detail:
          "If you want to build volume, raise it ~10% at a time and hold for a few weeks before adding more. Big jumps in weekly hours are a reliable route to illness, injury or burnout.",
      },
    ],
    commonMistakes: [
      {
        mistake: "Chasing a big peak week you can't repeat.",
        fix:
          "Train to your sustainable weekly number. The repeatable week, held all season, beats one heroic block.",
      },
      {
        mistake: "Assuming more hours always means more fitness.",
        fix:
          "Hours only help if you recover from and fuel them. Distribution and consistency matter more than the raw total.",
      },
      {
        mistake: "Jumping weekly volume up by big increments.",
        fix:
          "Build by ~10% at a time. Sudden volume spikes lead to illness, injury and burnout, not adaptation.",
      },
    ],
    faq: [
      {
        question: "Can I get fit on 4 hours a week?",
        answer:
          "Yes. With two quality sessions and easy filler riding, 4–6 hours a week produces real gains for most amateurs, especially if you've been training unstructured. Below about 4 hours you're mostly maintaining rather than progressing.",
      },
      {
        question: "How many hours do competitive amateurs train?",
        answer:
          "Usually 8–12 hours a week, sometimes more in build phases. But the strongest amateurs aren't necessarily the highest-volume ones — they're the most consistent, with the best easy/hard distribution and the best recovery.",
      },
      {
        question: "Is it better to train more hours or train harder?",
        answer:
          "Neither in isolation. The best results come from enough easy volume plus a small dose of properly hard work — the polarised model. Piling on hours or piling on intensity alone both stall sooner than a balanced, consistent week.",
      },
      {
        question: "How should I split my weekly training hours?",
        answer:
          "Roughly 80% easy, 20% hard, regardless of total. On lower hours that's two quality sessions plus easy riding; on higher hours it's more easy volume around the same two or three hard sessions. Protect the easy time.",
      },
      {
        question: "Will training more make me faster?",
        answer:
          "Only up to the point you can recover from and fuel it. Beyond that, extra hours add fatigue without adaptation. Most amateurs gain more by improving the quality and consistency of moderate hours than by adding volume they can't sustain.",
      },
      {
        question: "How many rest days should I take?",
        answer:
          "At least one full rest day a week for most amateurs, and more around hard blocks or after 40. Rest days aren't lost training — they're when the adaptation from your hard work actually happens.",
      },
    ],
    relatedEpisodes: [
      "ep-40-how-joe-friel-structures-the-ideal-cycling-training-week",
      "ep-2148-80-20-training-to-ride-faster-dr-stephen-seiler",
      "ep-2-secret-to-zone-2-training-dose-frequency-duration",
    ],
    relatedTopics: [
      { label: "Cycling Training Plans — Topic Hub", href: "/topics/cycling-training-plans" },
      { label: "How to Periodise Your Season", href: "/blog/how-to-periodise-cycling-season" },
      { label: "How much Zone 2 should I do?", href: "/answers/how-much-zone-2" },
      { label: "Volume vs Intensity", href: "/compare/volume-vs-intensity" },
      { label: "How should cyclists train over 40?", href: "/answers/cycling-training-over-40" },
    ],
    evidenceLevel: "moderate",
    evidenceNote:
      "Training-hours guidance reflects coaching consensus (Friel, Seiler) and Roadman coaching practice rather than a single controlled study.",
    publishDate: "2026-05-25",
    updatedDate: "2026-05-25",
  },
];

export const ANSWER_PAGES: AnswerPage[] = [
  ...BASE_ANSWERS,
  ...ftpAnswers,
  ...zone2Answers,
  ...nutritionAnswers,
  ...strengthAnswers,
  ...recoveryAnswers,
  ...mastersAnswers,
  ...racingAnswers,
  ...periodisationAnswers,
  ...powerAnswers,
  ...mentalAnswers,
  ...bikefitAnswers,
  ...heatAnswers,
  ...crossTrainingAnswers,
  ...metricsAnswers,
  ...trainingPhysiologyAnswers,
  ...wave3Answers,
  ...cyclingTechAnswers,
];

const ANSWER_MAP = new Map(ANSWER_PAGES.map((a) => [a.slug, a]));

export function getAllAnswers(): AnswerPage[] {
  return ANSWER_PAGES;
}

export function getAllAnswerSlugs(): string[] {
  return ANSWER_PAGES.map((a) => a.slug);
}

export function getAnswerBySlug(slug: string): AnswerPage | null {
  return ANSWER_MAP.get(slug) ?? null;
}

export function getAnswersByCluster(cluster: AnswerCluster): AnswerPage[] {
  return ANSWER_PAGES.filter((a) => a.cluster === cluster);
}
