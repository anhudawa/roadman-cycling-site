/**
 * Specs for the 12-article coaching cluster that supports the `/coaching`
 * pillar page.
 *
 * Each article targets a distinct commercial or informational query in the
 * general cycling-coaching cluster. Together they provide the internal
 * link equity and topical depth `/coaching` needs to rank for
 * "online cycling coach", "cycling coaching", and supporting terms.
 *
 * Source: SEO Domination Playbook $§6.2 $†’ "Coaching Cluster (12)"
 */

import type { ClusterArticleSpec } from "./triathlon-cluster-articles";

export const COACHING_CLUSTER_ARTICLES: ClusterArticleSpec[] = [
  {
    slug: "how-much-does-online-cycling-coach-cost-2026",
    title: "How Much Does an Online Cycling Coach Cost in 2026?",
    seoTitle:
      "How Much Does an Online Cycling Coach Cost in 2026? (Real Numbers)",
    seoDescription:
      "Real pricing for online cycling coaching in 2026 $€” from app-based plans to bespoke 1:1. What you pay for at each tier and where the value actually sits.",
    excerpt:
      "Online cycling coaching ranges from $30 to $600+ per month. Here's what each tier actually delivers, where the value inflection points are, and how to pick the right level for your goals.",
    targetKeyword: "online cycling coach cost",
    supportingKeywords: [
      "cycling coach pricing",
      "how much is a cycling coach",
      "cycling coaching price",
      "online cycling coaching cost",
    ],
    angle:
      "Honest pricing breakdown across tiers (app, group, bespoke). Names real price ranges and explains what changes at each step.",
    pillar: "coaching",
    requiredSections: [
      "The four pricing tiers of online cycling coaching",
      "Tier 1: Training apps ($15-50/month)",
      "Tier 2: Group coaching programmes ($100-200/month)",
      "Tier 3: 1:1 personalised coaching ($150-400/month)",
      "Tier 4: Elite bespoke coaching ($400-800+/month)",
      "Where the value actually sits",
      "How to match your goals to a tier",
    ],
    internalLinks: [
      { href: "/coaching", anchor: "our cycling coaching" },
      { href: "/apply", anchor: "coaching application" },
      { href: "/community/not-done-yet", anchor: "Not Done Yet community" },
    ],
    wordTarget: 1500,
    featuredImage: "/images/cycling/gravel-canyon-rest.jpg",
  },

  {
    slug: "is-a-cycling-coach-worth-it-case-study",
    title: "Is a Cycling Coach Worth It? A Cat-3 to Cat-1 Case Study",
    seoTitle:
      "Is a Cycling Coach Worth It? A Cat-3 to Cat-1 Case Study (2026)",
    seoDescription:
      "Is a cycling coach worth the money? A full case study of one rider's Cat-3 to Cat-1 progression with coaching $€” what changed, what it cost, and when coaching pays off.",
    excerpt:
      "One rider. One season. Cat-3 to Cat-1. Here's the full picture of what coaching added $€” training structure, accountability, and specific adaptations $€” and when the investment pays back.",
    targetKeyword: "is a cycling coach worth it",
    supportingKeywords: [
      "cycling coach worth it",
      "cycling coaching roi",
      "hire cycling coach",
      "cycling coach results",
    ],
    angle:
      "Narrative case study grounded in a real progression (Daniel Stone, Cat-3 to Cat-1). Answers the value question with evidence, not claims.",
    pillar: "coaching",
    requiredSections: [
      "The honest question: when is coaching worth it?",
      "The starting point: stuck at Cat-3",
      "What coaching added that self-coaching couldn't",
      "The numbers: FTP, training hours, racing performance",
      "The cost side: what it took to make it work",
      "Signs coaching will pay back for you",
      "Signs you should wait",
    ],
    internalLinks: [
      { href: "/coaching", anchor: "our coaching" },
      {
        href: "/blog/best-online-cycling-coach-how-to-choose",
        anchor: "how to choose a cycling coach",
      },
      { href: "/apply", anchor: "apply for coaching" },
    ],
    wordTarget: 1800,
    featuredImage: "/images/cycling/gravel-road-climb.jpg",
  },

  {
    slug: "polarised-vs-sweet-spot-training",
    title: "Polarised vs Sweet Spot Training: What the Science Actually Says",
    seoTitle:
      "Polarised vs Sweet Spot Training: What the Science Actually Says",
    seoDescription:
      "Polarised or sweet spot? The actual research, what each method does to your physiology, and which one fits your schedule, fitness level, and goals.",
    excerpt:
      "Two methods. Two camps. Endless forum arguments. Here's what the research actually shows $€” and how to pick the one that fits your life, your volume, and your goals.",
    targetKeyword: "polarised vs sweet spot training",
    supportingKeywords: [
      "polarised training cycling",
      "sweet spot training",
      "80/20 training",
      "cycling training intensity",
    ],
    angle:
      "Evidence-based comparison grounded in Prof. Seiler's research and Dr. Coggan's published work. Names the specific studies and what they actually concluded.",
    pillar: "coaching",
    requiredSections: [
      "The two training philosophies in one paragraph each",
      "What Prof. Seiler's polarised research actually found",
      "What sweet spot training actually does",
      "The time-crunched cyclist problem",
      "Which method works for your situation",
      "How to combine both without wrecking yourself",
    ],
    internalLinks: [
      { href: "/tools/ftp-zones", anchor: "FTP zones calculator" },
      { href: "/coaching", anchor: "our coaching" },
      { href: "/podcast", anchor: "the podcast" },
    ],
    wordTarget: 2200,
    featuredImage: "/images/cycling/gravel-desert-road-epic.jpg",
  },

  {
    slug: "trainerroad-vs-online-cycling-coach",
    title: "TrainerRoad vs Online Cycling Coach: Which Is Right for You?",
    seoTitle: "TrainerRoad vs Online Cycling Coach: Which Is Right for You?",
    seoDescription:
      "TrainerRoad or a real coach? What the app does well, what it can't do, and when paying for 1:1 coaching is worth it $€” from someone who respects both.",
    excerpt:
      "TrainerRoad is a great product. An online coach is a different product. Here's when the $20/month app is enough, and when the $200/month human becomes essential.",
    targetKeyword: "trainerroad vs cycling coach",
    supportingKeywords: [
      "trainerroad alternative",
      "trainerroad vs coach",
      "cycling app vs coach",
      "cycling training software",
    ],
    angle:
      "Fair comparison that credits what TrainerRoad does well instead of trashing it. Focuses on the adjustment-and-context gap a human coach fills.",
    pillar: "coaching",
    requiredSections: [
      "What TrainerRoad actually does well",
      "The three things TrainerRoad can't do",
      "When the app is enough",
      "When you need a human coach",
      "The combined approach that works",
      "Pricing vs outcomes at each level",
    ],
    internalLinks: [
      { href: "/coaching", anchor: "our cycling coaching" },
      { href: "/tools/ftp-zones", anchor: "FTP zones" },
      { href: "/apply", anchor: "apply for coaching" },
    ],
    wordTarget: 1700,
    featuredImage: "/images/cycling/gravel-rest-stop.jpg",
  },

  {
    slug: "time-crunched-cyclist-8-hours-week",
    title: "The Time-Crunched Cyclist: How to Train on 8 Hours a Week",
    seoTitle: "The Time-Crunched Cyclist: How to Train on 8 Hours a Week",
    seoDescription:
      "Eight hours a week is enough for serious cycling progress $€” if you structure it right. Here's the weekly template, the intensity distribution, and the sessions that actually move the needle.",
    excerpt:
      "Eight hours a week. Full-time job. Family. Real life. Here's how to structure those hours so you keep improving $€” and where the time-crunched cyclist usually wastes them.",
    targetKeyword: "time crunched cyclist training",
    supportingKeywords: [
      "8 hours a week cycling",
      "limited time cycling training",
      "busy cyclist training plan",
      "cycling training 6 hours",
    ],
    angle:
      "Concrete weekly template, not generic advice. Names the sessions, the order, and what to cut when the week goes wrong.",
    pillar: "coaching",
    requiredSections: [
      "The 8-hour rule: why it's enough",
      "The weekly template (hour by hour)",
      "The three sessions that matter most",
      "What to cut when life gets in the way",
      "Common time-crunched mistakes",
      "How to add one more hour when you find it",
    ],
    internalLinks: [
      { href: "/coaching", anchor: "our coaching" },
      { href: "/tools/ftp-zones", anchor: "FTP zones calculator" },
      { href: "/community/not-done-yet", anchor: "Not Done Yet community" },
    ],
    wordTarget: 2000,
    featuredImage: "/images/cycling/gravel-canyon-wide.jpg",
  },

  {
    slug: "gran-fondo-training-plan-12-weeks",
    title: "Cycling Training Plan for Gran Fondo: 12-Week Build",
    seoTitle: "Gran Fondo Training Plan: 12-Week Build (2026)",
    seoDescription:
      "A 12-week gran fondo training plan built around your ride distance, elevation, and available hours. Weekly structure, key sessions, and pacing guidance.",
    excerpt:
      "Twelve weeks. One goal: finish strong on gran fondo day, not empty. Here's the week-by-week build that gets you ready for 100-180km events without wrecking your life.",
    targetKeyword: "gran fondo training plan",
    supportingKeywords: [
      "gran fondo training",
      "100 mile bike ride training",
      "sportive training plan",
      "cycling event training",
    ],
    angle:
      "Practical 12-week build that accounts for typical gran fondo profiles (rolling to mountainous). Explicit about pacing and nutrition, not just training.",
    pillar: "coaching",
    requiredSections: [
      "What a gran fondo actually demands of you",
      "Phase 1: Aerobic base (weeks 1-4)",
      "Phase 2: Sustained power (weeks 5-8)",
      "Phase 3: Event-specific sharpening (weeks 9-12)",
      "Key weekly sessions",
      "Event-day pacing and fuelling",
    ],
    internalLinks: [
      { href: "/coaching", anchor: "our cycling coaching" },
      { href: "/tools/ftp-zones", anchor: "FTP zones" },
      { href: "/tools/fuelling", anchor: "fuelling calculator" },
    ],
    wordTarget: 2400,
    featuredImage: "/images/cycling/gravel-road-climb-2.jpg",
  },

  {
    slug: "how-to-periodise-cycling-season",
    title: "How to Periodise a Cycling Season (Pro Template Inside)",
    seoTitle: "How to Periodise a Cycling Season (Pro Template Inside)",
    seoDescription:
      "The real structure behind a periodised cycling season $€” base, build, peak, taper $€” with a pro-grade annual template you can adapt to your calendar.",
    excerpt:
      "Periodisation isn't arbitrary. Here's the annual structure pro teams use, why each phase exists, and how to build a year around your priority events $€” without overcomplicating it.",
    targetKeyword: "cycling periodisation",
    supportingKeywords: [
      "cycling training periodisation",
      "annual cycling plan",
      "periodised cycling training",
      "cycling season structure",
    ],
    angle:
      "Template-first article. Shows the pro-grade annual structure and explains each block. Cites Joe Friel framework and current World Tour approaches.",
    pillar: "coaching",
    requiredSections: [
      "What periodisation actually is",
      "The four phases in a pro annual plan",
      "Block periodisation vs. traditional periodisation",
      "How to build your year around two priority events",
      "Common periodisation mistakes",
      "A pro-grade annual template",
    ],
    internalLinks: [
      { href: "/coaching", anchor: "our coaching" },
      { href: "/tools/ftp-zones", anchor: "FTP zones calculator" },
      {
        href: "/blog/polarised-vs-sweet-spot-training",
        anchor: "polarised vs sweet spot",
      },
    ],
    wordTarget: 2500,
    featuredImage: "/images/cycling/gravel-riding-canyon.jpg",
  },

  {
    slug: "cycling-coach-near-me-why-location-doesnt-matter-2026",
    title: "Cycling Coach Near Me: Why Location Doesn't Matter Anymore",
    seoTitle: "Cycling Coach Near Me: Why Location Doesn't Matter Anymore",
    seoDescription:
      "Why the 'cycling coach near me' search is the wrong question in 2026 $€” and what actually matters when picking a coach who can help you improve.",
    excerpt:
      "In 2026, the best cycling coach for you probably isn't in your city. Here's why the 'near me' search is the wrong frame, and what you should optimise for instead.",
    targetKeyword: "cycling coach near me",
    supportingKeywords: [
      "find a cycling coach",
      "local cycling coach",
      "online cycling coach",
      "cycling coach recommendation",
    ],
    angle:
      "Reframes the 'near me' search as the wrong question. Points at what actually matters (methodology, communication, track record).",
    pillar: "coaching",
    requiredSections: [
      "Why 'near me' is the wrong question in 2026",
      "What location actually matters for",
      "What it never mattered for",
      "The five things that actually matter",
      "How to evaluate an online coach",
      "When a local coach still makes sense",
    ],
    internalLinks: [
      { href: "/coaching", anchor: "our online cycling coaching" },
      { href: "/coaching/dublin", anchor: "Dublin" },
      { href: "/coaching/london", anchor: "London" },
      {
        href: "/blog/best-online-cycling-coach-how-to-choose",
        anchor: "how to choose an online coach",
      },
    ],
    wordTarget: 1400,
    featuredImage: "/images/cycling/gravel-roadside-break.jpg",
  },

  {
    slug: "masters-cyclist-guide-getting-faster-after-40",
    title: "The Masters Cyclist's Guide to Getting Faster After 40",
    seoTitle: "The Masters Cyclist's Guide to Getting Faster After 40 (2026)",
    seoDescription:
      "What actually changes physiologically after 40, how to train smarter to still improve, and the three mistakes masters cyclists make that kill their progress.",
    excerpt:
      "You can still get faster after 40. The evidence is clear. But the training that worked when you were 30 will break you now $€” here's what changes and what to do instead.",
    targetKeyword: "masters cyclist training",
    supportingKeywords: [
      "cycling over 40",
      "masters cycling training",
      "getting faster cycling after 40",
      "older cyclist training",
    ],
    angle:
      "Physiologically honest about what changes after 40, but optimistic about what's possible. Grounded in masters-specific research.",
    pillar: "coaching",
    requiredSections: [
      "What actually changes after 40",
      "What doesn't change (and why that matters)",
      "The three masters training mistakes",
      "Recovery as the new non-negotiable",
      "Strength training for the masters cyclist",
      "A weekly template for the masters athlete",
    ],
    internalLinks: [
      { href: "/coaching", anchor: "our coaching" },
      { href: "/strength-training", anchor: "strength training for cyclists" },
      { href: "/tools/ftp-zones", anchor: "FTP zones" },
    ],
    wordTarget: 2200,
    featuredImage: "/images/cycling/post-ride-rest-wall.jpg",
  },

  {
    slug: "comeback-cyclist-12-week-return-plan",
    title: "Cycling Training Plans for the Comeback Rider",
    seoTitle:
      "Cycling Training Plans for the Comeback Rider (12-Week Return)",
    seoDescription:
      "Returning to cycling after a break? A 12-week structured comeback plan that rebuilds fitness without the injury and motivation crashes most comeback riders hit.",
    excerpt:
      "Six months off. A year off. Longer. Here's the 12-week structure that rebuilds cycling fitness from a realistic starting point $€” without the blown ITB and lost motivation most comeback riders hit at week four.",
    targetKeyword: "comeback cycling training plan",
    supportingKeywords: [
      "return to cycling training",
      "cycling after break",
      "rebuild cycling fitness",
      "comeback cyclist",
    ],
    angle:
      "Empathetic but structured. Honest about the physical and psychological traps of comebacks. Explicit weekly progression.",
    pillar: "coaching",
    requiredSections: [
      "Why comeback plans usually fail",
      "Phase 1: Reactivation (weeks 1-4)",
      "Phase 2: Foundation (weeks 5-8)",
      "Phase 3: Fitness (weeks 9-12)",
      "The motivation problem and how to handle it",
      "When to add intensity back",
    ],
    internalLinks: [
      { href: "/coaching", anchor: "our cycling coaching" },
      { href: "/community/clubhouse", anchor: "Roadman Clubhouse" },
    ],
    wordTarget: 1800,
    featuredImage: "/images/cycling/post-ride-cokes.jpg",
  },

  {
    slug: "how-to-structure-cycling-training-plan",
    title: "How to Structure a Cycling Training Plan (Coach's Framework)",
    seoTitle:
      "How to Structure a Cycling Training Plan (Coach's Framework, 2026)",
    seoDescription:
      "The coach's framework for structuring any cycling training plan $€” from beginner to masters to racing. Principles first, then the template.",
    excerpt:
      "Every good cycling training plan follows the same five principles. Miss any of them and the plan breaks. Here's the framework coaches use, with the template you can adapt to any rider.",
    targetKeyword: "how to structure cycling training plan",
    supportingKeywords: [
      "cycling training plan structure",
      "build cycling training plan",
      "cycling training framework",
      "cycling plan template",
    ],
    angle:
      "Principles-first pillar article. Teaches the reader to think like a coach rather than handing them a plan.",
    pillar: "coaching",
    requiredSections: [
      "The five principles every cycling plan follows",
      "Principle 1: Progressive overload",
      "Principle 2: Specificity",
      "Principle 3: Recovery",
      "Principle 4: Intensity distribution",
      "Principle 5: Individualisation",
      "Putting it together: a weekly template",
    ],
    internalLinks: [
      { href: "/coaching", anchor: "our coaching" },
      { href: "/tools/ftp-zones", anchor: "FTP zones" },
      {
        href: "/blog/polarised-vs-sweet-spot-training",
        anchor: "polarised vs sweet spot",
      },
    ],
    wordTarget: 2500,
    featuredImage: "/images/cycling/gravel-canyon-rest.jpg",
  },

  {
    slug: "power-meter-training-plan-week-by-week",
    title: "Power Meter Training Plan: A Week-by-Week Guide",
    seoTitle:
      "Power Meter Training Plan: A Week-by-Week Guide for Cyclists (2026)",
    seoDescription:
      "A week-by-week power meter training plan that teaches you how to actually use watts for training decisions $€” zones, targets, TSS, and recovery.",
    excerpt:
      "You have a power meter. Great. Now what? Here's the week-by-week plan that teaches you to train by watts $€” zones, session targets, TSS management, and the mistakes new power-meter owners always make.",
    targetKeyword: "power meter training plan",
    supportingKeywords: [
      "cycling power meter training",
      "training with power meter",
      "watts training plan",
      "power based training",
    ],
    angle:
      "Teaches the reader to USE the power meter they bought, not just look at it. Week-by-week, session-by-session.",
    pillar: "coaching",
    requiredSections: [
      "What a power meter does that heart rate can't",
      "Step 1: Establish your FTP honestly",
      "Step 2: Learn your zones (and what each one trains)",
      "Step 3: The 8-week progression plan",
      "Step 4: Reading TSS and recovery",
      "Common power-meter-owner mistakes",
    ],
    internalLinks: [
      { href: "/tools/ftp-zones", anchor: "FTP zones calculator" },
      { href: "/coaching", anchor: "our coaching" },
    ],
    wordTarget: 2000,
    featuredImage: "/images/cycling/gravel-road-climb.jpg",
  },
];
