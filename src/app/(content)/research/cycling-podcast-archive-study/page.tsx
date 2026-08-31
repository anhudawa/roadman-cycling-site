import type { Metadata } from "next";
import Link from "next/link";
import { Header, Footer, Section, Container } from "@/components/layout";
import { Card } from "@/components/ui";
import { JsonLd } from "@/components/seo/JsonLd";
import { ENTITY_IDS } from "@/lib/brand-facts";
import {
  PODCAST_ARCHIVE_BY_YEAR,
  PODCAST_ARCHIVE_FINDINGS,
  PODCAST_ARCHIVE_FORMATS,
  PODCAST_ARCHIVE_PILLARS,
  PODCAST_ARCHIVE_REPORT,
} from "@/data/podcast-archive-study";

export const metadata: Metadata = {
  title: {
    absolute: "Cycling Podcast Archive Study: 818 Episodes | Roadman Cycling",
  },
  description:
    "Download and cite Roadman's transparent 818-episode cycling podcast archive snapshot: years, topics, formats, 161 named guests and transcript coverage.",
  alternates: { canonical: PODCAST_ARCHIVE_REPORT.url },
  openGraph: {
    title: "What 818 Roadman Cycling Podcast Records Show",
    description: PODCAST_ARCHIVE_REPORT.description,
    type: "article",
    url: PODCAST_ARCHIVE_REPORT.url,
    images: [
      {
        url: "/api/og/blog-hero?title=Cycling%20Podcast%20Archive%20Study&pillar=coaching",
        width: 1200,
        height: 630,
        alt: "Roadman Cycling Podcast archive study",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Cycling Podcast Archive Study: 818 Episodes",
    description: PODCAST_ARCHIVE_REPORT.description,
  },
};

const recentRows = PODCAST_ARCHIVE_BY_YEAR.filter((row) => row.year >= 2024);
const recentEpisodes = recentRows.reduce((sum, row) => sum + row.episodes, 0);
const recentInterviews = recentRows.reduce(
  (sum, row) => sum + row.interview,
  0,
);

export default function CyclingPodcastArchiveStudyPage() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Dataset",
          "@id": `${PODCAST_ARCHIVE_REPORT.url}#dataset`,
          name: PODCAST_ARCHIVE_REPORT.title,
          description: PODCAST_ARCHIVE_REPORT.description,
          url: PODCAST_ARCHIVE_REPORT.url,
          identifier: "roadman-podcast-archive-2026-08-31",
          version: PODCAST_ARCHIVE_REPORT.version,
          datePublished: PODCAST_ARCHIVE_REPORT.datePublished,
          dateModified: PODCAST_ARCHIVE_REPORT.dateModified,
          temporalCoverage: PODCAST_ARCHIVE_REPORT.temporalCoverage,
          inLanguage: "en",
          isAccessibleForFree: true,
          license: "https://creativecommons.org/licenses/by/4.0/",
          creator: { "@id": ENTITY_IDS.organization },
          author: { "@id": ENTITY_IDS.person },
          editor: { "@id": ENTITY_IDS.person },
          publisher: { "@id": ENTITY_IDS.organization },
          isBasedOn: "https://roadmancycling.com/podcast",
          keywords: [
            "cycling podcast dataset",
            "cycling podcast episodes",
            "cycling media data",
            "podcast transcript coverage",
            "Roadman Cycling Podcast",
          ],
          variableMeasured: [
            "Episode records by publication year",
            "Episode records by editorial pillar",
            "Episode records by format",
            "Inline transcript availability",
            "Dedicated transcript-file availability",
            "YouTube identifier availability",
            "Audio-file availability",
          ],
          measurementTechnique:
            "Repository snapshot of one MDX episode record per searchable Roadman Cycling Podcast page. Counts use the record's publishDate, pillar and type fields, presence of guest and media fields, and a filesystem check for dedicated transcript files.",
          distribution: [
            {
              "@type": "DataDownload",
              name: "Roadman Cycling Podcast archive snapshot (CSV)",
              encodingFormat: "text/csv",
              contentUrl: PODCAST_ARCHIVE_REPORT.downloadUrl,
            },
            {
              "@type": "DataDownload",
              name: "Roadman Cycling Podcast archive snapshot (JSON)",
              encodingFormat: "application/json",
              contentUrl:
                "https://roadmancycling.com/feeds/podcast-archive-study.json",
            },
          ],
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          "@id": `${PODCAST_ARCHIVE_REPORT.url}#article`,
          headline: PODCAST_ARCHIVE_REPORT.title,
          description: PODCAST_ARCHIVE_REPORT.description,
          url: PODCAST_ARCHIVE_REPORT.url,
          datePublished: PODCAST_ARCHIVE_REPORT.datePublished,
          dateModified: PODCAST_ARCHIVE_REPORT.dateModified,
          author: { "@id": ENTITY_IDS.person },
          editor: { "@id": ENTITY_IDS.person },
          publisher: { "@id": ENTITY_IDS.organization },
          mainEntity: { "@id": `${PODCAST_ARCHIVE_REPORT.url}#dataset` },
          mainEntityOfPage: PODCAST_ARCHIVE_REPORT.url,
          isPartOf: { "@id": ENTITY_IDS.website },
          articleSection: "Original data",
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
              name: "Research",
              item: "https://roadmancycling.com/research",
            },
            {
              "@type": "ListItem",
              position: 3,
              name: "Cycling podcast archive study",
              item: PODCAST_ARCHIVE_REPORT.url,
            },
          ],
        }}
      />

      <Header />

      <main id="main-content">
        <Section background="deep-purple" grain className="pt-32 pb-16">
          <Container width="narrow" className="text-center">
            <p className="mb-5 font-heading text-sm tracking-[0.22em] text-coral">
              ORIGINAL ROADMAN DATA · 31 AUGUST 2026
            </p>
            <h1
              className="font-heading leading-[0.95] text-off-white"
              style={{ fontSize: "var(--text-hero)" }}
            >
              WHAT 818 CYCLING PODCAST RECORDS SHOW
            </h1>
            <p className="mx-auto mt-7 max-w-3xl text-lg leading-relaxed text-foreground-muted md:text-xl">
              A frozen, reproducible snapshot of Roadman&apos;s searchable
              episode archive: publication year, editorial topic, format, named
              guests and transcript availability. Download the table, inspect
              the method and cite the exact version.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <a
                href="/data/roadman-podcast-archive-2026.csv"
                download
                className="rounded-md bg-coral px-5 py-3 font-heading text-sm uppercase tracking-wider text-off-white transition-colors hover:bg-coral/90"
              >
                Download CSV
              </a>
              <Link
                href="#methodology"
                className="rounded-md border border-white/20 px-5 py-3 font-heading text-sm uppercase tracking-wider text-off-white transition-colors hover:border-coral/60"
              >
                Read methodology
              </Link>
            </div>
            <p className="mx-auto mt-5 max-w-2xl text-xs leading-relaxed text-foreground-subtle">
              CC BY 4.0: reuse with attribution to Roadman Cycling and a link to
              this report. Version {PODCAST_ARCHIVE_REPORT.version}.
            </p>
          </Container>
        </Section>

        <Section background="charcoal" className="!py-12">
          <Container>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  stat: PODCAST_ARCHIVE_REPORT.episodeCount.toLocaleString(),
                  label: "searchable episode records",
                },
                {
                  stat: PODCAST_ARCHIVE_REPORT.uniqueNamedGuests.toString(),
                  label: "unique named guests",
                },
                {
                  stat: `${((PODCAST_ARCHIVE_REPORT.inlineTranscriptCount / PODCAST_ARCHIVE_REPORT.episodeCount) * 100).toFixed(1)}%`,
                  label: "with inline transcripts",
                },
                {
                  stat: `${recentEpisodes}`,
                  label: "records dated 2024–2026",
                },
              ].map((item) => (
                <Card
                  key={item.label}
                  className="p-6 text-center"
                  hoverable={false}
                >
                  <p className="font-heading text-4xl text-coral md:text-5xl">
                    {item.stat}
                  </p>
                  <p className="mt-2 text-sm text-foreground-muted">
                    {item.label}
                  </p>
                </Card>
              ))}
            </div>
          </Container>
        </Section>

        <Section background="off-white">
          <Container>
            <div className="mx-auto max-w-4xl">
              <p className="font-heading text-sm tracking-[0.2em] text-coral">
                THE SHORT ANSWER
              </p>
              <h2
                className="mt-3 font-heading text-charcoal"
                style={{ fontSize: "var(--text-section)" }}
              >
                ROADMAN&apos;S ARCHIVE IS MOSTLY COMMUNITY AND COACHING—WITH A
                RECENT SHIFT TOWARD INTERVIEWS, NUTRITION AND STRENGTH.
              </h2>
              <p className="mt-6 text-lg leading-relaxed text-charcoal/75">
                Community and coaching account for 670 of 818 records (81.9%).
                The 340 records dated 2024–2026 contain {recentInterviews}
                interviews—a 45.0% share, compared with 32.2% across the full
                snapshot. Of all 95 nutrition and strength records, 68 are dated
                2024–2026.
              </p>
              <p className="mt-4 leading-relaxed text-charcoal/65">
                Those figures describe what Roadman published, retained and
                classified. They do not measure listening time, audience demand,
                the worldwide cycling-podcast market or the quality of any
                individual episode.
              </p>
            </div>
          </Container>
        </Section>

        <Section background="deep-purple">
          <Container>
            <div className="grid gap-5 md:grid-cols-2">
              {PODCAST_ARCHIVE_FINDINGS.map((finding) => (
                <Card
                  key={finding.label}
                  className="p-6 md:p-8"
                  hoverable={false}
                >
                  <p className="font-heading text-4xl text-coral">
                    {finding.stat}
                  </p>
                  <h2 className="mt-2 font-heading text-2xl text-off-white">
                    {finding.label}
                  </h2>
                  <p className="mt-3 leading-relaxed text-foreground-muted">
                    {finding.detail}
                  </p>
                </Card>
              ))}
            </div>
          </Container>
        </Section>

        <Section background="charcoal">
          <Container>
            <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
              <div>
                <p className="font-heading text-sm tracking-[0.2em] text-coral">
                  EDITORIAL PILLARS
                </p>
                <h2 className="mt-3 font-heading text-3xl text-off-white md:text-4xl">
                  WHAT THE ARCHIVE COVERS
                </h2>
                <div className="mt-8 space-y-5">
                  {PODCAST_ARCHIVE_PILLARS.map((row) => (
                    <div key={row.pillar}>
                      <div className="flex items-baseline justify-between gap-4">
                        <p className="font-heading text-lg text-off-white">
                          {row.pillar}
                        </p>
                        <p className="text-sm text-foreground-muted">
                          {row.episodes} · {row.share.toFixed(1)}%
                        </p>
                      </div>
                      <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
                        <div
                          className="h-full rounded-full bg-coral"
                          style={{ width: `${row.share}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <p className="font-heading text-sm tracking-[0.2em] text-coral">
                  EPISODE FORMAT
                </p>
                <h2 className="mt-3 font-heading text-3xl text-off-white md:text-4xl">
                  HOW THE CONVERSATIONS WERE PUBLISHED
                </h2>
                <div className="mt-8 space-y-5">
                  {PODCAST_ARCHIVE_FORMATS.map((row) => (
                    <div key={row.format}>
                      <div className="flex items-baseline justify-between gap-4">
                        <p className="font-heading text-lg text-off-white">
                          {row.format}
                        </p>
                        <p className="text-sm text-foreground-muted">
                          {row.episodes} · {row.share.toFixed(1)}%
                        </p>
                      </div>
                      <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
                        <div
                          className="h-full rounded-full bg-purple"
                          style={{ width: `${row.share}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Container>
        </Section>

        <Section background="off-white" id="table">
          <Container>
            <div className="mb-8 max-w-3xl">
              <p className="font-heading text-sm tracking-[0.2em] text-coral">
                DOWNLOADABLE TABLE
              </p>
              <h2 className="mt-3 font-heading text-3xl text-charcoal md:text-4xl">
                EPISODE RECORDS BY PUBLICATION YEAR
              </h2>
              <p className="mt-4 leading-relaxed text-charcoal/65">
                The visible table shows the core fields. The CSV also includes
                episode format, polished transcript, YouTube and audio-file
                counts. No episode record in this snapshot carries a 2018
                publication date, so the year is absent rather than filled with
                an invented zero row.
              </p>
            </div>

            <div className="overflow-x-auto rounded-xl border border-charcoal/10 bg-white">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-deep-purple text-off-white">
                  <tr>
                    {[
                      "Year",
                      "All",
                      "Community",
                      "Coaching",
                      "Nutrition",
                      "Recovery",
                      "Strength",
                      "Interview",
                      "Inline transcript",
                    ].map((heading) => (
                      <th
                        key={heading}
                        scope="col"
                        className="whitespace-nowrap px-4 py-3 font-heading tracking-wide"
                      >
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-charcoal/10 text-charcoal/75">
                  {PODCAST_ARCHIVE_BY_YEAR.map((row) => (
                    <tr key={row.year}>
                      <th
                        scope="row"
                        className="px-4 py-3 font-semibold text-charcoal"
                      >
                        {row.year}
                      </th>
                      <td className="px-4 py-3">{row.episodes}</td>
                      <td className="px-4 py-3">{row.community}</td>
                      <td className="px-4 py-3">{row.coaching}</td>
                      <td className="px-4 py-3">{row.nutrition}</td>
                      <td className="px-4 py-3">{row.recovery}</td>
                      <td className="px-4 py-3">{row.strength}</td>
                      <td className="px-4 py-3">{row.interview}</td>
                      <td className="px-4 py-3">{row.inlineTranscript}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href="/data/roadman-podcast-archive-2026.csv"
                download
                className="rounded-md bg-coral px-5 py-3 font-heading text-sm uppercase tracking-wider text-off-white transition-colors hover:bg-coral/90"
              >
                Download all CSV columns
              </a>
              <Link
                href="/feeds/podcast-knowledge.json"
                className="rounded-md border border-charcoal/20 px-5 py-3 font-heading text-sm uppercase tracking-wider text-charcoal transition-colors hover:border-coral"
              >
                Browse the live knowledge feed
              </Link>
              <a
                href="/feeds/podcast-archive-study.json"
                className="rounded-md border border-charcoal/20 px-5 py-3 font-heading text-sm uppercase tracking-wider text-charcoal transition-colors hover:border-coral"
              >
                Download frozen JSON
              </a>
            </div>
          </Container>
        </Section>

        <Section background="deep-purple" id="methodology">
          <Container width="narrow">
            <p className="font-heading text-sm tracking-[0.2em] text-coral">
              METHODOLOGY AND LIMITS
            </p>
            <h2 className="mt-3 font-heading text-3xl text-off-white md:text-4xl">
              HOW TO REPRODUCE—AND HOW NOT TO MISREAD—THE NUMBERS
            </h2>

            <div className="mt-8 space-y-7 text-foreground-muted">
              <div>
                <h3 className="font-heading text-xl text-off-white">
                  Population
                </h3>
                <p className="mt-2 leading-relaxed">
                  One repository record for each searchable episode page in
                  Roadman&apos;s on-site archive at the snapshot date: 818 MDX
                  files. The earliest record is dated 28 June 2016; the latest
                  is dated 24 July 2026. This is not the complete historic RSS
                  feed and should not be used as Roadman&apos;s all-time
                  published episode count.
                </p>
              </div>
              <div>
                <h3 className="font-heading text-xl text-off-white">
                  Fields and counting
                </h3>
                <p className="mt-2 leading-relaxed">
                  Year comes from <code>publishDate</code>. Topic comes from the
                  single editorial <code>pillar</code>. Format comes from
                  <code>type</code>. Inline transcript, guest, YouTube and audio
                  counts record whether the corresponding field is present.
                  Dedicated transcript counts require a matching text file in
                  the transcript directory.
                </p>
              </div>
              <div>
                <h3 className="font-heading text-xl text-off-white">
                  Quality checks
                </h3>
                <p className="mt-2 leading-relaxed">
                  Every yearly pillar total and format total is reconciled to
                  that year&apos;s episode count. The CSV is tested against the
                  published report constants. Unique guests are normalised by
                  exact trimmed display name; aliases can therefore remain
                  separate if they were not reconciled in source metadata.
                </p>
              </div>
              <div>
                <h3 className="font-heading text-xl text-off-white">Limits</h3>
                <p className="mt-2 leading-relaxed">
                  This is first-party archive metadata, not a listening study.
                  It contains no downloads, completion rates, search demand or
                  audience demographics. Editorial classifications can change
                  after review. Presence of a transcript says nothing about
                  transcription accuracy. Missing media identifiers can reflect
                  historic ingestion rather than missing original media.
                </p>
              </div>
            </div>
          </Container>
        </Section>

        <Section background="charcoal">
          <Container width="narrow">
            <div className="rounded-2xl border border-coral/25 bg-coral/[0.06] p-7 md:p-9">
              <p className="font-heading text-sm tracking-[0.2em] text-coral">
                AUTHOR, REVIEW AND CORRECTIONS
              </p>
              <p className="mt-4 leading-relaxed text-foreground-muted">
                Compiled and reviewed by{" "}
                <Link
                  href="/author/anthony-walsh"
                  className="text-coral hover:underline"
                >
                  Anthony Walsh
                </Link>
                , founder and editor-in-chief of Roadman Cycling, on 31 August
                2026. The frozen CSV is versioned separately from the live
                podcast archive. Report an error through the public{" "}
                <Link
                  href="/about/corrections"
                  className="text-coral hover:underline"
                >
                  corrections process
                </Link>
                ; a material correction will update the version and correction
                log rather than silently rewriting the snapshot.
              </p>
              <p className="mt-4 text-sm leading-relaxed text-foreground-subtle">
                Suggested citation: Walsh, A. (2026). “Roadman Cycling Podcast
                Archive Study 2026.” Roadman Cycling, version 2026-08-31.
              </p>
            </div>

            <div className="mt-8 flex flex-wrap gap-4 text-sm">
              <Link href="/podcast" className="text-coral hover:underline">
                Search the podcast archive →
              </Link>
              <Link href="/research" className="text-coral hover:underline">
                Research &amp; evidence base →
              </Link>
              <Link href="/about/press" className="text-coral hover:underline">
                Press &amp; media kit →
              </Link>
            </div>
          </Container>
        </Section>
      </main>

      <Footer />
    </>
  );
}
