import type { Metadata } from "next";
import { STRETCHES } from "@/lib/sc-programme";

export const metadata: Metadata = {
  title: "Stretching for Cyclists — 8 Essential Stretches",
  description:
    "Eight stretches every cyclist needs. Lower back, hip flexors, glutes, quads, hamstrings, calves, Achilles, and ITB. Reduce injury risk and improve comfort on the bike.",
  alternates: { canonical: "https://roadmancycling.com/sc/stretching" },
};

export default function StretchingPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-deep-purple pt-24 pb-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h1
            className="font-heading text-off-white mb-4"
            style={{ fontSize: "var(--text-section)" }}
          >
            STRETCHING
          </h1>
          <p className="text-foreground-muted max-w-2xl mx-auto text-lg">
            Cycling puts your body through repetitive, limited-range motion
            for hours at a time. These eight stretches target the areas that
            tighten up most, keeping you comfortable on the bike and reducing
            your risk of injury off it.
          </p>
        </div>
      </section>

      {/* Stretch cards */}
      <section className="bg-[#210140] py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {STRETCHES.map((stretch) => (
                <article
                  key={stretch.id}
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
                  <div className="p-6">
                    <h2
                      className="font-heading text-off-white mb-3"
                      style={{ fontSize: "var(--text-subsection)" }}
                    >
                      {stretch.name}
                    </h2>

                    {/* Badges */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className="bg-[#2196F3]/20 text-[#2196F3] border border-[#2196F3]/30 px-3 py-1 rounded-full text-xs font-body">
                        {stretch.targetArea}
                      </span>
                      <span className="bg-coral/20 text-coral border border-coral/30 px-3 py-1 rounded-full text-xs font-body">
                        {stretch.duration}
                      </span>
                    </div>

                    <p className="text-foreground-muted font-body leading-relaxed mb-5 text-sm">
                      {stretch.description}
                    </p>

                    {/* Instructions */}
                    <div>
                      <h3 className="font-heading text-off-white text-sm mb-3 tracking-wide uppercase">
                        Instructions
                      </h3>
                      <ol className="list-decimal list-inside space-y-2">
                        {stretch.instructions.map((step, i) => (
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
