/**
 * Specs for the 12-article triathlon-cycling cluster that supports the
 * `/coaching/triathlon` pillar page.
 *
 * Each article targets a distinct commercial or informational query in the
 * "bike leg of triathlon" cluster. Together they provide the internal link
 * equity and topical depth `/coaching/triathlon` needs to rank.
 *
 * Source: SEO Domination Playbook §6.2 → "Triathlon-Cycling Cluster (12)"
 */

export interface ClusterArticleSpec {
  /** MDX file slug — filename without the .mdx extension. */
  slug: string;
  title: string;
  seoTitle: string;
  seoDescription: string;
  excerpt: string;
  /** Primary target keyword — used in the prompt to anchor search intent. */
  targetKeyword: string;
  /** Supporting keywords that should appear naturally. */
  supportingKeywords: string[];
  /** One-sentence editorial angle — what makes this article different. */
  angle: string;
  /** Content pillar (matches src/types/index.ts ContentPillar). */
  pillar: "coaching" | "nutrition" | "strength" | "recovery" | "community";
  /** Required H2 section headings, in order. */
  requiredSections: string[];
  /** Internal links the article must weave in naturally. */
  internalLinks: Array<{ href: string; anchor: string }>;
  /** Target word count. Article must be within 70–130% of this. */
  wordTarget: number;
  /** Image path from /public/images/. Stock cycling imagery from the existing set. */
  featuredImage: string;
}

export const TRIATHLON_CLUSTER_ARTICLES: ClusterArticleSpec[] = [
  {
    slug: "bike-leg-of-triathlon-why-age-groupers-get-it-wrong",
    title: "The Bike Leg of Triathlon: Why Most Age-Groupers Get It Wrong",
    seoTitle:
      "The Bike Leg of Triathlon: Why Most Age-Groupers Get It Wrong (2026)",
    seoDescription:
      "Most age-group triathletes treat the bike as a third of the plan. It's 50–60% of race-day and the lever that determines your run. Here's the framework to fix it.",
    excerpt:
      "The bike is 50–60% of your race-day time and the single biggest threat to your run. Most age-group plans give it a third of the attention. Here's what to change.",
    targetKeyword: "bike leg of triathlon",
    supportingKeywords: [
      "triathlon bike training",
      "age group triathlon bike",
      "triathlon bike strategy",
      "bike leg triathlon pacing",
    ],
    angle:
      "Cornerstone piece arguing that the bike leg deserves dedicated, run-protective programming — not the generic endurance-club bike volume most triathlon plans prescribe.",
    pillar: "coaching",
    requiredSections: [
      "Why the bike leg is the pacing lever, not the run",
      "The three mistakes that wreck most age-group bike legs",
      "What run-protective bike programming actually looks like",
      "Brick workouts: the bridge most plans neglect",
      "How to pace the race-day bike leg",
      "Signs your bike block is working",
    ],
    internalLinks: [
      {
        href: "/coaching/triathlon",
        anchor: "triathlon bike coaching",
      },
      { href: "/coaching", anchor: "our cycling coaching" },
      { href: "/tools/ftp-zones", anchor: "FTP zones" },
    ],
    wordTarget: 2500,
    featuredImage: "/images/cycling/gravel-desert-road-epic.jpg",
  },

  {
    slug: "ironman-bike-training-plan-16-weeks",
    title: "Ironman Bike Training Plan: 16-Week Build for Age-Groupers",
    seoTitle: "Ironman Bike Training Plan: 16-Week Build for Age-Groupers",
    seoDescription:
      "A 16-week Ironman bike training plan built for age-group athletes. Weekly structure, key sessions, fuelling, and race-day pacing — periodised around the run.",
    excerpt:
      "Sixteen weeks, three phases, one goal: arrive at T2 with legs that can still run a marathon. A week-by-week Ironman bike plan for age-groupers.",
    targetKeyword: "ironman bike training plan",
    supportingKeywords: [
      "ironman bike training",
      "ironman cycling training",
      "16 week ironman training plan",
      "ironman bike preparation",
    ],
    angle:
      "Practical 16-week build with concrete weekly structure. Differentiates from generic plans by explicitly protecting run capacity at each phase.",
    pillar: "coaching",
    requiredSections: [
      "Who this plan is for",
      "Phase 1: Base endurance (weeks 1–6)",
      "Phase 2: Race-specific power (weeks 7–12)",
      "Phase 3: Taper and sharpen (weeks 13–16)",
      "Key weekly sessions explained",
      "Fuelling the long rides",
      "How to slot in swim and run without breaking the bike block",
    ],
    internalLinks: [
      {
        href: "/coaching/triathlon",
        anchor: "triathlon bike coaching",
      },
      { href: "/tools/fuelling", anchor: "in-ride fuelling calculator" },
      { href: "/tools/ftp-zones", anchor: "FTP zones" },
    ],
    wordTarget: 2800,
    featuredImage: "/images/cycling/gravel-road-climb.jpg",
  },

  {
    slug: "70-3-bike-training-plan-12-weeks",
    title: "70.3 Bike Training Plan: 12 Weeks to a Faster Bike Split",
    seoTitle: "70.3 Bike Training Plan: 12 Weeks to a Faster Bike Split",
    seoDescription:
      "A 12-week 70.3 bike training plan designed to cut your bike split without wrecking your run. Weekly structure, key sessions, and race-day pacing guidance.",
    excerpt:
      "Twelve weeks, built to drop your 70.3 bike split by 5–15 minutes while still running off the bike. Week-by-week structure for age-group athletes.",
    targetKeyword: "70.3 bike training plan",
    supportingKeywords: [
      "half ironman bike training",
      "70.3 cycling plan",
      "half ironman training plan",
      "70.3 bike split",
    ],
    angle:
      "The faster-but-protected 70.3 bike build. Explicitly benchmarks against typical age-group bike splits and shows where the realistic gains come from.",
    pillar: "coaching",
    requiredSections: [
      "What a realistic bike-split improvement looks like",
      "Phase 1: Aerobic base (weeks 1–4)",
      "Phase 2: Sustainable power (weeks 5–9)",
      "Phase 3: Race-ready taper (weeks 10–12)",
      "Key weekly sessions",
      "Pacing the 90km on race day",
    ],
    internalLinks: [
      {
        href: "/coaching/triathlon",
        anchor: "triathlon bike coaching",
      },
      { href: "/tools/ftp-zones", anchor: "FTP zones calculator" },
    ],
    wordTarget: 2400,
    featuredImage: "/images/cycling/gravel-canyon-rest.jpg",
  },

  {
    slug: "how-to-pace-the-bike-in-a-half-ironman",
    title:
      "How to Pace the Bike in a Half Ironman (Without Wrecking Your Run)",
    seoTitle:
      "How to Pace the Bike in a Half Ironman Without Wrecking Your Run",
    seoDescription:
      "How to pace the 90km bike in a 70.3 so you can still run a fast half marathon off it. Wattage targets, heart-rate ceilings, and fuelling timing.",
    excerpt:
      "Most age-groupers blow the 70.3 bike leg in the first 30 minutes. Here's how to set a wattage cap, a heart-rate ceiling, and a fuelling plan that protects the run.",
    targetKeyword: "half ironman bike pacing",
    supportingKeywords: [
      "70.3 bike pacing",
      "how to pace ironman bike",
      "bike pacing triathlon",
      "half ironman wattage",
    ],
    angle:
      "The tactical pacing guide. Specific wattage percentages of FTP, HR ceilings, and fuelling trigger points tied to race-day timeline.",
    pillar: "coaching",
    requiredSections: [
      "Why most 70.3 bike legs are over-cooked in the first hour",
      "Your wattage cap — and where it comes from",
      "Heart-rate as the sanity check",
      "Fuelling timeline: 0–30 / 30–60 / 60–90 minutes",
      "Course-specific pacing adjustments",
      "What to do if the race doesn't go to plan",
    ],
    internalLinks: [
      {
        href: "/coaching/triathlon",
        anchor: "triathlon bike coaching",
      },
      { href: "/tools/fuelling", anchor: "fuelling calculator" },
      { href: "/tools/ftp-zones", anchor: "FTP zones" },
    ],
    wordTarget: 1800,
    featuredImage: "/images/cycling/gravel-road-climb-2.jpg",
  },

  {
    slug: "brick-workouts-for-ironman",
    title: "Brick Workouts for Ironman: 10 Sessions That Actually Work",
    seoTitle: "Brick Workouts for Ironman: 10 Sessions That Actually Work",
    seoDescription:
      "Ten bike-to-run brick workouts for Ironman training, organised by training phase. Why each session works and how to slot them into your week.",
    excerpt:
      "Brick workouts are where bike training meets run reality. Ten sessions, organised by phase, that teach your legs what race-day actually feels like.",
    targetKeyword: "brick workouts for ironman",
    supportingKeywords: [
      "ironman brick workouts",
      "triathlon brick training",
      "bike to run brick",
      "brick sessions triathlon",
    ],
    angle:
      "Ten specific sessions with duration, intensity, and placement in the week. Not generic 'bike then run' advice.",
    pillar: "coaching",
    requiredSections: [
      "What brick workouts actually train",
      "Base-phase bricks (weeks 1–6)",
      "Build-phase bricks (weeks 7–12)",
      "Race-specific bricks (weeks 13+)",
      "How often to brick and how long to make them",
      "Mistakes that make bricks counter-productive",
    ],
    internalLinks: [
      {
        href: "/coaching/triathlon",
        anchor: "triathlon bike coaching",
      },
    ],
    wordTarget: 1600,
    featuredImage: "/images/cycling/gravel-canyon-rest.jpg",
  },

  {
    slug: "what-wattage-should-you-ride-in-an-ironman",
    title: "What Wattage Should You Ride in an Ironman?",
    seoTitle: "What Wattage Should You Ride in an Ironman? (2026 Guide)",
    seoDescription:
      "Exact wattage targets for the Ironman bike leg based on your FTP, age-group, course profile, and run goal. The numbers every age-grouper should know.",
    excerpt:
      "The honest answer to 'what watts should I ride at Ironman' is 'it depends on these five things'. Here's how to calculate your exact target wattage.",
    targetKeyword: "ironman bike wattage",
    supportingKeywords: [
      "ironman wattage",
      "ironman power targets",
      "ironman intensity factor",
      "ironman bike power",
    ],
    angle:
      "A numeric, formula-driven answer rather than generic 'ride easy' advice. IF targets, NP vs AP, how course and age group modify the equation.",
    pillar: "coaching",
    requiredSections: [
      "The one-line answer (and why it's wrong)",
      "Intensity Factor: the real target",
      "How your FTP sets the ceiling",
      "How course profile changes the math",
      "Age-group adjustments",
      "Worked example: 250W FTP on a flat Ironman",
    ],
    internalLinks: [
      { href: "/tools/ftp-zones", anchor: "FTP zones calculator" },
      {
        href: "/coaching/triathlon",
        anchor: "triathlon bike coaching",
      },
    ],
    wordTarget: 1500,
    featuredImage: "/images/cycling/gravel-canyon-wide.jpg",
  },

  {
    slug: "ftp-training-for-triathletes",
    title: "FTP Training for Triathletes: How It's Different from Cyclists",
    seoTitle: "FTP Training for Triathletes: How It's Different from Cyclists",
    seoDescription:
      "Why triathlete FTP training differs from pure cyclist FTP training — and the specific adjustments that protect your run while building bike-leg power.",
    excerpt:
      "Triathletes can't train FTP the way cyclists do. Volume, recovery, and session placement all have to change — or your run pays the price.",
    targetKeyword: "ftp training for triathletes",
    supportingKeywords: [
      "triathlete ftp",
      "triathlon ftp training",
      "ftp training triathlon",
      "ftp for triathletes",
    ],
    angle:
      "Direct comparison — cyclist FTP training vs. triathlete FTP training — with specific protocol modifications.",
    pillar: "coaching",
    requiredSections: [
      "Why FTP still matters (more than ever) for triathletes",
      "How cyclists train FTP — and why it breaks triathletes",
      "Volume modifications",
      "Recovery modifications",
      "Session placement around swim and run",
      "Testing FTP as a triathlete",
    ],
    internalLinks: [
      { href: "/tools/ftp-zones", anchor: "FTP zones calculator" },
      {
        href: "/coaching/triathlon",
        anchor: "triathlon bike coaching",
      },
    ],
    wordTarget: 1700,
    featuredImage: "/images/cycling/gravel-canyon-rest.jpg",
  },

  {
    slug: "strength-training-for-triathletes-bike-specific",
    title: "Strength Training for Triathletes: Bike-Specific Exercises",
    seoTitle:
      "Strength Training for Triathletes: Bike-Specific Exercises (2026)",
    seoDescription:
      "The bike-specific strength exercises that build aero-position resilience, late-race durability, and force production — without wrecking your run.",
    excerpt:
      "Triathlon-specific strength isn't bodybuilding. It's resilience training for the aero position, durability for the late-race bike, and force production that transfers to watts.",
    targetKeyword: "strength training for triathletes",
    supportingKeywords: [
      "triathlon strength training",
      "strength exercises for triathletes",
      "bike strength triathlon",
      "triathlete gym workouts",
    ],
    angle:
      "Eight bike-specific exercises with reps, sets, and why each one works. Explicit about what to avoid.",
    pillar: "strength",
    requiredSections: [
      "Why triathletes need strength (and what they don't need)",
      "The eight bike-specific exercises",
      "How to program them across a training week",
      "Periodisation around big bike weeks",
      "What not to do in the gym as a triathlete",
    ],
    internalLinks: [
      { href: "/strength-training", anchor: "strength course" },
      {
        href: "/coaching/triathlon",
        anchor: "triathlon bike coaching",
      },
    ],
    wordTarget: 1800,
    featuredImage: "/images/cycling/gravel-desert-road-epic.jpg",
  },

  {
    slug: "how-many-bike-hours-per-week-for-70-3",
    title: "How Many Bike Hours a Week for 70.3 Training?",
    seoTitle:
      "How Many Bike Hours a Week for 70.3 Training? (Realistic Ranges)",
    seoDescription:
      "Realistic bike-hour targets for 70.3 training at different fitness levels and training loads. Why more isn't always better, and where the breakpoints are.",
    excerpt:
      "Not everyone needs 12 bike hours a week to train for a 70.3. Here are the realistic ranges by level, and where the diminishing returns start to bite.",
    targetKeyword: "bike hours for 70.3",
    supportingKeywords: [
      "70.3 training hours",
      "half ironman bike volume",
      "70.3 bike hours per week",
      "how much cycling for 70.3",
    ],
    angle:
      "Direct numeric ranges for beginner/intermediate/advanced. Honest about the diminishing-returns ceiling.",
    pillar: "coaching",
    requiredSections: [
      "The honest answer: it depends on what you want",
      "Beginner: first 70.3, finish strong",
      "Intermediate: sub-5:30 bike-run target",
      "Advanced: Kona-qualifying effort",
      "Why more hours doesn't always mean faster",
      "How to get the most out of 6, 8, and 10 bike hours",
    ],
    internalLinks: [
      {
        href: "/coaching/triathlon",
        anchor: "triathlon bike coaching",
      },
    ],
    wordTarget: 1200,
    featuredImage: "/images/cycling/gravel-riding-canyon.jpg",
  },

  {
    slug: "cycling-coach-vs-triathlon-coach",
    title: "Cycling Coach vs Triathlon Coach: Which Do You Actually Need?",
    seoTitle: "Cycling Coach vs Triathlon Coach: Which Do You Actually Need?",
    seoDescription:
      "When to hire a cycling coach vs a triathlon coach — and when to use both. A framework for age-group triathletes deciding where their coaching spend lands.",
    excerpt:
      "Triathlon coach, cycling coach, or both? Here's the framework for deciding, based on where your time is leaking in race-day splits.",
    targetKeyword: "cycling coach vs triathlon coach",
    supportingKeywords: [
      "triathlon coach vs cycling coach",
      "do I need a cycling coach for triathlon",
      "bike coach for triathletes",
      "triathlon coaching options",
    ],
    angle:
      "Decision framework, not hedging. Specific scenarios where each choice is right.",
    pillar: "coaching",
    requiredSections: [
      "What a triathlon coach actually does",
      "What a cycling coach actually does",
      "The 'bike as weak discipline' case",
      "The 'all three disciplines plateaued' case",
      "When both coaches at once actually works",
      "What to look for in a bike-specialist triathlon coach",
    ],
    internalLinks: [
      {
        href: "/coaching/triathlon",
        anchor: "triathlon bike coaching",
      },
      { href: "/coaching", anchor: "our cycling coaching" },
      { href: "/apply", anchor: "coaching application" },
    ],
    wordTarget: 1600,
    featuredImage: "/images/cycling/gravel-canyon-rest.jpg",
  },

  {
    slug: "aero-position-training-for-triathletes",
    title:
      "Aero Position Training: How to Ride Faster Without Getting Fitter",
    seoTitle:
      "Aero Position Training: How to Ride Faster Without Getting Fitter",
    seoDescription:
      "Aero position endurance is a training adaptation, not just a flexibility test. Here's how to build the capacity to hold position for the full bike leg.",
    excerpt:
      "Holding aero for two hours is a training adaptation, not a stretching test. Here's the progression that lets you stay low without losing power or torching your back.",
    targetKeyword: "aero position training",
    supportingKeywords: [
      "aero position endurance",
      "time trial position training",
      "aero bars training",
      "triathlon aero position",
    ],
    angle:
      "Specific progression — weeks 1 through 12 — for holding the aero position. Addresses back, neck, and power trade-offs.",
    pillar: "coaching",
    requiredSections: [
      "Why aero position is a training adaptation",
      "Your current aero capacity: how to test it honestly",
      "Weeks 1–4: Building aero tolerance",
      "Weeks 5–8: Adding intensity in position",
      "Weeks 9–12: Race-length aero endurance",
      "Common breakdowns and how to fix them",
    ],
    internalLinks: [
      {
        href: "/coaching/triathlon",
        anchor: "triathlon bike coaching",
      },
    ],
    wordTarget: 1500,
    featuredImage: "/images/cycling/gravel-desert-road-epic.jpg",
  },

  {
    slug: "indoor-cycling-for-triathletes-winter-plan",
    title: "Indoor Cycling for Triathletes: The Ultimate Winter Plan",
    seoTitle: "Indoor Cycling for Triathletes: The Ultimate Winter Plan",
    seoDescription:
      "A structured indoor cycling winter plan for triathletes. How to build threshold, aerobic base, and aero endurance without the outdoor riding.",
    excerpt:
      "Winter is when triathletes win or lose the bike leg. Here's the indoor-only 12-week plan that builds real bike-leg capacity — without the junk miles.",
    targetKeyword: "indoor cycling for triathletes",
    supportingKeywords: [
      "triathlon winter training",
      "indoor triathlon cycling",
      "triathlon trainer workouts",
      "winter bike training triathlon",
    ],
    angle:
      "Full indoor 12-week plan. Acknowledges that most age-groupers can't ride outdoors productively in winter.",
    pillar: "coaching",
    requiredSections: [
      "Why winter is the season that decides your bike split",
      "The indoor-cycling bike-fit reset",
      "Weeks 1–4: Aerobic base (indoor edition)",
      "Weeks 5–8: Threshold and VO2max",
      "Weeks 9–12: Race-specific aero endurance",
      "How to avoid indoor overtraining",
    ],
    internalLinks: [
      {
        href: "/coaching/triathlon",
        anchor: "triathlon bike coaching",
      },
      { href: "/tools/ftp-zones", anchor: "FTP zones" },
    ],
    wordTarget: 1900,
    featuredImage: "/images/cycling/gravel-roadside-break.jpg",
  },
];
