"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Badge, ScrollReveal } from "@/components/ui";
import { type SearchableItem, searchItems } from "@/lib/search";

type TabKey = "all" | "podcast" | "blog" | "guest" | "tool";

const TABS: { key: TabKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "podcast", label: "Episodes" },
  { key: "blog", label: "Blog" },
  { key: "guest", label: "Guests" },
  { key: "tool", label: "Tools" },
];

interface SiteSearchProps {
  items: SearchableItem[];
}

/** Format a date string to human-readable */
function formatDate(dateStr?: string): string {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** Icon by result type */
function TypeIcon({ type }: { type: SearchableItem["type"] }) {
  switch (type) {
    case "podcast":
      return (
        <svg
          className="w-5 h-5 text-coral shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z"
          />
        </svg>
      );
    case "blog":
      return (
        <svg
          className="w-5 h-5 text-coral shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
          />
        </svg>
      );
    case "tool":
      return (
        <svg
          className="w-5 h-5 text-coral shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15.75 15.75V18m-7.5-6.75h.008v.008H8.25v-.008zm0 2.25h.008v.008H8.25V13.5zm0 2.25h.008v.008H8.25v-.008zm0 2.25h.008v.008H8.25V18zm2.498-6.75h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V13.5zm0 2.25h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V18zm2.504-6.75h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V13.5zm0 2.25h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V18zm2.498-6.75h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V13.5zM8.25 6h7.5v2.25h-7.5V6zM12 2.25c-1.892 0-3.758.11-5.593.322C5.307 2.7 4.5 3.65 4.5 4.757V19.5a2.25 2.25 0 002.25 2.25h10.5a2.25 2.25 0 002.25-2.25V4.757c0-1.108-.806-2.057-1.907-2.185A48.507 48.507 0 0012 2.25z"
          />
        </svg>
      );
    case "guest":
      return (
        <svg
          className="w-5 h-5 text-coral shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
          />
        </svg>
      );
  }
}

/** Type label */
function typeLabel(type: SearchableItem["type"]): string {
  switch (type) {
    case "podcast":
      return "Episode";
    case "blog":
      return "Article";
    case "tool":
      return "Tool";
    case "guest":
      return "Guest";
  }
}

/** Build link for a search result */
function resultHref(item: SearchableItem): string {
  switch (item.type) {
    case "podcast":
      return `/podcast/${item.slug}`;
    case "blog":
      return `/blog/${item.slug}`;
    case "tool":
      return `/tools/${item.slug}`;
    case "guest":
      return `/guests/${item.slug}`;
  }
}

/** Subtitle / metadata line for a result */
function ResultMeta({ item }: { item: SearchableItem }) {
  const parts: string[] = [];

  if (item.type === "podcast") {
    if (item.episodeNumber) parts.push(`Ep. ${item.episodeNumber}`);
    if (item.guest) parts.push(`with ${item.guest}`);
    if (item.duration) parts.push(item.duration);
    if (item.publishDate) parts.push(formatDate(item.publishDate));
  } else if (item.type === "blog") {
    if (item.readTime) parts.push(item.readTime);
    if (item.publishDate) parts.push(formatDate(item.publishDate));
  } else if (item.type === "guest") {
    if (item.guestCredential) parts.push(item.guestCredential);
    if (item.episodeNumber)
      parts.push(
        `${item.episodeNumber} episode${item.episodeNumber !== 1 ? "s" : ""}`
      );
  } else if (item.type === "tool") {
    parts.push("Free calculator");
  }

  if (parts.length === 0) return null;

  return (
    <p className="text-sm text-foreground-subtle mt-1 line-clamp-1">
      {parts.join(" \u00B7 ")}
    </p>
  );
}

export function SiteSearch({ items }: SiteSearchProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inputRef = useRef<HTMLInputElement>(null);

  const initialQuery = searchParams.get("q") || "";
  const initialTab = (searchParams.get("tab") as TabKey) || "all";

  const [query, setQuery] = useState(initialQuery);
  const [activeTab, setActiveTab] = useState<TabKey>(
    TABS.some((t) => t.key === initialTab) ? initialTab : "all"
  );

  // Sync URL params
  const updateUrl = useCallback(
    (q: string, tab: TabKey) => {
      const params = new URLSearchParams();
      if (q.trim()) params.set("q", q.trim());
      if (tab !== "all") params.set("tab", tab);
      const qs = params.toString();
      router.replace(`/search${qs ? `?${qs}` : ""}`, { scroll: false });
    },
    [router]
  );

  // Debounced URL update
  useEffect(() => {
    const timeout = setTimeout(() => {
      updateUrl(query, activeTab);
    }, 300);
    return () => clearTimeout(timeout);
  }, [query, activeTab, updateUrl]);

  // Cmd+K global shortcut
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      }
      // Escape clears focus
      if (e.key === "Escape") {
        inputRef.current?.blur();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Auto-focus on mount
  useEffect(() => {
    // Small delay so the page hero animation is visible first
    const timer = setTimeout(() => inputRef.current?.focus(), 400);
    return () => clearTimeout(timer);
  }, []);

  // Filter + search
  const results = useMemo(() => {
    const searched = searchItems(items, query);
    if (activeTab === "all") return searched;
    return searched.filter((item) => item.type === activeTab);
  }, [items, query, activeTab]);

  // Counts per tab
  const counts = useMemo(() => {
    const searched = searchItems(items, query);
    const map: Record<TabKey, number> = {
      all: searched.length,
      podcast: 0,
      blog: 0,
      guest: 0,
      tool: 0,
    };
    for (const item of searched) {
      if (item.type in map) {
        map[item.type as TabKey]++;
      }
    }
    return map;
  }, [items, query]);

  const hasQuery = query.trim().length > 0;

  return (
    <div>
      {/* Search Input */}
      <div className="relative max-w-3xl mx-auto mb-10">
        {/* Search icon */}
        <svg
          className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground-subtle pointer-events-none"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
          />
        </svg>

        <input
          ref={inputRef}
          type="search"
          aria-label="Search the entire site"
          placeholder="Search episodes, articles, guests, tools..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="
            w-full bg-white/5 border border-white/10 rounded-2xl
            pl-14 pr-24 py-5
            text-off-white text-lg placeholder:text-foreground-subtle
            focus:border-coral focus:outline-none focus:ring-1 focus:ring-coral/30
            transition-all
          "
          style={{ transitionDuration: "var(--duration-fast)" }}
        />

        {/* Keyboard shortcut hint */}
        <div className="absolute right-5 top-1/2 -translate-y-1/2 hidden md:flex items-center gap-1 pointer-events-none">
          <kbd className="px-2 py-1 rounded-md bg-white/5 border border-white/10 text-xs text-foreground-subtle font-body">
            {typeof navigator !== "undefined" &&
            /Mac/.test(navigator.userAgent)
              ? "\u2318"
              : "Ctrl"}
          </kbd>
          <kbd className="px-2 py-1 rounded-md bg-white/5 border border-white/10 text-xs text-foreground-subtle font-body">
            K
          </kbd>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 justify-center mb-8">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-5 py-2.5 rounded-full text-sm font-body transition-all cursor-pointer ${
              activeTab === tab.key
                ? "bg-coral text-off-white shadow-[0_0_20px_rgba(241,99,99,0.2)]"
                : "bg-white/5 text-foreground-muted hover:bg-white/10 hover:text-off-white"
            }`}
            style={{ transitionDuration: "var(--duration-fast)" }}
          >
            {tab.label}
            {hasQuery && (
              <span className="ml-1.5 text-xs opacity-70">
                {counts[tab.key]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Results count */}
      {hasQuery && (
        <p className="text-sm text-foreground-subtle mb-8 text-center">
          {results.length} result{results.length !== 1 ? "s" : ""} for &ldquo;
          {query.trim()}&rdquo;
        </p>
      )}

      {/* Results */}
      {!hasQuery ? (
        /* Empty state — no query entered */
        <div className="text-center py-20">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/5 mb-6">
            <svg
              className="w-10 h-10 text-foreground-subtle"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
              />
            </svg>
          </div>
          <p className="text-foreground-muted text-lg mb-2">
            Search across everything
          </p>
          <p className="text-foreground-subtle text-sm max-w-md mx-auto">
            Find episodes, blog articles, guest profiles, and tools. Try
            searching for a topic like &ldquo;polarised training&rdquo; or a
            guest like &ldquo;Seiler&rdquo;.
          </p>
        </div>
      ) : results.length === 0 ? (
        /* No results */
        <div className="text-center py-20">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/5 mb-6">
            <svg
              className="w-10 h-10 text-foreground-subtle"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.182 16.318A4.486 4.486 0 0012.016 15a4.486 4.486 0 00-3.198 1.318M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z"
              />
            </svg>
          </div>
          <p className="text-foreground-muted text-lg mb-2">
            No results for &ldquo;{query.trim()}&rdquo;
          </p>
          <p className="text-foreground-subtle text-sm max-w-md mx-auto">
            Try different keywords, check the spelling, or browse by category
            using the tabs above.
          </p>
        </div>
      ) : (
        /* Results list */
        <div className="space-y-3 max-w-3xl mx-auto">
          {results.map((item, i) => (
            <ScrollReveal
              key={`${item.type}-${item.slug}`}
              direction="up"
              delay={Math.min(i * 0.03, 0.3)}
            >
              <Link
                href={resultHref(item)}
                className="
                  block p-5 md:p-6 bg-background-elevated rounded-xl
                  border border-white/5
                  hover:border-white/10 hover:shadow-[var(--shadow-card)] hover:-translate-y-0.5
                  transition-all group
                "
                style={{ transitionDuration: "var(--duration-normal)" }}
              >
                <div className="flex items-start gap-4">
                  {/* Type icon */}
                  <div className="mt-0.5">
                    <TypeIcon type={item.type} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-foreground-subtle font-body uppercase tracking-wider">
                        {typeLabel(item.type)}
                      </span>
                      <Badge pillar={item.pillar} />
                    </div>

                    <h3 className="font-heading text-lg md:text-xl text-off-white group-hover:text-coral transition-colors leading-tight">
                      {item.title.toUpperCase()}
                    </h3>

                    <ResultMeta item={item} />

                    {item.description && (
                      <p className="text-sm text-foreground-muted mt-2 line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>
                    )}
                  </div>

                  {/* Arrow */}
                  <svg
                    className="w-5 h-5 text-foreground-subtle group-hover:text-coral shrink-0 mt-1 transition-all group-hover:translate-x-0.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                    style={{ transitionDuration: "var(--duration-fast)" }}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8.25 4.5l7.5 7.5-7.5 7.5"
                    />
                  </svg>
                </div>
              </Link>
            </ScrollReveal>
          ))}
        </div>
      )}
    </div>
  );
}
