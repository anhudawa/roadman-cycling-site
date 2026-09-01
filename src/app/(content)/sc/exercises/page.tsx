import type { Metadata } from "next";
import Link from "next/link";
import { EvidenceBlock } from "@/components/seo/EvidenceBlock";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  CYCLING_EXERCISE_LIBRARY,
  getCyclingExerciseCatalog,
} from "@/lib/cycling-exercises";
import { ENTITY_IDS, SITE_ORIGIN } from "@/lib/brand-facts";
import { ExerciseLibraryClient } from "./ExerciseLibraryClient";

const LIBRARY = CYCLING_EXERCISE_LIBRARY;
const EXERCISES = getCyclingExerciseCatalog();

const SOURCES = [
  {
    name: "Heavy strength training effects in endurance cyclists: systematic review and meta-analysis",
    href: "https://pubmed.ncbi.nlm.nih.gov/40632222/",
    publisher: "PubMed",
    note: "Supports strength training as a category while reporting low-certainty evidence and no universal named-exercise list.",
  },
  {
    name: "Core training effects on sport performance: systematic review and meta-analysis",
    href: "https://pubmed.ncbi.nlm.nih.gov/36829378/",
    publisher: "PubMed",
    note: "Supports cautious claims about trunk capacity rather than automatic cycling-power transfer.",
  },
  {
    name: "Resistance training to failure versus non-failure: systematic review and meta-analysis",
    href: "https://pubmed.ncbi.nlm.nih.gov/42410632/",
    publisher: "PubMed",
    note: "Supports the boundary that technical failure is not required for an exercise set to be useful.",
  },
] as const;

export const metadata: Metadata = {
  title: { absolute: "Cyclist Exercise Library: Strength, Core & Mobility" },
  description:
    "Browse 54 cycling exercises by training job: strength, power, warm-up, core and mobility. Includes programme weeks, coaching cues and evidence links.",
  alternates: {
    canonical: LIBRARY.canonicalUrl,
    types: { "application/json": LIBRARY.feedUrl },
  },
  robots: { index: true, follow: true },
  openGraph: {
    title: "Cyclist Exercise Library",
    description:
      "Search 54 strength, power, core, warm-up and mobility movements used in Roadman's public cycling programme.",
    type: "website",
    url: LIBRARY.canonicalUrl,
    siteName: "Roadman Cycling",
  },
};

export default function ExerciseLibraryPage() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "CollectionPage",
              "@id": `${LIBRARY.canonicalUrl}#webpage`,
              url: LIBRARY.canonicalUrl,
              name: "Roadman cyclist exercise library",
              description: metadata.description,
              isPartOf: { "@id": ENTITY_IDS.website },
              author: { "@id": ENTITY_IDS.person },
              publisher: { "@id": ENTITY_IDS.organization },
              dateModified: LIBRARY.updatedDate,
              mainEntity: { "@id": `${LIBRARY.canonicalUrl}#exercise-list` },
              subjectOf: {
                "@type": "DataFeed",
                name: "Roadman cycling exercise catalogue",
                url: LIBRARY.feedUrl,
              },
            },
            {
              "@type": "ItemList",
              "@id": `${LIBRARY.canonicalUrl}#exercise-list`,
              name: "Cyclist strength, core and mobility exercises",
              numberOfItems: EXERCISES.length,
              itemListElement: EXERCISES.map((exercise, index) => ({
                "@type": "ListItem",
                position: index + 1,
                url: exercise.canonicalUrl,
                item: {
                  "@type": "Thing",
                  name: exercise.name,
                  description:
                    exercise.description ??
                    `${exercise.categoryLabel} movement used in Roadman's public cyclist strength programme.`,
                },
              })),
            },
            {
              "@type": "BreadcrumbList",
              itemListElement: [
                {
                  "@type": "ListItem",
                  position: 1,
                  name: "Home",
                  item: SITE_ORIGIN,
                },
                {
                  "@type": "ListItem",
                  position: 2,
                  name: "Cycling strength training",
                  item: `${SITE_ORIGIN}/strength-training`,
                },
                {
                  "@type": "ListItem",
                  position: 3,
                  name: "Cyclist exercise library",
                  item: LIBRARY.canonicalUrl,
                },
              ],
            },
          ],
        }}
      />

      <section className="bg-deep-purple pt-24 pb-14">
        <div className="mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
          <p className="font-heading text-sm tracking-[0.22em] text-coral">
            ROADMAN S&amp;C · 54 MOVEMENTS
          </p>
          <h1
            className="mt-4 font-heading leading-[0.95] text-off-white"
            style={{ fontSize: "var(--text-hero)" }}
          >
            CYCLIST EXERCISE LIBRARY.
            <span className="block text-coral">SEARCH BY TRAINING JOB.</span>
          </h1>
          <p className="mx-auto mt-7 max-w-3xl text-lg leading-relaxed text-foreground-muted md:text-xl">
            Browse every warm-up, strength, power, core and mobility movement in
            Roadman&apos;s public 12-week programme. Use the catalogue to find a
            movement; use the evidence guides to decide whether it earns a
            place.
          </p>
        </div>
      </section>

      <section className="bg-off-white py-14">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-charcoal/10 bg-white p-6 shadow-sm md:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-coral">
              The short answer
            </p>
            <p className="mt-3 text-lg leading-relaxed text-charcoal/75">
              {LIBRARY.answer}
            </p>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <RouteCard
              eyebrow="CHOOSE A ROUTINE"
              title="Gym exercise guide"
              body="Build from movement patterns without pretending one lift is mandatory."
              href="/blog/cycling-gym-exercises-best"
            />
            <RouteCard
              eyebrow="FOLLOW A BLOCK"
              title="12-week programme"
              body="See where each exercise appears across general prep, strength and power phases."
              href="/sc/programme"
            />
            <RouteCard
              eyebrow="TRAIN THE TRUNK"
              title="15-minute core routine"
              body="Use a short, evidence-bounded trunk session with regressions and progressions."
              href="/blog/cycling-core-workout-routine"
            />
            <RouteCard
              eyebrow="COMING TO IPHONE"
              title="Roadman app"
              body="Join the single early-access list for strength placed around your riding week."
              href="/app#early-access"
            />
          </div>
        </div>
      </section>

      <ExerciseLibraryClient exercises={EXERCISES} />

      <section className="bg-charcoal py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <p className="font-heading text-sm tracking-[0.2em] text-coral">
                THE EVIDENCE BOUNDARY
              </p>
              <h2
                className="mt-3 font-heading text-off-white"
                style={{ fontSize: "var(--text-section)" }}
              >
                A CATALOGUE IS NOT A RANKING.
              </h2>
              <p className="mt-5 leading-relaxed text-foreground-muted">
                Research can support strength training as a category without
                proving that one squat, hinge or core exercise is best for every
                cyclist. Exercise choice still depends on the goal, competence,
                equipment, symptoms, total dose and the next important ride.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-6 md:p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-coral">
                How to use this library
              </p>
              <ol className="mt-4 space-y-3 text-sm leading-relaxed text-foreground-muted">
                <li>
                  1. Start with the training job, not the trendiest exercise
                  name.
                </li>
                <li>
                  2. Choose a version you can control and progressively load.
                </li>
                <li>
                  3. Use the programme examples as starting doses, not universal
                  prescriptions.
                </li>
                <li>
                  4. Change the exercise or dose when it repeatedly compromises
                  priority riding.
                </li>
              </ol>
              <div className="mt-6 flex flex-wrap gap-4 text-sm">
                <Link
                  className="text-coral hover:text-coral/80"
                  href="/tools/strength-session-planner"
                >
                  Plan a strength session →
                </Link>
                <a
                  className="text-foreground-muted hover:text-coral"
                  href={LIBRARY.feedUrl}
                >
                  Exercise data feed →
                </a>
              </div>
            </div>
          </div>

          <EvidenceBlock
            reviewedSources={SOURCES}
            lastReviewed={LIBRARY.updatedDate}
            reviewedBy={LIBRARY.reviewedBy}
          />
        </div>
      </section>
    </>
  );
}

function RouteCard({
  eyebrow,
  title,
  body,
  href,
}: {
  eyebrow: string;
  title: string;
  body: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-2xl border border-charcoal/10 bg-white p-5 shadow-sm transition-transform hover:-translate-y-1"
    >
      <p className="text-xs font-semibold tracking-[0.16em] text-coral">
        {eyebrow}
      </p>
      <h2 className="mt-3 font-heading text-2xl text-charcoal">{title}</h2>
      <p className="mt-2 text-sm leading-relaxed text-charcoal/65">{body}</p>
      <span className="mt-4 inline-block text-sm font-semibold text-coral">
        Open →
      </span>
    </Link>
  );
}
