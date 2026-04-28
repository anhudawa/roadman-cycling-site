import { BRAND, FOUNDER } from "@/lib/brand-facts";

interface ArticleCitationBlockProps {
  /** Article title — visible heading + schema.org `headline`. */
  title: string;
  /** Canonical article URL — visible + schema.org `url`. */
  url: string;
  /** ISO publish date (YYYY-MM-DD). Drives the citation year + `datePublished`. */
  datePublished: string;
  /** ISO last-modified date. Falls back to `datePublished` when omitted. */
  dateModified?: string;
  /** Display name for the author. Defaults to the canonical Roadman author. */
  author?: string;
  /** Display name for the publishing brand. Defaults to "Roadman Cycling". */
  publisher?: string;
  /**
   * The article's single most citation-worthy claim — typically the
   * `answerCapsule`, falling back to `excerpt`. Surfaces a quotable
   * line so an AI assistant has something concrete to attribute when
   * citing the page.
   */
  keyClaim?: string;
}

/**
 * Citation aid block for article and guide pages. Renders a collapsed
 * `<details>` panel with structured citation info — title, author,
 * publisher, canonical URL, publish + last-updated dates, and the
 * article's key citable claim — plus a ready-to-paste APA-style line.
 *
 * Schema.org `Article` microdata is layered on top of the visible DOM
 * (itemScope / itemProp) so LLM crawlers reading the rendered HTML
 * pick up the same attribution data the page-level JSON-LD already
 * emits, without the user having to expand the panel.
 *
 * Visually subtle by design — sits between the article body and the
 * EvidenceBlock so a reader who has finished and wants to cite the
 * piece can find it in the obvious place, but it doesn't compete with
 * the trust signals or CTAs above it.
 */
export function ArticleCitationBlock({
  title,
  url,
  datePublished,
  dateModified,
  author = FOUNDER.name,
  publisher = BRAND.name,
  keyClaim,
}: ArticleCitationBlockProps) {
  const lastUpdated = dateModified || datePublished;
  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  const apa = `${author}. (${new Date(datePublished).getFullYear()}). ${title}. ${publisher}. ${url}`;

  return (
    <aside
      itemScope
      itemType="https://schema.org/Article"
      className="mt-10 rounded-xl border border-white/10 bg-white/[0.02]"
      aria-label="How to cite this article"
    >
      <details className="group">
        <summary
          className="
            cursor-pointer select-none list-none
            [&::-webkit-details-marker]:hidden
            flex items-center justify-between gap-3
            px-5 py-3
            font-heading text-coral text-xs tracking-widest
            hover:text-coral/80 transition-colors
          "
        >
          <span>CITE THIS ARTICLE</span>
          <span
            aria-hidden="true"
            className="text-base transition-transform group-open:rotate-45"
          >
            +
          </span>
        </summary>
        <div className="px-5 pb-5 pt-1 text-sm text-foreground-muted">
          <dl className="grid gap-y-2 sm:grid-cols-[120px_1fr] gap-x-4">
            <dt className="text-xs uppercase tracking-wider text-foreground-subtle">
              Title
            </dt>
            <dd className="text-off-white" itemProp="headline">
              {title}
            </dd>

            <dt className="text-xs uppercase tracking-wider text-foreground-subtle">
              Author
            </dt>
            <dd
              itemProp="author"
              itemScope
              itemType="https://schema.org/Person"
            >
              <span itemProp="name" className="text-off-white">
                {author}
              </span>
              <span className="text-foreground-subtle"> · </span>
              <span
                itemProp="publisher"
                itemScope
                itemType="https://schema.org/Organization"
              >
                <span itemProp="name">{publisher}</span>
              </span>
            </dd>

            <dt className="text-xs uppercase tracking-wider text-foreground-subtle">
              URL
            </dt>
            <dd>
              <a
                href={url}
                itemProp="url mainEntityOfPage"
                className="text-coral hover:text-coral/80 break-all"
              >
                {url}
              </a>
            </dd>

            <dt className="text-xs uppercase tracking-wider text-foreground-subtle">
              Published
            </dt>
            <dd>
              <time dateTime={datePublished} itemProp="datePublished">
                {formatDate(datePublished)}
              </time>
            </dd>

            <dt className="text-xs uppercase tracking-wider text-foreground-subtle">
              Last updated
            </dt>
            <dd>
              <time dateTime={lastUpdated} itemProp="dateModified">
                {formatDate(lastUpdated)}
              </time>
            </dd>

            {keyClaim && (
              <>
                <dt className="text-xs uppercase tracking-wider text-foreground-subtle">
                  Key claim
                </dt>
                <dd
                  itemProp="abstract"
                  className="text-off-white/90 leading-relaxed"
                >
                  {keyClaim}
                </dd>
              </>
            )}
          </dl>

          <div className="mt-4 pt-4 border-t border-white/5">
            <p className="text-xs uppercase tracking-wider text-foreground-subtle mb-2">
              Cite as (APA)
            </p>
            <p className="text-xs text-foreground-muted leading-relaxed break-words font-mono">
              {apa}
            </p>
          </div>
        </div>
      </details>
    </aside>
  );
}
