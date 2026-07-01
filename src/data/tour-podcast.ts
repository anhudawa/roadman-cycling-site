/**
 * Daily Tour de France podcast slots.
 *
 * Anthony records a short daily debrief through the race (4–26 July). Each
 * stage day has a slot here. Until an episode is published the slot renders
 * a designed "coming soon" placeholder; drop the YouTube video ID into the
 * overrides map below and it goes live with an embed — no layout change.
 *
 * To publish a day's episode, add an entry to TOUR_PODCAST_OVERRIDES keyed by
 * stage number, e.g.:
 *
 *   6: { youtubeId: "dQw4w9WgXcQ" },
 *
 * You can also override the auto-generated title/description per day. The
 * `youtubeId` is the part of a YouTube URL after `v=` (or after `youtu.be/`).
 *
 * No episode numbering per brand rules — slots are identified by the race
 * stage, not an episode count.
 */

import { TOUR_STAGES, type Stage } from "./tour-de-france-2026";

export interface TourPodcastSlot {
  /** Stable key, e.g. "stage-6". */
  key: string;
  /** Associated race stage. */
  stageNumber: number;
  /** Air date (ISO) — the evening of the stage. */
  date: string;
  title: string;
  description: string;
  /** Set to publish. Undefined → placeholder slot. */
  youtubeId?: string;
}

type SlotOverride = Partial<Pick<TourPodcastSlot, "title" | "description" | "youtubeId">>;

/** EDIT HERE to publish daily episodes. Keyed by stage number (1–21). */
export const TOUR_PODCAST_OVERRIDES: Record<number, SlotOverride> = {
  // 1: { youtubeId: "xxxxxxxxxxx" },
};

function defaultDescription(stage: Stage): string {
  switch (stage.type) {
    case "team-tt":
    case "individual-tt":
      return `Anthony breaks down the time trial — who paced it, who lost the Tour against the clock, and what it tells you about your own efforts.`;
    case "mountain":
      return `The day's climbing decoded: the moves that mattered, the watts behind them, and the training that builds a body for ${stage.finish}.`;
    case "hilly":
      return `Breakaway or bunch? Anthony unpacks how the day played out and the durability it took to be there at the end.`;
    default:
      return `The sprint, the tactics, the day's talking points — Anthony's debrief from ${stage.start} to ${stage.finish}.`;
  }
}

/** All 21 daily slots, generated from the stage list and merged with overrides. */
export function getTourPodcastSlots(): TourPodcastSlot[] {
  return TOUR_STAGES.map((stage) => {
    const override = TOUR_PODCAST_OVERRIDES[stage.number] ?? {};
    return {
      key: `stage-${stage.number}`,
      stageNumber: stage.number,
      date: stage.date,
      title:
        override.title ??
        `Stage ${stage.number} Debrief — ${stage.start} to ${stage.finish}`,
      description: override.description ?? defaultDescription(stage),
      youtubeId: override.youtubeId,
    };
  });
}

/** The daily slot for a given stage number, if any. */
export function getStagePodcast(stageNumber: number): TourPodcastSlot | undefined {
  return getTourPodcastSlots().find((s) => s.stageNumber === stageNumber);
}
