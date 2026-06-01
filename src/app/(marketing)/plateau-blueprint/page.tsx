import type { Metadata } from "next";
import Link from "next/link";
import { Header, Footer, Section, Container } from "@/components/layout";
import { Card, ScrollReveal, GradientText } from "@/components/ui";
import { EmailCapture } from "@/components/features/conversion/EmailCapture";
import { JsonLd } from "@/components/seo/JsonLd";
import { ENTITY_IDS, SITE_ORIGIN, BRAND_STATS } from "@/lib/brand-facts";
import { getTestimonialsByName } from "@/lib/testimonials";

/**
 * /plateau-blueprint — low-ticket tripwire landing page.
 *
 * The Plateau Blueprint is a ~$27 mini-product: a focused workbook that
 * walks a stuck cyclist through finding their real FTP and identifying
 * which of the four causes is behind their plateau. It's the credible,
 * low-commitment first purchase that seeds the full Roadman Method.
 *
 * IMPORTANT — payment is not wired yet. There is no Stripe price ID for
 * this product. The page captures email via the existing newsletter
 * pattern (EmailCapture, source="plateau-blueprint") and is clearly
 * marked "coming soon" with an early-access waitlist. When the product
 * and its Stripe price land, swap the waitlist block for a checkout CTA.
 *
 * Standard marketing-surface conventions: renders its own Header/Footer,
 * exports static metadata with a canonical, uses UI primitives, real
 * proof only.
 */

const PAGE_PATH = "/plateau-blueprint";
const PAGE_URL = `${SITE_ORIGIN}${PAGE_PATH}`;
const BLUEPRINT_PRICE = 27;

type Cause = {
  n: string;
  title: string;
  body: string;
};

const ComingSoonPill = ({ children }: { children: React.ReactNode }) => (
  <span
    className="
      inline-flex items-center gap-2 rounded-full
      bg-coral/15 border border-coral/30
      px-3 py-1 font-heading text-coral text-[11px] tracking-[0.18em] uppercase
    "
  >
    <span aria-hidden="true" className="inline-block w-1.5 h-1.5 rounded-full bg-coral" />
    {children}
  </span>
);

const FOUR_CAUSES: readonly Cause[] = [
  {
    n: "01",
    title: "Under-recovered",
    body: "You're doing the training. You're not getting the adaptation. Sleep, life stress and back-to-back hard sessions are eating the gains before they land.",
  },
  {
    n: "02",
    title: "No-man's-land",
    body: "Most of your riding is neither easy enough to recover from nor hard enough to drive change. The middle is where progress quietly dies.",
  },
  {
    n: "03",
    title: "Strength gap",
    body: "Your aerobic engine still works. The neuromuscular power that drives it is leaking — about 1% a year after 40 if you're not lifting.",
  },
  {
    n: "04",
    title: "Fuelling deficit",
    body: "Training hungry. Chasing race weight. Every session is paid for with tomorrow's adaptation, and your numbers stall as a result.",
  },
];

const WHATS_INSIDE: ReadonlyArray<{ title: string; body: string }> = [
  {
    title: "The real-FTP field test",
    body: "A step-by-step protocol to find the number your training should actually be built on — not a stale guess from last winter, not an app's estimate. Indoor or outdoor, power or heart rate.",
  },
  {
    title: "The four-cause self-audit",
    body: "A guided worksheet that walks you through your training, recovery and fuelling and points to which of the four causes is behind your plateau. The same pattern recognition that sits under the Roadman Method.",
  },
  {
    title: "Your three changes this week",
    body: "Once you know your cause, the Blueprint gives you the specific changes to make in the next seven days — not a 12-week overhaul, just the first moves that matter most.",
  },
  {
    title: "The zone & fuelling reference card",
    body: "A single page you keep on the bike: your training zones from your new FTP, plus the in-ride fuelling targets most amateurs get badly wrong.",
  },
];

const blueprintTestimonials = getTestimonialsByName([
  "Damien Maloney",
  "Brian Morrissey",
  "Daniel Stone",
]);

export const metadata: Metadata = {
  title:
    "The Plateau Blueprint — Find Your Real FTP & the 4 Causes of Your Plateau",
  description:
    "A focused workbook for stuck cyclists: find your real FTP, run the four-cause self-audit, and get the three changes to make this week. The first step into the Roadman Method.",
  keywords: [
    "plateau blueprint",
    "find my real FTP",
    "cycling plateau causes",
    "FTP test protocol",
    "why has my FTP stalled",
    "cycling training workbook",
  ],
  alternates: {
    canonical: PAGE_URL,
  },
  openGraph: {
    title:
      "The Plateau Blueprint — Find Your Real FTP & the 4 Causes of Your Plateau",
    description:
      "Find your real FTP, audit the four causes of your plateau, and get the three changes to make this week.",
    type: "website",
    url: PAGE_URL,
    images: [
      {
        url: `${SITE_ORIGIN}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: "The Plateau Blueprint — Roadman Cycling",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "The Plateau Blueprint — Roadman Cycling",
    description:
      "Find your real FTP, audit the four causes of your plateau, and get the three changes to make this week.",
    images: [`${SITE_ORIGIN}/og-image.jpg`],
  },
  robots: { index: true, follow: true },
};

export default function PlateauBlueprintPage() {
  const breadcrumbsJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_ORIGIN },
      {
        "@type": "ListItem",
        position: 2,
        name: "The Roadman Method",
        item: `${SITE_ORIGIN}/method`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: "The Plateau Blueprint",
        item: PAGE_URL,
      },
    ],
  };

  const webPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${PAGE_URL}#webpage`,
    url: PAGE_URL,
    name: "The Plateau Blueprint — Roadman Cycling",
    description:
      "A low-cost workbook for serious amateur cyclists to find their real FTP and identify which of the four causes is behind their plateau.",
    isPartOf: { "@id": ENTITY_IDS.website },
    publisher: { "@id": ENTITY_IDS.organization },
    inLanguage: "en",
  };

  return (
    <>
      <JsonLd data={breadcrumbsJsonLd} />
      <JsonLd data={webPageJsonLd} />

      <Header />

      <main id="main-content">
        {/* Hero */}
        <Section background="deep-purple" grain className="pt-32 pb-20">
          <Container>
            <ScrollReveal direction="up" eager>
              <div className="text-center max-w-4xl mx-auto">
                <div className="flex justify-center mb-6">
                  <ComingSoonPill>
                    Coming soon &middot; join the early-access list
                  </ComingSoonPill>
                </div>
                <p className="text-coral font-heading text-sm tracking-[0.3em] uppercase mb-6">
                  The Plateau Blueprint
                </p>
                <h1
                  className="font-heading text-off-white uppercase leading-[0.95] mb-6"
                  style={{ fontSize: "var(--text-hero)" }}
                >
                  Find your real FTP.
                  <br />
                  <span className="text-coral">
                    Name the cause of your plateau.
                  </span>
                </h1>
                <p className="text-foreground-muted text-lg md:text-xl leading-relaxed mb-4">
                  A focused workbook for cyclists who&apos;ve stopped getting
                  faster. Test your real FTP, run the four-cause self-audit, and
                  walk away with the three changes to make this week &mdash; no
                  12-week commitment required.
                </p>
                <p className="text-off-white text-lg md:text-xl leading-relaxed font-medium mb-10">
                  It&apos;s the simplest, cheapest first step into the system
                  behind the Roadman Method.
                </p>

                <div className="max-w-md mx-auto">
                  <a
                    href="#get-it"
                    data-track="plateau_blueprint_hero_cta"
                    className="inline-flex w-full sm:w-auto items-center justify-center gap-2 font-heading tracking-wider uppercase rounded-md transition-all cursor-pointer active:scale-[0.97] px-8 md:px-10 py-4 text-lg bg-coral hover:bg-coral-hover text-off-white shadow-[var(--shadow-glow-coral)]"
                    style={{ transitionDuration: "var(--duration-fast)" }}
                  >
                    Get early access
                  </a>
                  <p className="text-foreground-subtle text-sm mt-4">
                    Planned at ${BLUEPRINT_PRICE}. Join the list and you&apos;ll
                    be first to get it &mdash; at the lowest price it&apos;ll
                    ever be.
                  </p>
                </div>
              </div>
            </ScrollReveal>
          </Container>
        </Section>

        {/* The problem */}
        <Section background="charcoal">
          <Container width="narrow">
            <ScrollReveal direction="up" className="text-center mb-10">
              <p className="text-coral font-heading text-xs tracking-widest mb-3">
                START WITH THE TRUTH
              </p>
              <h2
                className="font-heading text-off-white mb-4"
                style={{ fontSize: "var(--text-section)" }}
              >
                <GradientText as="span">
                  YOU CAN&apos;T FIX A PLATEAU YOU HAVEN&apos;T DIAGNOSED.
                </GradientText>
              </h2>
            </ScrollReveal>
            <ScrollReveal direction="up">
              <div className="max-w-2xl mx-auto text-foreground-muted text-base md:text-lg leading-relaxed space-y-4 text-center">
                <p>
                  Most stuck riders reach for another plan. But a plan built on
                  a stale FTP, aimed at the wrong cause, just buries you deeper.
                  The fastest way forward is to first know two things: the real
                  number your training should be built on, and which of the four
                  causes is actually holding you back.
                </p>
                <p>
                  The Plateau Blueprint does exactly that &mdash; in an
                  afternoon, for the price of a couple of energy-bar boxes.
                </p>
              </div>
            </ScrollReveal>
          </Container>
        </Section>

        {/* The four causes */}
        <Section background="deep-purple" grain>
          <Container width="narrow">
            <ScrollReveal direction="up" className="text-center mb-12">
              <p className="text-coral font-heading text-xs tracking-widest mb-3">
                THE FOUR CAUSES
              </p>
              <h2
                className="font-heading text-off-white mb-4"
                style={{ fontSize: "var(--text-section)" }}
              >
                YOUR PLATEAU IS ONE OF THESE
              </h2>
              <p className="text-foreground-muted max-w-2xl mx-auto leading-relaxed">
                There are only four reasons a serious amateur&apos;s FTP stops
                moving. Each has a specific cause and a specific fix. The
                Blueprint tells you which one is yours.
              </p>
            </ScrollReveal>

            <div className="grid sm:grid-cols-2 gap-4 md:gap-5">
              {FOUR_CAUSES.map((cause, i) => (
                <ScrollReveal key={cause.title} direction="up" delay={i * 0.06}>
                  <Card className="p-6 h-full" hoverable={false}>
                    <span
                      aria-hidden="true"
                      className="absolute left-0 top-6 bottom-6 w-[3px] rounded-r bg-coral"
                    />
                    <p className="font-heading text-coral text-2xl leading-none mb-2">
                      {cause.n}
                    </p>
                    <h3 className="font-heading text-lg md:text-xl text-off-white tracking-wide mb-2">
                      {cause.title.toUpperCase()}
                    </h3>
                    <p className="text-foreground-muted text-sm md:text-[15px] leading-relaxed">
                      {cause.body}
                    </p>
                  </Card>
                </ScrollReveal>
              ))}
            </div>
          </Container>
        </Section>

        {/* What's inside */}
        <Section background="charcoal">
          <Container width="narrow">
            <ScrollReveal direction="up" className="text-center mb-12">
              <p className="text-coral font-heading text-xs tracking-widest mb-3">
                WHAT&apos;S INSIDE
              </p>
              <h2
                className="font-heading text-off-white mb-4"
                style={{ fontSize: "var(--text-section)" }}
              >
                EVERYTHING YOU NEED TO DIAGNOSE THE STALL
              </h2>
            </ScrollReveal>

            <div className="grid md:grid-cols-2 gap-4 md:gap-5">
              {WHATS_INSIDE.map((item, i) => (
                <ScrollReveal key={item.title} direction="up" delay={i * 0.05}>
                  <div className="p-6 rounded-lg bg-white/[0.04] border border-white/10 h-full">
                    <h3 className="font-heading text-base md:text-lg text-off-white tracking-wide mb-2">
                      {item.title.toUpperCase()}
                    </h3>
                    <p className="text-sm text-foreground-muted leading-relaxed">
                      {item.body}
                    </p>
                  </div>
                </ScrollReveal>
              ))}
            </div>

            <ScrollReveal direction="up" className="text-center mt-10">
              <p className="text-foreground-muted text-sm max-w-xl mx-auto leading-relaxed">
                Built from {BRAND_STATS.episodeCountLabel} on-the-record
                conversations with World Tour coaches and sports scientists
                &mdash; the same foundation as the full Roadman Method,
                distilled into one focused workbook.
              </p>
            </ScrollReveal>
          </Container>
        </Section>

        {/* Proof */}
        {blueprintTestimonials.length > 0 && (
          <Section background="deep-purple" grain>
            <Container width="narrow">
              <ScrollReveal direction="up" className="text-center mb-12">
                <p className="text-coral font-heading text-xs tracking-widest mb-3">
                  IN THEIR WORDS
                </p>
                <h2
                  className="font-heading text-off-white mb-4"
                  style={{ fontSize: "var(--text-section)" }}
                >
                  RIDERS WHO STOPPED GUESSING
                </h2>
                <p className="text-foreground-muted max-w-2xl mx-auto leading-relaxed">
                  Real members of the Roadman system. Real numbers. None of
                  these are paid.
                </p>
              </ScrollReveal>

              <div className="grid md:grid-cols-3 gap-4">
                {blueprintTestimonials.map((t, i) => (
                  <ScrollReveal key={t.name} direction="up" delay={i * 0.06}>
                    <Card
                      className="p-6 h-full border-l-2 border-l-coral"
                      hoverable={false}
                    >
                      {t.stat && (
                        <div className="mb-4">
                          <div className="font-heading text-coral text-2xl tracking-tight">
                            {t.stat}
                          </div>
                          <div className="text-foreground-subtle text-[10px] tracking-widest uppercase">
                            {t.statLabel}
                          </div>
                        </div>
                      )}
                      <p className="text-sm text-off-white italic leading-relaxed mb-4">
                        &ldquo;{t.shortQuote ?? t.quote}&rdquo;
                      </p>
                      <p className="font-heading text-xs text-off-white tracking-wider">
                        {t.name.toUpperCase()}
                      </p>
                      <p className="text-foreground-subtle text-xs leading-relaxed mt-1">
                        {t.detail}
                      </p>
                    </Card>
                  </ScrollReveal>
                ))}
              </div>
            </Container>
          </Section>
        )}

        {/* Get it — email capture / waitlist */}
        <Section background="charcoal" id="get-it">
          <Container width="narrow">
            <ScrollReveal direction="up" className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <ComingSoonPill>Coming soon</ComingSoonPill>
              </div>
              <p className="text-coral font-heading text-xs tracking-widest mb-3">
                EARLY ACCESS
              </p>
              <h2
                className="font-heading text-off-white mb-4"
                style={{ fontSize: "var(--text-section)" }}
              >
                BE FIRST TO GET THE BLUEPRINT
              </h2>
              <p className="text-foreground-muted max-w-xl mx-auto leading-relaxed">
                The Plateau Blueprint launches soon at ${BLUEPRINT_PRICE}. Leave
                your email and you&apos;ll get first access the moment it&apos;s
                ready &mdash; at the lowest price it&apos;ll ever be. You&apos;ll
                also get the Saturday Spin newsletter; one click unsubscribes.
              </p>
            </ScrollReveal>

            <ScrollReveal direction="up">
              <div className="max-w-lg mx-auto">
                <EmailCapture
                  variant="inline"
                  source="plateau-blueprint"
                  heading="JOIN THE BLUEPRINT WAITLIST"
                  subheading="First access, launch pricing, and the four-cause framework straight to your inbox."
                  buttonText="GET EARLY ACCESS"
                />
              </div>
            </ScrollReveal>

            <ScrollReveal direction="up" className="text-center mt-10">
              <p className="text-foreground-muted text-sm leading-relaxed max-w-xl mx-auto">
                Want the full picture instead of waiting? Take the free{" "}
                <Link
                  href="/plateau"
                  className="text-coral hover:text-coral-hover transition-colors"
                  data-track="plateau_blueprint_to_diagnostic"
                >
                  Plateau Diagnostic
                </Link>{" "}
                now &mdash; or go all-in with{" "}
                <Link
                  href="/method"
                  className="text-coral hover:text-coral-hover transition-colors"
                  data-track="plateau_blueprint_to_method"
                >
                  The Roadman Method
                </Link>
                , the complete 12-week course this Blueprint is the first step
                toward.
              </p>
            </ScrollReveal>
          </Container>
        </Section>

        {/* Final framing — seeds the Method */}
        <Section background="coral" className="!py-16 md:!py-24">
          <Container className="text-center">
            <h2
              className="font-heading text-off-white mb-4"
              style={{ fontSize: "var(--text-section)" }}
            >
              THE FIRST STEP, NOT THE LAST.
            </h2>
            <p className="text-off-white/85 max-w-lg mx-auto mb-8 text-lg">
              The Blueprint tells you what&apos;s wrong and what to change this
              week. When you&apos;re ready to build the whole season around it,
              the Roadman Method is waiting.
            </p>
            <Link
              href="/method"
              className="inline-flex items-center justify-center gap-2 font-heading tracking-wider uppercase rounded-md transition-all cursor-pointer active:scale-[0.97] active:duration-75 px-8 md:px-10 py-4 text-lg bg-off-white text-coral hover:bg-off-white/90 shadow-lg"
              style={{ transitionDuration: "var(--duration-fast)" }}
              data-track="plateau_blueprint_footer_method"
            >
              Explore The Roadman Method
            </Link>
          </Container>
        </Section>
      </main>

      <Footer />
    </>
  );
}
