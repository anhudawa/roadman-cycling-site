/**
 * Roadman Fantasy Tour — stage picking previews (team-building UI copy).
 *
 * These are SHORT, team-selection-focused notes shown on the public
 * /fantasy landing page to help a player decide which rider TYPES to
 * buy for each stage. They are deliberately separate from the
 * `fantasyStages.roadmanTake` column (the DB-backed, content-guarded
 * notes used in the daily emails) — different audience, different job,
 * and this file touches no database, scoring, or rider data.
 *
 * Editorial rules (kept in line with src/lib/fantasy/content-guard.ts):
 *  - Guidance is by rider TYPE only (sprinters, climbers, puncheurs,
 *    breakaway riders, time-triallists, GC). Never name a rider or team.
 *  - Only lean on facts present in stages-2026.json: the stage type,
 *    the towns, the distance, summit finishes and rest days. No invented
 *    climbs, gradients or history.
 *  - No em dashes, no banned openers, no slop. Two sentences each.
 */

export interface StagePreview {
  stageNumber: number;
  /** Short rider-type tag for the visual chip. */
  pick: string;
  /** Two-sentence team-selection note. */
  note: string;
}

export const STAGE_PREVIEWS: StagePreview[] = [
  {
    stageNumber: 1,
    pick: "TTT teams",
    note: "The race opens against the clock as a team time trial. Your points pool around the squads that roll fastest as a unit, so tilt your early budget toward a strong TTT team and remember any GC pick who loses time here starts the Tour chasing.",
  },
  {
    stageNumber: 2,
    pick: "Puncheurs & breakaway",
    note: "A lumpy run into Barcelona, too punchy for the pure sprinters to keep in check. That suits puncheurs and a determined breakaway, so it is a tidy captaincy day for an attacker rather than a fast man.",
  },
  {
    stageNumber: 3,
    pick: "Climbers",
    note: "The first summit finish, and a real one. Pure climbers and the GC favourites settle this, so captain a climber and make sure your squad is not all sprinters by the opening weekend.",
  },
  {
    stageNumber: 4,
    pick: "Breakaway",
    note: "A hilly day through the foothills with a downhill run to Foix. Breakaway riders and puncheurs hold the best odds, since the sprinters' teams may not chase hard on tired legs.",
  },
  {
    stageNumber: 5,
    pick: "Sprinters",
    note: "Flat to Pau and built for a bunch finish. This is a fast men's day, so a sprinter in form is worth the captain armband if your budget left room for one.",
  },
  {
    stageNumber: 6,
    pick: "Climbers",
    note: "A mountain stage to a Pyrenean summit finish. Climbers and GC men score the points and the time gaps can be large, so lean on your climbing picks and captain accordingly.",
  },
  {
    stageNumber: 7,
    pick: "Sprinters",
    note: "Flat to Bordeaux, a sprinter's town by tradition. Expect a bunch finish, so the fast men and their lead-out value come back to the front.",
  },
  {
    stageNumber: 8,
    pick: "Sprinters / breakaway",
    note: "Another flat day that should end in a sprint. If a break is ever given room in the first week, a stage like this is where it might stick, so a canny breakaway pick can pay off.",
  },
  {
    stageNumber: 9,
    pick: "Breakaway",
    note: "A hilly stage before the first rest day, the kind of parcours breakaways love. Aggressive riders are the smart captaincy call, and the rest day after unlocks a bonus transfer to reshape the squad.",
  },
  {
    stageNumber: 10,
    pick: "Climbers",
    note: "Back into the mountains after the rest day with a summit finish. Climbers and GC contenders take the spoils, so make sure the armband is on a rider who climbs.",
  },
  {
    stageNumber: 11,
    pick: "Sprinters",
    note: "Flat to Nevers and one for the sprinters. A straightforward bunch-finish day where the fast men, if you own one, earn their keep.",
  },
  {
    stageNumber: 12,
    pick: "Sprinters",
    note: "Flat again and likely a sprint, with the mountains looming. The sprinters' teams will want to control it, so a break is a long shot and a fast finisher is the solid captain.",
  },
  {
    stageNumber: 13,
    pick: "Breakaway",
    note: "A long, hilly day to Belfort. The distance and the climbs favour a breakaway or a strong puncheur over the sprinters, so think about an attacker for the armband.",
  },
  {
    stageNumber: 14,
    pick: "Climbers",
    note: "A mountain stage to a summit finish in the Vosges. The climbers and GC men decide it, and a well-timed breakaway can survive, so weigh a climbing attacker as captain.",
  },
  {
    stageNumber: 15,
    pick: "Climbers",
    note: "A summit finish before the second rest day, deep in a hard block. Climbers score heavily, and the rest day after hands you another bonus transfer, so set up your climbers now and refresh after.",
  },
  {
    stageNumber: 16,
    pick: "Time-triallists",
    note: "An individual time trial, short and decisive. Pure testers and the GC favourites against the clock take the points, so captain your strongest time-triallist if you have one in the squad.",
  },
  {
    stageNumber: 17,
    pick: "Sprinters / breakaway",
    note: "Flat to Voiron, wedged between mountain blocks. The sprinters who survived the climbs will want it, but tired legs can let a break through, so judge your captain by who is left standing.",
  },
  {
    stageNumber: 18,
    pick: "Climbers",
    note: "A mountain stage to a summit finish as the Alps begin. Climbers and GC riders come to the fore and the points get serious, so the armband belongs on a climber.",
  },
  {
    stageNumber: 19,
    pick: "Climbers",
    note: "The first of two days finishing on Alpe d'Huez, short and explosive. This is a pure climbers' and GC day at the sharp end of the race, so captain a climber and expect big swings.",
  },
  {
    stageNumber: 20,
    pick: "Climbers",
    note: "Alpe d'Huez again, the second day running and a first in Grand Tour history. Legs are deep into the third week, so durability counts as much as raw climbing and your climbing captain can win or lose your league here.",
  },
  {
    stageNumber: 21,
    pick: "Sprinters",
    note: "The run to Paris that traditionally ends in a sprint on the Champs-Élysées. The GC is settled and the fast men contest the finish, so a sprinter takes the final captaincy of the Tour.",
  },
];

const PREVIEW_BY_STAGE = new Map(STAGE_PREVIEWS.map((p) => [p.stageNumber, p]));

export function stagePreview(stageNumber: number): StagePreview | undefined {
  return PREVIEW_BY_STAGE.get(stageNumber);
}
