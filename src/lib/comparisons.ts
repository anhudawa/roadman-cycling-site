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
  {
    slug: "strength-vs-more-miles",
    title: "Strength Training vs More Miles",
    seoTitle: "Strength Training vs More Riding for Cyclists",
    seoDescription: "Should cyclists lift weights or ride more? Side-by-side comparison of strength training vs extra volume for amateur and masters riders.",
    optionA: "Strength Training",
    optionB: "More Riding Volume",
    verdict: "For riders over 35 or those training under 10 hours/week, strength training produces better returns per hour than adding more riding volume. For high-volume riders under 35 with no injury history, more riding still wins.",
    verdictWinner: "depends",
    pillar: "strength",
    features: [
      { feature: "Time investment", optionA: "2-3 sessions/week (45-60min)", optionB: "3-5 extra hours/week riding" },
      { feature: "Injury prevention", optionA: "Strong evidence", optionB: "No direct benefit" },
      { feature: "FTP improvement", optionA: "8-15% (Rønnestad)", optionB: "5-10% with more volume" },
      { feature: "Masters benefit", optionA: "Critical after 40", optionB: "Diminishing returns" },
      { feature: "Cycling economy", optionA: "4-5% improvement", optionB: "Marginal" },
      { feature: "Recovery cost", optionA: "Manageable if programmed", optionB: "Fatigue accumulation risk" },
    ],
    bestForA: ["Masters riders over 40", "Time-crunched riders under 10 hours/week", "Riders with recurring injuries", "Anyone who has never done structured S&C"],
    bestForB: ["Young riders with no injury history", "Riders with 15+ hours available", "Riders already lifting consistently", "Ultra-endurance athletes building volume"],
    relatedArticle: "/blog/new-study-confirms-heavy-strength-training-beats-more-miles-after-40",
    relatedTool: "/strength-training",
  },
  {
    slug: "indoor-vs-outdoor-training",
    title: "Indoor vs Outdoor Training",
    seoTitle: "Indoor vs Outdoor Cycling Training — Which Is Better?",
    seoDescription: "Indoor training vs outdoor riding for cyclists. Time efficiency, workout quality, skill development, and how to balance both for maximum gains.",
    optionA: "Indoor Training",
    optionB: "Outdoor Riding",
    verdict: "Indoor training wins on time efficiency and workout precision. Outdoor riding wins on skill development, mental health, and race-specific fitness. The best cyclists do both — structured work inside, volume and skills outside.",
    verdictWinner: "depends",
    pillar: "coaching",
    features: [
      { feature: "Time efficiency", optionA: "60min indoor = 90min outdoor", optionB: "Includes travel, coasting, stops" },
      { feature: "Workout precision", optionA: "Exact power targets via ERG", optionB: "Terrain-dependent" },
      { feature: "Skill development", optionA: "None", optionB: "Cornering, descending, bunch riding" },
      { feature: "Mental health", optionA: "Can feel isolating", optionB: "Daylight, fresh air, social" },
      { feature: "Race specificity", optionA: "Limited", optionB: "High" },
      { feature: "Weather independence", optionA: "Complete", optionB: "Season-dependent" },
    ],
    bestForA: ["Winter months", "Midweek structured sessions", "Time-crunched riders", "Riders with young children or shift work"],
    bestForB: ["Weekends and longer rides", "Group ride and race skills", "Mental freshness", "Race-specific preparation"],
    relatedArticle: "/blog/cycling-indoor-training-tips",
  },
  {
    slug: "heart-rate-vs-power",
    title: "Heart Rate vs Power Meter Training",
    seoTitle: "Heart Rate vs Power Meter for Cycling Training",
    seoDescription: "Should you train by heart rate or power? Comparison of accuracy, cost, and practical use for amateur cyclists.",
    optionA: "Power Meter",
    optionB: "Heart Rate Monitor",
    verdict: "Power is the gold standard — it measures output directly while heart rate measures response. But heart rate still has value for pacing easy rides, monitoring fatigue, and riders on a budget.",
    verdictWinner: "A",
    pillar: "coaching",
    features: [
      { feature: "Measures", optionA: "Work output (watts)", optionB: "Physiological response (bpm)" },
      { feature: "Instant feedback", optionA: "Yes", optionB: "Lags 30-90 seconds" },
      { feature: "Affected by fatigue", optionA: "No", optionB: "Yes (cardiac drift)" },
      { feature: "Affected by heat", optionA: "No", optionB: "Yes" },
      { feature: "Cost", optionA: "£200-600", optionB: "£30-80" },
      { feature: "Pacing value", optionA: "Excellent", optionB: "Good for easy rides" },
      { feature: "Training zones", optionA: "7-zone Coggan model", optionB: "5-zone approximate" },
    ],
    bestForA: ["Serious training with interval targets", "Event pacing", "FTP tracking and progression", "Anyone who can afford it"],
    bestForB: ["Budget-conscious riders", "Monitoring Zone 2 easy days", "Detecting overtraining via resting HR", "Beginners learning intensity"],
    relatedArticle: "/blog/cycling-power-meter-guide",
    relatedTool: "/tools/ftp-zones",
  },
  {
    slug: "trainerroad-vs-trainingpeaks",
    title: "TrainerRoad vs TrainingPeaks",
    seoTitle: "TrainerRoad vs TrainingPeaks for Cyclists",
    seoDescription: "TrainerRoad's adaptive plans vs TrainingPeaks' coach-driven platform. Which training software is right for your cycling goals?",
    optionA: "TrainerRoad",
    optionB: "TrainingPeaks",
    verdict: "TrainerRoad is a self-coaching engine — pick a plan, follow the workouts, let the algorithm adapt. TrainingPeaks is a platform your coach builds your plan on. If you have a coach, TrainingPeaks. If you're self-coached, TrainerRoad.",
    verdictWinner: "depends",
    pillar: "coaching",
    features: [
      { feature: "Primary use", optionA: "Self-coached adaptive training", optionB: "Coach-athlete platform" },
      { feature: "Plan creation", optionA: "Algorithm-generated", optionB: "Coach-built or purchased" },
      { feature: "Adaptive training", optionA: "Yes (AI-driven)", optionB: "Manual (coach adjusts)" },
      { feature: "Indoor workouts", optionA: "Built-in with ERG mode", optionB: "Syncs to Wahoo/Garmin" },
      { feature: "Analytics depth", optionA: "Good", optionB: "Excellent (PMC, CTL, ATL)" },
      { feature: "Cost", optionA: "~$20/month", optionB: "~$10-20/month + coach fee" },
    ],
    bestForA: ["Self-coached riders who want structure", "Indoor training focus", "Riders who want AI-adjusted plans", "Budget-conscious athletes"],
    bestForB: ["Riders working with a human coach", "Advanced analytics and periodisation", "Multi-sport athletes (triathlon)", "Riders who want full calendar control"],
    relatedArticle: "/blog/trainerroad-vs-online-cycling-coach",
  },
  {
    slug: "online-coach-vs-local-club",
    title: "Online Cycling Coach vs Local Club Training",
    seoTitle: "Online Coach vs Local Club for Cycling Training",
    seoDescription: "Should you hire an online cycling coach or train with your local club? Comparison of personalisation, cost, social benefits, and results.",
    optionA: "Online Coach",
    optionB: "Local Club Training",
    verdict: "An online coach delivers personalised, accountable, structured training. Club training delivers social riding, group dynamics, and race skills. The best approach: use a coach for structure and the club for fun and skills.",
    verdictWinner: "depends",
    pillar: "coaching",
    features: [
      { feature: "Personalisation", optionA: "Fully individualised", optionB: "One-size-fits-all group rides" },
      { feature: "Social element", optionA: "Community platform", optionB: "Strong (group rides, racing)" },
      { feature: "Cost", optionA: "$150-300/month", optionB: "$5-30/month membership" },
      { feature: "Skill development", optionA: "Limited (remote)", optionB: "Bunch riding, drafting, tactics" },
      { feature: "Accountability", optionA: "Weekly calls + reviews", optionB: "Peer motivation" },
      { feature: "Flexibility", optionA: "Train when you can", optionB: "Fixed group ride schedule" },
    ],
    bestForA: ["Riders who've plateaued on club training alone", "Time-crunched professionals", "Riders targeting specific events", "Riders not near a strong club"],
    bestForB: ["Social riders who thrive in groups", "Beginners learning to ride in a bunch", "Budget-conscious riders", "Riders who need race-simulation intensity"],
    relatedArticle: "/blog/cycling-coach-near-me-why-location-doesnt-matter-2026",
  },
  {
    slug: "ftp-ramp-test-vs-20-minute",
    title: "FTP Ramp Test vs 20-Minute Test",
    seoTitle: "FTP Ramp Test vs 20-Minute Test — Which Is More Accurate?",
    seoDescription: "Ramp test or 20-minute test for FTP? Accuracy, pacing difficulty, and which test suits your riding style and training goals.",
    optionA: "Ramp Test",
    optionB: "20-Minute Test",
    verdict: "The 20-minute test is more accurate for most riders but harder to pace. The ramp test is easier to execute and more repeatable but can overestimate FTP for riders with strong anaerobic capacity.",
    verdictWinner: "depends",
    pillar: "coaching",
    features: [
      { feature: "Accuracy", optionA: "Good (±3-5%)", optionB: "Better (±2-3%)" },
      { feature: "Pacing difficulty", optionA: "None (progressive)", optionB: "High (must hold steady)" },
      { feature: "Duration", optionA: "~20 min total", optionB: "~45 min with warm-up" },
      { feature: "Repeatability", optionA: "High", optionB: "Moderate (pacing varies)" },
      { feature: "Anaerobic bias", optionA: "Can overestimate", optionB: "Less biased" },
      { feature: "Mental difficulty", optionA: "Moderate", optionB: "Very high" },
    ],
    bestForA: ["New to FTP testing", "Riders who struggle with pacing", "Frequent retesting (every 4-6 weeks)", "Indoor training platforms"],
    bestForB: ["Experienced riders who can pace well", "More accurate zone calculation", "Riders training for TTs or steady-state events", "When absolute accuracy matters"],
    relatedArticle: "/blog/how-to-improve-ftp-cycling",
    relatedTool: "/tools/ftp-zones",
  },
];

export function getComparisonBySlug(slug: string): ComparisonPage | null {
  return COMPARISONS.find((c) => c.slug === slug) ?? null;
}

export function getAllComparisonSlugs(): string[] {
  return COMPARISONS.map((c) => c.slug);
}
