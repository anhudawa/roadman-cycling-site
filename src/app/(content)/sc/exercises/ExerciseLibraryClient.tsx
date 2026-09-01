"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type {
  CyclingExerciseCatalogItem,
  CyclingExerciseCategory,
} from "@/lib/cycling-exercises";

const CATEGORY_BADGE_CLASSES: Record<CyclingExerciseCategory, string> = {
  warmup: "bg-purple text-off-white",
  workout: "bg-coral text-off-white",
  "core-circuit": "bg-[#FF9800] text-off-white",
  "core-standalone": "bg-purple text-off-white",
  stretch: "bg-[#2196F3] text-off-white",
};

const FILTER_TABS: ReadonlyArray<{
  key: "all" | CyclingExerciseCategory;
  label: string;
}> = [
  { key: "all", label: "All" },
  { key: "warmup", label: "Warm-up" },
  { key: "workout", label: "Strength & power" },
  { key: "core-circuit", label: "Programme core" },
  { key: "core-standalone", label: "Standalone core" },
  { key: "stretch", label: "Mobility" },
];

export function ExerciseLibraryClient({
  exercises,
}: {
  exercises: CyclingExerciseCatalogItem[];
}) {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<
    "all" | CyclingExerciseCategory
  >("all");

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return exercises.filter((exercise) => {
      const matchesSearch =
        query === "" ||
        exercise.name.toLowerCase().includes(query) ||
        exercise.categoryLabel.toLowerCase().includes(query) ||
        exercise.targetAreas.some((area) => area.toLowerCase().includes(query));
      const matchesCategory =
        activeCategory === "all" || exercise.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [exercises, search, activeCategory]);

  return (
    <section className="bg-[#210140] py-16" aria-labelledby="library-heading">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 max-w-3xl">
          <p className="font-heading text-sm tracking-[0.2em] text-coral">
            SEARCH THE CATALOGUE
          </p>
          <h2
            id="library-heading"
            className="mt-3 font-heading text-off-white"
            style={{ fontSize: "var(--text-section)" }}
          >
            54 MOVEMENTS. FILTERED BY JOB.
          </h2>
        </div>

        <label className="mb-8 block">
          <span className="sr-only">Search the cyclist exercise library</span>
          <input
            type="search"
            placeholder="Search by exercise, category or target area..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="w-full rounded-lg border border-white/10 bg-charcoal px-4 py-3 font-body text-base text-off-white placeholder:text-mid-grey transition-colors focus:border-coral focus:outline-none"
          />
        </label>

        <div
          className="mb-8 flex flex-wrap gap-2"
          aria-label="Exercise categories"
        >
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              aria-pressed={activeCategory === tab.key}
              onClick={() => setActiveCategory(tab.key)}
              className={`rounded-lg px-4 py-2 font-body text-sm transition-colors ${
                activeCategory === tab.key
                  ? "bg-coral text-off-white"
                  : "border border-white/10 bg-[#2E2E30] text-foreground-muted hover:border-white/20 hover:text-off-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <p className="mb-6 text-sm text-foreground-muted" aria-live="polite">
          Showing {filtered.length} exercise{filtered.length !== 1 ? "s" : ""}
        </p>

        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((exercise) => (
              <article
                id={exercise.id}
                key={exercise.id}
                className="scroll-mt-32 overflow-hidden rounded-xl border border-white/10 bg-[#2E2E30] transition-colors hover:border-white/20"
              >
                {exercise.videoUrl ? (
                  <div className="relative aspect-video w-full overflow-hidden bg-[#1a1a1c]">
                    <iframe
                      src={exercise.videoUrl}
                      title={`${exercise.name} exercise demonstration`}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="absolute inset-0 h-full w-full border-0"
                      loading="lazy"
                    />
                  </div>
                ) : (
                  <div className="flex aspect-video flex-col items-center justify-center gap-2 bg-[#1a1a1c]">
                    <svg
                      width="48"
                      height="48"
                      viewBox="0 0 48 48"
                      fill="none"
                      className="text-mid-grey"
                      aria-hidden="true"
                    >
                      <circle
                        cx="24"
                        cy="24"
                        r="22"
                        stroke="currentColor"
                        strokeWidth="2"
                        opacity="0.4"
                      />
                      <path
                        d="M19 16L34 24L19 32V16Z"
                        fill="currentColor"
                        opacity="0.4"
                      />
                    </svg>
                    <span className="text-xs text-mid-grey">
                      Video coming soon
                    </span>
                  </div>
                )}

                <div className="p-5">
                  <h3 className="mb-2 font-heading text-xl text-off-white">
                    {exercise.name}
                  </h3>
                  <span
                    className={`inline-block rounded-full px-3 py-1 text-xs ${CATEGORY_BADGE_CLASSES[exercise.category]}`}
                  >
                    {exercise.categoryLabel}
                  </span>

                  {exercise.programmeWeeks.length > 0 && (
                    <p className="mt-3 text-xs leading-relaxed text-foreground-subtle">
                      Used in programme week
                      {exercise.programmeWeeks.length > 1 ? "s" : ""}{" "}
                      {exercise.programmeWeeks.join(", ")}
                      {exercise.examplePrescriptions.length > 0
                        ? ` · examples: ${exercise.examplePrescriptions.slice(0, 3).join(", ")}`
                        : ""}
                    </p>
                  )}

                  {exercise.description && (
                    <p className="mt-3 text-sm leading-relaxed text-foreground-muted">
                      {exercise.description}
                    </p>
                  )}

                  {exercise.coachingTip && (
                    <div className="mt-3 rounded-lg border border-[#F16363]/20 bg-[#F16363]/8 px-3 py-2">
                      <p className="text-xs leading-relaxed text-off-white/70">
                        <strong className="text-coral">Coaching cue: </strong>
                        {exercise.coachingTip}
                      </p>
                    </div>
                  )}

                  <div className="mt-4 flex flex-wrap gap-3 text-xs">
                    <Link
                      className="text-coral hover:text-coral/80"
                      href={exercise.evidenceGuideUrl}
                    >
                      Selection evidence →
                    </Link>
                    {exercise.programmeWeeks.length > 0 && (
                      <Link
                        className="text-foreground-muted hover:text-coral"
                        href="/sc/programme"
                      >
                        See in programme →
                      </Link>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="py-16 text-center">
            <p className="text-lg text-foreground-muted">
              No exercises match that search.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setActiveCategory("all");
              }}
              className="mt-4 text-sm text-coral hover:underline"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
