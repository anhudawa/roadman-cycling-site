/**
 * The Roadman Method — module manifest.
 *
 * Source of truth for the 12-week course content. Each module entry
 * points to its written protocol MDX (in `content/method/protocols/`),
 * its companion video, downloadable resources, and the per-week Skool
 * discussion thread.
 *
 * Slugs are stable URLs and are referenced by `method_progress.module_slug`.
 * Do not rename a slug after launch — it would orphan progress rows.
 *
 * Drip pacing: `unlocksOnDayOffset` is days after `dripStartAt` before
 * a module unlocks. Defaults to weekly (0, 7, 14, …). When env var
 * `METHOD_DRIP_MODE=all-at-once` is set, `isModuleUnlocked` short-circuits.
 */

export type Pillar =
  | "coaching"
  | "nutrition"
  | "strength"
  | "recovery"
  | "community";

export type ResourceLink =
  | { kind: "pdf"; title: string; href: string; sizeLabel?: string }
  | { kind: "training-peaks"; title: string; href: string }
  | { kind: "external"; title: string; href: string };

export interface MethodModule {
  slug: string;
  weekIndex: number;
  title: string;
  subtitle: string;
  /** Short tagline shown on the dashboard grid. */
  oneLiner: string;
  pillar: Pillar;
  /** Days after dripStartAt before this module unlocks. 0 = available immediately. */
  unlocksOnDayOffset: number;
  /** Unlisted YouTube ID for the companion video. Null until recorded. */
  videoYouTubeId: string | null;
  /** Path to the MDX protocol body, relative to repo root. */
  protocolMdxPath: string;
  /** Estimated reading time for the protocol body, in minutes. */
  estimatedReadMinutes: number;
  /** Names of the experts whose work anchors the module. */
  keyExperts: readonly string[];
  /** Bullet outcomes shown above the protocol on the module page. */
  learningOutcomes: readonly string[];
  /** Action checklist — printed on the dashboard, ticked off across the week. */
  checklist: readonly string[];
  /** Downloadable / external resources — workbooks, PDFs, TrainingPeaks plans. */
  resources: readonly ResourceLink[];
  /** Per-module Skool thread URL — falls back to METHOD_NDY_DISCUSSION_URL when null. */
  discussionUrl: string | null;
}

export const METHOD_MODULES: readonly MethodModule[] = [
  {
    slug: "01-where-you-actually-are",
    weekIndex: 1,
    title: "Where You Actually Are",
    subtitle: "The audit nobody wants to do — and the one that changes everything",
    oneLiner: "The honest baseline — power, weight, sleep, stress, available hours.",
    pillar: "coaching",
    unlocksOnDayOffset: 0,
    videoYouTubeId: null,
    protocolMdxPath: "content/method/protocols/01-where-you-actually-are.mdx",
    estimatedReadMinutes: 22,
    keyExperts: ["Professor Stephen Seiler", "Dan Lorang"],
    learningOutcomes: [
      "Run a full training and lifestyle audit using the Roadman Method framework",
      "Identify your real intensity distribution and understand why it's almost certainly off",
      "Map your honest available training hours against the goal you've actually committed to",
      "Set a measurable 12-week target grounded in where you are, not where you wish you were",
    ],
    checklist: [
      "Complete the Entry Assessment Workbook (FTP, weight, body fat estimate, sleep average, current weekly hours)",
      "Audit the last four weeks of riding — print or screenshot from your head unit, no rewriting history",
      "Calculate your real intensity distribution: percentage of minutes in green / yellow / red",
      "Map your true weekly availability — calendar blocked, including showers, commute and family time",
      "Write a single primary 12-week goal, two supporting goals, one number you'll measure against in Week 12",
      "Take Week 1 reference photos and waist/hip measurements",
      "Post your audit summary in the Not Done Yet thread for Week 1",
    ],
    resources: [
      { kind: "pdf", title: "Entry Assessment Workbook", href: "/method/resources/01-entry-assessment-workbook.pdf" },
      { kind: "pdf", title: "Training Audit Worksheet", href: "/method/resources/01-training-audit-worksheet.pdf" },
      { kind: "pdf", title: "Weekly Hours Mapping Template", href: "/method/resources/01-weekly-hours-mapping.pdf" },
      { kind: "pdf", title: "Goal-Setting Framework — One-Two-Twelve", href: "/method/resources/01-one-two-twelve.pdf" },
    ],
    discussionUrl: null,
  },
  {
    slug: "02-training-architecture",
    weekIndex: 2,
    title: "Building Your Training Architecture",
    subtitle: "A polarised week that actually fits the life you live",
    oneLiner: "Polarised training, built around your hours and your goal.",
    pillar: "coaching",
    unlocksOnDayOffset: 7,
    videoYouTubeId: null,
    protocolMdxPath: "content/method/protocols/02-training-architecture.mdx",
    estimatedReadMinutes: 26,
    keyExperts: ["Professor Stephen Seiler", "Dan Lorang", "Alistair Brownlee"],
    learningOutcomes: [
      "Build a personalised weekly training structure using polarised principles",
      "Identify the three session types that drive 90% of the improvement",
      "Stop riding the grey zone — the single biggest leak in the amateur week",
      "Schedule training around real-life constraints without losing the physiological stimulus",
    ],
    checklist: [
      "Choose your hours bracket from the templates (6 / 8 / 10 / 12 hour weeks) and pull the matching architecture",
      "Lock the long ride in the calendar first — this is the anchor, not the leftover",
      "Place one quality session midweek — Zone 2 priority this week, not threshold",
      "Schedule two short Zone 2 sessions or active recovery rides around the anchors",
      "Set heart-rate ceiling alarms on your head unit so you can't drift into yellow on green days",
      "Ride the first quality session honestly — flat heart rate, conversational, appetite at the end",
      "Log RPE 1–10 immediately after every session for the whole week",
    ],
    resources: [
      { kind: "pdf", title: "Weekly Training Architecture — 6 Hour", href: "/method/resources/02-architecture-6hr.pdf" },
      { kind: "pdf", title: "Weekly Training Architecture — 8 Hour", href: "/method/resources/02-architecture-8hr.pdf" },
      { kind: "pdf", title: "Weekly Training Architecture — 10 Hour", href: "/method/resources/02-architecture-10hr.pdf" },
      { kind: "pdf", title: "Weekly Training Architecture — 12 Hour", href: "/method/resources/02-architecture-12hr.pdf" },
      { kind: "pdf", title: "The Roadman Session Library", href: "/method/resources/02-session-library.pdf" },
      { kind: "training-peaks", title: "Premium plan — Polarised Base Block", href: "/method/training-peaks/polarised-base" },
    ],
    discussionUrl: null,
  },
  {
    slug: "03-fuelling-the-engine",
    weekIndex: 3,
    title: "Fuelling the Engine",
    subtitle: "Why \"calories in, calories out\" is the reason you're not getting faster",
    oneLiner: "Daily fuelling, in-ride carbs, protein timing, and the architecture that supports the work.",
    pillar: "nutrition",
    unlocksOnDayOffset: 14,
    videoYouTubeId: null,
    protocolMdxPath: "content/method/protocols/03-fuelling-the-engine.mdx",
    estimatedReadMinutes: 24,
    keyExperts: ["Dr David Dunne", "Dr Sarah Berry", "Alistair Brownlee"],
    learningOutcomes: [
      "Understand why chronic under-fuelling tanks adaptation in cyclists",
      "Build a daily fuelling framework that supports training quality and body composition together",
      "Decide between training to train and training to perform on every session",
      "Master in-ride carbohydrate targets from 30 to 120 grams per hour by session type",
    ],
    checklist: [
      "Read the Fuelling the Engine guide and complete the daily fuelling self-assessment",
      "Set a training-day carb floor based on your bracket (numbers in the workbook)",
      "Hit a carb-per-hour target on every ride this week — log it",
      "Add a real breakfast to every training day — not just a coffee and a banana",
      "Front-load protein at breakfast — 30g minimum at the first meal of the day",
      "Eat a protein-led snack within an hour of the long ride finishing",
      "Identify one training-to-train session and one training-to-perform session this week and fuel them differently",
    ],
    resources: [
      { kind: "pdf", title: "Daily Fuelling Framework Template", href: "/method/resources/03-daily-fuelling-framework.pdf" },
      { kind: "pdf", title: "In-Ride Nutrition Calculator", href: "/method/resources/03-in-ride-nutrition-calculator.pdf" },
      { kind: "pdf", title: "Race Week Nutrition Planner", href: "/method/resources/03-race-week-nutrition.pdf" },
      { kind: "pdf", title: "Performance Grocery Guide", href: "/method/resources/03-performance-grocery-guide.pdf" },
    ],
    discussionUrl: null,
  },
  {
    slug: "04-strength-that-transfers",
    weekIndex: 4,
    title: "Strength That Transfers to the Pedals",
    subtitle: "Two sessions a week, the right exercises, no wrecked legs",
    oneLiner: "Cycling-specific S&C — Foundation Phase, dumbbell-led, masters-safe.",
    pillar: "strength",
    unlocksOnDayOffset: 21,
    videoYouTubeId: null,
    protocolMdxPath: "content/method/protocols/04-strength-that-transfers.mdx",
    estimatedReadMinutes: 28,
    keyExperts: ["Derek Teel", "Anthony Walsh"],
    learningOutcomes: [
      "Understand why strength training improves cycling performance — including endurance",
      "Build a cycling-specific S&C programme that fits into two 30-minute sessions per week",
      "Identify and correct the muscle compensations that are leaking watts on the bike",
      "Periodise strength alongside cycling so the two complement each other instead of competing",
    ],
    checklist: [
      "Read the S&C Manual and watch the exercise demos before your first session",
      "Schedule two 30-minute strength sessions in the calendar for this week — non-negotiable slots",
      "Run the Foundation Phase circuit twice this week — full-body, controlled, not failure",
      "Pair strength with an easy ride day, not a long ride or quality session",
      "Eat 30g of protein within 90 minutes of finishing each strength session",
      "Take a video of one set per exercise — form check, post in the community thread for feedback",
      "Log how the legs feel on the next ride after each session",
    ],
    resources: [
      { kind: "pdf", title: "The Roadman S&C Manual", href: "/method/resources/04-sc-manual.pdf" },
      { kind: "pdf", title: "Foundation Phase Circuit Card", href: "/method/resources/04-foundation-circuit.pdf" },
      { kind: "pdf", title: "Exercise Demo Quick-Reference", href: "/method/resources/04-exercise-demos.pdf" },
      { kind: "pdf", title: "S&C Integration Calendar (12 weeks)", href: "/method/resources/04-sc-integration-calendar.pdf" },
    ],
    discussionUrl: null,
  },
  {
    slug: "05-recovery-multiplier",
    weekIndex: 5,
    title: "The Art of Getting Faster by Doing Less",
    subtitle: "Adaptation is where improvement happens — and almost everyone gets it wrong",
    oneLiner: "Sleep, daily readiness, and why recovery is the highest-leverage thing in the system.",
    pillar: "recovery",
    unlocksOnDayOffset: 28,
    videoYouTubeId: null,
    protocolMdxPath: "content/method/protocols/05-recovery-multiplier.mdx",
    estimatedReadMinutes: 22,
    keyExperts: [
      "Professor Stephen Seiler",
      "Dan Lorang",
      "Alistair Brownlee",
      "Derek Teel",
    ],
    learningOutcomes: [
      "Understand why the training is the stimulus and recovery is where the gain is laid down",
      "Build a sleep protocol that improves training adaptation more than any device or supplement",
      "Distinguish productive fatigue from accumulated overreach",
      "Use a daily readiness check to make smart go / no-go decisions on hard days",
    ],
    checklist: [
      "Set a non-negotiable lights-out time that gives you 7.5 hours minimum in bed",
      "Log seven nights of sleep with the readiness template — note bedtime, wake time, and a 1–10 quality score",
      "Take a morning HRV or resting heart rate every day this week — same time, same conditions",
      "Run the daily readiness self-check before any quality session this week",
      "Plan one full off-day this week — no easy ride, no strength, no \"active recovery\"",
      "Cut alcohol on training nights for the next four weeks",
      "Audit life stress: write down the three biggest non-cycling stressors in your week and how they map to your training calendar",
    ],
    resources: [
      { kind: "pdf", title: "Sleep Optimisation Checklist", href: "/method/resources/05-sleep-optimisation.pdf" },
      { kind: "pdf", title: "Daily Readiness Score Template", href: "/method/resources/05-daily-readiness.pdf" },
      { kind: "pdf", title: "Recovery Week Structure Guide", href: "/method/resources/05-recovery-week.pdf" },
      { kind: "pdf", title: "HRV Interpretation Quick Guide", href: "/method/resources/05-hrv-quick-guide.pdf" },
    ],
    discussionUrl: null,
  },
  {
    slug: "06-le-metier",
    weekIndex: 6,
    title: "Le Metier: The Craft",
    subtitle: "The mid-course pivot — pacing, positioning, and why we ride",
    oneLiner: "Mid-course progress check, the craft of riding, and reconnecting with why.",
    pillar: "community",
    unlocksOnDayOffset: 35,
    videoYouTubeId: null,
    protocolMdxPath: "content/method/protocols/06-le-metier.mdx",
    estimatedReadMinutes: 22,
    keyExperts: ["Lachlan Morton", "Anthony Walsh"],
    learningOutcomes: [
      "Run a mid-course progress check against the Week 1 baseline",
      "Recalibrate the 12-week target if the data demands it",
      "Learn the pacing strategies that separate strong climbers from blow-up specialists",
      "Reconnect with the reason you ride — purpose, joy, community over metrics",
    ],
    checklist: [
      "Complete the Mid-Course Progress Check Worksheet — same six domains as Week 1",
      "Compare your Week 6 numbers against your Week 1 baseline and write three honest sentences about what changed",
      "Recalibrate your 12-week goal if the data has moved meaningfully — up or down",
      "Plan one ride this week with no power meter visible — phone face-down, head unit on time only",
      "Schedule a coffee ride or a club ride that's not a session",
      "Pick the next group ride or sportive on your calendar and write the pacing plan in advance using the Pacing Cards",
      "Read the Le Metier guide and post one reflection in the community",
    ],
    resources: [
      { kind: "pdf", title: "Mid-Course Progress Check Worksheet", href: "/method/resources/06-mid-course-check.pdf" },
      { kind: "pdf", title: "Pacing Strategy Cards (climbs / TT / group / sportive)", href: "/method/resources/06-pacing-cards.pdf" },
      { kind: "pdf", title: "The Roadman Climbing Checklist", href: "/method/resources/06-climbing-checklist.pdf" },
      { kind: "pdf", title: "Goal Recalibration Template", href: "/method/resources/06-goal-recalibration.pdf" },
      { kind: "training-peaks", title: "Premium plan — Mid-Course Adjustment", href: "/method/training-peaks/mid-course-adjust" },
    ],
    discussionUrl: null,
  },
  {
    slug: "07-periodisation",
    weekIndex: 7,
    title: "Periodisation: Training That Goes Somewhere",
    subtitle: "Stop training in circles — build mesocycles that compound",
    oneLiner: "Three-phase periodisation, the 3:1 mesocycle, and how to plan a season.",
    pillar: "coaching",
    unlocksOnDayOffset: 42,
    videoYouTubeId: null,
    protocolMdxPath: "content/method/protocols/07-periodisation.mdx",
    estimatedReadMinutes: 26,
    keyExperts: ["Dan Lorang", "Professor Stephen Seiler", "Joe Friel"],
    learningOutcomes: [
      "Understand the three-phase periodisation model and how to apply it to your goals",
      "Structure mesocycles — three to four-week blocks with progression and recovery built in",
      "Know when to prioritise volume, when to prioritise intensity, when to back off",
      "Build a season plan that arrives at your target event in the best possible form",
    ],
    checklist: [
      "Read the Periodisation Blueprint and identify your current phase (Base / Build / Peak)",
      "Map your next 12 weeks into mesocycles using the Season Planning Template",
      "Lock in three weeks of progressive load followed by one recovery week — repeat",
      "Add the first sub-threshold sweet-spot session of the course this week",
      "Keep the long Z2 ride in place — duration is doing the heavy lifting in the Build phase",
      "Hold strength at two sessions per week with stable load",
      "Log a weekly RPE summary on Sunday — front-loaded effort, finishing fresh",
    ],
    resources: [
      { kind: "pdf", title: "Season Planning Template", href: "/method/resources/07-season-plan.pdf" },
      { kind: "pdf", title: "Mesocycle Builder Worksheet", href: "/method/resources/07-mesocycle-builder.pdf" },
      { kind: "pdf", title: "Training Phase Cheat Sheet", href: "/method/resources/07-phase-cheat-sheet.pdf" },
      { kind: "training-peaks", title: "Premium plan — Build Block", href: "/method/training-peaks/build-block" },
    ],
    discussionUrl: null,
  },
  {
    slug: "08-race-weight",
    weekIndex: 8,
    title: "Race Weight Without the Misery",
    subtitle: "Body composition the slow way — deficit windows that protect output",
    oneLiner: "Body composition handled with precision, never restriction.",
    pillar: "nutrition",
    unlocksOnDayOffset: 49,
    videoYouTubeId: null,
    protocolMdxPath: "content/method/protocols/08-race-weight.mdx",
    estimatedReadMinutes: 26,
    keyExperts: ["Dr David Dunne", "Dr Sarah Berry", "Anthony Walsh"],
    learningOutcomes: [
      "Understand why traditional eat-less / ride-more approaches fail for serious cyclists",
      "Use deficit windows that protect training quality and recovery",
      "Build a sustainable nutrition approach that supports both performance and a leaner physique",
      "Know when to chase weight and — just as importantly — when not to",
    ],
    checklist: [
      "Read the Race Weight Reality guide and decide whether this block is the right time for a deficit",
      "If yes, target a 200–300 kcal deficit on easy days only — never on quality or long ride days",
      "Hit your protein floor — 1.8–2.2g per kg of body weight per day, every day",
      "Front-load carbs at breakfast and around training, taper carbs at dinner on easy days",
      "Track the trend, not the daily number — weigh weekly average, not daily highs",
      "Take Week 8 reference photos and waist measurement for comparison with Week 1",
      "Audit alcohol — the simplest body composition lever for most riders",
    ],
    resources: [
      { kind: "pdf", title: "Body Composition Tracking Template", href: "/method/resources/08-body-comp-tracking.pdf" },
      { kind: "pdf", title: "The Performance Plate Guide", href: "/method/resources/08-performance-plate.pdf" },
      { kind: "pdf", title: "Race Weight Timeline Planner", href: "/method/resources/08-race-weight-timeline.pdf" },
    ],
    discussionUrl: null,
  },
  {
    slug: "09-power-where-it-counts",
    weekIndex: 9,
    title: "Building Power Where It Counts",
    subtitle: "Low-cadence torque, type 2 fibres, and the session that changes everything",
    oneLiner: "Torque intervals, on-bike power development, and the second pass at strength.",
    pillar: "strength",
    unlocksOnDayOffset: 56,
    videoYouTubeId: null,
    protocolMdxPath: "content/method/protocols/09-power-where-it-counts.mdx",
    estimatedReadMinutes: 26,
    keyExperts: ["John Wakefield", "Tim Kerrison", "Dan Lorang", "Anthony Walsh"],
    learningOutcomes: [
      "Master the low-cadence torque protocols used by Bora-Hansgrohe and Team Sky / Ineos coaches",
      "Understand how muscle fibre recruitment drives power — and how to train both type 1 and type 2 for cycling",
      "Build a power development block that targets your specific limiter",
      "Integrate on-bike power work with the gym strength foundation from Week 4",
    ],
    checklist: [
      "Read the Power Development guide and identify your power limiter (sustained, climbing, sprint, endurance)",
      "Find the right climb or stretch of road for low-cadence torque work — 4–7% gradient, sustained",
      "Run Session 1 — 4 × 4 minutes at 40–60 RPM, RPE 7/10, 4 min recovery",
      "Run Session 2 later in the week — 3 × 8 minutes at 50–65 RPM on flatter terrain",
      "Hold strength at two sessions a week, drop the rep volume slightly to manage cumulative fatigue",
      "Fuel the torque sessions properly — these are quality, treat them like quality",
      "Log RPE and average power on the torque sessions",
    ],
    resources: [
      { kind: "pdf", title: "Low-Cadence Torque Interval Cards (climb + flat)", href: "/method/resources/09-torque-cards.pdf" },
      { kind: "pdf", title: "Power Profile Self-Assessment", href: "/method/resources/09-power-profile.pdf" },
      { kind: "pdf", title: "S&C Phase 3 — Maintain", href: "/method/resources/09-sc-phase-3.pdf" },
      { kind: "training-peaks", title: "Premium plan — Power Development Block", href: "/method/training-peaks/power-block" },
    ],
    discussionUrl: null,
  },
  {
    slug: "10-the-brain-is-the-limiter",
    weekIndex: 10,
    title: "The Brain Is the Limiter",
    subtitle: "Pacing perception, suffering, and the head game that decides every climb",
    oneLiner: "Mental performance — pre-ride routine, in-ride self-talk, the stress audit.",
    pillar: "recovery",
    unlocksOnDayOffset: 63,
    videoYouTubeId: null,
    protocolMdxPath: "content/method/protocols/10-the-brain-is-the-limiter.mdx",
    estimatedReadMinutes: 22,
    keyExperts: ["Anthony Walsh", "Lachlan Morton", "Derek Teel"],
    learningOutcomes: [
      "Understand why your brain limits performance before your body does",
      "Build a pre-ride and pre-event mental preparation routine",
      "Use specific self-talk techniques to change your experience of suffering",
      "Map life stress against training load to find your real recovery blind spots",
    ],
    checklist: [
      "Read the Mental Performance Playbook and pick one technique to test this week",
      "Run the pre-ride mental preparation routine before every quality session this week",
      "Use the in-ride self-talk framework on one climb that usually breaks you",
      "Complete the Stress Audit — three biggest non-cycling stressors mapped to the training calendar",
      "Write your pacing plan for the next event in advance — not in your head, on paper",
      "Practice one full quality session with no power data visible — only RPE and heart rate",
      "Run the 3-2-1 Race Prep Protocol if you have an event this week or next",
    ],
    resources: [
      { kind: "pdf", title: "Pre-Event Mental Preparation Checklist", href: "/method/resources/10-pre-event-mental.pdf" },
      { kind: "pdf", title: "In-Ride Self-Talk Framework", href: "/method/resources/10-self-talk-framework.pdf" },
      { kind: "pdf", title: "Stress Audit Template", href: "/method/resources/10-stress-audit.pdf" },
      { kind: "pdf", title: "3-2-1 Race Prep Protocol", href: "/method/resources/10-race-prep-protocol.pdf" },
    ],
    discussionUrl: null,
  },
  {
    slug: "11-your-system-integrated",
    weekIndex: 11,
    title: "Your System, Integrated",
    subtitle: "Becoming your own best coach",
    oneLiner: "Self-coaching — the weekly review, the decision tree, the next mesocycle.",
    pillar: "coaching",
    unlocksOnDayOffset: 70,
    videoYouTubeId: null,
    protocolMdxPath: "content/method/protocols/11-your-system-integrated.mdx",
    estimatedReadMinutes: 24,
    keyExperts: ["Anthony Walsh", "Dan Lorang", "Professor Stephen Seiler"],
    learningOutcomes: [
      "Build a decision-making framework for weekly training adjustments",
      "Modify training when life interferes — travel, illness, work stress, family",
      "Run a 15-minute weekly self-coaching review that keeps you on track",
      "Plan the first mesocycle after the course ends with the same rigour as the in-course weeks",
    ],
    checklist: [
      "Run the Weekly Self-Coaching Review for the past week using the template in your downloads",
      "Walk through the Decision Tree Cards for three scenarios you've actually faced (missed session, illness, travel)",
      "Plan your first post-course mesocycle using the Mesocycle Builder Worksheet",
      "Identify the one piece of the system that's been hardest to maintain and write your fix",
      "Schedule your Week 12 Exit Assessment in the calendar — same time, same conditions as Week 1",
      "Decide which training metric you'll watch in the next phase — pick one, not five",
      "Read the Self-Coaching Manual and answer the three reflection prompts at the back",
    ],
    resources: [
      { kind: "pdf", title: "Weekly Self-Coaching Review Template", href: "/method/resources/11-weekly-review.pdf" },
      { kind: "pdf", title: "Decision Tree Cards", href: "/method/resources/11-decision-cards.pdf" },
      { kind: "pdf", title: "Next-Phase Mesocycle Planner", href: "/method/resources/11-next-phase-planner.pdf" },
      { kind: "pdf", title: "The Roadman Method Framework Summary", href: "/method/resources/11-framework-summary.pdf" },
      { kind: "training-peaks", title: "Premium plan — Self-Coaching Review", href: "/method/training-peaks/self-coaching-review" },
    ],
    discussionUrl: null,
  },
  {
    slug: "12-not-done-yet",
    weekIndex: 12,
    title: "Not Done Yet",
    subtitle: "The Exit Assessment, the reflection, and what comes next",
    oneLiner: "Measure, reflect, and plan the next 90 days — the start line, not the finish line.",
    pillar: "community",
    unlocksOnDayOffset: 77,
    videoYouTubeId: null,
    protocolMdxPath: "content/method/protocols/12-not-done-yet.mdx",
    estimatedReadMinutes: 22,
    keyExperts: [
      "Anthony Walsh",
      "Lachlan Morton",
      "Professor Stephen Seiler",
    ],
    learningOutcomes: [
      "Complete the Exit Assessment and measure progress against your Week 1 baseline",
      "Review development across all five pillars with a structured reflection framework",
      "Build a 90-day forward plan that continues the momentum",
      "Decide what role the Not Done Yet community plays in the next phase",
    ],
    checklist: [
      "Complete the Exit Assessment Workbook — same six domains as Week 1, same conditions",
      "Compare your Week 12 numbers to Week 1 baseline and write the honest summary",
      "Take Week 12 reference photos, waist measurement and weight (same time of day)",
      "Run the 12-Week Review reflection — write three to five sentences per pillar",
      "Build the 90-Day Forward Plan using the template in your downloads",
      "Pick the single most important habit to carry forward into the next 12 weeks",
      "Post your before/after summary in the community thread",
    ],
    resources: [
      { kind: "pdf", title: "Exit Assessment Workbook", href: "/method/resources/12-exit-assessment.pdf" },
      { kind: "pdf", title: "12-Week Progress Report Template", href: "/method/resources/12-progress-report.pdf" },
      { kind: "pdf", title: "90-Day Forward Plan Template", href: "/method/resources/12-90-day-plan.pdf" },
      { kind: "pdf", title: "Roadman Method Resource Library (consolidated)", href: "/method/resources/12-resource-library.pdf" },
      { kind: "training-peaks", title: "Premium plan — Post-Course Review", href: "/method/training-peaks/post-course-review" },
    ],
    discussionUrl: null,
  },
] as const;

export const METHOD_MODULE_BY_SLUG: ReadonlyMap<string, MethodModule> = new Map(
  METHOD_MODULES.map((m) => [m.slug, m]),
);

export function getMethodModule(slug: string): MethodModule | null {
  return METHOD_MODULE_BY_SLUG.get(slug) ?? null;
}

export const METHOD_TOTAL_MODULES = METHOD_MODULES.length;
