import Link from "next/link";
import { CONTACT, FOUNDER } from "@/lib/brand-facts";

interface NamedSource {
  name: string;
  role?: string;
  href?: string;
}

interface LinkedSource {
  title: string;
  href: string;
}

interface SourceMethodologyProps {
  /** Named experts whose work or quotes inform this answer. */
  experts?: NamedSource[];
  /** Roadman podcast episodes the answer draws from. */
  episodes?: LinkedSource[];
  /** Roadman articles, comparisons, or guides the answer leans on. */
  articles?: LinkedSource[];
  /**
   * One paragraph explaining how the answer was put together — the
   * judgement, not the inputs. Optional. When omitted, a sensible default
   * is rendered.
   */
  methodology?: string;
  /** Last review date; falls back to today for live-rendered pages. */
  lastReviewed?: string;
  /** Reviewer name; defaults to the founder. */
  reviewedBy?: string;
  className?: string;
}

const DEFAULT_METHODOLOGY = `Roadman answers are grounded in on-the-record podcast conversations with named coaches, sports scientists, and pro riders, plus the published research those experts cite. We don't invent numbers and we say "it depends" when it does.`;

/**
 * "What this answer is based on" trust block for answer-native templates
 * (compare, best, problem, topic). Distinct from the article/episode
 * `EvidenceBlock` by being structured around the *answer*, not the
 * author — these pages are programmatic compositions, not single-author
 * essays, so the credibility signal is the methodology + the named
 * sources that fed it.
 */
export function SourceMethodology({
  experts,
  episodes,
  articles,
  methodology = DEFAULT_METHODOLOGY,
  lastReviewed,
  reviewedBy = FOUNDER.name,
  className = "",
}: SourceMethodologyProps) {
  const hasNamedSources =
    (experts && experts.length > 0) ||
    (episodes && episodes.length > 0) ||
    (articles && articles.length > 0);

  return (
    <aside
      className={`rounded-xl border border-white/10 bg-white/[0.03] p-5 md:p-6 ${className}`}
      aria-label="What this answer is based on"
    >
      <p className="font-heading text-coral text-xs tracking-widest mb-3">
        WHAT THIS ANSWER IS BASED ON
      </p>

      <p className="text-foreground-muted text-sm leading-relaxed mb-4">
        {methodology}
      </p>

      {experts && experts.length > 0 && (
        <div className="mb-4">
          <p className="text-xs text-foreground-subtle uppercase tracking-wider mb-2">
            Named sources
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
            Source episodes
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

      {articles && articles.length > 0 && (
        <div className="mb-4">
          <p className="text-xs text-foreground-subtle uppercase tracking-wider mb-2">
            Supporting guides
          </p>
          <ul className="space-y-1">
            {articles.map((a) => (
              <li key={a.href}>
                <Link
                  href={a.href}
                  className="text-sm text-coral hover:text-coral/80 transition-colors"
                >
                  {a.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {!hasNamedSources && (
        <p className="text-xs text-foreground-subtle italic mb-4">
          No external sources cited on this page — the answer reflects the
          Roadman editorial position synthesised from the full podcast catalogue.
        </p>
      )}

      <div className="text-xs text-foreground-subtle border-t border-white/10 pt-3 mt-3 space-y-1">
        <p>
          <span>Reviewed by {reviewedBy}</span>
          {lastReviewed && <span> · Last reviewed {lastReviewed}</span>}
        </p>
        <p>
          <Link
            href={CONTACT.editorialStandardsUrl.replace(/^https?:\/\/[^/]+/, "")}
            className="text-foreground-subtle hover:text-coral transition-colors underline decoration-white/10 underline-offset-2"
          >
            Editorial standards
          </Link>
          {" · "}
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
