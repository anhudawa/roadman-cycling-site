import { type Testimonial } from "@/lib/testimonials";

interface TestimonialBlockProps {
  testimonial: Testimonial;
  /** Layout density. "spotlight" = single hero quote with stat ladder.
   *  "compact" = inline quote card for 2-3 across grids. */
  variant?: "spotlight" | "compact";
  /** Use shortQuote when available — useful in tight grids */
  preferShort?: boolean;
  className?: string;
}

/**
 * Reusable testimonial block, sourced from the central library at
 * /src/lib/testimonials.ts. Keeps proof presentation consistent across
 * coaching, /apply, blog footer CTAs, persona landing pages, and the
 * new template components.
 *
 * Schema: testimonials are NOT marked up as schema.org/Review here —
 * Google requires `reviewRating` on every Review and we collect
 * narrative quotes, not star ratings. Adding empty Review objects
 * triggers structured-data spam policy. Re-add via a parent component
 * when ratings are collected.
 */
export function TestimonialBlock({
  testimonial,
  variant = "compact",
  preferShort = false,
  className = "",
}: TestimonialBlockProps) {
  const quote =
    preferShort && testimonial.shortQuote
      ? testimonial.shortQuote
      : testimonial.quote;

  if (variant === "spotlight") {
    return (
      <figure
        className={`
          relative rounded-2xl
          border border-coral/20
          bg-gradient-to-br from-coral/10 via-deep-purple/30 to-deep-purple/50
          px-6 py-6 md:px-10 md:py-7 text-left
          ${className}
        `}
      >
        <div className="flex flex-col md:flex-row md:items-center gap-5 md:gap-7">
          {testimonial.stat && (
            <div className="shrink-0 text-center md:text-left">
              <p
                className="font-heading text-coral leading-none"
                style={{ fontSize: "clamp(2.5rem, 5vw, 3.5rem)" }}
              >
                {testimonial.stat}
              </p>
              {testimonial.statLabel && (
                <p className="text-xs font-body tracking-widest text-foreground-subtle uppercase mt-1">
                  {testimonial.statLabel}
                </p>
              )}
            </div>
          )}
          {testimonial.stat && (
            <div className="h-px md:h-14 md:w-px bg-white/10 shrink-0" />
          )}
          <div>
            <blockquote className="text-off-white italic leading-relaxed text-base md:text-lg m-0">
              &ldquo;{quote}&rdquo;
            </blockquote>
            <figcaption className="text-foreground-subtle text-sm mt-3">
              <span className="text-off-white font-medium">
                {testimonial.name}
              </span>
              {testimonial.detail && <> · {testimonial.detail}</>}
            </figcaption>
          </div>
        </div>
      </figure>
    );
  }

  return (
    <figure
      className={`
        flex flex-col h-full rounded-xl border border-white/10
        bg-white/[0.03] p-6 md:p-7
        ${className}
      `}
    >
      {testimonial.tag && (
        <p className="font-heading text-coral text-[11px] tracking-[0.25em] mb-4">
          {testimonial.tag.toUpperCase()}
        </p>
      )}
      {testimonial.stat && (
        <p
          className="font-heading text-coral leading-none mb-3"
          style={{ fontSize: "clamp(1.75rem, 3vw, 2.5rem)" }}
        >
          {testimonial.stat}
          {testimonial.statLabel && (
            <span className="block text-[10px] font-body tracking-widest text-foreground-subtle uppercase mt-1">
              {testimonial.statLabel}
            </span>
          )}
        </p>
      )}
      <blockquote className="text-foreground-muted text-sm leading-relaxed flex-1 m-0">
        &ldquo;{quote}&rdquo;
      </blockquote>
      <figcaption className="mt-5 pt-4 border-t border-white/5">
        <p className="font-heading text-off-white text-sm tracking-wide leading-tight">
          {testimonial.name}
        </p>
        {testimonial.detail && (
          <p className="text-foreground-subtle text-xs mt-0.5 leading-snug">
            {testimonial.detail}
          </p>
        )}
      </figcaption>
    </figure>
  );
}
