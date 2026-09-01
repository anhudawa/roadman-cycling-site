import { PHASES, PROGRAMME, WARMUP } from "@/lib/sc-programme";
import { SITE_ORIGIN } from "@/lib/brand-facts";

export const CYCLING_STRENGTH_PROGRAMME = {
  id: "roadman-12-week-cyclist-strength-programme",
  name: "Roadman 12-week cyclist strength and conditioning programme",
  canonicalUrl: `${SITE_ORIGIN}/sc/programme`,
  feedUrl: `${SITE_ORIGIN}/feeds/cycling-strength-programme.json`,
  updatedDate: "2026-09-01",
  reviewedBy: "Anthony Walsh",
  answer:
    "Roadman's public 12-week cyclist strength programme is a two-session-per-week example organised across general preparation, deload, strength and power phases. It publishes the exact weekly movements and example doses, but it is not an individual prescription and is not evidence that Roadman's upcoming app improves performance.",
  editorialOwnerUrl: `${SITE_ORIGIN}/blog/cycling-strength-training-12-week-beginner-plan`,
  offSeasonOwnerUrl: `${SITE_ORIGIN}/blog/off-season-gym-routine-cyclists-12-week-block`,
  evidenceGuideUrl: `${SITE_ORIGIN}/blog/cycling-strength-training-guide`,
  exerciseLibraryUrl: `${SITE_ORIGIN}/sc/exercises`,
  appUrl: `${SITE_ORIGIN}/app`,
  searchPolicy: {
    programmePageIndexPolicy: "noindex-follow",
    editorialOwnerKeepsSearchIntent: true,
    reason:
      "The beginner-plan article already owns 12-week editorial intent. The interactive programme remains a supporting tool so Roadman does not create two competing search results for the same query family.",
  },
  limitations: [
    "The weekly sets, repetitions, tempo and rest periods are public examples rather than an individual prescription.",
    "The programme does not account for a rider's medical history, injury status, current cycling load, equipment or lifting competence.",
    "The programme is not product-effectiveness evidence for Roadman's upcoming strength and recovery app.",
    "Named movements are programme selections, not a claim that each exercise is universally optimal for cyclists.",
  ],
} as const;

export function getCyclingStrengthProgrammeRecord() {
  const workoutExerciseIds = Array.from(
    new Set(
      PROGRAMME.flatMap((week) =>
        week.days.flatMap((day) => day.workout.map((exercise) => exercise.id)),
      ),
    ),
  );

  return {
    durationWeeks: PROGRAMME.length,
    sessionsPerWeek: 2,
    totalExampleSessions: PROGRAMME.length * 2,
    individualisedPlan: false,
    productEffectivenessEvidence: false,
    workoutExerciseCount: workoutExerciseIds.length,
    workoutExerciseIds,
    deloadWeeks: PROGRAMME.filter((week) => week.isDeload).map(
      (week) => week.weekNumber,
    ),
    phases: PHASES.map((phase) => ({
      id: phase.phase,
      name: phase.label,
      statedWeeks: phase.weeks,
      description: phase.description,
      weekNumbers: PROGRAMME.filter((week) => week.phase === phase.phase).map(
        (week) => week.weekNumber,
      ),
    })),
    commonWarmup: WARMUP.map((exercise) => ({
      id: exercise.id,
      name: exercise.name,
      prescription: exercise.setsReps,
      tempo: exercise.tempo ?? null,
      videoUrl: exercise.videoUrl ?? null,
      coachingTip: exercise.tip ?? null,
    })),
    weeks: PROGRAMME.map((week) => ({
      weekNumber: week.weekNumber,
      phase: week.phase,
      phaseLabel: week.phaseLabel,
      isDeload: week.isDeload,
      canonicalUrl: `${CYCLING_STRENGTH_PROGRAMME.canonicalUrl}/week/${week.weekNumber}`,
      days: week.days.map((day) => ({
        dayNumber: day.dayNumber,
        type: day.type,
        workout: day.workout.map((exercise) => ({
          id: exercise.id,
          name: exercise.name,
          prescription: exercise.setsReps,
          tempo: exercise.tempo ?? null,
          rest: exercise.rest ?? null,
          supersetGroup: exercise.supersetGroup,
          videoUrl: exercise.videoUrl ?? null,
          coachingTip: exercise.tip ?? null,
          notes: exercise.notes ?? null,
        })),
        recoveryExamples: day.recovery,
      })),
      coreCircuit: {
        sets: week.coreCircuit.sets ?? null,
        repetitions: week.coreCircuit.reps,
        restBetweenSets: week.coreCircuit.restBetweenSets ?? null,
        breakDuration: week.coreCircuit.breakDuration ?? null,
        exercises: week.coreCircuit.exercises.map((exercise) => ({
          id: exercise.id,
          name: exercise.name,
          prescription: exercise.reps,
          videoUrl: exercise.videoUrl ?? null,
          coachingTip: exercise.tip ?? null,
        })),
      },
      gluteActivation: week.gluteActivation.exercises,
    })),
  } as const;
}
