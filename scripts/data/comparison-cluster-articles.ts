/**
 * Specs for the 10-article X-vs-Y comparison cluster.
 *
 * Each article targets a high-intent comparison query with clear
 * commercial-adjacent pull-through (platform choice, gear decision,
 * training methodology). These queries are low competition relative
 * to their intent score and play to Roadman's expert-driven angle.
 */

import { type ClusterArticleSpec } from "./triathlon-cluster-articles";

export const COMPARISON_CLUSTER_ARTICLES: ClusterArticleSpec[] = [
  {
    slug: "zwift-vs-trainerroad",
    title: "Zwift vs TrainerRoad: Which Platform Actually Makes You Faster?",
    seoTitle: "Zwift vs TrainerRoad: Which Is Better for Cyclists in 2026?",
    seoDescription:
      "Zwift and TrainerRoad both claim to make you faster, but they solve different problems. Here's the honest comparison for serious cyclists $€” workouts, structure, price, and who should pick which.",
    excerpt:
      "Zwift and TrainerRoad both claim to make you faster, but they solve different problems. One is a training app pretending to be a game; the other is a game pretending to be a training app.",
    targetKeyword: "zwift vs trainerroad",
    supportingKeywords: [
      "trainerroad vs zwift",
      "best indoor cycling app",
      "structured training indoor",
      "zwift academy vs trainerroad",
    ],
    angle:
      "Honest head-to-head focused on the actual job each platform does best $€” structured adaptive training (TR) vs social virtual riding (Zwift) $€” with a clear recommendation framework based on rider type.",
    pillar: "coaching",
    requiredSections: [
      "What each platform is actually built for",
      "Workout library and adaptive training",
      "Social and race dynamics",
      "Price, ecosystem lock-in, and switching costs",
      "Which one should you pick? Three rider profiles",
      "What neither platform replaces",
    ],
    internalLinks: [
      { href: "/coaching", anchor: "1:1 cycling coaching" },
      { href: "/tools/ftp-zones", anchor: "your FTP zones" },
      { href: "/blog/trainerroad-vs-online-cycling-coach", anchor: "TrainerRoad vs a human coach" },
    ],
    wordTarget: 2500,
    featuredImage: "/images/cycling/gravel-road-climb.jpg",
  },

  {
    slug: "wahoo-vs-garmin-cycling-computers",
    title: "Wahoo vs Garmin Cycling Computers: Which One in 2026?",
    seoTitle: "Wahoo vs Garmin Cycling Computers: The Honest 2026 Comparison",
    seoDescription:
      "Wahoo and Garmin dominate the cycling-computer market. Here's the honest breakdown $€” mapping, workout execution, ecosystem, battery, and who should buy which.",
    excerpt:
      "Wahoo and Garmin dominate the cycling-computer market but solve different problems. Here's who should buy which in 2026, based on actual use not spec-sheet bullet points.",
    targetKeyword: "wahoo vs garmin",
    supportingKeywords: [
      "wahoo bolt vs garmin edge",
      "best cycling computer",
      "wahoo elemnt vs garmin",
      "cycling head unit 2026",
    ],
    angle:
      "Use-case-driven comparison rather than spec sheet. Focuses on what actually matters day-to-day: workout execution, navigation, ecosystem, and reliability.",
    pillar: "community",
    requiredSections: [
      "What each brand has historically been better at",
      "Mapping and navigation",
      "Workout execution and structured training",
      "Ecosystem $€” sensors, radar, Varia, integration",
      "Battery life and reliability",
      "The honest recommendation for three rider types",
    ],
    internalLinks: [
      { href: "/coaching", anchor: "structured coaching" },
      { href: "/tools/ftp-zones", anchor: "FTP zones calculator" },
      { href: "/podcast", anchor: "Roadman podcast" },
    ],
    wordTarget: 2200,
    featuredImage: "/images/cycling/gravel-desert-road-epic.jpg",
  },

  {
    slug: "power-meter-vs-smart-trainer",
    title: "Power Meter vs Smart Trainer: Where Should Your First $$500 Go?",
    seoTitle: "Power Meter vs Smart Trainer: Which to Buy First in 2026?",
    seoDescription:
      "Should you buy a power meter or a smart trainer first? The honest answer depends on your rides $€” here's the framework and the real numbers.",
    excerpt:
      "Both tools measure power; only one works outdoors. Both cost around the same; only one replaces your winter. Here's how to decide which comes first $€” and why most cyclists pick wrong.",
    targetKeyword: "power meter vs smart trainer",
    supportingKeywords: [
      "first power meter or smart trainer",
      "power meter or trainer first",
      "power meter vs indoor trainer",
      "cycling investment priority",
    ],
    angle:
      "Framework for deciding based on ride hours outdoor vs indoor, training intent, and budget $€” not a feature comparison.",
    pillar: "coaching",
    requiredSections: [
      "What each one actually gives you",
      "The ride-mix question $€” indoor vs outdoor hours",
      "The training-intent question $€” structured vs free riding",
      "The upgrade-path question $€” what comes after",
      "Cost, accuracy, and portability",
      "The decision framework for 2026",
    ],
    internalLinks: [
      { href: "/coaching", anchor: "coaching that uses your power data" },
      { href: "/tools/ftp-zones", anchor: "set your power zones" },
      { href: "/blog/trainerroad-vs-online-cycling-coach", anchor: "structured training compared" },
    ],
    wordTarget: 2200,
    featuredImage: "/images/cycling/gravel-canyon-wide.jpg",
  },

  {
    slug: "rouvy-vs-zwift",
    title: "Rouvy vs Zwift: Which Virtual Cycling Platform in 2026?",
    seoTitle: "Rouvy vs Zwift: The Honest 2026 Comparison for Cyclists",
    seoDescription:
      "Rouvy's real-world routes vs Zwift's game-world social riding. Here's the honest comparison $€” price, feel, workouts, and who should pick which.",
    excerpt:
      "Rouvy built a virtual platform on real-world roads. Zwift built a game. Both work; they solve different problems. Here's who should pick which.",
    targetKeyword: "rouvy vs zwift",
    supportingKeywords: [
      "zwift vs rouvy",
      "best virtual cycling",
      "rouvy real-world routes",
      "virtual cycling platform 2026",
    ],
    angle:
      "Mission-differentiated comparison $€” Rouvy's real-world augmentation vs Zwift's social game-world $€” with a recommendation framework based on what you miss about outdoor riding.",
    pillar: "community",
    requiredSections: [
      "Two very different bets on virtual cycling",
      "The riding experience compared",
      "Structured workouts and training plans",
      "Social, racing, and group dynamics",
      "Price, ecosystem, and hardware requirements",
      "Who should pick which",
    ],
    internalLinks: [
      { href: "/coaching", anchor: "structured cycling coaching" },
      { href: "/blog/zwift-vs-cycling-coach", anchor: "Zwift vs a human coach" },
      { href: "/podcast", anchor: "the Roadman podcast" },
    ],
    wordTarget: 2200,
    featuredImage: "/images/cycling/gravel-riding-canyon.jpg",
  },

  {
    slug: "tubeless-vs-clincher-tyres",
    title: "Tubeless vs Clincher Road Tyres: The Honest 2026 Comparison",
    seoTitle: "Tubeless vs Clincher Tyres: Which Is Actually Faster in 2026?",
    seoDescription:
      "Tubeless tyres are faster in rolling tests $€” but not by as much as you think, and clinchers still win in specific scenarios. Here's the honest comparison.",
    excerpt:
      "Tubeless tyres are faster in rolling tests $€” but not by as much as marketing suggests, and clinchers still win in specific scenarios. Here's the honest comparison.",
    targetKeyword: "tubeless vs clincher",
    supportingKeywords: [
      "road tubeless vs clincher",
      "tubeless tyres worth it",
      "clincher vs tubeless road",
      "tubeless rolling resistance",
    ],
    angle:
      "Data-first comparison using real rolling-resistance numbers, puncture scenarios, and the practical ownership friction both technologies introduce.",
    pillar: "community",
    requiredSections: [
      "The performance difference in numbers",
      "Puncture protection: the honest reality",
      "Comfort and pressure range",
      "Installation, sealant, and ownership friction",
      "Where clinchers still win",
      "The 2026 recommendation for four rider profiles",
    ],
    internalLinks: [
      { href: "/tools/tyre-pressure", anchor: "tyre pressure calculator" },
      { href: "/coaching", anchor: "cycling coaching" },
      { href: "/podcast", anchor: "Roadman Cycling Podcast" },
    ],
    wordTarget: 2200,
    featuredImage: "/images/cycling/gravel-road-climb-2.jpg",
  },

  {
    slug: "indoor-trainer-vs-rollers",
    title: "Indoor Trainer vs Rollers: Which One Belongs in Your Pain Cave?",
    seoTitle: "Indoor Trainer vs Rollers: Which Is Better in 2026?",
    seoDescription:
      "Smart trainer or rollers for indoor cycling? They train different things. Here's the honest comparison $€” fitness, skill, cost, and who should own which.",
    excerpt:
      "Smart trainer or rollers? They're not actually competing $€” they train different things. Here's the honest comparison and why the best answer for many riders is both.",
    targetKeyword: "indoor trainer vs rollers",
    supportingKeywords: [
      "rollers vs smart trainer",
      "cycling rollers benefits",
      "best indoor cycling setup",
      "rollers for skills training",
    ],
    angle:
      "Argues rollers and smart trainers are complementary, not competitors $€” rollers train balance and pedal stroke; trainers deliver structured power work. The best indoor cyclists own both.",
    pillar: "coaching",
    requiredSections: [
      "What each one actually trains",
      "Smart-trainer fitness gains",
      "What rollers do that trainers can't",
      "The hybrid case for owning both",
      "Price, space, and setup friction",
      "The honest recommendation",
    ],
    internalLinks: [
      { href: "/coaching", anchor: "indoor training coaching" },
      { href: "/tools/ftp-zones", anchor: "FTP zones" },
      { href: "/blog/trainerroad-vs-online-cycling-coach", anchor: "structured training compared" },
    ],
    wordTarget: 2100,
    featuredImage: "/images/cycling/post-ride-rest-wall.jpg",
  },

  {
    slug: "zone-2-vs-endurance-training",
    title: "Zone 2 vs Endurance Training: What's Actually the Difference?",
    seoTitle: "Zone 2 vs Endurance Training: The Honest 2026 Breakdown",
    seoDescription:
      "Zone 2 and endurance training aren't the same thing, despite the labels. Here's the physiological difference and why it matters for your plan.",
    excerpt:
      "Zone 2 and endurance training get used interchangeably $€” they're not the same thing. Here's the physiological difference and why it matters for how you plan your week.",
    targetKeyword: "zone 2 vs endurance",
    supportingKeywords: [
      "zone 2 cycling",
      "endurance pace cycling",
      "aerobic threshold vs zone 2",
      "easy rides cycling",
    ],
    angle:
      "Cuts through the terminology confusion by anchoring zone 2 to LT1 (not HR zone) and showing why the distinction changes how riders should ride easy days.",
    pillar: "coaching",
    requiredSections: [
      "Why the terms get used interchangeably",
      "What zone 2 actually means (LT1)",
      "What endurance pace means in practice",
      "The overlap $€” and where they diverge",
      "Why the distinction changes your week",
      "How to ride both correctly",
    ],
    internalLinks: [
      { href: "/tools/ftp-zones", anchor: "your power zones" },
      { href: "/coaching", anchor: "cycling coaching" },
      { href: "/blog/polarised-vs-sweet-spot-training", anchor: "polarised vs sweet spot" },
    ],
    wordTarget: 2300,
    featuredImage: "/images/cycling/gravel-road-climb-backup.jpg",
  },

  {
    slug: "aero-vs-weight-cyclist",
    title: "Aero vs Weight: Which Matters More for Your Cycling?",
    seoTitle: "Aero vs Weight: Which Wins for Cyclists in 2026?",
    seoDescription:
      "Aero beats weight on most courses $€” but not all of them, and not at all speeds. Here's the honest breakdown of where each actually matters.",
    excerpt:
      "Aero beats weight on most courses $€” but not all of them, and not at all speeds. Here's the honest breakdown of when each actually matters.",
    targetKeyword: "aero vs weight cycling",
    supportingKeywords: [
      "lightweight vs aero bike",
      "aero vs weight climbing",
      "cycling aerodynamics vs weight",
      "climber vs all-rounder bike",
    ],
    angle:
      "Course-profile and speed-specific framework $€” aero wins above 25 km/h on rolling courses, weight wins on steep climbs, both are second-order to the engine.",
    pillar: "community",
    requiredSections: [
      "The physics in one paragraph",
      "Where aero wins",
      "Where weight wins",
      "The crossover point by gradient and speed",
      "Real watts: the difference on a 100km course",
      "Where to actually spend money in 2026",
    ],
    internalLinks: [
      { href: "/coaching", anchor: "cycling coaching" },
      { href: "/tools/race-weight", anchor: "race-weight calculator" },
      { href: "/podcast", anchor: "the podcast" },
    ],
    wordTarget: 2200,
    featuredImage: "/images/cycling/gravel-canyon-rest.jpg",
  },

  {
    slug: "steady-state-vs-interval-training-cycling",
    title: "Steady State vs Interval Training: Which Builds More Cycling Fitness?",
    seoTitle: "Steady State vs Interval Training: The 2026 Comparison for Cyclists",
    seoDescription:
      "Steady-state work and intervals train different systems $€” both matter, the mix matters more. Here's how elite riders balance them.",
    excerpt:
      "Steady-state work and intervals train different systems. Both matter, the mix matters more. Here's how elite riders balance them $€” and what amateurs get wrong.",
    targetKeyword: "steady state vs interval training",
    supportingKeywords: [
      "intervals vs steady state cycling",
      "continuous vs interval training",
      "endurance vs intensity",
      "training intensity distribution",
    ],
    angle:
      "Framework anchored to training-intensity distribution (80/20, polarised) showing neither approach wins alone $€” the ratio decides the outcome.",
    pillar: "coaching",
    requiredSections: [
      "The two training stimuli, explained simply",
      "What steady-state actually builds",
      "What intervals actually build",
      "The mix that elite riders use",
      "The mix that amateur riders accidentally use",
      "How to structure your week for both",
    ],
    internalLinks: [
      { href: "/coaching", anchor: "structured coaching" },
      { href: "/tools/ftp-zones", anchor: "your power zones" },
      { href: "/blog/polarised-vs-sweet-spot-training", anchor: "polarised vs sweet spot" },
    ],
    wordTarget: 2400,
    featuredImage: "/images/cycling/gravel-roadside-break.jpg",
  },

  {
    slug: "fasted-vs-fueled-cycling",
    title: "Fasted vs Fuelled Training: Does Training Low Actually Work?",
    seoTitle: "Fasted vs Fuelled Cycling: The Honest 2026 Comparison",
    seoDescription:
      "Fasted rides and 'train low' protocols have solid science, and equally solid pitfalls. Here's when fasted training helps $€” and when it wrecks your week.",
    excerpt:
      "Fasted riding has a real physiological basis, but it's also the single most common self-inflicted wound in amateur training. Here's when it works and when it doesn't.",
    targetKeyword: "fasted vs fueled cycling",
    supportingKeywords: [
      "fasted training cycling",
      "train low cycling",
      "cycling fasted rides",
      "fasted cardio vs fueled",
    ],
    angle:
      "Nuanced take on the train-low protocol $€” endorses fasted work in specific intensity/duration windows, flags the weekly-load risk, anchors to current sports-nutrition consensus (Jeukendrup, Louise Burke).",
    pillar: "nutrition",
    requiredSections: [
      "The physiology $€” why training low can help",
      "What the research actually supports",
      "The dose: intensity, duration, frequency",
      "The trap: RED-S and recovery debt",
      "Who should fast-train and who shouldn't",
      "Practical protocol for 2026",
    ],
    internalLinks: [
      { href: "/tools/energy-availability", anchor: "energy availability calculator" },
      { href: "/tools/fuelling", anchor: "in-ride fuelling calculator" },
      { href: "/coaching", anchor: "cycling coaching" },
    ],
    wordTarget: 2400,
    featuredImage: "/images/cycling/post-ride-cokes.jpg",
  },
];
