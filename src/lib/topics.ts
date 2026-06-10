import fs from "node:fs";
import path from "node:path";
import { getAllPosts, type BlogPostMeta } from "./blog";
import { getAllEpisodes, type EpisodeMeta } from "./podcast";
import { type ContentPillar } from "@/types";
import { type CitedClaim } from "@/components/ui/CitedClaimTable";

export interface TopicHub {
  slug: string;
  title: string;
  headline: string;
  description: string;
  pillar: ContentPillar;
  keywords: string[];
  /**
   * Short noun phrase used in the commercial CTA headline
   * ("GET COACHED ON {ctaHeadline}"). Hand-written per topic because
   * slicing the topic headline programmatically produces broken
   * phrases like "GET COACHED ON FUEL SMARTER, RIDE".
   */
  ctaHeadline: string;
  posts: BlogPostMeta[];
  episodes: EpisodeMeta[];
  tools: TopicTool[];
  commercialPath: string;
  relatedTopics: string[];
  featuredPostSlugs: string[];
  /**
   * Long-form pillar content (MDX). Rendered between the hero and the
   * article grid on /topics/[slug] when present. Source files live at
   * `content/topics/<slug>.mdx`. Lets thin hub pages (previously just a
   * one-paragraph description + link list) carry the 2,000-3,000 words
   * of pillar prose that Google and AI search models reward with
   * ranking/citation for "cycling X" head-term queries.
   */
  pillarContent: string | null;
  /**
   * Optional structured claim table for the topic — rendered above the
   * pillar content when present. Each row is a claim → Roadman position
   * → evidence source → practical implication, with an optional
   * `evidenceLevel` chip per row.
   */
  citedClaims: CitedClaim[];
  claimsHeading?: string;
  claimsCaption?: string;
  /**
   * Question/answer pairs for the hub, derived from the topic's own
   * content. Rendered as a visible <details> accordion AND emitted as
   * FAQPage JSON-LD so the structured data has on-page content behind it
   * (Google requires FAQ answers be visible to users). Answers are kept
   * to 2-3 authoritative sentences.
   */
  faqs: TopicFAQ[];
}

export interface TopicTool {
  slug: string;
  title: string;
  href: string;
}

export interface TopicFAQ {
  question: string;
  answer: string;
}

/**
 * Topic hubs — curated landing pages that group related content.
 * Each one targets a high-value keyword cluster.
 */
const TOPIC_DEFINITIONS: Omit<TopicHub, "posts" | "episodes" | "tools" | "commercialPath" | "relatedTopics" | "featuredPostSlugs" | "pillarContent" | "citedClaims" | "claimsHeading" | "claimsCaption" | "faqs">[] = [
  {
    slug: "ftp-training",
    title: "FTP Training for Cyclists — The Complete Evidence-Based Guide",
    headline: "FTP TRAINING — THE COMPLETE GUIDE",
    ctaHeadline: "FTP TRAINING BUILT AROUND YOUR NUMBERS.",
    description:
      "The complete guide to FTP training. How to test, train, and improve your Functional Threshold Power — grounded in conversations with Professor Seiler, Dan Lorang, and 1,400+ podcast episodes.",
    pillar: "coaching",
    keywords: [
      "ftp training",
      "ftp cycling",
      "ftp zones",
      "improve ftp",
      "ftp test",
      "functional threshold power",
      "ftp plateau",
    ],
  },
  {
    slug: "cycling-nutrition",
    title: "Cycling Nutrition — The Complete Evidence-Based Guide",
    headline: "FUEL SMARTER, RIDE FASTER",
    ctaHeadline: "FUELLING BUILT INTO YOUR TRAINING WEEK.",
    description:
      "The complete guide to fuelling for cycling performance. In-ride nutrition, race weight, body composition, protein, hydration, and the science of eating to ride faster — from the Roadman Cycling Podcast.",
    pillar: "nutrition",
    keywords: [
      "cycling nutrition",
      "cycling diet",
      "what to eat cycling",
      "cycling fuelling",
      "endurance nutrition",
      "cycling weight loss",
    ],
  },
  {
    slug: "cycling-training-plans",
    title: "Cycling Training Plans — How to Structure Your Training Year",
    headline: "TRAIN WITH PURPOSE",
    ctaHeadline: "A PLAN BUILT AROUND YOUR LIFE.",
    description:
      "How to build a cycling training plan that actually works. Periodisation, weekly structure, time-crunched plans, event preparation, and the framework used by World Tour coaches — adapted for amateurs.",
    pillar: "coaching",
    keywords: [
      "cycling training plan",
      "cycling periodisation",
      "polarised training cycling",
      "cycling training structure",
      "base training cycling",
    ],
  },
  {
    slug: "cycling-recovery",
    title: "Cycling Recovery — The Complete Evidence-Based Guide",
    headline: "RECOVER HARDER",
    ctaHeadline: "RECOVERY, PLANNED — NOT ASSUMED.",
    description:
      "Recovery is where adaptation happens — not on the bike. Sleep, nutrition, active recovery, and stress management for cyclists who want to get faster without breaking down.",
    pillar: "recovery",
    keywords: [
      "cycling recovery",
      "cycling injury prevention",
      "cycling knee pain",
      "sleep cycling performance",
      "cycling comeback",
    ],
  },
  {
    slug: "cycling-strength-conditioning",
    title: "Strength Training for Cyclists — The Complete Guide",
    headline: "STRONGER OFF THE BIKE, FASTER ON IT",
    ctaHeadline: "STRENGTH WORK, PERIODISED WITH YOUR RIDING.",
    description:
      "Cycling-specific strength training: what exercises to do, what loads, how often, and how to periodise gym work alongside your bike training. Evidence-based, coach-approved.",
    pillar: "strength",
    keywords: [
      "strength training for cyclists",
      "strength training for cyclists over 40",
      "cycling-specific strength training",
      "cycling gym exercises",
      "cycling gym exercises best",
      "best exercises for cyclists",
      "core workout for cyclists",
      "masters cyclist strength training",
      "s&c for cyclists",
      "gym programme for cyclists",
      "cycling stretching routine",
      "in-season strength cycling",
      "structured strength training cycling",
      "strength training cycling performance",
    ],
  },
  {
    slug: "cycling-weight-loss",
    title: "Cycling & Weight Loss",
    headline: "LOSE WEIGHT WITHOUT LOSING POWER",
    ctaHeadline: "LOSE WEIGHT WITHOUT LOSING WATTS.",
    description:
      "How to lose weight while cycling without sacrificing performance. Body composition, fuel for the work required, and the mistakes that keep cyclists heavy.",
    pillar: "nutrition",
    keywords: [
      "cycling weight loss",
      "lose weight cycling",
      "cycling body composition",
      "power to weight ratio",
      "cycling diet plan",
    ],
  },
  {
    slug: "cycling-beginners",
    title: "Getting Into Cycling",
    headline: "START HERE",
    ctaHeadline: "A COACHED START — WHEN YOU'RE READY.",
    description:
      "Everything a new cyclist needs to know. Group ride etiquette, bike fit, gravel cycling, tyre pressure, and the culture of the sport.",
    pillar: "community",
    keywords: [
      "beginner cycling",
      "start cycling",
      "cycling tips beginners",
      "group ride etiquette",
      "cycling basics",
    ],
  },
  {
    slug: "triathlon-cycling",
    title: "Cycling for Triathletes — The Bike Leg Specialist",
    headline: "OWN THE BIKE LEG",
    ctaHeadline: "BIKE COACHING THAT PROTECTS YOUR RUN.",
    description:
      "Everything a triathlete needs to get faster on the bike. FTP pacing, bike nutrition, aero position, power-to-weight, and off-season bike training — from the podcast trusted by Alistair Brownlee and Olav Bu.",
    pillar: "coaching",
    keywords: [
      "triathlon cycling",
      "triathlon bike training",
      "ironman bike pacing",
      "triathlon cycling plan",
      "cycling for triathletes",
      "triathlon bike nutrition",
      "triathlon ftp",
    ],
  },
  {
    slug: "mountain-biking",
    title: "Mountain Biking — Setup, Skills & Routes",
    headline: "DIAL IN YOUR MTB",
    ctaHeadline: "GET FITTER ON THE BIKE — ROAD OR DIRT.",
    description:
      "Everything you need to set up, ride, and maintain your mountain bike. Suspension setup, tyre pressure, fork tuning, trail guides, and the best MTB routes in Ireland.",
    pillar: "community",
    keywords: [
      "mountain bike setup",
      "mtb tyre pressure",
      "fork setup mtb",
      "mountain bike suspension",
      "mtb routes ireland",
      "mountain biking tips",
      "mtb trail guide",
      "mountain bike beginners",
    ],
  },
  {
    slug: "cycling-coaching",
    title: "Cycling Coaching — Online & In-Person",
    headline: "THE COMPLETE GUIDE TO CYCLING COACHING",
    ctaHeadline: "STOP GUESSING. START PROGRESSING.",
    description:
      "The complete guide to cycling coaching. When to get a coach, what to look for, how online coaching works, and why most cyclists plateau without structured guidance. Built from 1,400+ podcast conversations with the coaches behind World Tour teams.",
    pillar: "coaching",
    keywords: [
      "cycling coach",
      "cycling coaching",
      "online cycling coach",
      "cycling coaching program",
      "is a cycling coach worth it",
      "personalised cycling training plan",
      "cycling coach ireland",
      "cycling coach uk",
    ],
  },
  {
    slug: "against-the-clock",
    title: "Against the Clock: Cycling and the Race Against Time",
    headline: "AGAINST THE CLOCK",
    ctaHeadline: "COACHING THAT MAKES EVERY SECOND COUNT.",
    description:
      "Everything in cycling settled by the clock — the Hour Record, the time trial, and the watches that ended up on the wrist. This is the home for cycling's oldest obsession: the race against time.",
    pillar: "community",
    keywords: [
      "hour record cycling",
      "cycling time trial",
      "race of truth cycling",
      "cycling watches",
      "richard mille cycling",
      "tudor pro cycling",
      "dan bigham hour record",
      "cycling and time",
    ],
  },
];

/** Map of topic slugs to relevant blog post slugs */
const TOPIC_POST_MAP: Record<string, string[]> = {
  "ftp-training": [
    "ftp-training-zones-cycling-complete-guide",
    "how-to-improve-ftp-cycling",
    "ftp-plateau-breakthrough",
    "sweet-spot-training-cycling",
    "sweet-spot-training-cycling-guide",
    "cycling-vo2max-intervals",
    "vo2max-cycling-fixable-reasons-low",
    "cycling-power-to-weight-ratio-guide",
    "cycling-cadence-optimal-guide",
    "low-cadence-training-cycling-torque-intervals",
    "heart-rate-high-cycling-fixable-reasons",
    "zone-2-vs-endurance-training",
    "steady-state-vs-interval-training-cycling",
    "power-meter-vs-smart-trainer",
    "age-group-ftp-benchmarks-2026",
    "alex-wild-sea-otter-2025-power-data-tactics",
    "cutting-training-half-real-power-data",
    "cycling-hill-repeats-training",
    "cycling-power-meter-guide",
    "ftp-benchmarks-by-age-and-experience",
    "ftp-training-for-triathletes",
    "heat-training-cyclists-30-watts-ftp-protocol",
    "improve-ftp-cycling-evidence-based-methods",
    "lactate-threshold-home-test-cyclists",
    "mental-tools-long-climbs-time-trials",
    "power-meter-training-cyclists-how-to-use",
    "power-meter-training-plan-week-by-week",
    "rpe-and-power-using-them-together",
    "sprint-interval-training-cyclists-masters",
    "sweet-spot-vs-threshold-vs-polarised-comparison",
    "team-visma-breathing-sensor-ventilation-training",
    "triathlon-cycling-power-to-weight",
    "triathlon-ftp-pacing-strategy",
    "uli-schoberer-first-power-meter-cycling-history",
    "what-25-top-coaches-agree-on-about-ftp",
    "what-experts-say-about-zone-2-training",
    "why-your-ftp-is-stuck-five-causes",
    "zone-2-cycling-heart-rate-vs-power-vs-rpe",
    "zone-2-training-complete-guide",
  ],
  "cycling-nutrition": [
    "cycling-in-ride-nutrition-guide",
    "cycling-nutrition-race-day-guide",
    "cycling-energy-gels-guide",
    "cycling-hydration-guide",
    "cycling-fasted-riding-myth",
    "cycling-body-composition-guide",
    "cycling-weight-loss-fuel-for-the-work-required",
    "eating-like-pidcock-60-days",
    "fasted-vs-fueled-cycling",
    "cycling-body-recomposition",
    "cycling-protein-timing-guide",
    "alan-murchison-michelin-star-chef-cycling-nutrition",
    "gut-training-cycling-absorb-more-carbs",
    "bonking-cycling-what-happens-how-to-prevent",
    "electrolytes-sweat-rate-cycling",
    "post-ride-recovery-nutrition-cyclists",
    "carbohydrate-per-hour-cyclists",
    "cycling-carb-loading-protocol-race-week",
    "race-day-fuelling-24-hour-timeline",
    "cycling-nutrition-plan-100-mile-sportive",
    "badlands-800km-fuelling-strategy",
    "nutrition-periodisation-base-build-race",
    "amateur-cyclist-fuelling-benchmarks-report-2026",
    "pre-ride-breakfast-cyclists-guide",
    "post-ride-recovery-window-cyclists-over-40",
    "fuel-for-the-work-required-fftwr-explained",
    "cycling-protein-requirements",
    "bedtime-protein-cyclists-recovery-protocol",
    "cycling-caffeine-performance",
    "creatine-for-cyclists-thirty-day-data",
    "mtb-nutrition-trail-fuelling",
    "triathlon-bike-nutrition-strategy",
    "cycling-nutrition-world-tour-nutritionists",
    "what-experts-say-about-cycling-nutrition",
    "david-dunne-world-tour-nutritionist-cycling-weight-loss",
    "hannah-grant-pro-team-chef-weight-loss",
    "tim-spector-gut-microbiome-cycling-weight-loss",
    "best-roadman-episodes-nutrition",
    "creatine-for-cyclists-30-day-experiment",
    "creatine-for-cyclists-30-day-protocol",
    "tim-spector-gut-microbiome-cyclists",
  ],
  "cycling-training-plans": [
    "cycling-periodisation-plan-guide",
    "polarised-training-cycling-guide",
    "stephen-seiler-research-polarised-training-lessons",
    "cycling-base-training-guide",
    "reverse-periodisation-cycling",
    "winter-training-cycling-guide",
    "cycling-training-full-time-job",
    "cycling-tapering-guide",
    "etape-du-tour-training-plan",
    "wicklow-200-training-plan",
    "ring-of-beara-training-plan",
    "ride-london-training-plan",
    "fred-whitton-challenge-training-plan",
    "cycling-indoor-training-tips",
    "zone-2-training-complete-guide",
    "trainerroad-vs-online-cycling-coach",
    "self-coached-cyclist-mistakes",
    "how-pro-cyclist-trains-60-days",
    "zwift-vs-trainerroad",
    "indoor-trainer-vs-rollers",
    "70-3-bike-training-plan-12-weeks",
    "aero-position-training-for-triathletes",
    "aerobic-decoupling-cycling-cardiac-drift",
    "badlands-training-guide",
    "best-cycling-training-podcasts-age-groupers",
    "biggest-training-mistakes-from-coaches",
    "comeback-cyclist-12-week-return-plan",
    "common-training-mistakes-from-1400-podcast-episodes",
    "cutting-training-half-real-power-data",
    "cycling-altitude-training",
    "cycling-heat-training-guide",
    "cycling-heat-training-protocol-at-home",
    "cycling-hill-repeats-training",
    "cycling-interval-training-beginners",
    "cycling-over-50-training",
    "cycling-periodisation-friel-lorang-johnson",
    "cycling-podcasts-for-indoor-training",
    "cycling-taper-race-preparation-system",
    "cycling-training-plan-build-friel-lorang-johnson",
    "cycling-training-plan-masters-over-40",
    "cycling-vo2max-intervals",
    "cycling-zwift-training-guide",
    "dan-lorang-amateur-training-plan",
    "dragon-ride-training-guide",
    "dylan-johnson-oscillation-training-plan",
    "efficiency-factor-cycling-masters",
    "ftp-training-for-triathletes",
    "ftp-training-zones-cycling-complete-guide",
    "gran-fondo-nyc-training-guide",
    "gran-fondo-training-plan-12-weeks",
    "haute-route-alps-training-guide",
    "heat-training-cyclists-30-watts-ftp-protocol",
    "how-many-bike-hours-per-week-for-70-3",
    "how-to-get-faster-cycling",
    "how-to-improve-ftp-cycling",
    "how-to-periodise-cycling-season",
    "how-to-read-your-trainingpeaks-workout",
    "how-to-structure-cycling-training-plan",
    "improve-ftp-cycling-evidence-based-methods",
    "indoor-cycling-for-triathletes-winter-plan",
    "indoor-vs-outdoor-cycling-training-when-each-wins",
    "ironman-bike-training-plan-16-weeks",
    "jay-vine-less-training-made-him-faster",
    "jay-vine-less-training-made-me-faster",
    "john-wakefield-team-bora-endurance-training",
    "leadville-100-training-guide",
    "leroica-training-guide",
    "low-cadence-training-cycling-torque-intervals",
    "low-cadence-training-world-tour-coaches",
    "mallorca-312-training-guide",
    "maratona-dles-dolomites-training-guide",
    "masters-cycling-training-report-2026",
    "matt-bottrill-7-pro-hacks",
    "mesocycle-training-explained-cyclists",
    "michael-matthews-no-base-miles-pro-training",
    "new-study-confirms-heavy-strength-training-beats-more-miles-after-40",
    "otztaler-radmarathon-training-guide",
    "personalised-cycling-training-plan-why-generic-plans-fail",
    "polarised-training-cycling-world-tour-prescription",
    "polarised-training-cycling-complete-guide",
    "sweet-spot-training-cycling-guide",
    "masters-cycling-training-plan-over-40",
    "cycling-over-40-complete-guide",
    "ride-faster-less-effort-cycling-durability",
    "polarised-vs-sweet-spot-training",
    "power-meter-training-cyclists-how-to-use",
    "power-meter-training-plan-week-by-week",
    "power-meter-vs-smart-trainer",
    "raid-pyreneen-training-guide",
    "reading-your-training-data-tss-ctl-atl-tsb",
    "rosa-kloser-unbound-2024-simple-training-plan",
    "sprint-interval-training-cyclists-masters",
    "steady-state-vs-interval-training-cycling",
    "sweet-spot-training-cycling",
    "sweet-spot-vs-threshold-vs-polarised-comparison",
    "time-crunched-cyclist-8-hours-week",
    "triathlon-cycling-training-plan",
    "triathlon-off-season-cycling",
    "unbound-gravel-200-training-guide",
    "vo2max-training-cyclists-seven-reasons",
    "what-cycling-podcasts-got-wrong-about-polarised-training",
    "what-dan-lorang-says-about-endurance",
    "what-experts-say-about-zone-2-training",
    "what-pros-say-about-amateur-training",
    "what-stephen-seiler-says-about-polarised-training",
    "why-pros-train-so-easy-mixed-metabolism-zone",
    "winter-cycling-training-indoor-protocol-pros",
    "zone-2-cycling-heart-rate-vs-power-vs-rpe",
    "zone-2-vs-endurance-training",
  ],
  "cycling-recovery": [
    "cycling-recovery-tips",
    "cycling-sleep-performance-guide",
    "cycling-sleep-optimisation",
    "cycling-active-recovery-explained",
    "cycling-knee-pain-causes-fixes",
    "bike-fit-guide-cyclists",
    "cycling-returning-after-break",
    "cycling-stretching-routine",
    "cycling-overtraining-signs-guide",
    "cycling-active-recovery-rides-guide",
    "cycling-hrv-training-guide",
    "cycling-rest-week-guide",
    "cycling-back-pain-fixes",
    "cycling-recovery-week-what-to-actually-do",
    "knee-pain-cycling-what-to-check-first",
    "masters-recovery-audit-seven-things-to-check",
    "post-ride-recovery-window-cyclists-over-40",
    "recovery-for-cyclists-world-tour-protocols",
    "travel-fatigue-cycling-pre-event-protocol",
  ],
  "cycling-strength-conditioning": [
    "cycling-strength-training-guide",
    "cycling-stretching-routine",
    "cycling-knee-pain-causes-fixes",
    "cycling-gym-exercises-best",
    "cycling-core-workout-routine",
    "cycling-leg-day-should-cyclists",
    "yoga-for-cyclists-guide",
    "new-study-confirms-heavy-strength-training-beats-more-miles-after-40",
    "cycling-over-40-complete-guide",
    "cycling-deadlift-guide",
    "cycling-mobility-routine",
    "cycling-strength-training-12-week-beginner-plan",
    "derek-teel-best-exercises-cyclists",
    "glute-activation-cyclists-power-leaks",
    "gym-vs-bike-strength-training-cyclists-research",
    "strength-training-cyclists-complete-guide",
    "strength-training-cyclists-minimum-effective-dose",
    "strength-training-cyclists-over-50",
    "strength-training-for-triathletes-bike-specific",
    "what-experts-say-about-strength-training-cyclists",
  ],
  "cycling-weight-loss": [
    "cycling-weight-loss-fuel-for-the-work-required",
    "cycling-weight-loss-mistakes",
    "cycling-body-composition-guide",
    "cycling-fasted-riding-myth",
    "cycling-power-to-weight-ratio-guide",
    "eating-like-pidcock-60-days",
    "fasted-vs-fueled-cycling",
    "cycling-body-recomposition",
    "cycling-protein-timing-guide",
    "alex-larson-body-composition-cyclists",
    "body-composition-cyclists-lighter-faster-myth",
    "david-dunne-world-tour-nutritionist-cycling-weight-loss",
  ],
  "cycling-beginners": [
    "cycling-group-ride-etiquette-guide",
    "bike-fit-one-change-amateurs-should-make",
    "bike-fit-guide-cyclists",
    "gravel-cycling-beginners-guide",
    "cycling-tyre-pressure-guide",
    "cycling-base-training-guide",
    "cycling-indoor-training-tips",
    "best-cycling-podcasts-2026",
    "wahoo-vs-garmin-cycling-computers",
    "tubeless-vs-clincher-tyres",
    "aero-vs-weight-cyclist",
    "rouvy-vs-zwift",
    "best-gravel-trails-ireland",
    "mtb-bike-fit-basics",
    "mtb-skills-beginners-guide",
    "mtb-tyre-pressure-guide",
    "nathan-haas-gravel-soul-professionalisation",
    "numb-hands-cycling-5-fixes-bike-fit",
    "unbound-gravel-2026-complete-guide",
    "wind-tunnel-aero-gains-gravel-cyclists",
  ],
  "triathlon-cycling": [
    "triathlon-cycling-training-plan",
    "triathlon-ftp-pacing-strategy",
    "triathlon-bike-nutrition-strategy",
    "triathlon-cycling-power-to-weight",
    "triathlon-aero-position-guide",
    "triathlon-off-season-cycling",
    "ftp-training-zones-cycling-complete-guide",
    "zone-2-training-complete-guide",
    "cycling-nutrition-race-day-guide",
    "polarised-training-cycling-guide",
    "70-3-bike-training-plan-12-weeks",
    "ben-hoffman-three-uncommon-habits-triathlete",
    "best-cycling-podcast-for-triathletes",
    "bike-leg-of-triathlon-why-age-groupers-get-it-wrong",
    "brick-workouts-for-ironman",
    "cycling-coach-vs-triathlon-coach",
    "ftp-training-for-triathletes",
    "ger-redmond-prison-pro-mental-method-cyclists",
    "how-many-bike-hours-per-week-for-70-3",
    "how-to-pace-the-bike-in-a-half-ironman",
    "indoor-cycling-for-triathletes-winter-plan",
    "ironman-bike-training-plan-16-weeks",
    "what-wattage-should-you-ride-in-an-ironman",
  ],
  "cycling-coaching": [
    "trainerroad-vs-online-cycling-coach",
    "self-coached-cyclist-mistakes",
    "cycling-periodisation-plan-guide",
    "cycling-training-full-time-job",
    "cycling-over-40-getting-faster",
    "cycling-over-50-training",
    "ftp-plateau-breakthrough",
    "how-to-get-faster-cycling",
    "cycling-base-training-guide",
    "zone-2-training-complete-guide",
    "polarised-training-cycling-guide",
    "stephen-seiler-research-polarised-training-lessons",
    "cycling-sportive-preparation",
    "new-study-confirms-heavy-strength-training-beats-more-miles-after-40",
    "is-a-cycling-coach-worth-it",
    "best-online-cycling-coach-how-to-choose",
    "personalised-cycling-training-plan-why-generic-plans-fail",
    "cycling-coach-near-me-why-location-doesnt-matter-2026",
    "cycling-coaching-for-beginners-when-ready",
    "what-does-a-cycling-coach-do",
    "how-much-does-online-cycling-coach-cost-2026",
    "zwift-vs-cycling-coach",
    "best-cycling-coach-guide",
    "best-cycling-coach-ireland",
    "best-cycling-coach-uk",
    "best-cycling-coach-usa",
    "zwift-vs-trainerroad",
    "power-meter-vs-smart-trainer",
    "best-cycling-coach-masters-riders",
    "biggest-training-mistakes-from-coaches",
    "cycling-coach-vs-triathlon-coach",
    "cycling-coaching-free-trial",
    "cycling-coaching-results-before-and-after",
    "cycling-coaching-testimonials",
    "cycling-training-six-hours-roglic-coach",
    "dan-lorang-amateur-training-plan",
    "five-mistakes-self-coached-cyclists-make",
    "how-to-structure-cycling-training-plan",
    "is-a-cycling-coach-worth-it-case-study",
    "john-wakefield-team-bora-endurance-training",
    "low-cadence-training-cycling-torque-intervals",
    "low-cadence-training-world-tour-coaches",
    "not-done-yet-coaching-review",
    "polarised-training-cycling-world-tour-prescription",
    "polarised-training-cycling-complete-guide",
    "masters-cycling-training-plan-over-40",
    "cycling-over-40-complete-guide",
    "vasilis-anastopoulos-cavendish-sprint-training",
    "what-25-top-coaches-agree-on-about-ftp",
    "what-experts-say-about-masters-cycling",
    "what-experts-say-about-zone-2-training",
  ],
  "mountain-biking": [
    "mtb-fork-setup-guide",
    "mtb-tyre-pressure-guide",
    "mtb-suspension-setup-complete-guide",
    "mtb-dropper-post-setup-guide",
    "best-mtb-trails-ireland",
    "best-mtb-trails-wicklow",
    "best-mtb-trails-belfast",
    "mtb-winter-riding-guide",
    "mtb-tubeless-conversion-guide",
    "mtb-bike-fit-basics",
    "mtb-skills-beginners-guide",
    "best-gravel-trails-ireland",
    "mtb-maintenance-guide",
    "mtb-vs-road-cycling-fitness",
    "mtb-heart-rate-zones-guide",
    "mtb-nutrition-trail-fuelling",
  ],
  // Curated to the horology / time angle: watches, timing history, the Hour
  // Record, and the time trial's "race of truth." Pure aero and generic
  // training pieces (aero-vs-weight, crank length, triathlon aero, headwind
  // tactics, gravel/bikepacking, the Netflix doc, etc.) were stripped out —
  // they diluted the watch-and-time focus this hub is built on.
  "against-the-clock": [
    "against-the-clock-cycling-watches",
    "dan-bigham-aerodynamics-amateur-cyclists",
    "alex-dowsett-pro-cycling-lessons-amateur",
    "ryan-collins-six-hour-velodrome-record-three-tweaks",
    "cycling-time-trial-tips",
    "uli-schoberer-first-power-meter-cycling-history",
  ],
};

/** Cluster enrichment: tools, commercial path, related topics, featured posts, optional claim table */
const TOPIC_ENRICHMENT: Record<string, {
  tools: TopicTool[];
  commercialPath: string;
  relatedTopics: string[];
  featuredPostSlugs: string[];
  citedClaims?: CitedClaim[];
  claimsHeading?: string;
  claimsCaption?: string;
}> = {
  "ftp-training": {
    tools: [
      { slug: "ftp-zones", title: "FTP Zone Calculator", href: "/tools/ftp-zones" },
      { slug: "wkg", title: "W/kg Calculator", href: "/tools/wkg" },
      { slug: "hr-zones", title: "HR Zone Calculator", href: "/tools/hr-zones" },
    ],
    commercialPath: "/coaching",
    relatedTopics: ["cycling-training-plans", "cycling-coaching"],
    featuredPostSlugs: [
      "ftp-training-zones-cycling-complete-guide",
      "how-to-improve-ftp-cycling",
      "ftp-plateau-breakthrough",
    ],
    claimsCaption:
      "Where Roadman lands on the recurring questions about FTP — and the strength of evidence behind each position.",
    citedClaims: [
      {
        claim: "FTP can improve in trained amateurs",
        roadmanPosition:
          "Yes, but the rate of gain depends on training age. Beginners see fast jumps; experienced amateurs need block-by-block patience.",
        evidenceSource:
          "Convergent across Lorang, Wakefield and Friel commentary on the Roadman archive; supported by published training-age research.",
        practicalImplication:
          "Plan in 12-week blocks and judge progress on trend, not single-test jumps.",
        evidenceLevel: "strong",
      },
      {
        claim: "Masters cyclists need more recovery, not less work",
        roadmanPosition:
          "Reduce intensity density and protect sleep. The total volume can stay; the recovery between hard sessions has to grow.",
        evidenceSource:
          "Masters-specific research on adaptation rates plus coaching practice across the Roadman masters interviews.",
        practicalImplication:
          "Cap hard sessions at two per week and add a second easy day before adding any intervals.",
        evidenceLevel: "moderate",
      },
      {
        claim: "A 20-minute test estimates FTP within ~5% for most amateurs",
        roadmanPosition:
          "Close enough to set zones, but only useful if the protocol is repeated identically every retest. Trend beats precision.",
        evidenceSource:
          "Coggan/Allen 20-minute protocol with 95% adjustment; corroborated by athlete data across the Roadman coaching network.",
        practicalImplication:
          "Use the same warm-up, terrain and pacing every time. Retest no more than once every 6–8 weeks.",
        evidenceLevel: "moderate",
      },
    ],
  },
  "cycling-nutrition": {
    tools: [
      { slug: "fuelling", title: "In-Ride Fuelling Calculator", href: "/tools/fuelling" },
      { slug: "energy-availability", title: "Energy Availability Calculator", href: "/tools/energy-availability" },
      { slug: "race-weight", title: "Race Weight Calculator", href: "/tools/race-weight" },
    ],
    commercialPath: "/coaching",
    relatedTopics: ["cycling-weight-loss", "ftp-training"],
    featuredPostSlugs: [
      "cycling-weight-loss-fuel-for-the-work-required",
      "cycling-in-ride-nutrition-guide",
      "fasted-vs-fueled-cycling",
    ],
  },
  "cycling-training-plans": {
    tools: [
      { slug: "ftp-zones", title: "FTP Zone Calculator", href: "/tools/ftp-zones" },
    ],
    commercialPath: "/plan",
    relatedTopics: ["ftp-training", "cycling-coaching"],
    featuredPostSlugs: [
      "polarised-training-cycling-guide",
      "how-to-structure-cycling-training-plan",
      "zone-2-training-complete-guide",
    ],
  },
  "cycling-recovery": {
    tools: [],
    commercialPath: "/coaching",
    relatedTopics: ["cycling-strength-conditioning", "cycling-training-plans"],
    featuredPostSlugs: [
      "cycling-recovery-tips",
      "cycling-sleep-performance-guide",
      "cycling-overtraining-signs-guide",
    ],
  },
  "cycling-strength-conditioning": {
    tools: [],
    commercialPath: "/strength-training",
    relatedTopics: ["cycling-recovery", "ftp-training"],
    featuredPostSlugs: [
      "cycling-strength-training-guide",
      "derek-teel-best-exercises-cyclists",
      "new-study-confirms-heavy-strength-training-beats-more-miles-after-40",
    ],
  },
  "cycling-weight-loss": {
    tools: [
      { slug: "race-weight", title: "Race Weight Calculator", href: "/tools/race-weight" },
      { slug: "energy-availability", title: "Energy Availability Calculator", href: "/tools/energy-availability" },
    ],
    commercialPath: "/coaching",
    relatedTopics: ["cycling-nutrition", "ftp-training"],
    featuredPostSlugs: [
      "cycling-weight-loss-fuel-for-the-work-required",
      "alex-larson-body-composition-cyclists",
      "cycling-power-to-weight-ratio-guide",
    ],
  },
  "cycling-beginners": {
    tools: [
      { slug: "ftp-zones", title: "FTP Zone Calculator", href: "/tools/ftp-zones" },
      { slug: "hr-zones", title: "HR Zone Calculator", href: "/tools/hr-zones" },
      { slug: "tyre-pressure", title: "Tyre Pressure Calculator", href: "/tools/tyre-pressure" },
    ],
    commercialPath: "/start-here",
    relatedTopics: ["ftp-training", "cycling-training-plans"],
    featuredPostSlugs: [
      "how-to-get-faster-cycling",
      "cycling-indoor-training-tips",
      "wahoo-vs-garmin-cycling-computers",
    ],
  },
  "triathlon-cycling": {
    tools: [
      { slug: "ftp-zones", title: "FTP Zone Calculator", href: "/tools/ftp-zones" },
      { slug: "fuelling", title: "In-Ride Fuelling Calculator", href: "/tools/fuelling" },
    ],
    commercialPath: "/coaching/triathletes",
    relatedTopics: ["cycling-nutrition", "cycling-training-plans"],
    featuredPostSlugs: [
      "bike-leg-of-triathlon-why-age-groupers-get-it-wrong",
      "ironman-bike-training-plan-16-weeks",
      "ftp-training-for-triathletes",
    ],
  },
  "mountain-biking": {
    tools: [
      { slug: "shock-pressure", title: "MTB Setup Calculator", href: "/tools/shock-pressure" },
      { slug: "tyre-pressure", title: "Tyre Pressure Calculator", href: "/tools/tyre-pressure" },
    ],
    commercialPath: "/coaching",
    relatedTopics: ["cycling-beginners", "cycling-strength-conditioning"],
    featuredPostSlugs: [
      "mtb-suspension-setup-complete-guide",
      "mtb-fork-setup-guide",
      "best-mtb-trails-ireland",
    ],
  },
  "cycling-coaching": {
    tools: [],
    commercialPath: "/apply",
    relatedTopics: ["ftp-training", "cycling-training-plans"],
    featuredPostSlugs: [
      "is-a-cycling-coach-worth-it",
      "cycling-coaching-results-before-and-after",
      "not-done-yet-coaching-review",
    ],
  },
  "against-the-clock": {
    // No tool strip on this hub — deliberately omitted per the brief.
    tools: [],
    // Route into the Plateau Diagnostic funnel.
    commercialPath: "/go",
    relatedTopics: ["ftp-training", "cycling-coaching"],
    featuredPostSlugs: [
      "against-the-clock-cycling-watches",
      "dan-bigham-aerodynamics-amateur-cyclists",
      "ryan-collins-six-hour-velodrome-record-three-tweaks",
    ],
  },
};

/** Keyword patterns for matching episodes to topics */
const TOPIC_EPISODE_KEYWORDS: Record<string, RegExp> = {
  "ftp-training": /ftp|threshold|power|zones?|watts|watt\/kg/i,
  "cycling-nutrition": /nutri|fuel|diet|eat|food|carb|protein|hydrat|gel|calor/i,
  "cycling-training-plans":
    /train|periodis|plan|base|build|structure|interval|session|polarised|sweet spot|zone 2/i,
  "cycling-recovery": /recov|sleep|injur|pain|rest|adaptation|comeback|break/i,
  "cycling-strength-conditioning": /strength|gym|s&c|stretch|core|muscle|lift/i,
  "cycling-weight-loss": /weight|fat|lean|body comp|diet|kilo|kg|w\/kg/i,
  "cycling-beginners": /beginn|start|new to|etiquette|gravel|tyre|tire|bike fit/i,
  "triathlon-cycling": /triath|ironman|70\.3|half iron|brick|swim.bike|bike.run|t1|t2|aero position|tri bike|tt bike/i,
  "cycling-coaching": /coach|coaching|personalise|structured|methodology|plan.?review|self.?coach|mentor|guided|accountability/i,
  "mountain-biking": /mountain.?bik|mtb|enduro|downhill|trail.?rid|suspension|fork.?setup|sag|shock.?pressur|dropper|trail.?centre/i,
  "against-the-clock":
    /hour record|time.?trial|\btt\b|race of truth|against the clock|contre la montre|\bwatches\b|wristwatch|watchmaker|chronograph|richard mille|velodrome|pursuit|track cycl|track racing|track bike/i,
};

/**
 * Per-topic episode exclusions, matched against the episode TITLE only.
 * The include pattern above matches any episode whose description merely
 * *mentions* a keyword in passing — for against-the-clock that drags in
 * doping, painkiller and general-training episodes that name-drop "time
 * trial" but have nothing to do with horology or the race of truth. This
 * list keeps the hub focused on watches / timing / Hour Record culture.
 * Topics without an entry here are unaffected.
 */
const TOPIC_EPISODE_EXCLUDE: Record<string, RegExp> = {
  "against-the-clock": /\bepo\b|doping|painkiller|drug|cheat|exploding|strength training|over 40/i,
};

/**
 * Hub FAQs — question/answer pairs derived from each topic's own
 * content. Surfaced as a visible accordion and as FAQPage JSON-LD. Three
 * to four questions per hub, answers held to 2-3 authoritative sentences.
 */
const TOPIC_FAQS: Record<string, TopicFAQ[]> = {
  "ftp-training": [
    {
      question: "What is FTP in cycling?",
      answer:
        "FTP (Functional Threshold Power) is the highest power output you can sustain for roughly an hour, measured in watts. It's the anchor for setting training zones, because almost every structured session is prescribed as a percentage of it.",
    },
    {
      question: "How do I test my FTP?",
      answer:
        "The most common field test is a 20-minute all-out effort, with FTP estimated at 95% of your average power. Use the same warm-up, terrain and pacing every time so the number stays comparable, and retest no more than once every six to eight weeks.",
    },
    {
      question: "How long does it take to improve FTP?",
      answer:
        "Beginners often see quick gains in the first few months, while experienced amateurs progress block by block over 8–12 weeks. Judge progress on the trend across several tests rather than a single result, and expect smaller jumps as your training age increases.",
    },
    {
      question: "What is a good FTP for a cyclist?",
      answer:
        "Raw FTP matters less than power-to-weight, measured in watts per kilogram. A fit amateur is often around 3–4 W/kg and competitive club riders 4–5 W/kg, but the only number that matters for your training is your own.",
    },
  ],
  "cycling-nutrition": [
    {
      question: "How many carbs per hour should I eat while cycling?",
      answer:
        "For rides over about 90 minutes, aim for 60–90g of carbohydrate per hour, reaching the higher end only once you've trained your gut to absorb it. Easy rides under an hour usually need little or no fuelling.",
    },
    {
      question: "What should I eat before a long ride?",
      answer:
        "Eat a carbohydrate-rich meal 2–3 hours before — porridge, toast or rice work well — keeping fat and fibre moderate to avoid stomach trouble. Top up with a small snack in the final hour if the ride is long or hard.",
    },
    {
      question: "Should I ride fasted to lose weight?",
      answer:
        "Fasted riding has a place for easy, low-intensity sessions, but it doesn't burn meaningfully more fat over time and it compromises quality on harder days. Fuelling for the work required is the more reliable route to both performance and body composition.",
    },
    {
      question: "How much protein do cyclists need?",
      answer:
        "Endurance cyclists generally need around 1.6–2.0g of protein per kilogram of bodyweight per day, spread across meals. Intakes at the higher end help protect muscle when training hard or eating in a deficit.",
    },
  ],
  "cycling-training-plans": [
    {
      question: "How should I structure a cycling training plan?",
      answer:
        "Build from a base of easy aerobic volume, add targeted intensity as your event approaches, and schedule regular recovery weeks to absorb the work. Periodisation — organising training into progressive blocks — is what separates a plan from random hard riding.",
    },
    {
      question: "What is polarised training?",
      answer:
        "Polarised training keeps most of your riding easy (around 80%) and a small portion genuinely hard (around 20%), with little time in the moderate middle. It's well supported by research and used widely by elite endurance athletes.",
    },
    {
      question: "How many hours a week do I need to train?",
      answer:
        "Meaningful progress is possible on 6–8 structured hours a week, and time-crunched riders still improve on less when the intensity is well placed. Consistency week to week matters far more than the occasional big week.",
    },
    {
      question: "What is base training?",
      answer:
        "Base training is an extended period of mostly easy, aerobic riding that builds endurance, efficiency and the durability to handle harder work later. It's the foundation the rest of the season is built on, not junk miles.",
    },
  ],
  "cycling-recovery": [
    {
      question: "How important is sleep for cycling performance?",
      answer:
        "Sleep is where most adaptation and repair happens, which makes it the highest-leverage recovery tool a cyclist has. Consistently getting 7–9 hours does more for performance than any supplement or gadget.",
    },
    {
      question: "What is active recovery?",
      answer:
        "Active recovery is very easy riding, well below endurance pace, that promotes blood flow without adding training stress. Done correctly it should feel almost too easy; if it leaves you tired, it was too hard.",
    },
    {
      question: "How do I know if I'm overtraining?",
      answer:
        "Persistent fatigue, declining performance, poor sleep, an elevated resting heart rate and low motivation are common warning signs. The fix is almost always more recovery and reduced intensity, not pushing harder.",
    },
    {
      question: "How many rest days should cyclists take?",
      answer:
        "Most cyclists benefit from at least one full rest day a week, plus a lighter recovery week roughly every three to four weeks. Recovery isn't lost fitness — it's when the training you've done actually takes effect.",
    },
  ],
  "cycling-strength-conditioning": [
    {
      question: "Should cyclists lift weights?",
      answer:
        "Yes. Heavy strength training improves economy, power and durability without adding meaningful bulk, and the benefits are especially pronounced for masters cyclists. It complements riding rather than competing with it.",
    },
    {
      question: "What strength exercises are best for cyclists?",
      answer:
        "Compound lower-body lifts — squats, deadlifts and their variations — give the most return, supported by core and single-leg work. Lift heavy for low reps with good form rather than chasing high-rep endurance sets.",
    },
    {
      question: "How often should cyclists strength train?",
      answer:
        "Two sessions a week is enough to build and maintain strength alongside riding, dropping to one in your hardest training or racing periods. Place gym work on harder ride days so easy days stay genuinely easy.",
    },
    {
      question: "Will lifting weights make me too heavy for climbing?",
      answer:
        "No. Cycling-specific strength training builds force and neuromuscular efficiency with minimal mass, so power-to-weight tends to improve. Significant muscle gain needs a calorie surplus and hypertrophy training most cyclists never do.",
    },
  ],
  "cycling-weight-loss": [
    {
      question: "How do I lose weight without losing cycling power?",
      answer:
        "Hold a modest deficit, keep protein high, and fuel your hard sessions so quality doesn't collapse — the tactic known as fuel for the work required. Slow, steady loss protects muscle and watts; crash diets cost you both.",
    },
    {
      question: "What is power-to-weight ratio?",
      answer:
        "Power-to-weight is your sustainable power divided by your bodyweight, expressed in watts per kilogram (W/kg). It's the key metric for climbing, because two riders with the same FTP perform very differently if one is lighter.",
    },
    {
      question: "Is it better to lose weight or gain power?",
      answer:
        "For most amateurs, building power is more sustainable than chasing a low weight and carries less risk to health and performance. The best results usually come from improving power first and trimming weight gradually around it.",
    },
    {
      question: "How fast should cyclists lose weight?",
      answer:
        "Around 0.5kg per week is a sensible ceiling — slow enough to preserve muscle and training quality. Faster loss tends to sacrifice power, immunity and recovery.",
    },
  ],
  "cycling-beginners": [
    {
      question: "How do I start cycling?",
      answer:
        "Begin with consistent, easy rides to build the habit and a base of fitness, prioritising time in the saddle over speed or distance. A basic bike fit and a few group-riding fundamentals make everything more comfortable and safer.",
    },
    {
      question: "What tyre pressure should I run on a road bike?",
      answer:
        "There's no single number — it depends on your weight, tyre width and the road surface. Most riders run higher than they need; wider tyres at lower pressure are often faster and far more comfortable.",
    },
    {
      question: "How do I behave on a group ride?",
      answer:
        "Hold a steady line, point out hazards, never overlap wheels, and take smooth turns on the front. Good etiquette keeps everyone safe and is the fastest way to be welcomed back.",
    },
    {
      question: "How often should a beginner cycle?",
      answer:
        "Three to four rides a week builds fitness steadily while leaving room to recover and stay motivated. Consistency over months matters far more than any single hard ride.",
    },
  ],
  "triathlon-cycling": [
    {
      question: "How should I pace the bike leg of a triathlon?",
      answer:
        "Ride to a controlled percentage of your FTP — often around 70–80% for long course — so you protect your run rather than chasing bike splits. The fastest overall triathletes rarely post the fastest bike leg.",
    },
    {
      question: "How do I fuel the bike leg?",
      answer:
        "The bike is where you take on most of your race-day carbohydrate, because it's easier to eat and drink than on the run. Aim for 60–90g of carbohydrate per hour, practised in training so your gut can handle it.",
    },
    {
      question: "Does an aero position cost me run performance?",
      answer:
        "An aggressive aero position only hurts your run if you can't hold it comfortably or haven't trained in it. Built up gradually, a good position saves real time and leaves your legs fresher off the bike.",
    },
    {
      question: "How much should triathletes focus on cycling?",
      answer:
        "The bike is the longest leg and where most age-groupers lose or gain the most time, so it deserves a serious share of training. Improving sustainable bike power pays off across the whole race.",
    },
  ],
  "mountain-biking": [
    {
      question: "What tyre pressure should I run on a mountain bike?",
      answer:
        "MTB pressures are much lower than road — often 18–26 psi depending on your weight, tyre volume, terrain and whether you run tubeless. Start lower than you'd expect for grip and comfort, then add pressure if you feel the rim or burp air.",
    },
    {
      question: "How do I set up my suspension sag?",
      answer:
        "Set sag — how much the suspension compresses under your static weight — to roughly 25–30% of travel as a starting point, front and rear. From there, tune rebound and compression to suit the trails you ride.",
    },
    {
      question: "Is mountain biking good for fitness?",
      answer:
        "Yes. The constant changes in effort, terrain and body position build strong aerobic fitness, handling and core strength, often at a higher average heart rate than equivalent time on the road.",
    },
    {
      question: "Do I need a dropper post?",
      answer:
        "A dropper post is one of the highest-impact upgrades for trail riding, letting you drop the saddle for descents and corners without stopping. Most riders who fit one never go back.",
    },
  ],
  "cycling-coaching": [
    {
      question: "Is a cycling coach worth it?",
      answer:
        "A coach is worth it if you're plateauing, short on time, or unsure how to structure your training — the value is in personalisation and accountability, not just a plan. Most amateurs leak fitness through unstructured riding a coach would redirect.",
    },
    {
      question: "How does online cycling coaching work?",
      answer:
        "An online coach builds your training around your goals, schedule and data, then adjusts it week to week based on how you respond and what you tell them. For most riders this is as effective as in-person coaching.",
    },
    {
      question: "How much does a cycling coach cost?",
      answer:
        "Quality online coaching typically runs from around $150–250 a month depending on the level of contact and personalisation. Roadman's Not Done Yet coaching is $195/month with a 7-day free trial.",
    },
    {
      question: "Does my cycling coach need to be local?",
      answer:
        "No. Because coaching is built on data, communication and a personalised plan, location rarely matters — what counts is the coach's methodology and how well they understand your goals.",
    },
  ],
  "against-the-clock": [
    {
      question: "What is against the clock in cycling?",
      answer:
        "It's shorthand for every discipline settled purely by time rather than position — chiefly the time trial and the Hour Record, cycling's oldest and most honest tests. The rider races the clock, not the wheel in front.",
    },
    {
      question: "What is the Hour Record?",
      answer:
        "The Hour Record is the furthest distance a cyclist can ride in one hour on a velodrome, a benchmark contested since the 1890s. It rewards a rare blend of sustainable power, aerodynamics and pacing discipline, which is why it's so revered.",
    },
    {
      question: "Why is the time trial called the race of truth?",
      answer:
        "Because there's nowhere to hide — no drafting, no tactics, no teammates, just the rider against the clock. The result is a direct readout of your fitness, position and pacing on the day.",
    },
    {
      question: "Why do pro cyclists wear luxury watches like Richard Mille?",
      answer:
        "Mostly sponsorship — a watch visible through three weeks of close-up television is worth far more than the few grams it costs, and modern carbon-and-titanium cases weigh almost nothing. But it rhymes with something real: the chronograph was invented to measure exactly what cycling measures — elapsed time, to a fraction of a second. The stopwatch and the time trial are siblings.",
    },
  ],
};

/**
 * Reads the long-form pillar MDX for a topic, if one exists.
 * Returns null if no file — so topic hubs without pillar content fall
 * back to the original hero-only layout (no change in behaviour).
 */
const PILLAR_DIR = path.join(process.cwd(), "content/topics");

function loadPillarContent(slug: string): string | null {
  const mdxPath = path.join(PILLAR_DIR, `${slug}.mdx`);
  if (!fs.existsSync(mdxPath)) return null;
  return fs.readFileSync(mdxPath, "utf-8");
}

// Build-time memoisation — getAllTopics() filters the full post/episode
// corpus and reads pillar-content MDX from disk for every topic, and
// getTopicBySlug() rebuilds the whole set on each call. The content graph and
// topic pages hit this per page. Cached in production only (shallow copy
// returned); dev stays live so content edits show without a restart.
let allTopicsCache: TopicHub[] | null = null;

export function getAllTopics(): TopicHub[] {
  if (allTopicsCache) return allTopicsCache.slice();

  const allPosts = getAllPosts();
  const allEpisodes = getAllEpisodes();

  const topics = TOPIC_DEFINITIONS.map((topic) => {
    // Get mapped blog posts
    const postSlugs = new Set(TOPIC_POST_MAP[topic.slug] || []);
    const posts = allPosts.filter((p) => postSlugs.has(p.slug));

    // Get relevant episodes by keyword matching (limit to 12 most relevant)
    const keywordPattern = TOPIC_EPISODE_KEYWORDS[topic.slug];
    const excludePattern = TOPIC_EPISODE_EXCLUDE[topic.slug];
    const episodes = keywordPattern
      ? allEpisodes
          .filter(
            (ep) =>
              keywordPattern.test(ep.title) ||
              keywordPattern.test(ep.description)
          )
          .filter((ep) => !excludePattern || !excludePattern.test(ep.title))
          .slice(0, 12)
      : [];

    const enrichment = TOPIC_ENRICHMENT[topic.slug] || {
      tools: [],
      commercialPath: "/coaching",
      relatedTopics: [],
      featuredPostSlugs: [],
    };

    return {
      ...topic,
      posts,
      episodes,
      tools: enrichment.tools,
      commercialPath: enrichment.commercialPath,
      relatedTopics: enrichment.relatedTopics,
      featuredPostSlugs: enrichment.featuredPostSlugs,
      pillarContent: loadPillarContent(topic.slug),
      citedClaims: enrichment.citedClaims ?? [],
      claimsHeading: enrichment.claimsHeading,
      claimsCaption: enrichment.claimsCaption,
      faqs: TOPIC_FAQS[topic.slug] ?? [],
    };
  });

  if (process.env.NODE_ENV === "production") allTopicsCache = topics;
  return topics.slice();
}

export function getTopicBySlug(slug: string): TopicHub | null {
  return getAllTopics().find((t) => t.slug === slug) || null;
}

export function getAllTopicSlugs(): string[] {
  return TOPIC_DEFINITIONS.map((t) => t.slug);
}

export function getTopicTitleBySlug(slug: string): string | null {
  return TOPIC_DEFINITIONS.find((t) => t.slug === slug)?.title ?? null;
}

/**
 * Reverse index: post slug → list of topic hubs that include it.
 *
 * Used on individual blog posts to link back to their parent topic
 * hub(s). Gives Google the bidirectional signal it needs for topic
 * clustering (post → hub, hub → post) and gives readers a natural
 * "explore this topic further" path.
 */
const POST_TO_TOPICS: Map<string, string[]> = (() => {
  const map = new Map<string, string[]>();
  for (const [topicSlug, postSlugs] of Object.entries(TOPIC_POST_MAP)) {
    for (const postSlug of postSlugs) {
      const existing = map.get(postSlug) ?? [];
      existing.push(topicSlug);
      map.set(postSlug, existing);
    }
  }
  return map;
})();

export function getTopicsForPost(postSlug: string): Array<{
  slug: string;
  title: string;
}> {
  const topicSlugs = POST_TO_TOPICS.get(postSlug) ?? [];
  return topicSlugs
    .map((slug) => {
      const def = TOPIC_DEFINITIONS.find((t) => t.slug === slug);
      return def ? { slug: def.slug, title: def.title } : null;
    })
    .filter((x): x is { slug: string; title: string } => x !== null);
}
