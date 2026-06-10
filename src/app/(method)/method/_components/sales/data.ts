/**
 * Static content for the /method sales page.
 *
 * Source: roadman-method-syllabus.md and roadman-method-expert-clips.md.
 * Kept separate from the page components so copy can be edited without
 * touching JSX, and so it's easy to scan for tone audits.
 */

export type Pillar = "coaching" | "nutrition" | "strength" | "recovery" | "community";

export interface PillarDef {
  id: Pillar;
  number: string;
  name: string;
  blurb: string;
  weeks: number[];
}

export const PILLARS: readonly PillarDef[] = [
  {
    id: "coaching",
    number: "01",
    name: "Coaching",
    blurb:
      "The training architecture. Polarised structure, periodisation, sequencing — the same season logic Dan Lorang builds for his Red Bull–Bora-Hansgrohe riders, scaled to your six hours a week.",
    weeks: [1, 2, 5, 7, 11],
  },
  {
    id: "nutrition",
    number: "02",
    name: "Nutrition",
    blurb:
      "Fuelling for performance and body composition at the same time — no misery, no 9pm fridge raids. Carb periodisation, in-ride fuelling, race weight done properly.",
    weeks: [3, 8],
  },
  {
    id: "strength",
    number: "03",
    name: "Strength & Conditioning",
    blurb:
      "Two sessions a week. Four lifts. Heavy, brief, and built around the 2025 meta-analysis that ended the strength debate for every cyclist over 40.",
    weeks: [4, 9],
  },
  {
    id: "recovery",
    number: "04",
    name: "Recovery",
    blurb:
      "You don't grow on the bike. You grow between the rides. Sleep, HRV, the recovery week — the unglamorous work that decides whether the training counts.",
    weeks: [6, 10],
  },
  {
    id: "community",
    number: "05",
    name: "Le Métier",
    blurb:
      "The craft. Pacing. Positioning. The unwritten rules. The mental game that decides whether your fitness actually shows up on the day it matters.",
    weeks: [6, 12],
  },
] as const;

export interface SyllabusWeek {
  week: number;
  pillar: Pillar;
  title: string;
  problem: string;
  promise: string;
  videoMinutes: number;
  hasTrainingPeaks: boolean;
}

export const SYLLABUS: readonly SyllabusWeek[] = [
  {
    week: 1,
    pillar: "coaching",
    title: "Where You Actually Are",
    problem:
      "You know your FTP. You know your weekly hours. You've never put the whole picture on one page — so you keep fixing the wrong thing.",
    promise:
      "A full audit of your training, fuelling and recovery against a single baseline. The two or three leaks actually costing you watts — named, with the fix for each.",
    videoMinutes: 12,
    hasTrainingPeaks: true,
  },
  {
    week: 2,
    pillar: "coaching",
    title: "Building Your Training Architecture",
    problem:
      "You've heard 'polarised' a hundred times. You've never built a week around it that survives contact with your actual calendar.",
    promise:
      "Your 6, 8, 10 or 12-hour week, designed around the life you've got. The three sessions that drive 90% of the improvement — and permission to bin the rest.",
    videoMinutes: 14,
    hasTrainingPeaks: true,
  },
  {
    week: 3,
    pillar: "nutrition",
    title: "Fuelling the Engine",
    problem:
      "You're either under-fuelling and wondering why you can't recover, or eating for weight loss and watching your power bleed away.",
    promise:
      "A daily fuelling system that feeds the training and shifts body composition at once — the carb-periodisation framework Dr. David Dunne runs with World Tour pros. The protocol that took Anthony from 86kg to 79kg without losing a watt.",
    videoMinutes: 13,
    hasTrainingPeaks: true,
  },
  {
    week: 4,
    pillar: "strength",
    title: "Strength That Transfers to the Pedals",
    problem:
      "You know you should lift. You don't know what, when, or how to fit it in without wrecking tomorrow's ride. So you keep not doing it.",
    promise:
      "Two 30-minute sessions. Four lifts. The minimum effective dose of the S&C World Tour riders run — and the 2025 meta-analysis that settled the debate for anyone over 40.",
    videoMinutes: 15,
    hasTrainingPeaks: true,
  },
  {
    week: 5,
    pillar: "recovery",
    title: "The Art of Getting Faster by Doing Less",
    problem:
      "Improvement happens between the sessions, not during them. Most amateurs quietly sabotage it with 'easy' rides that are never actually easy.",
    promise:
      "Sleep architecture, HRV you can actually read, and the recovery week done properly. A daily go/no-go call backed by data instead of guilt.",
    videoMinutes: 12,
    hasTrainingPeaks: true,
  },
  {
    week: 6,
    pillar: "community",
    title: "Le Métier — The Craft",
    problem:
      "Pacing. Positioning. Reading a group. Knowing when to bury yourself and when to sit in. None of it fits on a spreadsheet — and it's the whole difference on the day.",
    promise:
      "Your mid-course progress check, plus the craft: climbing tactics, descending confidence, race-day pacing — drawn straight from conversations with Lachlan Morton, Michael Matthews and Ben Healy.",
    videoMinutes: 14,
    hasTrainingPeaks: true,
  },
  {
    week: 7,
    pillar: "coaching",
    title: "Periodisation — Training That Goes Somewhere",
    problem:
      "You've ridden the same week since January and wondered why nothing's changed. That's not training. That's exercise with a heart-rate strap.",
    promise:
      "Three-phase periodisation — Base, Build, Peak. Mesocycles that stack. A season that arrives sharp on the day you've circled, not three weeks after it.",
    videoMinutes: 13,
    hasTrainingPeaks: true,
  },
  {
    week: 8,
    pillar: "nutrition",
    title: "Race Weight Without the Misery",
    problem:
      "Body composition is the thing everyone wants and nobody talks about honestly. The usual restriction approaches just make you slower and miserable.",
    promise:
      "Race weight as a by-product of training, not a diet you white-knuckle. Sustainable change — no 9pm fridge raids, no watts left on the kitchen floor.",
    videoMinutes: 14,
    hasTrainingPeaks: true,
  },
  {
    week: 9,
    pillar: "strength",
    title: "Building Power Where It Counts",
    problem:
      "You're pushing watts. Are they the right watts, in the right way, at the moments your event actually demands?",
    promise:
      "Low-cadence torque work — the protocols John Wakefield's riders run twice a week at Bora-Hansgrohe — pointed squarely at your specific limiter.",
    videoMinutes: 13,
    hasTrainingPeaks: true,
  },
  {
    week: 10,
    pillar: "recovery",
    title: "The Brain Is the Limiter",
    problem:
      "You built the fitness. Then the road tilts up, the pace lifts, and your head taps out a long time before your legs have to.",
    promise:
      "Pacing perception, self-talk, and a pre-event routine that holds under pressure — the applied psychology that closes the gap between your numbers and your result.",
    videoMinutes: 12,
    hasTrainingPeaks: true,
  },
  {
    week: 11,
    pillar: "coaching",
    title: "Your System, Integrated",
    problem:
      "Learning the five pillars is the easy part. The real skill is knowing how they trade off when work explodes, the kids get sick, and the week falls apart.",
    promise:
      "A weekly self-coaching review and decision trees for the curveballs — missed sessions, illness, travel. By the end you can write the next block yourself.",
    videoMinutes: 15,
    hasTrainingPeaks: true,
  },
  {
    week: 12,
    pillar: "community",
    title: "Not Done Yet",
    problem:
      "The course ends. The plateau is gone. Now what?",
    promise:
      "A like-for-like re-test against your Week 1 baseline, the numbers in black and white, and a 90-day forward plan. The shift made permanent — and self-sustaining.",
    videoMinutes: 12,
    hasTrainingPeaks: true,
  },
] as const;

export const PROOF_POINTS = [
  {
    metric: "100M+",
    label: "podcast downloads",
    detail:
      "More than any cycling-performance podcast on earth. The access that number bought is the access that built this course.",
  },
  {
    metric: "300+",
    label: "expert interviews",
    detail:
      "Seiler. Lorang. Dunne. Friel. Wakefield. Hundreds of hours on the record — distilled into twelve weeks you can finish.",
  },
  {
    metric: "12 weeks",
    label: "to ownership",
    detail:
      "Not a subscription. Not an endless feed. A finite system you finish — with a measurable difference at the end.",
  },
] as const;

export const EXPERTS = [
  {
    name: "Professor Stephen Seiler",
    credit:
      "The polarised training model. The scientist who measured what elite endurance athletes actually do — then proved most amateurs do the opposite.",
  },
  {
    name: "Dan Lorang",
    credit:
      "Head of Performance at Red Bull–Bora-Hansgrohe. Coach to Jan Frodeno, Anne Haug and Mark Cavendish. Periodisation and life-first load management.",
  },
  {
    name: "Dr. David Dunne",
    credit:
      "World Tour performance nutritionist. The carb-periodisation framework behind every fuelling protocol in the Method.",
  },
  {
    name: "Joe Friel",
    credit:
      "The Cyclist's Training Bible. The foundational periodisation work that masters athletes still build their seasons on.",
  },
  {
    name: "John Wakefield",
    credit:
      "Bora-Hansgrohe physiologist. The low-cadence torque protocols World Tour riders run twice a week — built into Weeks 4 and 9.",
  },
  {
    name: "Lachlan Morton",
    credit:
      "EF Education's adventure rider. The voice on what le métier — the craft of riding — actually means when the road points up.",
  },
] as const;

export const FOR_THIS = [
  "You train 6+ hours a week and your FTP hasn't moved in a year.",
  "You've consumed more training content than most coaches have read — and you're more confused, not less.",
  "You have a job, a family, and a life off the bike. You're not pretending otherwise.",
  "You want a system you own, not another subscription that owns you.",
  "You'll do the strength work, the recovery, and the boring base hours — because you finally understand why they matter.",
  "You're 35–55, and 'your best riding is behind you' makes you want to prove it wrong.",
] as const;

export const NOT_FOR_THIS = [
  "You want a magic 4-week plan that bolts on 30 watts.",
  "You won't lift twice a week, full stop.",
  "You're chasing a TSS score instead of a result.",
  "You're brand new to the bike — this assumes a base of structured training.",
  "You think recovery is for people who aren't serious.",
  "You want someone to ride it for you. The Method hands you the framework. The legs are yours.",
] as const;

/**
 * Price-anchoring rows for the Pricing section. Every alternative a serious
 * amateur has actually priced — so $297 lands as the obvious value, not a cost.
 */
export const PRICE_ANCHORS = [
  {
    label: "A personal cycling coach",
    price: "$200–400 / month",
    note: "$2,400+ a year — and most hand you a calendar, not an education.",
    highlight: false,
  },
  {
    label: "A week at a training camp",
    price: "$2,000+",
    note: "Seven days of fitness you start losing the week you fly home.",
    highlight: false,
  },
  {
    label: "A coach + power meter for one season",
    price: "$3,000+",
    note: "Before flights, race entries, or a single new wheel.",
    highlight: false,
  },
  {
    label: "The Roadman Method",
    price: "$297, once",
    note: "Lifetime access. Run it every season. By the end, you're the coach.",
    highlight: true,
  },
] as const;

/**
 * The guarantee. Front-and-centre, in Anthony's voice — a refusal to hide
 * behind small print.
 */
export const GUARANTEE = {
  eyebrow: "THE GUARANTEE",
  heading: "Do the work for 30 days. If it doesn't click, you get every cent back.",
  body:
    "Enrol. Watch the modules. Do the worksheets. Ride the first few weeks the way the Method tells you to. If you don't come out the other side with a clearer head, a sharper structure, and a plan you actually believe in — email me inside 30 days and I'll refund the lot. No form. No interrogation. No hard feelings. I can put that in writing because the people who do the work never ask for it.",
  signoff: "That's my name on it.",
  signature: "— Anthony Walsh",
} as const;

export const FAQ = [
  {
    q: "How is this different from a TrainerRoad or Zwift plan?",
    a: "Those hand you workouts. The Roadman Method hands you understanding. A plan tells you what to do today; it goes quiet the moment life gets in the way. By Week 12 you'll know why each session exists, how to modify it when the week falls apart, and how to write the next 12 weeks yourself. You stop renting a plan and start being your own coach — with the world's best coaches behind every call you make.",
  },
  {
    q: "$297 is real money. How do I know it's worth it?",
    a: "Price it against the alternatives. A personal coach is $200–400 a month — $2,400+ a year. A week at a training camp is $2,000 and gone by the time you land home. The Method is $297, once, and it's yours for life — re-run it every season with new goals. One sensible decision it stops you making — one wasted training block, one crash diet, one season spent guessing — has already paid for it.",
  },
  {
    q: "I work full-time and have kids. Is 12 weeks realistic?",
    a: "It's built for exactly you. The architecture works at 6, 8, 10 or 12 hours a week. Strength is two 30-minute sessions. Lessons are 12–15 minutes — watch one on the train. Dan Lorang's life-first planning runs through every week: you build the plan around reality, not around a pro's spare time. The Method restructures the hours you already ride. It doesn't ask for more of them.",
  },
  {
    q: "What's the difference between Standard and Premium?",
    a: "Standard ($297) is the full course — all 12 video modules, every written companion, every template, worksheet and protocol card, the assessment frameworks, and the cohort forum. Premium ($397) adds a personalised TrainingPeaks plan built around your Week 1 audit, a data-backed plan adjustment at Week 6, and a written training review at the end. Same teaching. More accountability, more personalisation. Both are one payment — never a subscription.",
  },
  {
    q: "How long do I have access?",
    a: "For life. You buy it once, you finish it at your pace, you keep it. Come back and run it again next year against a new goal. Every update we ever make is yours at no extra cost.",
  },
  {
    q: "What if I've already tried everything?",
    a: "Then you're the rider this was built for. The people who get the most from the Method aren't beginners — they're the ones drowning in conflicting advice, doing the same week 52 times a year, sure they're missing one thing. You usually are. Week 1 finds it. The other eleven fix it.",
  },
  {
    q: "Do I need a power meter?",
    a: "Recommended, not required. The whole framework runs on heart rate and RPE too — Dan Lorang is a strong advocate of heart rate for amateurs because it folds in life stress, heat and fatigue in a way raw power can't. You get both protocols, side by side.",
  },
  {
    q: "I'm over 50. Am I too old for this?",
    a: "The opposite — the masters evidence is one of the strongest reasons to do it now. After 40 you shed roughly 8% of muscle mass a decade unless you train against it. Weeks 4 and 9 attack that head-on with the 2025 strength meta-analysis built in. Most cycling courses ignore S&C entirely. This one is half the point.",
  },
  {
    q: "What if it doesn't work for me?",
    a: "30-day full refund. Watch the modules, do the work, and if you're not seeing a measurable shift in clarity, structure or progress, email us inside 30 days. We refund you. No interrogation, no hoops. The work is the only thing we ask of you.",
  },
  {
    q: "Does this replace the Not Done Yet community?",
    a: "No — different product, different job. The Method is a structured 12-week course you finish on your own. Not Done Yet is the ongoing coaching community: weekly live calls with Anthony, updated plans, the people who keep you honest week to week. Plenty of members do the Method first and join Not Done Yet to keep sharpening it. Plenty do the reverse. Both work.",
  },
] as const;

export const COURSE_PRICE_STANDARD_USD = 297;
export const COURSE_PRICE_PREMIUM_USD = 397;
