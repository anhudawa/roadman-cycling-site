import Link from "next/link";

const SKOOL_URL = "https://www.skool.com/roadmancycling";

export interface ToolNextStepsPost {
  slug: string;
  title: string;
  excerpt: string;
}

interface ToolNextStepsProps {
  /**
   * Resolved posts to feature (2-3 recommended). This component is
   * presentational and client-safe — resolve slugs to metadata in a
   * server component (see the run-ride-converter page for the pattern:
   * `getTopicBySlug`/`getPostBySlug` in a server page, resolved data
   * passed down as props).
   */
  posts: ToolNextStepsPost[];
  /** Optional heading override. */
  heading?: string;
  /** Optional CTA copy override. */
  ctaCopy?: string;
  /** data-track id for the CTA click. */
  dataTrack?: string;
  className?: string;
}

/**
 * Post-result content recommendations + community CTA, dropped in after a
 * tool's results section. Renders 2-3 relevant articles and a Skool CTA —
 * so every calculator on the site can point a rider who just got their
 * number toward the next thing to read and the community that builds a
 * plan around it.
 */
export function ToolNextSteps({
  posts,
  heading = "WHAT TO DO NEXT",
  ctaCopy = "Get structured training plans built on these numbers",
  dataTrack,
  className = "",
}: ToolNextStepsProps) {
  const shown = posts.slice(0, 3);

  return (
    <div className={className}>
      {shown.length > 0 && (
        <div className="mt-8">
          <h3 className="font-heading text-lg text-off-white mb-4">
            {heading}
          </h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {shown.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="block rounded-lg border border-white/5 bg-background-elevated p-4 hover:border-coral/30 transition-colors"
              >
                <p className="font-heading text-off-white text-sm leading-snug mb-1.5">
                  {post.title}
                </p>
                <p className="text-foreground-muted text-xs leading-relaxed line-clamp-2">
                  {post.excerpt}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8 rounded-2xl border border-coral/30 bg-gradient-to-br from-coral/10 via-deep-purple/40 to-charcoal p-6 md:p-8 text-center">
        <p className="font-heading text-coral text-xs tracking-widest mb-2">
          WANT A PLAN BUILT AROUND YOUR NUMBERS?
        </p>
        <p className="text-off-white font-heading text-lg md:text-xl mb-5">
          {ctaCopy}
        </p>
        <a
          href={SKOOL_URL}
          target="_blank"
          rel="noopener noreferrer"
          data-track={dataTrack}
          className="inline-flex items-center justify-center gap-2 font-heading tracking-wider uppercase rounded-md bg-coral text-off-white hover:bg-coral/90 px-6 py-3 text-sm transition-all"
        >
          Join Roadman on Skool
        </a>
      </div>
    </div>
  );
}
