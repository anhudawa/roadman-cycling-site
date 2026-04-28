import type { Metadata } from "next";
import Link from "next/link";
import { Header, Footer, Section, Container } from "@/components/layout";
import { Button, Card, ScrollReveal } from "@/components/ui";
import { JsonLd } from "@/components/seo/JsonLd";
import { ENTITY_IDS, FOUNDER, SITE_ORIGIN } from "@/lib/brand-facts";

const PAGE_URL = `${SITE_ORIGIN}/about/expert-reviewers`;

const PAGE_DESCRIPTION =
  "The Roadman Cycling expert reviewer board. The named coaches, scientists, and clinicians who review editorial content and underwrite our coaching recommendations.";

export const metadata: Metadata = {
  title: "Expert Reviewer Board — Roadman Cycling",
  description: PAGE_DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: "Expert Reviewer Board — Roadman Cycling",
    description: PAGE_DESCRIPTION,
    type: "profile",
    url: PAGE_URL,
  },
};

interface Reviewer {
  name: string;
  role: string;
  /** Areas of editorial sign-off */
  reviews: string[];
  /** Short biography — credentials and relevant experience */
  bio: string;
  /** Internal entity URL (preferred over guests page) */
  href?: string;
  /** Optional /guests slug for podcast appearance */
  guestSlug?: string;
}

const reviewers: Reviewer[] = [
  {
    name: "Anthony Walsh",
    role: "Founder & Head Coach",
    reviews: [
      "Training methodology",
      "Periodisation and load",
      "Polarised intensity distribution",
      "Coaching philosophy",
      "Editorial direction",
    ],
    bio: `Founder of Roadman Cycling and host of The Roadman Cycling Podcast. Coaching cyclists since ${FOUNDER.foundedYear} (and continuously since 2013 under the original A1 Coaching brand). Over 1,400 on-the-record interviews with World Tour coaches, sports scientists, and pro riders. Based in ${FOUNDER.location}. Anthony is editor-in-chief and signs off every coaching, training, and methodology piece on this site.`,
    href: "/entity/anthony-walsh",
  },
];

const seats = [
  {
    label: "NUTRITION",
    body:
      "We are actively recruiting a registered sports nutritionist to formally review nutrition and fuelling content. In the interim, nutrition pieces are checked against the public positions of the named guests we cite — Dr David Dunne, Dr Sam Impey, Tim Spector — before they ship.",
  },
  {
    label: "STRENGTH & CONDITIONING",
    body:
      "We are actively recruiting a credentialed S&C coach for cyclists to formally review strength content. Strength pieces are currently reviewed against the published work of the cycling-specific S&C coaches we cite, including Derek Teel and Dr Andy Pruitt.",
  },
  {
    label: "SPORTS SCIENCE / PHYSIOLOGY",
    body:
      "We are actively recruiting an exercise physiologist to formally review training-science claims. In the interim, physiology content is grounded in the work of named experts including Prof. Stephen Seiler, Dan Lorang, and the peer-reviewed literature behind their positions.",
  },
  {
    label: "CLINICAL / MEDICAL",
    body:
      "We do not publish medical advice. Where a topic crosses the line into clinical territory, the piece is referred out and the reader is pointed to a qualified clinician.",
  },
];

const principles = [
  {
    title: "Named, accountable reviewers",
    body:
      "Every review is signed by a named human with credentials we publish on this page. No anonymous editorial sign-off.",
  },
  {
    title: "Subject-matter alignment",
    body:
      "A reviewer signs off only on content within their area of demonstrated expertise. Where a topic sits between disciplines, two reviewers are involved.",
  },
  {
    title: "Disclosed commercial ties",
    body:
      "If a reviewer has a commercial relationship with a brand, athlete, or platform mentioned in a piece, the relationship is disclosed in the article and the reviewer recuses themselves from reviewing that piece.",
  },
  {
    title: "Public corrections, not silent edits",
    body:
      "If a reviewer signs off on something we later find to be wrong, the correction is logged publicly with the original wording preserved. Reviewers are accountable to the same correction log as the editorial team.",
  },
];

const related = [
  {
    title: "How We Create Content",
    href: "/about/how-we-create-content",
    detail: "The editorial pipeline, evidence grading, and standards every reviewer signs off against.",
  },
  {
    title: "Editorial Standards",
    href: "/editorial-standards",
    detail: "The rules every article must meet.",
  },
  {
    title: "Corrections Log",
    href: "/about/corrections",
    detail: "Every public correction we have made.",
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

export default function ExpertReviewersPage() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "AboutPage",
          name: "Expert Reviewer Board — Roadman Cycling",
          url: PAGE_URL,
          description: PAGE_DESCRIPTION,
          isPartOf: { "@id": ENTITY_IDS.website },
          mainEntity: { "@id": ENTITY_IDS.organization },
          about: [
            { "@id": ENTITY_IDS.organization },
            { "@id": ENTITY_IDS.person },
          ],
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
            { "@type": "ListItem", position: 3, name: "Expert Reviewers", item: PAGE_URL },
          ],
        }}
      />

      <Header />

      <main id="main-content">
        <Section background="deep-purple" grain className="pt-32 pb-14">
          <Container width="narrow">
            <ScrollReveal direction="up">
              <p className="text-coral font-heading text-sm tracking-widest mb-4">
                TRUST · REVIEWER BOARD
              </p>
              <h1
                className="font-heading text-off-white mb-6"
                style={{ fontSize: "var(--text-hero)" }}
              >
                EXPERT REVIEWERS
              </h1>
              <p className="text-off-white text-xl leading-relaxed mb-6">
                {PAGE_DESCRIPTION}
              </p>
              <p className="text-foreground-muted leading-relaxed">
                The board sits behind every coaching piece on this site. The
                pipeline they review against is documented in{" "}
                <Link href="/about/how-we-create-content" className="text-coral hover:underline">
                  How We Create Content
                </Link>
                , and the methodology they sign off against is{" "}
                <Link href="/entity/roadman-method" className="text-coral hover:underline">
                  The Roadman Method
                </Link>
                .
              </p>
            </ScrollReveal>
          </Container>
        </Section>

        {/* Current board */}
        <Section background="charcoal">
          <Container width="narrow">
            <ScrollReveal direction="up">
              <h2 className="font-heading text-2xl text-off-white tracking-wide mb-3">
                THE BOARD
              </h2>
              <p className="text-foreground-muted text-sm mb-8 max-w-2xl">
                Currently a board of one as we formalise the structure. Named
                seats are being recruited — see open seats below.
              </p>
            </ScrollReveal>
            <div className="space-y-3">
              {reviewers.map((r) => (
                <Card key={r.name} className="p-6" hoverable={false}>
                  <div className="flex items-baseline justify-between gap-3 mb-2 flex-wrap">
                    <p className="font-heading text-off-white text-lg tracking-wide">
                      {r.name.toUpperCase()}
                    </p>
                    <p className="text-xs font-heading tracking-widest text-coral">
                      {r.role.toUpperCase()}
                    </p>
                  </div>
                  <p className="text-sm text-foreground-muted leading-relaxed mb-4">
                    {r.bio}
                  </p>
                  <p className="text-xs font-heading tracking-widest text-foreground-subtle mb-2">
                    REVIEWS
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {r.reviews.map((area) => (
                      <span
                        key={area}
                        className="inline-block px-3 py-1 text-xs font-heading tracking-wider text-foreground-muted bg-white/[0.04] border border-white/10 rounded-md"
                      >
                        {area.toUpperCase()}
                      </span>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-3 text-xs">
                    {r.href && (
                      <Link
                        href={r.href}
                        className="text-coral font-heading tracking-widest hover:underline"
                      >
                        ENTITY PAGE →
                      </Link>
                    )}
                    {r.guestSlug && (
                      <Link
                        href={`/guests/${r.guestSlug}`}
                        className="text-coral font-heading tracking-widest hover:underline"
                      >
                        PODCAST APPEARANCES →
                      </Link>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </Container>
        </Section>

        {/* Open seats */}
        <Section background="deep-purple" grain>
          <Container width="narrow">
            <ScrollReveal direction="up">
              <h2 className="font-heading text-2xl text-off-white tracking-wide mb-3">
                OPEN REVIEWER SEATS
              </h2>
              <p className="text-foreground-muted text-sm mb-8 max-w-2xl">
                Seats we are actively recruiting for. If you are a credentialed
                expert in any of these areas and would like to be considered,{" "}
                <a
                  href={`mailto:${FOUNDER.email}?subject=Expert%20reviewer%20application`}
                  className="text-coral hover:underline"
                >
                  email {FOUNDER.email}
                </a>
                .
              </p>
            </ScrollReveal>
            <div className="space-y-3">
              {seats.map((s) => (
                <Card key={s.label} className="p-5" hoverable={false}>
                  <p className="text-xs font-heading tracking-widest text-coral mb-2">
                    {s.label}
                  </p>
                  <p className="text-sm text-foreground-muted leading-relaxed">
                    {s.body}
                  </p>
                </Card>
              ))}
            </div>
          </Container>
        </Section>

        {/* Principles */}
        <Section background="charcoal">
          <Container width="narrow">
            <ScrollReveal direction="up">
              <h2 className="font-heading text-2xl text-off-white tracking-wide mb-3">
                HOW THE BOARD OPERATES
              </h2>
              <p className="text-foreground-muted text-sm mb-8 max-w-2xl">
                The principles every reviewer commits to before joining.
              </p>
            </ScrollReveal>
            <div className="space-y-3">
              {principles.map((p) => (
                <Card key={p.title} className="p-6" hoverable={false}>
                  <p className="font-heading text-off-white tracking-wide mb-2">
                    {p.title.toUpperCase()}
                  </p>
                  <p className="text-sm text-foreground-muted leading-relaxed">
                    {p.body}
                  </p>
                </Card>
              ))}
            </div>
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
              JOIN THE BOARD
            </h2>
            <p className="text-off-white/80 max-w-md mx-auto mb-6 text-sm">
              Credentialed in cycling nutrition, S&amp;C, sports science, or a
              clinical discipline that touches endurance sport? We&apos;d like
              to hear from you.
            </p>
            <Button
              href={`mailto:${FOUNDER.email}?subject=Expert%20reviewer%20application`}
              size="lg"
              className="!bg-off-white !text-coral !shadow-none hover:!bg-off-white/90"
            >
              Apply to Review
            </Button>
          </Container>
        </Section>
      </main>

      <Footer />
    </>
  );
}
