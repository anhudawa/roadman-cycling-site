import type { Metadata } from "next";
import Link from "next/link";
import { CheckoutButton } from "@/components/features/conversion/CheckoutButton";
import { Footer, Header, Section, Container } from "@/components/layout";
import { FAQSchema } from "@/components/seo/FAQSchema";
import { JsonLd } from "@/components/seo/JsonLd";
import { Card, ScrollReveal } from "@/components/ui";
import { ENTITY_IDS, SITE_ORIGIN } from "@/lib/brand-facts";

const PRODUCT_PATH = "/strength-training";
const PRODUCT_URL = `${SITE_ORIGIN}${PRODUCT_PATH}`;
const PRODUCT_PRICE = 65;
const PRODUCT_DESCRIPTION =
  "A self-guided 12-week strength and conditioning plan for cyclists, with two weekly sessions, exercise demonstrations, progression, core work and mobility guidance.";

export const metadata: Metadata = {
  title: {
    absolute: "Cycling Strength Training Plan: 12-Week S&C Programme",
  },
  description:
    "A self-guided 12-week cycling strength training plan: two weekly sessions, exercise videos, progression and honest limits on performance transfer.",
  alternates: { canonical: PRODUCT_URL },
  openGraph: {
    title: "12-Week Strength Training Plan for Cyclists",
    description: PRODUCT_DESCRIPTION,
    type: "website",
    url: PRODUCT_URL,
    siteName: "Roadman Cycling",
    images: [
      {
        url: `${SITE_ORIGIN}/images/blog/cyclist-strength-training-gym.webp`,
        width: 1200,
        height: 630,
        alt: "Cyclist completing strength training in a gym",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "12-Week Strength Training Plan for Cyclists",
    description: PRODUCT_DESCRIPTION,
    images: [`${SITE_ORIGIN}/images/blog/cyclist-strength-training-gym.webp`],
  },
};

const FAQS = [
  {
    question: "What is included in the Roadman cycling strength plan?",
    answer:
      "It is a self-guided 12-week programme with two strength sessions per week, staged progression, deload weeks, exercise demonstrations, set-and-rep tracking, core work, warm-ups, mobility and stretching guidance. It is a fixed programme rather than individual coaching or an adaptive app.",
  },
  {
    question: "How often should cyclists strength train?",
    answer:
      "This programme uses two sessions per week. That is a practical programme design, not a research-proven optimum for every cyclist. The latest cyclist-only meta-analysis included one to three weekly sessions and could not establish the best implementation. Reduce or move work when priority riding repeatedly loses quality.",
  },
  {
    question: "Will the programme improve my FTP or prevent injury?",
    answer:
      "No individual result is guaranteed. Pooled cyclist research supports possible improvements in cycling performance, efficiency and anaerobic power, but not a significant overall VO2max or maximal-steady-state effect. The programme is not physiotherapy and does not diagnose pain or guarantee injury prevention.",
  },
  {
    question: "Is the plan suitable for cyclists over 40 or 50?",
    answer:
      "It can suit a healthy masters cyclist who can perform and progress the movements, but age alone does not clear the programme. Training history, health, joint comfort and current cycling load matter. Osteoporosis, cardiovascular risk, persistent pain or another medical concern needs appropriate professional advice.",
  },
  {
    question: "Will strength training make me heavier?",
    answer:
      "Body-mass and lean-mass changes vary with training volume, nutrition and the individual. This page does not promise that a cyclist will add bulk or remain exactly the same weight. Track body mass and cycling outcomes if power-to-weight is important to your goal.",
  },
  {
    question: "How is the fixed plan different from the upcoming Roadman app?",
    answer:
      "The $65 course is a fixed 12-week self-guided programme. The upcoming iPhone app is being built to fit 30, 45 or 60-minute strength sessions around the riding week and use readiness guardrails. The app name, launch date and subscription price have not been announced.",
  },
  {
    question: "How much does the programme cost?",
    answer:
      "The current price is $65 USD as a one-time payment with lifetime access. Checkout is handled by Stripe. The course is separate from the upcoming app and from Roadman coaching.",
  },
] as const;

const INCLUDED = [
  {
    title: "12-week progression",
    body: "Two sessions per week across foundation, strength, deload and power-oriented phases, with the weekly work visible before you begin.",
  },
  {
    title: "Exercise demonstrations",
    body: "Video examples and coaching cues for the programmed movements. A video cannot assess your technique or replace in-person supervision when you need it.",
  },
  {
    title: "Set and rep tracking",
    body: "Record the work completed and compare it with the next exposure instead of relying on memory or adding load automatically.",
  },
  {
    title: "Core and warm-up work",
    body: "Supporting trunk and preparation sessions are included without claiming that one exercise directly creates watts or prevents back pain.",
  },
  {
    title: "Mobility and stretching",
    body: "Optional mobility, stretching and foam-rolling guidance for riders who find it useful. These methods are not presented as injury treatment.",
  },
  {
    title: "Lifetime access",
    body: "One purchase gives ongoing access to the self-guided course. It does not include individual programme changes or medical review.",
  },
] as const;

const DECISION_ROWS = [
  {
    need: "A fixed programme I can follow myself",
    answer: "This 12-week course",
    href: "#enrol",
  },
  {
    need: "Strength placed around an existing ride week",
    answer: "Upcoming Roadman app",
    href: "/app?source=strength-plan",
  },
  {
    need: "Bike and gym training reviewed by a person",
    answer: "Roadman coaching",
    href: "/coaching",
  },
] as const;

export default function StrengthTrainingPage() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Product",
              "@id": `${PRODUCT_URL}#product`,
              name: "Roadman 12-Week Strength & Conditioning Plan",
              description: PRODUCT_DESCRIPTION,
              category: "Cycling strength training programme",
              brand: { "@type": "Brand", name: "Roadman Cycling" },
              image: `${SITE_ORIGIN}/images/blog/cyclist-strength-training-gym.webp`,
              url: PRODUCT_URL,
              offers: {
                "@type": "Offer",
                price: String(PRODUCT_PRICE),
                priceCurrency: "USD",
                availability: "https://schema.org/InStock",
                url: PRODUCT_URL,
              },
            },
            {
              "@type": "WebPage",
              "@id": `${PRODUCT_URL}#webpage`,
              url: PRODUCT_URL,
              name: "12-Week Strength Training Plan for Cyclists",
              description: PRODUCT_DESCRIPTION,
              isPartOf: { "@id": ENTITY_IDS.website },
              about: { "@id": `${PRODUCT_URL}#product` },
              dateModified: "2026-09-01",
            },
            {
              "@type": "BreadcrumbList",
              itemListElement: [
                {
                  "@type": "ListItem",
                  position: 1,
                  name: "Home",
                  item: SITE_ORIGIN,
                },
                {
                  "@type": "ListItem",
                  position: 2,
                  name: "Cycling strength training plan",
                  item: PRODUCT_URL,
                },
              ],
            },
          ],
        }}
      />
      <FAQSchema faqs={[...FAQS]} />
      <Header />

      <main id="main-content">
        <Section background="deep-purple" grain className="pt-32 pb-20">
          <Container>
            <div className="mx-auto max-w-4xl text-center">
              <p className="mb-6 font-heading text-sm tracking-[0.2em] text-coral">
                SELF-GUIDED · 12 WEEKS · TWO SESSIONS A WEEK
              </p>
              <h1
                className="font-heading leading-[0.94] text-off-white"
                style={{ fontSize: "var(--text-hero)" }}
              >
                A STRENGTH TRAINING PLAN
                <span className="mt-2 block text-coral">BUILT FOR CYCLISTS.</span>
              </h1>
              <p className="mx-auto mt-7 max-w-2xl text-lg leading-relaxed text-foreground-muted md:text-xl">
                Follow a visible 12-week progression, log every set and fit two
                gym sessions around the cycling that matters. No guaranteed FTP,
                pain or injury claims—just the programme, its evidence and its
                limits.
              </p>
              <div className="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Link
                  href="#enrol"
                  className="inline-flex items-center justify-center rounded-md bg-coral px-8 py-4 font-heading tracking-wider text-off-white transition-colors hover:bg-coral/90"
                >
                  GET THE PLAN — $65
                </Link>
                <Link
                  href="/sc/programme"
                  className="inline-flex items-center justify-center rounded-md border border-white/20 px-8 py-4 font-heading tracking-wider text-off-white transition-colors hover:border-white/40"
                >
                  PREVIEW THE STRUCTURE
                </Link>
              </div>
              <p className="mt-4 text-sm text-foreground-subtle">
                One-time payment · Lifetime access · 100% money-back guarantee
              </p>
            </div>
          </Container>
        </Section>

        <Section background="charcoal" className="!py-12">
          <Container>
            <div className="grid gap-4 md:grid-cols-3">
              {DECISION_ROWS.map((row) => (
                <Link
                  key={row.need}
                  href={row.href}
                  className="rounded-xl border border-white/10 bg-white/[0.03] p-5 transition-colors hover:border-coral/40"
                >
                  <p className="text-sm leading-relaxed text-foreground-muted">
                    {row.need}
                  </p>
                  <p className="mt-3 font-heading tracking-wide text-coral">
                    {row.answer} →
                  </p>
                </Link>
              ))}
            </div>
          </Container>
        </Section>

        <Section background="charcoal">
          <Container>
            <ScrollReveal direction="up" className="mx-auto max-w-3xl text-center">
              <p className="mb-4 font-heading text-xs tracking-[0.2em] text-coral">
                WHAT THE CYCLIST EVIDENCE SAYS
              </p>
              <h2
                className="font-heading text-off-white"
                style={{ fontSize: "var(--text-section)" }}
              >
                USEFUL EVIDENCE. HONEST LIMITS.
              </h2>
              <p className="mt-6 text-lg leading-relaxed text-foreground-muted">
                The latest cyclist-only meta-analysis included 17 controlled
                studies and 262 riders. Heavy strength training improved pooled
                cycling performance, efficiency and anaerobic power, but the
                certainty was low and the review could not establish the best
                frequency or implementation.
              </p>
            </ScrollReveal>

            <div className="mx-auto mt-12 grid max-w-5xl gap-5 md:grid-cols-3">
              <Card className="p-6" hoverable={false}>
                <p className="font-heading text-3xl text-coral">1–3</p>
                <p className="mt-2 font-heading text-off-white">sessions per week</p>
                <p className="mt-3 text-sm leading-relaxed text-foreground-muted">
                  The reviewed studies used a range. This course uses two as its
                  design, not as a universal physiological law.
                </p>
              </Card>
              <Card className="p-6" hoverable={false}>
                <p className="font-heading text-3xl text-coral">5–25</p>
                <p className="mt-2 font-heading text-off-white">weeks studied</p>
                <p className="mt-3 text-sm leading-relaxed text-foreground-muted">
                  A 12-week course sits inside the evidence range. That does not
                  make this exact programme the one tested intervention.
                </p>
              </Card>
              <Card className="p-6" hoverable={false}>
                <p className="font-heading text-3xl text-coral">LOW</p>
                <p className="mt-2 font-heading text-off-white">certainty</p>
                <p className="mt-3 text-sm leading-relaxed text-foreground-muted">
                  No automatic FTP gain, fixed watt increase, injury prevention
                  or pain relief should be promised to an individual rider.
                </p>
              </Card>
            </div>

            <p className="mx-auto mt-8 max-w-3xl text-center text-sm leading-relaxed text-foreground-muted">
              Read the full claim-by-claim analysis in Roadman&apos;s{" "}
              <Link
                href="/blog/cycling-strength-training-guide"
                className="text-coral hover:text-coral/80"
              >
                strength training for cyclists guide
              </Link>
              , including the outcomes that did not improve significantly.
            </p>
          </Container>
        </Section>

        <Section background="deep-purple" grain id="whats-inside">
          <Container>
            <div className="mx-auto max-w-3xl text-center">
              <h2
                className="font-heading text-off-white"
                style={{ fontSize: "var(--text-section)" }}
              >
                WHAT YOU GET
              </h2>
              <p className="mt-4 text-lg text-foreground-muted">
                The product is a fixed self-guided course. Here is exactly what
                that means—and what it does not mean.
              </p>
            </div>
            <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {INCLUDED.map((item) => (
                <Card key={item.title} className="p-6" glass hoverable={false}>
                  <h3 className="font-heading text-xl text-off-white">
                    {item.title.toUpperCase()}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-foreground-muted">
                    {item.body}
                  </p>
                </Card>
              ))}
            </div>
          </Container>
        </Section>

        <Section background="charcoal">
          <Container width="narrow">
            <h2
              className="font-heading text-off-white"
              style={{ fontSize: "var(--text-section)" }}
            >
              FIT THE GYM AROUND THE BIKE
            </h2>
            <div className="mt-8 space-y-6 text-lg leading-relaxed text-foreground-muted">
              <p>
                This course cannot see your calendar. Start by marking races,
                key intervals and long rides, then place the strength sessions
                where they are least likely to compromise those priorities.
              </p>
              <ol className="space-y-4 pl-6 marker:font-heading marker:text-coral">
                <li>
                  Protect the cycling session most connected to the current goal.
                </li>
                <li>
                  Avoid introducing a demanding lift immediately before a key
                  ride when you do not yet know your soreness response.
                </li>
                <li>
                  Record gym performance, soreness, joint comfort and the next
                  priority ride—not the lift in isolation.
                </li>
                <li>
                  Reduce sets, move the session or repeat a week when the whole
                  programme stops being recoverable. Missed work is not debt.
                </li>
              </ol>
              <p>
                Illness, unexplained pain, movement-altering pain or a health
                concern needs the appropriate clinician or qualified
                professional. This programme is training education, not
                diagnosis or rehabilitation.
              </p>
            </div>
          </Container>
        </Section>

        <Section background="charcoal" className="!pt-0">
          <Container>
            <div className="rounded-2xl border border-coral/25 bg-coral/[0.07] p-7 md:p-10">
              <div className="grid items-center gap-8 lg:grid-cols-[1fr_auto]">
                <div>
                  <p className="font-heading text-xs tracking-[0.2em] text-coral">
                    WANT THE WEEK TO ADAPT?
                  </p>
                  <h2 className="mt-3 font-heading text-3xl text-off-white md:text-4xl">
                    THE UPCOMING APP IS A DIFFERENT PRODUCT.
                  </h2>
                  <p className="mt-4 max-w-3xl leading-relaxed text-foreground-muted">
                    Roadman is building an iPhone strength and recovery app that
                    places 30, 45 or 60-minute work around your existing rides
                    and explains readiness adjustments. Its final name, date and
                    price are not announced. Everyone joins the same early-access
                    list; this link records that the fixed course led you there.
                  </p>
                </div>
                <Link
                  href="/app?source=strength-plan"
                  data-track="strength_plan_app_early_access"
                  className="inline-flex shrink-0 items-center justify-center rounded-md bg-coral px-7 py-4 font-heading tracking-wider text-off-white transition-colors hover:bg-coral/90"
                >
                  JOIN APP EARLY ACCESS
                </Link>
              </div>
            </div>
          </Container>
        </Section>

        <Section background="deep-purple" grain>
          <Container width="narrow">
            <h2
              className="text-center font-heading text-off-white"
              style={{ fontSize: "var(--text-section)" }}
            >
              QUESTIONS BEFORE YOU START
            </h2>
            <div className="mt-12 space-y-8">
              {FAQS.map((faq) => (
                <div key={faq.question} className="border-b border-white/10 pb-8">
                  <h3 className="font-heading text-xl text-off-white">
                    {faq.question}
                  </h3>
                  <p className="mt-3 leading-relaxed text-foreground-muted">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </Container>
        </Section>

        <Section background="charcoal">
          <Container width="narrow">
            <p className="font-heading text-xs tracking-[0.2em] text-coral">
              SOURCES AND EDITORIAL BOUNDARIES
            </p>
            <ul className="mt-5 space-y-3 text-sm leading-relaxed text-foreground-muted">
              <li>
                <a
                  href="https://pubmed.ncbi.nlm.nih.gov/40632222/"
                  className="text-coral hover:text-coral/80"
                >
                  Cyclist-only heavy strength training systematic review and
                  meta-analysis (PMID 40632222)
                </a>
              </li>
              <li>
                <a
                  href="https://pubmed.ncbi.nlm.nih.gov/35728627/"
                  className="text-coral hover:text-coral/80"
                >
                  Concurrent training in adults over 50 systematic review and
                  meta-analysis (PMID 35728627)
                </a>
              </li>
              <li>
                <a
                  href="https://pubmed.ncbi.nlm.nih.gov/23256921/"
                  className="text-coral hover:text-coral/80"
                >
                  Cycling and bone health systematic review (PMID 23256921)
                </a>
              </li>
              <li>
                <a
                  href="https://www.who.int/publications/i/item/9789240015128"
                  className="text-coral hover:text-coral/80"
                >
                  WHO guidelines on physical activity and sedentary behaviour
                </a>
              </li>
            </ul>
            <p className="mt-6 text-sm leading-relaxed text-foreground-subtle">
              Last reviewed 1 September 2026. The research describes group
              outcomes; Roadman&apos;s course is a practical product, not the exact
              pooled intervention and not a guarantee of an individual result.
            </p>
          </Container>
        </Section>

        <Section background="coral" className="!py-16 md:!py-24" id="enrol">
          <Container className="text-center">
            <h2
              className="font-heading text-off-white"
              style={{ fontSize: "var(--text-section)" }}
            >
              START THE 12-WEEK PLAN
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-off-white/80">
              Two weekly sessions, exercise demonstrations, progression, core
              work, mobility guidance and tracking in one self-guided course.
            </p>
            <p className="my-8 font-heading text-6xl text-off-white">$65</p>
            <CheckoutButton>Get the plan</CheckoutButton>
            <p className="mt-6 text-sm text-off-white/70">
              One-time payment · Lifetime access · 100% money-back guarantee
            </p>
          </Container>
        </Section>
      </main>

      <Footer />
    </>
  );
}
