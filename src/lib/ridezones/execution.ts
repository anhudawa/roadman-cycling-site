/**
 * Execution scoring — not what you rode, how you rode it.
 *
 * Each ride is scored 0–10 against the job its classified purpose was
 * supposed to do. An endurance ride that drifted into Zone 3 scores worse
 * than a shorter one that stayed honest; a threshold session earns its
 * score from actual minutes at threshold, not from average power.
 */

import { zoneShares } from "./classify";
import { clamp, round1 } from "./load";
import type { Activity, ExecutionScore, SessionPurpose } from "./types";

function verdictFor(score: number): ExecutionScore["verdict"] {
  if (score >= 8.5) return "nailed";
  if (score >= 7) return "solid";
  if (score >= 5) return "drifted";
  return "missed";
}

function build(score: number, note: string): ExecutionScore {
  const clamped = round1(clamp(score, 0, 10));
  return { score: clamped, verdict: verdictFor(clamped), note };
}

export function scoreExecution(
  activity: Activity,
  purpose: SessionPurpose,
  intensityFactor: number | null
): ExecutionScore | null {
  if (purpose === "unknown" || intensityFactor === null) return null;

  const shares = zoneShares(activity);
  const hours = activity.durationSec / 3600;

  switch (purpose) {
    case "recovery": {
      const overshoot = Math.max(0, intensityFactor - 0.55);
      const score = 10 - overshoot * 40;
      return build(
        score,
        overshoot > 0.05
          ? "A recovery spin only works if it stays a recovery spin. This one crept hard enough to blunt tomorrow's session."
          : "Proper recovery ride. Easy enough to actually recover on — that's the whole job."
      );
    }

    case "endurance":
    case "long-ride": {
      // Discipline is the metric: time above Z2 is the leak.
      const leak = shares
        ? shares.tempo + shares.threshold + shares.hard
        : Math.max(0, (intensityFactor - 0.75) * 6);
      const overshoot = Math.max(0, intensityFactor - 0.75);
      const score = 10 - leak * 14 - overshoot * 25;
      const durabilityBonus = purpose === "long-ride" && hours >= 3.5 ? 0.3 : 0;
      if (score + durabilityBonus >= 8.5) {
        return build(
          score + durabilityBonus,
          purpose === "long-ride"
            ? "Long ride done the way the pros do it — steady, controlled, aerobic. This is where durability gets built."
            : "Disciplined Zone 2 riding. This is the 80% that makes the 20% work."
        );
      }
      return build(
        score + durabilityBonus,
        `About ${Math.round(leak * 100)}% of this ride sat above Zone 2. That's the classic self-coached leak — too hard to be easy, too easy to count as a session.`
      );
    }

    case "grey-zone":
      return build(
        4.5 + Math.max(0, (0.8 - intensityFactor) * 10),
        "This ride lived in the grey zone. It felt like training, but it neither built the base nor moved your threshold. Pick a lane next time: properly easy, or properly hard."
      );

    case "tempo": {
      const inRange = intensityFactor >= 0.76 && intensityFactor <= 0.87;
      const score = inRange ? 8.5 : 6.5;
      return build(
        score,
        inRange
          ? "Solid tempo work — controlled, purposeful, and capped before it turned into a threshold ride."
          : "Tempo is a target, not a mood. This one wandered off the intensity it was meant to hold."
      );
    }

    case "sweet-spot": {
      const workMin = shares
        ? ((shares.tempo + shares.threshold) * activity.durationSec) / 60
        : hours * 60 * 0.4;
      const score = 5.5 + clamp(workMin / 40, 0, 1) * 4;
      return build(
        score,
        workMin >= 30
          ? `Around ${Math.round(workMin)} minutes of quality sweet-spot work. Big aerobic return for the fatigue cost.`
          : "The intent was right but the time-in-zone was thin. Sweet spot pays by the minute — aim for 30–40 of them."
      );
    }

    case "threshold": {
      const workMin = shares
        ? (shares.threshold * activity.durationSec) / 60
        : hours * 60 * 0.3;
      const score = 5 + clamp(workMin / 32, 0, 1) * 4.5;
      return build(
        score,
        workMin >= 25
          ? `${Math.round(workMin)} minutes at threshold. That's the stimulus that moves FTP — repeat it weekly and it compounds.`
          : `Only ~${Math.round(workMin)} minutes actually at threshold. The session's value is in time-in-zone, not the average for the ride.`
      );
    }

    case "vo2": {
      const workMin = shares
        ? (shares.hard * activity.durationSec) / 60
        : hours * 60 * 0.15;
      const score = 5 + clamp(workMin / 16, 0, 1) * 4.5;
      return build(
        score,
        workMin >= 12
          ? `${Math.round(workMin)} minutes above threshold — real VO2 exposure. This is the ceiling-raiser.`
          : "Some VO2 work, but the accumulated time up there was short. The adaptation lives in minutes 3 to 8 of discomfort, not the first surge."
      );
    }

    default:
      return null;
  }
}
