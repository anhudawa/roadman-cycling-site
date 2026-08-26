"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Header, Footer, Section, Container } from "@/components/layout";
import { Button } from "@/components/ui";
import { ToolLanding } from "@/components/features/tools/ToolLanding";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type TrainingGoal =
  | "vo2max"
  | "threshold"
  | "sweet-spot"
  | "tempo"
  | "sprint"
  | "endurance";

type ExperienceLevel = "beginner" | "intermediate" | "advanced";

interface IntervalBlock {
  name: string;
  durationMin: number;
  powerMinPct: number;
  powerMaxPct: number;
  cadenceMin: number;
  cadenceMax: number;
  rpe: string;
  color: string;
  repeat?: number;
  recoveryDurationMin?: number;
  recoveryPowerMinPct?: number;
  recoveryPowerMaxPct?: number;
}

interface Session {
  id: string;
  name: string;
  goal: TrainingGoal;
  minTime: number;
  maxTime: number;
  minLevel: ExperienceLevel;
  blocks: IntervalBlock[];
  description: string;
  recoveryNote: string;
  attribution?: string;
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const GOAL_OPTIONS: { value: TrainingGoal; label: string }[] = [
  { value: "vo2max", label: "VO2max" },
  { value: "threshold", label: "Threshold" },
  { value: "sweet-spot", label: "Sweet Spot" },
  { value: "tempo", label: "Tempo" },
  { value: "sprint", label: "Sprint Power" },
  { value: "endurance", label: "Endurance" },
];

const TIME_OPTIONS = [30, 45, 60, 75, 90];

const LEVEL_OPTIONS: { value: ExperienceLevel; label: string }[] = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];

const LEVEL_RANK: Record<ExperienceLevel, number> = {
  beginner: 0,
  intermediate: 1,
  advanced: 2,
};

const GOAL_LABELS: Record<TrainingGoal, string> = {
  "vo2max": "VO2max",
  "threshold": "Threshold",
  "sweet-spot": "Sweet Spot",
  "tempo": "Tempo",
  "sprint": "Sprint Power",
  "endurance": "Endurance",
};

/* ------------------------------------------------------------------ */
/*  Session library                                                    */
/* ------------------------------------------------------------------ */

const SESSIONS: Session[] = [
  /* ---- VO2max ---- */
  {
    id: "vo2-classic-5x4",
    name: "Classic 5x4",
    goal: "vo2max",
    minTime: 60,
    maxTime: 90,
    minLevel: "beginner",
    blocks: [
      { name: "Warm-up", durationMin: 10, powerMinPct: 50, powerMaxPct: 65, cadenceMin: 80, cadenceMax: 95, rpe: "3", color: "#22C55E" },
      { name: "Work", durationMin: 4, powerMinPct: 106, powerMaxPct: 120, cadenceMin: 95, cadenceMax: 105, rpe: "9", color: "#F16363", repeat: 5, recoveryDurationMin: 4, recoveryPowerMinPct: 50, recoveryPowerMaxPct: 60 },
      { name: "Cool-down", durationMin: 5, powerMinPct: 50, powerMaxPct: 65, cadenceMin: 80, cadenceMax: 95, rpe: "2", color: "#22C55E" },
    ],
    description:
      "The gold standard VO2max session. Five 4-minute efforts push you to 90-100% of your maximum oxygen uptake, driving central cardiovascular adaptations - increased stroke volume, higher cardiac output, improved oxygen delivery to working muscles. The 4-minute duration is long enough to reach and sustain VO2max, which is the key stimulus for adaptation.",
    recoveryNote: "48-72 hours before your next high-intensity session. Easy spinning or rest day tomorrow.",
    attribution: "Based on Seiler's polarised training model",
  },
  {
    id: "vo2-short-sharp-8x2",
    name: "Short Sharp 8x2",
    goal: "vo2max",
    minTime: 45,
    maxTime: 75,
    minLevel: "beginner",
    blocks: [
      { name: "Warm-up", durationMin: 10, powerMinPct: 50, powerMaxPct: 65, cadenceMin: 80, cadenceMax: 95, rpe: "3", color: "#22C55E" },
      { name: "Work", durationMin: 2, powerMinPct: 115, powerMaxPct: 125, cadenceMin: 100, cadenceMax: 110, rpe: "9", color: "#F16363", repeat: 8, recoveryDurationMin: 2, recoveryPowerMinPct: 50, recoveryPowerMaxPct: 60 },
      { name: "Cool-down", durationMin: 5, powerMinPct: 50, powerMaxPct: 65, cadenceMin: 80, cadenceMax: 95, rpe: "2", color: "#22C55E" },
    ],
    description:
      "Shorter intervals at higher intensity. The 2-minute format lets you push harder than classic 4- or 5-minute blocks, targeting the fast component of VO2max kinetics. Total work time is 16 minutes - enough to accumulate significant time at VO2max despite the shorter individual efforts. Good for riders who struggle to pace longer VO2max intervals.",
    recoveryNote: "48-72 hours before the next hard session. Z2 or rest tomorrow.",
  },
  {
    id: "vo2-billat-6x3",
    name: "Billat 6x3",
    goal: "vo2max",
    minTime: 55,
    maxTime: 90,
    minLevel: "beginner",
    blocks: [
      { name: "Warm-up", durationMin: 10, powerMinPct: 50, powerMaxPct: 65, cadenceMin: 80, cadenceMax: 95, rpe: "3", color: "#22C55E" },
      { name: "Work", durationMin: 3, powerMinPct: 110, powerMaxPct: 120, cadenceMin: 95, cadenceMax: 105, rpe: "9", color: "#F16363", repeat: 6, recoveryDurationMin: 3, recoveryPowerMinPct: 50, recoveryPowerMaxPct: 60 },
      { name: "Cool-down", durationMin: 5, powerMinPct: 50, powerMaxPct: 65, cadenceMin: 80, cadenceMax: 95, rpe: "2", color: "#22C55E" },
    ],
    description:
      "Six 3-minute efforts with equal recovery - a format validated by Veronique Billat's research on time-at-VO2max. The 1:1 work-to-rest ratio keeps VO2 elevated even during recovery intervals, meaning you accumulate more total time near peak oxygen uptake than the raw work time suggests. A strong middle ground between the 5x4 and 8x2 formats.",
    recoveryNote: "48-72 hours before your next intensity session. Easy day or complete rest tomorrow.",
    attribution: "Based on Billat et al. research",
  },
  {
    id: "vo2-ronnestad-30-15",
    name: "Ronnestad 30/15s",
    goal: "vo2max",
    minTime: 60,
    maxTime: 90,
    minLevel: "advanced",
    blocks: [
      { name: "Warm-up", durationMin: 15, powerMinPct: 50, powerMaxPct: 65, cadenceMin: 80, cadenceMax: 95, rpe: "3", color: "#22C55E" },
      { name: "Set 1: 13x (30s on / 15s off)", durationMin: 10, powerMinPct: 130, powerMaxPct: 130, cadenceMin: 100, cadenceMax: 110, rpe: "9-10", color: "#F16363" },
      { name: "Set recovery", durationMin: 5, powerMinPct: 40, powerMaxPct: 50, cadenceMin: 80, cadenceMax: 90, rpe: "3", color: "#3B82F6" },
      { name: "Set 2: 13x (30s on / 15s off)", durationMin: 10, powerMinPct: 130, powerMaxPct: 130, cadenceMin: 100, cadenceMax: 110, rpe: "9-10", color: "#F16363" },
      { name: "Set recovery", durationMin: 5, powerMinPct: 40, powerMaxPct: 50, cadenceMin: 80, cadenceMax: 90, rpe: "3", color: "#3B82F6" },
      { name: "Set 3: 13x (30s on / 15s off)", durationMin: 10, powerMinPct: 130, powerMaxPct: 130, cadenceMin: 100, cadenceMax: 110, rpe: "9-10", color: "#F16363" },
      { name: "Cool-down", durationMin: 10, powerMinPct: 50, powerMaxPct: 65, cadenceMin: 80, cadenceMax: 95, rpe: "2", color: "#22C55E" },
    ],
    description:
      "Bent Ronnestad's short-interval protocol: 30 seconds at 130% FTP followed by 15 seconds at 50%, repeated 13 times per set across 3 sets. Research shows this format produces more time at VO2max than traditional long intervals because the brief recovery periods prevent complete desaturation while the high power demands force rapid re-recruitment of all available muscle fibres. Reserved for advanced riders due to the extreme metabolic stress.",
    recoveryNote: "72 hours minimum before the next hard session. Full rest day tomorrow is strongly recommended.",
    attribution: "Based on Ronnestad et al. 2014",
  },

  /* ---- Threshold ---- */
  {
    id: "threshold-classic-2x20",
    name: "Classic 2x20",
    goal: "threshold",
    minTime: 60,
    maxTime: 90,
    minLevel: "beginner",
    blocks: [
      { name: "Warm-up", durationMin: 10, powerMinPct: 50, powerMaxPct: 65, cadenceMin: 80, cadenceMax: 95, rpe: "3", color: "#22C55E" },
      { name: "Work", durationMin: 20, powerMinPct: 95, powerMaxPct: 105, cadenceMin: 85, cadenceMax: 95, rpe: "8", color: "#F16363", repeat: 2, recoveryDurationMin: 5, recoveryPowerMinPct: 50, recoveryPowerMaxPct: 60 },
      { name: "Cool-down", durationMin: 5, powerMinPct: 50, powerMaxPct: 65, cadenceMin: 80, cadenceMax: 95, rpe: "2", color: "#22C55E" },
    ],
    description:
      "The benchmark threshold session. Two 20-minute blocks at FTP produce maximal stimulus at the lactate steady state - the highest power your aerobic system can sustain. This session trains your body to clear lactate as fast as it produces it, directly raising your functional threshold. The 5-minute recovery is enough to partially clear fatigue without losing the metabolic environment that drives adaptation.",
    recoveryNote: "48-72 hours before the next threshold or VO2max session. Easy Z2 spin or rest day tomorrow.",
    attribution: "Based on Coggan's power training principles",
  },
  {
    id: "threshold-triple-15s",
    name: "Triple 15s",
    goal: "threshold",
    minTime: 60,
    maxTime: 90,
    minLevel: "beginner",
    blocks: [
      { name: "Warm-up", durationMin: 10, powerMinPct: 50, powerMaxPct: 65, cadenceMin: 80, cadenceMax: 95, rpe: "3", color: "#22C55E" },
      { name: "Work", durationMin: 15, powerMinPct: 95, powerMaxPct: 105, cadenceMin: 85, cadenceMax: 95, rpe: "8", color: "#F16363", repeat: 3, recoveryDurationMin: 5, recoveryPowerMinPct: 50, recoveryPowerMaxPct: 60 },
      { name: "Cool-down", durationMin: 5, powerMinPct: 50, powerMaxPct: 65, cadenceMin: 80, cadenceMax: 95, rpe: "2", color: "#22C55E" },
    ],
    description:
      "Same total time-at-threshold as 2x20 but broken into three shorter blocks. The 15-minute efforts are psychologically easier to hold, making this a strong option when you are introducing threshold work or coming back after a break. Slightly more recovery time overall, but the accumulated stress is comparable.",
    recoveryNote: "48-72 hours before the next hard session. Z2 or rest day tomorrow.",
  },
  {
    id: "threshold-quad-10s",
    name: "Quad 10s",
    goal: "threshold",
    minTime: 55,
    maxTime: 75,
    minLevel: "beginner",
    blocks: [
      { name: "Warm-up", durationMin: 10, powerMinPct: 50, powerMaxPct: 65, cadenceMin: 80, cadenceMax: 95, rpe: "3", color: "#22C55E" },
      { name: "Work", durationMin: 10, powerMinPct: 100, powerMaxPct: 105, cadenceMin: 85, cadenceMax: 95, rpe: "8", color: "#F16363", repeat: 4, recoveryDurationMin: 3, recoveryPowerMinPct: 50, recoveryPowerMaxPct: 60 },
      { name: "Cool-down", durationMin: 5, powerMinPct: 50, powerMaxPct: 65, cadenceMin: 80, cadenceMax: 95, rpe: "2", color: "#22C55E" },
    ],
    description:
      "Four 10-minute blocks at the top of your threshold range. The shorter interval length lets you target 100-105% FTP rather than the wider 95-105% band, meaning more time at or slightly above your current FTP. The 3-minute recoveries keep total session time compact. Good for time-crunched sessions where you want strong threshold stimulus in under 70 minutes.",
    recoveryNote: "48 hours before the next threshold-intensity session. Easy spin or rest day tomorrow.",
  },
  {
    id: "threshold-over-unders",
    name: "Over-Unders",
    goal: "threshold",
    minTime: 55,
    maxTime: 75,
    minLevel: "intermediate",
    blocks: [
      { name: "Warm-up", durationMin: 10, powerMinPct: 50, powerMaxPct: 65, cadenceMin: 80, cadenceMax: 95, rpe: "3", color: "#22C55E" },
      { name: "Over-Under Block", durationMin: 12, powerMinPct: 95, powerMaxPct: 105, cadenceMin: 85, cadenceMax: 95, rpe: "8-9", color: "#F16363", repeat: 3, recoveryDurationMin: 4, recoveryPowerMinPct: 50, recoveryPowerMaxPct: 60 },
      { name: "Cool-down", durationMin: 5, powerMinPct: 50, powerMaxPct: 65, cadenceMin: 80, cadenceMax: 95, rpe: "2", color: "#22C55E" },
    ],
    description:
      "Each 12-minute block alternates between 2 minutes at 95% FTP (under) and 2 minutes at 105% FTP (over). This oscillation forces your body to clear lactate while still producing power - the exact skill you need for surges in races or on group rides. The brief dips below threshold give partial recovery without fully clearing the metabolic stress, making each over segment progressively harder.",
    recoveryNote: "48-72 hours before the next hard session. These are deceptively fatiguing - respect the recovery.",
  },

  /* ---- Sweet Spot ---- */
  {
    id: "ss-classic-2x20",
    name: "Classic 2x20 SS",
    goal: "sweet-spot",
    minTime: 55,
    maxTime: 90,
    minLevel: "beginner",
    blocks: [
      { name: "Warm-up", durationMin: 10, powerMinPct: 50, powerMaxPct: 65, cadenceMin: 80, cadenceMax: 95, rpe: "3", color: "#22C55E" },
      { name: "Work", durationMin: 20, powerMinPct: 88, powerMaxPct: 94, cadenceMin: 85, cadenceMax: 95, rpe: "7", color: "#F16363", repeat: 2, recoveryDurationMin: 5, recoveryPowerMinPct: 50, recoveryPowerMaxPct: 60 },
      { name: "Cool-down", durationMin: 5, powerMinPct: 50, powerMaxPct: 65, cadenceMin: 80, cadenceMax: 95, rpe: "2", color: "#22C55E" },
    ],
    description:
      "Two 20-minute blocks in the common 88-94% FTP sweet spot band. This is a familiar coaching format, not a universal starting dose or proof that the rider is below a measured lactate threshold. Use it when recent comparable work supports the duration and keep the first block controlled enough to repeat.",
    recoveryNote: "Review the complete set and the next normal training day before scheduling another hard session; the template cannot prescribe a fixed recovery time.",
  },
  {
    id: "ss-triple-15s",
    name: "Triple 15s SS",
    goal: "sweet-spot",
    minTime: 60,
    maxTime: 90,
    minLevel: "beginner",
    blocks: [
      { name: "Warm-up", durationMin: 10, powerMinPct: 50, powerMaxPct: 65, cadenceMin: 80, cadenceMax: 95, rpe: "3", color: "#22C55E" },
      { name: "Work", durationMin: 15, powerMinPct: 88, powerMaxPct: 94, cadenceMin: 85, cadenceMax: 95, rpe: "7", color: "#F16363", repeat: 3, recoveryDurationMin: 5, recoveryPowerMinPct: 50, recoveryPowerMaxPct: 60 },
      { name: "Cool-down", durationMin: 5, powerMinPct: 50, powerMaxPct: 65, cadenceMin: 80, cadenceMax: 95, rpe: "2", color: "#22C55E" },
    ],
    description:
      "Same total sweet spot volume as 2x20 but broken into three 15-minute blocks. The shorter efforts feel more manageable, especially early in a training block or when returning after a break. Slightly more total recovery time, which makes it a good option for riders building toward the classic 2x20 format.",
    recoveryNote: "Use pacing, RPE and subsequent normal training to judge recovery rather than assuming a 36-48 hour interval.",
  },
  {
    id: "ss-endurance",
    name: "Endurance SS",
    goal: "sweet-spot",
    minTime: 60,
    maxTime: 90,
    minLevel: "intermediate",
    blocks: [
      { name: "Warm-up", durationMin: 10, powerMinPct: 50, powerMaxPct: 65, cadenceMin: 80, cadenceMax: 95, rpe: "3", color: "#22C55E" },
      { name: "Continuous Sweet Spot", durationMin: 45, powerMinPct: 88, powerMaxPct: 92, cadenceMin: 85, cadenceMax: 95, rpe: "7", color: "#F16363" },
      { name: "Cool-down", durationMin: 5, powerMinPct: 50, powerMaxPct: 65, cadenceMin: 80, cadenceMax: 95, rpe: "2", color: "#22C55E" },
    ],
    description:
      "One continuous 45-minute block at the lower end of sweet spot (88-92% FTP). This session builds muscular endurance and mental toughness - the ability to hold a demanding pace without a break. It mimics the sustained effort of a time trial or long solo breakaway. The slightly lower power target accounts for the absence of recovery intervals.",
    recoveryNote: "This is a demanding example. Individualise the next day from training history and observed response.",
  },
  {
    id: "ss-progressive",
    name: "Progressive SS",
    goal: "sweet-spot",
    minTime: 60,
    maxTime: 90,
    minLevel: "intermediate",
    blocks: [
      { name: "Warm-up", durationMin: 10, powerMinPct: 50, powerMaxPct: 65, cadenceMin: 80, cadenceMax: 95, rpe: "3", color: "#22C55E" },
      { name: "Block 1 (low SS)", durationMin: 15, powerMinPct: 88, powerMaxPct: 88, cadenceMin: 85, cadenceMax: 95, rpe: "7", color: "#F16363" },
      { name: "Recovery", durationMin: 3, powerMinPct: 50, powerMaxPct: 60, cadenceMin: 80, cadenceMax: 90, rpe: "3", color: "#3B82F6" },
      { name: "Block 2 (mid SS)", durationMin: 15, powerMinPct: 91, powerMaxPct: 91, cadenceMin: 85, cadenceMax: 95, rpe: "7-8", color: "#F16363" },
      { name: "Recovery", durationMin: 3, powerMinPct: 50, powerMaxPct: 60, cadenceMin: 80, cadenceMax: 90, rpe: "3", color: "#3B82F6" },
      { name: "Block 3 (high SS)", durationMin: 15, powerMinPct: 94, powerMaxPct: 94, cadenceMin: 85, cadenceMax: 95, rpe: "8", color: "#F16363" },
      { name: "Cool-down", durationMin: 5, powerMinPct: 50, powerMaxPct: 65, cadenceMin: 80, cadenceMax: 95, rpe: "2", color: "#22C55E" },
    ],
    description:
      "Three 15-minute blocks that step up through the sweet spot range: 88% then 91% then 94% FTP. Each block is harder than the last, teaching your body to produce power on accumulated fatigue - exactly what happens in the second half of a race. The progressive structure also teaches pacing discipline: start controlled, finish strong.",
    recoveryNote: "Do not infer a fixed next-day prescription or 48-hour rule from this template; review whether the progression stayed controlled.",
  },

  /* ---- Tempo ---- */
  {
    id: "tempo-steady",
    name: "Steady Tempo",
    goal: "tempo",
    minTime: 45,
    maxTime: 90,
    minLevel: "beginner",
    blocks: [
      { name: "Warm-up", durationMin: 10, powerMinPct: 50, powerMaxPct: 65, cadenceMin: 80, cadenceMax: 95, rpe: "3", color: "#22C55E" },
      { name: "Continuous Tempo", durationMin: 0, powerMinPct: 76, powerMaxPct: 87, cadenceMin: 80, cadenceMax: 95, rpe: "6", color: "#F16363" },
      { name: "Cool-down", durationMin: 5, powerMinPct: 50, powerMaxPct: 65, cadenceMin: 80, cadenceMax: 95, rpe: "2", color: "#22C55E" },
    ],
    description:
      "Continuous riding in the tempo zone for the entire main set. This intensity sits above endurance pace but below sweet spot - demanding enough to drive aerobic adaptation, manageable enough to sustain for long periods. Excellent for building aerobic base, preparing for sportives, or as a productive weekend ride when you want more than Z2 but less than threshold.",
    recoveryNote: "Can ride again the next day. Tempo is sustainable across consecutive days if the rest of your week is not too loaded.",
  },
  {
    id: "tempo-blocks",
    name: "Tempo Blocks",
    goal: "tempo",
    minTime: 75,
    maxTime: 90,
    minLevel: "beginner",
    blocks: [
      { name: "Warm-up", durationMin: 10, powerMinPct: 50, powerMaxPct: 65, cadenceMin: 80, cadenceMax: 95, rpe: "3", color: "#22C55E" },
      { name: "Work", durationMin: 30, powerMinPct: 76, powerMaxPct: 87, cadenceMin: 80, cadenceMax: 95, rpe: "6", color: "#F16363", repeat: 2, recoveryDurationMin: 5, recoveryPowerMinPct: 50, recoveryPowerMaxPct: 60 },
      { name: "Cool-down", durationMin: 5, powerMinPct: 50, powerMaxPct: 65, cadenceMin: 80, cadenceMax: 95, rpe: "2", color: "#22C55E" },
    ],
    description:
      "Two 30-minute tempo blocks with a 5-minute recovery between. The structured format gives you a mental reset without losing the training effect. Sixty minutes of total tempo volume is a strong aerobic stimulus for any rider. Ideal for longer training days when you want purpose beyond a steady endurance ride.",
    recoveryNote: "Can ride the next day. An easy Z2 spin is fine, or another tempo session if your weekly plan allows it.",
  },
  {
    id: "tempo-thirds",
    name: "Tempo Thirds",
    goal: "tempo",
    minTime: 75,
    maxTime: 90,
    minLevel: "beginner",
    blocks: [
      { name: "Warm-up", durationMin: 10, powerMinPct: 50, powerMaxPct: 65, cadenceMin: 80, cadenceMax: 95, rpe: "3", color: "#22C55E" },
      { name: "Work", durationMin: 20, powerMinPct: 80, powerMaxPct: 87, cadenceMin: 80, cadenceMax: 95, rpe: "6", color: "#F16363", repeat: 3, recoveryDurationMin: 5, recoveryPowerMinPct: 50, recoveryPowerMaxPct: 60 },
      { name: "Cool-down", durationMin: 5, powerMinPct: 50, powerMaxPct: 65, cadenceMin: 80, cadenceMax: 95, rpe: "2", color: "#22C55E" },
    ],
    description:
      "Three 20-minute tempo blocks at the upper end of the tempo range (80-87% FTP). The slightly higher target makes each block feel purposeful without crossing into sweet spot territory. The shorter interval length is psychologically easier than a single long block. Good for mid-week structured rides.",
    recoveryNote: "Easy day tomorrow or ride again at Z2. Low recovery cost relative to threshold or VO2max work.",
  },

  /* ---- Sprint ---- */
  {
    id: "sprint-power-sprints",
    name: "Power Sprints",
    goal: "sprint",
    minTime: 45,
    maxTime: 75,
    minLevel: "beginner",
    blocks: [
      { name: "Warm-up", durationMin: 15, powerMinPct: 50, powerMaxPct: 65, cadenceMin: 80, cadenceMax: 95, rpe: "3", color: "#22C55E" },
      { name: "Sprint", durationMin: 0.5, powerMinPct: 150, powerMaxPct: 200, cadenceMin: 110, cadenceMax: 130, rpe: "10", color: "#F16363", repeat: 8, recoveryDurationMin: 4.5, recoveryPowerMinPct: 40, recoveryPowerMaxPct: 55 },
      { name: "Cool-down", durationMin: 5, powerMinPct: 50, powerMaxPct: 65, cadenceMin: 80, cadenceMax: 95, rpe: "2", color: "#22C55E" },
    ],
    description:
      "Eight 30-second maximal sprints with long recovery between. This session targets neuromuscular power - your ability to recruit muscle fibres rapidly and produce peak force. The 4.5-minute recoveries allow near-complete phosphocreatine resynthesis so each sprint is fully maximal. Quality over quantity: every rep should be an all-out effort.",
    recoveryNote: "48 hours before the next sprint or VO2max session. The neuromuscular demand is high even though total work time is low.",
  },
  {
    id: "sprint-minute-repeats",
    name: "Minute Repeats",
    goal: "sprint",
    minTime: 55,
    maxTime: 90,
    minLevel: "beginner",
    blocks: [
      { name: "Warm-up", durationMin: 15, powerMinPct: 50, powerMaxPct: 65, cadenceMin: 80, cadenceMax: 95, rpe: "3", color: "#22C55E" },
      { name: "Work", durationMin: 1, powerMinPct: 130, powerMaxPct: 150, cadenceMin: 100, cadenceMax: 110, rpe: "9", color: "#F16363", repeat: 6, recoveryDurationMin: 5, recoveryPowerMinPct: 40, recoveryPowerMaxPct: 55 },
      { name: "Cool-down", durationMin: 5, powerMinPct: 50, powerMaxPct: 65, cadenceMin: 80, cadenceMax: 95, rpe: "2", color: "#22C55E" },
    ],
    description:
      "Six 1-minute efforts at 130-150% FTP with generous 5-minute recoveries. These target anaerobic capacity - your ability to sustain efforts above threshold for short, decisive moments. Think attacks, short climbs, bridge-the-gap efforts. The 1-minute duration taxes both the phosphocreatine and glycolytic energy systems, building a bigger anaerobic engine.",
    recoveryNote: "48-72 hours before the next hard session. Anaerobic efforts deplete glycogen reserves quickly.",
  },
  {
    id: "sprint-tabata",
    name: "Tabata",
    goal: "sprint",
    minTime: 30,
    maxTime: 60,
    minLevel: "advanced",
    blocks: [
      { name: "Warm-up", durationMin: 15, powerMinPct: 50, powerMaxPct: 65, cadenceMin: 80, cadenceMax: 95, rpe: "3", color: "#22C55E" },
      { name: "Tabata: 8x (20s max / 10s rest)", durationMin: 4, powerMinPct: 170, powerMaxPct: 200, cadenceMin: 110, cadenceMax: 130, rpe: "10", color: "#F16363" },
      { name: "Cool-down", durationMin: 10, powerMinPct: 40, powerMaxPct: 55, cadenceMin: 80, cadenceMax: 90, rpe: "2", color: "#22C55E" },
    ],
    description:
      "The original Tabata protocol: 8 rounds of 20 seconds at absolute maximum effort with just 10 seconds rest. Total work time is only 2 minutes and 40 seconds, but the incomplete recovery creates extreme metabolic stress. Research by Izumi Tabata showed this protocol improves both aerobic and anaerobic capacity simultaneously. Reserved for advanced riders - the effort level is absolute maximum.",
    recoveryNote: "72 hours before the next hard session. Do not underestimate this session because it is short.",
    attribution: "Based on Tabata et al. 1996",
  },

  /* ---- Endurance ---- */
  {
    id: "endurance-steady-state",
    name: "Steady State",
    goal: "endurance",
    minTime: 45,
    maxTime: 90,
    minLevel: "beginner",
    blocks: [
      { name: "Warm-up", durationMin: 5, powerMinPct: 45, powerMaxPct: 55, cadenceMin: 80, cadenceMax: 95, rpe: "2", color: "#22C55E" },
      { name: "Endurance", durationMin: 0, powerMinPct: 56, powerMaxPct: 75, cadenceMin: 80, cadenceMax: 95, rpe: "4-5", color: "#F16363" },
      { name: "Cool-down", durationMin: 5, powerMinPct: 45, powerMaxPct: 55, cadenceMin: 80, cadenceMax: 90, rpe: "2", color: "#22C55E" },
    ],
    description:
      "Pure Zone 2 endurance riding at 56-75% FTP. This is the foundation of aerobic fitness: fat oxidation, mitochondrial biogenesis, capillary density. It should feel conversational - if you cannot hold a full sentence, you are going too hard. The longer you can make this ride, the better. Time-in-zone is the primary driver of adaptation at this intensity.",
    recoveryNote: "No specific recovery needed. You can ride endurance pace on consecutive days. This is active recovery for many riders.",
  },
  {
    id: "endurance-tempo-sprinkles",
    name: "Tempo Sprinkles",
    goal: "endurance",
    minTime: 60,
    maxTime: 90,
    minLevel: "beginner",
    blocks: [
      { name: "Warm-up", durationMin: 10, powerMinPct: 50, powerMaxPct: 60, cadenceMin: 80, cadenceMax: 95, rpe: "3", color: "#22C55E" },
      { name: "Endurance", durationMin: 10, powerMinPct: 60, powerMaxPct: 70, cadenceMin: 80, cadenceMax: 95, rpe: "4-5", color: "#F16363" },
      { name: "Tempo lift", durationMin: 5, powerMinPct: 80, powerMaxPct: 80, cadenceMin: 85, cadenceMax: 95, rpe: "6", color: "#EAB308" },
      { name: "Endurance", durationMin: 15, powerMinPct: 60, powerMaxPct: 70, cadenceMin: 80, cadenceMax: 95, rpe: "4-5", color: "#F16363" },
      { name: "Tempo lift", durationMin: 5, powerMinPct: 80, powerMaxPct: 80, cadenceMin: 85, cadenceMax: 95, rpe: "6", color: "#EAB308" },
      { name: "Endurance", durationMin: 15, powerMinPct: 60, powerMaxPct: 70, cadenceMin: 80, cadenceMax: 95, rpe: "4-5", color: "#F16363" },
      { name: "Tempo lift", durationMin: 5, powerMinPct: 80, powerMaxPct: 80, cadenceMin: 85, cadenceMax: 95, rpe: "6", color: "#EAB308" },
      { name: "Cool-down", durationMin: 5, powerMinPct: 45, powerMaxPct: 55, cadenceMin: 80, cadenceMax: 90, rpe: "2", color: "#22C55E" },
    ],
    description:
      "An endurance base ride with three 5-minute tempo lifts scattered through. The tempo blocks add purpose and structure to a Z2 ride without significantly increasing recovery cost. The brief step-ups keep your legs engaged and prevent the session from becoming monotonous. A smart option for riders who find pure Z2 riding mentally difficult.",
    recoveryNote: "Can ride again tomorrow. The tempo sprinkles add minimal recovery cost to an endurance ride.",
  },
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function getFtpError(value: string): string | null {
  if (!value) return null;
  const num = parseInt(value);
  if (isNaN(num)) return "Please enter a valid number";
  if (num < 50) return "FTP must be at least 50W";
  if (num > 600) return "FTP must be under 600W";
  return null;
}

/** Expand a session's blocks into a flat list of timed segments (for timeline + TSS) */
function expandBlocks(session: Session, availableTime: number): {
  segments: { name: string; durationMin: number; powerMinPct: number; powerMaxPct: number; cadenceMin: number; cadenceMax: number; rpe: string; color: string }[];
  totalMin: number;
} {
  const segments: { name: string; durationMin: number; powerMinPct: number; powerMaxPct: number; cadenceMin: number; cadenceMax: number; rpe: string; color: string }[] = [];

  for (const block of session.blocks) {
    if (block.repeat && block.repeat > 1) {
      for (let i = 0; i < block.repeat; i++) {
        segments.push({
          name: `${block.name} ${i + 1}`,
          durationMin: block.durationMin,
          powerMinPct: block.powerMinPct,
          powerMaxPct: block.powerMaxPct,
          cadenceMin: block.cadenceMin,
          cadenceMax: block.cadenceMax,
          rpe: block.rpe,
          color: block.color,
        });
        if (i < block.repeat - 1 && block.recoveryDurationMin) {
          segments.push({
            name: "Recovery",
            durationMin: block.recoveryDurationMin,
            powerMinPct: block.recoveryPowerMinPct ?? 50,
            powerMaxPct: block.recoveryPowerMaxPct ?? 60,
            cadenceMin: 80,
            cadenceMax: 90,
            rpe: "3",
            color: "#3B82F6",
          });
        }
      }
    } else {
      let dur = block.durationMin;
      // Dynamic duration blocks (Steady Tempo, Steady State) fill available time
      if (dur === 0) {
        const otherTime = session.blocks.reduce((sum, b) => sum + (b === block ? 0 : getTotalBlockDuration(b)), 0);
        dur = Math.max(10, availableTime - otherTime);
      }
      segments.push({
        name: block.name,
        durationMin: dur,
        powerMinPct: block.powerMinPct,
        powerMaxPct: block.powerMaxPct,
        cadenceMin: block.cadenceMin,
        cadenceMax: block.cadenceMax,
        rpe: block.rpe,
        color: block.color,
      });
    }
  }

  const totalMin = segments.reduce((sum, s) => sum + s.durationMin, 0);
  return { segments, totalMin };
}

/** Get total duration of a single block definition (including repeats + recovery) */
function getTotalBlockDuration(block: IntervalBlock): number {
  if (block.durationMin === 0) return 0; // dynamic
  if (block.repeat && block.repeat > 1) {
    const workTime = block.repeat * block.durationMin;
    const restTime = (block.repeat - 1) * (block.recoveryDurationMin ?? 0);
    return workTime + restTime;
  }
  return block.durationMin;
}

/** Calculate estimated TSS for a session */
function calculateTSS(segments: { durationMin: number; powerMinPct: number; powerMaxPct: number }[]): number {
  // TSS = SUM( (segment_seconds * segment_IF^2) ) / 3600 * 100
  // where IF for each segment = midpoint power / FTP = midpoint_pct / 100
  let weightedSum = 0;

  for (const seg of segments) {
    const midPct = (seg.powerMinPct + seg.powerMaxPct) / 2;
    const ifSeg = midPct / 100;
    const seconds = seg.durationMin * 60;
    weightedSum += seconds * ifSeg * ifSeg;
  }

  const tss = (weightedSum / 3600) * 100;
  return Math.round(tss);
}

/** Calculate NP estimate (time-weighted average power as pct of FTP) */
function calculateNPPct(segments: { durationMin: number; powerMinPct: number; powerMaxPct: number }[]): number {
  const totalMin = segments.reduce((sum, s) => sum + s.durationMin, 0);
  if (totalMin === 0) return 0;
  let weightedPower = 0;
  for (const seg of segments) {
    const midPct = (seg.powerMinPct + seg.powerMaxPct) / 2;
    weightedPower += seg.durationMin * midPct;
  }
  return weightedPower / totalMin;
}

/** Format a copy-to-clipboard text for a session */
function formatSessionText(
  session: Session,
  ftp: number,
  segments: { name: string; durationMin: number; powerMinPct: number; powerMaxPct: number; cadenceMin: number; cadenceMax: number; rpe: string; color: string }[],
  totalMin: number,
  tss: number,
): string {
  const lines: string[] = [
    `Interval Session: ${session.name} (${GOAL_LABELS[session.goal]})`,
    `FTP: ${ftp}W | Total: ${totalMin} min | Est. TSS: ${tss}`,
    ``,
  ];

  // Work/recovery stats
  let workMin = 0;
  let recoveryMin = 0;
  let mainCadenceMin = 0;
  let mainCadenceMax = 0;
  let mainRpe = "";

  for (const seg of segments) {
    if (seg.color === "#F16363" || seg.color === "#EAB308") {
      workMin += seg.durationMin;
      if (!mainRpe && seg.rpe !== "3") {
        mainCadenceMin = seg.cadenceMin;
        mainCadenceMax = seg.cadenceMax;
        mainRpe = seg.rpe;
      }
    } else if (seg.color === "#3B82F6") {
      recoveryMin += seg.durationMin;
    }
  }

  for (const seg of segments) {
    const minW = Math.round((seg.powerMinPct / 100) * ftp);
    const maxW = Math.round((seg.powerMaxPct / 100) * ftp);
    const durStr = seg.durationMin >= 1 ? `${seg.durationMin} min` : `${Math.round(seg.durationMin * 60)}s`;
    lines.push(`${seg.name}: ${durStr} @ ${minW}-${maxW}W (${seg.powerMinPct}-${seg.powerMaxPct}% FTP)`);
  }

  lines.push(``);
  lines.push(`Work time: ${Math.round(workMin)} min | Recovery time: ${Math.round(recoveryMin)} min`);
  if (mainCadenceMin > 0) {
    lines.push(`Target cadence: ${mainCadenceMin}-${mainCadenceMax} rpm | RPE: ${mainRpe}/10`);
  }
  lines.push(``);
  lines.push(`What this does: ${session.description}`);
  lines.push(`Recovery: ${session.recoveryNote}`);
  lines.push(``);
  lines.push(`— roadmancycling.com/tools/interval-builder`);

  return lines.join("\n");
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function IntervalBuilderPage() {
  const [ftp, setFtp] = useState<string>("");
  const [availableTime, setAvailableTime] = useState<number>(60);
  const [trainingGoal, setTrainingGoal] = useState<TrainingGoal>("threshold");
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>("intermediate");
  const [calculated, setCalculated] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [activeSessionIndex, setActiveSessionIndex] = useState(0);

  const ftpValue = parseInt(ftp) || 0;
  const ftpError = getFtpError(ftp);

  /* Match sessions */
  const matchedSessions = useMemo(() => {
    if (!calculated || ftpValue <= 0) return [];

    const filtered = SESSIONS.filter((s) => {
      if (s.goal !== trainingGoal) return false;
      if (LEVEL_RANK[experienceLevel] < LEVEL_RANK[s.minLevel]) return false;
      if (availableTime < s.minTime || availableTime > s.maxTime) return false;
      return true;
    });

    // If nothing matches, relax the time constraint slightly
    if (filtered.length === 0) {
      const relaxed = SESSIONS.filter((s) => {
        if (s.goal !== trainingGoal) return false;
        if (LEVEL_RANK[experienceLevel] < LEVEL_RANK[s.minLevel]) return false;
        // Allow 15 minutes of leeway
        if (availableTime < s.minTime - 15 || availableTime > s.maxTime + 15) return false;
        return true;
      });
      return relaxed.slice(0, 3);
    }

    return filtered.slice(0, 3);
  }, [calculated, ftpValue, availableTime, trainingGoal, experienceLevel]);

  const activeSession = matchedSessions[activeSessionIndex] ?? matchedSessions[0] ?? null;

  const expanded = useMemo(() => {
    if (!activeSession) return null;
    return expandBlocks(activeSession, availableTime);
  }, [activeSession, availableTime]);

  const tss = useMemo(() => {
    if (!expanded) return 0;
    return calculateTSS(expanded.segments);
  }, [expanded]);

  const npPct = useMemo(() => {
    if (!expanded) return 0;
    return calculateNPPct(expanded.segments);
  }, [expanded]);

  const workMin = useMemo(() => {
    if (!expanded) return 0;
    return expanded.segments.filter((s) => s.color === "#F16363" || s.color === "#EAB308").reduce((sum, s) => sum + s.durationMin, 0);
  }, [expanded]);

  const recoveryMin = useMemo(() => {
    if (!expanded) return 0;
    return expanded.segments.filter((s) => s.color === "#3B82F6").reduce((sum, s) => sum + s.durationMin, 0);
  }, [expanded]);

  const handleCalculate = () => {
    if (ftpValue > 0 && !ftpError) {
      setCalculated(true);
      setActiveSessionIndex(0);
      setCopied(null);
    }
  };

  const handleCopySession = async () => {
    if (!activeSession || !expanded) return;
    const text = formatSessionText(activeSession, ftpValue, expanded.segments, expanded.totalMin, tss);
    await navigator.clipboard.writeText(text);
    setCopied(activeSession.id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <>
      <Header />
      <main id="main-content">
        {/* Hero */}
        <Section background="deep-purple" grain className="pt-32 pb-12">
          <Container width="narrow" className="text-center">
            <p className="text-coral text-sm font-body font-medium uppercase tracking-widest mb-4">
              Free Tool
            </p>
            <h1
              className="font-heading text-off-white mb-4"
              style={{ fontSize: "var(--text-section)" }}
            >
              INTERVAL SESSION BUILDER
            </h1>
            <p className="text-foreground-muted text-lg">
              Enter your FTP, pick a training goal and available time. Get a
              complete structured interval session with power targets, cadence
              ranges, and estimated TSS. Every session backed by sports science.
            </p>
          </Container>
        </Section>

        {/* Calculator */}
        <Section background="charcoal" className="!py-12">
          <Container width="narrow">
            {/* Input card */}
            <div className="bg-background-elevated rounded-xl border border-white/5 p-8 mb-8">
              {/* FTP input */}
              <label
                htmlFor="ftp-input"
                className="block font-heading text-lg text-off-white mb-2"
              >
                YOUR FTP (WATTS)
              </label>
              <p className="text-sm text-foreground-muted mb-4">
                Don&apos;t know your FTP? Use your best 20-minute power and
                multiply by 0.95. Or try the{" "}
                <Link
                  href="/tools/ftp-test"
                  className="text-coral hover:text-coral/80 transition-colors"
                >
                  FTP Test Calculator
                </Link>
                .
              </p>
              <input
                id="ftp-input"
                type="number"
                inputMode="numeric"
                min="50"
                max="600"
                aria-label="Your Functional Threshold Power in watts"
                aria-invalid={!!ftpError}
                placeholder="e.g. 250"
                value={ftp}
                onChange={(e) => {
                  setFtp(e.target.value);
                  setCalculated(false);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleCalculate();
                }}
                className={`
                  w-full bg-white/5 border rounded-lg px-4 py-3 mb-1
                  text-off-white text-xl font-heading tracking-wider
                  placeholder:text-foreground-subtle
                  focus:outline-none
                  transition-colors
                  ${ftpError ? "border-red-500/60 focus:border-red-500" : "border-white/10 focus:border-coral"}
                `}
                style={{ transitionDuration: "var(--duration-fast)" }}
              />
              {ftpError && (
                <p className="text-red-400 text-xs mt-1 mb-3" role="alert">
                  {ftpError}
                </p>
              )}

              {/* Available time */}
              <div className="mt-6">
                <p className="font-heading text-sm text-off-white mb-3">
                  AVAILABLE TIME
                </p>
                <div className="flex flex-wrap gap-2">
                  {TIME_OPTIONS.map((mins) => (
                    <button
                      key={mins}
                      onClick={() => {
                        setAvailableTime(mins);
                        setCalculated(false);
                      }}
                      className={`
                        px-4 py-2 rounded-lg font-heading text-sm tracking-wider transition-all cursor-pointer
                        ${
                          availableTime === mins
                            ? "bg-coral text-off-white"
                            : "bg-white/5 text-foreground-muted hover:bg-white/10 hover:text-off-white border border-white/10"
                        }
                      `}
                    >
                      {mins} MIN
                    </button>
                  ))}
                </div>
              </div>

              {/* Training goal */}
              <div className="mt-6">
                <p className="font-heading text-sm text-off-white mb-3">
                  TRAINING GOAL
                </p>
                <div className="flex flex-wrap gap-2">
                  {GOAL_OPTIONS.map((g) => (
                    <button
                      key={g.value}
                      onClick={() => {
                        setTrainingGoal(g.value);
                        setCalculated(false);
                      }}
                      className={`
                        px-4 py-2 rounded-lg font-heading text-sm tracking-wider transition-all cursor-pointer
                        ${
                          trainingGoal === g.value
                            ? "bg-coral text-off-white"
                            : "bg-white/5 text-foreground-muted hover:bg-white/10 hover:text-off-white border border-white/10"
                        }
                      `}
                    >
                      {g.label.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Experience level */}
              <div className="mt-6">
                <p className="font-heading text-sm text-off-white mb-3">
                  EXPERIENCE LEVEL
                </p>
                <div className="flex flex-wrap gap-2">
                  {LEVEL_OPTIONS.map((l) => (
                    <button
                      key={l.value}
                      onClick={() => {
                        setExperienceLevel(l.value);
                        setCalculated(false);
                      }}
                      className={`
                        px-4 py-2 rounded-lg font-heading text-sm tracking-wider transition-all cursor-pointer
                        ${
                          experienceLevel === l.value
                            ? "bg-coral text-off-white"
                            : "bg-white/5 text-foreground-muted hover:bg-white/10 hover:text-off-white border border-white/10"
                        }
                      `}
                    >
                      {l.label.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Calculate button */}
              <div className="mt-8">
                <Button onClick={handleCalculate} size="lg" className="w-full sm:w-auto">
                  Build Session
                </Button>
              </div>
            </div>

            {/* Results */}
            <div aria-live="polite" aria-atomic="false">
              <AnimatePresence mode="wait">
                {calculated && ftpValue > 0 && matchedSessions.length > 0 && activeSession && expanded && (
                  <motion.div
                    className="space-y-3"
                    key={`${ftpValue}-${trainingGoal}-${availableTime}-${experienceLevel}-${activeSession.id}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  >
                    {/* Session selector (if multiple) */}
                    {matchedSessions.length > 1 && (
                      <div className="mb-6">
                        <p className="font-heading text-sm text-foreground-muted mb-3">
                          {matchedSessions.length} SESSIONS MATCH YOUR CRITERIA
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {matchedSessions.map((s, i) => (
                            <button
                              key={s.id}
                              onClick={() => {
                                setActiveSessionIndex(i);
                                setCopied(null);
                              }}
                              className={`
                                px-4 py-2 rounded-lg font-heading text-sm tracking-wider transition-all cursor-pointer
                                ${
                                  activeSessionIndex === i
                                    ? "bg-coral text-off-white"
                                    : "bg-white/5 text-foreground-muted hover:bg-white/10 hover:text-off-white border border-white/10"
                                }
                              `}
                            >
                              {s.name.toUpperCase()}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Header + Copy */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6">
                      <h2 className="font-heading text-xl sm:text-2xl text-off-white">
                        {activeSession.name.toUpperCase()} — {GOAL_LABELS[activeSession.goal].toUpperCase()}
                      </h2>
                      <button
                        onClick={handleCopySession}
                        aria-label={
                          copied === activeSession.id
                            ? "Session copied to clipboard"
                            : "Copy session to clipboard"
                        }
                        className="self-start sm:self-auto shrink-0 inline-flex items-center min-h-[44px] px-3 -ml-3 sm:ml-0 text-sm text-coral hover:text-coral/80 font-heading tracking-wider transition-colors cursor-pointer"
                      >
                        {copied === activeSession.id ? "Copied!" : "Copy Session"}
                      </button>
                    </div>

                    {/* Session timeline visualization */}
                    <motion.div
                      className="bg-background-elevated rounded-xl border border-white/5 p-6 mb-6"
                      initial={{ opacity: 0, scale: 0.97 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5, delay: 0.1 }}
                    >
                      <h3 className="font-heading text-lg text-off-white mb-4">
                        SESSION TIMELINE — {expanded.totalMin} MIN
                      </h3>
                      <div className="flex gap-0.5 h-12 rounded-lg overflow-hidden mb-4">
                        {expanded.segments.map((seg, i) => {
                          const widthPct = (seg.durationMin / expanded.totalMin) * 100;
                          return (
                            <motion.div
                              key={`${seg.name}-${i}`}
                              className="relative group"
                              style={{
                                width: `${widthPct}%`,
                                backgroundColor: seg.color,
                                opacity: seg.color === "#3B82F6" ? 0.6 : 0.85,
                              }}
                              initial={{ scaleY: 0 }}
                              animate={{ scaleY: 1 }}
                              transition={{
                                duration: 0.4,
                                delay: 0.15 + i * 0.03,
                                ease: [0.16, 1, 0.3, 1],
                              }}
                              title={`${seg.name}: ${seg.durationMin >= 1 ? `${seg.durationMin}min` : `${Math.round(seg.durationMin * 60)}s`} @ ${seg.powerMinPct}-${seg.powerMaxPct}% FTP`}
                            >
                              {/* Tooltip on hover */}
                              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10 pointer-events-none">
                                <div className="bg-charcoal border border-white/10 rounded-lg px-3 py-2 text-xs whitespace-nowrap shadow-lg">
                                  <p className="text-off-white font-heading">{seg.name}</p>
                                  <p className="text-foreground-muted">
                                    {seg.durationMin >= 1 ? `${seg.durationMin} min` : `${Math.round(seg.durationMin * 60)}s`} @ {Math.round((seg.powerMinPct / 100) * ftpValue)}-{Math.round((seg.powerMaxPct / 100) * ftpValue)}W
                                  </p>
                                </div>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                      {/* Legend */}
                      <div className="flex flex-wrap gap-4 text-xs text-foreground-muted">
                        <span className="flex items-center gap-1.5">
                          <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: "#22C55E" }} />
                          Warm-up / Cool-down
                        </span>
                        <span className="flex items-center gap-1.5">
                          <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: "#F16363" }} />
                          Work interval
                        </span>
                        <span className="flex items-center gap-1.5">
                          <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: "#3B82F6", opacity: 0.6 }} />
                          Recovery
                        </span>
                        {expanded.segments.some((s) => s.color === "#EAB308") && (
                          <span className="flex items-center gap-1.5">
                            <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: "#EAB308" }} />
                            Tempo lift
                          </span>
                        )}
                      </div>
                    </motion.div>

                    {/* Interval breakdown table */}
                    <motion.div
                      className="bg-background-elevated rounded-xl border border-white/5 p-6 mb-6"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.2 }}
                    >
                      <h3 className="font-heading text-lg text-off-white mb-4">
                        INTERVAL BREAKDOWN
                      </h3>

                      {/* Desktop table */}
                      <div className="hidden md:block overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-white/10">
                              <th className="text-left font-heading text-foreground-muted py-3 pr-4">BLOCK</th>
                              <th className="text-left font-heading text-foreground-muted py-3 pr-4">DURATION</th>
                              <th className="text-left font-heading text-foreground-muted py-3 pr-4">POWER (W)</th>
                              <th className="text-left font-heading text-foreground-muted py-3 pr-4">% FTP</th>
                              <th className="text-left font-heading text-foreground-muted py-3 pr-4">CADENCE</th>
                              <th className="text-left font-heading text-foreground-muted py-3">RPE</th>
                            </tr>
                          </thead>
                          <tbody>
                            {expanded.segments.map((seg, i) => {
                              const minW = Math.round((seg.powerMinPct / 100) * ftpValue);
                              const maxW = Math.round((seg.powerMaxPct / 100) * ftpValue);
                              const isWork = seg.color === "#F16363" || seg.color === "#EAB308";
                              return (
                                <tr
                                  key={`${seg.name}-${i}`}
                                  className={i < expanded.segments.length - 1 ? "border-b border-white/5" : ""}
                                >
                                  <td className={`py-3 pr-4 font-medium text-xs ${isWork ? "text-coral" : "text-foreground-muted"}`}>
                                    {seg.name}
                                  </td>
                                  <td className="py-3 pr-4 text-off-white text-xs">
                                    {seg.durationMin >= 1 ? `${seg.durationMin} min` : `${Math.round(seg.durationMin * 60)}s`}
                                  </td>
                                  <td className="py-3 pr-4 text-off-white text-xs font-heading">
                                    {minW === maxW ? `${minW}W` : `${minW}-${maxW}W`}
                                  </td>
                                  <td className="py-3 pr-4 text-foreground-muted text-xs">
                                    {seg.powerMinPct === seg.powerMaxPct ? `${seg.powerMinPct}%` : `${seg.powerMinPct}-${seg.powerMaxPct}%`}
                                  </td>
                                  <td className="py-3 pr-4 text-foreground-muted text-xs">
                                    {seg.cadenceMin}-{seg.cadenceMax} rpm
                                  </td>
                                  <td className="py-3 text-foreground-muted text-xs">
                                    {seg.rpe}/10
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>

                      {/* Mobile cards */}
                      <div className="md:hidden space-y-3">
                        {expanded.segments.map((seg, i) => {
                          const minW = Math.round((seg.powerMinPct / 100) * ftpValue);
                          const maxW = Math.round((seg.powerMaxPct / 100) * ftpValue);
                          const isWork = seg.color === "#F16363" || seg.color === "#EAB308";
                          return (
                            <div
                              key={`mobile-${seg.name}-${i}`}
                              className="bg-white/5 rounded-lg p-4"
                              style={{ borderLeft: `3px solid ${seg.color}` }}
                            >
                              <div className="flex items-baseline justify-between mb-1">
                                <p className={`font-heading text-sm ${isWork ? "text-coral" : "text-foreground-muted"}`}>
                                  {seg.name.toUpperCase()}
                                </p>
                                <span className="text-off-white text-xs font-heading">
                                  {seg.durationMin >= 1 ? `${seg.durationMin} min` : `${Math.round(seg.durationMin * 60)}s`}
                                </span>
                              </div>
                              <div className="grid grid-cols-2 gap-1 text-xs">
                                <div>
                                  <span className="text-foreground-subtle">Power: </span>
                                  <span className="text-off-white">
                                    {minW === maxW ? `${minW}W` : `${minW}-${maxW}W`}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-foreground-subtle">% FTP: </span>
                                  <span className="text-foreground-muted">
                                    {seg.powerMinPct === seg.powerMaxPct ? `${seg.powerMinPct}%` : `${seg.powerMinPct}-${seg.powerMaxPct}%`}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-foreground-subtle">Cadence: </span>
                                  <span className="text-foreground-muted">{seg.cadenceMin}-{seg.cadenceMax}</span>
                                </div>
                                <div>
                                  <span className="text-foreground-subtle">RPE: </span>
                                  <span className="text-foreground-muted">{seg.rpe}/10</span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>

                    {/* TSS + Stats card */}
                    <motion.div
                      className="bg-gradient-to-br from-coral/10 via-deep-purple/40 to-charcoal rounded-xl border border-coral/20 p-6 mb-6"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.3 }}
                    >
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div>
                          <p className="font-heading text-coral text-xs tracking-widest mb-1">EST. TSS</p>
                          <p className="font-heading text-2xl sm:text-3xl text-off-white stat-glow">{tss}</p>
                        </div>
                        <div>
                          <p className="font-heading text-coral text-xs tracking-widest mb-1">TOTAL TIME</p>
                          <p className="font-heading text-2xl sm:text-3xl text-off-white">{expanded.totalMin} min</p>
                        </div>
                        <div>
                          <p className="font-heading text-coral text-xs tracking-widest mb-1">WORK TIME</p>
                          <p className="font-heading text-2xl sm:text-3xl text-off-white">{Math.round(workMin)} min</p>
                        </div>
                        <div>
                          <p className="font-heading text-coral text-xs tracking-widest mb-1">RECOVERY TIME</p>
                          <p className="font-heading text-2xl sm:text-3xl text-off-white">{Math.round(recoveryMin)} min</p>
                        </div>
                      </div>
                      <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-foreground-subtle">Est. Normalised Power</p>
                          <p className="text-off-white font-heading text-lg">
                            {Math.round((npPct / 100) * ftpValue)}W ({Math.round(npPct)}% FTP)
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-foreground-subtle">Intensity Factor</p>
                          <p className="text-off-white font-heading text-lg">
                            {(npPct / 100).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </motion.div>

                    {/* Description + Recovery card */}
                    <motion.div
                      className="bg-background-elevated rounded-xl border border-white/5 p-6 mb-6"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.35 }}
                    >
                      <h3 className="font-heading text-lg text-off-white mb-3">
                        WHAT THIS SESSION DOES
                      </h3>
                      <p className="text-foreground-muted text-sm leading-relaxed mb-4">
                        {activeSession.description}
                      </p>

                      <div className="pt-4 border-t border-white/5">
                        <h4 className="font-heading text-sm text-coral mb-2">
                          RECOVERY RECOMMENDATION
                        </h4>
                        <p className="text-foreground-muted text-sm leading-relaxed">
                          {activeSession.recoveryNote}
                        </p>
                      </div>

                      {activeSession.attribution && (
                        <p className="text-foreground-subtle text-xs mt-4 italic">
                          {activeSession.attribution}
                        </p>
                      )}
                    </motion.div>

                    {/* Copy session button (large, below results) */}
                    <motion.div
                      className="mb-6"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.4 }}
                    >
                      <Button
                        onClick={handleCopySession}
                        size="lg"
                        className="w-full"
                      >
                        {copied === activeSession.id ? "Copied to Clipboard" : "Copy Session"}
                      </Button>
                    </motion.div>
                  </motion.div>
                )}

                {/* No sessions found */}
                {calculated && ftpValue > 0 && matchedSessions.length === 0 && (
                  <motion.div
                    className="bg-background-elevated rounded-xl border border-white/5 p-6"
                    key="no-results"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.4 }}
                  >
                    <p className="text-off-white font-heading text-lg mb-2">
                      NO MATCHING SESSIONS
                    </p>
                    <p className="text-foreground-muted text-sm">
                      No sessions match your exact combination of {availableTime} minutes,{" "}
                      {GOAL_LABELS[trainingGoal]} goal, and {experienceLevel} level. Try adjusting
                      your available time or training goal.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </Container>
        </Section>

        {/* Methodology */}
        <Section background="deep-purple" className="!py-12">
          <Container width="narrow">
            <motion.div
              className="bg-deep-purple/30 rounded-xl border border-purple/20 p-8"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
            >
              <h3 className="font-heading text-xl text-off-white mb-4">
                THE SCIENCE BEHIND INTERVAL PRESCRIPTION
              </h3>
              <div className="space-y-3 text-foreground-muted text-sm leading-relaxed">
                <p>
                  <strong className="text-off-white">
                    Why intervals work.
                  </strong>{" "}
                  Interval training allows you to accumulate more total time at
                  a target intensity than continuous exercise at the same power.
                  A rider who can hold 300W for 20 minutes continuously might
                  accumulate 40 minutes at 300W in a session of 5x8-minute
                  intervals. That extra time at the target intensity is what
                  drives specific adaptation - whether that is increased VO2max,
                  raised lactate threshold, or improved fat oxidation at tempo
                  pace.
                </p>
                <p>
                  <strong className="text-off-white">
                    Work-to-rest ratios matter.
                  </strong>{" "}
                  The recovery duration between intervals is not arbitrary. For
                  VO2max work, Seiler&apos;s research shows that 1:1
                  work-to-rest ratios (e.g. 4 minutes on, 4 minutes off) maximise
                  time at peak VO2 because the recovery is short enough that
                  oxygen uptake does not fully drop between efforts. For sprint
                  work, longer rest (1:5 or more) allows phosphocreatine
                  resynthesis so each effort can be fully maximal. For
                  threshold and sweet spot, shorter recoveries maintain the
                  metabolic environment that drives adaptation.
                </p>
                <p>
                  <strong className="text-off-white">
                    Cadence prescription.
                  </strong>{" "}
                  Higher cadences (95-110 rpm) during VO2max and sprint
                  intervals reduce the muscular force per pedal stroke, shifting
                  more stress toward the cardiovascular system. Lower cadences
                  (85-95 rpm) during threshold and sweet spot work increase
                  muscular tension, which can drive peripheral adaptations like
                  improved lactate clearance within the working muscles. Both
                  have their place - the cadence targets in each session are
                  prescribed to match the intended physiological stimulus.
                </p>
                <p>
                  <strong className="text-off-white">
                    TSS as a load metric.
                  </strong>{" "}
                  Training Stress Score (Coggan, 2003) estimates the total
                  physiological cost of a session. An hour at FTP = 100 TSS. The
                  estimates here use a time-weighted average of each
                  interval&apos;s midpoint power as a proxy for Normalised
                  Power. Actual TSS from your power file will vary depending on
                  how closely you hit the targets and how variable your power
                  is within each interval.
                </p>
              </div>
            </motion.div>

            {/* Learn More */}
            <motion.div
              className="mt-8 rounded-xl border border-white/10 p-6"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: 0.1 }}
            >
              <h3 className="font-heading text-lg text-off-white mb-3">
                LEARN MORE
              </h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/tools/ftp-zones"
                    className="text-coral hover:text-coral/80 text-sm transition-colors"
                  >
                    FTP Zone Calculator — full 7-zone breakdown
                  </Link>
                </li>
                <li>
                  <Link
                    href="/tools/tss"
                    className="text-coral hover:text-coral/80 text-sm transition-colors"
                  >
                    TSS Calculator — quantify session stress
                  </Link>
                </li>
                <li>
                  <Link
                    href="/tools/sweet-spot"
                    className="text-coral hover:text-coral/80 text-sm transition-colors"
                  >
                    Sweet Spot Calculator — find your sweet spot range
                  </Link>
                </li>
                <li>
                  <Link
                    href="/tools/ftp-test"
                    className="text-coral hover:text-coral/80 text-sm transition-colors"
                  >
                    FTP Test Calculator — find your FTP first
                  </Link>
                </li>
                <li>
                  <Link
                    href="/tools/training-load"
                    className="text-coral hover:text-coral/80 text-sm transition-colors"
                  >
                    Training Load Calculator — manage weekly stress
                  </Link>
                </li>
              </ul>
            </motion.div>

            {/* Coaching CTA */}
            <motion.div
              className="mt-8 rounded-2xl border border-coral/30 bg-gradient-to-br from-coral/10 via-deep-purple/40 to-charcoal p-6 md:p-8 text-center"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: 0.15 }}
            >
              <p className="font-heading text-coral text-xs tracking-widest mb-2">
                WANT SESSIONS PRESCRIBED SPECIFICALLY FOR YOU?
              </p>
              <p className="text-off-white font-heading text-lg md:text-xl mb-2">
                Roadman coaching builds your week around your numbers, your
                schedule, and your goals.
              </p>
              <p className="text-foreground-muted text-sm mb-5 max-w-md mx-auto">
                Personalised TrainingPeaks plan, weekly calls, five pillars.
                7-day free trial. $195/month.
              </p>
              <a
                href="/apply"
                className="inline-flex items-center justify-center gap-2 font-heading tracking-wider uppercase rounded-md bg-coral text-off-white hover:bg-coral/90 px-6 py-3 text-sm transition-all"
              >
                Apply for Coaching
              </a>
            </motion.div>
          </Container>
        </Section>

        <ToolLanding slug="interval-builder" />
      </main>
      <Footer />
    </>
  );
}
