"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { usePodcastPlayer } from "@/components/features/podcast/PodcastPlayerContext";
import type { EpisodeMeta } from "@/lib/podcast";
import { Waveform } from "./Waveform";

interface PodcastHeroProps {
  episode: EpisodeMeta | null;
  ctaHref: string;
  ctaLabel: string;
}

/**
 * Mobile-primary hero surface. Lead with the product 1M people a
 * month actually consume — the podcast. The headline stays the
 * brand promise; the waveform is the visual anchor; the latest
 * episode is the thing you can hit play on right now.
 *
 * The primary coral button triggers the in-site MiniPlayer via
 * usePodcastPlayer() — no round-trip to /podcast/[slug]. The
 * secondary text link routes to /apply (the paid funnel) so the
 * coaching CTA is still one tap away without competing visually
 * with Play.
 */
export function PodcastHero({ episode, ctaHref, ctaLabel }: PodcastHeroProps) {
  const { play } = usePodcastPlayer();

  const hasEpisode = episode !== null;
  const episodeHref = hasEpisode ? `/podcast/${episode.slug}` : "/podcast";

  function handlePlay() {
    if (!hasEpisode) return;
    play({
      slug: episode.slug,
      title: episode.title,
      guest: episode.guest,
      youtubeId: episode.youtubeId,
      spotifyId: episode.spotifyId,
      duration: episode.duration,
    });
  }

  return (
    <div className="flex flex-col items-center text-center gap-5 w-full">
      <motion.p
        className="font-body text-[10px] tracking-[0.28em] uppercase text-off-white/55"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.05 }}
      >
        1,000,000+ listeners this month
      </motion.p>

      <motion.h1
        className="font-heading text-off-white leading-[0.92]"
        style={{
          fontSize: "clamp(3rem, 13vw, 5.5rem)",
          letterSpacing: "-0.02em",
          textShadow: "0 4px 30px rgba(0,0,0,0.5)",
        }}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
      >
        <span className="block">CYCLING IS HARD.</span>
        <span className="block text-coral" style={{ fontSize: "0.88em" }}>
          OUR COACHING WILL HELP.
        </span>
      </motion.h1>

      <motion.div
        className="w-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.25 }}
      >
        <Waveform />
      </motion.div>

      {hasEpisode && (
        <motion.div
          className="w-full max-w-[440px]"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35 }}
        >
          <Link
            href={episodeHref}
            className="block text-off-white/85 hover:text-off-white transition-colors"
          >
            <span className="block font-heading text-xs tracking-[0.25em] text-coral/90 mb-1">
              {episode.episodeNumber ? `EP. ${episode.episodeNumber}` : "LATEST EPISODE"}
              <span className="text-off-white/40 mx-2">·</span>
              <span className="text-off-white/60 font-body tracking-normal normal-case">
                {episode.duration}
              </span>
            </span>
            <span className="block font-body text-sm md:text-base leading-snug text-balance line-clamp-2">
              {episode.title}
            </span>
          </Link>
        </motion.div>
      )}

      <motion.div
        className="flex flex-col items-center gap-3 w-full pt-2"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <button
          type="button"
          onClick={handlePlay}
          disabled={!hasEpisode}
          className="inline-flex items-center justify-center gap-3 font-heading text-lg tracking-wider bg-coral hover:bg-coral-hover disabled:opacity-60 disabled:cursor-not-allowed text-off-white px-8 py-4 rounded-md transition-all shadow-[0_14px_44px_-10px_rgba(241,99,99,0.7)] hover:shadow-[0_18px_54px_-8px_rgba(241,99,99,0.85)] w-full max-w-[340px]"
          style={{ transitionDuration: "var(--duration-fast)" }}
          aria-label={hasEpisode ? `Play episode ${episode.episodeNumber}` : "Listen to the podcast"}
        >
          <svg
            className="w-4 h-4"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M8 5v14l11-7z" />
          </svg>
          PLAY LATEST EPISODE
        </button>

        <Link
          href={ctaHref}
          className="font-heading text-sm tracking-[0.18em] text-off-white/75 hover:text-coral transition-colors py-2"
          style={{ transitionDuration: "var(--duration-fast)" }}
        >
          {ctaLabel} <span aria-hidden="true">→</span>
        </Link>
      </motion.div>
    </div>
  );
}
