"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { WrappedData } from "@/lib/season-wrapped/types";
import { CARD_SEQUENCE, type CardId } from "@/lib/season-wrapped/cards";
import {
  BiggestMonthCard,
  ClimbingCard,
  LongOneCard,
  NotDoneYetCard,
  PersonalityCard,
  PowerStoryCard,
  StreakCard,
  YearTotalCard,
} from "./Cards";
import { SharePoster } from "./SharePoster";

interface Props {
  data: WrappedData;
  onRestart: () => void;
}

const SWIPE_THRESHOLD = 80;

/**
 * Full-screen swipe-through Wrapped experience.
 * - Click/tap left half → previous, right half → next
 * - Arrow keys, Space → next/prev
 * - Touch swipe (drag distance + velocity)
 * - Auto-progress disabled (deliberate — riders linger)
 *
 * The exportable share poster sits in a side rail on desktop and as a
 * collapsible panel on mobile, so any card can be shared at any moment.
 */
export function WrappedExperience({ data, onRestart }: Props) {
  const [idx, setIdx] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [shareOpen, setShareOpen] = useState(false);

  const cardId: CardId = CARD_SEQUENCE[idx];
  const total = CARD_SEQUENCE.length;
  const isFirst = idx === 0;
  const isLast = idx === total - 1;

  const goNext = useCallback(() => {
    if (isLast) return;
    setDirection(1);
    setIdx((i) => Math.min(total - 1, i + 1));
  }, [isLast, total]);
  const goPrev = useCallback(() => {
    if (isFirst) return;
    setDirection(-1);
    setIdx((i) => Math.max(0, i - 1));
  }, [isFirst]);
  const goTo = useCallback(
    (target: number) => {
      setDirection(target > idx ? 1 : -1);
      setIdx(Math.max(0, Math.min(total - 1, target)));
    },
    [idx, total],
  );

  // Keyboard
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault();
        goNext();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        goPrev();
      } else if (e.key === "Escape") {
        setShareOpen(false);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goNext, goPrev]);

  // Touch swipe — distance threshold only, kept simple.
  const touchStartX = useRef<number | null>(null);
  function onTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }
  function onTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (dx <= -SWIPE_THRESHOLD) goNext();
    else if (dx >= SWIPE_THRESHOLD) goPrev();
    touchStartX.current = null;
  }

  function onAreaClick(e: React.MouseEvent<HTMLDivElement>) {
    // Skip clicks on links/buttons inside the card body.
    const target = e.target as HTMLElement;
    if (target.closest("a,button")) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    if (x < rect.width / 2) goPrev();
    else goNext();
  }

  const cardEl = useMemo(() => {
    const props = { data, trigger: idx };
    switch (cardId) {
      case "year_total":
        return <YearTotalCard {...props} />;
      case "climbing":
        return <ClimbingCard {...props} />;
      case "biggest_month":
        return <BiggestMonthCard {...props} />;
      case "long_one":
        return <LongOneCard {...props} />;
      case "power_story":
        return <PowerStoryCard {...props} />;
      case "personality":
        return <PersonalityCard {...props} />;
      case "streak":
        return <StreakCard {...props} />;
      case "not_done_yet":
        return <NotDoneYetCard {...props} />;
    }
  }, [cardId, data, idx]);

  return (
    <div className="relative min-h-screen bg-deep-purple text-off-white overflow-hidden">
      {/* Aurora wash */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <motion.div
          key={`g1-${idx}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.55 }}
          transition={{ duration: 1.2 }}
          className="absolute -top-40 left-1/2 h-[520px] w-[920px] -translate-x-1/2 blur-3xl"
          style={{
            background:
              "radial-gradient(closest-side, rgba(241,99,99,0.30), rgba(76,18,115,0.45) 45%, transparent 72%)",
          }}
        />
        <motion.div
          key={`g2-${idx}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.45 }}
          transition={{ duration: 1.2 }}
          className="absolute -bottom-32 right-0 h-[420px] w-[640px] blur-3xl"
          style={{
            background:
              "radial-gradient(closest-side, rgba(76,18,115,0.55), transparent 70%)",
          }}
        />
      </div>

      {/* Top bar — progress dots + restart */}
      <div className="relative z-20 px-5 md:px-10 pt-5 md:pt-7 pb-4 flex items-center gap-3">
        <button
          type="button"
          onClick={onRestart}
          className="font-display text-[10px] tracking-[0.28em] uppercase text-off-white/55 hover:text-off-white transition px-3 py-2 rounded border border-white/10 hover:border-white/30"
        >
          ← Restart
        </button>
        <div
          role="tablist"
          aria-label="Wrapped progress"
          className="flex-1 flex items-center gap-1.5"
        >
          {CARD_SEQUENCE.map((_, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={i === idx}
              aria-label={`Go to card ${i + 1}`}
              onClick={() => goTo(i)}
              className="group flex-1 h-1 rounded-full overflow-hidden bg-white/10 hover:bg-white/15 transition-colors"
            >
              <span
                className="block h-full rounded-full bg-coral transition-all duration-500 ease-out"
                style={{
                  width: i < idx ? "100%" : i === idx ? "100%" : "0%",
                  opacity: i <= idx ? 1 : 0,
                }}
              />
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setShareOpen((v) => !v)}
          aria-pressed={shareOpen}
          className="font-display text-[10px] tracking-[0.28em] uppercase text-charcoal bg-coral hover:bg-coral-hover transition px-4 py-2 rounded"
        >
          {shareOpen ? "Hide share" : "Share"}
        </button>
      </div>

      {/* Main card area */}
      <div
        className="relative z-10 select-none cursor-pointer"
        onClick={onAreaClick}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <div className="relative px-6 md:px-12 lg:px-20 pt-8 pb-32 min-h-[calc(100vh-120px)] grid lg:grid-cols-[1fr_360px] gap-10 items-start">
          <div className="min-h-[60vh] flex items-center">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={cardId}
                custom={direction}
                initial={{ opacity: 0, y: 28 * direction }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -28 * direction }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="w-full"
              >
                {cardEl}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Share rail — desktop */}
          <div className="hidden lg:block sticky top-24">
            <ShareRail cardId={cardId} data={data} open />
          </div>
        </div>
      </div>

      {/* Mobile share drawer */}
      <AnimatePresence>
        {shareOpen && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-x-0 bottom-0 z-30 bg-charcoal/98 backdrop-blur border-t border-white/10 px-5 pt-5 pb-[max(1rem,env(safe-area-inset-bottom))] lg:hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto max-w-md">
              <div className="flex items-center justify-between mb-4">
                <p className="font-display text-coral text-[11px] uppercase tracking-[0.28em]">
                  Share this card
                </p>
                <button
                  type="button"
                  onClick={() => setShareOpen(false)}
                  aria-label="Close share"
                  className="text-off-white/70 hover:text-off-white text-xl px-2"
                >
                  ✕
                </button>
              </div>
              <SharePoster cardId={cardId} data={data} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom hint bar */}
      <div className="absolute bottom-4 inset-x-0 z-10 flex justify-center">
        <p className="font-display text-[10px] uppercase tracking-[0.32em] text-off-white/35 text-center">
          {isLast ? (
            <button
              type="button"
              onClick={onRestart}
              className="hover:text-off-white transition pointer-events-auto"
            >
              ← Run it again
            </button>
          ) : (
            <span>
              Tap right to advance · ← → keyboard · swipe on mobile
            </span>
          )}
        </p>
      </div>
    </div>
  );
}

function ShareRail({
  cardId,
  data,
  open,
}: {
  cardId: CardId;
  data: WrappedData;
  open: boolean;
}) {
  if (!open) return null;
  return (
    <div className="rounded-2xl border border-white/8 bg-white/[0.03] backdrop-blur p-4">
      <p className="font-display text-coral text-[11px] uppercase tracking-[0.28em] mb-3">
        Share this card
      </p>
      <SharePoster cardId={cardId} data={data} />
    </div>
  );
}
