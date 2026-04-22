import { type ContentPillar } from "@/types";

export interface ComparisonFeature {
  feature: string;
  optionA: string;
  optionB: string;
}

export interface ComparisonPage {
  slug: string;
  title: string;
  seoTitle: string;
  seoDescription: string;
  optionA: string;
  optionB: string;
  verdict: string;
  verdictWinner: "A" | "B" | "depends";
  pillar: ContentPillar;
  features: ComparisonFeature[];
  bestForA: string[];
  bestForB: string[];
  relatedArticle?: string;
  relatedTool?: string;
}

export const COMPARISONS: ComparisonPage[] = [
  {
    slug: "coach-vs-app",
    title: "Cycling Coach vs Training App",
    seoTitle: "Cycling Coach vs Training App — Which Do You Need?",
    seoDescription: "When does a cycling coach beat a training app? Side-by-side comparison of cost, personalisation, accountability, and results.",
    optionA: "Cycling Coach",
    optionB: "Training App",
    verdict: "A coach wins when you've plateaued, need accountability, or have complex life constraints. An app wins when you're a beginner, budget-conscious, or still making easy gains.",
    verdictWinner: "depends",
    pillar: "coaching",
    features: [
      { feature: "Personalisation", optionA: "Fully personalised weekly", optionB: "Algorithm-adjusted" },
      { feature: "Accountability", optionA: "Weekly calls + plan reviews", optionB: "Self-directed" },
      { feature: "Cost", optionA: "$150-300/month", optionB: "$15-30/month" },
      { feature: "Nutrition guidance", optionA: "Included", optionB: "Not included" },
      { feature: "Strength programming", optionA: "Included", optionB: "Rarely included" },
      { feature: "Life context adjustment", optionA: "Real-time, human", optionB: "Limited or none" },
      { feature: "Best for beginners", optionA: "Overkill", optionB: "Ideal" },
      { feature: "Best for plateaued riders", optionA: "Ideal", optionB: "Insufficient" },
    ],
    bestForA: [
      "Riders who've plateaued after 2+ years of structured training",
      "Time-crunched professionals who need every hour to count",
      "Riders with specific event goals and a date on the calendar",
      "Anyone who needs accountability to stay consistent",
    ],
    bestForB: [
      "Beginners in their first 1-2 years of structured training",
      "Budget-conscious riders making easy gains",
      "Self-motivated riders who follow plans independently",
      "Riders who prefer a virtual-world experience (Zwift)",
    ],
    relatedArticle: "/blog/is-a-cycling-coach-worth-it",
    relatedTool: "/assessment",
  },
  {
    slug: "polarised-vs-pyramidal",
    title: "Polarised vs Pyramidal Training",
    seoTitle: "Polarised vs Pyramidal Training for Cyclists",
    seoDescription: "Polarised training (80/20) vs pyramidal distribution — which intensity model produces better results for amateur cyclists?",
    optionA: "Polarised (80/20)",
    optionB: "Pyramidal",
    verdict: "Polarised has stronger research support for most amateurs. Pyramidal works for riders with very high volume. Both beat the grey-zone middle that most cyclists default to.",
    verdictWinner: "A",
    pillar: "coaching",
    features: [
      { feature: "Easy training %", optionA: "~80%", optionB: "~75%" },
      { feature: "Moderate (Zone 3) %", optionA: "~0-5%", optionB: "~15-20%" },
      { feature: "High intensity %", optionA: "~15-20%", optionB: "~5-10%" },
      { feature: "Research support", optionA: "Strong (Seiler)", optionB: "Moderate" },
      { feature: "Best for time-crunched", optionA: "Yes", optionB: "Needs more volume" },
      { feature: "Recovery demand", optionA: "Manageable", optionB: "Higher due to Zone 3" },
    ],
    bestForA: [
      "Time-crunched riders (6-10 hours/week)",
      "Masters cyclists who need to manage recovery",
      "Riders who plateau doing lots of tempo work",
    ],
    bestForB: [
      "High-volume riders (15+ hours/week)",
      "Riders who naturally thrive on tempo-paced group rides",
      "Stage-race athletes building sustained aerobic capacity",
    ],
    relatedArticle: "/blog/polarised-vs-sweet-spot-training",
  },
];

export function getComparisonBySlug(slug: string): ComparisonPage | null {
  return COMPARISONS.find((c) => c.slug === slug) ?? null;
}

export function getAllComparisonSlugs(): string[] {
  return COMPARISONS.map((c) => c.slug);
}
