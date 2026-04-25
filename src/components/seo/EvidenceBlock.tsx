import Link from "next/link";
import { CONTACT, FOUNDER } from "@/lib/brand-facts";

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
  /** Override the default author link ("/author/anthony-walsh"). */
  authorHref?: string;
  authorName?: string;
}

/**
 * E-E-A-T trust block rendered at the foot of articles and guides.
 * Standardises the six signals Google/AI engines look for when
 * judging content authority: named author (with profile link),
 * editorial-standards link, last-reviewed date, named sources, and a
 * corrections contact. Content-specific `experts` and `episodes` are
 * added on top.
 */
export function EvidenceBlock({
  experts,
  episodes,
  lastReviewed,
  reviewedBy = FOUNDER.name,
  authorHref = FOUNDER.url,
  authorName = FOUNDER.name,
}: EvidenceBlockProps) {
  return (
    <aside
      className="rounded-xl border border-white/10 bg-white/[0.03] p-5 md:p-6 mt-10"
      aria-label="Sources, author, and editorial standards"
    >
      <p className="font-heading text-coral text-xs tracking-widest mb-4">
        SOURCES &amp; TRUST
      </p>

      <div className="mb-4">
        <p className="text-xs text-foreground-subtle uppercase tracking-wider mb-2">
          Author
        </p>
        <p className="text-sm text-foreground-muted">
          <Link
            href={authorHref}
            className="text-off-white hover:text-coral transition-colors"
          >
            {authorName}
          </Link>
          {" $€” "}
          {FOUNDER.jobTitle}
        </p>
      </div>

      {experts && experts.length > 0 && (
        <div className="mb-4">
          <p className="text-xs text-foreground-subtle uppercase tracking-wider mb-2">
            Expert sources
          </p>
          <ul className="space-y-1">
            {experts.map((e) => (
              <li key={e.name} className="text-sm text-foreground-muted">
                <span className="text-off-white">{e.name}</span>
                {e.role && ` $€” ${e.role}`}
                {e.href && (
                  <>
                    {" "}
                    <Link
                      href={e.href}
                      className="text-coral hover:text-coral/80 transition-colors"
                    >
                      $†’
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

      <div className="text-xs text-foreground-subtle border-t border-white/10 pt-3 mt-3 space-y-1">
        {(reviewedBy || lastReviewed) && (
          <p>
            {reviewedBy && <span>Reviewed by {reviewedBy}</span>}
            {reviewedBy && lastReviewed && <span> $· </span>}
            {lastReviewed && <span>Last reviewed {lastReviewed}</span>}
          </p>
        )}
        <p>
          <Link
            href={CONTACT.editorialStandardsUrl.replace(
              /^https?:\/\/[^/]+/,
              "",
            )}
            className="text-foreground-subtle hover:text-coral transition-colors underline decoration-white/10 underline-offset-2"
          >
            Editorial standards
          </Link>
          {" $· "}
          <a
            href={`mailto:${CONTACT.correctionsEmail}?subject=Correction%20request`}
            className="text-foreground-subtle hover:text-coral transition-colors underline decoration-white/10 underline-offset-2"
          >
            Report a correction
          </a>
        </p>
      </div>
    </aside>
  );
}
