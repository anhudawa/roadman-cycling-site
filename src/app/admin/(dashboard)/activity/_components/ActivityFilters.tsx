"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { ALL_ACTIVITY_TYPES } from "@/lib/crm/activity-feed";

interface Props {
  initialTypes: string[];
  initialAuthor: string;
  initialSearch: string;
  initialAfter: string;
  initialBefore: string;
  authors: string[];
  currentUserSlug: string;
}

export function ActivityFilters({
  initialTypes,
  initialAuthor,
  initialSearch,
  initialAfter,
  initialBefore,
  authors,
  currentUserSlug,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();
  const [search, setSearch] = useState(initialSearch);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function pushParams(mutate: (p: URLSearchParams) => void) {
    const params = new URLSearchParams(searchParams.toString());
    mutate(params);
    params.delete("offset");
    startTransition(() => router.push(`/admin/activity?${params.toString()}`));
  }

  function toggleType(type: string) {
    pushParams((p) => {
      const current = p.getAll("type");
      p.delete("type");
      if (current.includes(type)) {
        for (const t of current) if (t !== type) p.append("type", t);
      } else {
        for (const t of current) p.append("type", t);
        p.append("type", type);
      }
    });
  }

  function setAuthor(value: string) {
    pushParams((p) => {
      if (value) p.set("author", value);
      else p.delete("author");
    });
  }

  function setDate(key: "after" | "before", value: string) {
    pushParams((p) => {
      if (value) p.set(key, value);
      else p.delete(key);
    });
  }

  // Debounce search input
  useEffect(() => {
    if (search === initialSearch) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      pushParams((p) => {
        if (search.trim()) p.set("search", search.trim());
        else p.delete("search");
      });
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const hasFilters =
    initialTypes.length > 0 ||
    !!initialAuthor ||
    !!initialSearch ||
    !!initialAfter ||
    !!initialBefore;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <input
          type="search"
          placeholder="Search title or body..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-3 py-2 text-sm bg-background-elevated border border-white/10 text-off-white rounded focus-ring focus:border-[var(--color-border-focus)] min-w-[240px]"
        />
        <select
          value={initialAuthor}
          onChange={(e) => setAuthor(e.target.value)}
          className="px-3 py-2 text-sm bg-background-elevated border border-white/10 text-off-white rounded focus-ring focus:border-[var(--color-border-focus)]"
        >
          <option value="">All authors</option>
          {currentUserSlug && (
            <option value={currentUserSlug}>Me ({currentUserSlug})</option>
          )}
          {authors
            .filter((a) => a !== currentUserSlug)
            .map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
        </select>
        <label className="flex items-center gap-1 text-xs text-foreground-muted">
          From
          <input
            type="date"
            value={initialAfter}
            onChange={(e) => setDate("after", e.target.value)}
            className="px-2 py-2 text-sm bg-background-elevated border border-white/10 text-off-white rounded focus-ring focus:border-[var(--color-border-focus)]"
          />
        </label>
        <label className="flex items-center gap-1 text-xs text-foreground-muted">
          To
          <input
            type="date"
            value={initialBefore}
            onChange={(e) => setDate("before", e.target.value)}
            className="px-2 py-2 text-sm bg-background-elevated border border-white/10 text-off-white rounded focus-ring focus:border-[var(--color-border-focus)]"
          />
        </label>
        {hasFilters && (
          <button
            type="button"
            onClick={() => startTransition(() => router.push("/admin/activity"))}
            className="text-xs text-coral hover:underline"
          >
            Clear filters
          </button>
        )}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {ALL_ACTIVITY_TYPES.map((t) => {
          const active = initialTypes.includes(t);
          return (
            <button
              key={t}
              type="button"
              onClick={() => toggleType(t)}
              className={`px-2 py-1 text-[11px] rounded border transition ${
                active
                  ? "bg-coral/15 text-coral border-coral/30"
                  : "bg-background-elevated text-foreground-subtle border-white/10 hover:border-[var(--color-border-strong)]"
              }`}
            >
              {t}
            </button>
          );
        })}
      </div>
    </div>
  );
}
