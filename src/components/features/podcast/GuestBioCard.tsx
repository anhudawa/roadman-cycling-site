import Link from "next/link";

interface GuestBioCardProps {
  name: string;
  slug: string;
  credential?: string;
  bio?: string;
  knowsAbout?: string[];
  sameAs?: string[];
  className?: string;
}

/**
 * Map a sameAs URL host to a short label. Keeps the chip row scannable
 * — "Wikipedia / Strava / X" reads better than long pasted URLs.
 */
function labelForUrl(url: string): string {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    if (host === "en.wikipedia.org" || host.endsWith(".wikipedia.org"))
      return "Wikipedia";
    if (host === "wikidata.org" || host === "www.wikidata.org")
      return "Wikidata";
    if (host === "procyclingstats.com") return "ProCyclingStats";
    if (host === "strava.com") return "Strava";
    if (host === "instagram.com") return "Instagram";
    if (host === "x.com" || host === "twitter.com") return "X";
    if (host === "youtube.com") return "YouTube";
    if (host === "facebook.com") return "Facebook";
    if (host === "linkedin.com") return "LinkedIn";
    return host;
  } catch {
    return "Profile";
  }
}

/**
 * Episode-page guest card. Shows the guest's credential, an optional
 * bio, the topics they're known for, and verified external profiles.
 *
 * The whole card links through to `/guests/<slug>` which carries the
 * canonical Person schema — this card surfaces the same signals
 * inline so listeners get context without leaving the episode.
 */
export function GuestBioCard({
  name,
  slug,
  credential,
  bio,
  knowsAbout,
  sameAs,
  className = "",
}: GuestBioCardProps) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2);

  return (
    <article
      aria-label={`About ${name}`}
      className={`rounded-xl border border-white/5 bg-background-elevated p-5 md:p-6 ${className}`}
    >
      <div className="flex items-start gap-4">
        <div
          aria-hidden
          className="w-14 h-14 rounded-full bg-purple/40 border border-purple/30 flex items-center justify-center shrink-0"
        >
          <span className="font-heading text-lg text-off-white">
            {initials}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <Link
            href={`/guests/${slug}`}
            className="block group"
          >
            <p className="font-heading text-lg text-off-white group-hover:text-coral transition-colors leading-tight">
              {name.toUpperCase()}
            </p>
            {credential && (
              <p className="text-sm text-foreground-muted mt-0.5">
                {credential}
              </p>
            )}
          </Link>
        </div>
        <Link
          href={`/guests/${slug}`}
          className="text-coral text-xs font-heading tracking-wider shrink-0 hidden sm:inline-flex items-center gap-1 hover:opacity-80 transition-opacity"
        >
          PROFILE →
        </Link>
      </div>

      {bio && (
        <p className="text-sm text-foreground-muted leading-relaxed mt-4">
          {bio}
        </p>
      )}

      {knowsAbout && knowsAbout.length > 0 && (
        <div className="mt-4">
          <p className="text-[10px] uppercase tracking-widest text-foreground-subtle mb-2">
            Knows about
          </p>
          <div className="flex flex-wrap gap-1.5">
            {knowsAbout.map((k) => (
              <span
                key={k}
                className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-xs text-foreground-muted"
              >
                {k}
              </span>
            ))}
          </div>
        </div>
      )}

      {sameAs && sameAs.length > 0 && (
        <div className="mt-4">
          <p className="text-[10px] uppercase tracking-widest text-foreground-subtle mb-2">
            Verified profiles
          </p>
          <div className="flex flex-wrap gap-1.5">
            {sameAs.map((url) => (
              <a
                key={url}
                href={url}
                target="_blank"
                rel="nofollow noopener noreferrer"
                className="inline-flex items-center gap-1 rounded-md border border-white/10 bg-white/[0.04] hover:border-coral/40 hover:bg-coral/[0.06] px-2.5 py-1 text-xs text-foreground-muted hover:text-coral transition-colors"
              >
                {labelForUrl(url)}
                <span aria-hidden className="text-coral/70">↗</span>
              </a>
            ))}
          </div>
        </div>
      )}
    </article>
  );
}
