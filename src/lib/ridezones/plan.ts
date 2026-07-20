/**
 * Goal-specific week generator.
 *
 * The session library encodes the patterns Anthony has pulled out of the
 * podcast's coaching network — Wakefield's torque intervals, the 4×8s from
 * Seiler's interval research, Lorang-style Zone 2 discipline — scaled to
 * the rider's zones, hours, and the fitness profile's named focus. Not an
 * AI improvising workouts: a fixed library, chosen deterministically.
 */

import { clamp, round1 } from "./load";
import type {
  GoalKey,
  PlannedSession,
  RiderSettings,
  SessionTarget,
  SystemKey,
  WeekPlan,
} from "./types";

type SessionKey =
  | "z2-discipline"
  | "long-ride"
  | "recovery-spin"
  | "torque-intervals"
  | "sweet-spot-2x20"
  | "threshold-4x8"
  | "vo2-5x3"
  | "tempo-steady";

interface SessionDef {
  key: SessionKey;
  title: string;
  purpose: PlannedSession["purpose"];
  structure: string;
  whyItWorks: string;
  preRideAdvice: string;
  expertRef?: string;
  targets: (s: RiderSettings) => SessionTarget[];
  duration: (weeklyHours: number) => number; // minutes
}

function powerTarget(settings: RiderSettings, lowPct: number, highPct: number): SessionTarget {
  return {
    kind: "power",
    text: `${Math.round((lowPct / 100) * settings.ftp)}–${Math.round((highPct / 100) * settings.ftp)}W (${lowPct}–${highPct}% FTP)`,
  };
}

function hrTarget(settings: RiderSettings, lowPct: number, highPct: number): SessionTarget | null {
  if (!settings.lthr) return null;
  return {
    kind: "hr",
    text: `${Math.round((lowPct / 100) * settings.lthr)}–${Math.round((highPct / 100) * settings.lthr)} bpm`,
  };
}

function compact(targets: Array<SessionTarget | null>): SessionTarget[] {
  return targets.filter((t): t is SessionTarget => t !== null);
}

const LIBRARY: Record<SessionKey, SessionDef> = {
  "z2-discipline": {
    key: "z2-discipline",
    title: "Zone 2 Discipline Ride",
    purpose: "endurance",
    structure:
      "Steady Zone 2 the whole way. Flat or rolling terrain. If the road tilts up, shift down — the number on the screen doesn't move.",
    whyItWorks:
      "This is the 80% of pro training nobody sees: mitochondrial density, fat oxidation, aerobic base. The adaptation only comes if the ride stays genuinely easy.",
    preRideAdvice:
      "Cap it before you clip in: pick your ceiling watts and treat them as a red light, not a suggestion. Conversation pace — full sentences, not gasps.",
    expertRef: "Prof. Stephen Seiler / Dan Lorang",
    targets: (s) =>
      compact([powerTarget(s, 56, 75), hrTarget(s, 69, 83), { kind: "rpe", text: "RPE 3–4 — conversational" }]),
    duration: (h) => clamp(Math.round(h * 9), 60, 120),
  },
  "long-ride": {
    key: "long-ride",
    title: "Long Aerobic Ride",
    purpose: "long-ride",
    structure:
      "Long steady ride, upper Zone 2. Last 45 minutes: hold the same power while fatigued — that's the durability stimulus, don't sprint the town sign.",
    whyItWorks:
      "Durability — holding power when you're already tired — separates riders who finish strong from riders who survive. It's trained by time, not intensity.",
    preRideAdvice:
      "Fuel like it matters: 60–90g of carbs per hour from the first hour, not when you feel empty. Under-fuelling this ride cancels the adaptation.",
    targets: (s) =>
      compact([powerTarget(s, 60, 75), hrTarget(s, 72, 83), { kind: "rpe", text: "Steady — finish tired, not destroyed" }]),
    duration: (h) => clamp(Math.round(h * 22), 120, 300),
  },
  "recovery-spin": {
    key: "recovery-spin",
    title: "Recovery Spin",
    purpose: "recovery",
    structure: "Very easy spinning, high cadence, flat route or trainer. No targets to chase.",
    whyItWorks:
      "Adaptation happens in recovery, not in training. This ride exists to move blood, not to earn anything.",
    preRideAdvice:
      "If your legs feel heavy enough that even this feels like work, swap it for a rest day. That's not weakness — that's reading the data.",
    targets: (s) => compact([powerTarget(s, 0, 55), { kind: "rpe", text: "RPE 1–2 — embarrassingly easy" }]),
    duration: () => 45,
  },
  "torque-intervals": {
    key: "torque-intervals",
    title: "Torque Intervals",
    purpose: "tempo",
    structure:
      "4 × 4 min at 40–60 RPM on a 4–7% climb (or big gear on the trainer), RPE 7. 4 min easy spinning between reps. Stay seated, upper body quiet.",
    whyItWorks:
      "Low-cadence work recruits fast-twitch fibres at aerobic intensity — the 2024 Habis study in PLOS ONE measured an 8.7% VO2max gain versus 4.6% at free cadence. The coaches were prescribing it before the science caught up.",
    preRideAdvice:
      "The number that matters is cadence, not power. If your knees complain, raise the cadence ceiling to 60 and shorten the reps — this loads muscles, it shouldn't load joints.",
    expertRef: "John Wakefield (Bora-Hansgrohe)",
    targets: (s) =>
      compact([
        { kind: "cadence", text: "40–60 RPM on the reps" },
        powerTarget(s, 80, 95),
        { kind: "rpe", text: "RPE 7 — strong but controlled" },
      ]),
    duration: () => 75,
  },
  "sweet-spot-2x20": {
    key: "sweet-spot-2x20",
    title: "Sweet Spot 2×20",
    purpose: "sweet-spot",
    structure:
      "15 min warm-up building through Zone 2. 2 × 20 min at 88–93% FTP with 8 min easy between. Cool down easy.",
    whyItWorks:
      "Sweet spot buys most of threshold's adaptation at a fraction of its fatigue cost — which is why time-crunched riders get so much from it.",
    preRideAdvice:
      "Start the first rep at the bottom of the range. The session is a success if rep two matches rep one — not if rep one is a hero effort.",
    targets: (s) => compact([powerTarget(s, 88, 93), hrTarget(s, 92, 100), { kind: "rpe", text: "RPE 6–7" }]),
    duration: () => 90,
  },
  "threshold-4x8": {
    key: "threshold-4x8",
    title: "Threshold 4×8",
    purpose: "threshold",
    structure:
      "15 min warm-up with 3 × 30s openers. 4 × 8 min at 100–105% FTP, 4 min easy between. Cool down 10 min.",
    whyItWorks:
      "In Seiler's interval study, 4×8 produced the biggest gains of every protocol tested — hard enough to push threshold, long enough to accumulate real time there. 32 minutes of stimulus in a 90-minute ride.",
    preRideAdvice:
      "Ride reps one and two like you've got four to do — because you do. The session lives or dies on the last two reps, and pacing is the whole skill.",
    expertRef: "Prof. Stephen Seiler",
    targets: (s) => compact([powerTarget(s, 100, 105), hrTarget(s, 99, 105), { kind: "rpe", text: "RPE 8 — hard but repeatable" }]),
    duration: () => 90,
  },
  "vo2-5x3": {
    key: "vo2-5x3",
    title: "VO2 5×3",
    purpose: "vo2",
    structure:
      "15 min warm-up with openers. 5 × 3 min at 115–120% FTP, 3 min easy between. Cool down properly — this one leaves a mark.",
    whyItWorks:
      "VO2max is the ceiling every other adaptation lives under. Three-minute reps hit maximal oxygen uptake by the back half of each effort — that exposure is the point.",
    preRideAdvice:
      "Fresh legs or don't bother: this session needs quality, and quality needs freshness. If yesterday was hard, swap today and tomorrow.",
    targets: (s) => compact([powerTarget(s, 115, 120), { kind: "rpe", text: "RPE 9 — the last minute of each rep should argue with you" }]),
    duration: () => 75,
  },
  "tempo-steady": {
    key: "tempo-steady",
    title: "Controlled Tempo",
    purpose: "tempo",
    structure:
      "20 min warm-up, then 2 × 15 min at 80–87% FTP with 10 min easy between. This is tempo with a fence around it — on purpose, then done.",
    whyItWorks:
      "Deliberate tempo builds muscular endurance and race-pace economy. The fence matters: tempo as a session is a tool, tempo as a habit is the grey zone.",
    preRideAdvice:
      "Watch the second rep — if power's fine but heart rate is drifting more than a few beats, call it there. Drift is data.",
    targets: (s) => compact([powerTarget(s, 80, 87), hrTarget(s, 85, 94), { kind: "rpe", text: "RPE 5–6" }]),
    duration: () => 80,
  },
};

/** Weekly templates per goal, in priority order (lowest hours drop from the end). */
const GOAL_TEMPLATES: Record<GoalKey, Array<{ day: string; session: SessionKey }>> = {
  "gran-fondo": [
    { day: "Sat", session: "long-ride" },
    { day: "Tue", session: "sweet-spot-2x20" },
    { day: "Sun", session: "z2-discipline" },
    { day: "Thu", session: "torque-intervals" },
    { day: "Wed", session: "z2-discipline" },
    { day: "Fri", session: "recovery-spin" },
  ],
  "road-race": [
    { day: "Tue", session: "vo2-5x3" },
    { day: "Sat", session: "long-ride" },
    { day: "Thu", session: "threshold-4x8" },
    { day: "Sun", session: "z2-discipline" },
    { day: "Wed", session: "recovery-spin" },
    { day: "Fri", session: "z2-discipline" },
  ],
  "ftp-breakthrough": [
    { day: "Tue", session: "threshold-4x8" },
    { day: "Sat", session: "long-ride" },
    { day: "Thu", session: "sweet-spot-2x20" },
    { day: "Sun", session: "z2-discipline" },
    { day: "Wed", session: "recovery-spin" },
    { day: "Fri", session: "z2-discipline" },
  ],
  "base-season": [
    { day: "Sat", session: "long-ride" },
    { day: "Sun", session: "z2-discipline" },
    { day: "Tue", session: "torque-intervals" },
    { day: "Wed", session: "z2-discipline" },
    { day: "Thu", session: "tempo-steady" },
    { day: "Fri", session: "recovery-spin" },
  ],
};

/** When a system is the named focus, this session gets promoted into the week. */
const FOCUS_SWAPS: Partial<Record<SystemKey, SessionKey>> = {
  "vo2-engine": "vo2-5x3",
  "threshold-power": "threshold-4x8",
  durability: "long-ride",
  "zone2-engine": "z2-discipline",
  "easy-discipline": "z2-discipline",
  "tempo-control": "sweet-spot-2x20",
};

const DAY_ORDER = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function buildWeekPlan(
  settings: RiderSettings,
  focusSystem: SystemKey,
  currentTsb: number
): WeekPlan {
  const template = [...GOAL_TEMPLATES[settings.goal]];

  // Promote the focus session if the goal template doesn't already carry it.
  const swap = FOCUS_SWAPS[focusSystem];
  if (swap && !template.some((t) => t.session === swap)) {
    // Replace the lowest-priority intensity slot rather than adding load.
    const idx = template.findIndex(
      (t, i) => i >= 2 && LIBRARY[t.session].purpose !== "long-ride" && LIBRARY[t.session].purpose !== "recovery"
    );
    if (idx >= 0) template[idx] = { day: template[idx].day, session: swap };
  }

  // Fit the week to available hours by dropping lowest-priority slots.
  const kept: typeof template = [];
  let minutes = 0;
  const budget = settings.weeklyHours * 60;
  for (const slot of template) {
    const dur = LIBRARY[slot.session].duration(settings.weeklyHours);
    if (minutes + dur <= budget * 1.08 || kept.length < 3) {
      kept.push(slot);
      minutes += dur;
    }
  }

  const fatigued = currentTsb < -20;
  const sessions: PlannedSession[] = kept
    .map((slot) => {
      const def = LIBRARY[slot.session];
      return {
        id: `${slot.day}-${def.key}`,
        day: slot.day,
        title: def.title,
        purpose: def.purpose,
        durationMin: def.duration(settings.weeklyHours),
        structure: def.structure,
        targets: def.targets(settings),
        whyItWorks: def.whyItWorks,
        preRideAdvice: def.preRideAdvice,
        expertRef: def.expertRef,
      };
    })
    .sort((a, b) => DAY_ORDER.indexOf(a.day) - DAY_ORDER.indexOf(b.day));

  // A deeply negative TSB converts the week's second intensity day to recovery.
  if (fatigued) {
    const intensityDays = sessions.filter(
      (s) => s.purpose !== "endurance" && s.purpose !== "long-ride" && s.purpose !== "recovery"
    );
    if (intensityDays.length > 1) {
      const demoted = intensityDays[intensityDays.length - 1];
      const rec = LIBRARY["recovery-spin"];
      const idx = sessions.indexOf(demoted);
      sessions[idx] = {
        ...sessions[idx],
        title: rec.title,
        purpose: rec.purpose,
        durationMin: rec.duration(settings.weeklyHours),
        structure: rec.structure,
        targets: rec.targets(settings),
        whyItWorks: rec.whyItWorks,
        preRideAdvice: rec.preRideAdvice,
        expertRef: undefined,
      };
    }
  }

  const totalHours = round1(sessions.reduce((sum, s) => sum + s.durationMin, 0) / 60);

  return {
    goal: settings.goal,
    focusSystem,
    sessions,
    totalHours,
    weekNote: fatigued
      ? `Your form is at ${Math.round(currentTsb)} TSB — you're carrying real fatigue. This week trades one hard day for recovery, because the session you absorb beats the session you survive.`
      : `Built for your ${settings.weeklyHours}h week and your named focus. Ride the easy days easy and the hard days will take care of themselves.`,
  };
}

export const SESSION_LIBRARY = LIBRARY;

/** Plain-text week for pasting into a training diary, TrainingPeaks note, or the club chat. */
export function formatWeekPlanText(plan: WeekPlan): string {
  const lines: string[] = [
    `RideZones training week — ${plan.totalHours}h across ${plan.sessions.length} sessions`,
    `Focus: ${plan.focusSystem.replace(/-/g, " ")}`,
    "",
  ];
  for (const session of plan.sessions) {
    lines.push(`${session.day} — ${session.title} (${session.durationMin} min)`);
    lines.push(`  ${session.structure}`);
    lines.push(`  Targets: ${session.targets.map((t) => t.text).join(" · ")}`);
    lines.push("");
  }
  lines.push("Built with RideZones — roadmancycling.com/ridezones");
  return lines.join("\n");
}
