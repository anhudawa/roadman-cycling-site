import type { Metadata } from "next";
import Link from "next/link";
import { Header, Footer, Section, Container } from "@/components/layout";
import { Button, Card, ScrollReveal } from "@/components/ui";
import { JsonLd } from "@/components/seo/JsonLd";
import { ENTITY_IDS, FOUNDER, SITE_ORIGIN } from "@/lib/brand-facts";

const PAGE_URL = `${SITE_ORIGIN}/about/corrections`;

const PAGE_DESCRIPTION =
  "The Roadman Cycling correction log. Every public correction we have made to an article, episode summary, or coaching guide — dated, with the original wording preserved.";

export const metadata: Metadata = {
  title: "Corrections — Roadman Cycling",
  description: PAGE_DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: "Corrections — Roadman Cycling",
    description: PAGE_DESCRIPTION,
    type: "article",
    url: PAGE_URL,
  },
};

interface Correction {
  /** ISO 8601 date the correction was published */
  date: string;
  /** Title of the corrected piece */
  pageTitle: string;
  /** Canonical URL of the corrected piece */
  pageUrl: string;
  /** Type of issue: factual, attribution, numerical, contextual */
  type: "factual" | "attribution" | "numerical" | "contextual";
  /** What the original wording or claim said */
  original: string;
  /** What it now says, and why */
  correction: string;
}

// Corrections are added newest-first. Each entry must include the date,
// the page title and URL, the original wording (preserved verbatim),
// and the corrected wording with the reason. Once published here, an
// entry is never edited or removed — only superseded by a later entry
// that points back to it. Empty until the first correction lands.
const corrections: Correction[] = [];

const typeStyles: Record<Correction["type"], { label: string; color: string }> = {
  factual: { label: "FACTUAL", color: "text-coral" },
  attribution: { label: "ATTRIBUTION", color: "text-fuchsia-300" },
  numerical: { label: "NUMERICAL", color: "text-amber-300" },
  contextual: { label: "CONTEXTUAL", color: "text-green-400" },
};

function formatDate(iso: string) {
  // Use UTC to avoid SSR/client locale drift in date rendering.
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

export default function CorrectionsPage() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: "Corrections — Roadman Cycling",
          url: PAGE_URL,
          description: PAGE_DESCRIPTION,
          isPartOf: { "@id": ENTITY_IDS.website },
          mainEntity: { "@id": ENTITY_IDS.organization },
          about: { "@id": ENTITY_IDS.organization },
          publisher: { "@id": ENTITY_IDS.organization },
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: SITE_ORIGIN },
            { "@type": "ListItem", position: 2, name: "About", item: `${SITE_ORIGIN}/about` },
            { "@type": "ListItem", position: 3, name: "Corrections", item: PAGE_URL },
          ],
        }}
      />

      <Header />

      <main id="main-content">
        <Section background="deep-purple" grain className="pt-32 pb-14">
          <Container width="narrow">
            <ScrollReveal direction="up">
              <p className="text-coral font-heading text-sm tracking-widest mb-4">
                TRUST · CORRECTION LOG
              </p>
              <h1
                className="font-heading text-off-white mb-6"
                style={{ fontSize: "var(--text-hero)" }}
              >
                CORRECTIONS
              </h1>
              <p className="text-off-white text-xl leading-relaxed mb-6">
                {PAGE_DESCRIPTION}
              </p>
              <p className="text-foreground-muted leading-relaxed">
                If we get something wrong, we fix it on the page and log the
                change here. Original wording is preserved so the change is
                visible. The full editorial process behind every piece is
                documented in{" "}
                <Link href="/about/how-we-create-content" className="text-coral hover:underline">
                  How We Create Content
                </Link>
                .
              </p>
            </ScrollReveal>
          </Container>
        </Section>

        {/* Schema explainer */}
        <Section background="charcoal" className="!py-10">
          <Container width="narrow">
            <ScrollReveal direction="up">
              <h2 className="font-heading text-xl text-off-white tracking-wide mb-4">
                WHAT EVERY CORRECTION INCLUDES
              </h2>
              <div className="grid sm:grid-cols-2 gap-3">
                <Card className="p-5" hoverable={false}>
                  <p className="text-xs text-coral font-heading tracking-widest mb-2">
                    DATE
                  </p>
                  <p className="text-sm text-foreground-muted leading-relaxed">
                    The date the correction was published, in ISO 8601 form.
                    Once an entry lands here, it is never edited or deleted.
                  </p>
                </Card>
                <Card className="p-5" hoverable={false}>
                  <p className="text-xs text-coral font-heading tracking-widest mb-2">
                    PAGE
                  </p>
                  <p className="text-sm text-foreground-muted leading-relaxed">
                    The title and URL of the article, episode summary, or
                    guide that was corrected. Linked so you can read the live
                    page.
                  </p>
                </Card>
                <Card className="p-5" hoverable={false}>
                  <p className="text-xs text-coral font-heading tracking-widest mb-2">
                    TYPE
                  </p>
                  <p className="text-sm text-foreground-muted leading-relaxed">
                    Factual, attribution, numerical, or contextual — so the
                    nature of the change is clear at a glance.
                  </p>
                </Card>
                <Card className="p-5" hoverable={false}>
                  <p className="text-xs text-coral font-heading tracking-widest mb-2">
                    BEFORE & AFTER
                  </p>
                  <p className="text-sm text-foreground-muted leading-relaxed">
                    The original wording (verbatim) and the corrected wording,
                    with a short note on the reason for the change.
                  </p>
                </Card>
              </div>
            </ScrollReveal>
          </Container>
        </Section>

        {/* Log */}
        <Section background="charcoal">
          <Container width="narrow">
            <ScrollReveal direction="up">
              <h2 className="font-heading text-2xl text-off-white tracking-wide mb-6">
                THE LOG
              </h2>
            </ScrollReveal>

            {corrections.length === 0 ? (
              <Card className="p-8 text-center" hoverable={false}>
                <p className="font-heading text-coral text-sm tracking-widest mb-3">
                  NO CORRECTIONS YET
                </p>
                <p className="text-foreground-muted leading-relaxed max-w-lg mx-auto">
                  No public corrections have been logged. When we make one, it
                  appears here — newest first — with the date, the page, the
                  original wording, and the corrected wording.
                </p>
                <p className="text-foreground-subtle text-xs mt-6">
                  Spot something we got wrong?{" "}
                  <a
                    href={`mailto:${FOUNDER.email}?subject=Editorial%20correction`}
                    className="text-coral hover:underline"
                  >
                    Email {FOUNDER.email}
                  </a>
                  .
                </p>
              </Card>
            ) : (
              <ol className="space-y-4">
                {corrections.map((c, i) => {
                  const typeStyle = typeStyles[c.type];
                  return (
                    <li key={`${c.date}-${i}`}>
                      <Card className="p-6" hoverable={false}>
                        <div className="flex items-baseline justify-between gap-3 mb-3 flex-wrap">
                          <time
                            dateTime={c.date}
                            className="font-heading text-coral text-sm tracking-widest"
                          >
                            {formatDate(c.date).toUpperCase()}
                          </time>
                          <span
                            className={`text-xs font-heading tracking-widest ${typeStyle.color}`}
                          >
                            {typeStyle.label}
                          </span>
                        </div>
                        <Link
                          href={c.pageUrl}
                          className="font-heading text-off-white tracking-wide mb-4 inline-block hover:text-coral transition-colors"
                        >
                          {c.pageTitle.toUpperCase()}
                        </Link>
                        <div className="space-y-3 text-sm leading-relaxed">
                          <div>
                            <p className="text-xs font-heading tracking-widest text-foreground-subtle mb-1">
                              ORIGINAL
                            </p>
                            <p className="text-foreground-muted line-through decoration-coral/40">
                              {c.original}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs font-heading tracking-widest text-foreground-subtle mb-1">
                              CORRECTED
                            </p>
                            <p className="text-off-white">{c.correction}</p>
                          </div>
                        </div>
                      </Card>
                    </li>
                  );
                })}
              </ol>
            )}
          </Container>
        </Section>

        {/* Related */}
        <Section background="deep-purple" grain>
          <Container width="narrow">
            <ScrollReveal direction="up">
              <h2 className="font-heading text-2xl text-off-white tracking-wide mb-6">
                RELATED PAGES
              </h2>
            </ScrollReveal>
            <div className="grid sm:grid-cols-2 gap-3">
              <Card href="/about/how-we-create-content" className="p-5">
                <p className="font-heading text-off-white group-hover:text-coral transition-colors mb-1">
                  HOW WE CREATE CONTENT
                </p>
                <p className="text-xs text-foreground-subtle leading-relaxed">
                  The full editorial pipeline and evidence grading scale.
                </p>
              </Card>
              <Card href="/editorial-standards" className="p-5">
                <p className="font-heading text-off-white group-hover:text-coral transition-colors mb-1">
                  EDITORIAL STANDARDS
                </p>
                <p className="text-xs text-foreground-subtle leading-relaxed">
                  The rules every article and episode must meet.
                </p>
              </Card>
              <Card href="/about/expert-reviewers" className="p-5">
                <p className="font-heading text-off-white group-hover:text-coral transition-colors mb-1">
                  EXPERT REVIEWER BOARD
                </p>
                <p className="text-xs text-foreground-subtle leading-relaxed">
                  Who reviews what before it ships.
                </p>
              </Card>
              <Card href="/entity/anthony-walsh" className="p-5">
                <p className="font-heading text-off-white group-hover:text-coral transition-colors mb-1">
                  ANTHONY WALSH
                </p>
                <p className="text-xs text-foreground-subtle leading-relaxed">
                  Editor-in-chief, head coach, podcast host.
                </p>
              </Card>
            </div>
          </Container>
        </Section>

        <Section background="coral" className="!py-12">
          <Container className="text-center">
            <h2 className="font-heading text-off-white text-2xl tracking-wide mb-3">
              REPORT A CORRECTION
            </h2>
            <p className="text-off-white/80 max-w-md mx-auto mb-6 text-sm">
              Found a factual error, a wrong attribution, or a number that
              doesn&apos;t check out? Email it in and we will fix the page,
              log the change, and credit you if you would like.
            </p>
            <Button
              href={`mailto:${FOUNDER.email}?subject=Editorial%20correction`}
              size="lg"
              className="!bg-off-white !text-coral !shadow-none hover:!bg-off-white/90"
            >
              Email a Correction
            </Button>
          </Container>
        </Section>
      </main>

      <Footer />
    </>
  );
}
