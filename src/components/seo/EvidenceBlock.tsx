import Link from "next/link";

interface EvidenceSource {
  name: string;
  role?: string;
  href?: string;
}

interface EvidenceBlockProps {
  experts?: EvidenceSource[];
  episodes?: { title: string; href: string }[];
  lastReviewed?: string;
  reviewedBy?: string;
}

export function EvidenceBlock({
  experts,
  episodes,
  lastReviewed,
  reviewedBy,
}: EvidenceBlockProps) {
  if (!experts?.length && !episodes?.length && !lastReviewed) return null;

  return (
    <aside
      className="rounded-xl border border-white/10 bg-white/[0.03] p-5 md:p-6 mt-10"
      aria-label="Sources and evidence"
    >
      <p className="font-heading text-coral text-xs tracking-widest mb-4">
        SOURCES &amp; EVIDENCE
      </p>

      {experts && experts.length > 0 && (
        <div className="mb-4">
          <p className="text-xs text-foreground-subtle uppercase tracking-wider mb-2">
            Expert sources
          </p>
          <ul className="space-y-1">
            {experts.map((e) => (
              <li key={e.name} className="text-sm text-foreground-muted">
                <span className="text-off-white">{e.name}</span>
                {e.role && ` — ${e.role}`}
                {e.href && (
                  <>
                    {" "}
                    <Link
                      href={e.href}
                      className="text-coral hover:text-coral/80 transition-colors"
                    >
                      →
                    </Link>
                  </>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {episodes && episodes.length > 0 && (
        <div className="mb-4">
          <p className="text-xs text-foreground-subtle uppercase tracking-wider mb-2">
            Related episodes
          </p>
          <ul className="space-y-1">
            {episodes.map((ep) => (
              <li key={ep.href}>
                <Link
                  href={ep.href}
                  className="text-sm text-coral hover:text-coral/80 transition-colors"
                >
                  {ep.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {(lastReviewed || reviewedBy) && (
        <div className="text-xs text-foreground-subtle border-t border-white/10 pt-3 mt-3">
          {reviewedBy && <span>Reviewed by {reviewedBy}</span>}
          {reviewedBy && lastReviewed && <span> · </span>}
          {lastReviewed && <span>Last reviewed {lastReviewed}</span>}
        </div>
      )}
    </aside>
  );
}
