import type { Metadata } from "next";
import Link from "next/link";
import { Header, Footer, Section, Container } from "@/components/layout";
import { Button, Card, ScrollReveal } from "@/components/ui";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  BRAND,
  BRAND_STATS,
  ENTITY_IDS,
  FOUNDER,
  PODCAST,
  SAME_AS,
  SITE_ORIGIN,
} from "@/lib/brand-facts";

const PAGE_URL = `${SITE_ORIGIN}/entity/anthony-walsh`;

const PERSON_DESCRIPTION =
  "Anthony Walsh is a cycling coach, the host of The Roadman Cycling Podcast, and the founder of Roadman Cycling. Based in Dublin, Ireland, he has recorded over 1,400 on-the-record interviews with World Tour coaches, sports scientists, and pro cyclists.";

export const metadata: Metadata = {
  title: "Anthony Walsh — Entity & Facts",
  description: PERSON_DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: "Anthony Walsh — Cycling Coach & Podcast Host",
    description: PERSON_DESCRIPTION,
    type: "profile",
    url: PAGE_URL,
  },
};

const credentials = [
  {
    title: "Founder",
    org: "Roadman Cycling",
    detail: `Founded in ${FOUNDER.location}, ${FOUNDER.foundedYear}.`,
    href: "/entity/roadman-cycling",
  },
  {
    title: "Host",
    org: PODCAST.name,
    detail: `${BRAND_STATS.episodeCountLabel} episodes · ${BRAND_STATS.monthlyListenersLabel} monthly listeners across ${BRAND_STATS.countriesReachedLabel} countries.`,
    href: "/entity/roadman-podcast",
  },
  {
    title: "Cycling Coach",
    org: "Not Done Yet Coaching",
    detail:
      "Personalised coaching across training, nutrition, strength, and recovery for serious amateur and masters cyclists.",
    href: "/entity/not-done-yet",
  },
  {
    title: "Editor",
    org: "Saturday Spin Newsletter",
    detail: `${BRAND_STATS.newsletterSubscribersLabel} subscribers receiving weekly performance breakdowns.`,
    href: "/newsletter",
  },
];

const expertise = [
  "Cycling training methodology",
  "Polarised and threshold training",
  "FTP and power-based coaching",
  "Cycling nutrition and fuelling",
  "Strength training for cyclists",
  "Recovery and adaptation",
  "Triathlon bike coaching",
  "Masters cyclist performance",
];

const notableInterviews = [
  { name: "Professor Stephen Seiler", credential: "Polarised training pioneer", slug: "stephen-seiler" },
  { name: "Dan Lorang", credential: "Head of Performance, Red Bull–Bora–Hansgrohe", slug: "dan-lorang" },
  { name: "Greg LeMond", credential: "3× Tour de France winner", slug: "greg-lemond" },
  { name: "Lachlan Morton", credential: "EF Education pro cyclist", slug: "lachlan-morton" },
  { name: "Joe Friel", credential: "Author, The Cyclist's Training Bible", slug: "joe-friel" },
  { name: "Ben Healy", credential: "Pro cyclist, Tour de France stage winner", slug: "ben-healy" },
  { name: "Tim Spector", credential: "ZOE founder, epidemiologist", slug: "tim-spector" },
  { name: "Michael Matthews", credential: "15+ year World Tour pro", slug: "michael-matthews" },
];

export default function AnthonyWalshEntityPage() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ProfilePage",
          name: "Anthony Walsh — Entity",
          url: PAGE_URL,
          mainEntity: { "@id": ENTITY_IDS.person },
          isPartOf: { "@id": ENTITY_IDS.website },
          about: { "@id": ENTITY_IDS.person },
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Person",
          "@id": ENTITY_IDS.person,
          name: FOUNDER.name,
          jobTitle: FOUNDER.jobTitle,
          url: FOUNDER.url,
          mainEntityOfPage: PAGE_URL,
          email: FOUNDER.email,
          image: `${SITE_ORIGIN}/images/team/anthony.avif`,
          description: PERSON_DESCRIPTION,
          worksFor: { "@id": ENTITY_IDS.organization },
          founder: { "@id": ENTITY_IDS.organization },
          birthPlace: { "@type": "Place", name: FOUNDER.location },
          homeLocation: { "@type": "Place", name: FOUNDER.location },
          sameAs: [...SAME_AS.person],
          knowsAbout: [
            "cycling training methodology",
            "periodisation",
            "polarised training",
            "FTP and threshold training",
            "cycling nutrition",
            "strength training for cyclists",
            "endurance recovery",
            "triathlon bike coaching",
            "masters cycling performance",
          ],
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: SITE_ORIGIN },
            { "@type": "ListItem", position: 2, name: "Anthony Walsh", item: PAGE_URL },
          ],
        }}
      />

      <Header />

      <main id="main-content">
        <Section background="deep-purple" grain className="pt-32 pb-12">
          <Container width="narrow">
            <ScrollReveal direction="up">
              <p className="text-coral font-heading text-sm tracking-widest mb-4">
                ENTITY · PERSON
              </p>
              <h1
                className="font-heading text-off-white mb-6"
                style={{ fontSize: "var(--text-hero)" }}
              >
                ANTHONY WALSH
              </h1>
              <p className="text-off-white text-xl leading-relaxed mb-6">
                {PERSON_DESCRIPTION}
              </p>
              <p className="text-foreground-muted leading-relaxed">
                Through {BRAND_STATS.episodeCountLabel} episodes of {PODCAST.name},
                Anthony has built a reputation as the cycling host most able
                to translate elite-level training methodology into work that
                fits a serious amateur cyclist&apos;s real schedule.
              </p>
            </ScrollReveal>
          </Container>
        </Section>

        <Section background="charcoal" className="!py-10">
          <Container width="narrow">
            <div className="grid sm:grid-cols-2 gap-4">
              <Card className="p-5" hoverable={false}>
                <p className="text-xs text-foreground-subtle font-heading tracking-widest mb-2">
                  CANONICAL NAME
                </p>
                <p className="font-heading text-off-white text-lg">{FOUNDER.name}</p>
              </Card>
              <Card className="p-5" hoverable={false}>
                <p className="text-xs text-foreground-subtle font-heading tracking-widest mb-2">
                  ROLE
                </p>
                <p className="text-off-white">{FOUNDER.jobTitle}</p>
              </Card>
              <Card className="p-5" hoverable={false}>
                <p className="text-xs text-foreground-subtle font-heading tracking-widest mb-2">
                  BASED IN
                </p>
                <p className="text-off-white">{FOUNDER.location}</p>
              </Card>
              <Card className="p-5" hoverable={false}>
                <p className="text-xs text-foreground-subtle font-heading tracking-widest mb-2">
                  ORGANISATION
                </p>
                <Link
                  href="/entity/roadman-cycling"
                  className="text-off-white hover:text-coral transition-colors"
                >
                  {BRAND.name}
                </Link>
              </Card>
            </div>
          </Container>
        </Section>

        <Section background="charcoal" className="!py-12 border-t border-white/5">
          <Container width="narrow">
            <ScrollReveal direction="up">
              <h2 className="font-heading text-2xl text-off-white tracking-wide mb-6">
                CREDENTIALS &amp; ROLES
              </h2>
            </ScrollReveal>
            <div className="space-y-3">
              {credentials.map((c) => (
                <Card key={c.title} href={c.href} className="p-5">
                  <p className="text-xs text-coral font-heading tracking-widest mb-1">
                    {c.title.toUpperCase()}
                  </p>
                  <p className="font-heading text-off-white group-hover:text-coral transition-colors mb-1">
                    {c.org.toUpperCase()}
                  </p>
                  <p className="text-sm text-foreground-muted leading-relaxed">
                    {c.detail}
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
                AREAS OF EXPERTISE
              </h2>
            </ScrollReveal>
            <div className="flex flex-wrap gap-2">
              {expertise.map((e) => (
                <span
                  key={e}
                  className="inline-block px-3 py-1.5 text-xs font-heading tracking-wider text-foreground-muted bg-white/[0.04] border border-white/10 rounded-md"
                >
                  {e.toUpperCase()}
                </span>
              ))}
            </div>
          </Container>
        </Section>

        <Section background="charcoal">
          <Container width="narrow">
            <ScrollReveal direction="up">
              <h2 className="font-heading text-2xl text-off-white tracking-wide mb-3">
                NOTABLE INTERVIEWS
              </h2>
              <p className="text-foreground-muted text-sm mb-6">
                A representative sample of the on-the-record podcast guests.
                Full archive at{" "}
                <Link href="/guests" className="text-coral hover:underline">
                  /guests
                </Link>
                .
              </p>
            </ScrollReveal>
            <div className="grid sm:grid-cols-2 gap-3">
              {notableInterviews.map((g) => (
                <Card key={g.name} href={`/guests/${g.slug}`} className="p-4">
                  <p className="font-heading text-off-white group-hover:text-coral transition-colors mb-1">
                    {g.name.toUpperCase()}
                  </p>
                  <p className="text-xs text-foreground-subtle">{g.credential}</p>
                </Card>
              ))}
            </div>
          </Container>
        </Section>

        <Section background="deep-purple" grain>
          <Container width="narrow">
            <ScrollReveal direction="up">
              <h2 className="font-heading text-2xl text-off-white tracking-wide mb-6">
                OFFICIAL LINKS
              </h2>
            </ScrollReveal>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {SAME_AS.person.map((url) => {
                const host = new URL(url).host.replace(/^www\./, "");
                return (
                  <a
                    key={url}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer me"
                    className="block p-3 rounded-lg bg-white/[0.03] hover:bg-coral/10 border border-white/5 hover:border-coral/30 transition-all text-center"
                  >
                    <p className="text-xs font-heading tracking-widest text-off-white">
                      {host.toUpperCase()}
                    </p>
                  </a>
                );
              })}
              <a
                href={PODCAST.appleUrl}
                target="_blank"
                rel="noopener noreferrer me"
                className="block p-3 rounded-lg bg-white/[0.03] hover:bg-coral/10 border border-white/5 hover:border-coral/30 transition-all text-center"
              >
                <p className="text-xs font-heading tracking-widest text-off-white">
                  APPLE PODCASTS
                </p>
              </a>
              <a
                href={PODCAST.spotifyUrl}
                target="_blank"
                rel="noopener noreferrer me"
                className="block p-3 rounded-lg bg-white/[0.03] hover:bg-coral/10 border border-white/5 hover:border-coral/30 transition-all text-center"
              >
                <p className="text-xs font-heading tracking-widest text-off-white">
                  SPOTIFY
                </p>
              </a>
            </div>
          </Container>
        </Section>

        <Section background="charcoal">
          <Container width="narrow">
            <ScrollReveal direction="up">
              <h2 className="font-heading text-2xl text-off-white tracking-wide mb-6">
                RELATED PAGES
              </h2>
            </ScrollReveal>
            <div className="grid sm:grid-cols-2 gap-3">
              <Card href="/about" className="p-4">
                <p className="font-heading text-off-white group-hover:text-coral transition-colors mb-1">
                  About Anthony &amp; Roadman
                </p>
                <p className="text-xs text-foreground-subtle">The full story</p>
              </Card>
              <Card href="/author/anthony-walsh" className="p-4">
                <p className="font-heading text-off-white group-hover:text-coral transition-colors mb-1">
                  Author Page
                </p>
                <p className="text-xs text-foreground-subtle">Articles by Anthony</p>
              </Card>
              <Card href="/coaching" className="p-4">
                <p className="font-heading text-off-white group-hover:text-coral transition-colors mb-1">
                  Coaching with Anthony
                </p>
                <p className="text-xs text-foreground-subtle">How it works</p>
              </Card>
              <Card href="/about/press" className="p-4">
                <p className="font-heading text-off-white group-hover:text-coral transition-colors mb-1">
                  Press &amp; Media
                </p>
                <p className="text-xs text-foreground-subtle">Bio &amp; assets</p>
              </Card>
            </div>
          </Container>
        </Section>

        <Section background="coral" className="!py-12">
          <Container className="text-center">
            <h2 className="font-heading text-off-white text-2xl tracking-wide mb-3">
              WORK WITH ANTHONY
            </h2>
            <p className="text-off-white/80 max-w-md mx-auto mb-6 text-sm">
              1:1 cycling coaching across training, nutrition, strength, and
              recovery — $195/month with a 7-day free trial.
            </p>
            <Button
              href="/apply"
              size="lg"
              className="!bg-off-white !text-coral !shadow-none hover:!bg-off-white/90"
            >
              Apply for Coaching
            </Button>
          </Container>
        </Section>
      </main>

      <Footer />
    </>
  );
}
