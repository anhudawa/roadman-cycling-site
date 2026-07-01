import { TOUR_STAGES } from "@/data/tour-de-france-2026";
import { StageCard } from "./StageCard";

/**
 * Horizontal, scroll-snapping carousel of all 21 stages. Pure CSS scroll
 * (no JS) so it costs nothing and works on touch. `todayNumber` and
 * `completedNumbers` light up the live-mode status treatment.
 */
export function StageTimeline({
  todayNumber,
  completedNumbers = [],
}: {
  todayNumber?: number;
  completedNumbers?: number[];
}) {
  const done = new Set(completedNumbers);

  return (
    <div
      className="flex gap-3 overflow-x-auto pb-4 snap-x snap-mandatory [scrollbar-width:thin]"
      style={{ scrollPaddingLeft: "1.25rem" }}
    >
      {TOUR_STAGES.map((stage) => (
        <StageCard
          key={stage.number}
          stage={stage}
          state={
            stage.number === todayNumber
              ? "today"
              : done.has(stage.number)
                ? "done"
                : "default"
          }
          className="snap-start shrink-0 w-[230px] sm:w-[250px]"
        />
      ))}
    </div>
  );
}
