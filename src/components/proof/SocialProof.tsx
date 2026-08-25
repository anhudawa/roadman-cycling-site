import { getMemberReviews, type MemberReview } from "@/lib/member-reviews";

interface ReviewCardProps {
  review: MemberReview;
  preferShort?: boolean;
}

/** Star-free quote card. Matches the TestimonialBlock compact design so
 *  social-proof sections sit consistently alongside the rest of the
 *  site — name + location, no ratings, no third-party branding. */
function ReviewCard({ review, preferShort = false }: ReviewCardProps) {
  const text =
    preferShort && review.shortQuote ? review.shortQuote : review.quote;
  return (
    <figure className="flex flex-col h-full rounded-xl border border-white/10 bg-white/[0.03] p-6 md:p-7 m-0">
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
          {review.location}
        </p>
      </figcaption>
    </figure>
  );
}

interface SocialProofProps {
  /** Which review pool to draw from — podcast surfaces vs coaching
   *  surfaces vs everything. */
  audience: "podcast" | "coaching" | "mixed";
  /** Optional headline override. Defaults are tuned per audience. */
  heading?: string;
  /** Optional subhead override. Defaults are tuned per audience. */
  subheading?: string;
  /** Number of quote cards to show. */
  count?: number;
  /** Use shortQuote instead of quote in cards. Helpful in 3-up grids. */
  preferShort?: boolean;
  /** Pre-selected reviews. When provided, overrides automatic selection. */
  reviews?: MemberReview[];
  className?: string;
}

const DEFAULTS: Record<
  SocialProofProps["audience"],
  { heading: string; subheading: string }
> = {
  podcast: {
    heading: "WHAT LISTENERS SAY",
    subheading:
      "The Roadman Cycling Podcast — from listeners who took the time to write it down.",
  },
  coaching: {
    heading: "WHAT OUR MEMBERS SAY",
    subheading:
      "Real words from Not Done Yet members and Roadman Inner Circle athletes.",
  },
  mixed: {
    heading: "REAL RESULTS FROM REAL CYCLISTS",
    subheading:
      "Listeners, members, and coached athletes — in their own words.",
  },
};

/**
 * Generic social-proof block. Drop this on a page, pass `audience`, and
 * it picks contextually relevant member quotes and renders them as
 * star-free testimonial cards. Visual language matches the existing
 * TestimonialBlock so pages don't feel stitched together.
 *
 * Presentation only — no schema.org/Review markup is emitted, in line
 * with the site convention that narrative quotes without star ratings
 * stay out of structured data.
 */
export function SocialProof({
  audience,
  heading,
  subheading,
  count = 3,
  preferShort = true,
  reviews,
  className = "",
}: SocialProofProps) {
  const defaults = DEFAULTS[audience];
  const headlineCopy = heading ?? defaults.heading;
  const subCopy = subheading ?? defaults.subheading;

  const picked = reviews ?? getMemberReviews(audience, count);

  return (
    <div className={className}>
      <div className="text-center mb-8 md:mb-10">
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
      {picked.length > 0 && (
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
    </div>
  );
}
