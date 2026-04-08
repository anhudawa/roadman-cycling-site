"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui";
import { type ContentPillar, CONTENT_PILLARS } from "@/types";

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

  return (
    <div>
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

      {/* Result count */}
      <p className="text-sm text-foreground-subtle mb-6 text-center">
        {filtered.length} article{filtered.length !== 1 ? "s" : ""}
        {query && ` matching "${query}"`}
      </p>

      {/* Posts Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-foreground-muted text-lg">
            No articles found. Try a different search or filter.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((post) => (
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

                <h2 className="font-heading text-xl text-off-white mb-2 group-hover:text-coral transition-colors leading-tight">
                  {post.title.toUpperCase()}
                </h2>

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
          ))}
        </div>
      )}
    </div>
  );
}
