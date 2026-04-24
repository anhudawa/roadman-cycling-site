import type { AskCitation } from "@/app/(marketing)/ask/use-ask-stream";

const TYPE_LABEL: Record<AskCitation["type"], string> = {
  episode: "Podcast",
  methodology: "Methodology",
  content_chunk: "Article",
};

export function CitationCard({ citation }: { citation: AskCitation }) {
  const body = (
    <div className="rounded-lg border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] p-4 transition-colors">
      <div className="flex items-center justify-between mb-2">
        <span className="font-heading text-xs tracking-widest text-coral uppercase">
          {TYPE_LABEL[citation.type]}
        </span>
      </div>
      <p className="text-off-white font-medium text-sm mb-2 line-clamp-2">
        {citation.title}
      </p>
      <p className="text-foreground-muted text-xs leading-relaxed line-clamp-3">
        {citation.excerpt}
      </p>
    </div>
  );

  if (citation.url) {
    return (
      <a
        href={citation.url}
        target={citation.url.startsWith("http") ? "_blank" : undefined}
        rel={citation.url.startsWith("http") ? "noopener noreferrer" : undefined}
        className="block"
      >
        {body}
      </a>
    );
  }
  return body;
}
