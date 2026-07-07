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
  {
    slug: "masters-cycling",
    title: "Masters Cycling — Training, Recovery & Performance After 40",
    headline: "STILL GETTING FASTER",
    ctaHeadline: "COACHING BUILT FOR THE OVER-40 RIDER.",
    description:
      "Masters cycling done right: how to train, recover, lift and fuel after 40 so you keep getting faster. Built for the serious amateur the whole Roadman method is designed around.",
    pillar: "coaching",
    keywords: [
      "masters cycling",
      "cycling after 40",
      "cycling over 40",
      "cycling over 50",
      "masters cycling training plan",
      "getting faster after 40",
      "cycling training over 40",
      "masters cyclist recovery",
      "cycling after 50",
      "vo2 max decline cycling",
    ],
  },
  {
    slug: "polarised-training",
    title: "Polarised Training for Cyclists — The Complete 80/20 Guide",
    headline: "THE 80/20 RULE — EXPLAINED",
    ctaHeadline: "POLARISED TRAINING, BUILT INTO YOUR WEEK.",
    description:
      "The complete guide to polarised training for cyclists. The 80/20 intensity distribution, how to avoid the grey zone, and why the world's best endurance athletes train easy most of the time — from Professor Seiler, Dan Lorang, and 1,400+ podcast episodes.",
    pillar: "coaching",
    keywords: [
      "polarised training cycling",
      "80/20 training cycling",
      "polarised vs sweet spot",
      "grey zone training",
      "intensity distribution cycling",
      "zone 2 training",
    ],
  },
  {
    slug: "vo2max-training",
    title: "VO2max Training for Cyclists — Raise the Ceiling",
    headline: "RAISE YOUR CEILING",
    ctaHeadline: "VO2MAX WORK, PROGRAMMED RIGHT.",
    description:
      "The complete guide to VO2max training for cyclists. What VO2max is, how to test it, the best interval sessions to improve it, and how to slow the age-related decline — grounded in conversations with Dan Lorang, John Wakefield, and Andy Galpin.",
    pillar: "coaching",
    keywords: [
      "vo2max cycling",
      "vo2max intervals",
      "improve vo2max cycling",
      "vo2max decline age",
      "vo2max training plan",
      "cycling vo2max workouts",
    ],
  },
  {
    slug: "indoor-training",
    title: "Indoor Cycling Training — Zwift, Trainers & Winter Structure",
    headline: "TRAIN SMARTER INDOORS",
    ctaHeadline: "INDOOR TRAINING WITH PURPOSE.",
    description:
      "The complete guide to indoor cycling training. Smart trainers, Zwift vs TrainerRoad, pain cave setup, winter training structure, and the mental strategies that keep you sharp when the roads are dark and wet.",
    pillar: "coaching",
    keywords: [
      "indoor cycling training",
      "zwift training",
      "smart trainer cycling",
      "winter cycling training",
      "turbo trainer workouts",
      "zwift vs trainerroad",
      "pain cave setup",
    ],
  },
  {
    slug: "bike-fitting",
    title: "Bike Fitting — The Complete Guide for Cyclists",
    headline: "FIT THE BIKE TO THE RIDER",
    ctaHeadline: "A PROPER FIT CHANGES EVERYTHING.",
    description:
      "The complete guide to bike fitting. What a proper fit involves, when to get one, common problems it solves, crank length, saddle position, and why most amateurs are leaving watts on the table through poor position.",
    pillar: "community",
    keywords: [
      "bike fit cycling",
      "bike fitting guide",
      "cycling saddle position",
      "crank length cycling",
      "bike fit after 40",
      "cycling position",
      "bike fit cost",
    ],
  },
  {
    slug: "gravel-cycling",
    title: "Gravel Cycling — Getting Started, Training & Racing",
    headline: "GRAVEL — FROM FIRST RIDE TO RACE DAY",
    ctaHeadline: "GRAVEL TRAINING THAT GETS RESULTS.",
    description:
      "The complete guide to gravel cycling. Getting started, training differences from road, racing Unbound and Badlands, tyre setup, aero in gravel, and the riders who've shaped the discipline — from the Roadman Cycling Podcast.",
    pillar: "community",
    keywords: [
      "gravel cycling",
      "gravel racing",
      "unbound gravel training",
      "badlands cycling",
      "gravel bike setup",
      "gravel cycling beginners",
    ],
  },
  {
    slug: "climbing",
    title: "Climbing — How to Get Faster Uphill on the Bike",
    headline: "STOP GETTING DROPPED ON CLIMBS",
    ctaHeadline: "CLIMBING SPEED, BUILT INTO YOUR PLAN.",
    description:
      "The complete guide to cycling climbing. Pacing, power-to-weight, cadence, position, mental approach, and the five fixable reasons your climbing is slow — grounded in conversations with Dan Lorang, Joe Friel, and World Tour coaches.",
    pillar: "coaching",
    keywords: [
      "cycling climbing tips",
      "climb faster cycling",
      "watts per kg climbing",
      "cycling pacing climbs",
      "alpe dhuez training",
      "climbing cadence",
    ],
  },
  {
    slug: "cycling-psychology",
    title: "Cycling Psychology — Mental Toughness, Focus & Race Confidence",
    headline: "THE MIND IS THE LAST 5%",
    ctaHeadline: "MENTAL TOOLS THAT MAKE YOU FASTER.",
    description:
      "The complete guide to the mental side of cycling. Race-day nerves, mental toughness on climbs and time trials, goal setting, motivation, and the psychological frameworks used by the world's best riders.",
    pillar: "recovery",
    keywords: [
      "cycling psychology",
      "cycling mental toughness",
      "race anxiety cycling",
      "cycling motivation",
      "cycling goal setting",
      "mental training cycling",
    ],
  },
  {
    slug: "heat-training",
    title: "Heat Training for Cyclists — Acclimation, Protocol & Performance",
    headline: "TRAIN THE HEAT, GAIN THE WATTS",
    ctaHeadline: "HEAT ACCLIMATION, PERIODISED INTO YOUR PLAN.",
    description:
      "The complete guide to heat training for cyclists. How heat acclimation improves FTP by up to 5%, at-home protocols, performance gains, safety for masters riders, and the science behind Remco Evenepoel's heat strategy.",
    pillar: "coaching",
    keywords: [
      "heat training cycling",
      "heat acclimation cycling",
      "cycling in heat",
      "heat training protocol",
      "heat training ftp gains",
    ],
  },
  {
    slug: "women-cycling",
    title: "Women's Cycling — Training, Nutrition & Hormones",
    headline: "TRAINING THAT WORKS WITH YOUR BODY",
    ctaHeadline: "COACHING THAT UNDERSTANDS FEMALE PHYSIOLOGY.",
    description:
      "The complete guide to women's cycling. Training around the menstrual cycle, menopause and perimenopause, bone density, nutrition differences, strength training, bike fit, and building a women's cycling community.",
    pillar: "coaching",
    keywords: [
      "women cycling training",
      "cycling menstrual cycle",
      "menopause cycling",
      "female cyclist nutrition",
      "women cycling community",
      "perimenopause cycling",
      "bone density cycling",
    ],
  },
  {
    slug: "race-preparation",
    title: "Race Preparation — Tapering, Pacing & Race-Day Execution",
    headline: "PEAK ON THE DAY THAT MATTERS",
    ctaHeadline: "RACE-DAY COACHING THAT DELIVERS.",
    description:
      "The complete guide to race preparation for cyclists. Tapering, race-day nutrition, pacing strategy, warm-up protocols, and the 12-week countdown to your target event — built from World Tour race-day science.",
    pillar: "coaching",
    keywords: [
      "cycling race preparation",
      "cycling taper guide",
      "sportive preparation",
      "race day nutrition cycling",
      "cycling pacing strategy",
      "cycling warm up protocol",
    ],
  },
  {
    slug: "cycling-periodisation",
    title: "Cycling Periodisation — How to Structure Your Training Year",
    headline: "STRUCTURE BEATS RANDOMNESS",
    ctaHeadline: "A STRUCTURED YEAR, NOT RANDOM WEEKS.",
    description:
      "The complete guide to cycling periodisation. Base, build, peak, and transition phases, mesocycle design, reverse periodisation, and the frameworks used by Joe Friel, Dan Lorang, and the best coaches in endurance sport.",
    pillar: "coaching",
    keywords: [
      "cycling periodisation",
      "training periodisation cycling",
      "mesocycle cycling",
      "base build peak cycling",
      "reverse periodisation",
      "off season cycling",
    ],
  },
  {
    slug: "sweet-spot-training",
    title: "Sweet Spot Training for Cyclists — The Complete Guide",
    headline: "THE SWEET SPOT — EXPLAINED",
    ctaHeadline: "SWEET SPOT, PROGRAMMED AT THE RIGHT TIME.",
    description:
      "The complete guide to sweet spot training for cyclists. What it is (88-93% FTP), when to use it, how it compares to polarised and threshold training, and why it works best for time-crunched amateurs in the right phase of the season.",
    pillar: "coaching",
    keywords: [
      "sweet spot training cycling",
      "sweet spot vs threshold",
      "sweet spot vs polarised",
      "88-93% ftp training",
      "sweet spot intervals",
    ],
  },
  {
    slug: "sprint-training",
    title: "Sprint Training for Cyclists — Power, Tactics & Sessions",
    headline: "FASTER WHEN IT MATTERS",
    ctaHeadline: "SPRINT POWER, BUILT INTO YOUR PROGRAMME.",
    description:
      "The complete guide to sprint training for cyclists. Sprint power development, race tactics, the difference between sprint power and winning power, and sessions for road racers, criterium riders, and masters cyclists.",
    pillar: "coaching",
    keywords: [
      "sprint training cycling",
      "cycling sprint power",
      "criterium training",
      "sprint intervals cycling",
      "masters sprint training",
    ],
  },
  {
    slug: "sleep-performance",
    title: "Sleep & Cycling Performance — The Recovery You Can't Skip",
    headline: "SLEEP IS YOUR BEST SESSION",
    ctaHeadline: "RECOVERY THAT STARTS AT LIGHTS-OUT.",
    description:
      "The complete guide to sleep and cycling performance. Why sleep is the highest-leverage recovery tool, how sleep debt erodes adaptation, optimisation strategies, and the sleep habits of the world's best endurance athletes.",
    pillar: "recovery",
    keywords: [
      "sleep cycling performance",
      "sleep recovery cycling",
      "sleep optimisation cyclists",
      "sleep debt cycling",
      "cycling recovery sleep",
    ],
  },
  {
    slug: "cycling-cadence",
    title: "Cycling Cadence — Optimal RPM, Low Cadence Training & Climbing",
    headline: "FIND YOUR RPM",
    ctaHeadline: "CADENCE WORK, BUILT INTO YOUR SESSIONS.",
    description:
      "The complete guide to cycling cadence. Optimal RPM for flat and climbing, low-cadence torque intervals, age-related cadence changes, and the sessions John Wakefield and Tim Kerrison prescribe to World Tour riders.",
    pillar: "coaching",
    keywords: [
      "cycling cadence",
      "optimal cadence cycling",
      "low cadence training",
      "torque intervals cycling",
      "climbing cadence",
      "cadence masters cycling",
    ],
  },
  {
    slug: "ultra-endurance",
    title: "Ultra-Endurance Cycling — Badlands, Tour Divide & Beyond",
    headline: "GO LONGER",
    ctaHeadline: "ENDURANCE BUILT FOR THE LONG HAUL.",
    description:
      "The complete guide to ultra-endurance cycling. Training and fuelling for Badlands, Tour Divide, Unbound, RAAM, and events that push past the point where fitness alone won't save you — from Lachlan Morton, Alex Howes, Sofiane Sehili, and Lael Wilcox.",
    pillar: "community",
    keywords: [
      "ultra endurance cycling",
      "badlands training",
      "tour divide training",
      "ultra distance cycling",
      "bikepacking racing",
      "unbound gravel training",
    ],
  },
  {
    slug: "cycling-breathing",
    title: "Breathing for Cyclists — Respiratory Training & Techniques",
    headline: "BREATHE BETTER, RIDE FASTER",
    ctaHeadline: "BREATHING THAT SUPPORTS YOUR POWER.",
    description:
      "The complete guide to breathing for cyclists. Nasal vs mouth breathing, respiratory muscle training, CO2 tolerance, breathing patterns on climbs, and the ventilation technology Visma–Lease a Bike are using in races.",
    pillar: "recovery",
    keywords: [
      "breathing cycling",
      "respiratory training cycling",
      "nasal breathing cycling",
      "breathing techniques cycling",
      "co2 tolerance cycling",
    ],
  },
  {
    slug: "power-meter-training",
    title: "Power Meter Training — The Complete Guide for Cyclists",
    headline: "TRAIN WITH NUMBERS THAT MATTER",
    ctaHeadline: "POWER-BASED COACHING THAT WORKS.",
    description:
      "The complete guide to training with a power meter. Which type to buy, how to set zones, how to structure workouts around power data, and when heart rate or RPE is actually the better guide.",
    pillar: "coaching",
    keywords: [
      "power meter cycling",
      "power meter training",
      "cycling power meter guide",
      "train with power cycling",
      "power meter vs heart rate",
      "best power meter",
    ],
  },
  {
    slug: "running-for-cyclists",
    title: "Running for Cyclists",
    headline: "Running for Cyclists — The Complete Cross-Training Guide",
    ctaHeadline: "Train Smarter Across Both Sports",
    description:
      "Evidence-based running guidance for cyclists — VO2max transfer, bone density, injury prevention, off-season protocols, and practical run-build plans for riders who want running as a training tool.",
    pillar: "strength",
    keywords: [
      "running for cyclists",
      "cross training cycling",
      "is running good for cyclists",
      "cycling cross training",
      "running and cycling",
      "cyclist bone density",
      "off season running",
      "running plan for cyclists",
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
    "sam-impey-fuelling-carbs-per-hour-world-tour",
    "tim-podlogar-getting-lean-without-losing-power",
    "uri-carlson-under-over-optimal-fuelling",
    "cycling-gi-distress-stomach-problems-fix",
    "homemade-cycling-race-fuel-diy-drink-gels-rice-cakes",
    "how-many-carbs-per-day-cyclist-daily-intake",
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
    "cycling-taper-pmc-performance-management-chart",
    "efficiency-factor-trainingpeaks-tracking",
    "post-session-feedback-trainingpeaks-notes",
    "trainingpeaks-virtual-structured-indoor-training",
    "century-tss-trainingpeaks-100-mile-fitness",
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
    "michael-ormsbee-protein-before-bed-cyclists",
    "andrew-sellars-breathing-co2-cycling",
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
    "alex-welburn-critical-power-w-prime-training-metrics",
    "stephen-barrett-worldtour-coaching-belief-better-questions",
    "eddie-dunbar-ineos-grenadiers-training-lessons",
    "steve-cummings-maverick-self-coached-lessons",
    "what-amateurs-can-learn-from-tour-de-france-preparation",
    "tdf-2026-contenders-preparation-lessons",
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
    // The watch features — this hub is their home, not the `community` pillar.
    "bravur-zwift-collaboration-watch",
    "tudor-bumblebee-watches-tour-de-france",
    "breitling-top-time-coppi-bartali-cycling-rivalry",
    "tudor-pro-cycling-tour-de-france-2026",
    "casio-f91w-ten-mile-time-trial-cycling",
    "omega-olympic-timing-track-cycling-hour-record",
    "richard-mille-cycling-watches-modern-peloton",
    "rolex-cycling-great-absence-tudor",
    "dan-bigham-aerodynamics-amateur-cyclists",
    "alex-dowsett-pro-cycling-lessons-amateur",
    "ryan-collins-six-hour-velodrome-record-three-tweaks",
    "cycling-time-trial-tips",
    "uli-schoberer-first-power-meter-cycling-history",
  ],
  "masters-cycling": [
    "10-minute-mobility-routine-masters-cyclist",
    "age-group-ftp-benchmarks-2026",
    "alcohol-and-the-masters-cyclist",
    "andy-galpin-fast-twitch-fibres-cyclist-after-40",
    "back-to-the-bunch-after-40",
    "best-cycling-coach-masters-riders",
    "best-cycling-training-podcasts-age-groupers",
    "best-roadman-episodes-masters",
    "bike-fit-after-40",
    "bike-leg-of-triathlon-why-age-groupers-get-it-wrong",
    "bone-density-cycling-after-menopause",
    "comeback-cyclist-12-week-return-plan",
    "cycling-after-40-faster-science",
    "cycling-after-40-recovery-report-2026",
    "cycling-cadence-by-age-masters",
    "cycling-over-40-complete-guide",
    "cycling-over-40-getting-faster",
    "cycling-over-50-training",
    "cycling-training-plan-masters-over-40",
    "detraining-after-40",
    "efficiency-factor-cycling-masters",
    "heat-tolerance-ageing-cyclist",
    "hormones-recovery-female-cyclists-over-45",
    "iron-deficiency-cyclists-masters",
    "james-golding-race-across-america-comeback",
    "joe-friel-fast-after-50-cycling-method",
    "masters-cycling-podcast-playlist",
    "masters-cycling-training-plan-over-40",
    "masters-cycling-training-report-2026",
    "masters-cyclist-guide-getting-faster-after-40",
    "masters-metabolism-anabolic-resistance-nutrition",
    "masters-racing-doping-cycling-amateur-cheating",
    "masters-recovery-audit-seven-things-to-check",
    "menopause-cycling-fuelling-female-cyclists",
    "menopause-cycling-performance",
    "new-study-confirms-heavy-strength-training-beats-more-miles-after-40",
    "owen-vermeulen-addiction-recovery-cycling-comeback",
    "perimenopause-cycling-training-adaptation",
    "podcasts-for-cyclists-over-40",
    "post-ride-recovery-window-cyclists-over-40",
    "racing-at-50-plus-masters-cycling",
    "resting-heart-rate-masters-cyclists",
    "sleep-and-the-masters-cyclist",
    "sprint-interval-training-cyclists-masters",
    "strength-training-cyclists-over-40-what-works",
    "strength-training-cyclists-over-50",
    "training-load-management-cyclists-40s-50s",
    "vo2-max-workouts-cyclists-over-40",
    "vo2max-decline-reversibility-masters-cyclists",
    "what-experts-say-about-masters-cycling",
  ],
  "polarised-training": [
    "polarised-training-cycling-complete-guide",
    "polarised-training-cycling-guide",
    "polarised-training-cycling-world-tour-prescription",
    "polarised-vs-sweet-spot-training",
    "80-20-cycling-training-the-grey-zone-trap",
    "what-cycling-podcasts-got-wrong-about-polarised-training",
    "what-stephen-seiler-says-about-polarised-training",
    "stephen-seiler-research-polarised-training-lessons",
    "stephen-seiler-80-20-polarised-training-cyclists",
    "sweet-spot-vs-threshold-vs-polarised-comparison",
    "zone-2-training-complete-guide",
    "zone-2-cycling-heart-rate-vs-power-vs-rpe",
    "zone-2-vs-endurance-training",
    "why-pros-train-so-easy-mixed-metabolism-zone",
    "what-experts-say-about-zone-2-training",
    "christian-schrot-why-pros-train-easy",
    "prof-seiler-low-heart-rate-cycling",
    "vasilis-anastopoulos-zone-1-base-training",
  ],
  "vo2max-training": [
    "cycling-vo2max-intervals",
    "vo2max-cycling-fixable-reasons-low",
    "vo2max-training-cyclists-seven-reasons",
    "vo2max-decline-reversibility-masters-cyclists",
    "vo2-max-workouts-cyclists-over-40",
    "vo2max-intervals-cycling-session-guide",
    "cycling-hill-repeats-training",
    "low-cadence-training-cycling-torque-intervals",
    "sprint-interval-training-cyclists-masters",
    "steady-state-vs-interval-training-cycling",
  ],
  "indoor-training": [
    "cycling-zwift-training-guide",
    "best-indoor-cycling-workouts-winter",
    "best-indoor-smart-trainers-2026",
    "zwift-vs-trainerroad",
    "zwift-vs-structured-training-cyclists",
    "zwift-vs-cycling-coach",
    "rouvy-vs-zwift",
    "pain-cave-setup-guide-cyclists",
    "indoor-vs-outdoor-cycling-training-when-each-wins",
    "indoor-cycling-for-triathletes-winter-plan",
    "indoor-trainer-vs-rollers",
    "cycling-indoor-training-tips",
    "cycling-podcasts-for-indoor-training",
    "best-indoor-cycling-podcasts-winter",
    "staying-sane-turbo-trainer-mental-strategies",
    "winter-cycling-training-indoor-protocol-pros",
    "heart-rate-zones-indoor-vs-outdoor-cycling",
    "heat-training-indoor-trainer-cyclists",
    "indoor-cycling-heat-management-trainingpeaks-virtual",
    "power-meter-vs-smart-trainer",
    "trainingpeaks-virtual-structured-indoor-training",
  ],
  "bike-fitting": [
    "bike-fit-guide-cyclists",
    "bike-fit-after-40",
    "bike-fit-one-change-amateurs-should-make",
    "bike-fit-women-cyclists-guide",
    "phil-burt-crank-length-bike-fit-mistakes",
    "shorter-cranks-cycling-power-gains",
    "numb-hands-cycling-5-fixes-bike-fit",
    "cycling-shoes-fit-guide",
    "courtney-conley-cycling-shoes-fit",
    "cycling-saddle-sore-prevention",
    "daryl-fitzgerald-saddle-height-one-change",
    "mtb-bike-fit-basics",
    "cycling-back-pain-fixes",
    "cycling-knee-pain-causes-fixes",
  ],
  "gravel-cycling": [
    "gravel-cycling-beginners-guide",
    "unbound-gravel-200-training-guide",
    "unbound-gravel-2026-complete-guide",
    "badlands-training-guide",
    "badlands-800km-fuelling-strategy",
    "rosa-kloser-unbound-2024-simple-training-plan",
    "pete-stetina-worldtour-to-gravel-reinvention",
    "nathan-haas-gravel-soul-professionalisation",
    "wind-tunnel-aero-gains-gravel-cyclists",
    "best-gravel-trails-ireland",
    "how-to-race-gravel-in-the-mud",
    "chris-mehlman-badlands-podium-pacing-kit",
    "mads-wurtz-schmidt-professional-gravel-super-team",
    "sebastian-breuer-badlands-aero-bikepacking",
    "alex-howes-when-to-quit-pro-cycling-gravel-privateer",
    "dylan-johnson-oscillation-training-plan",
    "sofiane-sehili-ultra-endurance-mindset-bikepacking",
  ],
  "climbing": [
    "climb-faster-cycling-five-fixable-reasons",
    "cycling-climbing-tips-stop-getting-dropped",
    "best-cadence-for-climbing",
    "cycling-pacing-strategy-long-climbs",
    "how-to-ride-alpe-dhuez-training-pacing-guide",
    "how-to-descend-faster-cycling",
    "how-to-descend-faster-road-bike",
    "watts-per-kg-alpe-dhuez",
    "jack-burke-strava-records-stelvio-alpe-dhuez",
    "science-of-climbing-tour-de-france-speeds-wkg",
    "cycling-hill-repeats-training",
    "mental-tools-long-climbs-time-trials",
    "cycling-power-to-weight-ratio-guide",
    "cycling-body-composition-guide",
  ],
  "cycling-psychology": [
    "cycling-mental-toughness",
    "mental-preparation-cycling-race",
    "mental-tools-long-climbs-time-trials",
    "cycling-goal-setting-that-actually-works",
    "staying-sane-turbo-trainer-mental-strategies",
    "gabby-bernstein-trauma-cycling-mental-recovery",
    "ger-redmond-prison-pro-mental-method-cyclists",
    "mohoric-tour-de-france-stage-win-mindset",
    "running-cycling-mental-health-benefits",
    "sofiane-sehili-ultra-endurance-mindset-bikepacking",
    "valtteri-bottas-f1-cycling-cross-training-mindset",
    "yanto-barker-le-col-goal-setting-cycling",
    "tj-eisenhart-breathwork-meditation-cycling",
  ],
  "heat-training": [
    "cycling-heat-training-guide",
    "cycling-heat-training-protocol-at-home",
    "heat-training-cyclists-30-watts-ftp-protocol",
    "heat-training-indoor-trainer-cyclists",
    "heat-tolerance-ageing-cyclist",
    "indoor-cycling-heat-management-trainingpeaks-virtual",
  ],
  "women-cycling": [
    "cycling-training-around-menstrual-cycle",
    "menopause-cycling-performance",
    "menopause-cycling-fuelling-female-cyclists",
    "perimenopause-cycling-training-adaptation",
    "bike-fit-women-cyclists-guide",
    "cycling-nutrition-women-different",
    "women-cycling-strength-training-guide",
    "bone-density-cycling-after-menopause",
    "hormones-recovery-female-cyclists-over-45",
    "women-cycling-community-getting-started",
    "cycling-bone-density-running-fix",
    "tayler-wiles-womens-cycling-growth-inequality",
  ],
  "race-preparation": [
    "cycling-sportive-preparation",
    "cycling-taper-guide-peak-race-day",
    "cycling-taper-race-preparation-system",
    "cycling-taper-discipline-15-percent-gain",
    "cycling-taper-pmc-performance-management-chart",
    "cycling-tapering-guide",
    "race-day-checklist-cyclists",
    "race-day-fuelling-24-hour-timeline",
    "race-day-nutrition-plan-cyclists",
    "pre-race-warmup-protocol-cyclists",
    "pacing-strategy-cycling-sportive",
    "peaking-for-a-sportive-12-week-framework",
    "cycling-nutrition-race-day-guide",
    "cycling-nutrition-plan-100-mile-sportive",
    "cycling-carb-loading-protocol-race-week",
    "sportive-training-readiness-index-2026",
    "how-to-train-for-a-sportive-12-weeks",
    "travel-fatigue-cycling-pre-event-protocol",
    "what-amateurs-can-learn-from-tour-de-france-preparation",
    "cycling-race-tactics-guide",
  ],
  "cycling-periodisation": [
    "cycling-periodisation-plan-guide",
    "cycling-periodisation-friel-lorang-johnson",
    "how-to-periodise-cycling-season",
    "mesocycle-training-explained-cyclists",
    "reverse-periodisation-cycling",
    "winter-base-training-modern-approach-cycling",
    "cycling-base-training-guide",
    "nutrition-periodisation-base-build-race",
    "off-season-gym-routine-cyclists-12-week-block",
    "running-off-season-cyclists",
    "triathlon-off-season-cycling",
    "vasilis-anastopoulos-zone-1-base-training",
    "winter-training-cycling-guide",
    "cycling-training-plan-build-friel-lorang-johnson",
  ],
  "sweet-spot-training": [
    "sweet-spot-training-cycling",
    "sweet-spot-training-cycling-guide",
    "sweet-spot-training-cyclists-explained",
    "sweet-spot-vs-threshold-vs-polarised-comparison",
    "polarised-vs-sweet-spot-training",
    "how-to-improve-ftp-cycling",
    "improve-ftp-cycling-evidence-based-methods",
    "time-crunched-cyclist-8-hours-week",
  ],
  "sprint-training": [
    "30-day-sprint-power-cycling-plan",
    "sam-bennett-what-sprinters-do-differently",
    "andre-greipel-sprint-captains-code",
    "cory-williams-sprint-power-vs-winning-power",
    "sprint-interval-training-cyclists-masters",
    "vasilis-anastopoulos-cavendish-sprint-training",
    "cycling-race-tactics-guide",
  ],
  "sleep-performance": [
    "cycling-sleep-performance-guide",
    "cycling-sleep-optimisation",
    "sleep-and-the-masters-cyclist",
    "sleep-debt-hrv-cycling-adaptation",
    "cycling-hrv-training-guide",
    "cycling-recovery-tips",
    "masters-recovery-audit-seven-things-to-check",
  ],
  "cycling-cadence": [
    "cycling-cadence-optimal-guide",
    "cycling-cadence-by-age-masters",
    "best-cadence-for-climbing",
    "low-cadence-training-cycling-torque-intervals",
    "low-cadence-training-world-tour-coaches",
    "john-wakefield-team-bora-endurance-training",
  ],
  "ultra-endurance": [
    "badlands-training-guide",
    "badlands-800km-fuelling-strategy",
    "alex-howes-tour-divide-ultra-endurance-pro-perspective",
    "alex-howes-when-to-quit-pro-cycling-gravel-privateer",
    "lael-wilcox-ultra-distance-cycling-lessons",
    "sofiane-sehili-ultra-endurance-mindset-bikepacking",
    "unbound-gravel-200-training-guide",
    "leadville-100-training-guide",
    "colin-obrady-race-across-america-training",
    "james-golding-race-across-america-comeback",
    "chris-mehlman-badlands-podium-pacing-kit",
    "sebastian-breuer-badlands-aero-bikepacking",
    "rosa-kloser-unbound-2024-simple-training-plan",
  ],
  "cycling-breathing": [
    "breathing-for-cyclists-respiratory-training-guide",
    "breathing-techniques-cycling-performance",
    "cycling-breathing-techniques",
    "andrew-sellars-breathing-co2-cycling",
    "tj-eisenhart-breathwork-meditation-cycling",
    "team-visma-breathing-sensor-ventilation-training",
  ],
  "power-meter-training": [
    "cycling-power-meter-guide",
    "power-meter-buying-guide-cyclists",
    "power-meter-training-cyclists-how-to-use",
    "power-meter-training-plan-week-by-week",
    "power-meter-vs-smart-trainer",
    "uli-schoberer-first-power-meter-cycling-history",
    "cycling-power-to-weight-ratio-guide",
    "rpe-and-power-using-them-together",
    "reading-your-training-data-tss-ctl-atl-tsb",
    "wahoo-vs-garmin-cycling-computers",
    "best-cycling-computers-2026",
  ],
  "running-for-cyclists": [
    "running-cross-training-cyclists",
    "running-vs-cycling-fitness-transfer",
    "running-plan-cyclists-first-5k",
    "running-injury-prevention-cyclists",
    "running-off-season-cyclists",
    "trail-running-cyclists-guide",
    "cycling-running-weekly-schedule",
    "cycling-bone-density-running-fix",
    "running-cycling-mental-health-benefits",
    "time-crunched-cyclist-running-benefits",
    "zone-2-running-vs-cycling-heart-rate",
    "running-shoes-guide-cyclists",
    "fuelling-running-vs-cycling-differences",
    "super-shoes-carbon-plate-running-cyclists",
    "gps-watches-cycling-running-guide",
    "supplements-endurance-cyclist-runner",
    "hybrid-athlete-over-40-run-ride-lift",
    "brick-workouts-cyclists-guide",
    "couch-to-5k-for-cyclists",
    "switching-from-running-to-cycling-guide",
    "cycling-for-injured-runners",
    "cycling-better-for-knees-than-running",
    "cycling-replace-long-run-marathon",
    "ftp-for-runners-cycling-power-explained",
    "running-cycling-conversion-calculator",
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
  "masters-cycling": {
    tools: [],
    commercialPath: "/coaching",
    relatedTopics: ["cycling-recovery", "cycling-strength-conditioning", "cycling-training-plans"],
    featuredPostSlugs: [
      "cycling-over-40-complete-guide",
      "masters-cycling-training-plan-over-40",
      "cycling-after-40-faster-science",
    ],
  },
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
    relatedTopics: ["cycling-strength-conditioning", "cycling-training-plans", "masters-cycling"],
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
  "polarised-training": {
    tools: [
      { slug: "ftp-zones", title: "FTP Zone Calculator", href: "/tools/ftp-zones" },
      { slug: "hr-zones", title: "HR Zone Calculator", href: "/tools/hr-zones" },
    ],
    commercialPath: "/coaching",
    relatedTopics: ["ftp-training", "cycling-training-plans", "sweet-spot-training"],
    featuredPostSlugs: [
      "polarised-training-cycling-complete-guide",
      "polarised-vs-sweet-spot-training",
      "80-20-cycling-training-the-grey-zone-trap",
    ],
  },
  "vo2max-training": {
    tools: [
      { slug: "ftp-zones", title: "FTP Zone Calculator", href: "/tools/ftp-zones" },
    ],
    commercialPath: "/coaching",
    relatedTopics: ["ftp-training", "polarised-training", "cycling-training-plans"],
    featuredPostSlugs: [
      "cycling-vo2max-intervals",
      "vo2max-cycling-fixable-reasons-low",
      "vo2max-decline-reversibility-masters-cyclists",
    ],
  },
  "indoor-training": {
    tools: [
      { slug: "ftp-zones", title: "FTP Zone Calculator", href: "/tools/ftp-zones" },
    ],
    commercialPath: "/coaching",
    relatedTopics: ["ftp-training", "cycling-training-plans", "heat-training"],
    featuredPostSlugs: [
      "cycling-zwift-training-guide",
      "best-indoor-cycling-workouts-winter",
      "pain-cave-setup-guide-cyclists",
    ],
  },
  "bike-fitting": {
    tools: [],
    commercialPath: "/coaching",
    relatedTopics: ["cycling-beginners", "masters-cycling", "women-cycling"],
    featuredPostSlugs: [
      "bike-fit-guide-cyclists",
      "bike-fit-one-change-amateurs-should-make",
      "phil-burt-crank-length-bike-fit-mistakes",
    ],
  },
  "gravel-cycling": {
    tools: [
      { slug: "tyre-pressure", title: "Tyre Pressure Calculator", href: "/tools/tyre-pressure" },
    ],
    commercialPath: "/coaching",
    relatedTopics: ["ultra-endurance", "cycling-beginners", "cycling-nutrition"],
    featuredPostSlugs: [
      "gravel-cycling-beginners-guide",
      "unbound-gravel-200-training-guide",
      "rosa-kloser-unbound-2024-simple-training-plan",
    ],
  },
  "climbing": {
    tools: [
      { slug: "wkg", title: "W/kg Calculator", href: "/tools/wkg" },
      { slug: "ftp-zones", title: "FTP Zone Calculator", href: "/tools/ftp-zones" },
    ],
    commercialPath: "/coaching",
    relatedTopics: ["ftp-training", "cycling-weight-loss", "cycling-cadence"],
    featuredPostSlugs: [
      "climb-faster-cycling-five-fixable-reasons",
      "cycling-pacing-strategy-long-climbs",
      "how-to-ride-alpe-dhuez-training-pacing-guide",
    ],
  },
  "cycling-psychology": {
    tools: [],
    commercialPath: "/coaching",
    relatedTopics: ["cycling-recovery", "race-preparation", "cycling-training-plans"],
    featuredPostSlugs: [
      "cycling-mental-toughness",
      "mental-preparation-cycling-race",
      "cycling-goal-setting-that-actually-works",
    ],
  },
  "heat-training": {
    tools: [],
    commercialPath: "/coaching",
    relatedTopics: ["race-preparation", "indoor-training", "masters-cycling"],
    featuredPostSlugs: [
      "cycling-heat-training-guide",
      "heat-training-cyclists-30-watts-ftp-protocol",
      "cycling-heat-training-protocol-at-home",
    ],
  },
  "women-cycling": {
    tools: [],
    commercialPath: "/coaching",
    relatedTopics: ["masters-cycling", "cycling-nutrition", "cycling-strength-conditioning"],
    featuredPostSlugs: [
      "cycling-training-around-menstrual-cycle",
      "menopause-cycling-performance",
      "women-cycling-strength-training-guide",
    ],
  },
  "race-preparation": {
    tools: [
      { slug: "fuelling", title: "In-Ride Fuelling Calculator", href: "/tools/fuelling" },
      { slug: "ftp-zones", title: "FTP Zone Calculator", href: "/tools/ftp-zones" },
    ],
    commercialPath: "/coaching",
    relatedTopics: ["cycling-nutrition", "cycling-periodisation", "ftp-training"],
    featuredPostSlugs: [
      "cycling-taper-guide-peak-race-day",
      "race-day-checklist-cyclists",
      "pacing-strategy-cycling-sportive",
    ],
  },
  "cycling-periodisation": {
    tools: [],
    commercialPath: "/coaching",
    relatedTopics: ["cycling-training-plans", "ftp-training", "race-preparation"],
    featuredPostSlugs: [
      "cycling-periodisation-plan-guide",
      "mesocycle-training-explained-cyclists",
      "reverse-periodisation-cycling",
    ],
  },
  "sweet-spot-training": {
    tools: [
      { slug: "ftp-zones", title: "FTP Zone Calculator", href: "/tools/ftp-zones" },
    ],
    commercialPath: "/coaching",
    relatedTopics: ["ftp-training", "polarised-training", "cycling-training-plans"],
    featuredPostSlugs: [
      "sweet-spot-training-cycling",
      "sweet-spot-vs-threshold-vs-polarised-comparison",
      "polarised-vs-sweet-spot-training",
    ],
  },
  "sprint-training": {
    tools: [],
    commercialPath: "/coaching",
    relatedTopics: ["ftp-training", "cycling-strength-conditioning", "race-preparation"],
    featuredPostSlugs: [
      "sam-bennett-what-sprinters-do-differently",
      "30-day-sprint-power-cycling-plan",
      "cory-williams-sprint-power-vs-winning-power",
    ],
  },
  "sleep-performance": {
    tools: [],
    commercialPath: "/coaching",
    relatedTopics: ["cycling-recovery", "masters-cycling", "cycling-psychology"],
    featuredPostSlugs: [
      "cycling-sleep-performance-guide",
      "sleep-and-the-masters-cyclist",
      "sleep-debt-hrv-cycling-adaptation",
    ],
  },
  "cycling-cadence": {
    tools: [],
    commercialPath: "/coaching",
    relatedTopics: ["ftp-training", "climbing", "masters-cycling"],
    featuredPostSlugs: [
      "cycling-cadence-optimal-guide",
      "low-cadence-training-cycling-torque-intervals",
      "best-cadence-for-climbing",
    ],
  },
  "ultra-endurance": {
    tools: [
      { slug: "fuelling", title: "In-Ride Fuelling Calculator", href: "/tools/fuelling" },
    ],
    commercialPath: "/coaching",
    relatedTopics: ["gravel-cycling", "cycling-nutrition", "cycling-psychology"],
    featuredPostSlugs: [
      "badlands-training-guide",
      "alex-howes-tour-divide-ultra-endurance-pro-perspective",
      "lael-wilcox-ultra-distance-cycling-lessons",
    ],
  },
  "cycling-breathing": {
    tools: [],
    commercialPath: "/coaching",
    relatedTopics: ["cycling-recovery", "ftp-training", "cycling-psychology"],
    featuredPostSlugs: [
      "breathing-for-cyclists-respiratory-training-guide",
      "andrew-sellars-breathing-co2-cycling",
      "team-visma-breathing-sensor-ventilation-training",
    ],
  },
  "power-meter-training": {
    tools: [
      { slug: "ftp-zones", title: "FTP Zone Calculator", href: "/tools/ftp-zones" },
      { slug: "wkg", title: "W/kg Calculator", href: "/tools/wkg" },
    ],
    commercialPath: "/coaching",
    relatedTopics: ["ftp-training", "cycling-coaching", "cycling-training-plans"],
    featuredPostSlugs: [
      "cycling-power-meter-guide",
      "power-meter-training-cyclists-how-to-use",
      "uli-schoberer-first-power-meter-cycling-history",
    ],
  },
  "running-for-cyclists": {
    tools: [
      { slug: "hr-zones", title: "HR Zone Calculator", href: "/tools/hr-zones" },
      { slug: "fuelling", title: "In-Ride Fuelling Calculator", href: "/tools/fuelling" },
    ],
    commercialPath: "/strength-training",
    relatedTopics: [
      "cycling-strength-conditioning",
      "triathlon-cycling",
      "cycling-periodisation",
      "masters-cycling",
    ],
    featuredPostSlugs: [
      "running-cross-training-cyclists",
      "running-plan-cyclists-first-5k",
      "cycling-bone-density-running-fix",
    ],
  },
};

/** Keyword patterns for matching episodes to topics */
const TOPIC_EPISODE_KEYWORDS: Record<string, RegExp> = {
  "masters-cycling": /masters|over.?40|over.?50|after.?40|after.?50|age.?group|veteran|fast after 50|40s|50s|perimenopause|menopause/i,
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
  "polarised-training": /polaris|polariz|80.?20|grey.?zone|intensity.?distribut|zone.?2|low.?intensity/i,
  "vo2max-training": /vo2|v02|vo2.?max|max.?aerobic|oxygen.?uptake/i,
  "indoor-training": /indoor|zwift|trainer|turbo|rollers|pain.?cave|smart.?trainer|wahoo|kickr|tacx|rouvy/i,
  "bike-fitting": /bike.?fit|saddle.?height|crank.?length|position|cleat|shoe.?fit|aero.?position/i,
  "gravel-cycling": /gravel|unbound|badlands|bikepacking|adventure.?cycling|off.?road/i,
  "climbing": /climb|ascent|gradient|mountain|summit|col\b|alpe|dolomit|pyrenee|uphill/i,
  "cycling-psychology": /mental|psych|mindset|anxiety|confidence|motivation|fear|tough/i,
  "heat-training": /heat|hot|temperature|acclim|thermal|summer.?train/i,
  "women-cycling": /women|female|menstrual|menopause|perimenopause|hormone|bone.?density/i,
  "race-preparation": /race.?day|race.?prep|taper|sportive|warm.?up|pacing|peak|checklist|race.?nutrition/i,
  "cycling-periodisation": /periodis|mesocycle|base.?phase|build.?phase|off.?season|training.?block|macrocycle/i,
  "sweet-spot-training": /sweet.?spot|88.?93|sub.?threshold/i,
  "sprint-training": /sprint|criterium|crit|lead.?out|bunch.?finish|fast.?twitch/i,
  "sleep-performance": /sleep|circadian|nap|insomnia|melatonin|sleep.?hygiene/i,
  "cycling-cadence": /cadence|rpm|torque|low.?cadence|pedal.?speed|grinding/i,
  "ultra-endurance": /ultra|bikepacking|tour.?divide|badlands|unbound|leadville|race.?across|24.?hour|endurance.?race/i,
  "cycling-breathing": /breath|respiratory|nasal|co2.?tolerance|ventilat|lung|diaphragm/i,
  "power-meter-training": /power.?meter|srm|stages|quarq|pedal.?power|power.?data|dual.?sided/i,
  "running-for-cyclists":
    /run(?:ning)?.as.a.cyclist|cyclists?.{0,12}(?:should|start).{0,12}run|start.?running|running.for.cyclists|\bduathlon\b|\bmarathon\b|\btrail.?run|\bparkrun\b|running.(?:shoes?|plan|injur|form|gait)/i,
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
  "running-for-cyclists": /\brace.run|tour.*run|breakaway|run.down/i,
};

/**
 * Hub FAQs — question/answer pairs derived from each topic's own
 * content. Surfaced as a visible accordion and as FAQPage JSON-LD. Three
 * to four questions per hub, answers held to 2-3 authoritative sentences.
 */
const TOPIC_FAQS: Record<string, TopicFAQ[]> = {
  "masters-cycling": [
    {
      question: "Can you still get faster cycling after 40?",
      answer:
        "Yes. Some decline in VO2 max and fast-twitch power is real, but it's slower than most riders fear, and the gap between an untrained and a well-trained masters rider is enormous. Train your easy days easy, ration your hard sessions, lift twice a week and protect recovery, and most riders over 40 keep setting personal bests for years.",
    },
    {
      question: "What changes most about training after 40?",
      answer:
        "Recovery. It slows with age, which is the one change that reshapes the whole plan. The fix isn't training harder — it's training easier most of the time, going hard a small and deliberate amount, and treating recovery as part of the training rather than the absence of it.",
    },
    {
      question: "Should masters cyclists do strength training?",
      answer:
        "It's close to non-negotiable. Lifting is the most effective tool for holding onto the muscle, power and bone density that age otherwise erodes, and research shows heavy strength work beats simply riding more for older riders. Two sessions a week is the sweet spot, dropping to one in-season.",
    },
    {
      question: "How much should masters cyclists rest between hard sessions?",
      answer:
        "More than they think. Most masters riders do best with one or two quality sessions a week and everything else easy, plus a reduced-volume week every third or fourth week. The recurring mistake is filling the gaps with comfortably-hard riding that costs recovery without delivering adaptation.",
    },
  ],
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
  "polarised-training": [
    {
      question: "What is polarised training?",
      answer:
        "Polarised training is an intensity distribution where roughly 80% of your training sits at low intensity (Zone 1-2) and roughly 20% sits at high intensity (Zone 4-5), with very little time in the moderate middle. It's the pattern that Professor Stephen Seiler found across elite endurance athletes in every discipline.",
    },
    {
      question: "Does polarised training work for amateur cyclists?",
      answer:
        "Yes. Seiler's research and our coaching experience both confirm that the 80/20 distribution works for amateurs, not just elites. The most common amateur mistake is spending too much time in the grey zone — training at moderate intensity that feels productive but doesn't efficiently build either the aerobic base or the top end.",
    },
    {
      question: "How do I know if I'm training in the grey zone?",
      answer:
        "If your easy rides regularly creep above Zone 2, your heart rate on recovery rides drifts into tempo, or you finish 'easy' sessions feeling moderately tired rather than fresh, you're in the grey zone. Check your data — most amateurs are surprised by how hard their easy days actually are.",
    },
    {
      question: "Is sweet spot or polarised training better?",
      answer:
        "Both work — the question is timing. Sweet spot is efficient for time-crunched riders in the base-to-build transition. Polarised tends to produce better long-term results, especially when you have the volume for genuine Zone 2 work. Most coaches use both at different points in the season.",
    },
  ],
  "vo2max-training": [
    {
      question: "What is VO2max in cycling?",
      answer:
        "VO2max is the maximum rate at which your body can take in and use oxygen during exercise — it's the ceiling above your FTP. A higher VO2max gives your threshold more room to climb, which is why VO2max intervals are a key part of any structured training plan.",
    },
    {
      question: "How do I improve my VO2max?",
      answer:
        "VO2max intervals — 3-5 minute efforts at 106-120% of FTP with equal or slightly shorter recovery — are the primary tool. The classic 4x4 protocol (4 minutes hard, 4 minutes rest) is the most research-validated session. Two VO2max sessions per week is the sweet spot for most amateurs.",
    },
    {
      question: "Does VO2max decline with age?",
      answer:
        "Yes — typically 5-10% per decade after age 30 in untrained individuals. But trained masters cyclists can slow this decline dramatically. Research shows that cyclists who maintain structured high-intensity training lose far less VO2max than those who only ride easy.",
    },
    {
      question: "What are the best VO2max intervals for cycling?",
      answer:
        "The 4x4 minute protocol is the gold standard. Other effective formats include 5x3 minutes, 6x3 minutes, and hill repeat variations at 106-120% FTP. The key is spending enough total time above 90% of your maximum heart rate to drive the adaptation.",
    },
  ],
  "indoor-training": [
    {
      question: "Is indoor training as effective as outdoor riding?",
      answer:
        "For structured interval work, indoor training is often more effective because you can control every variable — power, cadence, duration, recovery. For long endurance rides and skill development, outdoor riding has the edge. Most serious cyclists use both.",
    },
    {
      question: "Should I use Zwift or TrainerRoad?",
      answer:
        "TrainerRoad is better for structured, data-driven training with adaptive plans. Zwift is better for motivation through gamification and group rides. If you're disciplined and want the most efficient sessions, TrainerRoad. If you struggle with indoor motivation, Zwift keeps you pedalling.",
    },
    {
      question: "What smart trainer should I buy?",
      answer:
        "A direct-drive smart trainer from Wahoo, Tacx, or Elite in the mid-range price bracket covers everything most amateurs need — accurate power, controllable resistance, and quiet operation. Wheel-on trainers are cheaper but less accurate and noisier.",
    },
    {
      question: "How do I stay motivated training indoors?",
      answer:
        "Variety, structure, and a proper setup. Alternate between structured intervals, Zwift races, and group rides. Set up a fan, screen, and good ventilation. Keep indoor sessions shorter and sharper than outdoor rides — 60-90 minutes of quality beats three hours of grinding.",
    },
  ],
  "bike-fitting": [
    {
      question: "How much does a bike fit cost?",
      answer:
        "A professional bike fit typically costs between £150 and £350 depending on the method and the fitter. The best value comes from fitters who combine physical assessment with on-bike measurement — not just software or plumb lines. It's one of the best investments a serious cyclist can make.",
    },
    {
      question: "How often should I get a bike fit?",
      answer:
        "Get fitted when you buy a new bike, after a significant injury or surgery, if your riding goals change substantially, or if persistent pain develops. A good fit lasts years unless your body changes — and a yearly check-in is usually a 30-minute adjustment, not a full session.",
    },
    {
      question: "Can a bike fit improve my power output?",
      answer:
        "Yes. A proper fit optimises hip angle, knee tracking, and pedalling efficiency, which can unlock watts you were losing to poor position. Phil Burt has documented cases where a single saddle or crank-length change added measurable watts without any fitness change.",
    },
    {
      question: "Should I try shorter cranks?",
      answer:
        "Possibly. Shorter cranks reduce hip impingement at the top of the pedal stroke and can improve comfort and power for riders with limited hip flexibility — especially masters cyclists. Phil Burt and Daryl Fitzgerald both recommend it as one of the first things to check.",
    },
  ],
  "gravel-cycling": [
    {
      question: "How is gravel training different from road training?",
      answer:
        "Gravel demands more muscular endurance, bike handling, and fuelling discipline than road racing. Training should include more sustained tempo and sweet-spot work, off-road skills sessions, and gut training for high carbohydrate intake over long events. The aerobic base matters just as much.",
    },
    {
      question: "Do I need a gravel-specific bike?",
      answer:
        "For serious gravel riding and racing, yes — wider tyre clearance, more stable geometry, and mounting points for bags make a real difference. For casual gravel, many road bikes with 32-35mm tyres handle well enough to get started.",
    },
    {
      question: "Does aerodynamics matter in gravel?",
      answer:
        "More than most riders think. Dylan Johnson's wind-tunnel testing showed meaningful time savings from aero optimisation even on gravel — position, helmet, and bar width all contribute. At Unbound speeds, aero gains are real and free.",
    },
    {
      question: "What are the best gravel races?",
      answer:
        "Unbound Gravel (200 miles, Kansas), Badlands (800km, Spain), and the Belgian Waffle Ride are the marquee events. In Ireland, the emerging gravel scene includes routes across Wicklow and Kerry. Each has a different character — pick the one that matches your ambition and terrain preference.",
    },
  ],
  "climbing": [
    {
      question: "How do I stop getting dropped on climbs?",
      answer:
        "Five fixable things: pace yourself (don't follow the first attack), improve your power-to-weight ratio, find the right climbing cadence, check your position and bike fit on gradients, and work on the mental side. Most amateurs lose time through pacing errors, not fitness gaps.",
    },
    {
      question: "What W/kg do I need for Alpe d'Huez?",
      answer:
        "To ride Alpe d'Huez comfortably you need roughly 3.0-3.5 W/kg. To ride it well under an hour, closer to 4.0 W/kg. The 21 hairpins take most amateurs between 60 and 90 minutes — pacing the first third conservatively is the single biggest factor in how the climb feels.",
    },
    {
      question: "Should I climb seated or standing?",
      answer:
        "Both. Seated climbing is more efficient for sustained efforts. Standing uses more energy but recruits different muscle groups and provides relief on steep pitches. The best climbers alternate — standing for 10-15 pedal strokes to reset, then sitting back down.",
    },
    {
      question: "How do I pace a long climb?",
      answer:
        "Start conservative — the first 20% of any long climb should feel easy. Target 85-90% of your FTP for climbs over 20 minutes and increase effort only in the final third if you have legs left. Negative-splitting a climb almost always produces a faster overall time.",
    },
  ],
  "cycling-psychology": [
    {
      question: "Can mental training make me faster on the bike?",
      answer:
        "Yes. The mental side is often the last 5% that separates two riders with identical fitness. Techniques like process-focused goal setting, pre-race visualisation, and self-talk management have measurable effects on race performance and training consistency.",
    },
    {
      question: "How do I deal with race-day anxiety?",
      answer:
        "Reframe anxiety as activation — your body preparing to perform. Focus on process goals (pacing, fuelling, position) rather than outcome goals (time, placing). A structured warm-up routine and a written race plan both reduce uncertainty, which is what most anxiety is actually about.",
    },
    {
      question: "How do I stay motivated to train?",
      answer:
        "Motivation follows action more than it precedes it. Set specific, measurable goals tied to events. Train with others or inside a community like Not Done Yet. Track progress with data. And accept that motivation will dip — discipline and habit carry you through the flat patches.",
    },
    {
      question: "How do I cope after a bad race?",
      answer:
        "Separate the data from the emotion. Review what went wrong factually — pacing, fuelling, preparation — and identify what's fixable. Most bad races have one or two specific errors that won't repeat if you address them. The riders who improve fastest are the ones who treat setbacks as diagnostics, not verdicts.",
    },
  ],
  "heat-training": [
    {
      question: "Does heat training improve FTP?",
      answer:
        "Yes — research shows heat acclimation can improve time-trial performance by 4-6% and FTP by up to 5%, even in cool conditions. The adaptations include increased plasma volume, better cardiovascular efficiency, and improved thermoregulation. It's one of the most underused legal performance tools.",
    },
    {
      question: "How do I heat acclimate at home?",
      answer:
        "Ride your indoor trainer in a warm room (30°C+) with minimal fan for 60-90 minutes at easy to moderate intensity, 5-7 days in a row. Wear extra layers if needed. The protocol takes 7-14 days to produce measurable adaptations and needs to be done within 4 weeks of your target event.",
    },
    {
      question: "Is heat training safe for masters riders?",
      answer:
        "Yes, with precautions. Heat tolerance does decline with age, so start conservatively, hydrate aggressively, and monitor how you feel. Cut sessions short if you feel dizzy or nauseous. The performance benefits are just as real for over-40 riders — they just need a more gradual build-up.",
    },
    {
      question: "How long does heat acclimation last?",
      answer:
        "Most of the adaptation decays within 2-3 weeks of stopping heat exposure. Schedule your heat block to finish 1-2 weeks before your target event — close enough to retain the benefits, far enough to freshen up with normal training.",
    },
  ],
  "women-cycling": [
    {
      question: "Should I train differently around my menstrual cycle?",
      answer:
        "You can. The follicular phase (days 1-14) tends to favour high-intensity work, while the luteal phase (days 15-28) can bring higher perceived effort and reduced recovery. Some women benefit from aligning hard sessions with the follicular phase, but consistency matters more than perfect cycle-syncing.",
    },
    {
      question: "Does menopause affect cycling performance?",
      answer:
        "Menopause changes recovery speed, body composition, bone density, and thermoregulation — but it doesn't end performance improvement. Strength training, adequate protein, and adjusted recovery become more important. Many women set personal bests through perimenopause and beyond with the right approach.",
    },
    {
      question: "Why is bone density a concern for female cyclists?",
      answer:
        "Cycling is non-weight-bearing, so it doesn't build bone the way running or lifting does. Combined with the hormonal changes of menopause, female cyclists face a higher risk of low bone density. The fix is strength training plus impact exercise — even short running sessions help.",
    },
    {
      question: "How is nutrition different for female cyclists?",
      answer:
        "Women typically need higher relative protein intake, more attention to iron and calcium, and careful management of energy availability — especially during menstruation and perimenopause. Under-fuelling hits female athletes harder and faster than male athletes, and the consequences are more serious.",
    },
  ],
  "race-preparation": [
    {
      question: "How long should I taper before a race?",
      answer:
        "For a target event, 7-14 days of reduced volume with maintained intensity is the standard taper. Drop training volume by 40-60% but keep the intensity of your key sessions the same. The most common mistake is tapering too conservatively — you should feel slightly antsy, not fully rested.",
    },
    {
      question: "What should I eat on race morning?",
      answer:
        "A familiar carbohydrate-rich meal 2-3 hours before the start — porridge, toast, rice, or whatever you've rehearsed in training. Avoid anything new, high-fibre, or high-fat. Top up with a gel or small snack 15-30 minutes before the gun.",
    },
    {
      question: "How do I pace a 100-mile sportive?",
      answer:
        "Start at 70-75% of your FTP for the first hour, settle into 75-80% through the middle, and use whatever's left in the final quarter. Most amateurs go too hard in the first 30 minutes and pay for it in the last 30. Fuel from the start — don't wait until you're hungry.",
    },
    {
      question: "What should I bring on race day?",
      answer:
        "Bike, spare inner tubes, CO2 inflators, your race nutrition (pre-planned and measured), a warm-up plan, your number, and a written pacing strategy. The night before, set everything out so race morning has zero decisions. Read our race-day checklist for the full list.",
    },
  ],
  "cycling-periodisation": [
    {
      question: "What is periodisation in cycling?",
      answer:
        "Periodisation is the practice of dividing your training year into distinct phases — base, build, peak, and transition — each with a specific focus. It ensures you arrive at your target event in the best possible form, rather than training randomly and hoping for the best.",
    },
    {
      question: "How long should a training block be?",
      answer:
        "Most training blocks (mesocycles) run 3-6 weeks, with a recovery week built in every third or fourth week. The exact length depends on your training age, recovery capacity, and how your body responds — masters cyclists often do better with shorter blocks and more frequent recovery.",
    },
    {
      question: "What is reverse periodisation?",
      answer:
        "Reverse periodisation flips the traditional model: intensity-focused work in winter (when time is short) and volume in summer (when daylight allows long rides). It works well for time-crunched amateurs and riders whose main events are in late summer.",
    },
    {
      question: "Do I need an off-season?",
      answer:
        "Yes. A 2-4 week transition phase after your last target event allows physical and mental recovery. Ride if you want to, but without structure or intensity. Use the time for gym work, cross-training, or simply enjoying the bike without a plan. The season that follows is almost always better for it.",
    },
  ],
  "sweet-spot-training": [
    {
      question: "What is sweet spot training?",
      answer:
        "Sweet spot sits at 88-93% of your FTP — just below threshold, in the zone where you get a strong training stimulus with manageable fatigue. It's efficient because it's hard enough to drive adaptation but sustainable enough to do more total work than threshold intervals.",
    },
    {
      question: "Is sweet spot better than threshold training?",
      answer:
        "Neither is universally better — they serve different purposes. Sweet spot produces a high training load with less fatigue, making it ideal for base-to-build phases and time-crunched riders. Threshold work (95-105% FTP) is more race-specific and targets FTP improvement more directly.",
    },
    {
      question: "When should I use sweet spot training?",
      answer:
        "Sweet spot works best in the base-to-build transition and for time-crunched riders who need maximum return from limited hours. It's less effective as your sole intensity year-round — rotate it with polarised blocks and VO2max work to avoid accommodation.",
    },
    {
      question: "Can I do too much sweet spot?",
      answer:
        "Yes. Too much sweet spot without sufficient easy riding or genuine high-intensity work can leave you stuck in the grey zone — moderately fit but not improving. The most common pattern we see is riders who do nothing but sweet spot and plateau after 8-12 weeks.",
    },
  ],
  "sprint-training": [
    {
      question: "Can I improve my sprint as a masters cyclist?",
      answer:
        "Yes. Sprint power does decline with age, but it responds to training at any age. Heavy gym work, short maximal sprints (6-15 seconds), and neuromuscular activation drills all maintain and develop sprint power. André Greipel was winning World Tour sprints well into his thirties.",
    },
    {
      question: "What's the difference between sprint power and winning power?",
      answer:
        "Sprint power is your raw peak wattage. Winning power is the ability to produce that wattage at the right moment — after positioning, timing the jump, and reading the race. Cory Williams has made this point clearly: the strongest sprinter doesn't always win.",
    },
    {
      question: "How do sprinters train differently?",
      answer:
        "Sprinters do more gym work (heavy squats, plyometrics), more short maximal efforts (10-30 seconds), and more race-simulation sprints out of fatigued states. But they also need an enormous aerobic base to reach the finish fresh enough to sprint — which is why Grand Tour sprinters train like endurance athletes for most of the year.",
    },
    {
      question: "How often should I sprint train?",
      answer:
        "Two sprint-specific sessions per week is enough for most amateurs — one in the gym and one on the bike. Sprint efforts are neuromuscular, so they need full recovery between reps and between sessions. Quality matters far more than volume.",
    },
  ],
  "sleep-performance": [
    {
      question: "How much sleep do cyclists need?",
      answer:
        "7-9 hours per night, consistently. Sleep is where growth hormone release peaks, muscle repair happens, and the neural adaptations from training consolidate. Consistently getting less than 7 hours measurably reduces power output, reaction time, and immune function.",
    },
    {
      question: "Does sleep debt affect cycling performance?",
      answer:
        "Yes — and it accumulates. Even moderate sleep debt (1-2 hours per night over a week) reduces endurance performance, increases perceived effort, and impairs recovery. You can't fully 'catch up' with a single long night. Consistency matters more than occasional long sleeps.",
    },
    {
      question: "How do I optimise sleep for recovery?",
      answer:
        "Keep a consistent wake time (even on weekends), sleep in a cool dark room, avoid screens for 30-60 minutes before bed, and time caffeine to stop at least 8 hours before sleep. These basics outperform every supplement and gadget on the market.",
    },
    {
      question: "Is napping useful for cyclists?",
      answer:
        "A 20-30 minute nap in the early afternoon can partially offset a bad night's sleep and improve afternoon training quality. Longer naps risk disrupting nighttime sleep. If you regularly need naps to function, the real fix is your nighttime sleep, not the nap.",
    },
  ],
  "cycling-cadence": [
    {
      question: "What is the best cadence for cycling?",
      answer:
        "There's no single best cadence — it depends on terrain, effort, and physiology. Most efficient flat riding sits around 85-95 RPM. Climbing cadence tends to drop to 70-85 RPM. The 'right' cadence is the one you can sustain at your target power without excessive cardiovascular or muscular fatigue.",
    },
    {
      question: "Should I do low-cadence training?",
      answer:
        "Yes. Low-cadence intervals (40-60 RPM) force type 2 muscle fibres to develop aerobic capacity and build neuromuscular strength. A 2024 study showed they improved VO2max by 8.7% compared to 4.6% for freely chosen cadence. John Wakefield and Tim Kerrison both prescribe them to World Tour riders.",
    },
    {
      question: "Does optimal cadence change with age?",
      answer:
        "Masters cyclists tend to self-select slightly lower cadences as type 2 fibre recruitment changes with age. This isn't necessarily wrong — lower cadence can be more metabolically efficient for older riders. But deliberate high-cadence drills help maintain neuromuscular speed that might otherwise decline.",
    },
    {
      question: "What cadence should I use for climbing?",
      answer:
        "Most riders climb best at 70-85 RPM, depending on the gradient. Steeper climbs naturally drive cadence lower. The key is finding a cadence that balances muscular and cardiovascular strain — grinding at 50 RPM overloads the legs, spinning at 100 RPM overloads the lungs.",
    },
  ],
  "ultra-endurance": [
    {
      question: "How do I train for an ultra-distance cycling event?",
      answer:
        "Build a huge aerobic base with high-volume Zone 2 riding, practise sustained moderate efforts (4-8 hours), train your gut to absorb 60-90g of carbohydrate per hour, and simulate race conditions including sleep deprivation and night riding. The fitness is only half the challenge — logistics and mental resilience matter just as much.",
    },
    {
      question: "How do you fuel a 24+ hour cycling event?",
      answer:
        "The same principles as shorter events, just extended: 60-90g carbohydrate per hour from a mix of gels, bars, and real food. Add savoury options (rice cakes, sandwiches) after 8+ hours when sweetness becomes nauseating. Practise your entire nutrition plan in training — Badlands is not the place to try a new gel.",
    },
    {
      question: "What mental strategies work in ultra racing?",
      answer:
        "Break the event into manageable segments rather than thinking about the total distance. Use process goals (ride to the next checkpoint, eat every 30 minutes). Accept that low points are inevitable and temporary. Sofiane Sehili talks about the Silk Road teaching him that the worst moments pass if you keep moving.",
    },
    {
      question: "Do I need bikepacking-specific equipment?",
      answer:
        "For unsupported events like Badlands and Tour Divide, yes — lightweight bags, navigation, lighting, and sleeping gear are essential. For supported sportives and stage races, standard road equipment is fine. Sebastian Breuer's wind-tunnel testing showed that bag placement matters for aerodynamics even in ultra events.",
    },
  ],
  "cycling-breathing": [
    {
      question: "Should I breathe through my nose or mouth while cycling?",
      answer:
        "At low intensity, nasal breathing is fine and may offer some benefits (better air filtration, improved CO2 tolerance). At moderate to high intensity, mouth breathing is necessary to move enough air. Most riders naturally switch as effort increases — don't force nasal breathing during hard efforts.",
    },
    {
      question: "Does respiratory training improve cycling performance?",
      answer:
        "Inspiratory muscle training (IMT) has decent evidence for improving time-trial performance and reducing perceived effort, especially in trained athletes. The gains are modest but real — typically 2-4% improvement in time-trial performance. Devices like POWERbreathe are the most studied tools.",
    },
    {
      question: "What is CO2 tolerance training?",
      answer:
        "CO2 tolerance training involves deliberate breath-hold exercises and controlled breathing to raise your tolerance to carbon dioxide. Higher CO2 tolerance reduces the urge to breathe and can improve pacing discipline. Dr Andrew Sellars has covered the science and practical protocols on the podcast.",
    },
    {
      question: "How should I breathe on climbs?",
      answer:
        "Focus on full exhalation — most riders under-breathe on climbs by not emptying their lungs completely. A rhythmic breathing pattern matched to your cadence (e.g., exhale for 2 pedal strokes, inhale for 2) helps maintain oxygen delivery and reduces the panicky feeling that comes with high-effort climbing.",
    },
  ],
  "power-meter-training": [
    {
      question: "Do I need a power meter?",
      answer:
        "If you want to train with precision, yes. A power meter is the most objective way to set training zones, track progress, pace efforts, and ensure you're hitting the right intensity. Heart rate and RPE work, but power removes the guesswork. It's the single best training investment after a good bike fit.",
    },
    {
      question: "Which type of power meter is best?",
      answer:
        "Crank-based and pedal-based power meters offer the best balance of accuracy, portability, and ease of installation. Spider-based options are the gold standard for accuracy. Pedal-based systems (like Garmin Rally) are easy to swap between bikes. Hub-based and single-sided options work on a tighter budget.",
    },
    {
      question: "How do I train with a power meter?",
      answer:
        "Start by establishing your FTP, then set your training zones. Use power to pace intervals precisely, monitor easy-day intensity (the biggest source of grey-zone drift), and track progress over 6-8 week blocks. The real value is in the data over time, not a single ride.",
    },
    {
      question: "Power meter or smart trainer — which should I buy first?",
      answer:
        "If you train indoors regularly, a smart trainer with built-in power is the better first purchase — it doubles as your indoor training platform and your power source. If you race or ride outdoors primarily, an on-bike power meter gives you data where it matters most.",
    },
  ],
  "running-for-cyclists": [
    {
      question: "Is running good cross-training for cyclists?",
      answer:
        "Yes. A 2026 systematic review (Menges et al., Frontiers in Sports and Active Living) found meaningful VO2max transfer between the two disciplines, and pros including Roglič, Evenepoel, and Yates run regularly. The benefits are cardiovascular maintenance in less time, improved bone density (cyclists are 7× more likely to have spinal osteopenia), and neuromuscular variety.",
    },
    {
      question: "How much should a cyclist run per week?",
      answer:
        "Two to three runs of 20-40 minutes in the off-season; one easy 20-30 minute run during racing season. The limiter is tissue adaptation, not fitness — your cardiovascular engine is ahead of your tendons and bones.",
    },
    {
      question: "Will running make me slower on the bike?",
      answer:
        "Not if volume and intensity are managed. Running becomes a problem when it adds excessive fatigue on top of hard cycling sessions. Kept easy and progressive, it supplements cycling without competing with it.",
    },
    {
      question: "Do I need special running shoes as a cyclist?",
      answer:
        "You need a proper pair of daily trainers (Asics Novablast, Brooks Ghost, or Hoka Clifton are solid starting points, $130-160). You do not need carbon-plated super shoes for two runs a week. Get fitted at a running shop — shoe choice matters more than any other running purchase.",
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
