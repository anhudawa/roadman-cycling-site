interface VideoEmbedProps {
  youTubeId: string | null;
  title: string;
}

/**
 * 16:9 YouTube embed using the privacy-enhanced `youtube-nocookie.com`
 * domain. When no video is set yet (Phase 1), shows a coral-bordered
 * placeholder so the layout doesn't shift when content lands.
 *
 * The real embed gets a coral-tinted glow on hover — small detail,
 * but the kind of touch that makes the page feel built rather than
 * generated.
 */
export function VideoEmbed({ youTubeId, title }: VideoEmbedProps) {
  if (!youTubeId) {
    return (
      <div className="aspect-video rounded-lg border border-coral/20 bg-charcoal/80 flex items-center justify-center relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(241,99,99,0.08),_transparent_60%)]"
        />
        <div className="relative text-center px-6">
          <span
            aria-hidden
            className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full border border-coral/40 bg-coral/10"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5 text-coral">
              <path d="M8 5v14l11-7z" fill="currentColor" />
            </svg>
          </span>
          <p className="font-heading text-sm tracking-[0.3em] text-coral mb-2">
            VIDEO COMING SOON
          </p>
          <p className="text-sm text-foreground-muted max-w-xs mx-auto">
            Anthony&apos;s walkthrough for this module is being recorded.
            You&apos;ll be emailed when it lands.
          </p>
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
