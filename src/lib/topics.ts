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
  /** ISO editorial review date for visible freshness and CollectionPage schema. */
  lastReviewed?: string;
  /** Named human responsible for the latest editorial review. */
  reviewedBy?: {
    name: string;
    role: string;
    href: string;
  };
  /** Optional glossary entity represented by this canonical topic owner. */
  definedTerm?: {
    name: string;
    alternateName?: string;
    termCode?: string;
  };
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
  /** Primary or official references used to review the topic's core claims. */
  sources: TopicSource[];
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

export interface TopicSource {
  title: string;
  href: string;
}

/**
 * Topic hubs — curated landing pages that group related content.
 * Each one targets a high-value keyword cluster.
 */
const TOPIC_DEFINITIONS: Omit<TopicHub, "posts" | "episodes" | "tools" | "commercialPath" | "relatedTopics" | "featuredPostSlugs" | "pillarContent" | "citedClaims" | "claimsHeading" | "claimsCaption" | "sources" | "faqs">[] = [
  {
    slug: "ftp-training",
    title: "FTP Cycling: Meaning, Tests, Zones & Training",
    headline: "FTP IN CYCLING: MEANING, TESTS & TRAINING",
    ctaHeadline: "FTP TRAINING BUILT AROUND YOUR FULL POWER PROFILE.",
    description:
      "FTP in cycling is a practical estimate of threshold power used for zones and progress. Learn its meaning, how tests differ, its limits and what to do next.",
    pillar: "coaching",
    lastReviewed: "2026-08-26",
    reviewedBy: {
      name: "Anthony Walsh",
      role: "Roadman Cycling founder and head coach",
      href: "/author/anthony-walsh",
    },
    definedTerm: {
      name: "Functional Threshold Power",
      alternateName: "FTP in cycling",
      termCode: "FTP",
    },
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
    title: "How to Build a Cycling Training Plan — Method Guide",
    headline: "CYCLING TRAINING PLAN METHODOLOGY",
    ctaHeadline: "SEE ROADMAN'S COACHED PLAN OPTIONS.",
    description:
      "A cycling training plan links a defined goal to the rider's schedule, history, capacity, recovery and feedback. This reviewed guide explains the method and evidence limits.",
    pillar: "coaching",
    lastReviewed: "2026-08-26",
    reviewedBy: {
      name: "Anthony Walsh",
      role: "Roadman Cycling founder and head coach",
      href: "/author/anthony-walsh",
    },
    keywords: [
      "how to build a cycling training plan",
      "cycling training plan methodology",
      "how to structure a cycling training week",
      "cycling periodisation guide",
      "cycling plan review rules",
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
    title: "Cycling Strength & Conditioning Research Library",
    headline: "FIND THE RIGHT STRENGTH ANSWER",
    ctaHeadline: "BUILD THE GYM WORK AROUND THE RIDER.",
    description:
      "Roadman's evidence and practical library for cyclist strength training: the broad research answer, beginner progression, exercises, masters, in-season work, mobility and safe pain guidance.",
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
    title: "How Cycling Coaching Works — Cost, Fit & Methods",
    headline: "CYCLING COACHING KNOWLEDGE GUIDE",
    ctaHeadline: "SEE WHAT ROADMAN COACHING INCLUDES.",
    description:
      "An educational guide to what cycling coaches do, when coaching may be useful, how online and in-person services differ, what they cost, and how to compare them safely.",
    pillar: "coaching",
    lastReviewed: "2026-08-26",
    reviewedBy: {
      name: "Anthony Walsh",
      role: "Roadman Cycling founder and head coach",
      href: "/author/anthony-walsh",
    },
    keywords: [
      "how cycling coaching works",
      "what does a cycling coach do",
      "is a cycling coach worth it",
      "cycling coaching cost",
      "cycling coach qualifications",
      "online vs in person cycling coaching",
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
    title: "Masters Cycling Guide Library — Training After 40",
    headline: "MASTERS CYCLING GUIDE LIBRARY",
    ctaHeadline: "COACHING BUILT FOR THE OVER-40 RIDER.",
    description:
      "A routed library of Roadman's reviewed masters cycling guides, tools and podcast resources. Use /masters for the canonical evidence layer, then choose the narrow page for a weekly schedule, 12-week plan, plateau, recovery, strength, nutrition or racing question.",
    pillar: "coaching",
    lastReviewed: "2026-08-26",
    reviewedBy: {
      name: "Anthony Walsh",
      role: "Cycling Coach & Podcast Host",
      href: "/author/anthony-walsh",
    },
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
    title: "Polarised Training Cycling — Guides, Evidence & Tools",
    headline: "BUILD A POLARISED TRAINING PATH",
    ctaHeadline: "TURN THE MODEL INTO YOUR WEEK.",
    description:
      "A curated polarised-training learning path for cyclists: start with the evidence-led 80/20 guide, then compare models, set zones, choose sessions and hear the relevant Roadman podcast conversations.",
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
    title: "Bike Fitting — Methods, Evidence & Rider Position",
    headline: "FIT THE BIKE TO THE RIDER",
    ctaHeadline: "BUILD A POSITION YOU CAN REPEAT.",
    description:
      "Roadman's bike-fitting knowledge hub: evidence limits, saddle and cleat methods, cockpit and crank decisions, expert interviews, pain boundaries, and the route to the canonical DIY guide.",
    pillar: "community",
    keywords: [
      "bike fitting knowledge",
      "bike fit evidence",
      "cycling saddle position",
      "crank length cycling",
      "bike fit after 40",
      "cycling position",
      "professional bike fit",
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
    title: "Heat Training for Cyclists — Evidence, Acclimation & Safety",
    headline: "PREPARE FOR THE HEAT, WITHOUT THE HYPE",
    ctaHeadline: "HOT-EVENT PREPARATION, BUILT INTO YOUR PLAN.",
    description:
      "Evidence-led heat training for cyclists: what acclimation can and cannot do, how to prepare for hot events, hydration boundaries, safety for masters riders, and why no FTP gain is guaranteed.",
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
    title: "Sweet Spot Training Resources, Comparisons & Tools",
    headline: "SWEET SPOT — THE LEARNING PATH",
    ctaHeadline: "CHOOSE THE SESSION FROM THE RIDER, NOT THE SLOGAN.",
    description:
      "Roadman's sweet spot training knowledge hub: the evidence-reviewed 88–94% FTP guide, calculators and focused comparisons with Zone 2, threshold and polarised training.",
    pillar: "coaching",
    keywords: [
      "sweet spot training cycling",
      "sweet spot vs threshold",
      "sweet spot vs polarised",
      "88-94% ftp training",
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
  {
    slug: "cycling-for-runners",
    title: "Cycling for Runners",
    headline: "Cycling for Runners — The Complete Cross-Training Guide",
    ctaHeadline: "Add Cycling to Your Running",
    description:
      "How cycling builds aerobic base without impact stress, helps injured runners maintain fitness, and improves running performance through cross-training — with bike buying guides, fit advice, and structured plans.",
    pillar: "strength",
    keywords: [
      "cycling for runners",
      "is cycling good for runners",
      "best bike for runners",
      "cycling cross training running",
      "runner cycling",
      "cycling instead of running",
      "low impact cardio for runners",
      "cycling to improve running",
    ],
  },
  {
    slug: "cycling-tech",
    title: "Cycling Tech & GPS — Bike Computers, Watches & Power Meters",
    headline: "THE DATA THAT ACTUALLY MATTERS",
    ctaHeadline: "TRAINING BUILT ON YOUR ACTUAL DATA.",
    description:
      "The complete guide to cycling tech. Bike computers vs GPS watches, power meters, and the handful of metrics worth checking — cutting through the marketing to what actually moves your training.",
    pillar: "coaching",
    keywords: [
      "cycling tech",
      "best cycling computers 2026",
      "gps watch cycling",
      "wahoo vs garmin",
      "power meter cycling",
      "cycling metrics explained",
      "bike computer vs watch",
      "cycling data",
    ],
  },
  {
    slug: "cycling-plateaus",
    title: "Cycling Plateaus — Why You're Stuck and How to Break Through",
    headline: "STUCK? HERE'S WHY — AND WHAT TO DO ABOUT IT",
    ctaHeadline: "COACHING THAT FINDS THE LIMITER AND FIXES IT.",
    description:
      "Why cyclists plateau, how to diagnose the limiter, and evidence-based strategies to break through. FTP stalls, overtraining traps, grey-zone drift, and the recovery mistakes that masquerade as fitness problems — from the coaches and scientists behind 1,400+ Roadman episodes.",
    pillar: "coaching",
    keywords: [
      "cycling plateau",
      "ftp plateau",
      "stuck cycling",
      "cycling performance stall",
      "break through cycling plateau",
      "overtraining cycling",
      "cycling not improving",
      "why am i not getting faster cycling",
    ],
  },
];

/** Map of topic slugs to relevant blog post slugs */
const TOPIC_POST_MAP: Record<string, string[]> = {
  "ftp-training": [
    "ftp-training-zones-cycling-complete-guide",
    "how-to-improve-ftp-cycling",
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
    "power-meter-buying-guide-cyclists",
    "ftp-benchmarks-by-age-and-experience",
    "find-your-zone-2-lactate-testing-san-millan",
    "ftp-training-for-triathletes",
    "heat-training-cyclists-30-watts-ftp-protocol",
    "how-long-to-improve-ftp",
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
    "when-to-test-ftp-cycling",
    "ftp-test-protocols-compared-cycling",
    "which-ftp-test-protocol-best-guide",
    "training-stress-score-tss-cycling-guide",
    "how-to-read-cycling-power-file-guide",
    "cycling-heart-rate-monitor-complete-guide",
    "power-duration-curve-find-your-limiters",
    "cycling-lactate-what-it-actually-does-guide",
    "cycling-watt-floor-raising-guide",
    "cycling-ftp-test-protocols-compared-guide",
    "cycling-blood-lactate-testing-guide",
    "cycling-building-ftp-systematic-guide",
    "cycling-threshold-power-explained-guide",
    "cycling-rider-phenotype-strengths-guide",
  ],
  "cycling-nutrition": [
    "how-many-calories-cycling-burns-real-numbers",
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
    "calories-burned-cycling-accurate-guide",
    "race-day-fuelling-strategy-cycling-guide",
    "cycling-race-weight-finding-yours-guide",
    "fuelling-self-assessment-cycling-nutrition-guide",
    "first-gran-fondo-what-nobody-tells-you-guide",
    "protein-for-cyclists-complete-guide",
    "supplements-cyclists-what-works-guide",
    "cycling-long-ride-pacing-fuelling-guide",
    "magnesium-cyclists-recovery-performance-guide",
    "beta-alanine-cyclists-supplement-guide",
    "cycling-iron-ferritin-endurance-guide",
    "cycling-fat-adaptation-low-carb-training-guide",
    "cycling-race-nutrition-plan-guide",
    "cycling-sodium-loading-hydration-guide",
    "cycling-electrolytes-sweat-rate-testing-guide",
    "cycling-body-composition-masters-guide",
    "cycling-vitamin-d-performance-guide",
    "cycling-creatine-supplementation-guide",
    "cycling-omega-3-anti-inflammatory-guide",
    "cycling-weekly-meal-prep-guide",
    "cycling-protein-timing-recovery-guide",
    "cycling-gut-training-race-nutrition-guide",
    "cycling-how-to-fuel-a-century-ride-guide",
    "cycling-carb-loading-48-hour-protocol-guide",
    "cycling-weight-loss-without-losing-power-guide",
    "cycling-collagen-joint-health-guide",
    "cycling-recovery-nutrition-window-guide",
    "cycling-race-fuelling-mistakes-guide",
    "cycling-protein-sources-endurance-athletes-guide",
    "cycling-iron-deficiency-performance-guide",
    "cycling-continuous-glucose-monitoring-performance-guide",
    "cycling-plant-based-nutrition-performance-guide",
    "cycling-caffeine-performance-guide",
    "cycling-magnesium-performance-recovery-guide",
    "cycling-anti-inflammatory-foods-recovery-guide",
    "cycling-training-camp-nutrition-guide",
    "cycling-metabolic-health-type-2-prevention-guide",
    "cycling-zinc-immune-function-guide",
    "cycling-beetroot-juice-nitrates-performance-guide",
    "cycling-joint-supplements-glucosamine-guide",
    "cycling-tart-cherry-juice-recovery-guide",
    "cycling-hay-fever-pollen-allergy-guide",
    "cycling-periodised-nutrition-guide",
    "cycling-macro-tracking-practical-guide",
    "cycling-gut-microbiome-performance-guide",
    "cycling-caffeine-tolerance-reset-guide",
    "cycling-glycogen-management-fuelling-guide",
    "cycling-supplement-timing-stacking-guide",
  ],
  "cycling-training-plans": [
    "training-load-ctl-atl-tsb-explained-cyclists",
    "ftp-test-protocols-compared-cycling",
    "cycling-taper-pmc-performance-management-chart",
    "efficiency-factor-trainingpeaks-tracking",
    "post-session-feedback-trainingpeaks-notes",
    "trainingpeaks-virtual-structured-indoor-training",
    "century-tss-trainingpeaks-100-mile-fitness",
    "cycling-periodisation-plan-guide",
    "polarised-training-cycling-complete-guide",
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
    "indoor-training-setup-complete-guide",
    "how-to-peak-cycling-a-race-guide",
    "zone-2-cycling-heart-rate-vs-power-vs-rpe",
    "off-season-training-cycling-what-to-do-guide",
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
    "cape-town-cycle-tour-training-guide",
    "best-roadman-episodes-time-crunched",
    "biggest-training-mistakes-from-coaches",
    "comeback-cyclist-12-week-return-plan",
    "common-training-mistakes-from-1400-podcast-episodes",
    "cutting-training-half-real-power-data",
    "cycling-altitude-training",
    "heat-training-cyclists-30-watts-ftp-protocol",
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
    "la-marmotte-training-guide",
    "joe-friel-perfect-cycling-training-week",
    "john-wakefield-team-bora-endurance-training",
    "leadville-100-training-guide",
    "leroica-training-guide",
    "low-cadence-training-cycling-torque-intervals",
    "mallorca-312-training-guide",
    "maratona-dles-dolomites-training-guide",
    "masters-cycling-training-report-2026",
    "matt-bottrill-7-pro-hacks",
    "mesocycle-training-explained-cyclists",
    "michael-matthews-no-base-miles-pro-training",
    "more-volume-getting-slower-cycling-overtraining",
    "new-study-confirms-heavy-strength-training-beats-more-miles-after-40",
    "olav-bu-triathlon-training-plan-design",
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
    "pro-cyclist-daily-routine-darren-rafferty",
    "pro-cyclist-winter-habits-offseason-playbook",
    "raid-pyreneen-training-guide",
    "reading-your-training-data-tss-ctl-atl-tsb",
    "rosa-kloser-unbound-2024-simple-training-plan",
    "sella-ronda-bike-day-training-guide",
    "sprint-interval-training-cyclists-masters",
    "steady-state-vs-interval-training-cycling",
    "sweet-spot-vs-threshold-vs-polarised-comparison",
    "time-crunched-cyclist-8-hours-week",
    "time-crunched-cyclist-benchmarks",
    "triathlon-cycling-training-plan",
    "tour-training-methods-amateurs-can-use",
    "triathlon-off-season-cycling",
    "unbound-gravel-200-training-guide",
    "vo2max-cycling-fixable-reasons-low",
    "what-cycling-podcasts-got-wrong-about-polarised-training",
    "what-dan-lorang-says-about-endurance",
    "what-experts-say-about-zone-2-training",
    "what-pros-say-about-amateur-training",
    "what-stephen-seiler-says-about-polarised-training",
    "why-pros-train-so-easy-mixed-metabolism-zone",
    "winter-cycling-training-indoor-protocol-pros",
    "zone-2-cycling-heart-rate-vs-power-vs-rpe",
    "zone-2-vs-endurance-training",
    "how-to-structure-cycling-training-block",
    "polarised-vs-sweet-spot-training-cyclists",
    "how-cycling-coaches-build-race-plans",
    "cycling-climbing-time-estimate-guide",
    "which-ftp-test-protocol-best-guide",
    "cycling-age-grading-performance-decline-guide",
    "tour-of-flanders-sportive-training-guide",
    "nove-colli-training-guide",
    "quebrantahuesos-training-guide",
    "granfondo-stelvio-training-guide",
    "marmotte-pyrenees-training-guide",
    "liege-bastogne-liege-challenge-training-guide",
    "amstel-gold-race-sportive-training-guide",
    "cyclassics-hamburg-training-guide",
    "vatternrundan-training-guide",
    "tour-of-wessex-training-guide",
    "granfondo-campagnolo-roma-training-guide",
    "charly-gaul-training-guide",
    "fondo-giro-ditalia-training-guide",
    "etape-caledonia-training-guide",
    "tour-of-the-battenkill-training-guide",
    "la-pina-cycling-marathon-training-guide",
    "best-sportives-italy-cycling-guide",
    "best-sportives-france-cycling-guide",
    "best-sportives-belgium-cycling-guide",
    "best-sportives-spain-cycling-guide",
    "best-sportives-uk-cycling-guide",
    "training-load-management-cyclists-guide",
    "race-day-fuelling-strategy-cycling-guide",
    "predicting-race-time-cycling-guide",
    "climb-time-prediction-strategy-cycling-guide",
    "power-to-speed-cycling-relationship-guide",
    "training-stress-score-tss-cycling-guide",
    "time-crunched-cyclist-training-framework-guide",
    "first-gran-fondo-what-nobody-tells-you-guide",
    "race-day-checklist-cycling-complete-guide",
    "cycling-training-pyramid-priorities-guide",
    "post-ride-analysis-improve-cycling-guide",
    "cycling-season-planning-guide",
    "training-while-travelling-cyclists-guide",
    "mid-season-fitness-reset-cycling-guide",
    "cycling-long-ride-pacing-fuelling-guide",
    "cycling-training-camp-preparation-guide",
    "cycling-watt-floor-raising-guide",
    "tour-de-mont-blanc-cyclosportive-training-guide",
    "granfondo-felice-gimondi-training-guide",
    "medio-fondo-fausto-coppi-training-guide",
    "paris-roubaix-challenge-training-guide",
    "cyclosportive-de-lardechoise-training-guide",
    "la-purito-andorra-training-guide",
    "cycling-training-stress-balance-tsb-guide",
    "cycling-commuting-fitness-gains-guide",
    "cycling-progressive-overload-guide",
    "cycling-early-season-form-building-guide",
    "cycling-one-hour-training-sessions-guide",
    "cycling-periodisation-annual-plan-guide",
    "cycling-gravel-training-for-road-cyclists-guide",
    "cycling-multi-day-event-preparation-guide",
    "cycling-fitting-training-around-work-family-guide",
    "granfondo-prosecco-training-guide",
    "tour-de-suisse-granfondo-training-guide",
    "3-peaks-cyclocross-training-guide",
    "gravel-worlds-training-guide",
    "gran-fondo-gavia-mortirolo-training-guide",
    "cycling-ftp-test-protocols-compared-guide",
    "cycling-polarised-vs-pyramidal-training-guide",
    "cycling-interval-session-library-guide",
    "cycling-how-to-choose-a-training-plan-guide",
    "girodolomiti-training-guide",
    "sportive-cingles-mont-ventoux-training-guide",
    "haute-route-pyrenees-training-guide",
    "transalp-training-guide",
    "tour-of-cambridgeshire-training-guide",
    "cycling-ctl-atl-tsb-explained-guide",
    "cycling-commuting-as-training-guide",
    "cycling-time-crunched-training-guide",
    "medio-fondo-delle-dolomiti-training-guide",
    "sportful-dolomiti-race-training-guide",
    "cyclotour-du-leman-training-guide",
    "dartmoor-classic-training-guide",
    "wiggle-new-forest-100-training-guide",
    "granfondo-strade-bianche-training-guide",
    "etape-du-dales-training-guide",
    "london-to-brighton-training-guide",
    "bealach-mor-training-guide",
    "tour-des-stations-training-guide",
    "gran-fondo-des-cantons-de-lest-training-guide",
    "l-ariegeoise-training-guide",
    "peak-district-100-training-guide",
    "rbc-granfondo-whistler-training-guide",
    "ocean-to-ocean-gran-fondo-training-guide",
  ],
  "cycling-recovery": [
    "recovery-between-hard-sessions-cycling",
    "michael-ormsbee-protein-before-bed-cyclists",
    "andrew-sellars-breathing-co2-cycling",
    "cycling-recovery-tips",
    "cycling-sleep-performance-guide",
    "cycling-sleep-optimisation",
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
    "more-volume-getting-slower-cycling-overtraining",
    "post-ride-recovery-window-cyclists-over-40",
    "recovery-for-cyclists-world-tour-protocols",
    "travel-fatigue-cycling-pre-event-protocol",
    "energy-availability-red-s-cyclists-guide",
    "training-load-management-cyclists-guide",
    "masters-cycling-recovery-after-40-guide",
    "recovery-readiness-self-assessment-cycling-guide",
    "cycling-over-50-training",
    "sleep-cycling-performance-complete-guide",
    "daily-training-readiness-check-cycling-guide",
    "cycling-with-chronic-conditions-evidence-guide",
    "comeback-after-cycling-crash-guide",
    "cycling-after-illness-rebuild-guide",
    "mid-season-fitness-reset-cycling-guide",
    "recognising-overtraining-cyclists-guide",
    "cycling-tendon-health-injury-prevention-guide",
    "blood-testing-cyclists-what-to-check-guide",
    "cycling-immune-system-training-guide",
    "cycling-swimming-cross-training-guide",
    "cycling-injury-comeback-rehab-guide",
    "cycling-posture-off-bike-desk-worker-guide",
    "cycling-chamois-care-hygiene-guide",
    "cycling-warm-up-cool-down-guide",
    "cycling-rest-day-what-to-do-guide",
    "cycling-knee-tracking-cleat-setup-guide",
    "cycling-recovery-between-races-guide",
    "cycling-training-plateaus-how-to-break-through-guide",
    "cycling-sports-massage-when-and-why-guide",
    "cycling-returning-after-illness-guide",
    "cycling-neck-pain-prevention-guide",
    "cycling-atrial-fibrillation-exercise-guide",
    "cycling-statin-use-performance-guide",
    "cycling-hip-flexor-pain-psoas-guide",
    "cycling-crash-recovery-road-rash-guide",
    "cycling-comeback-after-time-off-guide",
    "cycling-dealing-with-setbacks-guide",
    "cycling-training-when-sick-guide",
    "cycling-post-ride-stretching-routine-guide",
    "cycling-post-covid-return-guide",
    "cycling-sunscreen-protection-guide",
    "cycling-sleep-optimisation-performance-guide",
    "cycling-hip-pain-causes-fixes-guide",
    "cycling-foot-pain-hot-foot-guide",
    "cycling-wrist-hand-numbness-guide",
    "cycling-shoulder-neck-stretches-desk-workers-guide",
    "cycling-hip-mobility-power-guide",
    "cycling-respiratory-health-breathing-guide",
    "cycling-anti-inflammatory-foods-recovery-guide",
    "cycling-yoga-for-cyclists-complete-guide",
    "cycling-heart-rate-variability-guide",
    "cycling-longevity-healthspan-guide",
    "cycling-recovering-from-overtraining-guide",
    "cycling-cortisol-stress-performance-guide",
    "cycling-compression-garments-recovery-guide",
    "cycling-cholesterol-lipid-management-guide",
    "cycling-post-race-recovery-protocol-guide",
    "cycling-deload-week-recovery-guide",
    "cycling-tart-cherry-juice-recovery-guide",
    "cycling-skin-care-sun-damage-guide",
    "cycling-dental-health-oral-care-guide",
    "cycling-heat-illness-prevention-guide",
    "cycling-raynauds-cold-extremities-guide",
    "cycling-autonomic-nervous-system-recovery-guide",
    "cycling-thyroid-function-performance-guide",
    "cycling-osteoarthritis-joint-health-guide",
    "cycling-hearing-protection-wind-noise-guide",
    "cycling-collarbone-fracture-recovery-guide",
    "cycling-chronic-fatigue-when-tiredness-persists-guide",
    "cycling-air-quality-pollution-exposure-guide",
    "cycling-tibialis-anterior-shin-pain-guide",
    "cycling-eye-health-uv-protection-guide",
    "cycling-sacroiliac-joint-pain-guide",
    "cycling-thoracic-spine-mobility-guide",
    "cycling-return-after-surgery-guide",
    "cycling-neck-strengthening-mobility-guide",
    "cycling-common-medications-training-effects-guide",
    "cycling-concussion-management-return-guide",
    "cycling-piriformis-sciatic-pain-guide",
    "cycling-sleep-apnoea-performance-guide",
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
    "strength-training-cyclists-minimum-effective-dose",
    "strength-training-cyclists-over-50",
    "strength-training-for-triathletes-bike-specific",
    "what-experts-say-about-strength-training-cyclists",
    "cycling-over-50-training",
    "cycling-strength-training-what-transfers-guide",
    "injury-prevention-cyclists-over-40",
    "cycling-hip-mobility-power-guide",
    "cycling-hamstring-care-prevention-guide",
    "cycling-foam-rolling-self-massage-guide",
    "cycling-ankle-mobility-calf-strength-guide",
    "cycling-upper-body-training-guide",
    "cycling-single-leg-strength-exercises-guide",
    "cycling-leg-strength-without-gym-guide",
    "cycling-weight-training-in-season-guide",
    "cycling-glute-activation-power-guide",
    "cycling-pre-ride-activation-routine-guide",
    "cycling-core-training-complete-guide",
    "cycling-strength-training-year-round-plan-guide",
    "cycling-shoulder-stability-upper-body-guide",
    "cycling-post-ride-stretching-routine-guide",
    "cycling-hip-pain-causes-fixes-guide",
    "cycling-shoulder-neck-stretches-desk-workers-guide",
    "cycling-yoga-for-cyclists-complete-guide",
    "cycling-resistance-band-training-guide",
    "cycling-blood-flow-restriction-training-guide",
    "cycling-isometric-strength-training-guide",
    "cycling-pilates-core-mobility-guide",
    "cycling-proprioception-balance-training-guide",
    "cycling-plyometric-training-power-guide",
    "cycling-grip-strength-forearm-guide",
    "cycling-eccentric-training-muscle-protection-guide",
    "cycling-anti-rotation-core-stability-guide",
    "cycling-functional-movement-screen-guide",
    "cycling-kettlebell-training-guide",
  ],
  "cycling-weight-loss": [
    "how-many-calories-cycling-burns-real-numbers",
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
    "energy-availability-red-s-cyclists-guide",
    "calories-burned-cycling-accurate-guide",
    "cycling-race-weight-finding-yours-guide",
    "fuelling-self-assessment-cycling-nutrition-guide",
    "cycling-body-composition-masters-guide",
    "cycling-weight-loss-without-losing-power-guide",
    "cycling-post-50-body-composition-guide",
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
    "30-minutes-cycling-daily-effects",
    "aero-for-amateur-cyclists-does-it-matter",
    "best-gravel-trails-ireland",
    "mtb-bike-fit-basics",
    "mtb-skills-beginners-guide",
    "mtb-tyre-pressure-guide",
    "nathan-haas-gravel-soul-professionalisation",
    "numb-hands-cycling-5-fixes-bike-fit",
    "unbound-gravel-2026-complete-guide",
    "wind-tunnel-aero-gains-gravel-cyclists",
    "what-to-wear-cycling-temperature-guide",
    "best-sportives-italy-cycling-guide",
    "best-sportives-france-cycling-guide",
    "best-sportives-belgium-cycling-guide",
    "best-sportives-spain-cycling-guide",
    "best-sportives-uk-cycling-guide",
    "gear-ratio-cycling-complete-guide",
    "cycling-tyre-pressure-guide",
    "wind-chill-cold-weather-cycling-guide",
    "first-gran-fondo-what-nobody-tells-you-guide",
    "cornering-technique-road-cycling-guide",
    "cycling-event-packing-list-complete-guide",
    "how-to-find-join-cycling-club-guide",
    "drafting-echelons-through-and-off-guide",
    "riding-with-your-partner-mixed-ability-guide",
    "criterium-racing-guide-amateur",
    "cycling-mechanical-skills-roadside-repair-guide",
    "cycling-night-riding-safety-guide",
    "cycling-aerodynamic-clothing-guide",
    "cycling-riding-in-wind-headwind-guide",
    "cycling-road-positioning-safety-guide",
    "cycling-drop-handlebars-positions-guide",
    "cycling-bike-insurance-guide",
    "cycling-route-planning-apps-guide",
    "cycling-group-ride-fitness-levels-guide",
    "cycling-track-cycling-for-road-riders-guide",
    "cycling-fitting-training-around-work-family-guide",
    "cycling-first-race-everything-you-need-to-know-guide",
    "cycling-tyre-width-pressure-guide",
    "cycling-etiquette-unwritten-rules-guide",
    "cycling-racing-in-the-rain-guide",
    "cycling-watching-grand-tours-fan-guide",
    "cycling-spring-classics-explained-guide",
    "cycling-buying-your-first-road-bike-guide",
    "cycling-handlebar-width-drop-reach-guide",
    "cycling-road-surface-reading-guide",
    "cycling-puncture-repair-roadside-guide",
    "cycling-bike-cleaning-after-ride-guide",
    "cycling-handlebar-tape-wrapping-guide",
    "cycling-endurance-bike-vs-race-bike-guide",
    "cycling-disc-brakes-maintenance-guide",
    "cycling-how-to-ride-in-a-pace-line-guide",
    "cycling-bike-camera-safety-guide",
    "cycling-chaingang-training-guide",
    "cycling-carbon-fibre-care-guide",
    "cycling-charity-sportive-preparation-guide",
    "cycling-descending-wet-conditions-guide",
    "cycling-tyre-selection-conditions-guide",
    "cycling-eye-protection-sunglasses-guide",
    "cycling-bib-shorts-buying-guide",
    "wiggle-new-forest-100-training-guide",
    "cycling-travel-insurance-overseas-riding-guide",
    "cycling-cyclocross-beginners-guide",
    "cycling-frame-material-guide",
    "cycling-second-hand-bike-buying-guide",
    "cycling-road-safety-traffic-riding-guide",
    "london-to-brighton-training-guide",
    "cycling-road-vibration-comfort-guide",
    "cycling-braking-technique-confidence-guide",
    "cycling-bike-security-theft-prevention-guide",
    "cycling-advanced-cornering-technique-guide",
  ],
  "triathlon-cycling": [
    "triathlon-cycling-training-plan",
    "triathlon-ftp-pacing-strategy",
    "triathlon-bike-nutrition-strategy",
    "triathlon-cycling-power-to-weight",
    "triathlon-aero-position-guide",
    "triathlon-off-season-cycling",
    "ftp-training-zones-cycling-complete-guide",
    "zone-2-cycling-heart-rate-vs-power-vs-rpe",
    "cycling-nutrition-race-day-guide",
    "polarised-training-cycling-complete-guide",
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
    "olav-bu-triathlon-training-plan-design",
    "what-wattage-should-you-ride-in-an-ironman",
  ],
  "cycling-coaching": [
    "training-load-ctl-atl-tsb-explained-cyclists",
    "alex-welburn-critical-power-w-prime-training-metrics",
    "alistair-brownlee-endurance-lessons",
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
    "how-to-get-faster-cycling",
    "cycling-base-training-guide",
    "zone-2-cycling-heart-rate-vs-power-vs-rpe",
    "polarised-training-cycling-complete-guide",
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
    "best-cycling-coach-ireland",
    "best-cycling-coach-uk",
    "best-cycling-coach-usa",
    "zwift-vs-trainerroad",
    "power-meter-vs-smart-trainer",
    "best-cycling-coach-masters-riders",
    "biggest-training-mistakes-from-coaches",
    "brian-smith-suffering-coaching-roadman-podcast",
    "cycling-age-grading-performance-decline-guide",
    "cycling-coach-vs-triathlon-coach",
    "cycling-coaching-free-trial",
    "cycling-coaching-results-before-and-after",
    "cycling-coaching-testimonials",
    "cycling-comeback-after-break-complete-guide",
    "cycling-training-six-hours-roglic-coach",
    "dan-lorang-amateur-training-plan",
    "every-roadman-episode-with-dan-lorang",
    "every-roadman-episode-with-stephen-seiler",
    "fast-talk-vs-cycling-podcast-vs-roadman",
    "five-mistakes-self-coached-cyclists-make",
    "how-to-structure-cycling-training-plan",
    "how-to-watch-tour-de-france-like-a-coach",
    "is-a-cycling-coach-worth-it-case-study",
    "john-archibald-ride-faster-than-98-percent",
    "john-wakefield-team-bora-endurance-blueprint",
    "john-wakefield-team-bora-endurance-training",
    "low-cadence-training-cycling-torque-intervals",
    "mads-pedersen-training-what-amateurs-can-learn",
    "not-done-yet-coaching-review",
    "polarised-training-cycling-world-tour-prescription",
    "polarised-training-cycling-complete-guide",
    "masters-cycling-training-plan-over-40",
    "cycling-over-40-complete-guide",
    "vasilis-anastopoulos-cavendish-sprint-training",
    "what-25-top-coaches-agree-on-about-ftp",
    "what-experts-say-about-masters-cycling",
    "what-experts-say-about-zone-2-training",
    "cape-town-cycle-tour-training-guide",
    "la-marmotte-training-guide",
    "sella-ronda-bike-day-training-guide",
    "tour-of-flanders-sportive-training-guide",
    "nove-colli-training-guide",
    "quebrantahuesos-training-guide",
    "granfondo-stelvio-training-guide",
    "marmotte-pyrenees-training-guide",
    "liege-bastogne-liege-challenge-training-guide",
    "training-load-management-cyclists-guide",
    "cadence-training-cycling-complete-guide",
    "power-to-speed-cycling-relationship-guide",
    "running-cycling-crossover-training-guide",
    "training-stress-score-tss-cycling-guide",
    "vo2max-cycling-what-your-number-means-guide",
    "time-crunched-cyclist-training-framework-guide",
    "how-to-read-cycling-power-file-guide",
    "cycling-training-pyramid-priorities-guide",
    "cycling-heat-performance-adaptation-guide",
    "bike-position-aerodynamics-free-speed-guide",
    "cycling-heart-rate-monitor-complete-guide",
    "cycling-with-chronic-conditions-evidence-guide",
    "post-ride-analysis-improve-cycling-guide",
    "power-duration-curve-find-your-limiters",
    "cycling-season-planning-guide",
    "training-while-travelling-cyclists-guide",
    "drafting-echelons-through-and-off-guide",
    "solo-riding-safety-training-guide",
    "how-to-find-join-cycling-club-guide",
    "riding-with-your-partner-mixed-ability-guide",
    "criterium-racing-guide-amateur",
    "mid-season-fitness-reset-cycling-guide",
    "cycling-pedal-stroke-efficiency-guide",
    "cycling-race-day-nerves-mental-guide",
    "cycling-self-coaching-framework-guide",
    "cycling-mental-fatigue-brain-endurance-guide",
    "cycling-lactate-what-it-actually-does-guide",
    "cycling-training-consistency-beats-intensity-guide",
    "cycling-data-overload-what-to-track-guide",
    "cycling-head-unit-data-screens-setup-guide",
    "cycling-warm-up-cool-down-guide",
    "cycling-time-trial-beginners-guide",
    "cycling-watt-floor-raising-guide",
    "cycling-sprint-training-amateur-guide",
    "cycling-climbing-seated-vs-standing-guide",
    "cycling-breakaway-racing-tactics-guide",
    "cycling-pedalling-efficiency-drills-guide",
    "cycling-training-log-how-to-guide",
    "cycling-progressive-overload-guide",
    "cycling-one-hour-training-sessions-guide",
    "cycling-descending-confidence-speed-guide",
    "cycling-bunch-riding-skills-guide",
    "cycling-training-plateaus-how-to-break-through-guide",
    "cycling-mental-strength-racing-guide",
    "cycling-track-cycling-for-road-riders-guide",
    "cycling-how-to-read-a-race-guide",
    "cycling-heat-acclimation-protocol-guide",
    "cycling-bike-fit-iterative-process-guide",
    "cycling-fitting-training-around-work-family-guide",
    "cycling-training-with-heart-rate-only-guide",
    "cycling-comeback-after-time-off-guide",
    "cycling-polarised-vs-pyramidal-training-guide",
    "cycling-working-with-a-coach-guide",
    "cycling-negative-splitting-guide",
    "cycling-what-pros-do-differently-guide",
    "zone-2-cycling-heart-rate-vs-power-vs-rpe",
    "cycling-blood-lactate-testing-guide",
    "cycling-why-training-alone-doesnt-work-guide",
    "cycling-training-diary-what-to-record-guide",
    "cycling-intervals-icu-free-training-guide",
    "cycling-training-by-feel-without-data-guide",
    "cycling-how-to-ride-in-a-pace-line-guide",
    "cycling-training-camps-what-to-expect-guide",
    "girodolomiti-training-guide",
    "sportive-cingles-mont-ventoux-training-guide",
    "haute-route-pyrenees-training-guide",
    "transalp-training-guide",
    "tour-of-cambridgeshire-training-guide",
    "cycling-structured-vs-unstructured-training-guide",
    "cycling-energy-systems-explained-guide",
    "cycling-riding-in-wind-headwinds-guide",
    "cycling-data-analysis-basics-guide",
    "cycling-time-crunched-training-guide",
    "cycling-race-day-nerves-anxiety-guide",
    "cycling-zone-5-vo2max-intervals-guide",
    "medio-fondo-delle-dolomiti-training-guide",
    "sportful-dolomiti-race-training-guide",
    "cyclotour-du-leman-training-guide",
    "dartmoor-classic-training-guide",
    "wiggle-new-forest-100-training-guide",
    "cycling-e-bikes-for-training-guide",
    "cycling-exercise-induced-asthma-management-guide",
    "cycling-rider-phenotype-strengths-guide",
    "granfondo-strade-bianche-training-guide",
    "etape-du-dales-training-guide",
    "london-to-brighton-training-guide",
    "bealach-mor-training-guide",
    "tour-des-stations-training-guide",
    "cycling-pacing-by-feel-rpe-guide",
    "cycling-fatigue-resistance-training-guide",
    "cycling-critical-power-w-prime-guide",
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
    "ryan-collins-six-hour-record-46kmh",
    "cycling-time-trial-tips",
    "tour-de-france-time-trial-lessons-amateurs",
    "uli-schoberer-first-power-meter-cycling-history",
    "cycling-time-trial-beginners-guide",
    "cycling-aerodynamic-clothing-guide",
    "cycling-time-trial-pacing-strategy-guide",
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
    "cycling-age-grading-performance-decline-guide",
    "training-load-management-cyclists-guide",
    "masters-cycling-recovery-after-40-guide",
    "recovery-readiness-self-assessment-cycling-guide",
    "vo2max-cycling-what-your-number-means-guide",
    "cycling-over-50-training",
    "cycling-strength-training-what-transfers-guide",
    "zone-2-cycling-heart-rate-vs-power-vs-rpe",
    "protein-for-cyclists-complete-guide",
    "sleep-cycling-performance-complete-guide",
    "cycling-with-chronic-conditions-evidence-guide",
    "injury-prevention-cyclists-over-40",
    "comeback-after-cycling-crash-guide",
    "cycling-after-illness-rebuild-guide",
    "training-while-travelling-cyclists-guide",
    "masters-cycling-hormones-performance-guide",
    "recognising-overtraining-cyclists-guide",
    "cycling-tendon-health-injury-prevention-guide",
    "blood-testing-cyclists-what-to-check-guide",
    "cycling-training-with-kids-guide",
    "cycling-rest-day-what-to-do-guide",
    "cycling-watt-floor-raising-guide",
    "cycling-over-60-training-guide",
    "cycling-body-composition-masters-guide",
    "cycling-fitting-training-around-work-family-guide",
    "cycling-atrial-fibrillation-exercise-guide",
    "cycling-statin-use-performance-guide",
    "cycling-age-graded-performance-guide",
    "cycling-testosterone-and-training-over-40-guide",
    "cycling-weight-loss-without-losing-power-guide",
    "cycling-iron-deficiency-performance-guide",
    "cycling-time-crunched-training-guide",
    "cycling-heart-rate-variability-guide",
    "cycling-prostate-health-male-cyclists-guide",
    "cycling-blood-pressure-cardiovascular-health-guide",
    "cycling-diabetes-blood-sugar-management-guide",
    "cycling-cholesterol-lipid-management-guide",
    "cycling-rider-phenotype-strengths-guide",
    "cycling-morning-vs-evening-training-guide",
    "cycling-thyroid-function-performance-guide",
    "cycling-osteoarthritis-joint-health-guide",
    "cycling-post-50-body-composition-guide",
  ],
  "polarised-training": [
    "polarised-training-cycling-complete-guide",
    "polarised-training-cycling-world-tour-prescription",
    "polarised-vs-sweet-spot-training",
    "80-20-cycling-training-the-grey-zone-trap",
    "what-cycling-podcasts-got-wrong-about-polarised-training",
    "what-stephen-seiler-says-about-polarised-training",
    "stephen-seiler-research-polarised-training-lessons",
    "stephen-seiler-80-20-polarised-training-cyclists",
    "sweet-spot-vs-threshold-vs-polarised-comparison",
    "zone-2-cycling-heart-rate-vs-power-vs-rpe",
    "zone-2-vs-endurance-training",
    "why-pros-train-so-easy-mixed-metabolism-zone",
    "what-experts-say-about-zone-2-training",
    "christian-schrot-why-pros-train-easy",
    "prof-seiler-low-heart-rate-cycling",
    "vasilis-anastopoulos-zone-1-base-training",
    "time-crunched-cyclist-training-framework-guide",
    "cycling-polarised-vs-pyramidal-training-guide",
  ],
  "vo2max-training": [
    "cycling-vo2max-intervals",
    "vo2max-cycling-fixable-reasons-low",
    "vo2max-decline-reversibility-masters-cyclists",
    "vo2-max-workouts-cyclists-over-40",
    "cycling-hill-repeats-training",
    "low-cadence-training-cycling-torque-intervals",
    "sprint-interval-training-cyclists-masters",
    "steady-state-vs-interval-training-cycling",
    "cycling-age-grading-performance-decline-guide",
    "vo2max-cycling-what-your-number-means-guide",
    "cycling-over-50-training",
    "cycling-interval-session-library-guide",
    "cycling-masters-racing-getting-started-guide",
    "cycling-zone-5-vo2max-intervals-guide",
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
    "heat-training-cyclists-30-watts-ftp-protocol",
    "indoor-cycling-heat-management-trainingpeaks-virtual",
    "power-meter-vs-smart-trainer",
    "trainingpeaks-virtual-structured-indoor-training",
    "zwift-racing-tactics-guide",
    "cycling-turbo-trainer-sessions-guide",
    "cycling-zwift-vs-outdoor-training-guide",
    "cycling-indoor-vs-outdoor-training-guide",
    "cycling-turbo-trainer-setup-optimisation-guide",
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
    "bike-position-aerodynamics-free-speed-guide",
    "injury-prevention-cyclists-over-40",
    "cycling-pedal-stroke-efficiency-guide",
    "cycling-saddle-comfort-complete-guide",
    "cycling-knee-tracking-cleat-setup-guide",
    "cycling-when-to-get-bike-fit-guide",
    "cycling-descending-confidence-speed-guide",
    "cycling-bike-fit-iterative-process-guide",
    "cycling-neck-pain-prevention-guide",
    "cycling-hip-flexor-pain-psoas-guide",
    "cycling-saddle-pain-numbness-solutions-guide",
    "cycling-handlebar-width-drop-reach-guide",
    "cycling-endurance-bike-vs-race-bike-guide",
    "cycling-foot-pain-hot-foot-guide",
    "cycling-wrist-hand-numbness-guide",
    "cycling-pelvic-tilt-saddle-position-guide",
    "cycling-shoulder-pain-prevention-guide",
    "cycling-leg-length-discrepancy-bike-fit-guide",
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
    "cycling-tyre-pressure-guide",
    "tour-of-the-battenkill-training-guide",
    "cycling-road-vs-gravel-training-differences-guide",
    "cycling-gravel-training-for-road-cyclists-guide",
    "eroica-britannia-training-guide",
    "gravel-worlds-training-guide",
    "cycling-bike-packing-introduction-guide",
    "granfondo-strade-bianche-training-guide",
  ],
  "climbing": [
    "climb-faster-cycling-five-fixable-reasons",
    "vam-climbing-speed-explained-cyclists",
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
    "la-marmotte-training-guide",
    "sella-ronda-bike-day-training-guide",
    "cycling-climbing-time-estimate-guide",
    "nove-colli-training-guide",
    "quebrantahuesos-training-guide",
    "granfondo-stelvio-training-guide",
    "marmotte-pyrenees-training-guide",
    "climb-time-prediction-strategy-cycling-guide",
    "cycling-race-weight-finding-yours-guide",
    "la-pina-cycling-marathon-training-guide",
    "charly-gaul-training-guide",
    "fondo-giro-ditalia-training-guide",
    "cornering-technique-road-cycling-guide",
    "cycling-climbing-seated-vs-standing-guide",
    "gran-fondo-il-lombardia-training-guide",
    "haute-route-dolomites-training-guide",
    "granfondo-prosecco-training-guide",
    "tour-de-suisse-granfondo-training-guide",
    "gran-fondo-gavia-mortirolo-training-guide",
    "medio-fondo-delle-dolomiti-training-guide",
    "sportful-dolomiti-race-training-guide",
    "cycling-how-to-climb-faster-guide",
    "cycling-mountain-passes-strategy-guide",
    "cycling-hill-climb-racing-guide",
    "etape-du-dales-training-guide",
    "bealach-mor-training-guide",
    "tour-des-stations-training-guide",
  ],
  "cycling-psychology": [
    "cycling-mental-toughness",
    "mental-preparation-cycling-race",
    "mental-tools-long-climbs-time-trials",
    "michael-gervais-mind-awareness-training-cyclists",
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
    "comeback-after-cycling-crash-guide",
    "solo-riding-safety-training-guide",
    "cycling-race-day-nerves-mental-guide",
    "cycling-mental-fatigue-brain-endurance-guide",
    "cycling-motivation-consistency-guide",
    "cycling-mental-strength-racing-guide",
    "cycling-dealing-with-setbacks-guide",
    "cycling-race-day-nerves-anxiety-guide",
    "cycling-motivation-through-dark-months-guide",
    "cycling-anxiety-depression-mental-health-guide",
    "cycling-dopamine-motivation-reward-guide",
  ],
  "heat-training": [
    "heat-training-cyclists-30-watts-ftp-protocol",
    "cycling-heat-acclimation-protocol-guide",
    "cycling-heat-performance-adaptation-guide",
    "cycling-heat-illness-prevention-guide",
    "heat-tolerance-ageing-cyclist",
    "indoor-cycling-heat-management-trainingpeaks-virtual",
    "cycling-travel-racing-abroad-guide",
    "cycling-electrolytes-sweat-rate-testing-guide",
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
    "cycling-women-specific-training-guide",
    "cycling-menopause-training-guide",
  ],
  "race-preparation": [
    "cycling-sportive-preparation",
    "cycling-taper-guide-peak-race-day",
    "cycling-taper-race-preparation-system",
    "cycling-taper-discipline-15-percent-gain",
    "cycling-taper-pmc-performance-management-chart",
    "cycling-tapering-guide",
    "race-day-checklist-cyclists",
    "race-day-checklist-cycling-complete-guide",
    "race-day-fuelling-24-hour-timeline",
    "race-day-nutrition-plan-cyclists",
    "pre-race-warmup-protocol-cyclists",
    "pacing-strategy-cycling-sportive",
    "paris-roubaix-power-durability-ben-oliver",
    "peaking-for-a-sportive-12-week-framework",
    "cycling-nutrition-race-day-guide",
    "cycling-nutrition-plan-100-mile-sportive",
    "cycling-carb-loading-protocol-race-week",
    "sportive-training-readiness-index-2026",
    "how-to-train-for-a-sportive-12-weeks",
    "travel-fatigue-cycling-pre-event-protocol",
    "how-to-watch-tour-de-france-like-a-coach",
    "tour-training-methods-amateurs-can-use",
    "what-amateurs-can-learn-from-tour-de-france-preparation",
    "cycling-race-tactics-guide",
    "first-gran-fondo-what-nobody-tells-you-guide",
    "cycling-event-packing-list-complete-guide",
    "cycling-travel-racing-abroad-guide",
    "cycling-season-planning-guide",
    "drafting-echelons-through-and-off-guide",
    "criterium-racing-guide-amateur",
    "cycling-race-day-nerves-mental-guide",
    "cycling-long-ride-pacing-fuelling-guide",
    "cycling-training-camp-preparation-guide",
    "how-to-pace-your-first-century-guide",
    "cycling-warm-up-cool-down-guide",
    "cycling-time-trial-beginners-guide",
    "tour-de-mont-blanc-cyclosportive-training-guide",
    "granfondo-felice-gimondi-training-guide",
    "medio-fondo-fausto-coppi-training-guide",
    "paris-roubaix-challenge-training-guide",
    "cyclosportive-de-lardechoise-training-guide",
    "la-purito-andorra-training-guide",
    "cycling-breakaway-racing-tactics-guide",
    "cycling-race-nutrition-plan-guide",
    "cycling-recovery-between-races-guide",
    "cycling-training-stress-balance-tsb-guide",
    "cycling-race-report-how-to-write-guide",
    "cycling-tapering-for-events-guide",
    "cycling-multi-day-event-preparation-guide",
    "cycling-racing-with-power-meter-guide",
    "cycling-how-to-read-a-race-guide",
    "velothon-wales-training-guide",
    "eroica-britannia-training-guide",
    "rad-am-ring-training-guide",
    "gran-fondo-il-lombardia-training-guide",
    "haute-route-dolomites-training-guide",
    "cycling-first-race-everything-you-need-to-know-guide",
    "granfondo-prosecco-training-guide",
    "tour-de-suisse-granfondo-training-guide",
    "3-peaks-cyclocross-training-guide",
    "gravel-worlds-training-guide",
    "gran-fondo-gavia-mortirolo-training-guide",
    "cycling-race-strategy-for-cat-4-riders-guide",
    "cycling-second-year-racer-guide",
    "cycling-night-before-sportive-guide",
    "cycling-flying-with-your-bike-guide",
    "cycling-race-fuelling-mistakes-guide",
    "cycling-chaingang-training-guide",
    "cycling-gran-fondo-pacing-strategy-guide",
    "cycling-race-day-nerves-anxiety-guide",
    "medio-fondo-delle-dolomiti-training-guide",
    "sportful-dolomiti-race-training-guide",
    "cyclotour-du-leman-training-guide",
    "dartmoor-classic-training-guide",
    "wiggle-new-forest-100-training-guide",
    "cycling-post-race-recovery-protocol-guide",
    "cycling-race-category-progression-guide",
    "granfondo-strade-bianche-training-guide",
    "etape-du-dales-training-guide",
    "london-to-brighton-training-guide",
    "bealach-mor-training-guide",
    "tour-des-stations-training-guide",
    "gran-fondo-des-cantons-de-lest-training-guide",
    "l-ariegeoise-training-guide",
    "peak-district-100-training-guide",
    "rbc-granfondo-whistler-training-guide",
    "ocean-to-ocean-gran-fondo-training-guide",
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
    "off-season-training-cycling-what-to-do-guide",
    "cycling-training-plan-build-friel-lorang-johnson",
    "cycling-season-planning-guide",
    "mid-season-fitness-reset-cycling-guide",
    "cycling-season-planning-masters-guide",
    "cycling-early-season-form-building-guide",
    "cycling-progressive-overload-guide",
    "cycling-winter-base-training-guide",
    "cycling-periodisation-annual-plan-guide",
    "cycling-strength-training-year-round-plan-guide",
    "cycling-off-season-what-to-do-guide",
    "cycling-autumn-training-transition-guide",
  ],
  "sweet-spot-training": [
    "sweet-spot-training-cycling-guide",
    "sweet-spot-vs-threshold-vs-polarised-comparison",
    "polarised-vs-sweet-spot-training",
    "how-to-improve-ftp-cycling",
    "improve-ftp-cycling-evidence-based-methods",
    "time-crunched-cyclist-8-hours-week",
    "time-crunched-cyclist-training-framework-guide",
  ],
  "sprint-training": [
    "30-day-sprint-power-cycling-plan",
    "sam-bennett-what-sprinters-do-differently",
    "andre-greipel-sprint-captains-code",
    "cory-williams-sprint-power-vs-winning-power",
    "sprint-interval-training-cyclists-masters",
    "vasilis-anastopoulos-cavendish-sprint-training",
    "cycling-race-tactics-guide",
    "criterium-racing-guide-amateur",
    "cycling-sprint-training-amateur-guide",
    "cycling-micro-intervals-sprint-sessions-guide",
  ],
  "sleep-performance": [
    "cycling-sleep-performance-guide",
    "cycling-sleep-optimisation",
    "sleep-and-the-masters-cyclist",
    "sleep-debt-hrv-cycling-adaptation",
    "cycling-hrv-training-guide",
    "cycling-recovery-tips",
    "masters-recovery-audit-seven-things-to-check",
    "cycling-sleep-optimisation-performance-guide",
    "sleep-cycling-performance-complete-guide",
  ],
  "cycling-cadence": [
    "cycling-cadence-optimal-guide",
    "cycling-cadence-by-age-masters",
    "best-cadence-for-climbing",
    "low-cadence-training-cycling-torque-intervals",
    "john-wakefield-team-bora-endurance-training",
    "cadence-training-cycling-complete-guide",
    "cycling-pedal-stroke-efficiency-guide",
    "cycling-cadence-drills-finding-optimal-guide",
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
    "ryan-collins-six-hour-record-46kmh",
    "cycling-audax-randonneuring-guide",
    "tour-des-stations-training-guide",
  ],
  "cycling-breathing": [
    "breathing-for-cyclists-respiratory-training-guide",
    "breathing-techniques-cycling-performance",
    "cycling-breathing-techniques",
    "andrew-sellars-breathing-co2-cycling",
    "tj-eisenhart-breathwork-meditation-cycling",
    "team-visma-breathing-sensor-ventilation-training",
    "cycling-breathing-technique-performance-guide",
    "cycling-respiratory-health-breathing-guide",
    "cycling-nasal-breathing-performance-guide",
    "cycling-respiratory-muscle-training-guide",
  ],
  "power-meter-training": [
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
    "training-stress-score-tss-cycling-guide",
    "how-to-read-cycling-power-file-guide",
    "cycling-heart-rate-monitor-complete-guide",
    "post-ride-analysis-improve-cycling-guide",
    "power-duration-curve-find-your-limiters",
    "cycling-data-overload-what-to-track-guide",
    "cycling-racing-with-power-meter-guide",
    "cycling-data-analysis-basics-guide",
    "cycling-rider-phenotype-strengths-guide",
    "cycling-power-meter-accuracy-troubleshooting-guide",
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
    "running-cycling-crossover-training-guide",
    "cycling-for-injured-runners",
    "cycling-better-for-knees-than-running",
    "cycling-replace-long-run-marathon",
    "ftp-for-runners-cycling-power-explained",
    "running-cycling-conversion-calculator",
    "parkrun-cycling-cross-training",
  ],
  "cycling-for-runners": [
    "switching-from-running-to-cycling-guide",
    "cycling-for-injured-runners",
    "cycling-better-for-knees-than-running",
    "cycling-replace-long-run-marathon",
    "ftp-for-runners-cycling-power-explained",
    "running-cycling-conversion-calculator",
    "fuelling-running-vs-cycling-differences",
    "supplements-endurance-cyclist-runner",
    "running-vs-cycling-fitness-transfer",
    "zone-2-running-vs-cycling-heart-rate",
    "best-bikes-for-runners-buying-guide",
    "bike-fit-guide-runners",
    "cycling-group-rides-guide-runners",
    "indoor-cycling-cross-training-runners",
    "cycling-for-marathon-training",
    "recovery-rides-for-runners",
    "how-cycling-improves-running-performance",
    "duathlon-training-guide-beginners",
    "cycling-vs-running-weight-loss",
    "cycling-cadence-guide-runners",
    "cycling-commuting-runners",
    "bone-density-cycling-running-deep-dive",
    "plantar-fasciitis-cycling-alternative",
    "shin-splints-cycling-cross-training",
    "achilles-tendinopathy-cycling-guide",
    "running-cycling-crossover-training-guide",
  ],
  "cycling-tech": [
    "cycling-gearing-explained-chainrings-cassettes",
    "gps-watches-cycling-running-guide",
    "wahoo-vs-garmin-cycling-computers",
    "best-cycling-computers-2026",
    "power-meter-buying-guide-cyclists",
    "power-meter-training-cyclists-how-to-use",
    "power-meter-training-plan-week-by-week",
    "power-meter-vs-smart-trainer",
    "uli-schoberer-first-power-meter-cycling-history",
    "reading-your-training-data-tss-ctl-atl-tsb",
    "cycling-metrics-explained",
    "aero-for-amateur-cyclists-does-it-matter",
    "what-to-wear-cycling-temperature-guide",
    "cycling-tyre-pressure-guide",
    "wind-chill-cold-weather-cycling-guide",
    "power-to-speed-cycling-relationship-guide",
    "post-ride-analysis-improve-cycling-guide",
    "cycling-bike-maintenance-schedule-guide",
    "cycling-wheel-upgrade-guide",
    "cycling-strava-segments-training-guide",
    "cycling-head-unit-data-screens-setup-guide",
    "cycling-aerodynamic-clothing-guide",
    "cycling-aero-position-road-bike-guide",
    "cycling-gearing-choices-explained-guide",
    "cycling-marginal-gains-that-actually-matter-guide",
    "cycling-drivetrain-efficiency-maintenance-guide",
    "cycling-n-plus-one-buying-another-bike-guide",
    "cycling-chain-waxing-complete-guide",
    "cycling-buying-your-first-road-bike-guide",
    "cycling-intervals-icu-free-training-guide",
    "cycling-bike-cleaning-after-ride-guide",
    "cycling-handlebar-tape-wrapping-guide",
    "cycling-disc-brakes-maintenance-guide",
    "cycling-endurance-bike-vs-race-bike-guide",
    "cycling-road-bike-maintenance-schedule-guide",
    "cycling-helmet-buying-guide-2026",
    "cycling-aero-testing-without-wind-tunnel-guide",
    "cycling-groupset-electronic-vs-mechanical-guide",
  ],
  "cycling-plateaus": [
    "why-your-ftp-is-stuck-five-causes",
    "cycling-training-plateaus-how-to-break-through-guide",
    "cycling-overtraining-signs-guide",
    "overtraining-vs-overreaching-cyclists",
    "recognising-overtraining-cyclists-guide",
    "cycling-recovering-from-overtraining-guide",
    "more-volume-getting-slower-cycling-overtraining",
    "cycling-chronic-fatigue-when-tiredness-persists-guide",
    "biggest-training-mistakes-from-coaches",
    "common-training-mistakes-from-1400-podcast-episodes",
    "five-mistakes-self-coached-cyclists-make",
    "self-coached-cyclist-mistakes",
    "cycling-self-coaching-framework-guide",
    "cycling-dealing-with-setbacks-guide",
    "cycling-injury-comeback-rehab-guide",
    "comeback-cyclist-12-week-return-plan",
    "cycling-comeback-after-break-complete-guide",
    "cycling-comeback-after-time-off-guide",
    "cycling-returning-after-illness-guide",
    "cycling-after-illness-rebuild-guide",
    "cycling-motivation-consistency-guide",
    "cycling-motivation-through-dark-months-guide",
    "cycling-training-consistency-beats-intensity-guide",
    "cycling-why-training-alone-doesnt-work-guide",
    "personalised-cycling-training-plan-why-generic-plans-fail",
    "cycling-progressive-overload-guide",
    "detraining-after-40",
    "cycling-deload-week-recovery-guide",
    "mid-season-fitness-reset-cycling-guide",
    "cycling-recovery-week-what-to-actually-do",
    "recovery-readiness-self-assessment-cycling-guide",
    "cycling-cortisol-stress-performance-guide",
    "power-duration-curve-find-your-limiters",
    "cycling-building-ftp-systematic-guide",
    "cycling-rider-phenotype-strengths-guide",
    "what-25-top-coaches-agree-on-about-ftp",
    "training-load-management-cyclists-40s-50s",
    "cycling-ctl-atl-tsb-explained-guide",
    "cycling-structured-vs-unstructured-training-guide",
    "cycling-iron-deficiency-performance-guide",
    "sleep-debt-hrv-cycling-adaptation",
    "cycling-mental-fatigue-brain-endurance-guide",
    "cycling-fatigue-resistance-training-guide",
    "how-to-improve-ftp-cycling",
    "improve-ftp-cycling-evidence-based-methods",
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
  sources?: TopicSource[];
}> = {
  "masters-cycling": {
    tools: [
      { slug: "ftp-zones", title: "FTP Zone Calculator", href: "/tools/ftp-zones" },
      { slug: "age-grade", title: "Cycling Age Grade Calculator", href: "/tools/age-grade" },
      { slug: "recovery-screen", title: "Recovery Readiness Screen", href: "/tools/recovery-screen" },
      { slug: "training-readiness", title: "Training Readiness Check", href: "/tools/training-readiness" },
      { slug: "body-composition", title: "Cycling Body Composition Calculator", href: "/tools/body-composition" },
    ],
    commercialPath: "/coaching",
    relatedTopics: ["cycling-recovery", "cycling-strength-conditioning", "cycling-training-plans"],
    featuredPostSlugs: [
      "cycling-over-40-complete-guide",
      "masters-cycling-training-plan-over-40",
      "cycling-after-40-faster-science",
    ],
    claimsHeading: "THE MASTERS TRAINING POSITION",
    claimsCaption:
      "What the current research can support—and what this guide library will not infer from age alone.",
    citedClaims: [
      {
        claim: "Ageing changes the context, not one fixed decline rate",
        roadmanPosition:
          "Aerobic capacity can decline with age, but published masters-athlete trajectories vary widely and a cohort average cannot forecast one rider.",
        evidenceSource:
          "An eight-year study followed 15 male masters athletes and 14 sedentary men; a 2022 review reported longitudinal masters-athlete estimates from 5% to 46% per decade.",
        practicalImplication:
          "Use repeatable field tests and the rider's own training history rather than subtracting a fixed percentage from future performance.",
        evidenceLevel: "moderate",
      },
      {
        claim: "No universal hard-session spacing is established",
        roadmanPosition:
          "Extra space may be useful, but age alone does not prescribe 48–72 hours or a fixed number of demanding sessions.",
        evidenceSource:
          "A review of ageing and recovery found plausible mechanisms alongside limited athlete-specific evidence, activity confounding and few normal-training studies.",
        practicalImplication:
          "Repeat or postpone quality from execution, unusual symptoms, soreness, sleep, mood and life stress compared with the rider's baseline.",
        evidenceLevel: "emerging",
      },
      {
        claim: "Strength can help without proving one over-40 programme",
        roadmanPosition:
          "Progressive strength can improve some adult-cyclist outcomes, but the dose must account for competence, injury and medical context, equipment and total load.",
        evidenceSource:
          "A 2025 meta-analysis of 17 studies and 262 adult cyclists found benefits for some outcomes, no VO2max effect and low-certainty evidence; it did not establish an over-40 subgroup programme.",
        practicalImplication:
          "Start with a tolerable exposure and change the bike week if strength quality or recovery deteriorates.",
        evidenceLevel: "moderate",
      },
    ],
    sources: [
      {
        title: "Rogers et al. — eight-year VO2max change in masters athletes (PMID 2361923)",
        href: "https://pubmed.ncbi.nlm.nih.gov/2361923/",
      },
      {
        title: "Longitudinal masters-athlete aerobic-capacity review (PMID 36078762)",
        href: "https://pubmed.ncbi.nlm.nih.gov/36078762/",
      },
      {
        title: "Recovery and performance in masters athletes review (PMID 18268815)",
        href: "https://pubmed.ncbi.nlm.nih.gov/18268815/",
      },
      {
        title: "Training-intensity distribution network meta-analysis (PMID 39888556)",
        href: "https://pubmed.ncbi.nlm.nih.gov/39888556/",
      },
      {
        title: "Heavy strength training in cyclists meta-analysis (PMID 40632222)",
        href: "https://pubmed.ncbi.nlm.nih.gov/40632222/",
      },
      {
        title: "Protein in masters athletes scoping review (PMID 39940356)",
        href: "https://pubmed.ncbi.nlm.nih.gov/39940356/",
      },
    ],
  },
  "ftp-training": {
    tools: [
      { slug: "ftp-zones", title: "FTP Zone Calculator", href: "/tools/ftp-zones" },
      { slug: "ftp-test", title: "FTP Test Calculator", href: "/tools/ftp-test" },
      { slug: "wkg", title: "W/kg Calculator", href: "/tools/wkg" },
      { slug: "tss", title: "TSS Calculator", href: "/tools/tss" },
      { slug: "hr-zones", title: "HR Zone Calculator", href: "/tools/hr-zones" },
      { slug: "sweet-spot", title: "Sweet Spot Calculator", href: "/tools/sweet-spot" },
      { slug: "interval-builder", title: "Interval Session Builder", href: "/tools/interval-builder" },
    ],
    commercialPath: "/coaching",
    relatedTopics: ["cycling-training-plans", "cycling-coaching"],
    featuredPostSlugs: [
      "ftp-training-zones-cycling-complete-guide",
      "how-to-improve-ftp-cycling",
      "why-your-ftp-is-stuck-five-causes",
    ],
    claimsCaption:
      "What FTP can and cannot support, with the limits made explicit.",
    citedClaims: [
      {
        claim: "FTP is a useful operational estimate, not an exact one-hour constant",
        roadmanPosition:
          "Use FTP to anchor power zones and compare like-for-like tests. Do not assume every rider can sustain the number for exactly 60 minutes or that it identifies a laboratory threshold without error.",
        evidenceSource:
          "Coggan's practical definition, the FTP field-test scoping review and research on time to exhaustion at FTP.",
        practicalImplication:
          "Track the test protocol and duration alongside the watt value, then judge the trend under comparable conditions.",
        evidenceLevel: "strong",
      },
      {
        claim: "A 20-minute test is an estimate with individual error",
        roadmanPosition:
          "Multiplying 20-minute power by 0.95 is common and can be repeatable, but it is not a universal conversion from 20-minute performance to FTP.",
        evidenceSource:
          "The 2021 FTP scoping review found reliability alongside wide limits of agreement against physiological threshold markers.",
        practicalImplication:
          "Repeat the same warm-up, equipment and protocol; do not compare a ramp result directly with a 20-minute result as if the methods were identical.",
        evidenceLevel: "moderate",
      },
      {
        claim: "FTP and critical power are related but not interchangeable",
        roadmanPosition:
          "Both summarise sustained power, but they come from different models and should retain separate names, values and testing methods.",
        evidenceSource:
          "A study of trained cyclists found strong correlation but agreement limits too wide to substitute one value for the other.",
        practicalImplication:
          "If software reports critical power, do not relabel it FTP or silently use it to reset FTP-based zones.",
        evidenceLevel: "moderate",
      },
      {
        claim: "Time to exhaustion adds information that FTP alone misses",
        roadmanPosition:
          "Two riders with the same FTP can sustain it for meaningfully different durations, so threshold durability deserves separate attention.",
        evidenceSource:
          "Research across recreational, trained, well-trained and professional cyclists reported substantial variation in time to exhaustion at FTP.",
        practicalImplication:
          "Review the power-duration curve, repeatability and event demands instead of treating one FTP value as a complete rider profile.",
        evidenceLevel: "moderate",
      },
    ],
    sources: [
      {
        title: "TrainingPeaks — What Is Threshold Power? (Andrew Coggan)",
        href: "https://www.trainingpeaks.com/learn/articles/what-is-threshold-power/",
      },
      {
        title: "TrainingPeaks Help — Calculating threshold values",
        href: "https://help.trainingpeaks.com/hc/en-us/articles/204071934-How-to-Calculate-Threshold-Values-for-Power-Heart-Rate-or-Pace",
      },
      {
        title: "British Cycling — Understanding intensity with power",
        href: "https://www.britishcycling.org.uk/knowledge/training/get-started/article/izn20140820-Training-Understanding-Intensity-3--Power-0",
      },
      {
        title: "Sports Medicine — FTP field-test scoping review (PMID 34304689)",
        href: "https://pubmed.ncbi.nlm.nih.gov/34304689/",
      },
      {
        title: "International Journal of Sports Physiology and Performance — FTP vs critical power (PMID 33551839)",
        href: "https://pubmed.ncbi.nlm.nih.gov/33551839/",
      },
      {
        title: "International Journal of Sports Physiology and Performance — Time to exhaustion at FTP (PMID 35835698)",
        href: "https://pubmed.ncbi.nlm.nih.gov/35835698/",
      },
      {
        title: "Sports Medicine — Cycling power-meter validity review (PMID 35009945)",
        href: "https://pubmed.ncbi.nlm.nih.gov/35009945/",
      },
    ],
  },
  "cycling-nutrition": {
    tools: [
      { slug: "fuelling", title: "Cycling Nutrition Calculator", href: "/tools/fuelling" },
      { slug: "calories", title: "Calories Burned Calculator", href: "/tools/calories" },
      { slug: "energy-availability", title: "Energy Availability Calculator", href: "/tools/energy-availability" },
      { slug: "race-weight", title: "Race Weight Calculator", href: "/tools/race-weight" },
      { slug: "hydration", title: "Hydration Calculator", href: "/tools/hydration" },
      { slug: "body-composition", title: "Body Composition Calculator", href: "/tools/body-composition" },
      { slug: "fuel-planner", title: "Cycling Fuel Planner", href: "/tools/fuel-planner" },
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
      { slug: "ftp-test", title: "FTP Test Calculator", href: "/tools/ftp-test" },
      { slug: "tss", title: "TSS Calculator", href: "/tools/tss" },
      { slug: "training-load", title: "Training Load Calculator (CTL/ATL/TSB)", href: "/tools/training-load" },
      { slug: "cadence", title: "Cadence Calculator", href: "/tools/cadence" },
      { slug: "climb-time", title: "Climbing Time Estimator", href: "/tools/climb-time" },
      { slug: "sweet-spot", title: "Sweet Spot Calculator", href: "/tools/sweet-spot" },
      { slug: "age-grade", title: "Cycling Age Grade Calculator", href: "/tools/age-grade" },
      { slug: "interval-builder", title: "Interval Session Builder", href: "/tools/interval-builder" },
      { slug: "race-predictor", title: "Race Time Predictor", href: "/tools/race-predictor" },
    ],
    commercialPath: "/training-plans",
    relatedTopics: ["ftp-training", "cycling-coaching"],
    featuredPostSlugs: [
      "polarised-training-cycling-complete-guide",
      "how-to-structure-cycling-training-plan",
      "zone-2-cycling-heart-rate-vs-power-vs-rpe",
    ],
    claimsHeading: "THE TRAINING-PLAN POSITION",
    claimsCaption:
      "What Roadman treats as settled, what still depends on the rider, and how each conclusion changes the week you should actually ride.",
    citedClaims: [
      {
        claim: "No periodisation model is a universal winner",
        roadmanPosition:
          "Traditional, block and day-by-day models can all be coherent. A plan should organise priorities around the rider and goal, then use the response to decide the next block.",
        evidenceSource:
          "A 2023 systematic review found only seven eligible studies in trained road cyclists and did not favour one model across eight-to-twelve-week interventions (PMID 36640771).",
        practicalImplication:
          "Work backwards from the goal, identify the current priority and review the rider's response before fixing the next block.",
        evidenceLevel: "strong",
      },
      {
        claim: "An intensity label is not a complete prescription",
        roadmanPosition:
          "Polarised, pyramidal and threshold distributions describe patterns, but their meaning changes with the zone system and whether sessions or minutes are counted. No fixed 80/20 split fits every rider.",
        evidenceSource:
          "A 2025 individual-participant network meta-analysis found no overall polarised-versus-pyramidal difference for VO2max or time-trial performance when intensity used heart-rate time in zone (PMID 39888556).",
        practicalImplication:
          "Define the zone system and counting method, then choose and review the distribution in the context of athlete level, phase and outcome.",
        evidenceLevel: "moderate",
      },
      {
        claim: "The rider brief comes before the calendar",
        roadmanPosition:
          "The goal, recent completed training, available time, event demands, recovery and feedback determine whether a schedule fits. More planned work is not automatically a better plan.",
        evidenceSource:
          "The periodisation evidence above does not establish one universal structure; Roadman's rider brief is an explicit coaching decision framework rather than a clinical rule.",
        practicalImplication:
          "Write the real constraints first, place priority work and recovery inside them, and state what evidence will trigger a change.",
        evidenceLevel: "moderate",
      },
    ],
  },
  "cycling-recovery": {
    tools: [
      { slug: "tss", title: "TSS Calculator", href: "/tools/tss" },
      { slug: "training-load", title: "Training Load Calculator (CTL/ATL/TSB)", href: "/tools/training-load" },
      { slug: "hydration", title: "Hydration Calculator", href: "/tools/hydration" },
      { slug: "training-readiness", title: "Training Readiness Check", href: "/tools/training-readiness" },
    ],
    commercialPath: "/coaching",
    relatedTopics: ["cycling-strength-conditioning", "cycling-training-plans", "masters-cycling"],
    featuredPostSlugs: [
      "cycling-recovery-tips",
      "cycling-sleep-performance-guide",
      "cycling-overtraining-signs-guide",
    ],
  },
  "cycling-strength-conditioning": {
    tools: [
      { slug: "body-composition", title: "Cycling Body Composition Calculator", href: "/tools/body-composition" },
      { slug: "strength-session-planner", title: "Cycling Strength Session Planner", href: "/tools/strength-session-planner" },
      { slug: "training-readiness", title: "Training Readiness Check", href: "/tools/training-readiness" },
    ],
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
      { slug: "calories", title: "Calories Burned Calculator", href: "/tools/calories" },
      { slug: "energy-availability", title: "Energy Availability Calculator", href: "/tools/energy-availability" },
      { slug: "body-composition", title: "Body Composition Calculator", href: "/tools/body-composition" },
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
      { slug: "ftp-test", title: "FTP Test Calculator", href: "/tools/ftp-test" },
      { slug: "hr-zones", title: "HR Zone Calculator", href: "/tools/hr-zones" },
      { slug: "tyre-pressure", title: "Tyre Pressure Calculator", href: "/tools/tyre-pressure" },
      { slug: "cadence", title: "Cadence Calculator", href: "/tools/cadence" },
      { slug: "wind-chill", title: "Wind Chill Calculator", href: "/tools/wind-chill" },
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
      { slug: "fuelling", title: "Cycling Nutrition Calculator", href: "/tools/fuelling" },
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
    tools: [
      { slug: "ftp-test", title: "FTP Test Calculator", href: "/tools/ftp-test" },
      { slug: "training-load", title: "Training Load Calculator (CTL/ATL/TSB)", href: "/tools/training-load" },
      { slug: "sweet-spot", title: "Sweet Spot Calculator", href: "/tools/sweet-spot" },
      { slug: "age-grade", title: "Cycling Age Grade Calculator", href: "/tools/age-grade" },
      { slug: "interval-builder", title: "Interval Session Builder", href: "/tools/interval-builder" },
      { slug: "body-composition", title: "Body Composition Calculator", href: "/tools/body-composition" },
    ],
    commercialPath: "/coaching",
    relatedTopics: ["ftp-training", "cycling-training-plans"],
    featuredPostSlugs: [
      "is-a-cycling-coach-worth-it",
      "cycling-coaching-results-before-and-after",
      "not-done-yet-coaching-review",
    ],
    claimsHeading: "THE COACHING POSITION",
    claimsCaption:
      "The tests Roadman uses to distinguish real coaching from plan delivery, grounded in expert interviews and documented athlete outcomes.",
    citedClaims: [
      {
        claim: "Coaching is an adjustment loop, not a document",
        roadmanPosition:
          "A coach earns the fee by reviewing completed work, interpreting fatigue and life context, and changing what comes next. A static plan is a different product.",
        evidenceSource:
          "Roadman interviews with Dan Lorang, John Wakefield and Joe Friel, plus the Roadman coaching workflow.",
        practicalImplication:
          "Before hiring, ask exactly how often your data is reviewed and what triggers a plan change.",
        evidenceLevel: "moderate",
      },
      {
        claim: "Coach fit matters more than proximity",
        roadmanPosition:
          "For most amateur cyclists, relevant athlete experience, communication and decision quality matter more than the coach living nearby.",
        evidenceSource:
          "Modern TrainingPeaks delivery practice and Roadman's online work with riders across Ireland, the UK and the USA.",
        practicalImplication:
          "Shortlist coaches by discipline, life constraints and communication standard before filtering by location.",
        evidenceLevel: "moderate",
      },
      {
        claim: "Beginners do not always need a coach",
        roadmanPosition:
          "A reliable training plan or app is often enough during the first easy-gain phase. Coaching becomes higher value when progress stalls or the athlete's context becomes complex.",
        evidenceSource:
          "Roadman athlete cases and coaching-selection guidance across the cycling-coaching archive.",
        practicalImplication:
          "Buy coaching for judgement, accountability and adaptation — not because basic workouts are unavailable elsewhere.",
        evidenceLevel: "moderate",
      },
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
      { slug: "vo2max", title: "VO2max Estimator", href: "/tools/vo2max" },
      { slug: "ftp-zones", title: "FTP Zone Calculator", href: "/tools/ftp-zones" },
      { slug: "ftp-test", title: "FTP Test Calculator", href: "/tools/ftp-test" },
      { slug: "age-grade", title: "Cycling Age Grade Calculator", href: "/tools/age-grade" },
      { slug: "interval-builder", title: "Interval Session Builder", href: "/tools/interval-builder" },
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
      { slug: "climb-time", title: "Climbing Time Estimator", href: "/tools/climb-time" },
      { slug: "vam", title: "Climbing Calculator (VAM)", href: "/tools/vam" },
      { slug: "wkg", title: "W/kg Calculator", href: "/tools/wkg" },
      { slug: "power-speed", title: "Power↔Speed Calculator", href: "/tools/power-speed" },
      { slug: "ftp-zones", title: "FTP Zone Calculator", href: "/tools/ftp-zones" },
      { slug: "wind-chill", title: "Wind Chill Calculator", href: "/tools/wind-chill" },
      { slug: "race-predictor", title: "Race Time Predictor", href: "/tools/race-predictor" },
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
      "heat-training-cyclists-30-watts-ftp-protocol",
      "cycling-heat-illness-prevention-guide",
      "heat-tolerance-ageing-cyclist",
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
      { slug: "fuelling", title: "Cycling Nutrition Calculator", href: "/tools/fuelling" },
      { slug: "ftp-zones", title: "FTP Zone Calculator", href: "/tools/ftp-zones" },
      { slug: "race-day-checklist", title: "Race Day Checklist", href: "/tools/race-day-checklist" },
      { slug: "fuel-planner", title: "Cycling Fuel Planner", href: "/tools/fuel-planner" },
      { slug: "race-predictor", title: "Race Time Predictor", href: "/tools/race-predictor" },
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
      "sweet-spot-training-cycling-guide",
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
      { slug: "fuelling", title: "Cycling Nutrition Calculator", href: "/tools/fuelling" },
      { slug: "fuel-planner", title: "Cycling Fuel Planner", href: "/tools/fuel-planner" },
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
      "power-meter-buying-guide-cyclists",
      "power-meter-training-cyclists-how-to-use",
      "uli-schoberer-first-power-meter-cycling-history",
    ],
  },
  "running-for-cyclists": {
    tools: [
      { slug: "hr-zones", title: "HR Zone Calculator", href: "/tools/hr-zones" },
      { slug: "fuelling", title: "Cycling Nutrition Calculator", href: "/tools/fuelling" },
    ],
    commercialPath: "/strength-training",
    relatedTopics: [
      "cycling-for-runners",
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
  "cycling-for-runners": {
    tools: [
      { slug: "hr-zones", title: "HR Zone Calculator", href: "/tools/hr-zones" },
      { slug: "fuelling", title: "Cycling Nutrition Calculator", href: "/tools/fuelling" },
    ],
    commercialPath: "/strength-training",
    relatedTopics: [
      "running-for-cyclists",
      "masters-cycling",
      "ftp-training",
      "cycling-nutrition",
    ],
    featuredPostSlugs: [
      "switching-from-running-to-cycling-guide",
      "cycling-for-injured-runners",
      "cycling-better-for-knees-than-running",
    ],
  },
  "cycling-tech": {
    tools: [
      { slug: "gear-ratio", title: "Gear Ratio Calculator", href: "/tools/gear-ratio" },
      { slug: "ftp-zones", title: "FTP Zone Calculator", href: "/tools/ftp-zones" },
      { slug: "hr-zones", title: "HR Zone Calculator", href: "/tools/hr-zones" },
      { slug: "wkg", title: "W/kg Calculator", href: "/tools/wkg" },
      { slug: "power-speed", title: "Power↔Speed Calculator", href: "/tools/power-speed" },
      { slug: "cadence", title: "Cadence Calculator", href: "/tools/cadence" },
      { slug: "wind-chill", title: "Wind Chill Calculator", href: "/tools/wind-chill" },
    ],
    commercialPath: "/coaching",
    relatedTopics: ["power-meter-training", "ftp-training", "cycling-training-plans"],
    featuredPostSlugs: [
      "best-cycling-computers-2026",
      "wahoo-vs-garmin-cycling-computers",
      "cycling-metrics-explained",
    ],
  },
  "cycling-plateaus": {
    tools: [
      { slug: "ftp-zones", title: "FTP Zone Calculator", href: "/tools/ftp-zones" },
      { slug: "training-load", title: "Training Load Calculator (CTL/ATL/TSB)", href: "/tools/training-load" },
      { slug: "recovery-screen", title: "Recovery Readiness Screen", href: "/tools/recovery-screen" },
      { slug: "training-readiness", title: "Training Readiness Check", href: "/tools/training-readiness" },
    ],
    commercialPath: "/go",
    relatedTopics: ["ftp-training", "cycling-recovery", "cycling-coaching", "masters-cycling"],
    featuredPostSlugs: [
      "cycling-training-plateaus-how-to-break-through-guide",
      "more-volume-getting-slower-cycling-overtraining",
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
  "cycling-for-runners":
    /cycling.for.runners|runners?.{0,15}(?:turned|becom\w+|switch\w*|take.up|took.up).{0,12}(?:cycling|cyclist|the.bike)|from.runn(?:ing|er).to.(?:cycling|the.bike)|ex.?runner|former.runner|running.background|injur(?:ed|y).{0,20}cross.?train|cross.?train\w*.{0,20}(?:injur|runner)|\bduathlon\b/i,
  "cycling-tech":
    /garmin|wahoo|\bgps\b|bike computer|head unit|power meter|cycling computer|edge \d|elemnt|karoo|hammerhead|srm|stages power|quarq|smart trainer|tss|ctl|atl|tsb|normalised power|normalized power/i,
  "cycling-plateaus":
    /plateau|stuck|stagnation|stall|breakthrough|overtrain|overreach|not.?improv|going.?backwards|lost.?form|fatigue.?syndrome|burnout/i,
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
  "cycling-for-runners": /\brace.run|tour.*run|breakaway|run.down/i,
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
        "Improvement remains possible, especially when training becomes more consistent or better matched to the event, but no page can promise an outcome. Compare like-for-like tests and event performance with your own history instead of applying one population decline rate.",
    },
    {
      question: "What changes most about training after 40?",
      answer:
        "Ageing can affect aerobic capacity, muscle function, health context and recovery, but the size and timing vary by rider. Build the plan from the event, history, available time, current health and response to recent load rather than naming one universal change.",
    },
    {
      question: "Should masters cyclists do strength training?",
      answer:
        "Progressive strength can improve some outcomes in adult cyclists, but current evidence is low certainty and does not establish one over-40 programme. Choose the exercise, load and frequency from competence, injury and medical context, equipment and total training load.",
    },
    {
      question: "How much should masters cyclists rest between hard sessions?",
      answer:
        "There is no age-only interval. Start conservatively, then repeat or postpone demanding work from session execution, unusual symptoms, soreness, sleep, mood and life stress compared with the rider's own baseline; seek medical advice for concerning or persistent symptoms.",
    },
  ],
  "ftp-training": [
    {
      question: "What is FTP in cycling?",
      answer:
        "FTP, or Functional Threshold Power, is a practical estimate of sustained threshold power measured in watts. Cyclists use it to anchor power zones and track comparable tests, but it is not a guarantee that every rider can hold the number for exactly one hour.",
    },
    {
      question: "How do I test my FTP?",
      answer:
        "Common options include a sustained 45–60-minute effort or race file, a 20-minute field test with an estimated conversion, a ramp test, and modelled detection from ride data. No method is exact for every rider, so choose one appropriate method and repeat the same protocol, equipment and conditions.",
    },
    {
      question: "How long does it take to improve FTP?",
      answer:
        "There is no universal timetable or guaranteed percentage. Training history, available volume, recovery, testing error and the rider's current limiters all matter, so judge change across comparable training blocks and confirm a surprising result before changing every zone.",
    },
    {
      question: "What is a good FTP for a cyclist?",
      answer:
        "A useful FTP is one measured consistently and interpreted for the rider's body mass, event, power-duration curve and training history. Population benchmark tables can provide context, but they are not targets and a single raw-watt or W/kg band cannot define cycling ability.",
    },
    {
      question: "Is FTP the same as critical power or lactate threshold?",
      answer:
        "No. FTP, critical power and laboratory lactate or ventilatory thresholds are related constructs, but their values come from different definitions and methods. Research supports correlation, not automatic interchangeability, so keep the test name attached to the number.",
    },
    {
      question: "What does FTP not tell you?",
      answer:
        "FTP alone does not describe sprint power, repeatability, fatigue resistance, technical skill, aerodynamics or how long a rider can sustain threshold power. Pair it with a power-duration curve, time-to-exhaustion context and the demands of the target event.",
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
        "Start with the goal, recent completed training, available time, event demands, recovery and review agreement. Place priority work and recovery inside those constraints, progress one or two relevant variables at a time, and state what evidence will trigger an adjustment.",
    },
    {
      question: "What is polarised training?",
      answer:
        "Polarised training describes a distribution with substantial low-intensity work and a smaller amount of high-intensity work. The percentages change depending on the zone system and whether sessions or minutes are counted; current evidence does not show that one fixed ratio is best for every cyclist and outcome.",
    },
    {
      question: "How many hours a week do I need to train?",
      answer:
        "There is no universal minimum because the answer depends on the goal, starting point, training history and recovery. Choose a repeatable schedule that supports the priority sessions and review the response before adding more volume; Roadman's coached service currently supports six-to-twelve-hour weekly variants.",
    },
    {
      question: "What is base training?",
      answer:
        "Base training is a label for a phase that often emphasises general endurance and preparation for later work. Its content and duration are not fixed, and a rider with recent endurance training, a novice and a racer between events may need different starting priorities.",
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
        "Two sessions a week is enough to build and maintain strength alongside riding, dropping to one in your hardest training or racing periods. Place gym work on harder ride days so easy days stay properly easy.",
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
        "A coach can be worth it when you have a specific goal, a persistent plateau, limited training time or changing constraints that require judgement rather than another static plan. It is not a guaranteed shortcut; compare the coach's scope, review cadence, communication, evidence and terms against what you will actually use.",
    },
    {
      question: "How does online cycling coaching work?",
      answer:
        "An online coach receives your goals, schedule, feedback and training data through agreed platforms, then plans and reviews work at the cadence stated in the service. Delivery varies: ask who reviews the data, what triggers a change, which contact channels are included and when in-person skills support would still be useful.",
    },
    {
      question: "How much does a cycling coach cost?",
      answer:
        "Price depends on whether the offer is group coaching or named-coach one-to-one, the billing period, review cadence, contact and contract terms. Roadman's dated market audit compares public offers on the same basis; Not Done Yet group coaching is currently $195 per calendar month with a seven-day free trial.",
    },
    {
      question: "Does my cycling coach need to be local?",
      answer:
        "Not always. Remote planning and data review can work across locations, while bike handling, group-riding skills, some sprint work and physical assessment may benefit from in-person observation. Choose by the support your goal requires, then confirm time-zone overlap, communication and safeguarding arrangements.",
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
      question: "Where should I start with polarised training?",
      answer:
        "Start with the evidence-led polarised training guide, which defines the three-zone model and explains why session count and time in zone can produce different 80/20 results. Then use this learning path for comparisons, zone setting, practical sessions and podcast conversations.",
    },
    {
      question: "Is this topic page the main polarised training guide?",
      answer:
        "No. This page is the navigation hub. The main guide owns the broad definition and evidence; the linked pages answer narrower questions such as polarised versus pyramidal, polarised versus sweet spot and how to set training zones.",
    },
    {
      question: "Does Roadman treat 80/20 as an exact weekly target?",
      answer:
        "No. Eighty-twenty is a useful description whose result depends on the zone model, thresholds, observation period and counting method. Roadman recommends auditing the actual programme and rider response instead of forcing every week into an exact ratio.",
    },
    {
      question: "Which comparisons are included?",
      answer:
        "The learning path links to dedicated polarised-versus-pyramidal and polarised-versus-sweet-spot guides. Keeping those jobs separate makes the advice clearer and prevents one broad page from giving shallow answers to every intent.",
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
        "It is not guaranteed. Heat acclimation is best supported as preparation for exercise in hot conditions. A meta-analysis found a possible time-trial benefit but no significant pooled VO2max improvement, and recent passive-heat reviews describe performance effects as uncertain. Do not plan around one promised FTP percentage.",
    },
    {
      question: "How do I heat acclimate at home?",
      answer:
        "First confirm that a materially hot event creates a real preparation gap. Purposeful heat exposure should be progressive, should account for the rest of the training load, and needs fluids, rapid cooling, communication and stop rules. A space heater, extra layers or a consumer sensor is not a universal DIY prescription; qualified supervision is preferable.",
    },
    {
      question: "Is heat training safe for masters riders?",
      answer:
        "Age alone cannot establish a safe dose. Fitness, health, medicines, previous heat exposure and history of heat illness all matter. A review found short-term acclimation feasible in some adults over 50, but only 96 older participants were represented. Seek individual medical advice when health or medication may change heat tolerance.",
    },
    {
      question: "How long does heat acclimation last?",
      answer:
        "Adaptations decay at different rates and published protocols vary. Plan the timing from the target event, travel and recovery rather than assuming one universal half-life or maintenance dose. Reassess after a long break or a major change in environment.",
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
        "Sweet spot is a cycling coaching convention commonly set at 88–94% of FTP. It overlaps upper tempo and lower threshold in common power models, so it is a practical prescription rather than a separate physiological threshold.",
    },
    {
      question: "Is sweet spot better than threshold training?",
      answer:
        "Neither is universally better. Sweet spot is commonly used for repeatable sub-threshold work, while threshold training targets sustained work nearer FTP; the right choice depends on the event, training phase, available time and the rider's previous response.",
    },
    {
      question: "When should I use sweet spot training?",
      answer:
        "Use sweet spot when controlled sustained sub-threshold work solves a specific training problem and fits the complete week. A time-limited quality session or preparation for a sustained climb can be reasonable uses, but neither creates a universal frequency or block length.",
    },
    {
      question: "Can I do too much sweet spot?",
      answer:
        "Yes. Any repeated moderate-to-hard work can exceed the recovery available when races, group rides, strength training and life stress are counted. Reduce the dose when pacing deteriorates, normal training is suppressed or recovery trends remain abnormal.",
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
        "Only for a defined training purpose. Low cadence raises crank torque per stroke at a given power. A small 2024 trial in 24 well-trained female cyclists aged 17-20 found promising gains inside a demanding eight-week programme, while other protocols have produced null or mixed results. Start conservatively, control power and stop if pain or position loss develops.",
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
  "cycling-for-runners": [
    {
      question: "Is cycling good cross-training for runners?",
      answer:
        "Yes — it's the best-supported cross-training option runners have. A 2026 systematic review (Menges et al., Frontiers in Sports and Active Living) found VO2max gains transfer meaningfully between cycling and running, so aerobic work done on the bike counts toward your running fitness. Because cycling is non-impact, it adds that aerobic volume without adding to the cumulative loading on bones, tendons, and cartilage that limits how much running most athletes can absorb. Even Eliud Kipchoge has used the bike as a cross-training tool.",
    },
    {
      question: "Can cycling replace running for cardio?",
      answer:
        "For the cardiovascular system, largely yes — your heart doesn't know whether the demand came from pedalling or striding, which is why injured runners can hold most of their aerobic fitness on the bike for weeks. What cycling cannot replicate is impact tolerance, running economy, and the eccentric loading your legs need for the sport itself, so a runner with a race on the calendar still needs some running. As a rule of thumb, expect roughly 2-3 minutes of moderate cycling to approximate 1 minute of running for aerobic training load.",
    },
    {
      question: "What type of bike should a runner buy first?",
      answer:
        "For most runners the answer is a road bike or an endurance-geometry gravel bike in the $1,000-2,500 range — both give you an efficient position, real gearing, and room to grow. A gravel bike is the more forgiving first choice: wider tyres, more stable handling, and it opens up traffic-free riding. Skip the cheap hybrid if you intend to train seriously; the upright position and heavy frame make structured aerobic work harder than it needs to be. Whatever you buy, budget for a basic bike fit — it matters more than any component upgrade.",
    },
    {
      question: "How many times a week should a runner cycle?",
      answer:
        "Two to three rides of 45-90 minutes is the sweet spot for a healthy runner using cycling as a supplement — enough to add meaningful aerobic volume without eating into recovery from key run sessions. Keep most of it easy (conversational, Zone 2) and schedule rides on the days between hard runs, not before them. An injured runner can push that to four or five rides a week, since the bike is carrying the full aerobic load while the injury heals.",
    },
  ],
  "cycling-tech": [
    {
      question: "Do I need a bike computer or is a watch enough for cycling?",
      answer:
        "A dedicated bike computer is worth it if you train with power or ride more than three times a week — it pairs directly with your power meter and sensors and shows the data you need mid-effort without competing for wrist space. A GPS watch covers casual riding fine, especially if you already use it for running.",
    },
    {
      question: "What cycling metrics should I actually track?",
      answer:
        "Three matter for most riders: average power (or heart rate without a meter), cadence, and time in zone. Everything else — TSS, CTL, NP — is useful for a coach or a data-curious rider planning load, but these three tell you whether a session did its job.",
    },
    {
      question: "Is Wahoo or Garmin better for cycling?",
      answer:
        "Wahoo tends to win on workout-execution simplicity; Garmin wins on mapping depth and multi-sport ecosystem breadth. Neither is wrong — the right pick depends on whether you ride structured intervals or explore unfamiliar routes more often.",
    },
    {
      question: "Do I need a power meter to train properly?",
      answer:
        "No — heart rate and RPE built a lot of fast cyclists long before power meters existed. A power meter removes guesswork and is worth the cost once you're training with real structure, but it's an upgrade, not a prerequisite.",
    },
  ],
  "cycling-plateaus": [
    {
      question: "Why has my cycling performance plateaued?",
      answer:
        "Most plateaus trace to one of five causes: grey-zone training (too much moderate intensity, too little easy and hard), inadequate recovery, under-fuelling, accumulated life stress, or a training plan that never changes stimulus. Identifying which limiter applies to you is the first step — and more often than not, it's a recovery or lifestyle problem disguised as a fitness problem.",
    },
    {
      question: "How do I know if I'm overtraining or just tired?",
      answer:
        "Normal fatigue clears within 48-72 hours. Overreaching persists for one to two weeks despite rest. True overtraining syndrome takes months to recover from and is accompanied by persistent performance decline, disrupted sleep, elevated resting heart rate, and low motivation. If a deload week doesn't restore your form, it's time to dig deeper.",
    },
    {
      question: "How long does a cycling plateau usually last?",
      answer:
        "A training-driven plateau typically resolves within 4-8 weeks once the limiter is addressed — whether that's adding genuine recovery, changing the training stimulus, or fixing a fuelling gap. Plateaus that last longer often have a lifestyle root: chronic sleep debt, unmanaged stress, or an underlying health issue like iron deficiency.",
    },
    {
      question: "What is the fastest way to break through a cycling plateau?",
      answer:
        "There's no shortcut, but the highest-leverage move is almost always more recovery, not more training. After that, audit your training polarity (are your easy days actually easy?), check your fuelling, and introduce a stimulus your body hasn't seen — VO2max intervals if you've been grinding sweet spot, or genuine Zone 2 volume if you've been smashing intervals every ride.",
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
      sources: enrichment.sources ?? [],
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
