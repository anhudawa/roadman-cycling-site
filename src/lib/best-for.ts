import { type ContentPillar } from "@/types";

export interface BestForPage {
  slug: string;
  title: string;
  seoTitle: string;
  seoDescription: string;
  pillar: ContentPillar;
  intro: string;
  picks: {
    name: string;
    verdict: string;
    bestFor: string;
    href: string;
  }[];
  faq: { question: string; answer: string }[];
}

export const BEST_FOR_PAGES: BestForPage[] = [
  {
    slug: "best-cycling-training-apps",
    title: "Best Cycling Training Apps",
    seoTitle: "Best Cycling Training Apps for Structured Training",
    seoDescription: "The best cycling training apps compared. TrainerRoad, Zwift, TrainingPeaks, Rouvy — which one fits your goals? Honest picks by rider type.",
    pillar: "coaching",
    intro: "The right training app depends on what you need: structured plans, social motivation, analytics depth, or coach integration. Here are the best options for each use case.",
    picks: [
      { name: "TrainerRoad", verdict: "Best for self-coached structured training", bestFor: "Riders who want AI-adapted plans and don't need a virtual world", href: "/blog/zwift-vs-trainerroad" },
      { name: "Zwift", verdict: "Best for social indoor riding and motivation", bestFor: "Riders who need gamification to get on the trainer", href: "/blog/zwift-vs-trainerroad" },
      { name: "TrainingPeaks", verdict: "Best for working with a coach", bestFor: "Riders who have or want a human coach", href: "/compare/trainerroad-vs-trainingpeaks" },
      { name: "Rouvy", verdict: "Best for real-world route simulation", bestFor: "Riders who want to ride real courses indoors", href: "/blog/rouvy-vs-zwift" },
    ],
    faq: [
      { question: "Which cycling training app is best for beginners?", answer: "TrainerRoad or Zwift. Both offer structured plans with minimal setup. TrainerRoad is better for pure training; Zwift is better for motivation and social riding." },
      { question: "Do I need a training app if I have a coach?", answer: "You need TrainingPeaks (where your coach builds your plan) but not a second training app. Your coach replaces the algorithm." },
    ],
  },
  {
    slug: "best-power-meters-amateur-cyclists",
    title: "Best Power Meters for Amateur Cyclists",
    seoTitle: "Best Power Meters for Amateur Cyclists",
    seoDescription: "Best power meters for amateur cyclists in 2026. Pedal, crank, spider — compared by accuracy, portability, and value for the money.",
    pillar: "community",
    intro: "A power meter is the most impactful training tool you can buy after a bike that fits. Here are the best options for amateur cyclists by type and budget.",
    picks: [
      { name: "Favero Assioma Duo", verdict: "Best overall for most amateur cyclists", bestFor: "Riders with multiple bikes who want easy swapping", href: "/blog/cycling-power-meter-guide" },
      { name: "Stages Gen 3", verdict: "Best budget single-sided option", bestFor: "Budget-conscious riders who want power data now", href: "/blog/cycling-power-meter-guide" },
      { name: "Garmin Rally", verdict: "Best pedal-based for Garmin ecosystem", bestFor: "Riders already in the Garmin ecosystem (Edge + Connect)", href: "/compare/heart-rate-vs-power" },
      { name: "SRAM Quarq DZero", verdict: "Best spider-based for accuracy purists", bestFor: "Riders who want total power from a single chainring position", href: "/blog/cycling-power-meter-guide" },
    ],
    faq: [
      { question: "Is a single-sided power meter accurate enough?", answer: "For training, yes. Single-sided doubles one leg's reading. If your left-right balance is 48-52%, the error is minimal and consistency matters more than absolute accuracy." },
      { question: "Should I buy a power meter or smart trainer first?", answer: "If you ride mostly indoors, smart trainer. If you ride mostly outdoors, power meter. If 50/50, power meter — it works in both environments." },
    ],
  },
  {
    slug: "best-indoor-training-platforms",
    title: "Best Indoor Training Platforms for Road Cyclists",
    seoTitle: "Best Indoor Training Platforms for Road Cyclists",
    seoDescription: "Best indoor cycling platforms compared for road cyclists. Structured workouts, virtual riding, analytics — which platform delivers results?",
    pillar: "coaching",
    intro: "Indoor training platforms have transformed winter cycling. But they serve different purposes — structured training, social motivation, route simulation, or analytics. Pick the one that matches how you actually ride.",
    picks: [
      { name: "TrainerRoad", verdict: "Best for structured adaptive training", bestFor: "Self-coached riders who want AI-adjusted plans", href: "/blog/zwift-vs-trainerroad" },
      { name: "Zwift", verdict: "Best for social riding and racing", bestFor: "Riders who need external motivation to train indoors", href: "/blog/zwift-vs-trainerroad" },
      { name: "Rouvy", verdict: "Best for real-world AR routes", bestFor: "Riders who want to preview real event courses", href: "/blog/rouvy-vs-zwift" },
      { name: "TrainingPeaks + ERG", verdict: "Best for coached athletes", bestFor: "Riders with a human coach building their plan", href: "/compare/trainerroad-vs-trainingpeaks" },
    ],
    faq: [
      { question: "Can I use Zwift for structured training?", answer: "Yes — Zwift has structured workouts and training plans. But its adaptive training is less sophisticated than TrainerRoad's, and the gamification can pull you off plan." },
      { question: "Do I need a smart trainer for these platforms?", answer: "Strongly recommended. A smart trainer provides accurate power data and ERG mode (automatic resistance adjustment). Without one, you're guessing at intensity." },
    ],
  },
];

export function getBestForBySlug(slug: string): BestForPage | null {
  return BEST_FOR_PAGES.find((p) => p.slug === slug) ?? null;
}

export function getAllBestForSlugs(): string[] {
  return BEST_FOR_PAGES.map((p) => p.slug);
}
