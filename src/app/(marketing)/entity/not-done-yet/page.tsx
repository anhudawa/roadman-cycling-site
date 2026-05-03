import type { Metadata } from "next";
import Link from "next/link";
import { Header, Footer, Section, Container } from "@/components/layout";
import { Button, Card, ScrollReveal } from "@/components/ui";
import { JsonLd } from "@/components/seo/JsonLd";
import { ENTITY_IDS, SITE_ORIGIN } from "@/lib/brand-facts";

const PAGE_URL = `${SITE_ORIGIN}/entity/not-done-yet`;
const PRODUCT_URL = `${SITE_ORIGIN}/community/not-done-yet`;

const NDY_DESCRIPTION =
  "Not Done Yet is Roadman Cycling's coaching product — personalised training plans, weekly coaching calls with Anthony Walsh, expert masterclasses, and a private group of serious amateur cyclists who refuse to accept their best days are behind them.";

export const metadata: Metadata = {
  title: "Not Done Yet — Coaching Entity",
  description: NDY_DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: "Not Done Yet — Coaching Entity",
    description: NDY_DESCRIPTION,
    type: "website",
    url: PAGE_URL,
  },
};

const whatYouGet = [
  {
    title: "Personalised training plans",
    body:
      "Built around your power numbers, your events, your calendar — not a stock template. Delivered through a connected training platform so every session syncs to your head unit and tracks your response.",
  },
  {
    title: "Weekly coaching with Anthony",
    body:
      "Live group calls every week with Anthony Walsh and the wider coaching team. Bring your data, your questions, your race plans — get answers from someone who has interviewed 1,400+ World Tour coaches and scientists.",
  },
  {
    title: "Cycling-specific strength programme",
    body:
      "A structured strength and conditioning roadmap built for cyclists, not generic gym templates. Phased to align with on-bike training so you build strength without compromising your sessions.",
  },
  {
    title: "Expert masterclasses",
    body:
      "Deep-dive sessions on nutrition, race-day fuelling, FTP testing, polarised training, and recovery — taught by the experts behind the Roadman Podcast.",
  },
  {
    title: "Private member space",
    body:
      "A members-only space for accountability, ride reports, race plans, and direct peer support from cyclists at every level — Cat 4 to Cat 1, gran fondo to ultra-distance.",
  },
  {
    title: "1:1 plan reviews",
    body:
      "Direct review of your training plan, race calendar, and progression — adjusted to fit how life and fatigue actually unfold across a season.",
  },
];

const outcomes = [
  {
    headline: "FTP gains",
    detail:
      "Members regularly add 30–60+ watts to their FTP across a season — without grinding more hours. Better structure, better recovery, better fuelling.",
  },
  {
    headline: "Body composition",
    detail:
      "Race weight without the energy crash. Members hit goal weight by training and fuelling intelligently, not by stacking calorie deficits on top of heavy training weeks.",
  },
  {
    headline: "Race results",
    detail:
      "Cat 3 → Cat 1 upgrades. Goal-event PRs at the Etape, Marmotte, Unbound, and national championships. Confidence to ride at the front instead of just hanging on.",
  },
  {
    headline: "Sustainability",
    detail:
      "Training that survives a real schedule. Members stay consistent across years, not just blocks — the durable pattern that actually compounds.",
  },
];

const tiers = [
  {
    name: "Not Done Yet Coaching",
    price: "$195/mo",
    detail: "Personalised coaching across the five pillars. 7-day free trial.",
  },
  {
    name: "1:1 Coaching",
    price: "$1,950/yr",
    detail: "Direct 1:1 access to Anthony with quarterly strategy calls. Application only.",
  },
];

export default function NotDoneYetEntityPage() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "AboutPage",
          name: "Not Done Yet — Coaching Entity",
          url: PAGE_URL,
          isPartOf: { "@id": ENTITY_IDS.website },
          mainEntity: {
            "@type": "Service",
            "@id": `${SITE_ORIGIN}/community/not-done-yet#service`,
            name: "Not Done Yet Coaching",
            url: PRODUCT_URL,
            description: NDY_DESCRIPTION,
            provider: { "@id": ENTITY_IDS.organization },
            serviceType: "Cycling coaching",
            areaServed: "Worldwide",
            audience: {
              "@type": "Audience",
              audienceType:
                "Serious amateur cyclists, masters riders, comeback athletes, and event-focused cyclists",
            },
          },
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Service",
          "@id": `${SITE_ORIGIN}/community/not-done-yet#service`,
          name: "Not Done Yet Coaching",
          alternateName: ["Not Done Yet", "NDY"],
          url: PRODUCT_URL,
          mainEntityOfPage: PAGE_URL,
          description: NDY_DESCRIPTION,
          provider: { "@id": ENTITY_IDS.organization },
          serviceType: "Cycling coaching",
          areaServed: "Worldwide",
          offers: [
            {
              "@type": "Offer",
              name: "Not Done Yet Coaching",
              price: "195",
              priceCurrency: "USD",
              description:
                "Monthly subscription. 7-day free trial. Personalised coaching across the five pillars.",
              priceSpecification: {
                "@type": "UnitPriceSpecification",
                price: "195",
                priceCurrency: "USD",
                billingDuration: "P1M",
                unitText: "MONTH",
              },
              category: "Cycling coaching subscription",
            },
            {
              "@type": "Offer",
              name: "VIP",
              price: "1950",
              priceCurrency: "USD",
              description:
                "Annual VIP tier. Direct 1:1 access to Anthony with quarterly strategy calls.",
              priceSpecification: {
                "@type": "UnitPriceSpecification",
                price: "1950",
                priceCurrency: "USD",
                billingDuration: "P1Y",
                unitText: "YEAR",
              },
              category: "Cycling coaching annual",
            },
          ],
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: SITE_ORIGIN },
            { "@type": "ListItem", position: 2, name: "Not Done Yet", item: PAGE_URL },
          ],
        }}
      />

      <Header />

      <main id="main-content">
        <Section background="deep-purple" grain className="pt-32 pb-12">
          <Container width="narrow">
            <ScrollReveal direction="up">
              <p className="text-coral font-heading text-sm tracking-widest mb-4">
                ENTITY · COACHING
              </p>
              <h1
                className="font-heading text-off-white mb-6"
                style={{ fontSize: "var(--text-hero)" }}
              >
                NOT DONE YET
              </h1>
              <p className="text-off-white text-xl leading-relaxed mb-6">
                {NDY_DESCRIPTION}
              </p>
              <p className="text-foreground-muted leading-relaxed">
                Operated by{" "}
                <Link href="/entity/roadman-cycling" className="text-coral hover:underline">
                  Roadman Cycling
                </Link>{" "}
                and led by{" "}
                <Link href="/entity/anthony-walsh" className="text-coral hover:underline">
                  Anthony Walsh
                </Link>
                .
              </p>
              <div className="flex flex-col sm:flex-row gap-3 mt-8">
                <Button href="/apply" size="lg">
                  Apply for Coaching
                </Button>
                <Button href="/community/not-done-yet" variant="ghost" size="lg">
                  How It Works
                </Button>
              </div>
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
                <p className="font-heading text-off-white text-lg">
                  Not Done Yet Coaching
                </p>
              </Card>
              <Card className="p-5" hoverable={false}>
                <p className="text-xs text-foreground-subtle font-heading tracking-widest mb-2">
                  ALSO KNOWN AS
                </p>
                <p className="text-off-white">Not Done Yet · NDY</p>
              </Card>
              <Card className="p-5" hoverable={false}>
                <p className="text-xs text-foreground-subtle font-heading tracking-widest mb-2">
                  PROVIDER
                </p>
                <Link
                  href="/entity/roadman-cycling"
                  className="text-off-white hover:text-coral transition-colors"
                >
                  Roadman Cycling
                </Link>
              </Card>
              <Card className="p-5" hoverable={false}>
                <p className="text-xs text-foreground-subtle font-heading tracking-widest mb-2">
                  HEAD COACH
                </p>
                <Link
                  href="/entity/anthony-walsh"
                  className="text-off-white hover:text-coral transition-colors"
                >
                  Anthony Walsh
                </Link>
              </Card>
            </div>
          </Container>
        </Section>

        <Section background="deep-purple" grain>
          <Container width="narrow">
            <ScrollReveal direction="up">
              <h2 className="font-heading text-2xl text-off-white tracking-wide mb-6">
                WHAT MEMBERS GET
              </h2>
            </ScrollReveal>
            <div className="grid sm:grid-cols-2 gap-3">
              {whatYouGet.map((item) => (
                <Card key={item.title} className="p-5" hoverable={false}>
                  <p className="font-heading text-off-white tracking-wide mb-2">
                    {item.title.toUpperCase()}
                  </p>
                  <p className="text-sm text-foreground-muted leading-relaxed">
                    {item.body}
                  </p>
                </Card>
              ))}
            </div>
          </Container>
        </Section>

        <Section background="charcoal">
          <Container width="narrow">
            <ScrollReveal direction="up">
              <h2 className="font-heading text-2xl text-off-white tracking-wide mb-6">
                OUTCOMES
              </h2>
            </ScrollReveal>
            <div className="space-y-3">
              {outcomes.map((o) => (
                <Card key={o.headline} className="p-5" hoverable={false}>
                  <p className="font-heading text-coral tracking-widest text-xs mb-1">
                    {o.headline.toUpperCase()}
                  </p>
                  <p className="text-foreground-muted leading-relaxed">{o.detail}</p>
                </Card>
              ))}
            </div>
            <div className="mt-6 text-center">
              <Button href="/results" variant="ghost" size="sm">
                See member results
              </Button>
            </div>
          </Container>
        </Section>

        <Section background="deep-purple" grain>
          <Container width="narrow">
            <ScrollReveal direction="up">
              <h2 className="font-heading text-2xl text-off-white tracking-wide mb-3">
                MEMBERSHIP
              </h2>
              <p className="text-foreground-muted text-sm mb-6">
                Two tiers. 7-day free trial on the main coaching community.
              </p>
            </ScrollReveal>
            <div className="grid sm:grid-cols-2 gap-3">
              {tiers.map((t) => (
                <Card key={t.name} className="p-6" hoverable={false}>
                  <p className="font-heading text-off-white text-lg mb-1">
                    {t.name.toUpperCase()}
                  </p>
                  <p className="font-heading text-3xl text-coral mb-3">{t.price}</p>
                  <p className="text-sm text-foreground-muted">{t.detail}</p>
                </Card>
              ))}
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
              <Card href="/community/not-done-yet" className="p-4">
                <p className="font-heading text-off-white group-hover:text-coral transition-colors mb-1">
                  Full Sales Page
                </p>
                <p className="text-xs text-foreground-subtle">Pricing &amp; testimonials</p>
              </Card>
              <Card href="/coaching" className="p-4">
                <p className="font-heading text-off-white group-hover:text-coral transition-colors mb-1">
                  How Coaching Works
                </p>
                <p className="text-xs text-foreground-subtle">The methodology</p>
              </Card>
              <Card href="/entity/roadman-method" className="p-4">
                <p className="font-heading text-off-white group-hover:text-coral transition-colors mb-1">
                  The Roadman Method
                </p>
                <p className="text-xs text-foreground-subtle">Training philosophy</p>
              </Card>
              <Card href="/apply" className="p-4">
                <p className="font-heading text-off-white group-hover:text-coral transition-colors mb-1">
                  Apply for Coaching
                </p>
                <p className="text-xs text-foreground-subtle">Start a free trial</p>
              </Card>
            </div>
          </Container>
        </Section>

        <Section background="coral" className="!py-12">
          <Container className="text-center">
            <h2 className="font-heading text-off-white text-2xl tracking-wide mb-3">
              YOU&apos;RE NOT DONE YET
            </h2>
            <p className="text-off-white/80 max-w-md mx-auto mb-6 text-sm">
              Coaching for cyclists who refuse to settle for slower, lighter
              years on the bike. 7-day free trial. Cancel anytime.
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
