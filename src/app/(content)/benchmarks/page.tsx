import type { Metadata } from "next";
import Link from "next/link";
import { Header, Footer, Section, Container } from "@/components/layout";
import { Button } from "@/components/ui";
import { JsonLd } from "@/components/seo/JsonLd";
import { ENTITY_IDS } from "@/lib/brand-facts";
import {
  KEY_FINDINGS,
  METHODOLOGY,
  REPORT_META,
  SPORTIVE_TIERS,
  TRAINING_HOURS_BY_GOAL,
  FTP_IMPROVEMENT_RATES,
} from "@/data/benchmarks";
import {
  DownloadShareBar,
  FTPSection,
  ImprovementChart,
  TrainingHoursChart,
  WkgSection,
} from "./BenchmarkCharts";

export const metadata: Metadata = {
  title: "Amateur Cycling Performance Report 2026 — FTP, W/kg & Training Benchmarks",
  description:
    "FTP, watts-per-kilo, training hours, sportive times, and FTP improvement benchmarks for actively-training amateur road cyclists. Percentile data by age group, with full methodology and a downloadable JSON dataset.",
  keywords: [
    "FTP percentile by age",
    "watts per kilo benchmark",
    "average amateur cyclist FTP",
    "average sportive time",
    "FTP improvement rate",
    "cycling performance data 2026",
    "amateur cyclist benchmarks",
  ],
  alternates: {
    canonical: "https://roadmancycling.com/benchmarks",
  },
  openGraph: {
    title: "The Roadman Amateur Cycling Performance Report 2026",
    description:
      "Percentile benchmarks for FTP, W/kg, training hours, sportive times, and FTP improvement rates — by age group, with methodology and downloadable dataset.",
    type: "article",
    url: "https://roadmancycling.com/benchmarks",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Roadman Cycling Benchmarks 2026" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Amateur Cycling Performance Report 2026",
    description:
      "FTP, W/kg, training hours, sportive times, and improvement rates for amateur cyclists. Percentile data + methodology + downloadable JSON.",
  },
};

function formatHM(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h ${m.toString().padStart(2, "0")}`;
}

export default function BenchmarksPage() {
  return (
    <>
      {/* Dataset schema — primary structured data for this page.
          Tells search engines this is a citable dataset asset, not a
          generic article. Pairs with the Article schema below for
          E-E-A-T discoverability. */}
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Dataset",
          name: REPORT_META.title,
          alternateName: REPORT_META.shortTitle,
          description: REPORT_META.description,
          url: REPORT_META.url,
          identifier: `roadman-benchmarks-${REPORT_META.yearCovered}`,
          version: REPORT_META.version,
          datePublished: REPORT_META.datePublished,
          dateModified: REPORT_META.dateModified,
          inLanguage: "en",
          keywords: [...REPORT_META.keywords],
          license: "https://creativecommons.org/licenses/by/4.0/",
          creator: { "@id": ENTITY_IDS.organization },
          publisher: { "@id": ENTITY_IDS.organization },
          author: { "@id": ENTITY_IDS.person },
          isAccessibleForFree: true,
          variableMeasured: [
            "Functional Threshold Power (FTP) in watts",
            "Watts per kilogram of bodyweight (W/kg)",
            "Weekly training hours",
            "Sportive finish time in minutes",
            "FTP improvement (% change) over time",
          ],
          measurementTechnique:
            "Aggregated from public cycling-platform datasets, the Coggan power profile, published sportive timing results, and ~250 Roadman Cycling community riders.",
          distribution: [
            {
              "@type": "DataDownload",
              encodingFormat: "application/json",
              contentUrl: REPORT_META.url,
              name: "Roadman Cycling Benchmarks 2026 (JSON)",
            },
          ],
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: REPORT_META.title,
          description: REPORT_META.description,
          url: REPORT_META.url,
          datePublished: REPORT_META.datePublished,
          dateModified: REPORT_META.dateModified,
          author: { "@id": ENTITY_IDS.person },
          publisher: { "@id": ENTITY_IDS.organization },
          isPartOf: { "@id": ENTITY_IDS.website },
          mainEntityOfPage: REPORT_META.url,
          articleSection: "Benchmarks",
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            {
              "@type": "ListItem",
              position: 1,
              name: "Home",
              item: "https://roadmancycling.com",
            },
            {
              "@type": "ListItem",
              position: 2,
              name: "Benchmarks",
              item: REPORT_META.url,
            },
          ],
        }}
      />

      <Header />

      <main id="main-content">
        {/* Hero */}
        <Section background="deep-purple" grain className="pt-32 pb-16">
          <Container className="text-center">
            <p className="text-coral text-sm font-heading tracking-widest mb-4">
              DATA REPORT — APRIL 2026
            </p>
            <h1
              className="font-heading text-off-white mb-6"
              style={{ fontSize: "var(--text-hero)" }}
            >
              THE ROADMAN AMATEUR CYCLING
              <br />
              <span className="text-coral">PERFORMANCE REPORT 2026</span>
            </h1>
            <p className="text-foreground-muted text-lg md:text-xl max-w-3xl mx-auto leading-relaxed mb-8">
              Where do you actually sit? Percentile benchmarks for FTP,
              watts-per-kilo, training hours, sportive times, and realistic
              FTP improvement — for the actively-training amateur road
              cyclist. Aggregated from public training data, the Coggan power
              profile, and ~250 Roadman-coached riders.
            </p>

            <DownloadShareBar />

            <p className="text-foreground-subtle text-xs mt-5 max-w-xl mx-auto">
              Free to share with attribution (CC BY 4.0). Updated annually.
            </p>
          </Container>
        </Section>

        {/* Key findings */}
        <Section background="charcoal" className="!py-12">
          <Container>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {KEY_FINDINGS.map((f) => (
                <div
                  key={f.label}
                  className="bg-background-elevated rounded-xl border border-white/5 p-5 text-center"
                >
                  <p className="font-heading text-3xl md:text-4xl text-coral stat-glow mb-1">
                    {f.stat}
                  </p>
                  <p className="text-off-white text-xs md:text-sm font-medium mb-1">
                    {f.label}
                  </p>
                  <p className="text-foreground-subtle text-xs leading-snug">
                    {f.detail}
                  </p>
                </div>
              ))}
            </div>
          </Container>
        </Section>

        {/* Section 1 — FTP by age group */}
        <Section background="charcoal" id="ftp-by-age">
          <Container>
            <div className="mb-8 max-w-3xl">
              <p className="text-coral font-heading text-xs tracking-widest mb-3">
                01 — FTP BY AGE GROUP
              </p>
              <h2
                className="font-heading text-off-white mb-3"
                style={{ fontSize: "var(--text-section)" }}
              >
                ABSOLUTE POWER BY AGE
              </h2>
              <p className="text-foreground-muted leading-relaxed">
                Functional Threshold Power — roughly the wattage you can
                sustain for an hour. Numbers are absolute watts for the
                actively-training amateur male cyclist. Use the W/kg table
                below to interpret these against bodyweight.
              </p>
            </div>

            <FTPSection />

            <div className="mt-6 text-foreground-subtle text-xs max-w-3xl">
              Read the table: a 42-year-old at the median (50th percentile)
              of our actively-training cohort has an FTP of ~235W. The 90th
              percentile sits at 335W — that&apos;s competitive Cat 3
              territory.
            </div>
          </Container>
        </Section>

        {/* Section 2 — W/kg */}
        <Section background="deep-purple" grain id="wkg-by-age">
          <Container>
            <div className="mb-8 max-w-3xl">
              <p className="text-coral font-heading text-xs tracking-widest mb-3">
                02 — W/KG BY AGE GROUP
              </p>
              <h2
                className="font-heading text-off-white mb-3"
                style={{ fontSize: "var(--text-section)" }}
              >
                POWER-TO-WEIGHT BY AGE
              </h2>
              <p className="text-foreground-muted leading-relaxed">
                W/kg is the better predictor of how you&apos;ll feel on a
                climb than absolute watts. ~3.0 W/kg is roughly fit
                recreational; 4.0 W/kg sits around competitive amateur (Cat
                3); 4.5+ is regional Cat 2. Bands are calibrated against the
                Coggan power-profile categories.
              </p>
            </div>

            <WkgSection />

            <div className="mt-6 text-foreground-subtle text-xs max-w-3xl">
              <Link
                href="/tools/wkg"
                className="text-coral hover:text-coral/80 underline underline-offset-4"
              >
                Calculate your own W/kg →
              </Link>
            </div>
          </Container>
        </Section>

        {/* Section 3 — Training hours by goal */}
        <Section background="charcoal" id="training-hours">
          <Container>
            <div className="mb-8 max-w-3xl">
              <p className="text-coral font-heading text-xs tracking-widest mb-3">
                03 — TRAINING HOURS BY GOAL
              </p>
              <h2
                className="font-heading text-off-white mb-3"
                style={{ fontSize: "var(--text-section)" }}
              >
                HOW MANY HOURS DO YOU ACTUALLY NEED?
              </h2>
              <p className="text-foreground-muted leading-relaxed">
                Less than most riders assume. The bands below cover what we
                see across goals — finishing a sportive, racing one
                competitively, or holding the bunch at Cat 4 / Cat 3.
                Quality and structure beat raw volume long before the
                15-hour mark.
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              <TrainingHoursChart />
              <div className="space-y-3">
                {TRAINING_HOURS_BY_GOAL.map((row) => (
                  <div
                    key={row.goal}
                    className="bg-background-elevated rounded-xl border border-white/5 p-5"
                  >
                    <div className="flex items-baseline justify-between gap-3 mb-2">
                      <h3 className="font-heading text-lg text-off-white">
                        {row.goal.toUpperCase()}
                      </h3>
                      <p className="font-heading text-coral text-lg whitespace-nowrap">
                        {row.weeklyHoursLow}-{row.weeklyHoursHigh}h/wk
                      </p>
                    </div>
                    <p className="text-sm text-foreground-muted leading-relaxed mb-2">
                      {row.description}
                    </p>
                    <p className="text-xs text-foreground-subtle">
                      Typical weekly TSS:{" "}
                      <span className="text-off-white font-heading">
                        {row.weeklyTSS}
                      </span>
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </Container>
        </Section>

        {/* Section 4 — Sportive finish times */}
        <Section background="deep-purple" grain id="sportive-times">
          <Container>
            <div className="mb-8 max-w-3xl">
              <p className="text-coral font-heading text-xs tracking-widest mb-3">
                04 — SPORTIVE FINISH TIMES BY DIFFICULTY
              </p>
              <h2
                className="font-heading text-off-white mb-3"
                style={{ fontSize: "var(--text-section)" }}
              >
                AVERAGE FINISH TIMES BY EVENT TIER
              </h2>
              <p className="text-foreground-muted leading-relaxed">
                Aggregated from published timing results at representative
                events — Wicklow 200, Etape Caledonia, Fred Whitton, Etape
                du Tour, Marmotte. Times include feed-station stops. Use
                them to set a realistic target.
              </p>
            </div>

            <div className="overflow-x-auto rounded-xl border border-white/5 bg-background-elevated">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="px-4 py-3 font-heading text-xs tracking-widest text-foreground-subtle">
                      TIER
                    </th>
                    <th className="px-4 py-3 font-heading text-xs tracking-widest text-foreground-subtle">
                      DISTANCE
                    </th>
                    <th className="px-4 py-3 font-heading text-xs tracking-widest text-foreground-subtle">
                      CLIMBING
                    </th>
                    <th className="px-4 py-3 font-heading text-xs tracking-widest text-foreground-subtle text-right">
                      25TH
                    </th>
                    <th className="px-4 py-3 font-heading text-xs tracking-widest text-foreground-subtle text-right">
                      MEDIAN
                    </th>
                    <th className="px-4 py-3 font-heading text-xs tracking-widest text-foreground-subtle text-right">
                      75TH
                    </th>
                    <th className="px-4 py-3 font-heading text-xs tracking-widest text-coral text-right">
                      90TH
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {SPORTIVE_TIERS.map((t) => (
                    <tr
                      key={t.tier}
                      className="border-b border-white/5 last:border-b-0 hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="px-4 py-3">
                        <p className="font-heading text-off-white">{t.tier}</p>
                        <p className="text-xs text-foreground-subtle">
                          {t.tierLabel}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-foreground-muted">
                        {t.distanceKm}
                      </td>
                      <td className="px-4 py-3 text-foreground-muted">
                        {t.climbingM}
                      </td>
                      <td className="px-4 py-3 text-right text-foreground-muted">
                        {formatHM(t.p25Minutes)}
                      </td>
                      <td className="px-4 py-3 text-right text-off-white">
                        {formatHM(t.p50Minutes)}
                      </td>
                      <td className="px-4 py-3 text-right text-foreground-muted">
                        {formatHM(t.p75Minutes)}
                      </td>
                      <td className="px-4 py-3 text-right font-heading text-coral">
                        {formatHM(t.p90Minutes)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mt-6 text-sm text-foreground-muted">
              {SPORTIVE_TIERS.map((t) => (
                <div
                  key={t.tier + "-examples"}
                  className="rounded-lg border border-white/5 bg-white/[0.02] p-4"
                >
                  <p className="font-heading text-xs tracking-widest text-coral mb-1">
                    {t.tier.toUpperCase()} EXAMPLES
                  </p>
                  <p className="text-foreground-muted text-sm">{t.examples}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 text-foreground-subtle text-xs max-w-3xl">
              Want a finish-time prediction for a specific event and your
              current power?{" "}
              <Link
                href="/predict"
                className="text-coral hover:text-coral/80 underline underline-offset-4"
              >
                Try the Race Time Predictor →
              </Link>
            </div>
          </Container>
        </Section>

        {/* Section 5 — FTP improvement rates */}
        <Section background="charcoal" id="improvement-rates">
          <Container>
            <div className="mb-8 max-w-3xl">
              <p className="text-coral font-heading text-xs tracking-widest mb-3">
                05 — REALISTIC FTP IMPROVEMENT
              </p>
              <h2
                className="font-heading text-off-white mb-3"
                style={{ fontSize: "var(--text-section)" }}
              >
                WHAT&apos;S A REALISTIC GAIN?
              </h2>
              <p className="text-foreground-muted leading-relaxed">
                Under structured training, with a credible baseline test and
                consistent execution. The typical band is what most coached
                riders see; the top quartile combines structure, body
                composition gains, and proper recovery.
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              <ImprovementChart />
              <div className="space-y-3">
                {FTP_IMPROVEMENT_RATES.map((r) => (
                  <div
                    key={r.label}
                    className="bg-background-elevated rounded-xl border border-white/5 p-5"
                  >
                    <h3 className="font-heading text-lg text-off-white mb-2">
                      {r.label.toUpperCase()}
                    </h3>
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div className="rounded-lg bg-purple/20 border border-purple/30 px-3 py-2">
                        <p className="text-xs text-foreground-subtle font-heading tracking-widest mb-0.5">
                          TYPICAL
                        </p>
                        <p className="font-heading text-off-white text-lg">
                          +{r.typicalLowPct}%-{r.typicalHighPct}%
                        </p>
                      </div>
                      <div className="rounded-lg bg-coral/10 border border-coral/30 px-3 py-2">
                        <p className="text-xs text-foreground-subtle font-heading tracking-widest mb-0.5">
                          TOP QUARTILE
                        </p>
                        <p className="font-heading text-coral text-lg">
                          +{r.topQuartileLowPct}%-{r.topQuartileHighPct}%
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-foreground-muted leading-relaxed">
                      {r.notes}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </Container>
        </Section>

        {/* Internal tools cluster */}
        <Section background="deep-purple" grain id="related-tools">
          <Container width="narrow">
            <div className="text-center mb-10">
              <p className="text-coral font-heading text-xs tracking-widest mb-3">
                USE THE NUMBERS
              </p>
              <h2
                className="font-heading text-off-white mb-3"
                style={{ fontSize: "var(--text-section)" }}
              >
                RELATED ROADMAN TOOLS
              </h2>
              <p className="text-foreground-muted leading-relaxed max-w-2xl mx-auto">
                Now that you know where you sit, work out exactly how to
                move. Free, instant, no signup required.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              {[
                {
                  href: "/tools/ftp-zones",
                  title: "FTP Zone Calculator",
                  detail: "Turn your FTP into 7 power-zone targets.",
                },
                {
                  href: "/tools/wkg",
                  title: "Watts/kg Calculator",
                  detail: "Slot yourself into the percentile tables above.",
                },
                {
                  href: "/predict",
                  title: "Race Time Predictor",
                  detail: "Forecast a sportive finish from your power and weight.",
                },
                {
                  href: "/tools/race-weight",
                  title: "Race Weight Calculator",
                  detail: "Find the W/kg lift available from body comp alone.",
                },
                {
                  href: "/tools/hr-zones",
                  title: "HR Zone Calculator",
                  detail: "If you don't train with power yet.",
                },
                {
                  href: "/tools/fuelling",
                  title: "Fuelling Calculator",
                  detail: "Carb targets that hold a Cat-3 race or Tier-3 sportive together.",
                },
              ].map((t) => (
                <Link
                  key={t.href}
                  href={t.href}
                  className="group block p-5 rounded-lg bg-white/5 hover:bg-coral/10 border border-white/5 hover:border-coral/30 transition-all"
                >
                  <p className="font-heading text-base text-off-white group-hover:text-coral transition-colors tracking-wide mb-1">
                    {t.title.toUpperCase()}
                  </p>
                  <p className="text-xs text-foreground-subtle leading-relaxed">
                    {t.detail}
                  </p>
                </Link>
              ))}
            </div>
          </Container>
        </Section>

        {/* Methodology */}
        <Section background="charcoal" id="methodology">
          <Container width="narrow">
            <div className="mb-10">
              <p className="text-coral font-heading text-xs tracking-widest mb-3">
                METHODOLOGY
              </p>
              <h2
                className="font-heading text-off-white mb-3"
                style={{ fontSize: "var(--text-section)" }}
              >
                HOW THIS REPORT WAS BUILT
              </h2>
              <p className="text-foreground-muted leading-relaxed">
                We aggregated public training-platform releases and the
                Coggan power-profile reference, then triangulated against
                ~{REPORT_META.sampleSize} actively-training riders inside
                the Roadman community. Every number on this page is
                indicative — not the output of a single primary academic
                study.
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="font-heading text-lg text-off-white mb-3">
                  POPULATION
                </h3>
                <p className="text-sm text-foreground-muted leading-relaxed mb-3">
                  {REPORT_META.populationDescription}
                </p>
                <ul className="space-y-2">
                  {METHODOLOGY.inclusionCriteria.map((c) => (
                    <li
                      key={c}
                      className="flex items-start gap-2 text-sm text-foreground-muted"
                    >
                      <span className="text-coral mt-0.5 shrink-0">&#10003;</span>
                      {c}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="font-heading text-lg text-off-white mb-3">
                  SOURCES
                </h3>
                <ul className="space-y-3">
                  {METHODOLOGY.sources.map((s) => (
                    <li
                      key={s.name}
                      className="rounded-lg border border-white/5 bg-background-elevated p-4"
                    >
                      <p className="font-heading text-sm text-off-white mb-1">
                        {s.name.toUpperCase()}
                      </p>
                      <p className="text-xs text-foreground-muted leading-relaxed">
                        {s.detail}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="font-heading text-lg text-off-white mb-3">
                  LIMITATIONS — READ BEFORE QUOTING
                </h3>
                <ul className="space-y-2">
                  {METHODOLOGY.limitations.map((l) => (
                    <li
                      key={l}
                      className="flex items-start gap-2 text-sm text-foreground-muted leading-relaxed"
                    >
                      <span className="text-foreground-subtle mt-0.5 shrink-0">
                        &middot;
                      </span>
                      {l}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-xl border border-white/5 bg-background-elevated p-5">
                <p className="font-heading text-sm text-off-white mb-2">
                  CITATION
                </p>
                <p className="text-xs text-foreground-muted leading-relaxed mb-3">
                  Roadman Cycling. <em>{REPORT_META.title}.</em> Version{" "}
                  {REPORT_META.version}, {REPORT_META.datePublished}.{" "}
                  Available at{" "}
                  <Link
                    href="/benchmarks"
                    className="text-coral hover:text-coral/80 underline underline-offset-4"
                  >
                    {REPORT_META.url}
                  </Link>
                  .
                </p>
                <p className="text-xs text-foreground-subtle">
                  Licensed CC BY 4.0 — share or reuse with attribution.
                </p>
              </div>
            </div>
          </Container>
        </Section>

        {/* Coaching CTA */}
        <Section background="coral" className="!py-16 md:!py-20">
          <Container className="text-center">
            <p className="font-heading text-off-white/80 text-xs tracking-widest mb-4">
              WANT TO MOVE UP A PERCENTILE?
            </p>
            <h2
              className="font-heading text-off-white mb-4"
              style={{ fontSize: "var(--text-section)" }}
            >
              KNOW THE NUMBER. NOW SHIFT IT.
            </h2>
            <p className="text-off-white/85 max-w-2xl mx-auto mb-8 leading-relaxed">
              The riders who jump from the median to the 75th and 90th
              don&apos;t train more — they train smarter, eat better, and
              recover with intent. Roadman coaching is the system that
              makes the move repeatable.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
              <Link
                href="/apply"
                className="inline-flex items-center justify-center gap-2 font-heading tracking-wider uppercase rounded-md px-8 py-4 text-base bg-off-white text-coral hover:bg-off-white/90 shadow-lg transition-colors"
                data-track="benchmarks_apply_cta"
              >
                Apply for Coaching
              </Link>
              <Button href="/coaching" variant="ghost" size="lg" className="text-off-white border-off-white/40 hover:bg-off-white/10">
                See How It Works
              </Button>
            </div>
            <p className="text-off-white/60 text-xs mt-6">
              $195/month · 7-day free trial · Cancel anytime
            </p>
          </Container>
        </Section>
      </main>

      <Footer />
    </>
  );
}
