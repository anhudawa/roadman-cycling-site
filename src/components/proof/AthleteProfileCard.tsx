import { type ReactNode } from "react";

export interface AthleteProfile {
  name: string;
  /** Sub-line under the name, e.g. "52yo shift worker · Ireland" */
  detail?: string;
  /** Short headline result, e.g. "FTP 230w → 265w" */
  headline?: string;
  /** Optional single big stat, e.g. "+90w" */
  stat?: string;
  /** Optional stat label, e.g. "FTP gain" */
  statLabel?: string;
  /** Persona / category tag chip, e.g. "MASTERS PLATEAU" */
  tag?: string;
  /** Profile image (square, will be cropped to circle) */
  imageSrc?: string;
}

interface AthleteProfileCardProps extends AthleteProfile {
  children?: ReactNode;
  className?: string;
}

/**
 * Reusable athlete profile card for the proof/case-study modules.
 *
 * Sized for a 3-up grid on desktop, full-width on mobile. Renders a
 * single big stat + headline + tag + optional quote/body. Designed to
 * sit inside <ProofModule> or stand alone on coaching template pages.
 *
 * Avoid putting more than ~120 chars of body text — these are scanning
 * units, not articles.
 */
export function AthleteProfileCard({
  name,
  detail,
  headline,
  stat,
  statLabel,
  tag,
  imageSrc,
  children,
  className = "",
}: AthleteProfileCardProps) {
  return (
    <article
      className={`
        relative flex flex-col h-full rounded-xl
        border border-white/10 bg-white/[0.03]
        p-6 md:p-7
        ${className}
      `}
    >
      {tag && (
        <p className="font-heading text-coral text-[11px] tracking-[0.25em] mb-4">
          {tag.toUpperCase()}
        </p>
      )}

      {stat && (
        <div className="mb-5">
          <p
            className="font-heading text-coral leading-none"
            style={{ fontSize: "clamp(2.25rem, 4vw, 3rem)" }}
          >
            {stat}
          </p>
          {statLabel && (
            <p className="text-[11px] font-body tracking-widest text-foreground-subtle uppercase mt-1">
              {statLabel}
            </p>
          )}
        </div>
      )}

      {headline && (
        <p className="font-heading text-off-white text-base md:text-lg tracking-wide mb-3">
          {headline}
        </p>
      )}

      {children && (
        <div className="text-foreground-muted text-sm leading-relaxed mb-5">
          {children}
        </div>
      )}

      <div className="mt-auto flex items-center gap-3 pt-4 border-t border-white/5">
        {imageSrc && (
          <span className="relative inline-block w-9 h-9 rounded-full overflow-hidden border border-white/10 bg-white/5 shrink-0">
            {/* Plain <img> rather than next/image so cards work as
                drop-ins on any page without needing a remote-host
                allowlist update. Profile images are tiny (≤40px) and
                already optimised. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageSrc}
              alt=""
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover"
            />
          </span>
        )}
        <div>
          <p className="font-heading text-off-white text-sm tracking-wide leading-tight">
            {name}
          </p>
          {detail && (
            <p className="text-foreground-subtle text-xs mt-0.5 leading-snug">
              {detail}
            </p>
          )}
        </div>
      </div>
    </article>
  );
}
