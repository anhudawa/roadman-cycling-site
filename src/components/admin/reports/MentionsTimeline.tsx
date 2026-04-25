import type { EpisodeMentionGroup } from '@/lib/reports/types';
import { formatTimestamp } from '@/lib/reports/timestamp';

interface Props {
  groups: EpisodeMentionGroup[];
}

function spotifyDeeplink(spotifyId: string | undefined, seconds: number): string | null {
  if (!spotifyId) return null;
  return `https://open.spotify.com/episode/${spotifyId}?t=${seconds}`;
}

export function MentionsTimeline({ groups }: Props) {
  if (groups.length === 0) {
    return (
      <section className="py-12 text-center text-white/60">
        <p className="text-xl">No mentions this month — here&apos;s your audience growth instead.</p>
      </section>
    );
  }
  return (
    <section className="flex flex-col gap-6 py-10">
      <h2 className="font-[var(--font-bebas-neue)] text-3xl text-white">Podcast Mentions</h2>
      {groups.map((g) => (
        <article key={g.episodeSlug} className="rounded-xl border border-white/5 bg-white/5 p-6">
          <header className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="text-xs uppercase tracking-widest text-white/50">
                Episode {g.episodeNumber} · {g.publishDate}
              </div>
              <h3 className="text-xl font-semibold text-white">{g.episodeTitle}</h3>
            </div>
            <div className="flex items-center gap-4">
              <span className="rounded-full bg-[#F16363]/20 px-3 py-1 text-sm font-semibold text-[#F16363]">
                {g.mentions.length} mention{g.mentions.length === 1 ? '' : 's'}
              </span>
              <span className="text-sm text-white/70">
                {g.downloads.toLocaleString('en-GB')} downloads
              </span>
            </div>
          </header>
          <ul className="mt-4 flex flex-col gap-3">
            {g.mentions.map((m, i) => {
              const link = spotifyDeeplink(g.spotifyId, m.timestampSeconds);
              return (
                <li
                  key={`${m.charIndex}-${i}`}
                  className="flex items-start gap-4 rounded-lg bg-black/20 p-4"
                >
                  <span className="font-mono text-sm text-[#F16363]">
                    {formatTimestamp(m.timestampSeconds)}
                  </span>
                  <span className="flex-1 text-sm text-white/80">&ldquo;{m.quote}&rdquo;</span>
                  {link && (
                    <a
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 rounded-md bg-[#F16363] px-3 py-1 text-sm font-semibold text-white hover:bg-[#e14d4d]"
                    >
                      Listen →
                    </a>
                  )}
                </li>
              );
            })}
          </ul>
        </article>
      ))}
    </section>
  );
}
