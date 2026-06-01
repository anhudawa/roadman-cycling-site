"use client";

import { useEffect, useRef, useState } from "react";

interface WeekChecklistProps {
  moduleSlug: string;
  items: readonly string[];
  /** Server-persisted tick state (source of truth across devices). */
  initialChecked?: boolean[];
}

/**
 * Per-module checklist. Ticked state is persisted server-side (scoped to the
 * enrollment) so it survives a device/browser change; localStorage is kept
 * as a fast offline cache. Distinct from `method_progress`, which tracks
 * whole-module completion rather than per-task ticks.
 *
 * The initial render uses `initialChecked` (from the server) so there's no
 * hydration mismatch. On mount we adopt any newer offline localStorage state
 * if the server had nothing saved (covers riders from before this synced).
 */
export function WeekChecklist({
  moduleSlug,
  items,
  initialChecked,
}: WeekChecklistProps) {
  const storageKey = `method:checklist:${moduleSlug}`;
  const seed =
    initialChecked && initialChecked.length === items.length
      ? initialChecked
      : items.map(() => false);
  const [checked, setChecked] = useState<boolean[]>(seed);
  const [hydrated, setHydrated] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounced server persist. Fire-and-forget — localStorage already gave the
  // instant feedback, so a transient network error just retries on next tick.
  function persistToServer(next: boolean[]) {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      const checkedIndexes = next
        .map((v, i) => (v ? i : -1))
        .filter((i) => i >= 0);
      void fetch("/api/method/checklist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ moduleSlug, checkedIndexes }),
        keepalive: true,
      }).catch(() => {
        // Offline / transient — localStorage holds the state; next change resyncs.
      });
    }, 600);
  }

  useEffect(() => {
    // If the server had nothing ticked but this device has offline progress,
    // adopt it and push it up so the two converge.
    const serverEmpty = seed.every((v) => !v);
    if (serverEmpty) {
      try {
        const raw = localStorage.getItem(storageKey);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (
            Array.isArray(parsed) &&
            parsed.length === items.length &&
            parsed.some((v) => Boolean(v))
          ) {
            const adopted = parsed.map((v) => Boolean(v));
            setChecked(adopted);
            persistToServer(adopted);
          }
        }
      } catch {
        // localStorage unavailable or corrupt — keep server state.
      }
    }
    setHydrated(true);
    // Intentionally run once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify(checked));
    } catch {
      // quota exceeded or disabled — silently no-op.
    }
  }, [checked, storageKey, hydrated]);

  function commit(next: boolean[]) {
    setChecked(next);
    persistToServer(next);
  }

  function toggle(idx: number) {
    commit(checked.map((v, i) => (i === idx ? !v : v)));
  }

  function reset() {
    commit(items.map(() => false));
  }

  const doneCount = checked.filter(Boolean).length;
  const allDone = doneCount === items.length && items.length > 0;

  if (items.length === 0) return null;

  return (
    <section
      aria-labelledby="week-checklist-heading"
      className="rounded-xl border border-white/10 bg-charcoal/60 p-6 md:p-8"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-3 mb-2">
        <p className="font-heading text-coral text-[11px] tracking-[0.3em] uppercase">
          Week checklist
        </p>
        <p className="font-heading text-foreground-muted text-[11px] tracking-[0.2em] uppercase">
          {doneCount} / {items.length} done
        </p>
      </div>
      <h2
        id="week-checklist-heading"
        className="font-heading uppercase text-off-white text-2xl md:text-3xl leading-tight mb-2"
      >
        Tick it off across the week
      </h2>
      <p className="text-foreground-muted text-sm mb-5">
        Saved to your account — picks up wherever you log in. No judgment.
      </p>

      <div
        className="h-1 w-full rounded-full bg-white/5 mb-6 overflow-hidden"
        aria-hidden
      >
        <div
          className="h-full bg-coral transition-all duration-300"
          style={{
            width: items.length
              ? `${(doneCount / items.length) * 100}%`
              : "0%",
          }}
        />
      </div>

      <ul className="space-y-2">
        {items.map((item, idx) => {
          const isChecked = checked[idx] ?? false;
          return (
            <li key={idx}>
              <label
                className={`group flex gap-3 items-start cursor-pointer rounded-lg border p-3 md:p-4 transition-all ${
                  isChecked
                    ? "border-coral/30 bg-coral/[0.04]"
                    : "border-white/10 bg-white/[0.02] hover:border-coral/30 hover:bg-white/[0.04]"
                }`}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => toggle(idx)}
                  className="sr-only"
                />
                <span
                  aria-hidden
                  className={`shrink-0 mt-0.5 h-5 w-5 rounded border flex items-center justify-center transition-all ${
                    isChecked
                      ? "border-coral bg-coral"
                      : "border-white/30 bg-transparent group-hover:border-coral/60"
                  }`}
                >
                  {isChecked && (
                    <svg
                      viewBox="0 0 16 16"
                      className="h-3.5 w-3.5 text-charcoal"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="3 8.5 6.5 12 13 5" />
                    </svg>
                  )}
                </span>
                <span
                  className={`text-sm md:text-base leading-relaxed transition-colors ${
                    isChecked
                      ? "text-foreground-muted line-through decoration-coral/50"
                      : "text-off-white"
                  }`}
                >
                  {item}
                </span>
              </label>
            </li>
          );
        })}
      </ul>

      {allDone && (
        <p className="font-heading text-coral text-sm tracking-[0.2em] uppercase mt-5 text-center">
          Week done. Mark the module complete →
        </p>
      )}

      {doneCount > 0 && (
        <button
          type="button"
          onClick={reset}
          className="mt-5 text-xs text-foreground-muted hover:text-coral transition-colors"
        >
          Reset week
        </button>
      )}
    </section>
  );
}
