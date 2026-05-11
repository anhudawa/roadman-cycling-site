interface VideoEmbedProps {
  youTubeId: string | null;
  title: string;
}

/**
 * 16:9 YouTube embed using the privacy-enhanced `youtube-nocookie.com`
 * domain. When no video is set yet (Phase 1), shows a coral-bordered
 * placeholder so the layout doesn't shift when content lands.
 */
export function VideoEmbed({ youTubeId, title }: VideoEmbedProps) {
  if (!youTubeId) {
    return (
      <div className="aspect-video rounded-lg border border-coral/20 bg-charcoal flex items-center justify-center">
        <div className="text-center px-6">
          <p className="font-heading text-sm tracking-[0.3em] text-coral mb-2">
            VIDEO COMING SOON
          </p>
          <p className="text-sm text-foreground-muted">
            The walkthrough video for this module is being recorded.
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
      className="aspect-video rounded-lg overflow-hidden border border-white/10"
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
