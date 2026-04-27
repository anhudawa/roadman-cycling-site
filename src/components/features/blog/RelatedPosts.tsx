import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui";
import { isGenericImage } from "@/lib/blog-images";
import type { BlogPostMeta } from "@/lib/blog";

interface RelatedPostsProps {
  posts: BlogPostMeta[];
  className?: string;
}

export function RelatedPosts({ posts, className = "" }: RelatedPostsProps) {
  if (posts.length === 0) return null;

  return (
    <div className={className}>
      <h3 className="font-heading text-2xl text-off-white mb-6 text-center">
        KEEP READING
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {posts.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="
              block bg-background-elevated rounded-lg border border-white/5
              overflow-hidden group
              hover:border-white/10 hover:shadow-[var(--shadow-card)] hover:-translate-y-0.5
              transition-all h-full
            "
            style={{ transitionDuration: "var(--duration-normal)" }}
          >
            <div className="aspect-[16/9] relative bg-gradient-to-br from-deep-purple/40 to-charcoal/40 overflow-hidden">
              {(() => {
                const useSatori = isGenericImage(post.featuredImage);
                const src = useSatori
                  ? `/api/og/blog-hero?slug=${encodeURIComponent(post.slug)}`
                  : post.featuredImage;
                if (!src) return null;
                return (
                  <Image
                    src={src}
                    alt={post.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, 33vw"
                    unoptimized={useSatori}
                  />
                );
              })()}
            </div>

            <div className="p-5">
              <div className="flex items-center gap-3 mb-2">
                <Badge pillar={post.pillar} />
                <span className="text-xs text-foreground-subtle">
                  {post.readTime}
                </span>
              </div>

              <h4 className="font-heading text-lg text-off-white mb-1 group-hover:text-coral transition-colors leading-tight">
                {post.title.toUpperCase()}
              </h4>

              <p className="text-sm text-foreground-muted leading-relaxed line-clamp-3">
                {post.excerpt}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
