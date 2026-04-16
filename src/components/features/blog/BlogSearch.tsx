"use client";

import { Fragment, useState, useMemo, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui";
import { EmailCapture } from "@/components/features/conversion/EmailCapture";
import { type ContentPillar, CONTENT_PILLARS } from "@/types";

const INITIAL_POSTS_PER_PAGE = 24;
const FEATURED_POST_COUNT = 4;

interface BlogSearchItem {
  slug: string;
  title: string;
  excerpt: string;
  pillar: ContentPillar;
  publishDate: string;
  readTime: string;
  featuredImage?: string;
  keywords: string[];
}

interface BlogSearchProps {
  posts: BlogSearchItem[];
}

/** Topic filters — keyword-based filters that cut across pillars */
const TOPIC_FILTERS: Array<{
  id: string;
  label: string;
  match: (post: BlogSearchItem) => boolean;
}> = [
  {
    id: "mtb",
    label: "Mountain Biking",
    match: (p) => {
      const haystack = `${p.title} ${p.keywords.join(" ")} ${p.excerpt}`.toLowerCase();
      return /\bmtb\b|mountain.?bik|fork.?setup|suspension.?setup|dropper|trail.?rid|enduro|shock.?pressur|tyre.?pressure.?mtb|rostrevor|ballinastoe|mtb.?trail|mountain.?bike.?trail/.test(haystack);
    },
  },
  {
    id: "triathlon",
    label: "Triathlon",
    match: (p) => {
      const haystack = `${p.title} ${p.keywords.join(" ")} ${p.excerpt}`.toLowerCase();
      return /triath|ironman|70\.3|bike.?leg|tri.?bike/.test(haystack);
    },
  },
];

export function BlogSearch({ posts }: BlogSearchProps) {
  const [query, setQuery] = useState("");
  const [pillarFilter, setPillarFilter] = useState<string>("");
  const [topicFilter, setTopicFilter] = useState<string>("");
  const [visibleCount, setVisibleCount] = useState(INITIAL_POSTS_PER_PAGE);

  const isBrowsingAll = !query.trim() && !pillarFilter && !topicFilter;

  // The 4 most recent posts are the editorial picks (pinned via publishDate).
  // Hidden when any filter or search is active so the featured row stays
  // coherent rather than drifting off-topic.
  const featured = posts.slice(0, FEATURED_POST_COUNT);

  const filtered = useMemo(() => {
    let results = posts;

    if (pillarFilter) {
      results = results.filter((p) => p.pillar === pillarFilter);
    }

    if (topicFilter) {
      const topic = TOPIC_FILTERS.find((t) => t.id === topicFilter);
      if (topic) {
        results = results.filter(topic.match);
      }
    }

    if (query.trim()) {
      const terms = query
        .toLowerCase()
        .trim()
        .split(/\s+/)
        .filter((t) => t.length > 1);

      const scored = results.map((post) => {
        let score = 0;
        const titleLower = post.title.toLowerCase();
        const excerptLower = post.excerpt.toLowerCase();
        const keywordsLower = post.keywords.join(" ").toLowerCase();

        for (const term of terms) {
          if (titleLower.includes(term)) score += 10;
          if (keywordsLower.includes(term)) score += 5;
          if (excerptLower.includes(term)) score += 2;
          if (titleLower.split(/\s+/).includes(term)) score += 5;
        }

        return { post, score };
      });

      results = scored
        .filter((s) => s.score > 0)
        .sort((a, b) => b.score - a.score)
        .map((s) => s.post);
    }

    return results;
  }, [posts, query, pillarFilter, topicFilter]);

  // When browsing the unfiltered catalogue, drop the 4 featured posts from
  // the main grid so they don't duplicate the featured row above.
  const gridPool = isBrowsingAll
    ? filtered.slice(FEATURED_POST_COUNT)
    : filtered;
  const visible = gridPool.slice(0, visibleCount);
  const hasMore = visible.length < gridPool.length;

  // Reset pagination whenever filters change so the user doesn't see
  // more-than-expected (or an empty load-more button).
  useEffect(() => {
    setVisibleCount(INITIAL_POSTS_PER_PAGE);
  }, [query, pillarFilter, topicFilter]);

  return (
    <div>
      {/* Featured row — only shown when browsing the unfiltered catalogue */}
      {isBrowsingAll && featured.length > 0 && (
        <div className="mb-12">
          <div className="flex items-baseline justify-between mb-6 border-b border-white/10 pb-3">
            <h2 className="font-heading text-coral text-sm tracking-widest">
              FEATURED — LATEST EDITORIAL
            </h2>
            <span className="text-xs text-foreground-subtle">
              Pinned by the team
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {featured.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="
                  block bg-background-elevated rounded-lg border border-coral/20
                  overflow-hidden group
                  hover:border-coral/40 hover:shadow-[var(--shadow-card)] hover:-translate-y-0.5
                  transition-all h-full
                "
                style={{ transitionDuration: "var(--duration-normal)" }}
              >
                <div className="aspect-[16/9] relative bg-gradient-to-br from-deep-purple to-charcoal overflow-hidden">
                  {post.featuredImage && (
                    <Image
                      src={post.featuredImage}
                      alt={post.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                    />
                  )}
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge pillar={post.pillar} />
                    <span className="text-xs text-foreground-subtle">
                      {post.readTime}
                    </span>
                  </div>
                  <h3 className="font-heading text-base text-off-white group-hover:text-coral transition-colors leading-tight">
                    {post.title.toUpperCase()}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div className="mb-6">
        <input
          type="search"
          aria-label="Search articles"
          placeholder="Search articles..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="
            w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4
            text-off-white text-lg placeholder:text-foreground-subtle
            focus:border-coral focus:outline-none transition-colors
          "
          style={{ transitionDuration: "var(--duration-fast)" }}
        />
      </div>

      {/* Pillar Filters */}
      <div className="flex flex-nowrap overflow-x-auto gap-2 justify-center pb-2 -mx-5 px-5 md:flex-wrap md:overflow-visible md:pb-0 md:mx-0 md:px-0 mb-3" role="group" aria-label="Filter by pillar">
        <button
          onClick={() => { setPillarFilter(""); setTopicFilter(""); }}
          aria-pressed={!pillarFilter && !topicFilter}
          className={`px-4 py-2 rounded-full text-sm font-body transition-colors cursor-pointer whitespace-nowrap ${
            !pillarFilter && !topicFilter
              ? "bg-coral text-off-white"
              : "bg-white/5 text-foreground-muted hover:bg-white/10"
          }`}
        >
          All ({posts.length})
        </button>
        {(Object.keys(CONTENT_PILLARS) as ContentPillar[]).map((key) => {
          const count = posts.filter((p) => p.pillar === key).length;
          return (
            <button
              key={key}
              onClick={() => {
                setPillarFilter(pillarFilter === key ? "" : key);
                setTopicFilter("");
              }}
              aria-pressed={pillarFilter === key}
              className={`px-4 py-2 rounded-full text-sm font-body transition-colors cursor-pointer whitespace-nowrap ${
                pillarFilter === key
                  ? "bg-coral text-off-white"
                  : "bg-white/5 text-foreground-muted hover:bg-white/10"
              }`}
            >
              {CONTENT_PILLARS[key].label} ({count})
            </button>
          );
        })}
      </div>

      {/* Topic Filters */}
      <div className="flex flex-nowrap overflow-x-auto gap-2 justify-center pb-2 -mx-5 px-5 md:flex-wrap md:overflow-visible md:pb-0 md:mx-0 md:px-0 mb-8" role="group" aria-label="Filter by topic">
        {TOPIC_FILTERS.map((topic) => {
          const count = posts.filter(topic.match).length;
          if (count === 0) return null;
          return (
            <button
              key={topic.id}
              onClick={() => {
                setTopicFilter(topicFilter === topic.id ? "" : topic.id);
                setPillarFilter("");
              }}
              aria-pressed={topicFilter === topic.id}
              className={`px-4 py-2 rounded-full text-sm font-body transition-colors cursor-pointer border ${
                topicFilter === topic.id
                  ? "bg-coral text-off-white border-coral"
                  : "bg-white/5 text-foreground-muted hover:bg-white/10 border-white/10"
              }`}
            >
              {topic.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Section heading for non-featured posts when browsing all */}
      {isBrowsingAll && (
        <div className="flex items-baseline justify-between mb-4 border-b border-white/10 pb-3">
          <h2 className="font-heading text-coral text-sm tracking-widest">
            THE FULL CATALOGUE
          </h2>
          <span className="text-xs text-foreground-subtle">
            {gridPool.length} more article{gridPool.length === 1 ? "" : "s"}
          </span>
        </div>
      )}

      {/* Result count (only shown when filtered) */}
      {!isBrowsingAll && (
        <p className="text-sm text-foreground-subtle mb-6 text-center">
          {filtered.length} article{filtered.length !== 1 ? "s" : ""}
          {query && ` matching "${query}"`}
        </p>
      )}

      {/* Posts Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-foreground-muted text-lg">
            No articles found. Try a different search or filter.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {visible.map((post, i) => (
              <Fragment key={post.slug}>
                <Link
                  href={`/blog/${post.slug}`}
                  className="
                    block bg-background-elevated rounded-lg border border-white/5
                    overflow-hidden group
                    hover:border-white/10 hover:shadow-[var(--shadow-card)] hover:-translate-y-0.5
                    transition-all h-full
                  "
                  style={{ transitionDuration: "var(--duration-normal)" }}
                >
                  <div className="aspect-[16/9] relative bg-gradient-to-br from-deep-purple to-charcoal overflow-hidden">
                    {post.featuredImage && (
                      <Image
                        src={post.featuredImage}
                        alt={post.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    )}
                  </div>

                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <Badge pillar={post.pillar} />
                      <span className="text-xs text-foreground-subtle">
                        {post.readTime}
                      </span>
                    </div>

                    <h3 className="font-heading text-xl text-off-white mb-2 group-hover:text-coral transition-colors leading-tight">
                      {post.title.toUpperCase()}
                    </h3>

                    <p className="text-sm text-foreground-muted leading-relaxed line-clamp-3">
                      {post.excerpt}
                    </p>

                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-xs text-foreground-subtle">
                        {new Date(post.publishDate).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                      <span className="text-coral text-sm font-body font-medium">
                        Read &rarr;
                      </span>
                    </div>
                  </div>
                </Link>
                {/* Inline Saturday Spin capture after the 9th card. Spans
                    the full row on desktop (3-col grid) — invites attention
                    without feeling like a modal. */}
                {isBrowsingAll && i === 8 && (
                  <div className="md:col-span-2 lg:col-span-3 rounded-xl border border-coral/20 bg-gradient-to-br from-coral/10 via-deep-purple/40 to-charcoal p-6 md:p-8">
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                      <div className="flex-1">
                        <p className="font-heading text-coral text-xs tracking-widest mb-2">
                          THE SATURDAY SPIN
                        </p>
                        <h3 className="font-heading text-off-white text-xl md:text-2xl mb-2">
                          Get the week&apos;s training takeaways in one email.
                        </h3>
                        <p className="text-foreground-muted text-sm">
                          1,900+ serious cyclists. What worked this week, what
                          the pros did differently, and how to apply it.
                        </p>
                      </div>
                      <div className="w-full md:w-80 shrink-0">
                        <EmailCapture
                          variant="minimal"
                          source="blog-inline"
                          buttonText="SUBSCRIBE"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </Fragment>
            ))}
          </div>

          {/* Load more */}
          {hasMore && (
            <div className="mt-10 text-center">
              <button
                type="button"
                onClick={() =>
                  setVisibleCount((c) => c + INITIAL_POSTS_PER_PAGE)
                }
                className="
                  font-heading text-sm tracking-wider
                  bg-white/5 hover:bg-white/10 text-off-white
                  px-8 py-3 rounded-md transition-colors
                  border border-white/10 hover:border-coral/30
                "
                style={{ transitionDuration: "var(--duration-fast)" }}
              >
                LOAD MORE ({gridPool.length - visible.length} REMAINING)
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
