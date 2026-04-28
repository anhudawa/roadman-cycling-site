import Link from "next/link";
import { Badge } from "@/components/ui";
import {
  getRelatedContent,
  type ContentType,
  type ScoredContent,
} from "@/lib/related";
import { type ContentPillar } from "@/types";

interface RelatedContentProps {
  currentSlug: string;
  currentType: ContentType;
  pillar: ContentPillar;
  keywords: string[];
  limit?: number;
  className?: string;
}

/**
 * Cross-content related content section.
 * Shows a mix of blog posts and podcast episodes scored by pillar + keyword overlap.
 */
export function RelatedContent({
  currentSlug,
  currentType,
  pillar,
  keywords,
  limit = 3,
  className = "",
}: RelatedContentProps) {
  const items = getRelatedContent(
    { currentSlug, currentType, pillar, keywords },
    limit
  );

  if (items.length === 0) return null;

  return (
    <div className={className}>
      <h3 className="font-heading text-2xl text-off-white mb-6 text-center">
        RELATED CONTENT
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {items.map((item) => (
          <RelatedCard key={`${item.type}-${item.slug}`} item={item} />
        ))}
      </div>
    </div>
  );
}

function RelatedCard({ item }: { item: ScoredContent }) {
  return (
    <Link
      href={item.href}
      className="
        block bg-background-elevated rounded-lg border border-white/5
        overflow-hidden group
        hover:border-white/10 hover:shadow-[var(--shadow-card)] hover:-translate-y-0.5
        transition-all h-full
      "
      style={{ transitionDuration: "var(--duration-normal)" }}
    >
      {/* Type indicator strip */}
      <div className="px-5 pt-4 pb-0 flex items-center gap-2">
        <span className="text-[10px] uppercase tracking-widest font-heading text-foreground-subtle">
          {item.type === "blog" ? "Article" : "Episode"}
        </span>
      </div>

      <div className="p-5 pt-3">
        <div className="flex items-center gap-3 mb-2">
          <Badge pillar={item.pillar} />
          <span className="text-xs text-foreground-subtle">
            {item.type === "blog" && item.readTime}
            {item.type === "podcast" && item.duration}
          </span>
        </div>

        <h4 className="font-heading text-lg text-off-white mb-2 group-hover:text-coral transition-colors leading-tight">
          {item.title.toUpperCase()}
        </h4>

        <p className="text-sm text-foreground-muted leading-relaxed line-clamp-2">
          {item.description}
        </p>

        {item.type === "podcast" && item.guest && (
          <p className="text-xs text-foreground-subtle mt-2">
            with {item.guest}
          </p>
        )}
      </div>
    </Link>
  );
}
