/**
 * Recommendation engine for the Method onboarding quiz.
 *
 * The selection logic is a straight lookup: (goal, hours, level) → plan.
 * FTP and event-date never change the plan; they generate calibration
 * notes the rider sees on the results page and that the team uses when
 * applying the TrainingPeaks plan to their account.
 */

import { PLAN_BY_CODE } from "./plan-matrix";
import type { QuizAnswers, Recommendation } from "./types";

export function recommend(answers: QuizAnswers): Recommendation {
  const code = `${answers.goal}--${answers.level}--${answers.hours}h`;
  const plan = PLAN_BY_CODE.get(code);
  if (!plan) {
    throw new Error(
      `No plan found for ${code}. The matrix should cover all combinations — this is a bug.`,
    );
  }

  const weeksToEvent = answers.eventDate ? weeksUntil(answers.eventDate) : null;
  const notes = buildNotes(answers, weeksToEvent);

  return { plan, answers, notes, weeksToEvent };
}

function weeksUntil(isoDate: string): number | null {
  const target = Date.parse(isoDate);
  if (Number.isNaN(target)) return null;
  const ms = target - Date.now();
  if (ms < 0) return 0;
  return Math.round(ms / (1000 * 60 * 60 * 24 * 7));
}

function buildNotes(answers: QuizAnswers, weeksToEvent: number | null): string[] {
  const notes: string[] = [];

  /* ── FTP calibration note ────────────────────────────────── */
  if (answers.ftp && answers.ftp > 0) {
    notes.push(
      `Your TrainingPeaks zones will be seeded from FTP ${answers.ftp} W. Reset the test in Module 01 — if your number's been parked for six months, it's almost certainly out of date.`,
    );
  } else {
    notes.push(
      "No FTP supplied. Module 01 walks you through an honest baseline test on day three — we'll set zones once you've got a real number.",
    );
  }

  /* ── Event-date periodisation note ───────────────────────── */
  if (weeksToEvent !== null) {
    if (weeksToEvent < 8) {
      notes.push(
        `Your event is ${weeksToEvent} week${weeksToEvent === 1 ? "" : "s"} away — that's a compressed runway. We'll fold the plan into a peaking block: skip the front of Base and run Build straight into Peak.`,
      );
    } else if (weeksToEvent <= 16) {
      notes.push(
        `Your event is ${weeksToEvent} weeks out — perfect window for the full 12-week block to land on the start line.`,
      );
    } else {
      notes.push(
        `Your event is ${weeksToEvent} weeks away — that's more runway than the 12-week plan needs. We'll run an extended base before the structured block begins.`,
      );
    }
  }

  /* ── Unusual-combo flags ─────────────────────────────────── */
  if (answers.goal === "comeback" && answers.hours === 12 && answers.level !== "advanced") {
    notes.push(
      "Twelve hours is a lot of comeback volume — if a few weeks in this feels too much, drop to the 10-hour version. Comebacks fail from overreach, not under-training.",
    );
  }
  if (answers.level === "beginner" && answers.hours === 12) {
    notes.push(
      "Twelve hours as a beginner is ambitious. The first month deliberately keeps intensity low — let adaptation catch up before adding load.",
    );
  }
  if (answers.goal === "racing" && answers.hours === 6) {
    notes.push(
      "Six hours for racing is the tight end — every session has to count. You'll do less endurance volume than you'd like; that's the trade.",
    );
  }

  return notes;
}
