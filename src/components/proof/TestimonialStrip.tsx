import { MEMBER_REVIEWS, type MemberReview } from "@/lib/member-reviews";

/**
 * Compact social-proof strip of 3-4 short member quotes, sourced from the
 * verified quotes in `src/lib/member-reviews.ts` (the same single source
 * of truth behind `SocialProof` and `TestimonialBlock`). Visual language
 * matches those existing testimonial cards: star-free quote cards, name +
 * context caption, no third-party branding.
 *
 * Use this on pages that want a lightweight, self-contained proof strip;
 * prefer `SocialProof`/`TestimonialBlock` where richer testimonial layout
 * is called for.
 */

interface TestimonialStripProps {
  /** Optional heading override. */
  heading?: string;
  /** Optional subheading override. */
  subheading?: string;
  /** Number of quotes to show (3-4 recommended). */
  count?: number;
  /**
   * Hand-picked review ids from MEMBER_REVIEWS. Falls back to the first
   * `count` reviews tagged for general/coaching surfaces.
   */
  reviewIds?: string[];
  className?: string;
}

function pickReviews(count: number, reviewIds?: string[]): MemberReview[] {
  if (reviewIds?.length) {
    return reviewIds
      .map((id) => MEMBER_REVIEWS.find((r) => r.id === id))
      .filter((r): r is MemberReview => r !== undefined)
      .slice(0, count);
  }
  return MEMBER_REVIEWS.filter(
    (r) => r.audience === "both" || r.audience === "general"
  ).slice(0, count);
}

export function TestimonialStrip({
  heading = "WHAT MEMBERS SAY",
  subheading,
  count = 4,
  reviewIds,
  className = "",
}: TestimonialStripProps) {
  const quotes = pickReviews(count, reviewIds);

  return (
    <div className={className}>
      <div className="text-center mb-8 md:mb-10">
        <h2
          className="font-heading text-off-white tracking-tight"
          style={{ fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)" }}
        >
          {heading}
        </h2>
        {subheading && (
          <p className="text-foreground-muted max-w-2xl mx-auto mt-3 text-sm md:text-base leading-relaxed">
            {subheading}
          </p>
        )}
      </div>
      <div
        className={`grid gap-4 ${
          quotes.length === 1
            ? "max-w-2xl mx-auto"
            : quotes.length === 2
              ? "grid-cols-1 md:grid-cols-2"
              : quotes.length === 3
                ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                : "grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
        }`}
      >
        {quotes.map((review) => (
          <figure
            key={review.id}
            className="flex flex-col h-full rounded-xl border border-white/10 bg-white/[0.03] p-6 m-0"
          >
            <blockquote className="text-foreground-muted text-sm leading-relaxed flex-1 m-0">
              &ldquo;{review.shortQuote ?? review.quote}&rdquo;
            </blockquote>
            <figcaption className="mt-5 pt-4 border-t border-white/5">
              <p className="font-heading text-off-white text-sm tracking-wide leading-tight">
                {review.author}
              </p>
              <p className="text-foreground-subtle text-xs mt-0.5 leading-snug">
                {review.location}
              </p>
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}
