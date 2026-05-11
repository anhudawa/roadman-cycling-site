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
      "The training architecture. Polarised structure, periodisation, sequencing — the framework Pogačar's coach uses, scaled to your hours.",
    weeks: [1, 2, 5, 7, 11],
  },
  {
    id: "nutrition",
    number: "02",
    name: "Nutrition",
    blurb:
      "Fuelling for performance and body composition without the misery. Carb periodisation, in-ride fuelling, race weight done properly.",
    weeks: [3, 8],
  },
  {
    id: "strength",
    number: "03",
    name: "Strength & Conditioning",
    blurb:
      "Two sessions a week. Heavy compound work. Built around the 2025 meta-analysis that ended the strength-training debate for cyclists over 40.",
    weeks: [4, 9],
  },
  {
    id: "recovery",
    number: "04",
    name: "Recovery",
    blurb:
      "Adaptation is where you grow — not on the bike. Sleep, HRV, the recovery week. The unglamorous work that makes the training count.",
    weeks: [6, 10],
  },
  {
    id: "community",
    number: "05",
    name: "Le Métier",
    blurb:
      "The craft. Pacing. Positioning. The unwritten rules. The mental game that decides whether your fitness shows up when it matters.",
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
      "You know your FTP. You know your weekly hours. You've never looked at the whole picture.",
    promise:
      "A full audit of your training, your fuelling, and the leaks in your current approach. Specific problems. Specific fixes.",
    videoMinutes: 12,
    hasTrainingPeaks: true,
  },
  {
    week: 2,
    pillar: "coaching",
    title: "Building Your Training Architecture",
    problem:
      "You've heard about polarised training. You haven't built a week around it that actually fits your life.",
    promise:
      "A 6, 8, 10, or 12-hour training week designed around real constraints. The three sessions that drive 90% of improvement.",
    videoMinutes: 14,
    hasTrainingPeaks: true,
  },
  {
    week: 3,
    pillar: "nutrition",
    title: "Fuelling the Engine",
    problem:
      "You're either under-fuelling and wondering why you can't recover, or eating for weight loss and tanking your performance.",
    promise:
      "A daily fuelling system that supports training quality and body composition at the same time. The protocol that took Anthony from 86kg to 79kg.",
    videoMinutes: 13,
    hasTrainingPeaks: true,
  },
  {
    week: 4,
    pillar: "strength",
    title: "Strength That Transfers to the Pedals",
    problem:
      "You know you should lift. You don't know what to do, when to do it, or how to fit it in without wrecking your legs.",
    promise:
      "Two 30-minute sessions a week. Four lifts. The S&C protocol used with World Tour riders, scaled for time-crunched amateurs.",
    videoMinutes: 15,
    hasTrainingPeaks: true,
  },
  {
    week: 5,
    pillar: "recovery",
    title: "The Art of Getting Faster by Doing Less",
    problem:
      "Improvement happens between sessions. Most amateurs are sabotaging adaptation with 'easy' rides that aren't easy enough.",
    promise:
      "Sleep architecture, HRV reading, the recovery week. Daily go/no-go decisions backed by data and honest self-assessment.",
    videoMinutes: 12,
    hasTrainingPeaks: true,
  },
  {
    week: 6,
    pillar: "community",
    title: "Le Métier — The Craft",
    problem:
      "Pacing. Positioning. Reading a group ride. Knowing when to push. The knowledge that doesn't fit on a spreadsheet.",
    promise:
      "Mid-course progress check. Climbing tactics, descending confidence, pacing strategy. Drawn from conversations with Lachlan Morton, Michael Matthews, and Ben Healy.",
    videoMinutes: 14,
    hasTrainingPeaks: true,
  },
  {
    week: 7,
    pillar: "coaching",
    title: "Periodisation — Training That Goes Somewhere",
    problem:
      "You've been doing the same week for months and wondering why you're not improving. That's not training. That's exercise.",
    promise:
      "Three-phase periodisation (Base → Build → Peak). Mesocycles. A season plan that actually peaks for your event.",
    videoMinutes: 13,
    hasTrainingPeaks: true,
  },
  {
    week: 8,
    pillar: "nutrition",
    title: "Race Weight Without the Misery",
    problem:
      "Body composition is the universal motivator nobody talks about. The standard restriction approaches make you slower.",
    promise:
      "Race weight as a training outcome, not a diet outcome. Sustainable body composition change without the 9pm fridge raids.",
    videoMinutes: 14,
    hasTrainingPeaks: true,
  },
  {
    week: 9,
    pillar: "strength",
    title: "Building Power Where It Counts",
    problem:
      "You're pushing watts. Are you pushing the right watts, in the right way, at the right moments?",
    promise:
      "Low-cadence torque protocols from Bora-Hansgrohe and Ineos. The 2024 Habis study application. Targeted power development for your specific limiter.",
    videoMinutes: 13,
    hasTrainingPeaks: true,
  },
  {
    week: 10,
    pillar: "recovery",
    title: "The Brain Is the Limiter",
    problem:
      "You've built the fitness. Then the road tilts up, the pace lifts, and your brain tells you to stop before your body needs to.",
    promise:
      "Pacing perception, self-talk, pre-event preparation. The applied psychology that closes the gap between your numbers and your race-day performance.",
    videoMinutes: 12,
    hasTrainingPeaks: true,
  },
  {
    week: 11,
    pillar: "coaching",
    title: "Your System, Integrated",
    problem:
      "You've learned the components. The real skill is knowing how they interact when life gets in the way.",
    promise:
      "A weekly self-coaching review. Decision trees for missed sessions, illness, work stress. A 4-week plan you can run independently.",
    videoMinutes: 15,
    hasTrainingPeaks: true,
  },
  {
    week: 12,
    pillar: "community",
    title: "Not Done Yet",
    problem:
      "The course ends. Now what?",
    promise:
      "Exit assessment against your Week 1 baseline. A 90-day forward plan. The mindset shift made permanent.",
    videoMinutes: 12,
    hasTrainingPeaks: true,
  },
] as const;

export const PROOF_POINTS = [
  {
    metric: "100M+",
    label: "podcast downloads",
    detail: "Conversations recorded with the people who actually move performance forward — not just sell to amateurs.",
  },
  {
    metric: "300+",
    label: "expert interviews",
    detail: "Distilled into a 12-week system. Professor Seiler, Dan Lorang, Dr. David Dunne, Joe Friel, John Wakefield — the work behind the work.",
  },
  {
    metric: "12 weeks",
    label: "to ownership",
    detail: "Not a subscription. Not endless content. A finite system you finish, with a measurable difference at the end.",
  },
] as const;

export const EXPERTS = [
  {
    name: "Professor Stephen Seiler",
    credit: "The polarised training framework. The man who measured what elites actually do.",
  },
  {
    name: "Dan Lorang",
    credit: "Coach to Tadej Pogačar and Jan Frodeno. Periodisation and load management.",
  },
  {
    name: "Dr. David Dunne",
    credit: "World Tour performance nutritionist. The carb-periodisation framework behind every Roadman fuelling protocol.",
  },
  {
    name: "Joe Friel",
    credit: "The foundational periodisation work that masters athletes still build on today.",
  },
  {
    name: "John Wakefield",
    credit: "Bora-Hansgrohe physiologist. The torque protocols World Tour riders run twice a week.",
  },
  {
    name: "Lachlan Morton",
    credit: "EF Education's adventure rider. The voice on what the craft actually means.",
  },
] as const;

export const FOR_THIS = [
  "You train 6+ hours a week and your FTP hasn't moved in months.",
  "You've consumed more training content than most coaches have read.",
  "You have a job, a family, and a life outside cycling — and you're not pretending otherwise.",
  "You want a system, not another subscription.",
  "You're prepared to do the strength work, the recovery, and the boring base hours that actually move the needle.",
  "You're 35–55 and you refuse to accept that your best riding is behind you.",
] as const;

export const NOT_FOR_THIS = [
  "You want a magic 4-week plan that adds 30 watts.",
  "You won't lift weights twice a week.",
  "You're chasing a TSS score, not a result.",
  "You're a beginner — this assumes a baseline of structured training.",
  "You think recovery is for people who aren't serious.",
  "You want someone to ride your bike for you. The system gives you the framework. The work is yours.",
] as const;

export const FAQ = [
  {
    q: "How is this different from a TrainerRoad or Zwift plan?",
    a: "Those deliver workouts. The Roadman Method delivers understanding. By Week 12 you'll know why each session exists, how to modify it when life gets in the way, and how to plan the next 12 weeks yourself. You'll be your own coach — with the world's best coaches backing your decisions.",
  },
  {
    q: "I work full-time and have kids. Is 12 weeks realistic?",
    a: "Yes — the entire programme is built for time-crunched cyclists. The architecture works at 6, 8, 10, or 12 hours a week. Strength work is two 30-minute sessions. Lessons are 12–15 minutes each. Dan Lorang's life-first planning principle is woven through every week: build the plan around reality, not fantasy.",
  },
  {
    q: "What's the difference between Standard and Premium?",
    a: "Standard ($297) is the full course — all 12 video modules, every written companion, every downloadable resource, the assessment frameworks, the discussion forum. Premium ($397) adds a personalised TrainingPeaks plan built around your audit results, a mid-course plan adjustment at Week 6, and a written training-data review at the end. Same content, more accountability and personalisation.",
  },
  {
    q: "How long do I have access?",
    a: "Lifetime. You complete it once at your pace, you keep it. Re-run it next year with new goals. Every update we make is included.",
  },
  {
    q: "Do I need a power meter?",
    a: "Recommended, not required. The framework works with heart rate and RPE — Dan Lorang himself prefers heart rate for amateurs because it integrates life stress, altitude, and fatigue in a way power doesn't. We give you both protocols.",
  },
  {
    q: "I'm over 50. Am I too old for this?",
    a: "The opposite. The masters strength training evidence is one of the strongest selling points of the course. After 40 you lose roughly 8% of muscle mass per decade — Week 4 and Week 9 directly address that. Most cycling courses ignore S&C entirely. This one builds it in.",
  },
  {
    q: "What if it doesn't work for me?",
    a: "30-day refund. Watch every module, do the work, and if you're not seeing a measurable shift in clarity, structure, or progress, email us and we'll refund you. No interrogation.",
  },
  {
    q: "What's the time commitment week to week?",
    a: "Roughly 30 minutes to watch the lesson, read the companion, and complete the worksheet. Plus the training itself, which fits inside your existing hours — the Method restructures what you're doing, it doesn't add to it. Strength work is 2 × 30 minutes.",
  },
  {
    q: "Does this replace the Not Done Yet community?",
    a: "No — it's a different product. The Method is a structured 12-week course you complete on your own. Not Done Yet is the ongoing coaching community: weekly live calls with Anthony, updated training plans, the people who keep you accountable. Some members do the Method first, then join Not Done Yet to keep sharpening it. Some do the reverse. Both work.",
  },
] as const;

export const COURSE_PRICE_STANDARD_USD = 297;
export const COURSE_PRICE_PREMIUM_USD = 397;
