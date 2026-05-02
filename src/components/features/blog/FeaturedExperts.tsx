import Link from "next/link";
import { getEntityBySlug } from "@/lib/entities";

interface FeaturedExpertsProps {
  /** Entity slugs that match `content/entities/*.mdx` files. */
  slugs: string[];
}

/**
 * Featured-experts strip rendered near the top of a blog post.
 *
 * Drives a bidirectional link between the article and the
 * `/entity/[slug]` pages of the experts whose work the article leans
 * on. Sits in the top 30% of the page so the link equity (and the
 * AEO/SGE entity signal) lands above the fold. Silently drops any
 * slug without a matching entity MDX file so a typo in frontmatter
 * never crashes the page.
 *
 * Pairs with the `mentions` Person @ids the blog template emits in
 * Article JSON-LD — the visible UI and the schema name the same
 * entities at the same URLs.
 */
export function FeaturedExperts({ slugs }: FeaturedExpertsProps) {
  const entities = slugs
    .map((s) => getEntityBySlug(s))
    .filter((e): e is NonNullable<ReturnType<typeof getEntityBySlug>> => e !== null);
  if (entities.length === 0) return null;

  return (
    <aside
      className="rounded-xl border border-coral/20 bg-gradient-to-br from-coral/5 via-deep-purple/30 to-charcoal p-5 md:p-6 mb-8"
      aria-label="Featured experts"
    >
      <p className="font-heading text-coral text-xs tracking-widest mb-3">
        FEATURED EXPERTS
      </p>
      <p className="text-sm text-foreground-muted mb-4 leading-relaxed">
        The work behind this article ties back to the people Anthony has
        had on the podcast. Tap through for the full picture of what each
        of them is on the record for.
      </p>
      <div className="grid sm:grid-cols-2 gap-3">
        {entities.map((e) => (
          <Link
            key={e.slug}
            href={`/entity/${e.slug}`}
            className="block rounded-lg border border-white/10 bg-white/[0.03] hover:border-coral/40 hover:bg-coral/5 p-3 transition-all group"
          >
            <p className="font-heading text-off-white group-hover:text-coral transition-colors text-sm tracking-wide mb-1">
              {e.name.toUpperCase()}
            </p>
            <p className="text-xs text-foreground-subtle leading-snug">
              {e.jobTitle}
            </p>
          </Link>
        ))}
      </div>
    </aside>
  );
}
