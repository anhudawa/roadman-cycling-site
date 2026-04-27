import Link from "next/link";
import { Header, Footer, Section, Container } from "@/components/layout";
import { listVerifiedCourses } from "@/lib/race-predictor/store";
import { CoursesGrid } from "./courses-grid";
import type { CourseCardData } from "./course-card";
import { buildThumbProfile } from "./mini-elevation-thumb";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Race Predictor — Event catalog | Roadman Cycling",
  description:
    "Pick your A-race from the curated event library: Étape, Marmotte, Wicklow 200, Mallorca 312, RideLondon, Dragon Ride and more. Filter by distance, elevation, country — get a physics-grade time prediction in minutes.",
};

export default async function CoursesPage() {
  const courses = await listVerifiedCourses().catch(() => []);

  // Project the heavy DB rows down to a slim, serializable payload for the
  // client island. We compute the thumbnail profile on the server so each
  // card ships ~48 small numbers rather than the full segment array.
  const cardData: CourseCardData[] = courses.map((c) => {
    const climbs = c.courseData.climbs ?? [];
    return {
      slug: c.slug,
      name: c.name,
      country: c.country,
      region: c.region,
      distanceM: c.distanceM,
      elevationGainM: c.elevationGainM,
      climbCount: climbs.length,
      hcCount: climbs.filter((cl) => cl.category === "hc").length,
      cat1Count: climbs.filter((cl) => cl.category === "cat1").length,
      nextEventDate: c.eventDates?.[0] ?? null,
      thumb: buildThumbProfile(c.courseData, 48),
    };
  });

  // Top-line catalog stats for the hero. Cheap to compute.
  const totalEvents = cardData.length;
  const totalCountries = new Set(
    cardData.map((c) => c.country).filter(Boolean) as string[],
  ).size;
  const totalDistanceKm = Math.round(
    cardData.reduce((s, c) => s + c.distanceM, 0) / 1000,
  );
  const totalElevationKm = (
    cardData.reduce((s, c) => s + c.elevationGainM, 0) / 1000
  ).toFixed(1);

  return (
    <>
      <Header />
      <main id="main-content">
        {/* Hero — premium aurora + gradient headline */}
        <Section
          background="deep-purple"
          grain
          className="!pt-32 !pb-12 section-glow-purple"
        >
          <div className="aurora-container" aria-hidden>
            <div className="aurora-band aurora-band-1" />
            <div className="aurora-band aurora-band-2" />
            <div className="aurora-band aurora-band-3" />
          </div>
          <Container className="relative">
            <div className="max-w-3xl">
              <p className="mb-4 text-xs uppercase tracking-[0.3em] text-coral">
                Race Predictor · Event library
              </p>
              <h1 className="font-display text-5xl md:text-7xl uppercase tracking-tight text-off-white leading-[0.95] mb-5">
                Pick your{" "}
                <span className="text-gradient-animated">A-race</span>.
                <br />
                We&apos;ve done the hard part.
              </h1>
              <p className="max-w-2xl text-lg text-off-white/80 mb-2">
                Every course has a verified GPX, smoothed elevation, detected
                climbs and a finish time validated against published amateur
                results. Filter by distance, elevation or country — get a
                physics-grade prediction in minutes.
              </p>
              <p className="text-sm text-off-white/55">
                Don&apos;t see your event?{" "}
                <Link
                  href="/predict"
                  className="text-coral underline underline-offset-2 hover:text-coral-hover"
                >
                  Upload your GPX
                </Link>{" "}
                — same physics engine.
              </p>
            </div>

            {totalEvents > 0 && (
              <dl className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl">
                <Stat value={totalEvents.toString()} label="Events" />
                <Stat value={totalCountries.toString()} label="Countries" />
                <Stat
                  value={totalDistanceKm.toLocaleString("en-GB")}
                  label="Total km"
                  accent
                />
                <Stat
                  value={totalElevationKm}
                  label="Total km vertical"
                  accent
                />
              </dl>
            )}
          </Container>
        </Section>

        {/* Filterable grid */}
        <Section background="charcoal" className="!pt-8 !pb-20">
          <Container>
            {totalEvents === 0 ? (
              <div className="rounded-xl border border-white/5 bg-white/[0.03] p-10 text-center text-off-white/70">
                <p className="font-display text-2xl uppercase tracking-wide text-off-white">
                  Catalog loading
                </p>
                <p className="mx-auto mt-3 max-w-md text-sm">
                  If this persists, the database hasn&apos;t been seeded yet.
                  Run{" "}
                  <code className="rounded bg-black/30 px-1.5 py-0.5 text-coral">
                    npm run seed:race-events
                  </code>
                  {" "}to populate the catalog.
                </p>
              </div>
            ) : (
              <CoursesGrid courses={cardData} />
            )}

            {/* CTA panel — kept on the page so it always offers an out for
                events that aren't in the catalog. */}
            <div className="mt-12 overflow-hidden rounded-xl border border-coral/25 bg-gradient-to-br from-coral/[0.08] via-purple/[0.10] to-transparent p-6 md:p-8">
              <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
                <div className="max-w-xl">
                  <p className="font-display text-2xl uppercase tracking-wide text-coral">
                    Got a course we don&apos;t have?
                  </p>
                  <p className="mt-2 text-sm text-off-white/75">
                    Upload your GPX from the predictor and we&apos;ll process
                    it the same way: smoothed elevation, derived gradients,
                    climb detection, and a power balance per segment.
                  </p>
                </div>
                <Link
                  href="/predict"
                  className="inline-flex items-center gap-2 whitespace-nowrap rounded-full bg-coral px-5 py-2.5 text-sm font-semibold uppercase tracking-wide text-charcoal transition hover:-translate-y-0.5 hover:bg-coral-hover hover:shadow-[0_10px_30px_-10px_rgba(241,99,99,0.7)]"
                >
                  Upload GPX
                  <span aria-hidden="true">&rarr;</span>
                </Link>
              </div>
            </div>
          </Container>
        </Section>
      </main>
      <Footer />
    </>
  );
}

function Stat({
  value,
  label,
  accent,
}: {
  value: string;
  label: string;
  accent?: boolean;
}) {
  return (
    <div className="rounded-xl border border-white/8 bg-white/[0.04] px-3 py-3 backdrop-blur-sm">
      <dd
        className={`font-display text-3xl leading-none ${accent ? "text-coral stat-glow" : "text-off-white stat-glow"}`}
      >
        {value}
      </dd>
      <dt className="mt-1.5 text-[10px] uppercase tracking-[0.2em] text-off-white/55">
        {label}
      </dt>
    </div>
  );
}
