import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Header, Footer } from "@/components/layout";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  RACES,
  getRaceBySlug,
  getSimilarRaces,
  DIFFICULTY_LABELS,
  DIFFICULTY_COLORS,
} from "@/data/races";

export async function generateStaticParams() {
  return RACES.map((race) => ({ slug: race.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const race = getRaceBySlug(slug);
  if (!race) return {};

  const title = `${race.name} Race Guide — Distance, Elevation & Finish Times | Roadman Cycling`;
  const description = `Complete ${race.name} guide: ${race.distance_km}km, ${race.elevation_m.toLocaleString()}m elevation. Key climbs, typical finish times for all abilities and training advice from Roadman Cycling.`;

  return {
    title,
    description,
    alternates: { canonical: `https://roadmancycling.com/races/${slug}` },
    openGraph: {
      title: `${race.name} Race Guide`,
      description,
      type: "website",
      url: `https://roadmancycling.com/races/${slug}`,
      images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: race.name }],
    },
    robots: { index: true, follow: true },
  };
}

function StatBox({
  label,
  value,
  unit,
}: {
  label: string;
  value: string | number;
  unit?: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.04] px-5 py-4 text-center">
      <p className="font-heading text-coral leading-none" style={{ fontSize: "clamp(1.75rem, 3vw, 2.5rem)" }}>
        {typeof value === "number" ? value.toLocaleString() : value}
        {unit && <span className="text-base font-body text-foreground-muted ml-1">{unit}</span>}
      </p>
      <p className="text-[10px] font-heading tracking-widest uppercase text-foreground-muted mt-2">
        {label}
      </p>
    </div>
  );
}

function DifficultyBar({ level }: { level: number }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <span
            key={i}
            className={`block w-5 h-2 rounded-full ${
              i < level ? "bg-coral" : "bg-white/10"
            }`}
          />
        ))}
      </div>
      <span className={`text-sm font-medium ${DIFFICULTY_COLORS[level]}`}>
        {DIFFICULTY_LABELS[level]}
      </span>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-heading text-coral tracking-widest text-xs uppercase mb-3">
      {children}
    </p>
  );
}

export default async function RacePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const race = getRaceBySlug(slug);
  if (!race) notFound();

  const similar = getSimilarRaces(race);

  const askQuestion = encodeURIComponent(
    `I'm training for the ${race.name} (${race.distance_km}km, ${race.elevation_m.toLocaleString()}m elevation). What finish time should I target and how should I structure my preparation?`,
  );

  // If a matching predictor course exists, link directly to it; otherwise
  // send the rider to the predictor courses index to find their event.
  const predictorHref = race.predictor_slug
    ? `/predict/${race.predictor_slug}`
    : `/predict/courses`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SportsEvent",
    name: race.name,
    description: race.description,
    url: `https://roadmancycling.com/races/${race.slug}`,
    location: {
      "@type": "Place",
      name: race.location,
      address: {
        "@type": "PostalAddress",
        addressCountry: race.country,
      },
    },
    sport: "Cycling",
    organizer: {
      "@type": "Organization",
      name: race.name,
    },
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://roadmancycling.com" },
      { "@type": "ListItem", position: 2, name: "Race Guides", item: "https://roadmancycling.com/races" },
      { "@type": "ListItem", position: 3, name: race.name, item: `https://roadmancycling.com/races/${race.slug}` },
    ],
  };

  return (
    <>
      <JsonLd data={jsonLd} />
      <JsonLd data={breadcrumbLd} />
      <Header />
      <main id="main-content">
        {/* Hero */}
        <section className="relative bg-deep-purple overflow-hidden pt-32 pb-14">
          <div
            className="pointer-events-none absolute inset-0 opacity-40"
            style={{
              backgroundImage:
                "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(76, 18, 115, 0.8) 0%, transparent 70%)",
            }}
          />
          <div className="relative max-w-[1200px] mx-auto w-full px-5 md:px-8">
            {/* Breadcrumbs */}
            <nav aria-label="Breadcrumb" className="mb-6">
              <ol className="flex items-center gap-2 text-xs text-foreground-muted">
                <li>
                  <Link href="/" className="hover:text-off-white transition-colors">
                    Home
                  </Link>
                </li>
                <li aria-hidden="true" className="text-white/20">
                  /
                </li>
                <li>
                  <Link href="/races" className="hover:text-off-white transition-colors">
                    Race Guides
                  </Link>
                </li>
                <li aria-hidden="true" className="text-white/20">
                  /
                </li>
                <li className="text-off-white" aria-current="page">
                  {race.name}
                </li>
              </ol>
            </nav>

            {/* Country + difficulty */}
            <div className="flex items-center gap-4 mb-4">
              <span className="font-heading text-xs tracking-widest uppercase text-foreground-muted">
                {race.location} · {race.country}
              </span>
              {race.month && (
                <span className="text-xs text-foreground-muted border border-white/10 rounded px-2 py-0.5">
                  {race.month}
                </span>
              )}
            </div>

            <h1
              className="font-heading text-off-white leading-[0.9] mb-4"
              style={{ fontSize: "clamp(3rem, 6vw, 5.5rem)" }}
            >
              {race.name.toUpperCase()}
            </h1>

            <DifficultyBar level={race.difficulty} />

            {/* Key stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-10">
              <StatBox label="Distance" value={race.distance_km} unit="km" />
              <StatBox label="Elevation" value={race.elevation_m} unit="m" />
              <StatBox label="Climbs" value={race.key_climbs.length} />
              <StatBox label="Difficulty" value={DIFFICULTY_LABELS[race.difficulty]} />
            </div>
          </div>
        </section>

        {/* Main content */}
        <section className="bg-charcoal py-16">
          <div className="max-w-[1200px] mx-auto w-full px-5 md:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              {/* Left: main content */}
              <div className="lg:col-span-2 space-y-12">
                {/* Course overview */}
                <div>
                  <SectionLabel>Course Overview</SectionLabel>
                  <p className="text-off-white text-base leading-relaxed">{race.description}</p>
                </div>

                {/* Key climbs */}
                {race.key_climbs.length > 0 && (
                  <div>
                    <SectionLabel>Key Climbs</SectionLabel>
                    <div className="space-y-3">
                      {race.key_climbs.map((climb) => (
                        <div
                          key={climb.name}
                          className="rounded-xl border border-white/10 bg-white/[0.03] px-5 py-4"
                        >
                          <div className="flex items-start justify-between gap-4 flex-wrap">
                            <div>
                              <h3 className="font-heading text-off-white text-base">
                                {climb.name.toUpperCase()}
                              </h3>
                              <p className="text-foreground-muted text-sm mt-0.5">
                                {climb.length_km}km · avg {climb.avg_gradient}% gradient
                              </p>
                            </div>
                            <div className="text-right shrink-0">
                              <p className="font-heading text-coral text-lg leading-none">
                                {climb.elevation_m.toLocaleString()}
                                <span className="text-xs font-body text-foreground-muted ml-1">m</span>
                              </p>
                              <p className="text-[10px] text-foreground-subtle uppercase tracking-wider mt-0.5">
                                Summit
                              </p>
                            </div>
                          </div>
                          {/* Gradient bar */}
                          <div className="mt-3 h-1.5 rounded-full bg-white/10 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-coral/70"
                              style={{ width: `${Math.min(100, (climb.avg_gradient / 25) * 100)}%` }}
                            />
                          </div>
                          <p className="text-[10px] text-foreground-subtle mt-1">
                            {climb.avg_gradient < 8
                              ? "Sustained gradient — settle into a rhythm"
                              : climb.avg_gradient < 15
                              ? "Steep — stay seated, keep cadence high"
                              : "Extreme — most riders will need to walk sections"}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Finish times */}
                <div>
                  <SectionLabel>Typical Finish Times</SectionLabel>
                  <p className="text-foreground-muted text-sm mb-4">
                    Based on FTP, weekly training volume and previous event experience.
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    {(
                      [
                        { key: "elite", label: "Elite", sub: "Racing category, high FTP" },
                        { key: "advanced", label: "Advanced", sub: "Structured training, 10+ hrs/wk" },
                        { key: "intermediate", label: "Intermediate", sub: "Regular training, 7–10 hrs/wk" },
                        { key: "beginner", label: "Beginner", sub: "First big event, 5–8 hrs/wk" },
                      ] as const
                    ).map(({ key, label, sub }) => (
                      <div
                        key={key}
                        className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-4"
                      >
                        <p className="font-heading text-off-white text-sm uppercase tracking-wide mb-0.5">
                          {label}
                        </p>
                        <p className="font-heading text-coral text-xl leading-none mb-1">
                          {race.typical_finish_times[key]}
                        </p>
                        <p className="text-foreground-subtle text-xs">{sub}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tags */}
                {race.tags.length > 0 && (
                  <div>
                    <SectionLabel>Event Type</SectionLabel>
                    <div className="flex flex-wrap gap-2">
                      {race.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-xs text-foreground-muted border border-white/10 rounded-full px-3 py-1"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right: sidebar */}
              <div className="space-y-6">
                {/* Predict Your Time CTA */}
                <div className="rounded-xl border border-coral/30 bg-coral/[0.06] p-6">
                  <SectionLabel>Predict Your Time</SectionLabel>
                  <h2 className="font-heading text-off-white text-xl mb-3 leading-tight">
                    WHAT&rsquo;S YOUR REALISTIC TARGET?
                  </h2>
                  <p className="text-foreground-muted text-sm leading-relaxed mb-5">
                    {race.predictor_slug
                      ? `Enter your FTP and weight — we'll simulate the ${race.name} course on real elevation data and give you a finish time within ±3%.`
                      : `Ask Roadman about your target time for ${race.name} — get an honest answer grounded in training data, not guesswork.`}
                  </p>
                  <Link
                    href={race.predictor_slug ? predictorHref : `/ask?q=${askQuestion}`}
                    className="block w-full text-center font-heading tracking-wider uppercase text-sm bg-coral hover:bg-coral-hover text-off-white px-5 py-3 rounded-md transition-colors"
                  >
                    {race.predictor_slug ? "Predict My Finish Time" : "Get My Time Estimate"}
                  </Link>
                  {!race.predictor_slug && (
                    <Link
                      href={predictorHref}
                      className="block w-full text-center text-xs text-foreground-muted hover:text-off-white transition-colors mt-2"
                    >
                      Or try the Race Predictor →
                    </Link>
                  )}
                  <p className="text-foreground-subtle text-xs text-center mt-3">
                    Free · No account required
                  </p>
                </div>

                {/* Quick facts */}
                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-6">
                  <SectionLabel>Quick Facts</SectionLabel>
                  <dl className="space-y-3">
                    <div className="flex justify-between gap-4">
                      <dt className="text-foreground-muted text-sm">Distance</dt>
                      <dd className="text-off-white text-sm font-medium">{race.distance_km}km</dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-foreground-muted text-sm">Elevation</dt>
                      <dd className="text-off-white text-sm font-medium">
                        {race.elevation_m.toLocaleString()}m
                      </dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-foreground-muted text-sm">Location</dt>
                      <dd className="text-off-white text-sm font-medium text-right">{race.location}</dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-foreground-muted text-sm">Country</dt>
                      <dd className="text-off-white text-sm font-medium">{race.country}</dd>
                    </div>
                    {race.month && (
                      <div className="flex justify-between gap-4">
                        <dt className="text-foreground-muted text-sm">Typical month</dt>
                        <dd className="text-off-white text-sm font-medium">{race.month}</dd>
                      </div>
                    )}
                    <div className="flex justify-between gap-4">
                      <dt className="text-foreground-muted text-sm">Key climbs</dt>
                      <dd className="text-off-white text-sm font-medium">{race.key_climbs.length}</dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-foreground-muted text-sm">Difficulty</dt>
                      <dd className={`text-sm font-medium ${DIFFICULTY_COLORS[race.difficulty]}`}>
                        {race.difficulty}/5 — {DIFFICULTY_LABELS[race.difficulty]}
                      </dd>
                    </div>
                  </dl>
                  {race.website && (
                    <a
                      href={race.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-5 block text-center text-xs text-foreground-muted hover:text-off-white transition-colors border border-white/10 hover:border-white/20 rounded-lg px-4 py-2.5"
                    >
                      Official website →
                    </a>
                  )}
                </div>

                {/* Ask Roadman compact */}
                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-6">
                  <SectionLabel>Training Advice</SectionLabel>
                  <p className="text-foreground-muted text-sm leading-relaxed mb-4">
                    Want a training plan built around {race.name}? Ask Roadman for periodisation
                    advice, pacing strategy or nutrition guidance for this specific event.
                  </p>
                  <Link
                    href="/ask"
                    className="block w-full text-center font-heading tracking-wider uppercase text-sm border border-coral/50 hover:border-coral text-coral hover:text-coral px-5 py-3 rounded-md transition-colors"
                  >
                    Ask Roadman
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Similar races */}
        {similar.length > 0 && (
          <section className="bg-deep-purple border-t border-white/10 py-16">
            <div className="max-w-[1200px] mx-auto w-full px-5 md:px-8">
              <SectionLabel>Similar Events</SectionLabel>
              <h2
                className="font-heading text-off-white mb-8"
                style={{ fontSize: "clamp(1.75rem, 3vw, 2.5rem)" }}
              >
                YOU MIGHT ALSO TARGET
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {similar.map((r) => (
                  <Link
                    key={r.slug}
                    href={`/races/${r.slug}`}
                    className="group block rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/20 transition-all duration-200 p-5"
                  >
                    <p className="text-[10px] font-heading tracking-widest uppercase text-foreground-muted mb-1">
                      {r.country}
                    </p>
                    <h3 className="font-heading text-off-white group-hover:text-coral transition-colors text-base leading-tight mb-2">
                      {r.name.toUpperCase()}
                    </h3>
                    <div className="flex gap-3 text-sm text-foreground-muted mb-3">
                      <span>{r.distance_km}km</span>
                      <span>·</span>
                      <span>{r.elevation_m.toLocaleString()}m</span>
                      <span>·</span>
                      <span className={DIFFICULTY_COLORS[r.difficulty]}>
                        {DIFFICULTY_LABELS[r.difficulty]}
                      </span>
                    </div>
                    <span className="text-coral text-xs">View guide →</span>
                  </Link>
                ))}
              </div>

              <div className="mt-8 text-center">
                <Link
                  href="/races"
                  className="inline-block text-foreground-muted hover:text-off-white text-sm transition-colors"
                >
                  ← Back to all race guides
                </Link>
              </div>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}
