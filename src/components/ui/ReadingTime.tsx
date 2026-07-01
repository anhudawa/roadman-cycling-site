interface ReadingTimeProps {
  /** The reading time string from the reading-time package, e.g. "5 min read". */
  time: string;
  className?: string;
}

/**
 * Displays the estimated reading time for a blog post.
 *
 * Renders a clock icon + reading-time string. Designed for dark backgrounds
 * (charcoal / deep-purple hero sections).
 *
 * The actual calculation lives in `src/lib/blog.ts` via the `reading-time`
 * package (~238 wpm average). This component is purely presentational.
 */
export function ReadingTime({ time, className = "" }: ReadingTimeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-sm text-foreground-muted ${className}`}
      aria-label={`Estimated reading time: ${time}`}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-3.5 h-3.5 shrink-0"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
      {time}
    </span>
  );
}
