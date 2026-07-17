'use client';

import { useState, useCallback, useMemo } from 'react';
import type { Exercise, WarmupExercise, CoreCircuitExercise } from '@/lib/sc-programme';
import { EXERCISE_VIDEO_MAP, FOAM_ROLLER_VIDEO } from '@/lib/sc-programme';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface DayData {
  dayNumber: 1 | 2;
  type: 'Push' | 'Pull';
  warmup: WarmupExercise[];
  workout: Exercise[];
  recovery: string[];
}

interface CoreCircuitData {
  reps: number;
  sets?: number;
  restBetweenSets?: string;
  breakDuration?: string;
  exercises: CoreCircuitExercise[];
}

interface GluteActivationData {
  exercises: { name: string; setsReps: string }[];
}

interface WorkoutTrackerProps {
  weekNumber: number;
  phaseLabel: string;
  days: [DayData, DayData];
  coreCircuit: CoreCircuitData;
  gluteActivation: GluteActivationData;
  prevWeek: number | null;
  nextWeek: number | null;
  phaseBg: string;
  phaseTag: string;
  isDeload: boolean;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function parseSetsFromString(setsReps: string): number {
  const match = setsReps.match(/^(\d+)x/);
  return match ? parseInt(match[1], 10) : 1;
}

const SUPERSET_COLOURS: Record<string, { border: string; label: string; bg: string }> = {
  A: { border: 'border-l-[#F16363]', label: 'text-[#F16363]', bg: 'bg-[#F16363]' },
  B: { border: 'border-l-[#4C1273]', label: 'text-[#9B59B6]', bg: 'bg-[#4C1273]' },
  C: { border: 'border-l-[#4AAE8C]', label: 'text-[#4AAE8C]', bg: 'bg-[#4AAE8C]' },
};

function groupBySupersets(exercises: Exercise[]) {
  const groups: { group: string; exercises: Exercise[] }[] = [];
  const map = new Map<string, Exercise[]>();
  for (const ex of exercises) {
    if (!map.has(ex.supersetGroup)) {
      const arr: Exercise[] = [];
      map.set(ex.supersetGroup, arr);
      groups.push({ group: ex.supersetGroup, exercises: arr });
    }
    map.get(ex.supersetGroup)!.push(ex);
  }
  return groups;
}

/* ------------------------------------------------------------------ */
/*  Video Embed                                                        */
/* ------------------------------------------------------------------ */

function VideoEmbed({ url, title }: { url: string; title: string }) {
  return (
    <div className="mt-3 relative w-full overflow-hidden rounded-lg" style={{ paddingBottom: '56.25%' }}>
      <iframe
        src={url}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="absolute inset-0 w-full h-full border-0"
        loading="lazy"
      />
    </div>
  );
}

function VideoPlaceholder() {
  return (
    <div className="mt-3 flex items-center justify-center gap-2 rounded-lg bg-[#1a1a1c]/60 border border-white/5 py-8">
      <svg className="w-5 h-5 text-[#B0B0B5]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 010 1.972l-11.54 6.347a1.125 1.125 0 01-1.667-.986V5.653z" />
      </svg>
      <span className="text-[#B0B0B5] text-xs font-[family-name:var(--font-heading)] tracking-wider">
        VIDEO COMING SOON
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Set Indicator                                                      */
/* ------------------------------------------------------------------ */

function SetIndicators({
  exerciseKey,
  totalSets,
  completedSets,
  onToggle,
}: {
  exerciseKey: string;
  totalSets: number;
  completedSets: Set<number>;
  onToggle: (key: string, setIndex: number) => void;
}) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: totalSets }, (_, i) => {
        const done = completedSets.has(i);
        return (
          <button
            key={i}
            onClick={() => onToggle(exerciseKey, i)}
            className={`w-7 h-7 rounded-full border-2 transition-all duration-200 flex items-center justify-center text-xs font-bold ${
              done
                ? 'bg-[#F16363] border-[#F16363] text-white scale-110'
                : 'border-white/20 text-white/40 hover:border-[#F16363]/50 hover:text-white/60'
            }`}
            aria-label={`Set ${i + 1} ${done ? 'completed' : 'incomplete'}`}
          >
            {done ? (
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            ) : (
              i + 1
            )}
          </button>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Progress Bar                                                       */
/* ------------------------------------------------------------------ */

function ProgressBar({ completed, total, label }: { completed: number; total: number; label: string }) {
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs text-[#B0B0B5] font-[family-name:var(--font-heading)] tracking-wider">{label}</span>
        <span className="text-xs text-[#B0B0B5]">
          {completed}/{total} sets &middot; {pct}%
        </span>
      </div>
      <div className="h-2 bg-[#1a1a1c] rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-[#F16363] to-[#E84E4E] rounded-full transition-all duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tip Callout                                                        */
/* ------------------------------------------------------------------ */

function TipCallout({ tip }: { tip: string }) {
  return (
    <div className="mt-3 flex items-start gap-2.5 rounded-lg bg-[#F16363]/8 border border-[#F16363]/20 px-3.5 py-2.5">
      <svg className="w-4 h-4 text-[#F16363] mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
      </svg>
      <p className="text-xs text-[#FAFAFA]/80 leading-relaxed">{tip}</p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

export default function WorkoutTracker({
  weekNumber,
  phaseLabel,
  days,
  coreCircuit,
  gluteActivation,
  prevWeek,
  nextWeek,
  phaseBg,
  phaseTag,
  isDeload,
}: WorkoutTrackerProps) {
  // Completion state: { "day1-goblet-squats": Set<number>, ... }
  const [completed, setCompleted] = useState<Record<string, Set<number>>>({});

  const toggleSet = useCallback((exerciseKey: string, setIndex: number) => {
    setCompleted((prev) => {
      const current = new Set(prev[exerciseKey] ?? []);
      if (current.has(setIndex)) {
        current.delete(setIndex);
      } else {
        current.add(setIndex);
      }
      return { ...prev, [exerciseKey]: current };
    });
  }, []);

  const markAllComplete = useCallback((dayNumber: number, exercises: Exercise[]) => {
    setCompleted((prev) => {
      const next = { ...prev };
      for (const ex of exercises) {
        const key = `day${dayNumber}-${ex.id}`;
        const totalSets = parseSetsFromString(ex.setsReps);
        next[key] = new Set(Array.from({ length: totalSets }, (_, i) => i));
      }
      return next;
    });
  }, []);

  const clearDay = useCallback((dayNumber: number, exercises: Exercise[]) => {
    setCompleted((prev) => {
      const next = { ...prev };
      for (const ex of exercises) {
        const key = `day${dayNumber}-${ex.id}`;
        delete next[key];
      }
      return next;
    });
  }, []);

  // Compute progress per day
  const dayProgress = useMemo(() => {
    return days.map((day) => {
      let totalSets = 0;
      let completedSets = 0;
      for (const ex of day.workout) {
        const key = `day${day.dayNumber}-${ex.id}`;
        const sets = parseSetsFromString(ex.setsReps);
        totalSets += sets;
        completedSets += (completed[key]?.size ?? 0);
      }
      return { totalSets, completedSets };
    });
  }, [days, completed]);

  const totalSetsAll = dayProgress.reduce((sum, d) => sum + d.totalSets, 0);
  const completedSetsAll = dayProgress.reduce((sum, d) => sum + d.completedSets, 0);

  // Video expand state
  const [expandedVideos, setExpandedVideos] = useState<Set<string>>(new Set());
  const toggleVideo = useCallback((key: string) => {
    setExpandedVideos((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  return (
    <div className="bg-[#210140] min-h-screen font-[family-name:var(--font-body)]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* ── Header ──────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <h1
              className="font-[family-name:var(--font-heading)] text-[#FAFAFA] leading-none text-4xl sm:text-5xl"
            >
              WEEK {weekNumber}
            </h1>
            <span className={`${phaseBg} text-[#FAFAFA] font-[family-name:var(--font-heading)] text-xs tracking-wider px-4 py-1.5 rounded-full`}>
              {phaseTag}
            </span>
            {isDeload && (
              <span className="bg-[#545559] text-[#FAFAFA] font-[family-name:var(--font-heading)] text-xs tracking-wider px-4 py-1.5 rounded-full">
                DELOAD
              </span>
            )}
          </div>

          {/* Week nav */}
          <div className="flex items-center gap-3">
            {prevWeek ? (
              <a
                href={`/sc/programme/week/${prevWeek}`}
                className="inline-flex items-center gap-1 font-[family-name:var(--font-heading)] text-sm text-[#B0B0B5] hover:text-[#FAFAFA] transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                </svg>
                WEEK {prevWeek}
              </a>
            ) : <span />}
            <a
              href="/sc/programme"
              className="font-[family-name:var(--font-heading)] text-sm text-[#B0B0B5] hover:text-[#FAFAFA] transition-colors px-3"
            >
              ALL WEEKS
            </a>
            {nextWeek ? (
              <a
                href={`/sc/programme/week/${nextWeek}`}
                className="inline-flex items-center gap-1 font-[family-name:var(--font-heading)] text-sm text-[#B0B0B5] hover:text-[#FAFAFA] transition-colors"
              >
                WEEK {nextWeek}
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </a>
            ) : <span />}
          </div>
        </div>

        <p className="mt-2 text-[#B0B0B5]">
          {phaseLabel} &middot; 2 sessions this week
        </p>

        {/* ── Overall Progress ──────────────────────────────────────── */}
        <div className="mt-6 rounded-xl bg-[#2E2E30]/80 border border-white/10 p-5">
          <ProgressBar completed={completedSetsAll} total={totalSetsAll} label="WEEK PROGRESS" />
          {completedSetsAll === totalSetsAll && totalSetsAll > 0 && (
            <div className="mt-3 text-center">
              <span className="inline-flex items-center gap-2 text-[#4AAE8C] font-[family-name:var(--font-heading)] text-sm tracking-wider">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                WEEK COMPLETE
              </span>
            </div>
          )}
        </div>

        {/* ── Days ──────────────────────────────────────────────────── */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
          {days.map((day, dayIdx) => {
            const supersetGroups = groupBySupersets(day.workout);
            const progress = dayProgress[dayIdx];
            const allDone = progress.completedSets === progress.totalSets && progress.totalSets > 0;

            return (
              <div
                key={day.dayNumber}
                className="rounded-xl bg-[#2E2E30] border border-white/10 overflow-hidden"
              >
                {/* Day header */}
                <div className="bg-[#210140] px-6 py-4 flex items-center justify-between">
                  <div>
                    <h2 className="font-[family-name:var(--font-heading)] text-[#FAFAFA] text-2xl">
                      DAY {day.dayNumber} &mdash; {day.type.toUpperCase()}
                    </h2>
                    <div className="mt-2">
                      <ProgressBar
                        completed={progress.completedSets}
                        total={progress.totalSets}
                        label={`DAY ${day.dayNumber}`}
                      />
                    </div>
                  </div>
                  {allDone && (
                    <svg className="w-8 h-8 text-[#4AAE8C]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                </div>

                <div className="p-5 space-y-6">
                  {/* Warmup */}
                  <details className="group">
                    <summary className="cursor-pointer list-none flex items-center gap-2 font-[family-name:var(--font-heading)] text-sm text-[#FAFAFA] tracking-wide select-none">
                      <svg
                        className="w-4 h-4 text-[#B0B0B5] transition-transform group-open:rotate-90"
                        fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                      </svg>
                      DYNAMIC WARMUP ({day.warmup.length} EXERCISES)
                    </summary>
                    <div className="mt-3 space-y-2 pl-6">
                      {day.warmup.map((ex) => {
                        const videoKey = `warmup-${ex.id}`;
                        const isExpanded = expandedVideos.has(videoKey);
                        return (
                          <div key={ex.id} className="rounded-lg bg-[#1a1a1c]/40 px-4 py-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="text-[#FAFAFA] text-sm">{ex.name}</span>
                                {ex.videoUrl && (
                                  <button
                                    onClick={() => toggleVideo(videoKey)}
                                    className="text-[#F16363] hover:text-[#E84E4E] transition-colors"
                                    aria-label="Toggle video"
                                  >
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                      <path d="M8 5v14l11-7z" />
                                    </svg>
                                  </button>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-[#B0B0B5] text-xs bg-[#252526] px-2 py-0.5 rounded">
                                  {ex.setsReps}
                                </span>
                                {ex.tempo && (
                                  <span className="text-[#B0B0B5] text-xs bg-[#252526] px-2 py-0.5 rounded">
                                    {ex.tempo}
                                  </span>
                                )}
                              </div>
                            </div>
                            {isExpanded && ex.videoUrl && (
                              <>
                                <VideoEmbed url={ex.videoUrl} title={ex.name} />
                                {ex.tip && <TipCallout tip={ex.tip} />}
                              </>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </details>

                  {/* Workout */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-[family-name:var(--font-heading)] text-sm text-[#FAFAFA] tracking-wide">
                        WORKOUT
                      </h3>
                      <div className="flex gap-2">
                        <button
                          onClick={() => markAllComplete(day.dayNumber, day.workout)}
                          className="text-xs font-[family-name:var(--font-heading)] tracking-wider text-[#4AAE8C] hover:text-[#5BC9A3] transition-colors px-3 py-1 rounded border border-[#4AAE8C]/30 hover:border-[#4AAE8C]/60"
                        >
                          COMPLETE ALL
                        </button>
                        <button
                          onClick={() => clearDay(day.dayNumber, day.workout)}
                          className="text-xs font-[family-name:var(--font-heading)] tracking-wider text-[#B0B0B5] hover:text-[#FAFAFA] transition-colors px-3 py-1 rounded border border-white/10 hover:border-white/20"
                        >
                          RESET
                        </button>
                      </div>
                    </div>

                    <div className="space-y-6">
                      {supersetGroups.map(({ group, exercises }) => {
                        const colours = SUPERSET_COLOURS[group] ?? SUPERSET_COLOURS.A;
                        return (
                          <div key={group}>
                            <span className={`font-[family-name:var(--font-heading)] text-xs tracking-wider ${colours.label} mb-2 block`}>
                              SUPERSET {group}
                            </span>
                            <div className="space-y-3">
                              {exercises.map((ex, idx) => {
                                const exKey = `day${day.dayNumber}-${ex.id}`;
                                const videoKey = `workout-${day.dayNumber}-${ex.id}-${idx}`;
                                const totalSets = parseSetsFromString(ex.setsReps);
                                const completedSetsForEx = completed[exKey] ?? new Set<number>();
                                const isExpanded = expandedVideos.has(videoKey);
                                const exDone = completedSetsForEx.size === totalSets && totalSets > 0;

                                return (
                                  <div
                                    key={exKey + idx}
                                    className={`rounded-lg border-l-4 ${colours.border} p-4 transition-colors ${
                                      exDone ? 'bg-[#4AAE8C]/8' : 'bg-[#1a1a1c]/40'
                                    }`}
                                  >
                                    <div className="flex items-start justify-between gap-3">
                                      <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                          <h4 className="font-[family-name:var(--font-heading)] text-[#FAFAFA] text-base">
                                            {group}{idx + 1}. {ex.name}
                                          </h4>
                                          {exDone && (
                                            <svg className="w-4 h-4 text-[#4AAE8C]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                            </svg>
                                          )}
                                        </div>

                                        {/* Badges */}
                                        <div className="mt-2 flex flex-wrap gap-2">
                                          <span className="text-xs bg-[#210140] text-[#FAFAFA] px-2.5 py-1 rounded">
                                            {ex.setsReps}
                                          </span>
                                          {ex.tempo && (
                                            <span className="text-xs bg-[#210140] text-[#FAFAFA] px-2.5 py-1 rounded">
                                              Tempo: {ex.tempo}
                                            </span>
                                          )}
                                          {ex.rest && (
                                            <span className="text-xs bg-[#210140] text-[#FAFAFA] px-2.5 py-1 rounded">
                                              Rest: {ex.rest}
                                            </span>
                                          )}
                                          {ex.videoUrl && (
                                            <button
                                              onClick={() => toggleVideo(videoKey)}
                                              className="text-xs bg-[#F16363]/15 text-[#F16363] px-2.5 py-1 rounded hover:bg-[#F16363]/25 transition-colors flex items-center gap-1"
                                            >
                                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M8 5v14l11-7z" />
                                              </svg>
                                              {isExpanded ? 'HIDE' : 'DEMO'}
                                            </button>
                                          )}
                                        </div>
                                      </div>

                                      {/* Set indicators */}
                                      <SetIndicators
                                        exerciseKey={exKey}
                                        totalSets={totalSets}
                                        completedSets={completedSetsForEx}
                                        onToggle={toggleSet}
                                      />
                                    </div>

                                    {/* Video embed */}
                                    {isExpanded && ex.videoUrl && (
                                      <VideoEmbed url={ex.videoUrl} title={ex.name} />
                                    )}
                                    {!ex.videoUrl && <VideoPlaceholder />}

                                    {/* Tip */}
                                    {ex.tip && <TipCallout tip={ex.tip} />}

                                    {ex.notes && (
                                      <p className="mt-2 text-[#B0B0B5] text-xs italic">{ex.notes}</p>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Recovery */}
                  <div>
                    <h3 className="font-[family-name:var(--font-heading)] text-sm text-[#FAFAFA] tracking-wide mb-3">
                      RECOVERY
                    </h3>
                    <div className="space-y-2 pl-1">
                      {day.recovery.map((note, i) => (
                        <div key={i} className="flex items-start gap-2 text-[#B0B0B5] text-sm">
                          <span className="text-[#F16363] mt-0.5">&#8226;</span>
                          {note}
                        </div>
                      ))}
                      {FOAM_ROLLER_VIDEO && (
                        <div className="mt-2">
                          <button
                            onClick={() => toggleVideo(`recovery-${day.dayNumber}`)}
                            className="text-xs bg-[#F16363]/15 text-[#F16363] px-2.5 py-1 rounded hover:bg-[#F16363]/25 transition-colors flex items-center gap-1"
                          >
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z" />
                            </svg>
                            FOAM ROLLER DEMO
                          </button>
                          {expandedVideos.has(`recovery-${day.dayNumber}`) && (
                            <>
                              <VideoEmbed url={FOAM_ROLLER_VIDEO.videoUrl} title="Foam Roller" />
                              <TipCallout tip={FOAM_ROLLER_VIDEO.tip} />
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Core Circuit ─────────────────────────────────────────── */}
        <div className="mt-10 rounded-xl bg-[#2E2E30] border border-white/10 overflow-hidden">
          <div className="bg-[#210140] px-6 py-4">
            <h2 className="font-[family-name:var(--font-heading)] text-[#FAFAFA] text-2xl">
              CORE CIRCUIT
            </h2>
            <p className="mt-1 text-[#B0B0B5] text-sm">
              {coreCircuit.reps} reps per exercise
              {coreCircuit.sets && coreCircuit.sets > 1 ? ` · ${coreCircuit.sets} sets` : ''}
              {coreCircuit.restBetweenSets ? ` · ${coreCircuit.restBetweenSets} rest between sets` : ''}
            </p>
          </div>

          <div className="p-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Set 1 */}
              <div>
                <h3 className="font-[family-name:var(--font-heading)] text-sm text-[#FAFAFA] tracking-wide mb-3">SET 1</h3>
                <div className="space-y-2">
                  {coreCircuit.exercises.slice(0, 3).map((ex, i) => {
                    const videoKey = `core-${ex.id}`;
                    const isExpanded = expandedVideos.has(videoKey);
                    return (
                      <div key={ex.id} className="rounded-lg bg-[#1a1a1c]/40 px-4 py-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="font-[family-name:var(--font-heading)] text-[#F16363] text-sm w-5">{i + 1}.</span>
                            <span className="text-[#FAFAFA] text-sm">{ex.name}</span>
                            {ex.videoUrl && (
                              <button onClick={() => toggleVideo(videoKey)} className="text-[#F16363] hover:text-[#E84E4E]">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                              </button>
                            )}
                          </div>
                          <span className="text-[#B0B0B5] text-xs bg-[#252526] px-2 py-0.5 rounded">{ex.reps}</span>
                        </div>
                        {isExpanded && ex.videoUrl && <VideoEmbed url={ex.videoUrl} title={ex.name} />}
                        {isExpanded && ex.tip && <TipCallout tip={ex.tip} />}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Set 2 */}
              <div>
                {coreCircuit.breakDuration && (
                  <div className="mb-3 flex items-center gap-2">
                    <div className="h-px flex-1 bg-white/10" />
                    <span className="text-[#B0B0B5] text-xs font-[family-name:var(--font-heading)] tracking-wider shrink-0">
                      {coreCircuit.breakDuration} BREAK
                    </span>
                    <div className="h-px flex-1 bg-white/10" />
                  </div>
                )}
                <h3 className="font-[family-name:var(--font-heading)] text-sm text-[#FAFAFA] tracking-wide mb-3">SET 2</h3>
                <div className="space-y-2">
                  {coreCircuit.exercises.slice(3, 6).map((ex, i) => {
                    const videoKey = `core-${ex.id}`;
                    const isExpanded = expandedVideos.has(videoKey);
                    return (
                      <div key={ex.id} className="rounded-lg bg-[#1a1a1c]/40 px-4 py-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="font-[family-name:var(--font-heading)] text-[#F16363] text-sm w-5">{i + 4}.</span>
                            <span className="text-[#FAFAFA] text-sm">{ex.name}</span>
                            {ex.videoUrl && (
                              <button onClick={() => toggleVideo(videoKey)} className="text-[#F16363] hover:text-[#E84E4E]">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                              </button>
                            )}
                          </div>
                          <span className="text-[#B0B0B5] text-xs bg-[#252526] px-2 py-0.5 rounded">{ex.reps}</span>
                        </div>
                        {isExpanded && ex.videoUrl && <VideoEmbed url={ex.videoUrl} title={ex.name} />}
                        {isExpanded && ex.tip && <TipCallout tip={ex.tip} />}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Glute Activation ─────────────────────────────────────── */}
        <div className="mt-8 rounded-xl bg-[#2E2E30] border border-white/10 overflow-hidden">
          <div className="bg-[#210140] px-6 py-4">
            <h2 className="font-[family-name:var(--font-heading)] text-[#FAFAFA] text-2xl">
              PRE-RIDE GLUTE ACTIVATION
            </h2>
            <p className="mt-1 text-[#B0B0B5] text-sm">Activation exercises before you ride</p>
          </div>
          <div className="p-5 space-y-2">
            {gluteActivation.exercises.map((ex, i) => (
              <div key={i} className="flex items-center justify-between rounded-lg bg-[#1a1a1c]/40 px-4 py-3">
                <span className="text-[#FAFAFA] text-sm">{ex.name}</span>
                {ex.setsReps && (
                  <span className="text-[#B0B0B5] text-xs bg-[#252526] px-2 py-0.5 rounded">{ex.setsReps}</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ── Bottom nav ───────────────────────────────────────────── */}
        <div className="mt-12 flex items-center justify-between">
          {prevWeek ? (
            <a
              href={`/sc/programme/week/${prevWeek}`}
              className="inline-flex items-center gap-2 font-[family-name:var(--font-heading)] text-sm tracking-wide border border-white/10 hover:border-[#F16363]/50 text-[#FAFAFA] px-6 py-3 rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
              WEEK {prevWeek}
            </a>
          ) : <span />}
          <a
            href="/sc/programme"
            className="font-[family-name:var(--font-heading)] text-sm tracking-wide text-[#B0B0B5] hover:text-[#FAFAFA] transition-colors"
          >
            BACK TO PROGRAMME
          </a>
          {nextWeek ? (
            <a
              href={`/sc/programme/week/${nextWeek}`}
              className="inline-flex items-center gap-2 font-[family-name:var(--font-heading)] text-sm tracking-wide border border-white/10 hover:border-[#F16363]/50 text-[#FAFAFA] px-6 py-3 rounded-lg transition-colors"
            >
              WEEK {nextWeek}
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </a>
          ) : <span />}
        </div>
      </div>
    </div>
  );
}
