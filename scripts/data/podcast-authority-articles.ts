/**
 * Specs for the 11-article podcast authority cluster that supports the
 * `/podcast` pillar page and Roadman Cycling's positioning as "the cycling
 * podcast that's actually worth listening to."
 *
 * Mix of:
 *   - Listicles (best cycling podcasts X, best podcast for Y persona)
 *   - Comparisons (Roadman vs Fast Talk vs The Cycling Podcast)
 *   - Guest-compilation pages (every episode with Seiler / Lorang)
 *   - Persona pages (podcasts for cyclists over 40, for indoor training)
 *
 * Source: SEO Domination Playbook §6.2 → "Podcast / Authority Cluster (11)"
 */

import type { ClusterArticleSpec } from "./triathlon-cluster-articles";

export const PODCAST_AUTHORITY_ARTICLES: ClusterArticleSpec[] = [
  {
    slug: "best-cycling-podcasts-2026",
    title: "The 20 Best Cycling Podcasts for 2026",
    seoTitle: "The 20 Best Cycling Podcasts for 2026 (Ranked & Reviewed)",
    seoDescription:
      "Twenty cycling podcasts worth your commute in 2026 — from training deep-dives to pro-racing analysis. Who each show is for, what they do well, and what they skip.",
    excerpt:
      "The cycling podcast landscape is crowded. Here are the 20 shows that actually move the needle in 2026 — organised by what you'd want to listen for.",
    targetKeyword: "best cycling podcasts 2026",
    supportingKeywords: [
      "best cycling podcasts",
      "top cycling podcasts",
      "cycling podcast recommendations",
      "cycling podcasts to listen to",
    ],
    angle:
      "Honest listicle that acknowledges competitors and categorises by listener need, not just ranks. Roadman is ONE entry, not the headliner.",
    pillar: "coaching",
    requiredSections: [
      "How we evaluated the 20",
      "Best for training science",
      "Best for pro-racing coverage",
      "Best for gravel and adventure",
      "Best for short-form daily updates",
      "Best for long-form interviews",
      "Best for triathletes",
      "The full ranked list",
    ],
    internalLinks: [
      { href: "/podcast", anchor: "The Roadman Cycling Podcast" },
      { href: "/guests", anchor: "our guest archive" },
    ],
    wordTarget: 2200,
    featuredImage: "/images/cycling/gravel-canyon-wide.jpg",
  },

  {
    slug: "best-indoor-cycling-podcasts-winter",
    title: "Best Indoor Cycling Podcasts to Survive the Winter",
    seoTitle: "Best Indoor Cycling Podcasts to Survive the Winter (2026)",
    seoDescription:
      "The cycling podcasts that make indoor training tolerable — two-hour episodes with enough substance to justify the trainer time.",
    excerpt:
      "Indoor training hurts less with the right podcast. Here are the cycling shows built for long turbo sessions — with episode length, pacing, and substance in mind.",
    targetKeyword: "best indoor cycling podcasts",
    supportingKeywords: [
      "cycling podcasts for turbo",
      "indoor training podcasts",
      "cycling trainer podcasts",
      "long form cycling podcasts",
    ],
    angle:
      "Indoor-specific angle: episode length, pacing, and whether you can still pay attention while hitting intervals. Not generic 'best podcasts'.",
    pillar: "coaching",
    requiredSections: [
      "Why the right podcast matters on the turbo",
      "Long-form training deep-dives (90min+)",
      "Pro-racing analysis for the rest periods",
      "Short-form for the warm-up",
      "Our own winter-training episodes worth revisiting",
    ],
    internalLinks: [
      { href: "/podcast", anchor: "The Roadman Cycling Podcast" },
      { href: "/coaching", anchor: "our coaching programme" },
    ],
    wordTarget: 1400,
    featuredImage: "/images/cycling/gravel-roadside-break.jpg",
  },

  {
    slug: "best-cycling-training-podcasts-age-groupers",
    title: "Best Cycling Training Podcasts for Age-Groupers",
    seoTitle: "Best Cycling Training Podcasts for Age-Groupers (2026)",
    seoDescription:
      "The cycling podcasts that actually help age-group cyclists get faster — training science, realistic methodology, and what applies to riders with jobs and families.",
    excerpt:
      "Most cycling training podcasts are aimed at pros or total beginners. Here are the shows that actually speak to the age-grouper balancing real life with real progression.",
    targetKeyword: "cycling training podcasts",
    supportingKeywords: [
      "best cycling training podcast",
      "cycling performance podcast",
      "endurance training podcasts",
      "cycling coaching podcasts",
    ],
    angle:
      "Age-grouper-specific. Filters out pro-only content and beginner-focused shows. Names specific episodes worth starting with.",
    pillar: "coaching",
    requiredSections: [
      "Why age-groupers need different cycling content",
      "The six podcasts that get the time-crunched cyclist",
      "Specific episodes worth starting with",
      "What to skip",
    ],
    internalLinks: [
      { href: "/podcast", anchor: "The Roadman Cycling Podcast" },
      { href: "/coaching", anchor: "our coaching programme" },
    ],
    wordTarget: 1600,
    featuredImage: "/images/cycling/gravel-canyon-rest.jpg",
  },

  {
    slug: "best-cycling-podcast-for-triathletes",
    title: "Best Cycling Podcast for Triathletes",
    seoTitle: "Best Cycling Podcast for Triathletes (2026 Guide)",
    seoDescription:
      "Cycling content that actually speaks to triathletes — bike-leg pacing, fuelling, and the training that protects your run. Which shows get it.",
    excerpt:
      "Most cycling podcasts don't know the bike is half your triathlon. Here are the shows — and specific episodes — that do.",
    targetKeyword: "cycling podcast for triathletes",
    supportingKeywords: [
      "best cycling podcast triathlon",
      "triathlete cycling podcast",
      "bike leg triathlon podcast",
      "cycling podcast half ironman",
    ],
    angle:
      "Natural tie-in to /coaching/triathletes pillar. Points at specific episodes worth listening to for triathletes specifically.",
    pillar: "coaching",
    requiredSections: [
      "Why most cycling podcasts miss triathletes",
      "The four podcasts that speak to the bike leg",
      "Specific episodes on pacing the 70.3 or Ironman bike",
      "Specific episodes on fuelling for the bike-run",
    ],
    internalLinks: [
      {
        href: "/coaching/triathletes",
        anchor: "triathlon bike coaching",
      },
      { href: "/podcast", anchor: "The Roadman Cycling Podcast" },
    ],
    wordTarget: 1400,
    featuredImage: "/images/cycling/gravel-road-climb-2.jpg",
  },

  {
    slug: "fast-talk-vs-cycling-podcast-vs-roadman",
    title: "Fast Talk vs The Cycling Podcast vs Roadman: Which One for You?",
    seoTitle:
      "Fast Talk vs The Cycling Podcast vs Roadman: Which One for You?",
    seoDescription:
      "A fair comparison of three of the biggest cycling podcasts — what each does best, which listener each is for, and why you might want to listen to all three.",
    excerpt:
      "Three of cycling's best podcasts. Three different missions. Here's the honest breakdown of what each does best — and when to reach for which.",
    targetKeyword: "fast talk vs the cycling podcast",
    supportingKeywords: [
      "cycling podcast comparison",
      "best cycling podcast comparison",
      "fast talk labs review",
      "cycling podcast review",
    ],
    angle:
      "Fair, non-promotional comparison. Credits what each show does best. Roadman is positioned alongside the competitors, not above.",
    pillar: "coaching",
    requiredSections: [
      "Three podcasts, three missions",
      "Fast Talk: the training-science deep dive",
      "The Cycling Podcast: the pro-racing chronicle",
      "Roadman: the coach-to-amateur bridge",
      "Which one is for which listener",
      "Why you might want all three",
    ],
    internalLinks: [
      { href: "/podcast", anchor: "The Roadman Cycling Podcast" },
      { href: "/about", anchor: "about the show" },
    ],
    wordTarget: 1800,
    featuredImage: "/images/cycling/gravel-desert-road-epic.jpg",
  },

  {
    slug: "every-roadman-episode-with-dan-lorang",
    title: "Every Episode of Roadman Podcast with Dan Lorang",
    seoTitle:
      "Every Episode of Roadman Podcast with Dan Lorang (Full Archive)",
    seoDescription:
      "Every Roadman Cycling Podcast appearance with Dan Lorang — Red Bull-Bora-Hansgrohe's performance lead and the coach behind Frodeno and Charles-Barclay.",
    excerpt:
      "Dan Lorang has been on Roadman more than any other World Tour coach. Here's every episode, what it covers, and why it matters for age-group training.",
    targetKeyword: "dan lorang podcast",
    supportingKeywords: [
      "dan lorang cycling",
      "red bull bora hansgrohe coach",
      "dan lorang triathlon",
      "dan lorang training",
    ],
    angle:
      "Authority compilation page. Real appearances with real episode slugs. Links to guest entity page + episode pages.",
    pillar: "coaching",
    requiredSections: [
      "Who Dan Lorang is",
      "Every Roadman episode, in order",
      "What he teaches that actually applies to amateurs",
      "The one episode to start with",
    ],
    internalLinks: [
      { href: "/guests/dan-lorang", anchor: "Dan Lorang's guest page" },
      { href: "/podcast", anchor: "the podcast archive" },
      { href: "/coaching", anchor: "our coaching programme" },
    ],
    wordTarget: 1200,
    featuredImage: "/images/cycling/gravel-riding-canyon.jpg",
  },

  {
    slug: "every-roadman-episode-with-stephen-seiler",
    title: "Every Episode with Prof. Stephen Seiler",
    seoTitle: "Every Roadman Episode with Prof. Stephen Seiler (Full Archive)",
    seoDescription:
      "Every Roadman Cycling Podcast appearance with Prof. Stephen Seiler — the exercise physiologist who coined polarised training. Full archive with episode summaries.",
    excerpt:
      "Prof. Seiler has shaped more endurance training in the last 20 years than almost anyone. Here's every Roadman appearance, with what to take from each.",
    targetKeyword: "stephen seiler podcast",
    supportingKeywords: [
      "stephen seiler cycling",
      "polarised training podcast",
      "seiler 80/20 podcast",
      "stephen seiler interviews",
    ],
    angle:
      "Authority compilation. Same structure as the Lorang one. Builds Prof. Seiler as an entity linked to Roadman's content.",
    pillar: "coaching",
    requiredSections: [
      "Who Prof. Stephen Seiler is",
      "Every Roadman episode, in order",
      "The polarised-training arc across episodes",
      "The one episode to start with",
    ],
    internalLinks: [
      {
        href: "/guests/stephen-seiler",
        anchor: "Prof. Stephen Seiler's guest page",
      },
      {
        href: "/blog/polarised-vs-sweet-spot-training",
        anchor: "polarised vs sweet spot training",
      },
      { href: "/podcast", anchor: "the podcast archive" },
    ],
    wordTarget: 1200,
    featuredImage: "/images/cycling/gravel-road-climb.jpg",
  },

  {
    slug: "podcasts-for-cyclists-over-40",
    title: "Podcasts for Cyclists Over 40: 10 Shows That Get It",
    seoTitle: "Podcasts for Cyclists Over 40: 10 Shows That Get It (2026)",
    seoDescription:
      "Cycling and endurance podcasts aimed at masters athletes — longevity, recovery, training around real life. The shows that understand the over-40 cyclist.",
    excerpt:
      "Most cycling content is aimed at 25-year-old racers. Here are the ten podcasts that actually speak to the masters cyclist — longevity, recovery, and the training that still works after 40.",
    targetKeyword: "cycling podcasts over 40",
    supportingKeywords: [
      "podcasts for masters cyclists",
      "cycling over 40 podcasts",
      "masters cyclist podcast",
      "endurance podcast older athletes",
    ],
    angle:
      "Persona-specific listicle. Ties naturally to the masters-cyclist cluster article + /coaching programme.",
    pillar: "coaching",
    requiredSections: [
      "What the over-40 cyclist needs from a podcast",
      "The ten shows worth the subscribe",
      "Specific episodes worth starting with",
      "What to skip",
    ],
    internalLinks: [
      { href: "/podcast", anchor: "The Roadman Cycling Podcast" },
      { href: "/coaching", anchor: "our coaching programme" },
    ],
    wordTarget: 1500,
    featuredImage: "/images/cycling/post-ride-rest-wall.jpg",
  },

  {
    slug: "cycling-podcasts-for-indoor-training",
    title: "Cycling Podcasts for Indoor Training",
    seoTitle: "Cycling Podcasts for Indoor Training (2026 Guide)",
    seoDescription:
      "The cycling podcasts that genuinely pair with indoor sessions — which shows work for intervals, which for Zone 2, and which to save for recovery rides.",
    excerpt:
      "Not every cycling podcast survives a threshold interval. Here's the match-up: which shows pair with which indoor session type.",
    targetKeyword: "cycling podcasts indoor training",
    supportingKeywords: [
      "cycling podcasts turbo",
      "indoor trainer podcasts",
      "cycling trainer podcast",
      "podcasts for cyclists indoor",
    ],
    angle:
      "Session-matched recommendation. Different from the 'best indoor podcasts' article — this is granular (Zone 2 vs intervals vs recovery).",
    pillar: "coaching",
    requiredSections: [
      "Podcasts for Zone 2 endurance rides",
      "Podcasts for high-intensity intervals (or rather: don't)",
      "Podcasts for recovery spins",
      "Podcasts for longer sweet-spot blocks",
    ],
    internalLinks: [
      { href: "/podcast", anchor: "The Roadman Cycling Podcast" },
      { href: "/tools/ftp-zones", anchor: "FTP zones calculator" },
    ],
    wordTarget: 1300,
    featuredImage: "/images/cycling/gravel-rest-stop.jpg",
  },

  {
    slug: "how-we-record-the-roadman-podcast",
    title: "How We Record the Roadman Podcast — Behind the Scenes",
    seoTitle:
      "How We Record the Roadman Cycling Podcast (Behind the Scenes, 2026)",
    seoDescription:
      "The gear, the workflow, and the editorial choices behind the Roadman Cycling Podcast — from 1-on-1 guest prep to multi-camera YouTube publishing.",
    excerpt:
      "The Roadman Cycling Podcast is a full-stack media operation now. Here's the gear, the workflow, the prep — and the editorial choices that shape every episode.",
    targetKeyword: "how to record cycling podcast",
    supportingKeywords: [
      "podcast production workflow",
      "cycling podcast production",
      "podcast recording setup",
      "youtube podcast production",
    ],
    angle:
      "Brand-transparency piece. Teaches process while humanising Anthony and the team. Useful for the 'aspiring podcaster who's a cyclist' audience.",
    pillar: "community",
    requiredSections: [
      "The gear in the studio",
      "The guest-booking workflow",
      "How we prep for a podcast interview",
      "What we cut and why",
      "The YouTube vs audio split",
    ],
    internalLinks: [
      { href: "/about", anchor: "about Anthony Walsh" },
      { href: "/podcast", anchor: "the podcast" },
      { href: "/about/press", anchor: "press & media kit" },
    ],
    wordTarget: 1200,
    featuredImage: "/images/cycling/post-ride-cokes.jpg",
  },

  {
    slug: "what-cycling-podcasts-got-wrong-about-polarised-training",
    title: "What Cycling Podcasts Got Wrong About Polarised Training",
    seoTitle:
      "What Cycling Podcasts Got Wrong About Polarised Training (And What Seiler Actually Said)",
    seoDescription:
      "Most cycling content simplifies polarised training into '80/20' and stops there. Here's the nuance Prof. Seiler keeps pointing out — and why it matters for your week.",
    excerpt:
      "The cycling internet has turned polarised training into a one-line prescription. Prof. Seiler has spent a decade pointing out what that misses — and it matters for how you train.",
    targetKeyword: "polarised training mistakes",
    supportingKeywords: [
      "polarised training misconceptions",
      "80/20 training wrong",
      "seiler polarised training",
      "polarised vs pyramidal",
    ],
    angle:
      "Linkbait opinion piece. Takes a stance, names names, credits Seiler's real positions. Potentially-shareable across cycling Reddit and training forums.",
    pillar: "coaching",
    requiredSections: [
      "The oversimplified version: '80/20 and done'",
      "What Prof. Seiler actually said",
      "Why the 80/20 rule is a description, not a prescription",
      "The three things the 80/20 frame leaves out",
      "How to structure a week that honours the research",
    ],
    internalLinks: [
      {
        href: "/guests/stephen-seiler",
        anchor: "Prof. Stephen Seiler's guest page",
      },
      {
        href: "/blog/polarised-vs-sweet-spot-training",
        anchor: "polarised vs sweet spot training",
      },
      { href: "/coaching", anchor: "our coaching" },
    ],
    wordTarget: 1800,
    featuredImage: "/images/cycling/gravel-desert-road-epic.jpg",
  },
];
