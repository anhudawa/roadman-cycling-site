type CitationType = "paper" | "book" | "article" | "tool" | "episode" | "website";

interface Citation {
  title: string;
  type: CitationType;
  url?: string;
  author?: string;
}

interface EpisodeCitationsProps {
  citations: Citation[];
  className?: string;
}

const TYPE_LABEL: Record<CitationType, string> = {
  paper: "Paper",
  book: "Book",
  article: "Article",
  tool: "Tool",
  episode: "Episode",
  website: "Website",
};

/**
 * "Resources mentioned" — papers, books, tools, and other episodes
 * referenced in the conversation. Outbound links use rel="nofollow"
 * for non-Roadman destinations so authority doesn't leak. Internal
 * `episode` and `tool` types stay as plain links for full link equity.
 */
export function EpisodeCitations({
  citations,
  className = "",
}: EpisodeCitationsProps) {
  if (!citations || citations.length === 0) return null;

  return (
    <section aria-label="Resources and citations" className={className}>
      <h2 className="font-heading text-xl text-off-white mb-4 tracking-wide">
        RESOURCES MENTIONED
      </h2>
      <ul className="space-y-2">
        {citations.map((c, i) => {
          const isInternal = c.type === "episode" || c.type === "tool";
          const linkProps = c.url
            ? isInternal
              ? { href: c.url }
              : {
                  href: c.url,
                  target: "_blank",
                  rel: "nofollow noopener noreferrer",
                }
            : null;

          const inner = (
            <>
              <span className="font-heading text-[10px] tracking-widest text-coral uppercase shrink-0 w-16">
                {TYPE_LABEL[c.type]}
              </span>
              <span className="flex-1 min-w-0">
                <span className="text-sm text-off-white group-hover:text-coral transition-colors">
                  {c.title}
                </span>
                {c.author && (
                  <span className="text-xs text-foreground-subtle block mt-0.5">
                    {c.author}
                  </span>
                )}
              </span>
              {c.url && (
                <span
                  aria-hidden
                  className="text-coral text-xs shrink-0 opacity-60 group-hover:opacity-100 transition-opacity"
                >
                  →
                </span>
              )}
            </>
          );

          return (
            <li key={i}>
              {linkProps ? (
                <a
                  {...linkProps}
                  className="flex items-start gap-4 p-3 rounded-lg border border-white/10 bg-white/[0.03] hover:border-coral/30 hover:bg-coral/[0.03] transition-colors group"
                >
                  {inner}
                </a>
              ) : (
                <div className="flex items-start gap-4 p-3 rounded-lg border border-white/10 bg-white/[0.03] group">
                  {inner}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export type { Citation, CitationType };
