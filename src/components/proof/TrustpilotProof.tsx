import {
  TRUSTPILOT,
  getTrustpilotReviews,
  type TrustpilotReview,
} from "@/lib/trustpilot";

/** Generic filled star icon. Uses the site's coral accent — no
 *  Trustpilot-trademarked green tiles or brand assets. */
function Star({ size = 18 }: { size?: number }) {
  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="#F16363"
    >
      <path d="M12 2l2.95 6.69L22 9.74l-5.5 4.93L18.18 22 12 18.27 5.82 22l1.68-7.33L2 9.74l7.05-1.05L12 2z" />
    </svg>
  );
}

interface RatingHeaderProps {
  align?: "left" | "center";
  /** When true, renders the score + count + Trustpilot link compactly
   *  with no eyebrow or surrounding heading copy. */
  bare?: boolean;
  /** When true, omits the "based on N reviews" suffix. The current
   *  review count (16) reads as weak alongside other proof points like
   *  100M+ podcast downloads, so PPC/cold-traffic surfaces hide it. */
  hideCount?: boolean;
}

/** Stars + numeric score + review count + link to Trustpilot. */
export function TrustpilotRating({
  align = "center",
  bare = false,
  hideCount = false,
}: RatingHeaderProps) {
  const alignClass = align === "center" ? "items-center text-center" : "items-start text-left";
  return (
    <div className={`flex flex-col ${alignClass} gap-2`}>
      {!bare && (
        <p className="font-heading text-coral text-[11px] tracking-[0.3em]">
          REVIEWED ON TRUSTPILOT
        </p>
      )}
      <div className={`flex items-center gap-1.5 ${align === "center" ? "justify-center" : ""}`}>
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} size={20} />
        ))}
      </div>
      <p className="text-off-white font-body text-sm leading-snug">
        <span className="font-heading text-2xl tracking-wide mr-2 align-middle">
          {TRUSTPILOT.rating.toFixed(1)}
        </span>
        {hideCount ? (
          <a
            href={TRUSTPILOT.profileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-foreground-muted hover:text-off-white underline-offset-2 hover:underline"
          >
            {TRUSTPILOT.tierLabel} on Trustpilot
          </a>
        ) : (
          <span className="text-foreground-muted">
            {TRUSTPILOT.tierLabel} · based on{" "}
            <a
              href={TRUSTPILOT.profileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-coral hover:text-coral/80 underline-offset-2 hover:underline"
            >
              {TRUSTPILOT.reviewCount} reviews on Trustpilot
            </a>
          </span>
        )}
      </p>
    </div>
  );
}

interface ReviewCardProps {
  review: TrustpilotReview;
  preferShort?: boolean;
}

function ReviewCard({ review, preferShort = false }: ReviewCardProps) {
  const text =
    preferShort && review.shortQuote ? review.shortQuote : review.quote;
  return (
    <figure className="flex flex-col h-full rounded-xl border border-white/10 bg-white/[0.03] p-6 md:p-7">
      <div className="flex items-center gap-1 mb-3">
        {Array.from({ length: review.rating }).map((_, i) => (
          <Star key={i} size={14} />
        ))}
      </div>
      {review.title && (
        <p className="font-heading text-off-white text-base md:text-lg tracking-wide leading-tight mb-3">
          {review.title}
        </p>
      )}
      <blockquote className="text-foreground-muted text-sm leading-relaxed flex-1 m-0">
        &ldquo;{text}&rdquo;
      </blockquote>
      <figcaption className="mt-5 pt-4 border-t border-white/5">
        <p className="font-heading text-off-white text-sm tracking-wide leading-tight">
          {review.author}
        </p>
        <p className="text-foreground-subtle text-xs mt-0.5 leading-snug">
          <a
            href={TRUSTPILOT.profileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground-muted underline-offset-2 hover:underline"
          >
            Trustpilot review
          </a>{" "}
          · {review.country}
        </p>
      </figcaption>
    </figure>
  );
}

interface TrustpilotProofProps {
  /** Which review pool to draw from — podcast surfaces vs coaching
   *  surfaces vs everything. */
  audience: "podcast" | "coaching" | "mixed";
  /** Optional headline override. Defaults are tuned per audience. */
  heading?: string;
  /** Optional subhead override. Defaults are tuned per audience. */
  subheading?: string;
  /** Number of quote cards to show. 0 hides the cards and renders only
   *  the rating header (useful as a compact strip). */
  count?: number;
  /** Use shortQuote instead of quote in cards. Helpful in 3-up grids. */
  preferShort?: boolean;
  /** Pre-selected reviews. When provided, overrides automatic selection. */
  reviews?: TrustpilotReview[];
  className?: string;
}

const DEFAULTS: Record<
  TrustpilotProofProps["audience"],
  { heading: string; subheading: string }
> = {
  podcast: {
    heading: "WHAT LISTENERS SAY",
    subheading:
      "The Roadman Cycling Podcast — rated 4.5 on Trustpilot by listeners who took the time to write it down.",
  },
  coaching: {
    heading: "WHAT MEMBERS SAY",
    subheading:
      "Coaching reviews from Not Done Yet members and 1:1 athletes — reviewed on Trustpilot.",
  },
  mixed: {
    heading: "RATED 4.5 ON TRUSTPILOT",
    subheading:
      "Listeners, members, and coached athletes — in their own words. Reviewed on Trustpilot.",
  },
};

/**
 * The one Trustpilot block. Drop this on a page, pass `audience`, and
 * it picks contextually correct reviews and renders them with the live
 * star rating. Visual language matches the existing TestimonialBlock so
 * pages don't feel stitched together.
 *
 * Schema: this component is presentation only. The aggregateRating and
 * Review JSON-LD live in `@/components/seo/TrustpilotSchema`. Keep them
 * decoupled so a page can opt into one without the other.
 */
export function TrustpilotProof({
  audience,
  heading,
  subheading,
  count = 3,
  preferShort = true,
  reviews,
  className = "",
}: TrustpilotProofProps) {
  const defaults = DEFAULTS[audience];
  const headlineCopy = heading ?? defaults.heading;
  const subCopy = subheading ?? defaults.subheading;

  const picked = reviews ?? getTrustpilotReviews(audience, count);

  return (
    <div className={className}>
      <div className="text-center mb-8 md:mb-10">
        <div className="mb-5">
          <TrustpilotRating align="center" />
        </div>
        <h2
          className="font-heading text-off-white tracking-tight"
          style={{ fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)" }}
        >
          {headlineCopy}
        </h2>
        {subCopy && (
          <p className="text-foreground-muted max-w-2xl mx-auto mt-3 text-sm md:text-base leading-relaxed">
            {subCopy}
          </p>
        )}
      </div>
      {count > 0 && picked.length > 0 && (
        <div
          className={`grid gap-4 ${
            picked.length === 1
              ? "max-w-2xl mx-auto"
              : picked.length === 2
                ? "grid-cols-1 md:grid-cols-2"
                : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
          }`}
        >
          {picked.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              preferShort={preferShort}
            />
          ))}
        </div>
      )}
      <div className="text-center mt-8">
        <a
          href={TRUSTPILOT.profileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="font-heading text-coral text-[11px] tracking-[0.3em] hover:text-coral/80"
        >
          READ ALL REVIEWS ON TRUSTPILOT →
        </a>
      </div>
    </div>
  );
}

/**
 * Inline pill version — just the stars, score, and count. Useful in
 * page headers, hero banners, or under CTAs where the full block is
 * too heavy.
 */
export function TrustpilotBadge({
  className = "",
  align = "center",
  hideCount = false,
}: {
  className?: string;
  align?: "left" | "center";
  hideCount?: boolean;
}) {
  return (
    <div className={className}>
      <TrustpilotRating align={align} bare hideCount={hideCount} />
    </div>
  );
}
