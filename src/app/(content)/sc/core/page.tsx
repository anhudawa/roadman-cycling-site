import type { Metadata } from "next";
import { CORE_EXERCISES } from "@/lib/sc-programme";

export const metadata: Metadata = {
  title: "Core Exercises for Cyclists — 7 Essential Movements",
  description:
    "Seven core exercises specifically chosen for cyclists. Swiss Ball Twists, Double Leg Drops, Seated Leg Raises, and more. Build a stable platform for power transfer on the bike.",
  alternates: { canonical: "https://roadmancycling.com/sc/core" },
};

export default function CoreExercisesPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-deep-purple pt-24 pb-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h1
            className="font-heading text-off-white mb-4"
            style={{ fontSize: "var(--text-section)" }}
          >
            CORE WORK
          </h1>
          <p className="text-foreground-muted max-w-2xl mx-auto text-lg">
            A strong core is the foundation of efficient pedalling. These
            seven exercises build the trunk stability you need to transfer
            power through the pedals without wasting energy through lateral
            movement or lower-back fatigue.
          </p>
        </div>
      </section>

      {/* Exercise cards */}
      <section className="bg-[#210140] py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-10">
              {CORE_EXERCISES.map((exercise, index) => (
                <article
                  key={exercise.id}
                  className="bg-[#2E2E30] border border-white/10 rounded-xl overflow-hidden"
                >
                  {/* Video placeholder */}
                  <div className="aspect-video bg-[#1a1a1c] flex flex-col items-center justify-center gap-3">
                    <svg
                      width="64"
                      height="64"
                      viewBox="0 0 64 64"
                      fill="none"
                      className="text-mid-grey"
                    >
                      <circle
                        cx="32"
                        cy="32"
                        r="30"
                        stroke="currentColor"
                        strokeWidth="2"
                        opacity="0.4"
                      />
                      <path
                        d="M26 20L46 32L26 44V20Z"
                        fill="currentColor"
                        opacity="0.4"
                      />
                    </svg>
                    <span className="text-mid-grey text-sm font-body tracking-wide">
                      VIDEO COMING SOON
                    </span>
                  </div>

                  {/* Card body */}
                  <div className="p-6 md:p-8">
                    <p className="text-coral font-body text-sm mb-2">
                      Exercise {index + 1} of {CORE_EXERCISES.length}
                    </p>
                    <h2
                      className="font-heading text-off-white mb-4"
                      style={{ fontSize: "var(--text-subsection)" }}
                    >
                      {exercise.name}
                    </h2>
                    <p className="text-foreground-muted font-body leading-relaxed mb-6">
                      {exercise.description}
                    </p>

                    {/* Target muscles */}
                    <div className="flex flex-wrap gap-2 mb-6">
                      {exercise.targetMuscles.map((muscle) => (
                        <span
                          key={muscle}
                          className="bg-purple/20 text-purple border border-purple/30 px-3 py-1 rounded-full text-xs font-body"
                        >
                          {muscle}
                        </span>
                      ))}
                    </div>

                    {/* Instructions */}
                    <div>
                      <h3 className="font-heading text-off-white text-sm mb-3 tracking-wide uppercase">
                        Instructions
                      </h3>
                      <ol className="list-decimal list-inside space-y-2">
                        {exercise.instructions.map((step, i) => (
                          <li
                            key={i}
                            className="text-foreground-muted font-body text-sm leading-relaxed"
                          >
                            {step}
                          </li>
                        ))}
                      </ol>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      </>
  );
}
