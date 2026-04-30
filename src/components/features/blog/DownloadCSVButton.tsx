export interface DownloadCSVButtonProps {
  /** Static href for the CSV file (e.g. /data/age-group-ftp-benchmarks-2026.csv). */
  href: string;
  /** Filename used by the browser when saving (suggested via the download attr). */
  filename: string;
  /** Visible label. Defaults to "DOWNLOAD CSV". */
  label?: string;
  /** Short description of what's in the file (e.g. "Men's & women's W/kg bands"). */
  description?: string;
}

/**
 * Renders a download link to a static CSV inside `/public/data/`. SSR-safe,
 * no JS required — uses an `<a download>` so journalists, coaches and AI
 * crawlers can grab the underlying numbers behind a Roadman report directly.
 */
export function DownloadCSVButton({
  href,
  filename,
  label = "DOWNLOAD CSV",
  description,
}: DownloadCSVButtonProps) {
  return (
    <div className="not-prose my-8 rounded-xl border border-white/10 bg-white/[0.03] p-5 md:p-6">
      <p className="font-heading text-coral text-xs tracking-[0.3em] mb-3">
        DOWNLOAD THE DATA
      </p>
      {description && (
        <p className="text-sm text-foreground-muted leading-relaxed mb-4">
          {description}
        </p>
      )}
      <a
        href={href}
        download={filename}
        className="
          inline-flex items-center gap-2 rounded-md
          bg-coral hover:bg-coral-hover
          text-off-white font-heading text-xs tracking-wider
          px-4 py-2 transition-colors
        "
        style={{ transitionDuration: "var(--duration-fast)" }}
      >
        {label}
        <span aria-hidden="true">↓</span>
      </a>
      <p className="mt-3 text-xs text-foreground-subtle">
        CSV · Free to use with attribution to Roadman Cycling.
      </p>
    </div>
  );
}
