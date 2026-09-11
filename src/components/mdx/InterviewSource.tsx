import Link from "next/link";

/** Full original interview: no estimated clip timestamps or guest endorsements. */
export function InterviewSource({ youtubeId, title, href }: { youtubeId: string; title: string; href: string }) {
  if (!/^[A-Za-z0-9_-]{11}$/.test(youtubeId)) return null;
  return (
    <figure className="not-prose my-8 overflow-hidden rounded-xl border border-white/15">
      <iframe
        className="aspect-video w-full"
        src={`https://www.youtube-nocookie.com/embed/${youtubeId}`}
        title={title}
        loading="lazy"
        allow="encrypted-media; picture-in-picture; fullscreen"
        allowFullScreen
      />
      <figcaption className="p-4 text-sm leading-relaxed text-foreground-muted">
        Full Roadman interview. <Link href={href} className="text-coral underline underline-offset-4">Read the episode notes and transcript</Link>.
      </figcaption>
    </figure>
  );
}
