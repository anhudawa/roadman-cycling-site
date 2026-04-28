import type { Metadata } from "next";
import Link from "next/link";
import { Header, Footer, Section, Container } from "@/components/layout";
import { Button, Card, ScrollReveal } from "@/components/ui";
import { JsonLd } from "@/components/seo/JsonLd";
import { ENTITY_IDS, FOUNDER, SITE_ORIGIN } from "@/lib/brand-facts";

const PAGE_URL = `${SITE_ORIGIN}/about/how-we-create-content`;

const PAGE_DESCRIPTION =
  "How Roadman Cycling researches, writes, reviews, and grades evidence in every article and episode. The editorial process behind the podcast, the blog, the comparisons, and the coaching content.";

export const metadata: Metadata = {
  title: "How We Create Content — Editorial Methodology",
  description: PAGE_DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: "How We Create Content — Roadman Cycling",
    description: PAGE_DESCRIPTION,
    type: "article",
    url: PAGE_URL,
  },
};

const pipeline = [
  {
    number: "01",
    title: "Topic selection",
    body:
      "Topics start in three places: questions our coached athletes ask, themes that recur across podcast guests, and gaps we notice in the public literature. We do not chase trends or write to keyword volume in isolation.",
  },
  {
    number: "02",
    title: "Primary-source research",
    body:
      "Every piece begins with the underlying material — peer-reviewed studies for science claims, on-the-record podcast interviews for expert positions, and primary documents (race reports, governing-body releases) for news and culture pieces. Secondary commentary is a starting point, never the source.",
  },
  {
    number: "03",
    title: "Drafting with attribution",
    body:
      "Claims are attributed inline to the named expert, study, or source they came from. Where two named experts disagree, we say so and link both. Anthony writes or directs the angle on every piece so the voice stays consistent with the podcast.",
  },
  {
    number: "04",
    title: "Expert review",
    body:
      "Coaching, training, and physiology content is reviewed by Anthony Walsh as head coach. Where a piece sits outside his direct expertise — clinical nutrition, biomechanics, niche endurance science — it is checked against the public positions of the relevant podcast guests before it ships.",
  },
  {
    number: "05",
    title: "Evidence grading",
    body:
      "Every claim of fact is graded against the strength of the evidence behind it (see grading scale below). The grade is shown on-page where appropriate so readers can weigh confidence themselves.",
  },
  {
    number: "06",
    title: "Publishing & dating",
    body:
      "Pieces carry a published date and an updated date. The updated date moves only when the substance changes. Time-sensitive content (event previews, race calendars) carries an editorial note when context shifts.",
  },
  {
    number: "07",
    title: "Maintenance & corrections",
    body:
      "Articles are reviewed for accuracy at least annually. If we get something wrong, we fix it on the page and log the change publicly. See the correction log for every change made.",
  },
];

const evidenceGrades = [
  {
    grade: "A",
    label: "Strong evidence",
    body:
      "Multiple peer-reviewed studies in trained populations, or a clear consensus position from named, qualified experts on the record. Examples: polarised intensity distribution as practised by elite endurance athletes; carbohydrate intake during sustained exercise.",
  },
  {
    grade: "B",
    label: "Emerging or contested evidence",
    body:
      "Promising research, often in smaller or untrained populations, or a position held by some named experts but not yet a consensus. We surface the disagreement explicitly. Examples: specific HRV protocols for amateur load management; some ketone-ester applications.",
  },
  {
    grade: "C",
    label: "Field-practice claims",
    body:
      "Practices used in the World Tour or by named coaches that haven't been formally studied at scale. Useful, but flagged as practitioner knowledge rather than science. Examples: specific micro-dosing intensity protocols; particular taper structures.",
  },
  {
    grade: "D",
    label: "Anecdote and personal experience",
    body:
      "What worked for a single athlete or what a guest reports from their own practice. Treated as a single data point. Useful colour, never load-bearing for a recommendation.",
  },
];

const standards = [
  {
    title: "Source transparency",
    body:
      "Every factual claim traces to a named expert, a published study, or an on-the-record podcast conversation. We cite inline and link to the relevant episode, study, or article.",
  },
  {
    title: "No fabricated data",
    body:
      "Statistics, study results, and athlete quotes are never invented. When we cite a podcast guest, the claim is consistent with their publicly documented work.",
  },
  {
    title: "No medical advice",
    body:
      "We coach training, nutrition, strength, and recovery. We do not diagnose conditions or prescribe medical treatment. Anything that crosses that line is referred out.",
  },
  {
    title: "Commercial transparency",
    body:
      "We make money from coaching, the Not Done Yet community, and digital products. When an article links to /coaching or /apply, that is a commercial recommendation. We do not accept payment for editorial placement.",
  },
  {
    title: "AI-assisted, human-owned",
    body:
      "We use AI tools for research support, drafting scaffolds, and editing — never as the final author of a published claim. A named human (Anthony, the editorial team, or a credited contributor) reviews and stands behind every piece before it ships.",
  },
  {
    title: "Honest comparisons",
    body:
      "Where competitors are a better fit, we say so. Comparison articles are written from the rider's interest, not ours.",
  },
];

const related = [
  {
    title: "Editorial Standards",
    href: "/editorial-standards",
    detail: "The shorter standards page — every rule the editorial process must follow.",
  },
  {
    title: "Corrections Log",
    href: "/about/corrections",
    detail: "Every public correction we have made, dated, with the original wording preserved.",
  },
  {
    title: "Expert Reviewer Board",
    href: "/about/expert-reviewers",
    detail: "Who reviews what, and the credentials behind every editorial sign-off.",
  },
  {
    title: "How We Coach",
    href: "/about/how-we-coach",
    detail: "The methodology, tools, and cadence behind 1:1 coaching.",
  },
  {
    title: "The Roadman Method",
    href: "/entity/roadman-method",
    detail: "The five pillars and the named experts behind them.",
  },
  {
    title: "Anthony Walsh",
    href: "/entity/anthony-walsh",
    detail: "Editor-in-chief, head coach, podcast host.",
  },
];

export default function HowWeCreateContentPage() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "AboutPage",
          name: "How We Create Content — Roadman Cycling",
          url: PAGE_URL,
          description: PAGE_DESCRIPTION,
          isPartOf: { "@id": ENTITY_IDS.website },
          mainEntity: { "@id": ENTITY_IDS.organization },
          about: [
            { "@id": ENTITY_IDS.organization },
            { "@id": ENTITY_IDS.person },
          ],
          author: { "@id": ENTITY_IDS.person },
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
            { "@type": "ListItem", position: 3, name: "How We Create Content", item: PAGE_URL },
          ],
        }}
      />

      <Header />

      <main id="main-content">
        <Section background="deep-purple" grain className="pt-32 pb-14">
          <Container width="narrow">
            <ScrollReveal direction="up">
              <p className="text-coral font-heading text-sm tracking-widest mb-4">
                TRUST · EDITORIAL METHODOLOGY
              </p>
              <h1
                className="font-heading text-off-white mb-6"
                style={{ fontSize: "var(--text-hero)" }}
              >
                HOW WE CREATE
                <br />
                <span className="text-coral">CONTENT</span>
              </h1>
              <p className="text-off-white text-xl leading-relaxed mb-6">
                {PAGE_DESCRIPTION}
              </p>
              <p className="text-foreground-muted leading-relaxed">
                Editorial direction is led by{" "}
                <Link href="/entity/anthony-walsh" className="text-coral hover:underline">
                  Anthony Walsh
                </Link>
                . Coaching content is reviewed against{" "}
                <Link href="/entity/roadman-method" className="text-coral hover:underline">
                  The Roadman Method
                </Link>
                . The shorter rules-only version lives at{" "}
                <Link href="/editorial-standards" className="text-coral hover:underline">
                  /editorial-standards
                </Link>
                .
              </p>
            </ScrollReveal>
          </Container>
        </Section>

        <Section background="charcoal">
          <Container width="narrow">
            <ScrollReveal direction="up">
              <h2 className="font-heading text-2xl text-off-white tracking-wide mb-3">
                THE EDITORIAL PIPELINE
              </h2>
              <p className="text-foreground-muted text-sm mb-8 max-w-2xl">
                Every article and episode summary moves through these seven
                steps before it ships.
              </p>
            </ScrollReveal>
            <div className="space-y-3">
              {pipeline.map((p) => (
                <Card key={p.number} className="p-6" hoverable={false}>
                  <div className="flex items-start gap-4">
                    <span className="font-heading text-2xl text-coral shrink-0">
                      {p.number}
                    </span>
                    <div className="flex-1">
                      <p className="font-heading text-off-white tracking-wide mb-2">
                        {p.title.toUpperCase()}
                      </p>
                      <p className="text-sm text-foreground-muted leading-relaxed">
                        {p.body}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </Container>
        </Section>

        <Section background="deep-purple" grain>
          <Container width="narrow">
            <ScrollReveal direction="up">
              <h2 className="font-heading text-2xl text-off-white tracking-wide mb-3">
                THE EVIDENCE GRADING SCALE
              </h2>
              <p className="text-foreground-muted text-sm mb-8 max-w-2xl">
                Not every claim is backed by the same weight of evidence. We
                grade them so you can weigh confidence yourself.
              </p>
            </ScrollReveal>
            <div className="space-y-3">
              {evidenceGrades.map((g) => (
                <Card key={g.grade} className="p-6" hoverable={false}>
                  <div className="flex items-start gap-4">
                    <span className="font-heading text-3xl text-coral shrink-0 w-10 text-center">
                      {g.grade}
                    </span>
                    <div className="flex-1">
                      <p className="font-heading text-off-white tracking-wide mb-2">
                        {g.label.toUpperCase()}
                      </p>
                      <p className="text-sm text-foreground-muted leading-relaxed">
                        {g.body}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </Container>
        </Section>

        <Section background="charcoal">
          <Container width="narrow">
            <ScrollReveal direction="up">
              <h2 className="font-heading text-2xl text-off-white tracking-wide mb-3">
                THE STANDARDS BEHIND EVERY PIECE
              </h2>
              <p className="text-foreground-muted text-sm mb-8 max-w-2xl">
                The non-negotiables that govern what we publish, no matter the
                format.
              </p>
            </ScrollReveal>
            <div className="space-y-3">
              {standards.map((s) => (
                <Card key={s.title} className="p-6" hoverable={false}>
                  <p className="font-heading text-off-white tracking-wide mb-2">
                    {s.title.toUpperCase()}
                  </p>
                  <p className="text-sm text-foreground-muted leading-relaxed">
                    {s.body}
                  </p>
                </Card>
              ))}
            </div>
          </Container>
        </Section>

        <Section background="deep-purple" grain>
          <Container width="narrow">
            <ScrollReveal direction="up">
              <h2 className="font-heading text-2xl text-off-white tracking-wide mb-6">
                RELATED PAGES
              </h2>
            </ScrollReveal>
            <div className="grid sm:grid-cols-2 gap-3">
              {related.map((r) => (
                <Card key={r.title} href={r.href} className="p-5">
                  <p className="font-heading text-off-white group-hover:text-coral transition-colors mb-1">
                    {r.title.toUpperCase()}
                  </p>
                  <p className="text-xs text-foreground-subtle leading-relaxed">
                    {r.detail}
                  </p>
                </Card>
              ))}
            </div>
          </Container>
        </Section>

        <Section background="coral" className="!py-12">
          <Container className="text-center">
            <h2 className="font-heading text-off-white text-2xl tracking-wide mb-3">
              SPOT AN ERROR?
            </h2>
            <p className="text-off-white/80 max-w-md mx-auto mb-6 text-sm">
              Tell us. We fix mistakes on the page, log the correction, and
              keep the original wording for transparency.
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
