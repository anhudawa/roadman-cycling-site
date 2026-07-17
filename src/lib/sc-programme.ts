// ============================================================================
// Roadman Cycling — 12-Week Strength & Conditioning Programme Data Layer
// Push/Pull split, 2 days per week
// ============================================================================

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type Phase = 'gpp' | 'strength' | 'power' | 'deload';

export interface Exercise {
  id: string;
  name: string;
  setsReps: string;
  tempo?: string;
  rest?: string;
  supersetGroup: 'A' | 'B' | 'C';
  videoUrl?: string;
  tip?: string;
  notes?: string;
}

export interface WarmupExercise {
  id: string;
  name: string;
  setsReps: string;
  tempo?: string;
  videoUrl?: string;
  tip?: string;
}

export interface CoreCircuitExercise {
  id: string;
  name: string;
  reps: string;
  videoUrl?: string;
  tip?: string;
}

export interface DayPlan {
  dayNumber: 1 | 2;
  type: 'Push' | 'Pull';
  warmup: WarmupExercise[];
  workout: Exercise[];
  recovery: string[];
}

export interface WeekPlan {
  weekNumber: number;
  phase: Phase;
  phaseLabel: string;
  isDeload: boolean;
  days: [DayPlan, DayPlan];
  coreCircuit: {
    reps: number;
    sets?: number;
    restBetweenSets?: string;
    breakDuration?: string;
    exercises: CoreCircuitExercise[];
  };
  gluteActivation: {
    exercises: { name: string; setsReps: string }[];
  };
}

export interface CoreExercise {
  id: string;
  name: string;
  description: string;
  targetMuscles: string[];
  videoUrl?: string;
  tip?: string;
  instructions: string[];
}

export interface Stretch {
  id: string;
  name: string;
  targetArea: string;
  duration: string;
  description: string;
  videoUrl?: string;
  tip?: string;
  instructions: string[];
}

// ---------------------------------------------------------------------------
// Video URLs & Form Tips (from Anthony's demo recordings)
// ---------------------------------------------------------------------------

export const EXERCISE_VIDEO_MAP: Record<string, { videoUrl: string; tip: string }> = {
  'stability-ball-knee-tucks': {
    videoUrl: 'https://www.youtube.com/embed/i3XJFhUIFp0',
    tip: 'Keep your hips level and avoid letting them sag to ensure maximum core engagement and protect your lower back.',
  },
  'stability-ball-pass-through': {
    videoUrl: 'https://www.youtube.com/embed/d-YhMc0ZSC4',
    tip: 'Engage your core throughout the movement and avoid arching your lower back.',
  },
  'stability-ball-circle-planks': {
    videoUrl: 'https://www.youtube.com/embed/fg1BK0bMRl4',
    tip: 'Move slowly and deliberately, keeping your core tight and your body in a straight line.',
  },
  'russian-twists': {
    videoUrl: 'https://www.youtube.com/embed/iGMntE-4OrQ',
    tip: 'Keep your back straight and avoid rounding your shoulders while twisting.',
  },
  'cable-knee-tucks': {
    videoUrl: 'https://www.youtube.com/embed/DKA3V9sdgLc',
    tip: 'Keep your movements controlled and your core engaged, avoiding momentum.',
  },
  'band-pull-aparts': {
    videoUrl: 'https://www.youtube.com/embed/zxzUSaQksdk',
    tip: 'Keep your shoulders relaxed and avoid shrugging while maintaining a slight bend in your elbows.',
  },
  'ankle-rockers': {
    videoUrl: 'https://www.youtube.com/embed/n4DlIEO6pFA',
    tip: 'Keep your movements smooth and controlled, focusing on full range of motion.',
  },
  'sidelying-windmill': {
    videoUrl: 'https://www.youtube.com/embed/icLFZvbcnMM',
    tip: 'Keep your hips stacked and your core engaged to prevent rotation from the lower back.',
  },
  'walking-sl-rdl': {
    videoUrl: 'https://www.youtube.com/embed/V4d84eWsvtw',
    tip: 'Keep your back flat and hinge from the hips, ensuring the movement stays controlled.',
  },
  'lateral-squat-walk': {
    videoUrl: 'https://www.youtube.com/embed/wj_VKRd_lXs',
    tip: 'Stay low in a partial squat position and keep your steps small and controlled.',
  },
  'world-greatest-stretch': {
    videoUrl: 'https://www.youtube.com/embed/sjvkiqQ0cQ0',
    tip: 'Move slowly through each phase, keeping your core engaged and your movements deliberate.',
  },
  'clock-squats': {
    videoUrl: 'https://www.youtube.com/embed/BhYFy-sbvX8',
    tip: 'Maintain a neutral spine and controlled knee alignment, ensuring your knees track over your toes.',
  },
  'goblet-squats': {
    videoUrl: 'https://www.youtube.com/embed/EvZJhUfuQfc',
    tip: 'Hold the weight close to your chest, keep your heels flat on the ground.',
  },
  'goblet-squat': {
    videoUrl: 'https://www.youtube.com/embed/EvZJhUfuQfc',
    tip: 'Hold the weight close to your chest, keep your heels flat on the ground.',
  },
  'front-foot-elevated-split-squat': {
    videoUrl: 'https://www.youtube.com/embed/cqj2wy1Kpnw',
    tip: 'Keep your torso upright and lower slowly to ensure your front knee stays aligned over your toes.',
  },
  'broad-jumps': {
    videoUrl: 'https://www.youtube.com/embed/kNgKKjPshx4',
    tip: 'Focus on a controlled landing by bending your knees and engaging your core.',
  },
  'broad-jumps-into-box-jump': {
    videoUrl: 'https://www.youtube.com/embed/kNgKKjPshx4',
    tip: 'Focus on a controlled landing by bending your knees and engaging your core.',
  },
  'renegade-row-push-up': {
    videoUrl: 'https://www.youtube.com/embed/CySoae7lM94',
    tip: 'Keep your hips level and core tight throughout the movement to avoid twisting.',
  },
  'lateral-lunges': {
    videoUrl: 'https://www.youtube.com/embed/0FNQfz5X55A',
    tip: 'Keep your chest up and your weight in your heel as you step to the side.',
  },
};

/** Foam roller video for recovery sections */
export const FOAM_ROLLER_VIDEO = {
  videoUrl: 'https://www.youtube.com/embed/f47GLil35ho',
  tip: 'Roll slowly over the muscle, pausing on tight spots for 20-30 seconds.',
};

// ---------------------------------------------------------------------------
// Phase metadata
// ---------------------------------------------------------------------------

export const PHASES: {
  phase: Phase;
  label: string;
  weeks: string;
  description: string;
}[] = [
  {
    phase: 'gpp',
    label: 'General Prep Phase',
    weeks: '1-4',
    description:
      'Build a foundation of movement quality, muscular endurance and work capacity. Higher reps, moderate loads.',
  },
  {
    phase: 'deload',
    label: 'Deload',
    weeks: '5, 9',
    description:
      'Active recovery week. Reduced volume to allow adaptation and prepare for the next training block.',
  },
  {
    phase: 'strength',
    label: 'Strength',
    weeks: '6-8',
    description:
      'Increase maximal force production with heavier loads, lower reps and longer rest periods.',
  },
  {
    phase: 'power',
    label: 'Power',
    weeks: '10-12',
    description:
      'Convert strength gains into explosive power for on-bike performance. Low reps, maximal intent.',
  },
];

// ---------------------------------------------------------------------------
// Warmup (identical for every week / day)
// ---------------------------------------------------------------------------

export const WARMUP: WarmupExercise[] = [
  {
    id: 'band-pull-aparts',
    name: 'Band pull aparts',
    setsReps: '2x25',
    videoUrl: EXERCISE_VIDEO_MAP['band-pull-aparts']?.videoUrl,
    tip: EXERCISE_VIDEO_MAP['band-pull-aparts']?.tip,
  },
  {
    id: 'ankle-rockers',
    name: 'Ankle rockers',
    setsReps: '10ea',
    tempo: '3sec hold',
    videoUrl: EXERCISE_VIDEO_MAP['ankle-rockers']?.videoUrl,
    tip: EXERCISE_VIDEO_MAP['ankle-rockers']?.tip,
  },
  {
    id: 'sidelying-windmill',
    name: 'Sidelying Windmill',
    setsReps: '10ea',
    videoUrl: EXERCISE_VIDEO_MAP['sidelying-windmill']?.videoUrl,
    tip: EXERCISE_VIDEO_MAP['sidelying-windmill']?.tip,
  },
  {
    id: 'walking-sl-rdl',
    name: 'Walking SL RDL',
    setsReps: '10ea',
    videoUrl: EXERCISE_VIDEO_MAP['walking-sl-rdl']?.videoUrl,
    tip: EXERCISE_VIDEO_MAP['walking-sl-rdl']?.tip,
  },
  {
    id: 'lateral-squat-walk',
    name: 'Lateral squat walk',
    setsReps: '10ea',
    videoUrl: EXERCISE_VIDEO_MAP['lateral-squat-walk']?.videoUrl,
    tip: EXERCISE_VIDEO_MAP['lateral-squat-walk']?.tip,
  },
  { id: 'bear-crawls', name: 'Bear crawls', setsReps: '10ea' },
  {
    id: 'world-greatest-stretch',
    name: 'World greatest stretch',
    setsReps: '10ea',
    videoUrl: EXERCISE_VIDEO_MAP['world-greatest-stretch']?.videoUrl,
    tip: EXERCISE_VIDEO_MAP['world-greatest-stretch']?.tip,
  },
  {
    id: 'clock-squats',
    name: 'Clock squats',
    setsReps: '10ea',
    videoUrl: EXERCISE_VIDEO_MAP['clock-squats']?.videoUrl,
    tip: EXERCISE_VIDEO_MAP['clock-squats']?.tip,
  },
];

// ---------------------------------------------------------------------------
// Recovery (identical for every week)
// ---------------------------------------------------------------------------

const RECOVERY: string[] = [
  'Foam roll 20-30sec each major muscle group',
  'Focus on tight/sore muscles',
];

// ---------------------------------------------------------------------------
// Glute Activation (Day 1, all weeks)
// ---------------------------------------------------------------------------

const GLUTE_ACTIVATION = {
  exercises: [
    { name: 'Miniband walks', setsReps: '' },
    { name: 'Cook hip lift', setsReps: '2x6ea' },
  ],
};

// ---------------------------------------------------------------------------
// Core Circuit exercise definitions (6 exercises, 2 sets of 3)
// ---------------------------------------------------------------------------

function coreCircuitExercises(reps: number): CoreCircuitExercise[] {
  return [
    {
      id: 'stability-ball-knee-tucks',
      name: 'Stability Ball Knee Tucks',
      reps: `${reps}`,
      videoUrl: EXERCISE_VIDEO_MAP['stability-ball-knee-tucks']?.videoUrl,
      tip: EXERCISE_VIDEO_MAP['stability-ball-knee-tucks']?.tip,
    },
    {
      id: 'stability-ball-pass-through',
      name: 'Stability Ball pass through',
      reps: `${reps}`,
      videoUrl: EXERCISE_VIDEO_MAP['stability-ball-pass-through']?.videoUrl,
      tip: EXERCISE_VIDEO_MAP['stability-ball-pass-through']?.tip,
    },
    {
      id: 'stability-ball-circle-planks',
      name: 'Stability Ball Circle Planks',
      reps: `${reps}`,
      videoUrl: EXERCISE_VIDEO_MAP['stability-ball-circle-planks']?.videoUrl,
      tip: EXERCISE_VIDEO_MAP['stability-ball-circle-planks']?.tip,
    },
    {
      id: 'elbow-to-hand-plank',
      name: 'Elbow to hand plank',
      reps: `${reps}ea`,
    },
    {
      id: 'russian-twists',
      name: 'Russian twists',
      reps: `${reps}ea`,
      videoUrl: EXERCISE_VIDEO_MAP['russian-twists']?.videoUrl,
      tip: EXERCISE_VIDEO_MAP['russian-twists']?.tip,
    },
    {
      id: 'cable-knee-tucks',
      name: 'Cable Knee tucks',
      reps: `${reps}ea`,
      videoUrl: EXERCISE_VIDEO_MAP['cable-knee-tucks']?.videoUrl,
      tip: EXERCISE_VIDEO_MAP['cable-knee-tucks']?.tip,
    },
  ];
}

// ---------------------------------------------------------------------------
// Core circuit config per week
// ---------------------------------------------------------------------------

interface CoreCircuitConfig {
  reps: number;
  sets?: number;
  restBetweenSets?: string;
  breakDuration?: string;
}

const CORE_CIRCUIT_CONFIG: Record<number, CoreCircuitConfig> = {
  1: { reps: 10, breakDuration: '1 min' },
  2: { reps: 12 },
  3: { reps: 15 },
  4: { reps: 20 },
  5: { reps: 10, sets: 3, restBetweenSets: '3 min' },
  6: { reps: 12, sets: 3, restBetweenSets: '3 min' },
  7: { reps: 15, sets: 3, restBetweenSets: '3 min' },
  8: { reps: 20, sets: 3, restBetweenSets: '3 min' },
  9: { reps: 20 },
  10: { reps: 20, sets: 3, restBetweenSets: '3 min' },
  11: { reps: 20, sets: 3, restBetweenSets: '3 min', breakDuration: '30sec' },
  12: { reps: 20, sets: 3, restBetweenSets: '3 min', breakDuration: '15sec' },
};

// ---------------------------------------------------------------------------
// Helper to build a WeekPlan
// ---------------------------------------------------------------------------

function week(
  weekNumber: number,
  phase: Phase,
  phaseLabel: string,
  day1Workout: Exercise[],
  day2Workout: Exercise[],
): WeekPlan {
  const cc = CORE_CIRCUIT_CONFIG[weekNumber];
  return {
    weekNumber,
    phase,
    phaseLabel,
    isDeload: phase === 'deload',
    days: [
      {
        dayNumber: 1,
        type: 'Push',
        warmup: WARMUP,
        workout: day1Workout,
        recovery: RECOVERY,
      },
      {
        dayNumber: 2,
        type: 'Pull',
        warmup: WARMUP,
        workout: day2Workout,
        recovery: RECOVERY,
      },
    ],
    coreCircuit: {
      reps: cc.reps,
      sets: cc.sets,
      restBetweenSets: cc.restBetweenSets,
      breakDuration: cc.breakDuration,
      exercises: coreCircuitExercises(cc.reps),
    },
    gluteActivation: GLUTE_ACTIVATION,
  };
}

// ---------------------------------------------------------------------------
// 12-week programme
// ---------------------------------------------------------------------------

export const PROGRAMME: WeekPlan[] = [
  // ── Week 1 — GPP ──────────────────────────────────────────────────────
  week(1, 'gpp', 'General Prep Phase', [
    {
      id: 'goblet-squats',
      name: 'Goblet squats',
      setsReps: '4x12',
      rest: '60 sec',
      supersetGroup: 'A',
      videoUrl: EXERCISE_VIDEO_MAP['goblet-squats']?.videoUrl,
      tip: EXERCISE_VIDEO_MAP['goblet-squats']?.tip,
    },
    {
      id: 'front-foot-elevated-split-squat',
      name: 'Front foot elevated split squat',
      setsReps: '3x12ea',
      supersetGroup: 'B',
      videoUrl: EXERCISE_VIDEO_MAP['front-foot-elevated-split-squat']?.videoUrl,
      tip: EXERCISE_VIDEO_MAP['front-foot-elevated-split-squat']?.tip,
    },
    {
      id: 'broad-jumps',
      name: 'Broad jumps',
      setsReps: '3x4',
      tempo: 'X',
      rest: '60 sec',
      supersetGroup: 'B',
      videoUrl: EXERCISE_VIDEO_MAP['broad-jumps']?.videoUrl,
      tip: EXERCISE_VIDEO_MAP['broad-jumps']?.tip,
    },
    {
      id: 'renegade-row-push-up',
      name: 'Renegade row/push up',
      setsReps: '3x20',
      supersetGroup: 'C',
      videoUrl: EXERCISE_VIDEO_MAP['renegade-row-push-up']?.videoUrl,
      tip: EXERCISE_VIDEO_MAP['renegade-row-push-up']?.tip,
    },
    {
      id: 'lateral-lunges',
      name: 'Lateral lunges',
      setsReps: '3x12ea',
      supersetGroup: 'C',
      videoUrl: EXERCISE_VIDEO_MAP['lateral-lunges']?.videoUrl,
      tip: EXERCISE_VIDEO_MAP['lateral-lunges']?.tip,
    },
    {
      id: 'prowler',
      name: 'Prowler',
      setsReps: '4x20m',
      rest: '60 sec',
      supersetGroup: 'C',
      videoUrl: EXERCISE_VIDEO_MAP['prowler']?.videoUrl,
      tip: EXERCISE_VIDEO_MAP['prowler']?.tip,
    },
  ], [
    {
      id: 'trapbar-deadlift',
      name: 'Trapbar deadlift',
      setsReps: '4x12',
      rest: '60 sec',
      supersetGroup: 'A',
      videoUrl: EXERCISE_VIDEO_MAP['trapbar-deadlift']?.videoUrl,
      tip: EXERCISE_VIDEO_MAP['trapbar-deadlift']?.tip,
    },
    {
      id: 'single-leg-romanian-deadlift',
      name: 'Single Leg Romanian deadlift',
      setsReps: '3x12ea',
      supersetGroup: 'B',
      videoUrl: EXERCISE_VIDEO_MAP['single-leg-romanian-deadlift']?.videoUrl,
      tip: EXERCISE_VIDEO_MAP['single-leg-romanian-deadlift']?.tip,
    },
    {
      id: 'inverted-rows',
      name: 'Inverted rows',
      setsReps: '3x12',
      rest: '60 sec',
      supersetGroup: 'C',
      videoUrl: EXERCISE_VIDEO_MAP['inverted-rows']?.videoUrl,
      tip: EXERCISE_VIDEO_MAP['inverted-rows']?.tip,
    },
    {
      id: 'kettlebell-swing',
      name: 'Kettlebell swing',
      setsReps: '3x12',
      supersetGroup: 'C',
      videoUrl: EXERCISE_VIDEO_MAP['kettlebell-swing']?.videoUrl,
      tip: EXERCISE_VIDEO_MAP['kettlebell-swing']?.tip,
    },
    {
      id: 'stability-ball-leg-curl',
      name: 'Stability ball leg curl',
      setsReps: '3x6',
      supersetGroup: 'C',
      videoUrl: EXERCISE_VIDEO_MAP['stability-ball-leg-curl']?.videoUrl,
      tip: EXERCISE_VIDEO_MAP['stability-ball-leg-curl']?.tip,
    },
  ]),

  // ── Week 2 — GPP ──────────────────────────────────────────────────────
  week(2, 'gpp', 'General Prep Phase', [
    {
      id: 'goblet-squats',
      name: 'Goblet squats',
      setsReps: '4x10',
      rest: '60 sec',
      supersetGroup: 'A',
      videoUrl: EXERCISE_VIDEO_MAP['goblet-squats']?.videoUrl,
      tip: EXERCISE_VIDEO_MAP['goblet-squats']?.tip,
    },
    {
      id: 'front-foot-elevated-split-squat',
      name: 'Front foot elevated split squat',
      setsReps: '3x10 ea',
      supersetGroup: 'B',
      videoUrl: EXERCISE_VIDEO_MAP['front-foot-elevated-split-squat']?.videoUrl,
      tip: EXERCISE_VIDEO_MAP['front-foot-elevated-split-squat']?.tip,
    },
    {
      id: 'broad-jumps',
      name: 'Broad jumps',
      setsReps: '3x4',
      tempo: 'X',
      rest: '60 sec',
      supersetGroup: 'B',
      videoUrl: EXERCISE_VIDEO_MAP['broad-jumps']?.videoUrl,
      tip: EXERCISE_VIDEO_MAP['broad-jumps']?.tip,
    },
    {
      id: 'renegade-row-push-up',
      name: 'Renegade row/push up',
      setsReps: '3x20',
      supersetGroup: 'C',
      videoUrl: EXERCISE_VIDEO_MAP['renegade-row-push-up']?.videoUrl,
      tip: EXERCISE_VIDEO_MAP['renegade-row-push-up']?.tip,
    },
    {
      id: 'lateral-lunges',
      name: 'Lateral lunges',
      setsReps: '3x10 ea',
      supersetGroup: 'C',
      videoUrl: EXERCISE_VIDEO_MAP['lateral-lunges']?.videoUrl,
      tip: EXERCISE_VIDEO_MAP['lateral-lunges']?.tip,
    },
    {
      id: 'prowler',
      name: 'Prowler',
      setsReps: '4x20m',
      rest: '60 sec',
      supersetGroup: 'C',
      videoUrl: EXERCISE_VIDEO_MAP['prowler']?.videoUrl,
      tip: EXERCISE_VIDEO_MAP['prowler']?.tip,
    },
  ], [
    {
      id: 'trapbar-deadlift',
      name: 'Trapbar deadlift',
      setsReps: '4x10',
      rest: '60 sec',
      supersetGroup: 'A',
      videoUrl: EXERCISE_VIDEO_MAP['trapbar-deadlift']?.videoUrl,
      tip: EXERCISE_VIDEO_MAP['trapbar-deadlift']?.tip,
    },
    {
      id: 'single-leg-romanian-deadlift',
      name: 'Single Leg Romanian deadlift',
      setsReps: '3x10ea',
      supersetGroup: 'B',
      videoUrl: EXERCISE_VIDEO_MAP['single-leg-romanian-deadlift']?.videoUrl,
      tip: EXERCISE_VIDEO_MAP['single-leg-romanian-deadlift']?.tip,
    },
    {
      id: 'inverted-rows',
      name: 'Inverted rows',
      setsReps: '3x10',
      supersetGroup: 'C',
      videoUrl: EXERCISE_VIDEO_MAP['inverted-rows']?.videoUrl,
      tip: EXERCISE_VIDEO_MAP['inverted-rows']?.tip,
    },
    {
      id: 'kettlebell-swing',
      name: 'Kettlebell swing',
      setsReps: '3x10',
      supersetGroup: 'C',
      videoUrl: EXERCISE_VIDEO_MAP['kettlebell-swing']?.videoUrl,
      tip: EXERCISE_VIDEO_MAP['kettlebell-swing']?.tip,
    },
    {
      id: 'stability-ball-leg-curl',
      name: 'Stability ball leg curl',
      setsReps: '3x8',
      rest: '60 sec',
      supersetGroup: 'C',
      videoUrl: EXERCISE_VIDEO_MAP['stability-ball-leg-curl']?.videoUrl,
      tip: EXERCISE_VIDEO_MAP['stability-ball-leg-curl']?.tip,
    },
  ]),

  // ── Week 3 — GPP ──────────────────────────────────────────────────────
  week(3, 'gpp', 'General Prep Phase', [
    {
      id: 'goblet-squat',
      name: 'Goblet squat',
      setsReps: '4x8',
      rest: '60 sec',
      supersetGroup: 'A',
      videoUrl: EXERCISE_VIDEO_MAP['goblet-squat']?.videoUrl,
      tip: EXERCISE_VIDEO_MAP['goblet-squat']?.tip,
    },
    {
      id: 'bulgarian-split-squat',
      name: 'Bulgarian split squat',
      setsReps: '3x8ea',
      supersetGroup: 'B',
      videoUrl: EXERCISE_VIDEO_MAP['bulgarian-split-squat']?.videoUrl,
      tip: EXERCISE_VIDEO_MAP['bulgarian-split-squat']?.tip,
    },
    {
      id: 'broad-jumps',
      name: 'Broad jumps',
      setsReps: '3x4',
      tempo: 'X',
      rest: '60 sec',
      supersetGroup: 'B',
      videoUrl: EXERCISE_VIDEO_MAP['broad-jumps']?.videoUrl,
      tip: EXERCISE_VIDEO_MAP['broad-jumps']?.tip,
    },
    {
      id: 'renegade-row-push-up',
      name: 'Renegade row/push up',
      setsReps: '3x20',
      supersetGroup: 'C',
      videoUrl: EXERCISE_VIDEO_MAP['renegade-row-push-up']?.videoUrl,
      tip: EXERCISE_VIDEO_MAP['renegade-row-push-up']?.tip,
    },
    {
      id: 'lateral-lunges',
      name: 'Lateral lunges',
      setsReps: '3x8ea',
      supersetGroup: 'C',
      videoUrl: EXERCISE_VIDEO_MAP['lateral-lunges']?.videoUrl,
      tip: EXERCISE_VIDEO_MAP['lateral-lunges']?.tip,
    },
    {
      id: 'prowler',
      name: 'Prowler',
      setsReps: '4x20m',
      rest: '60 sec',
      supersetGroup: 'C',
      videoUrl: EXERCISE_VIDEO_MAP['prowler']?.videoUrl,
      tip: EXERCISE_VIDEO_MAP['prowler']?.tip,
    },
  ], [
    {
      id: 'trapbar-deadlift',
      name: 'Trapbar deadlift',
      setsReps: '4x8',
      rest: '60 sec',
      supersetGroup: 'A',
      videoUrl: EXERCISE_VIDEO_MAP['trapbar-deadlift']?.videoUrl,
      tip: EXERCISE_VIDEO_MAP['trapbar-deadlift']?.tip,
    },
    {
      id: 'single-leg-romanian-deadlift',
      name: 'Single Leg Romanian deadlift',
      setsReps: '3x8ea',
      supersetGroup: 'B',
      videoUrl: EXERCISE_VIDEO_MAP['single-leg-romanian-deadlift']?.videoUrl,
      tip: EXERCISE_VIDEO_MAP['single-leg-romanian-deadlift']?.tip,
    },
    {
      id: 'inverted-rows',
      name: 'Inverted rows',
      setsReps: '3x8',
      supersetGroup: 'C',
      videoUrl: EXERCISE_VIDEO_MAP['inverted-rows']?.videoUrl,
      tip: EXERCISE_VIDEO_MAP['inverted-rows']?.tip,
    },
    {
      id: 'kettlebell-swing',
      name: 'Kettlebell swing',
      setsReps: '3x8',
      supersetGroup: 'C',
      videoUrl: EXERCISE_VIDEO_MAP['kettlebell-swing']?.videoUrl,
      tip: EXERCISE_VIDEO_MAP['kettlebell-swing']?.tip,
    },
    {
      id: 'stability-ball-leg-curl',
      name: 'Stability ball leg curl',
      setsReps: '3x10',
      rest: '60 sec',
      supersetGroup: 'C',
      videoUrl: EXERCISE_VIDEO_MAP['stability-ball-leg-curl']?.videoUrl,
      tip: EXERCISE_VIDEO_MAP['stability-ball-leg-curl']?.tip,
    },
  ]),

  // ── Week 4 — GPP ──────────────────────────────────────────────────────
  week(4, 'gpp', 'General Prep Phase', [
    {
      id: 'front-squat',
      name: 'Front squat',
      setsReps: '4x8',
      rest: '60 sec',
      supersetGroup: 'A',
      videoUrl: EXERCISE_VIDEO_MAP['front-squat']?.videoUrl,
      tip: EXERCISE_VIDEO_MAP['front-squat']?.tip,
    },
    {
      id: 'bulgarian-split-squat',
      name: 'Bulgarian split squat',
      setsReps: '3x8ea',
      supersetGroup: 'B',
      videoUrl: EXERCISE_VIDEO_MAP['bulgarian-split-squat']?.videoUrl,
      tip: EXERCISE_VIDEO_MAP['bulgarian-split-squat']?.tip,
    },
    {
      id: 'broad-jumps',
      name: 'Broad jumps',
      setsReps: '3x4',
      tempo: 'X',
      rest: '60 sec',
      supersetGroup: 'B',
      videoUrl: EXERCISE_VIDEO_MAP['broad-jumps']?.videoUrl,
      tip: EXERCISE_VIDEO_MAP['broad-jumps']?.tip,
    },
    {
      id: 'renegade-row-push-up',
      name: 'Renegade row/push up',
      setsReps: '3x20',
      supersetGroup: 'C',
      videoUrl: EXERCISE_VIDEO_MAP['renegade-row-push-up']?.videoUrl,
      tip: EXERCISE_VIDEO_MAP['renegade-row-push-up']?.tip,
    },
    {
      id: 'lateral-lunges',
      name: 'Lateral lunges',
      setsReps: '3x8ea',
      supersetGroup: 'C',
      videoUrl: EXERCISE_VIDEO_MAP['lateral-lunges']?.videoUrl,
      tip: EXERCISE_VIDEO_MAP['lateral-lunges']?.tip,
    },
    {
      id: 'prowler',
      name: 'Prowler',
      setsReps: '4x20m',
      rest: '60 sec',
      supersetGroup: 'C',
      videoUrl: EXERCISE_VIDEO_MAP['prowler']?.videoUrl,
      tip: EXERCISE_VIDEO_MAP['prowler']?.tip,
    },
  ], [
    {
      id: 'sumo-conventional-deadlift',
      name: 'Sumo/Conventional deadlift',
      setsReps: '4x8',
      rest: '60 sec',
      supersetGroup: 'A',
      videoUrl: EXERCISE_VIDEO_MAP['sumo-conventional-deadlift']?.videoUrl,
      tip: EXERCISE_VIDEO_MAP['sumo-conventional-deadlift']?.tip,
    },
    {
      id: 'single-leg-romanian-deadlift',
      name: 'Single Leg Romanian deadlift',
      setsReps: '3x8ea',
      supersetGroup: 'B',
      videoUrl: EXERCISE_VIDEO_MAP['single-leg-romanian-deadlift']?.videoUrl,
      tip: EXERCISE_VIDEO_MAP['single-leg-romanian-deadlift']?.tip,
    },
    {
      id: 'inverted-rows',
      name: 'Inverted rows',
      setsReps: '3x8',
      supersetGroup: 'C',
      videoUrl: EXERCISE_VIDEO_MAP['inverted-rows']?.videoUrl,
      tip: EXERCISE_VIDEO_MAP['inverted-rows']?.tip,
    },
    {
      id: 'kettlebell-swing',
      name: 'Kettlebell swing',
      setsReps: '3x8',
      supersetGroup: 'C',
      videoUrl: EXERCISE_VIDEO_MAP['kettlebell-swing']?.videoUrl,
      tip: EXERCISE_VIDEO_MAP['kettlebell-swing']?.tip,
    },
    {
      id: 'stability-ball-leg-curl',
      name: 'Stability ball leg curl',
      setsReps: '3x10',
      rest: '60 sec',
      supersetGroup: 'C',
      videoUrl: EXERCISE_VIDEO_MAP['stability-ball-leg-curl']?.videoUrl,
      tip: EXERCISE_VIDEO_MAP['stability-ball-leg-curl']?.tip,
    },
  ]),

  // ── Week 5 — Deload ───────────────────────────────────────────────────
  week(5, 'deload', 'Deload', [
    {
      id: 'front-squat',
      name: 'Front squat',
      setsReps: '4x8',
      rest: '60-90 sec',
      supersetGroup: 'A',
      videoUrl: EXERCISE_VIDEO_MAP['front-squat']?.videoUrl,
      tip: EXERCISE_VIDEO_MAP['front-squat']?.tip,
    },
  ], [
    {
      id: 'sumo-conventional-deadlift',
      name: 'Sumo/Conventional deadlift',
      setsReps: '4x8',
      rest: '60-90 sec',
      supersetGroup: 'A',
      videoUrl: EXERCISE_VIDEO_MAP['sumo-conventional-deadlift']?.videoUrl,
      tip: EXERCISE_VIDEO_MAP['sumo-conventional-deadlift']?.tip,
    },
  ]),

  // ── Week 6 — Strength ─────────────────────────────────────────────────
  week(6, 'strength', 'Strength', [
    {
      id: 'front-squat',
      name: 'Front squat',
      setsReps: '4x6',
      rest: '3-5 min',
      supersetGroup: 'A',
      videoUrl: EXERCISE_VIDEO_MAP['front-squat']?.videoUrl,
      tip: EXERCISE_VIDEO_MAP['front-squat']?.tip,
    },
    {
      id: 'bulgarian-split-squat',
      name: 'Bulgarian split squat',
      setsReps: '3x8ea',
      supersetGroup: 'B',
      videoUrl: EXERCISE_VIDEO_MAP['bulgarian-split-squat']?.videoUrl,
      tip: EXERCISE_VIDEO_MAP['bulgarian-split-squat']?.tip,
    },
    {
      id: 'box-jumps',
      name: 'Box jumps',
      setsReps: '3x6',
      tempo: 'X',
      rest: '90-120 sec',
      supersetGroup: 'B',
      videoUrl: EXERCISE_VIDEO_MAP['box-jumps']?.videoUrl,
      tip: EXERCISE_VIDEO_MAP['box-jumps']?.tip,
    },
    {
      id: 'feet-elevated-pushups',
      name: 'Feet elevated pushups',
      setsReps: '3x15',
      supersetGroup: 'C',
      videoUrl: EXERCISE_VIDEO_MAP['feet-elevated-pushups']?.videoUrl,
      tip: EXERCISE_VIDEO_MAP['feet-elevated-pushups']?.tip,
    },
    {
      id: 'skater-jumps-to-stick',
      name: 'Skater jumps to stick',
      setsReps: '3x10ea',
      supersetGroup: 'C',
      videoUrl: EXERCISE_VIDEO_MAP['skater-jumps-to-stick']?.videoUrl,
      tip: EXERCISE_VIDEO_MAP['skater-jumps-to-stick']?.tip,
    },
    {
      id: 'prowler',
      name: 'Prowler',
      setsReps: '4x20m',
      rest: '60 sec',
      supersetGroup: 'C',
      videoUrl: EXERCISE_VIDEO_MAP['prowler']?.videoUrl,
      tip: EXERCISE_VIDEO_MAP['prowler']?.tip,
    },
  ], [
    {
      id: 'sumo-conventional-deadlift',
      name: 'Sumo/Conventional deadlift',
      setsReps: '4x6',
      rest: '90-120 sec',
      supersetGroup: 'A',
      videoUrl: EXERCISE_VIDEO_MAP['sumo-conventional-deadlift']?.videoUrl,
      tip: EXERCISE_VIDEO_MAP['sumo-conventional-deadlift']?.tip,
    },
    {
      id: 'single-leg-romanian-deadlift-barbell',
      name: 'Single Leg Romanian deadlift barbell',
      setsReps: '3x8ea',
      supersetGroup: 'B',
      videoUrl: EXERCISE_VIDEO_MAP['single-leg-romanian-deadlift-barbell']?.videoUrl,
      tip: EXERCISE_VIDEO_MAP['single-leg-romanian-deadlift-barbell']?.tip,
    },
    {
      id: 'pullups-band-assisted',
      name: 'Pullups (Band assisted)',
      setsReps: '3x8',
      supersetGroup: 'C',
      videoUrl: EXERCISE_VIDEO_MAP['pullups-band-assisted']?.videoUrl,
      tip: EXERCISE_VIDEO_MAP['pullups-band-assisted']?.tip,
    },
    {
      id: 'kettlebell-swing',
      name: 'Kettlebell swing',
      setsReps: '3x8',
      supersetGroup: 'C',
      videoUrl: EXERCISE_VIDEO_MAP['kettlebell-swing']?.videoUrl,
      tip: EXERCISE_VIDEO_MAP['kettlebell-swing']?.tip,
    },
    {
      id: 'stability-ball-leg-curl-1-leg',
      name: 'Stability ball leg curl 1-leg',
      setsReps: '3x6ea',
      rest: '60 sec',
      supersetGroup: 'C',
      videoUrl: EXERCISE_VIDEO_MAP['stability-ball-leg-curl-1-leg']?.videoUrl,
      tip: EXERCISE_VIDEO_MAP['stability-ball-leg-curl-1-leg']?.tip,
    },
  ]),

  // ── Week 7 — Strength ─────────────────────────────────────────────────
  week(7, 'strength', 'Strength', [
    {
      id: 'front-squat',
      name: 'Front squat',
      setsReps: '4x6',
      rest: '3-5 min',
      supersetGroup: 'A',
      videoUrl: EXERCISE_VIDEO_MAP['front-squat']?.videoUrl,
      tip: EXERCISE_VIDEO_MAP['front-squat']?.tip,
    },
    {
      id: 'bulgarian-split-squat',
      name: 'Bulgarian split squat',
      setsReps: '3x6ea',
      supersetGroup: 'B',
      videoUrl: EXERCISE_VIDEO_MAP['bulgarian-split-squat']?.videoUrl,
      tip: EXERCISE_VIDEO_MAP['bulgarian-split-squat']?.tip,
    },
    {
      id: 'box-jumps',
      name: 'Box jumps',
      setsReps: '3x6',
      tempo: 'X',
      rest: '90-120 sec',
      supersetGroup: 'B',
      videoUrl: EXERCISE_VIDEO_MAP['box-jumps']?.videoUrl,
      tip: EXERCISE_VIDEO_MAP['box-jumps']?.tip,
    },
    {
      id: 'feet-elevated-pushups',
      name: 'Feet elevated pushups',
      setsReps: '3x15',
      supersetGroup: 'C',
      videoUrl: EXERCISE_VIDEO_MAP['feet-elevated-pushups']?.videoUrl,
      tip: EXERCISE_VIDEO_MAP['feet-elevated-pushups']?.tip,
    },
    {
      id: 'skater-jumps-to-stick',
      name: 'Skater jumps to stick',
      setsReps: '3x10ea',
      supersetGroup: 'C',
      videoUrl: EXERCISE_VIDEO_MAP['skater-jumps-to-stick']?.videoUrl,
      tip: EXERCISE_VIDEO_MAP['skater-jumps-to-stick']?.tip,
    },
    {
      id: 'prowler',
      name: 'Prowler',
      setsReps: '4x20m',
      rest: '60 sec',
      supersetGroup: 'C',
      videoUrl: EXERCISE_VIDEO_MAP['prowler']?.videoUrl,
      tip: EXERCISE_VIDEO_MAP['prowler']?.tip,
    },
  ], [
    {
      id: 'sumo-conventional-deadlift',
      name: 'Sumo/Conventional deadlift',
      setsReps: '4x6',
      rest: '3-5 min',
      supersetGroup: 'A',
      videoUrl: EXERCISE_VIDEO_MAP['sumo-conventional-deadlift']?.videoUrl,
      tip: EXERCISE_VIDEO_MAP['sumo-conventional-deadlift']?.tip,
    },
    {
      id: 'single-leg-romanian-deadlift-barbell',
      name: 'Single Leg Romanian deadlift barbell',
      setsReps: '3x6ea',
      supersetGroup: 'B',
      videoUrl: EXERCISE_VIDEO_MAP['single-leg-romanian-deadlift-barbell']?.videoUrl,
      tip: EXERCISE_VIDEO_MAP['single-leg-romanian-deadlift-barbell']?.tip,
    },
    {
      id: 'pullups-band-assisted',
      name: 'Pullups (Band assisted)',
      setsReps: '3x8',
      supersetGroup: 'C',
      videoUrl: EXERCISE_VIDEO_MAP['pullups-band-assisted']?.videoUrl,
      tip: EXERCISE_VIDEO_MAP['pullups-band-assisted']?.tip,
    },
    {
      id: 'kettlebell-swing',
      name: 'Kettlebell swing',
      setsReps: '3x8',
      supersetGroup: 'C',
      videoUrl: EXERCISE_VIDEO_MAP['kettlebell-swing']?.videoUrl,
      tip: EXERCISE_VIDEO_MAP['kettlebell-swing']?.tip,
    },
    {
      id: 'stability-ball-leg-curl-1-leg',
      name: 'Stability ball leg curl 1-leg',
      setsReps: '3x6ea',
      rest: '60 sec',
      supersetGroup: 'C',
      videoUrl: EXERCISE_VIDEO_MAP['stability-ball-leg-curl-1-leg']?.videoUrl,
      tip: EXERCISE_VIDEO_MAP['stability-ball-leg-curl-1-leg']?.tip,
    },
  ]),

  // ── Week 8 — Strength ─────────────────────────────────────────────────
  week(8, 'strength', 'Strength', [
    {
      id: 'front-squat',
      name: 'Front squat',
      setsReps: '4x5',
      rest: '3-5 min',
      supersetGroup: 'A',
      videoUrl: EXERCISE_VIDEO_MAP['front-squat']?.videoUrl,
      tip: EXERCISE_VIDEO_MAP['front-squat']?.tip,
    },
    {
      id: 'bulgarian-split-squat',
      name: 'Bulgarian split squat',
      setsReps: '3x6ea',
      supersetGroup: 'B',
      videoUrl: EXERCISE_VIDEO_MAP['bulgarian-split-squat']?.videoUrl,
      tip: EXERCISE_VIDEO_MAP['bulgarian-split-squat']?.tip,
    },
    {
      id: 'box-jumps',
      name: 'Box jumps',
      setsReps: '3x6',
      tempo: 'X',
      rest: '90-120 sec',
      supersetGroup: 'B',
      videoUrl: EXERCISE_VIDEO_MAP['box-jumps']?.videoUrl,
      tip: EXERCISE_VIDEO_MAP['box-jumps']?.tip,
    },
    {
      id: 'feet-elevated-pushups',
      name: 'Feet elevated pushups',
      setsReps: '3x15',
      supersetGroup: 'C',
      videoUrl: EXERCISE_VIDEO_MAP['feet-elevated-pushups']?.videoUrl,
      tip: EXERCISE_VIDEO_MAP['feet-elevated-pushups']?.tip,
    },
    {
      id: 'skater-jumps-to-stick',
      name: 'Skater jumps to stick',
      setsReps: '3x10ea',
      supersetGroup: 'C',
      videoUrl: EXERCISE_VIDEO_MAP['skater-jumps-to-stick']?.videoUrl,
      tip: EXERCISE_VIDEO_MAP['skater-jumps-to-stick']?.tip,
    },
    {
      id: 'prowler',
      name: 'Prowler',
      setsReps: '4x20m',
      rest: '60 sec',
      supersetGroup: 'C',
      videoUrl: EXERCISE_VIDEO_MAP['prowler']?.videoUrl,
      tip: EXERCISE_VIDEO_MAP['prowler']?.tip,
    },
  ], [
    {
      id: 'sumo-conventional-deadlift',
      name: 'Sumo/Conventional deadlift',
      setsReps: '4x5',
      rest: '3-5 min',
      supersetGroup: 'A',
      videoUrl: EXERCISE_VIDEO_MAP['sumo-conventional-deadlift']?.videoUrl,
      tip: EXERCISE_VIDEO_MAP['sumo-conventional-deadlift']?.tip,
    },
    {
      id: 'single-leg-romanian-deadlift-barbell',
      name: 'Single Leg Romanian deadlift barbell',
      setsReps: '3x6ea',
      supersetGroup: 'B',
      videoUrl: EXERCISE_VIDEO_MAP['single-leg-romanian-deadlift-barbell']?.videoUrl,
      tip: EXERCISE_VIDEO_MAP['single-leg-romanian-deadlift-barbell']?.tip,
    },
    {
      id: 'pullups-band-assisted',
      name: 'Pullups (Band assisted)',
      setsReps: '3x8',
      supersetGroup: 'C',
      videoUrl: EXERCISE_VIDEO_MAP['pullups-band-assisted']?.videoUrl,
      tip: EXERCISE_VIDEO_MAP['pullups-band-assisted']?.tip,
    },
    {
      id: 'kettlebell-swing',
      name: 'Kettlebell swing',
      setsReps: '3x8',
      supersetGroup: 'C',
      videoUrl: EXERCISE_VIDEO_MAP['kettlebell-swing']?.videoUrl,
      tip: EXERCISE_VIDEO_MAP['kettlebell-swing']?.tip,
    },
    {
      id: 'stability-ball-leg-curl-1-leg',
      name: 'Stability ball leg curl 1-leg',
      setsReps: '3x6ea',
      rest: '60 sec',
      supersetGroup: 'C',
      videoUrl: EXERCISE_VIDEO_MAP['stability-ball-leg-curl-1-leg']?.videoUrl,
      tip: EXERCISE_VIDEO_MAP['stability-ball-leg-curl-1-leg']?.tip,
    },
  ]),

  // ── Week 9 — Deload ───────────────────────────────────────────────────
  week(9, 'deload', 'Deload', [
    {
      id: 'front-squat',
      name: 'Front squat',
      setsReps: '5x5',
      rest: '3-5 min',
      supersetGroup: 'A',
      videoUrl: EXERCISE_VIDEO_MAP['front-squat']?.videoUrl,
      tip: EXERCISE_VIDEO_MAP['front-squat']?.tip,
    },
  ], [
    {
      id: 'sumo-conventional-deadlift',
      name: 'Sumo/Conventional deadlift',
      setsReps: '5x5',
      rest: '3-5 min',
      supersetGroup: 'A',
      videoUrl: EXERCISE_VIDEO_MAP['sumo-conventional-deadlift']?.videoUrl,
      tip: EXERCISE_VIDEO_MAP['sumo-conventional-deadlift']?.tip,
    },
  ]),

  // ── Week 10 — Power ───────────────────────────────────────────────────
  week(10, 'power', 'Power', [
    {
      id: 'front-squat',
      name: 'Front squat',
      setsReps: '5x5',
      rest: '3-5 min',
      supersetGroup: 'A',
      videoUrl: EXERCISE_VIDEO_MAP['front-squat']?.videoUrl,
      tip: EXERCISE_VIDEO_MAP['front-squat']?.tip,
    },
    {
      id: 'bulgarian-split-squat',
      name: 'Bulgarian split squat',
      setsReps: '2x6ea',
      supersetGroup: 'B',
      videoUrl: EXERCISE_VIDEO_MAP['bulgarian-split-squat']?.videoUrl,
      tip: EXERCISE_VIDEO_MAP['bulgarian-split-squat']?.tip,
    },
    {
      id: 'broad-jumps-into-box-jump',
      name: 'Broad jumps into box jump',
      setsReps: '3x6',
      tempo: 'X',
      rest: '90-120 sec',
      supersetGroup: 'B',
      videoUrl: EXERCISE_VIDEO_MAP['broad-jumps-into-box-jump']?.videoUrl,
      tip: EXERCISE_VIDEO_MAP['broad-jumps-into-box-jump']?.tip,
    },
    {
      id: 'plyo-pushups',
      name: 'Plyo pushups',
      setsReps: '2x6',
      supersetGroup: 'C',
      videoUrl: EXERCISE_VIDEO_MAP['plyo-pushups']?.videoUrl,
      tip: EXERCISE_VIDEO_MAP['plyo-pushups']?.tip,
    },
    {
      id: 'skater-jumps-to-stick',
      name: 'Skater jumps to stick',
      setsReps: '2x10ea',
      supersetGroup: 'C',
      videoUrl: EXERCISE_VIDEO_MAP['skater-jumps-to-stick']?.videoUrl,
      tip: EXERCISE_VIDEO_MAP['skater-jumps-to-stick']?.tip,
    },
    {
      id: 'prowler',
      name: 'Prowler',
      setsReps: '4x20m',
      rest: '90-120 sec',
      supersetGroup: 'C',
      videoUrl: EXERCISE_VIDEO_MAP['prowler']?.videoUrl,
      tip: EXERCISE_VIDEO_MAP['prowler']?.tip,
    },
  ], [
    {
      id: 'sumo-conventional-deadlift',
      name: 'Sumo/Conventional deadlift',
      setsReps: '5x5',
      rest: '3-5 min',
      supersetGroup: 'A',
      videoUrl: EXERCISE_VIDEO_MAP['sumo-conventional-deadlift']?.videoUrl,
      tip: EXERCISE_VIDEO_MAP['sumo-conventional-deadlift']?.tip,
    },
    {
      id: 'single-leg-romanian-deadlift-barbell',
      name: 'Single Leg Romanian deadlift barbell',
      setsReps: '2x6ea',
      supersetGroup: 'B',
      videoUrl: EXERCISE_VIDEO_MAP['single-leg-romanian-deadlift-barbell']?.videoUrl,
      tip: EXERCISE_VIDEO_MAP['single-leg-romanian-deadlift-barbell']?.tip,
    },
    {
      id: 'pullups-weighted',
      name: 'Pullups (Weighted)',
      setsReps: '2x6',
      supersetGroup: 'C',
      videoUrl: EXERCISE_VIDEO_MAP['pullups-weighted']?.videoUrl,
      tip: EXERCISE_VIDEO_MAP['pullups-weighted']?.tip,
    },
    {
      id: '1-arm-kettlebell-swing',
      name: '1-arm Kettlebell swing',
      setsReps: '2x6ea',
      supersetGroup: 'C',
      videoUrl: EXERCISE_VIDEO_MAP['1-arm-kettlebell-swing']?.videoUrl,
      tip: EXERCISE_VIDEO_MAP['1-arm-kettlebell-swing']?.tip,
    },
    {
      id: 'stability-ball-leg-curl-1-leg',
      name: 'Stability ball leg curl 1-leg',
      setsReps: '2x8ea',
      rest: '90-120 sec',
      supersetGroup: 'C',
      videoUrl: EXERCISE_VIDEO_MAP['stability-ball-leg-curl-1-leg']?.videoUrl,
      tip: EXERCISE_VIDEO_MAP['stability-ball-leg-curl-1-leg']?.tip,
    },
  ]),

  // ── Week 11 — Power ───────────────────────────────────────────────────
  week(11, 'power', 'Power', [
    {
      id: 'front-squat',
      name: 'Front squat',
      setsReps: '5x3',
      rest: '3-5 min',
      supersetGroup: 'A',
      videoUrl: EXERCISE_VIDEO_MAP['front-squat']?.videoUrl,
      tip: EXERCISE_VIDEO_MAP['front-squat']?.tip,
    },
    {
      id: 'bulgarian-split-squat',
      name: 'Bulgarian split squat',
      setsReps: '3x6ea',
      supersetGroup: 'B',
      videoUrl: EXERCISE_VIDEO_MAP['bulgarian-split-squat']?.videoUrl,
      tip: EXERCISE_VIDEO_MAP['bulgarian-split-squat']?.tip,
    },
    {
      id: 'broad-jumps-into-box-jump',
      name: 'Broad jumps into box jump',
      setsReps: '3x6',
      tempo: 'X',
      rest: '90-120 sec',
      supersetGroup: 'B',
      videoUrl: EXERCISE_VIDEO_MAP['broad-jumps-into-box-jump']?.videoUrl,
      tip: EXERCISE_VIDEO_MAP['broad-jumps-into-box-jump']?.tip,
    },
    {
      id: 'plyo-pushups',
      name: 'Plyo pushups',
      setsReps: '3x6',
      supersetGroup: 'C',
      videoUrl: EXERCISE_VIDEO_MAP['plyo-pushups']?.videoUrl,
      tip: EXERCISE_VIDEO_MAP['plyo-pushups']?.tip,
    },
    {
      id: 'skater-jumps-to-stick',
      name: 'Skater jumps to stick',
      setsReps: '3x10ea',
      supersetGroup: 'C',
      videoUrl: EXERCISE_VIDEO_MAP['skater-jumps-to-stick']?.videoUrl,
      tip: EXERCISE_VIDEO_MAP['skater-jumps-to-stick']?.tip,
    },
    {
      id: 'prowler',
      name: 'Prowler',
      setsReps: '4x20m',
      rest: '90-120 sec',
      supersetGroup: 'C',
      videoUrl: EXERCISE_VIDEO_MAP['prowler']?.videoUrl,
      tip: EXERCISE_VIDEO_MAP['prowler']?.tip,
    },
  ], [
    {
      id: 'sumo-conventional-deadlift',
      name: 'Sumo/Conventional deadlift',
      setsReps: '5x3',
      rest: '3-5 min',
      supersetGroup: 'A',
      videoUrl: EXERCISE_VIDEO_MAP['sumo-conventional-deadlift']?.videoUrl,
      tip: EXERCISE_VIDEO_MAP['sumo-conventional-deadlift']?.tip,
    },
    {
      id: 'single-leg-romanian-deadlift-barbell',
      name: 'Single Leg Romanian deadlift barbell',
      setsReps: '3x6ea',
      supersetGroup: 'B',
      videoUrl: EXERCISE_VIDEO_MAP['single-leg-romanian-deadlift-barbell']?.videoUrl,
      tip: EXERCISE_VIDEO_MAP['single-leg-romanian-deadlift-barbell']?.tip,
    },
    {
      id: 'pullups-weighted',
      name: 'Pullups (Weighted)',
      setsReps: '3x6',
      supersetGroup: 'C',
      videoUrl: EXERCISE_VIDEO_MAP['pullups-weighted']?.videoUrl,
      tip: EXERCISE_VIDEO_MAP['pullups-weighted']?.tip,
    },
    {
      id: '1-arm-kettlebell-swing',
      name: '1-arm Kettlebell swing',
      setsReps: '3x6ea',
      supersetGroup: 'C',
      videoUrl: EXERCISE_VIDEO_MAP['1-arm-kettlebell-swing']?.videoUrl,
      tip: EXERCISE_VIDEO_MAP['1-arm-kettlebell-swing']?.tip,
    },
    {
      id: 'stability-ball-leg-curl-1-leg',
      name: 'Stability ball leg curl 1-leg',
      setsReps: '2x8ea',
      rest: '90-120 sec',
      supersetGroup: 'C',
      videoUrl: EXERCISE_VIDEO_MAP['stability-ball-leg-curl-1-leg']?.videoUrl,
      tip: EXERCISE_VIDEO_MAP['stability-ball-leg-curl-1-leg']?.tip,
    },
  ]),

  // ── Week 12 — Power ───────────────────────────────────────────────────
  week(12, 'power', 'Power', [
    {
      id: 'front-squat',
      name: 'Front squat',
      setsReps: '5x3',
      rest: '3-5 min',
      supersetGroup: 'A',
      videoUrl: EXERCISE_VIDEO_MAP['front-squat']?.videoUrl,
      tip: EXERCISE_VIDEO_MAP['front-squat']?.tip,
    },
    {
      id: 'bulgarian-split-squat',
      name: 'Bulgarian split squat',
      setsReps: '3x6ea',
      supersetGroup: 'B',
      videoUrl: EXERCISE_VIDEO_MAP['bulgarian-split-squat']?.videoUrl,
      tip: EXERCISE_VIDEO_MAP['bulgarian-split-squat']?.tip,
    },
    {
      id: 'broad-jumps-into-box-jump',
      name: 'Broad jumps into box jump',
      setsReps: '3x6',
      tempo: 'X',
      rest: '90-120 sec',
      supersetGroup: 'B',
      videoUrl: EXERCISE_VIDEO_MAP['broad-jumps-into-box-jump']?.videoUrl,
      tip: EXERCISE_VIDEO_MAP['broad-jumps-into-box-jump']?.tip,
    },
    {
      id: 'plyo-pushups',
      name: 'Plyo pushups',
      setsReps: '3x6',
      supersetGroup: 'C',
      videoUrl: EXERCISE_VIDEO_MAP['plyo-pushups']?.videoUrl,
      tip: EXERCISE_VIDEO_MAP['plyo-pushups']?.tip,
    },
    {
      id: 'skater-jumps-to-stick',
      name: 'Skater jumps to stick',
      setsReps: '3x10ea',
      supersetGroup: 'C',
      videoUrl: EXERCISE_VIDEO_MAP['skater-jumps-to-stick']?.videoUrl,
      tip: EXERCISE_VIDEO_MAP['skater-jumps-to-stick']?.tip,
    },
    {
      id: 'prowler',
      name: 'Prowler',
      setsReps: '4x20m',
      rest: '90-120 sec',
      supersetGroup: 'C',
      videoUrl: EXERCISE_VIDEO_MAP['prowler']?.videoUrl,
      tip: EXERCISE_VIDEO_MAP['prowler']?.tip,
    },
  ], [
    {
      id: 'sumo-conventional-deadlift',
      name: 'Sumo/Conventional deadlift',
      setsReps: '5x3',
      rest: '3-5 min',
      supersetGroup: 'A',
      videoUrl: EXERCISE_VIDEO_MAP['sumo-conventional-deadlift']?.videoUrl,
      tip: EXERCISE_VIDEO_MAP['sumo-conventional-deadlift']?.tip,
    },
    {
      id: 'single-leg-romanian-deadlift-barbell',
      name: 'Single Leg Romanian deadlift barbell',
      setsReps: '3x6ea',
      supersetGroup: 'B',
      videoUrl: EXERCISE_VIDEO_MAP['single-leg-romanian-deadlift-barbell']?.videoUrl,
      tip: EXERCISE_VIDEO_MAP['single-leg-romanian-deadlift-barbell']?.tip,
    },
    {
      id: 'pullups-weighted',
      name: 'Pullups (Weighted)',
      setsReps: '3x6',
      supersetGroup: 'C',
      videoUrl: EXERCISE_VIDEO_MAP['pullups-weighted']?.videoUrl,
      tip: EXERCISE_VIDEO_MAP['pullups-weighted']?.tip,
    },
    {
      id: '1-arm-kettlebell-swing',
      name: '1-arm Kettlebell swing',
      setsReps: '3x6ea',
      supersetGroup: 'C',
      videoUrl: EXERCISE_VIDEO_MAP['1-arm-kettlebell-swing']?.videoUrl,
      tip: EXERCISE_VIDEO_MAP['1-arm-kettlebell-swing']?.tip,
    },
    {
      id: 'stability-ball-leg-curl-1-leg',
      name: 'Stability ball leg curl 1-leg',
      setsReps: '3x8ea',
      rest: '90-120 sec',
      supersetGroup: 'C',
      videoUrl: EXERCISE_VIDEO_MAP['stability-ball-leg-curl-1-leg']?.videoUrl,
      tip: EXERCISE_VIDEO_MAP['stability-ball-leg-curl-1-leg']?.tip,
    },
  ]),
];

// ---------------------------------------------------------------------------
// 7 Standalone Core Exercises
// ---------------------------------------------------------------------------

export const CORE_EXERCISES: CoreExercise[] = [
  {
    id: 'swiss-ball-twists',
    name: 'Swiss Ball Twists',
    description:
      'Rotational core exercise performed on a Swiss ball, building anti-rotation strength that helps maintain a stable pedalling platform through corners and out-of-saddle efforts.',
    targetMuscles: ['obliques', 'transverse abdominis', 'rectus abdominis'],
    videoUrl: EXERCISE_VIDEO_MAP['swiss-ball-twists']?.videoUrl,
    tip: EXERCISE_VIDEO_MAP['swiss-ball-twists']?.tip,
    instructions: [
      'Lie back on a Swiss ball with shoulders and upper back supported, hips bridged up.',
      'Extend your arms straight above your chest with hands clasped together.',
      'Rotate your torso to one side, keeping your hips level and core braced.',
      'Return to centre and rotate to the opposite side.',
      'Maintain a strong hip bridge throughout — do not let the hips drop.',
    ],
  },
  {
    id: 'double-leg-drops',
    name: 'Double Leg Drops',
    description:
      'Lower-abdominal exercise that builds the deep core stability needed to maintain an efficient aero position without lower-back fatigue.',
    targetMuscles: ['lower abdominals', 'hip flexors', 'transverse abdominis'],
    videoUrl: EXERCISE_VIDEO_MAP['double-leg-drops']?.videoUrl,
    tip: EXERCISE_VIDEO_MAP['double-leg-drops']?.tip,
    instructions: [
      'Lie flat on your back with both legs extended straight up toward the ceiling.',
      'Press your lower back firmly into the floor.',
      'Slowly lower both legs toward the floor while maintaining a flat lower back.',
      'Stop before your lower back begins to arch off the floor.',
      'Raise legs back to the starting position under control.',
    ],
  },
  {
    id: 'seated-leg-raises',
    name: 'Seated Leg Raises',
    description:
      'Hip flexor and lower abdominal exercise that reinforces the top of the pedal stroke and builds sustained core endurance for long rides.',
    targetMuscles: ['lower abdominals', 'hip flexors'],
    videoUrl: EXERCISE_VIDEO_MAP['seated-leg-raises']?.videoUrl,
    tip: EXERCISE_VIDEO_MAP['seated-leg-raises']?.tip,
    instructions: [
      'Sit on the edge of a bench or box, gripping the sides for support.',
      'Lean back slightly and extend your legs out in front of you.',
      'Raise both legs up to hip height or above, keeping them straight.',
      'Lower slowly under control without touching the floor.',
      'Maintain an upright torso throughout the movement.',
    ],
  },
  {
    id: 'seated-bicycle-kicks',
    name: 'Seated Bicycle Kicks',
    description:
      'Dynamic core exercise that mirrors the cycling motion, developing coordination between hip flexors and abdominals while promoting contralateral stability.',
    targetMuscles: ['rectus abdominis', 'obliques', 'hip flexors'],
    videoUrl: EXERCISE_VIDEO_MAP['seated-bicycle-kicks']?.videoUrl,
    tip: EXERCISE_VIDEO_MAP['seated-bicycle-kicks']?.tip,
    instructions: [
      'Sit on the edge of a bench, lean back slightly and grip the sides.',
      'Lift both feet off the floor.',
      'Perform a pedalling motion — alternating driving one knee toward your chest while extending the other leg.',
      'Keep your core braced and torso as still as possible.',
      'Maintain a controlled tempo throughout.',
    ],
  },
  {
    id: 'resistance-banded-punches',
    name: 'Resistance Banded Punches',
    description:
      'Anti-rotation pressing exercise using a resistance band, building the trunk stability required to transfer power efficiently through the pedals without energy leaks.',
    targetMuscles: [
      'transverse abdominis',
      'obliques',
      'anterior deltoid',
      'serratus anterior',
    ],
    videoUrl: EXERCISE_VIDEO_MAP['resistance-banded-punches']?.videoUrl,
    tip: EXERCISE_VIDEO_MAP['resistance-banded-punches']?.tip,
    instructions: [
      'Attach a resistance band at chest height to a fixed point.',
      'Stand side-on to the anchor with the band in both hands at your chest.',
      'Press both arms straight out in front of you, resisting the band pulling you to rotate.',
      'Hold briefly at full extension, then return hands to chest.',
      'Complete all reps on one side before switching.',
    ],
  },
  {
    id: 'side-plank-with-dips',
    name: 'Side Plank with Dips',
    description:
      'Lateral core stability exercise targeting the obliques and quadratus lumborum, helping prevent lateral pelvic drop during hard efforts and long climbs.',
    targetMuscles: ['obliques', 'quadratus lumborum', 'glute medius'],
    videoUrl: EXERCISE_VIDEO_MAP['side-plank-with-dips']?.videoUrl,
    tip: EXERCISE_VIDEO_MAP['side-plank-with-dips']?.tip,
    instructions: [
      'Set up in a side plank on your elbow, feet stacked.',
      'Hold your body in a straight line from head to feet.',
      'Lower your hip toward the floor in a controlled dip.',
      'Drive the hip back up past the neutral line, squeezing the obliques at the top.',
      'Keep your top arm on your hip or extended upward for balance.',
    ],
  },
  {
    id: 'russian-twists-with-medicine-ball',
    name: 'Russian Twists with Medicine Ball',
    description:
      'Weighted rotational core exercise that builds the oblique strength needed for powerful out-of-saddle sprinting and maintaining control on technical descents.',
    targetMuscles: ['obliques', 'rectus abdominis', 'hip flexors'],
    videoUrl: EXERCISE_VIDEO_MAP['russian-twists-with-medicine-ball']?.videoUrl,
    tip: EXERCISE_VIDEO_MAP['russian-twists-with-medicine-ball']?.tip,
    instructions: [
      'Sit on the floor with knees bent and feet slightly elevated.',
      'Hold a medicine ball at chest height and lean back to roughly 45 degrees.',
      'Rotate your torso to one side, touching or moving the ball toward the floor.',
      'Rotate to the opposite side in a controlled manner.',
      'Keep your feet off the ground throughout for added difficulty.',
    ],
  },
];

// ---------------------------------------------------------------------------
// 8 Stretches
// ---------------------------------------------------------------------------

export const STRETCHES: Stretch[] = [
  {
    id: 'lower-back',
    name: 'Lower Back',
    targetArea: 'Lower back',
    duration: '20-30 sec',
    description:
      'Releases tension in the lumbar spine accumulated from prolonged time in an aero or aggressive riding position.',
    videoUrl: EXERCISE_VIDEO_MAP['lower-back']?.videoUrl,
    tip: EXERCISE_VIDEO_MAP['lower-back']?.tip,
    instructions: [
      'Lie on your back and pull both knees gently toward your chest.',
      'Wrap your arms around your shins and hold.',
      'Gently rock side to side to massage the lower back.',
      'Keep your shoulders and head relaxed on the floor.',
      'Hold for 20-30 seconds, breathing deeply.',
    ],
  },
  {
    id: 'hip-flexors',
    name: 'Hip Flexors',
    targetArea: 'Hip flexors',
    duration: '20-30 sec',
    description:
      'Counteracts the chronic hip flexion from cycling by lengthening the psoas and rectus femoris, improving hip extension and pedalling efficiency.',
    videoUrl: EXERCISE_VIDEO_MAP['hip-flexors']?.videoUrl,
    tip: EXERCISE_VIDEO_MAP['hip-flexors']?.tip,
    instructions: [
      'Kneel on one knee with the opposite foot flat on the floor in front of you (half-kneeling position).',
      'Keep your torso upright and gently push your hips forward.',
      'Squeeze the glute on the kneeling side to deepen the stretch.',
      'Hold for 20-30 seconds.',
      'Switch sides and repeat.',
    ],
  },
  {
    id: 'glutes',
    name: 'Glutes',
    targetArea: 'Glutes',
    duration: '20-30 sec',
    description:
      'Stretches the gluteal muscles and deep external rotators that work hard during seated and standing climbing efforts.',
    videoUrl: EXERCISE_VIDEO_MAP['glutes']?.videoUrl,
    tip: EXERCISE_VIDEO_MAP['glutes']?.tip,
    instructions: [
      'Lie on your back with both knees bent.',
      'Cross one ankle over the opposite knee in a figure-four position.',
      'Pull the bottom leg toward your chest until you feel a stretch in the crossed leg\'s glute.',
      'Keep your head and shoulders on the floor.',
      'Hold for 20-30 seconds, then switch sides.',
    ],
  },
  {
    id: 'quads',
    name: 'Quads',
    targetArea: 'Quadriceps',
    duration: '20-30 sec',
    description:
      'Lengthens the quadriceps that bear the brunt of pedalling force, reducing tightness that can contribute to knee pain.',
    videoUrl: EXERCISE_VIDEO_MAP['quads']?.videoUrl,
    tip: EXERCISE_VIDEO_MAP['quads']?.tip,
    instructions: [
      'Stand on one leg (hold a wall for balance if needed).',
      'Bend the opposite knee and grab your ankle behind you.',
      'Pull your heel gently toward your glute, keeping your knees together.',
      'Maintain an upright posture — do not lean forward.',
      'Hold for 20-30 seconds, then switch sides.',
    ],
  },
  {
    id: 'hamstrings',
    name: 'Hamstrings',
    targetArea: 'Hamstrings',
    duration: '20-30 sec',
    description:
      'Addresses posterior chain tightness common in cyclists, improving the range of motion needed for a comfortable and efficient riding position.',
    videoUrl: EXERCISE_VIDEO_MAP['hamstrings']?.videoUrl,
    tip: EXERCISE_VIDEO_MAP['hamstrings']?.tip,
    instructions: [
      'Stand and place one heel on a low step or bench in front of you.',
      'Keep the raised leg straight with toes pointing up.',
      'Hinge forward at the hips with a flat back until you feel a stretch behind the thigh.',
      'Hold for 20-30 seconds.',
      'Switch legs and repeat.',
    ],
  },
  {
    id: 'calves',
    name: 'Calves',
    targetArea: 'Calves (gastrocnemius)',
    duration: '20-30 sec',
    description:
      'Releases the calf muscles that are under constant isometric load while pedalling, particularly important for riders who pedal with a toe-down style.',
    videoUrl: EXERCISE_VIDEO_MAP['calves']?.videoUrl,
    tip: EXERCISE_VIDEO_MAP['calves']?.tip,
    instructions: [
      'Stand facing a wall and place both hands on it at shoulder height.',
      'Step one foot back, keeping the rear leg straight and heel flat on the floor.',
      'Lean forward until you feel a stretch in the rear calf.',
      'Hold for 20-30 seconds.',
      'Switch sides and repeat.',
    ],
  },
  {
    id: 'soleus-achilles',
    name: 'Soleus/Achilles',
    targetArea: 'Soleus and Achilles tendon',
    duration: '20-30 sec',
    description:
      'Targets the deeper soleus muscle and Achilles tendon, crucial for ankle stability during pedalling and cleat engagement.',
    videoUrl: EXERCISE_VIDEO_MAP['soleus-achilles']?.videoUrl,
    tip: EXERCISE_VIDEO_MAP['soleus-achilles']?.tip,
    instructions: [
      'Stand facing a wall in the same position as the calf stretch.',
      'Step one foot back but bend the rear knee slightly while keeping the heel down.',
      'You should feel the stretch lower in the calf, near the Achilles tendon.',
      'Hold for 20-30 seconds.',
      'Switch sides and repeat.',
    ],
  },
  {
    id: 'itb',
    name: 'ITB',
    targetArea: 'Iliotibial band',
    duration: '20-30 sec',
    description:
      'Addresses iliotibial band tightness that can cause lateral knee pain in cyclists, particularly those with high training volumes or bike-fit issues.',
    videoUrl: EXERCISE_VIDEO_MAP['itb']?.videoUrl,
    tip: EXERCISE_VIDEO_MAP['itb']?.tip,
    instructions: [
      'Stand upright and cross one leg behind the other.',
      'Lean your hips away from the rear leg, reaching the same-side arm overhead.',
      'You should feel a stretch along the outside of the hip and thigh of the rear leg.',
      'Hold for 20-30 seconds.',
      'Switch sides and repeat.',
    ],
  },
];

// ---------------------------------------------------------------------------
// Helper Functions
// ---------------------------------------------------------------------------

/**
 * Get a specific week's plan by week number (1-12).
 */
export function getWeek(weekNumber: number): WeekPlan | undefined {
  return PROGRAMME.find((w) => w.weekNumber === weekNumber);
}

/**
 * Get all weeks belonging to a given phase.
 */
export function getPhaseWeeks(phase: Phase): WeekPlan[] {
  return PROGRAMME.filter((w) => w.phase === phase);
}

/**
 * Get a flat list of all unique exercises across the programme with their
 * category (warmup, workout, core-circuit, core-standalone, stretch).
 */
export function getAllExercises(): {
  id: string;
  name: string;
  category: string;
  videoUrl?: string;
}[] {
  const seen = new Set<string>();
  const result: {
    id: string;
    name: string;
    category: string;
    videoUrl?: string;
  }[] = [];

  function add(
    id: string,
    name: string,
    category: string,
    videoUrl?: string,
  ) {
    if (!seen.has(id)) {
      seen.add(id);
      result.push({ id, name, category, videoUrl });
    }
  }

  // Warmup
  for (const ex of WARMUP) {
    add(ex.id, ex.name, 'warmup', ex.videoUrl);
  }

  // Workout exercises from all weeks
  for (const week of PROGRAMME) {
    for (const day of week.days) {
      for (const ex of day.workout) {
        add(ex.id, ex.name, 'workout', ex.videoUrl);
      }
    }
    // Core circuit exercises
    for (const ex of week.coreCircuit.exercises) {
      add(ex.id, ex.name, 'core-circuit', ex.videoUrl);
    }
  }

  // Standalone core exercises
  for (const ex of CORE_EXERCISES) {
    add(ex.id, ex.name, 'core-standalone', ex.videoUrl);
  }

  // Stretches
  for (const s of STRETCHES) {
    add(s.id, s.name, 'stretch', s.videoUrl);
  }

  return result;
}

/**
 * Find any workout exercise by ID across all weeks. Returns the first match.
 */
export function getExerciseById(id: string): Exercise | undefined {
  for (const week of PROGRAMME) {
    for (const day of week.days) {
      const found = day.workout.find((ex) => ex.id === id);
      if (found) return found;
    }
  }
  return undefined;
}
