import { type ContentPillar } from "@/types";

export interface ProblemPage {
  slug: string;
  title: string;
  seoTitle: string;
  seoDescription: string;
  pillar: ContentPillar;
  problem: string;
  causes: string[];
  solutions: { title: string; description: string; href: string }[];
  toolHref?: string;
  toolLabel?: string;
}

export const PROBLEM_PAGES: ProblemPage[] = [
  {
    slug: "not-getting-faster",
    title: "Why Am I Not Getting Faster at Cycling?",
    seoTitle: "Why Am I Not Getting Faster Cycling?",
    seoDescription: "Stuck at the same speed? The 6 most common reasons cyclists stop improving — and the fix for each one.",
    pillar: "coaching",
    problem: "You're training consistently but your FTP hasn't moved in months. Group rides feel the same. Race results are stagnant. You're working hard — maybe harder than ever — and nothing changes.",
    causes: [
      "No structured plan — riding hard without intention",
      "Too much time in the grey zone (Zone 3) — not easy enough or hard enough",
      "Insufficient recovery — stacking fatigue without adaptation",
      "Nutrition misalignment — under-fuelling hard sessions",
      "No periodisation — same training month after month",
      "Training alone without accountability or external review",
    ],
    solutions: [
      { title: "Get structured", description: "Follow a plan with clear intensity targets", href: "/blog/how-to-get-faster-cycling" },
      { title: "Fix your zones", description: "Calculate your FTP zones and stick to them", href: "/tools/ftp-zones" },
      { title: "Check your fuelling", description: "Match carbs to training demands", href: "/tools/fuelling" },
      { title: "Take a coaching assessment", description: "Find out if coaching would accelerate your goals", href: "/assessment" },
    ],
    toolHref: "/assessment",
    toolLabel: "Take the free assessment",
  },
  {
    slug: "stuck-on-plateau",
    title: "Cycling FTP Plateau — How to Break Through",
    seoTitle: "Stuck on a Cycling Plateau? How to Break Through",
    seoDescription: "FTP plateaued? The most common reasons cyclists get stuck — and the structured approach that breaks through.",
    pillar: "coaching",
    problem: "Your FTP has flatlined. You've been at the same number for 6 months, maybe longer. You train regularly, you eat reasonably well, you sleep — but the needle won't move.",
    causes: [
      "You've exhausted the easy gains from unstructured training",
      "Your training lacks periodisation — no base, build, peak cycle",
      "You're under-recovering between hard sessions",
      "Your aerobic base is too shallow for the intensity you're adding",
      "You haven't changed your approach in over a year",
    ],
    solutions: [
      { title: "Build the base first", description: "Zone 2 volume before intensity", href: "/blog/zone-2-training-complete-guide" },
      { title: "Periodise properly", description: "Structure training into phases", href: "/blog/how-to-periodise-cycling-season" },
      { title: "Try the plateau diagnostic", description: "4-minute quiz identifies your specific blocker", href: "/plateau" },
      { title: "Get coached", description: "A coach identifies what you can't see in your own data", href: "/apply" },
    ],
    toolHref: "/plateau",
    toolLabel: "Take the plateau diagnostic",
  },
  {
    slug: "coming-back-after-break",
    title: "Coming Back to Cycling After Time Off",
    seoTitle: "Getting Back Into Cycling After a Break",
    seoDescription: "Returning to cycling after time off? How to rebuild fitness safely, set realistic expectations, and avoid the mistakes that cause injuries.",
    pillar: "coaching",
    problem: "You used to ride. Life happened — injury, work, family, motivation loss. Now you want to get back. But your legs don't work like they used to, and you're not sure where to start.",
    causes: [
      "Fitness loss is real — expect 50-80% of detraining after 3+ months off",
      "Muscle memory helps but doesn't replace structured rebuilding",
      "The biggest risk is doing too much too soon",
      "Mental fitness matters — riding with people faster than your current level hurts motivation",
    ],
    solutions: [
      { title: "Start with 3 rides per week", description: "Consistency before intensity", href: "/blog/comeback-cyclist-12-week-return-plan" },
      { title: "Set a 12-week target", description: "Structured comeback plan", href: "/blog/comeback-cyclist-12-week-return-plan" },
      { title: "Get your zones right", description: "Test and recalculate from current fitness", href: "/tools/ftp-zones" },
      { title: "Consider coaching", description: "A coach manages the rebuild so you don't overdo it", href: "/you/comeback" },
    ],
    toolHref: "/tools/ftp-zones",
    toolLabel: "Recalculate your zones",
  },
  {
    slug: "losing-power-after-40",
    title: "Losing Power After 40 — What to Do About It",
    seoTitle: "Losing Cycling Power After 40? Here's What to Do",
    seoDescription: "Power declining after 40? It's not inevitable. The evidence-based approach to maintaining and even gaining FTP as a masters cyclist.",
    pillar: "coaching",
    problem: "You're over 40. Your FTP has dropped. Recovery takes longer. The riders who used to sit on your wheel are now riding away from you. You're wondering if this is just age or if something can be done.",
    causes: [
      "Muscle mass declines ~8% per decade after 40 without resistance training",
      "Recovery capacity decreases — same load, more fatigue",
      "VO2max declines ~5% per decade in trained athletes (less than the ~10% for sedentary)",
      "Most masters cyclists train exactly like they did at 30, which no longer works",
    ],
    solutions: [
      { title: "Add strength training", description: "Heavy S&C 2x/week is non-negotiable after 40", href: "/blog/new-study-confirms-heavy-strength-training-beats-more-miles-after-40" },
      { title: "Masters-specific coaching", description: "Training that accounts for recovery changes", href: "/blog/best-cycling-coach-masters-riders" },
      { title: "Adjust recovery", description: "More recovery days, better sleep, nutrition timing", href: "/blog/masters-cyclist-guide-getting-faster-after-40" },
      { title: "Get coached", description: "Masters riders benefit most from coaching", href: "/apply" },
    ],
    toolHref: "/assessment",
    toolLabel: "Take the coaching assessment",
  },
];

export function getProblemBySlug(slug: string): ProblemPage | null {
  return PROBLEM_PAGES.find((p) => p.slug === slug) ?? null;
}

export function getAllProblemSlugs(): string[] {
  return PROBLEM_PAGES.map((p) => p.slug);
}
