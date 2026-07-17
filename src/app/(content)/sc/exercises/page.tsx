"use client";

import { useState, useMemo } from "react";
import { getAllExercises, EXERCISE_VIDEO_MAP } from "@/lib/sc-programme";

const CATEGORY_LABELS: Record<string, string> = {
  warmup: "Warmup",
  workout: "Workout",
  "core-circuit": "Core Circuit",
  "core-standalone": "Core",
  stretch: "Stretch",
};

const CATEGORY_BADGE_CLASSES: Record<string, string> = {
  warmup: "bg-purple text-off-white",
  workout: "bg-coral text-off-white",
  "core-circuit": "bg-[#FF9800] text-off-white",
  "core-standalone": "bg-purple text-off-white",
  stretch: "bg-[#2196F3] text-off-white",
};

const FILTER_TABS = [
  { key: "all", label: "All" },
  { key: "warmup", label: "Warmup" },
  { key: "workout", label: "Workout" },
  { key: "core-circuit", label: "Core Circuit" },
  { key: "core-standalone", label: "Core" },
  { key: "stretch", label: "Stretch" },
] as const;

export default function ExerciseLibraryPage() {
  const allExercises = useMemo(() => getAllExercises(), []);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  const filtered = useMemo(() => {
    return allExercises.filter((ex) => {
      const matchesSearch =
        search === "" ||
        ex.name.toLowerCase().includes(search.toLowerCase());
      const matchesCategory =
        activeCategory === "all" || ex.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [allExercises, search, activeCategory]);

  return (
    <>
      {/* Hero */}
      <section className="bg-deep-purple pt-24 pb-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h1
            className="font-heading text-off-white mb-4"
            style={{ fontSize: "var(--text-section)" }}
          >
            EXERCISE LIBRARY
          </h1>
          <p className="text-foreground-muted max-w-xl mx-auto text-lg">
            Every exercise in the 12-week programme, all in one place.{" "}
            {allExercises.length} exercises across warmup, workout, core, and
            stretching.
          </p>
        </div>
      </section>

      {/* Search & Filter */}
      <section className="bg-[#210140] py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {/* Search input */}
            <div className="mb-8">
              <input
                type="text"
                placeholder="Search exercises by name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-charcoal border border-white/10 rounded-lg px-4 py-3 text-off-white placeholder:text-mid-grey font-body text-base focus:outline-none focus:border-coral transition-colors"
              />
            </div>

            {/* Category filter tabs */}
            <div className="flex flex-wrap gap-2 mb-8">
              {FILTER_TABS.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveCategory(tab.key)}
                  className={`px-4 py-2 rounded-lg font-body text-sm transition-colors ${
                    activeCategory === tab.key
                      ? "bg-coral text-off-white"
                      : "bg-[#2E2E30] text-foreground-muted border border-white/10 hover:text-off-white hover:border-white/20"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Count */}
            <p className="text-foreground-muted text-sm mb-6">
              Showing {filtered.length} exercise{filtered.length !== 1 ? "s" : ""}
            </p>

            {/* Exercise grid */}
            {filtered.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map((ex) => (
                  <div
                    key={ex.id}
                    className="bg-[#2E2E30] border border-white/10 rounded-xl overflow-hidden hover:border-white/20 transition-colors"
                  >
                    {/* Video embed or placeholder */}
                    {ex.videoUrl ? (
                      <div className="relative w-full overflow-hidden" style={{ paddingBottom: '56.25%' }}>
                        <iframe
                          src={ex.videoUrl}
                          title={ex.name}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          className="absolute inset-0 w-full h-full border-0"
                          loading="lazy"
                        />
                      </div>
                    ) : (
                      <div className="aspect-video bg-[#1a1a1c] flex flex-col items-center justify-center gap-2">
                        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" className="text-mid-grey">
                          <circle cx="24" cy="24" r="22" stroke="currentColor" strokeWidth="2" opacity="0.4" />
                          <path d="M19 16L34 24L19 32V16Z" fill="currentColor" opacity="0.4" />
                        </svg>
                        <span className="text-mid-grey text-xs font-body">Video coming soon</span>
                      </div>
                    )}

                    {/* Card body */}
                    <div className="p-5">
                      <h3 className="font-heading text-off-white text-lg mb-2">
                        {ex.name}
                      </h3>
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-body ${
                          CATEGORY_BADGE_CLASSES[ex.category] ??
                          "bg-mid-grey text-off-white"
                        }`}
                      >
                        {CATEGORY_LABELS[ex.category] ?? ex.category}
                      </span>
                      {EXERCISE_VIDEO_MAP[ex.id]?.tip && (
                        <div className="mt-3 flex items-start gap-2 rounded-lg bg-[#F16363]/8 border border-[#F16363]/20 px-3 py-2">
                          <svg className="w-3.5 h-3.5 text-coral mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
                          </svg>
                          <p className="text-xs text-off-white/70 leading-relaxed">{EXERCISE_VIDEO_MAP[ex.id].tip}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="text-foreground-muted text-lg">
                  No exercises found matching your search.
                </p>
                <button
                  onClick={() => {
                    setSearch("");
                    setActiveCategory("all");
                  }}
                  className="mt-4 text-coral hover:underline font-body text-sm"
                >
                  Clear filters
                </button>
              </div>
            )}
          </div>
        </section>
      </>
  );
}
