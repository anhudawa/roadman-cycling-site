interface VideoEmbedProps {
  youTubeId: string | null;
  title: string;
}

/**
 * 16:9 YouTube embed using the privacy-enhanced `youtube-nocookie.com`
 * domain. When no video is set yet (Phase 1), shows a designed
 * placeholder — layered gradient + locked play button — so the slot
 * reads as "in production" rather than "missing asset". The real embed
 * gets a coral-tinted glow on hover.
 */
export function VideoEmbed({ youTubeId, title }: VideoEmbedProps) {
  if (!youTubeId) {
    return (
      <div
        role="img"
        aria-label={`${title} — video walkthrough coming soon`}
        className="group relative aspect-video overflow-hidden rounded-lg border border-coral/25 bg-charcoal"
      >
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-br from-deep-purple/70 via-charcoal to-charcoal"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,_rgba(241,99,99,0.18),_transparent_55%)]"
        />
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.07] mix-blend-overlay"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, rgba(255,255,255,0.6) 0 1px, transparent 1px 3px)",
          }}
        />

        <div className="absolute top-4 left-4 inline-flex items-center gap-2 rounded-full border border-coral/40 bg-charcoal/70 px-3 py-1 backdrop-blur-sm">
          <span className="relative flex h-2 w-2">
            <span className="absolute inset-0 animate-ping rounded-full bg-coral/70" />
            <span className="relative h-2 w-2 rounded-full bg-coral" />
          </span>
          <span className="font-heading text-[10px] tracking-[0.3em] text-coral">
            IN PRODUCTION
          </span>
        </div>

        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-6 text-center">
          <span
            aria-hidden
            className="relative flex h-20 w-20 items-center justify-center rounded-full border border-coral/40 bg-coral/10 shadow-[0_0_36px_rgba(241,99,99,0.25)] transition-transform group-hover:scale-105"
          >
            <span className="absolute inset-0 rounded-full border border-coral/20 animate-[ping_2.8s_cubic-bezier(0,0,0.2,1)_infinite]" />
            <svg viewBox="0 0 24 24" className="relative h-8 w-8 translate-x-[2px] text-coral">
              <path d="M8 5v14l11-7z" fill="currentColor" />
            </svg>
          </span>
          <div>
            <p className="font-heading text-sm tracking-[0.3em] text-coral mb-2">
              VIDEO COMING SOON
            </p>
            <p className="text-sm text-foreground-muted max-w-xs mx-auto leading-relaxed">
              Anthony&apos;s walkthrough for this module is being recorded.
              You&apos;ll be emailed when it lands.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(
    youTubeId,
  )}?rel=0&modestbranding=1`;

  return (
    <div
      className="aspect-video rounded-lg overflow-hidden border border-white/10 transition-shadow hover:shadow-[0_0_48px_rgba(241,99,99,0.28)]"
      style={{ boxShadow: "0 0 32px rgba(241,99,99,0.18)" }}
    >
      <iframe
        src={src}
        title={title}
        loading="lazy"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        className="w-full h-full"
      />
    </div>
  );
}
