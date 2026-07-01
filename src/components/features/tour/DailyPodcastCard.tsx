import { HeroVideo } from "@/components/ui";
import { SkoolTrialButton } from "@/components/features/community/SkoolTrialButton";
import type { TourPodcastSlot } from "@/data/tour-podcast";
import { formatStageDate } from "@/lib/tour";
import { SKOOL_URL } from "./constants";

/**
 * One day's Tour podcast slot. Reuses HeroVideo's "coming soon" placeholder /
 * lite-embed pattern: until Anthony drops a YouTube ID into the overrides map
 * the card reads as in-production; once published it plays inline.
 */
export function DailyPodcastCard({
  slot,
  highlight = false,
}: {
  slot: TourPodcastSlot;
  highlight?: boolean;
}) {
  const published = Boolean(slot.youtubeId);

  return (
    <div
      className={`rounded-xl border bg-background-elevated p-4 sm:p-5 ${
        highlight ? "border-jersey-yellow/50" : "border-white/8"
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="font-heading text-jersey-yellow text-[11px] tracking-[0.25em]">
          DAILY DEBRIEF
        </span>
        <span className="text-foreground-subtle text-xs">
          {formatStageDate(slot.date)}
        </span>
      </div>

      <HeroVideo
        videoYouTubeId={slot.youtubeId ?? null}
        title={slot.title}
        className="mb-4"
      />

      <h3 className="font-heading text-off-white text-lg leading-tight tracking-wide mb-1">
        {slot.title}
      </h3>
      <p className="text-sm text-foreground-muted leading-relaxed">
        {slot.description}
      </p>

      {!published && (
        <div className="mt-4 flex items-center gap-3">
          <SkoolTrialButton
            href={SKOOL_URL}
            source={`tour-podcast-stage-${slot.stageNumber}`}
            size="sm"
            className="!bg-jersey-yellow !text-charcoal hover:!bg-jersey-yellow-deep !shadow-none"
          >
            Get it First in Skool
          </SkoolTrialButton>
          <span className="text-xs text-foreground-subtle">
            Drops on the evening of the stage.
          </span>
        </div>
      )}
    </div>
  );
}
