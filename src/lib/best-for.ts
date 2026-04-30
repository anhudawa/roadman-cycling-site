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
  {
    slug: "best-cycling-coach-sportive-riders",
    title: "Best Cycling Coach for Sportive Riders",
    seoTitle: "Best Cycling Coach for Sportive Riders",
    seoDescription: "How to choose the best cycling coach if you're training for a sportive or gran fondo. What to look for, what to avoid, and when coaching pays off.",
    pillar: "coaching",
    intro: "Training for a sportive is where coaching earns its keep. Generic plans don't account for the specific climbs, your pacing needs, or your fuelling strategy. Here's what to look for.",
    picks: [
      { name: "Roadman Cycling (Not Done Yet)", verdict: "Best for event-specific periodised plans", bestFor: "Riders targeting Wicklow 200, Ride London, Étape, or any specific sportive", href: "/coaching" },
      { name: "TrainerRoad", verdict: "Best self-coached option with event targeting", bestFor: "Budget riders who can set their own event date and follow a plan", href: "/compare/coach-vs-app" },
      { name: "FasCat Coaching", verdict: "Strong event-plan focus", bestFor: "Riders who want a structured calendar with racing periodisation", href: "/compare/self-coached-vs-coached" },
    ],
    faq: [
      { question: "When should I start coaching before a sportive?", answer: "12-16 weeks before the event is ideal. This gives enough time for a base phase, a build phase, and a taper. Under 8 weeks and coaching is damage limitation — still useful, but you're working with the fitness you have." },
      { question: "Do I need a coach for every sportive?", answer: "No. If you've done the event before and know your body well, self-coaching with a structured app can work. Coaching adds most value for first-time events, events with significant climbing, or events where you have a specific time goal." },
    ],
  },
  {
    slug: "best-cycling-coach-comeback-riders",
    title: "Best Cycling Coach for Comeback Riders",
    seoTitle: "Best Cycling Coach for Comeback Riders",
    seoDescription: "Returning to cycling after time off? The best coaching options for comeback riders — rebuilding safely without overtraining or injury.",
    pillar: "coaching",
    intro: "Coming back to cycling after illness, injury, or life is where coaching prevents the most damage. The instinct is to rush; a coach manages the rebuild.",
    picks: [
      { name: "Roadman Cycling (Not Done Yet)", verdict: "Best for structured rebuild with accountability", bestFor: "Riders returning after 3+ months off who need pacing discipline", href: "/you/comeback" },
      { name: "TrainerRoad (Adaptive Training)", verdict: "Best self-paced option", bestFor: "Self-motivated riders who need the plan to ramp gradually", href: "/compare/coach-vs-app" },
      { name: "Local cycling club", verdict: "Best for social motivation", bestFor: "Riders who need group energy to stay consistent", href: "/compare/online-coach-vs-local-club" },
    ],
    faq: [
      { question: "How long does it take to get back to previous fitness?", answer: "Typically 50-80% of the time you were off. If you were off 6 months, expect 3-5 months to return to previous levels. Muscle memory helps but cardiovascular fitness has to be rebuilt." },
      { question: "Should I test my FTP when coming back?", answer: "Yes, but don't compare it to your old numbers. Test after 2-3 weeks of easy riding to establish a current baseline, then retest every 6-8 weeks." },
    ],
  },
  {
    slug: "best-cycling-apps-structured-training",
    title: "Best Cycling Apps for Structured Training",
    seoTitle: "Best Cycling Apps for Structured Training",
    seoDescription: "The best cycling apps for structured training in 2026. TrainerRoad, Zwift, TrainingPeaks, Intervals.icu — compared for real training, not just features.",
    pillar: "coaching",
    intro: "Structured training apps have made quality coaching methodology accessible to everyone. But they're not all the same — and the best one depends on how you ride.",
    picks: [
      { name: "TrainerRoad", verdict: "Best adaptive structured training", bestFor: "Self-coached riders who want AI-adjusted plans that evolve with them", href: "/blog/zwift-vs-trainerroad" },
      { name: "Intervals.icu", verdict: "Best free analytics platform", bestFor: "Data-focused riders who want deep analytics without paying monthly", href: "/compare/heart-rate-vs-power" },
      { name: "TrainingPeaks", verdict: "Best coach-athlete platform", bestFor: "Riders working with a human coach", href: "/compare/trainerroad-vs-trainingpeaks" },
      { name: "Zwift", verdict: "Best for social indoor training", bestFor: "Riders who need gamification and community to stay on the trainer", href: "/blog/zwift-vs-trainerroad" },
    ],
    faq: [
      { question: "Can I use multiple training apps?", answer: "Yes — many riders use TrainingPeaks for planning + Zwift or TrainerRoad for execution + Intervals.icu for free analytics. The key is having one source of truth for your training plan." },
      { question: "Do training apps replace a coach?", answer: "For beginners and intermediate riders, often yes. For plateaued riders, time-crunched professionals, or anyone who needs accountability, a human coach fills gaps no app can." },
    ],
  },
  {
    slug: "best-cycling-coach-masters-riders",
    title: "Best Cycling Coach for Masters Riders (40+)",
    seoTitle: "Best Cycling Coach for Masters Riders (Over 40)",
    seoDescription: "Best coaching options for cyclists over 40. Masters training, recovery, strength — who does it best.",
    pillar: "coaching",
    intro: "Masters cycling is a different sport. Recovery takes longer, muscle mass declines without intervention, and the training that worked at 30 doesn't work at 45.",
    picks: [
      { name: "Roadman Cycling (Not Done Yet)", verdict: "Best for integrated masters coaching", bestFor: "40+ riders needing training + strength + nutrition + recovery managed together", href: "/coaching" },
      { name: "FasCat Coaching", verdict: "Best for self-directed masters athletes", bestFor: "Masters riders wanting a plan library with age-adjusted periodisation", href: "/compare/coach-vs-app" },
      { name: "TrainerRoad (Adaptive Training)", verdict: "Best app-based option for masters", bestFor: "Self-coached masters riders needing adaptive intensity management", href: "/blog/zwift-vs-trainerroad" },
    ],
    faq: [
      { question: "Do masters cyclists need a different coaching approach?", answer: "Yes. Recovery capacity declines after 40. Muscle mass drops ~8% per decade without resistance training. A masters coach adjusts training density, adds mandatory strength work, and manages nutrition for body composition." },
      { question: "Is strength training essential for cyclists over 40?", answer: "Non-negotiable. Heavy resistance training 2x/week preserves muscle mass, maintains bone density, and counteracts age-related power decline that aerobic training alone cannot prevent." },
    ],
  },
  {
    slug: "best-cycling-coach-triathlon",
    title: "Best Cycling Coach for Triathletes",
    seoTitle: "Best Cycling Coach for Triathletes (Bike Leg)",
    seoDescription: "Best bike-leg coaching for age-group triathletes. Cycling-deep, triathlon-aware coaching compared.",
    pillar: "coaching",
    intro: "Most triathlon coaches cover three disciplines thinly. Most cycling coaches ignore triathlon context. The best bike-leg coaching is cycling-deep but triathlon-aware, periodised around the run.",
    picks: [
      { name: "Roadman Cycling (Triathlon Bike Coaching)", verdict: "Best specialist bike-leg coaching", bestFor: "Age-group 70.3 and Ironman athletes wanting a dedicated bike-leg coach", href: "/coaching/triathletes" },
      { name: "Purple Patch Fitness", verdict: "Best full-triathlon coaching with strong bike focus", bestFor: "Triathletes wanting one coach across all three disciplines", href: "/compare/coach-vs-app" },
      { name: "TrainerRoad + triathlon plan", verdict: "Best self-coached bike-leg training", bestFor: "Budget triathletes wanting structured bike workouts", href: "/blog/zwift-vs-trainerroad" },
    ],
    faq: [
      { question: "Should I use a cycling coach or triathlon coach?", answer: "Cycling coach if the bike is your limiter. Triathlon coach if you need all three disciplines. The ideal: a cycling coach who understands triathlon context and doesn't build bike fitness at the expense of your run." },
      { question: "How is triathlon bike coaching different?", answer: "Three differences: aero position management (power in TT bars), pacing for a run off the bike (negative split), and brick-specific training." },
    ],
  },
  {
    slug: "best-cycling-nutrition-apps",
    title: "Best Cycling Nutrition Apps",
    seoTitle: "Best Cycling Nutrition Apps for Performance",
    seoDescription: "Best nutrition apps for cyclists. Fuelling, macro tracking, race-day planning compared.",
    pillar: "nutrition",
    intro: "Generic calorie apps don't understand periodised nutrition. The best cycling nutrition tools match fuel to training load, plan in-ride carbs, and prevent chronic under-fuelling.",
    picks: [
      { name: "Fuelin", verdict: "Best for periodised cycling nutrition", bestFor: "Serious cyclists wanting daily fuel targets matched to training", href: "/blog/cycling-weight-loss-fuel-for-the-work-required" },
      { name: "MyFitnessPal", verdict: "Best for macro tracking on a budget", bestFor: "Riders wanting a free food diary with a large database", href: "/blog/cycling-weight-loss-fuel-for-the-work-required" },
      { name: "Roadman Fuelling Calculator", verdict: "Best free in-ride fuelling planner", bestFor: "Riders wanting exact carbs/hour and sodium targets", href: "/tools/fuelling" },
    ],
    faq: [
      { question: "Do I need a nutrition app for cycling?", answer: "Not strictly — but tracking carbs per hour during rides is one of the highest-leverage changes most amateurs can make. A free calculator gives targets. An app like Fuelin automates daily nutrition." },
      { question: "Is MyFitnessPal good enough?", answer: "For basic macros, yes. But it doesn't understand periodisation — same targets on rest day and 5-hour ride day. For fuel-for-the-work-required, you need something that reads your training calendar." },
    ],
  },
  {
    slug: "best-turbo-trainers-2026",
    title: "Best Smart Turbo Trainers in 2026",
    seoTitle: "Best Smart Turbo Trainers 2026",
    seoDescription: "Best smart turbo trainers for 2026. Direct drive, budget, premium — compared by accuracy, noise, and ride feel.",
    pillar: "community",
    intro: "A smart trainer is the single best indoor training investment. ERG mode, accurate power, and platform compatibility transform winter training from junk miles to structured gains.",
    picks: [
      { name: "Wahoo KICKR v6", verdict: "Best overall smart trainer", bestFor: "Riders wanting the best ride feel, accuracy, and ecosystem integration", href: "/blog/zwift-vs-trainerroad" },
      { name: "Tacx NEO 3M", verdict: "Best for road feel and silence", bestFor: "Apartment riders needing near-silent operation", href: "/compare/indoor-vs-outdoor-training" },
      { name: "Elite Suito-T", verdict: "Best value direct-drive trainer", bestFor: "Budget riders wanting direct-drive accuracy", href: "/compare/indoor-vs-outdoor-training" },
      { name: "Wahoo KICKR CORE", verdict: "Best mid-range direct drive", bestFor: "Riders wanting Wahoo quality at a lower price", href: "/blog/zwift-vs-trainerroad" },
    ],
    faq: [
      { question: "Direct-drive or wheel-on?", answer: "Direct-drive recommended for serious training. Wheel-on trainers slip at high power, wear tyres, and are less accurate. A budget direct-drive (Elite Suito-T) beats a premium wheel-on." },
      { question: "Smart trainer or power meter first?", answer: "Mostly indoors: smart trainer. Mostly outdoors: power meter. 50/50: power meter — it works in both environments." },
    ],
  },
];

export function getBestForBySlug(slug: string): BestForPage | null {
  return BEST_FOR_PAGES.find((p) => p.slug === slug) ?? null;
}

export function getAllBestForSlugs(): string[] {
  return BEST_FOR_PAGES.map((p) => p.slug);
}
