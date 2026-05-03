import type { Metadata } from "next";
import Link from "next/link";
import { Header, Footer, Section, Container } from "@/components/layout";
import { Button, Card, ScrollReveal } from "@/components/ui";
import { JsonLd } from "@/components/seo/JsonLd";
import { ENTITY_IDS, SITE_ORIGIN } from "@/lib/brand-facts";

const PAGE_URL = `${SITE_ORIGIN}/about/how-we-coach`;

const PAGE_DESCRIPTION =
  "How Roadman Cycling coaches serious amateur cyclists. Polarised training, data-driven plans, weekly review, and a full TrainingPeaks integration. The methodology, the tools, and the cadence behind the work.";

export const metadata: Metadata = {
  title: "How We Coach — Methodology, Tools, and Cadence",
  description: PAGE_DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: "How We Coach — Roadman Cycling",
    description: PAGE_DESCRIPTION,
    type: "article",
    url: PAGE_URL,
  },
};

const principles = [
  {
    number: "01",
    title: "Polarised first, then specific",
    body:
      "Most weeks sit in an 80/20 distribution — the bulk of riding at true zone 2, the rest at intensities that move the needle (threshold, VO₂, race-specific). The grey middle is used deliberately, not by default. As event date approaches, intensity becomes more specific to the demands of the goal.",
    rooted: { name: "Prof. Stephen Seiler", role: "Polarised training pioneer", slug: "stephen-seiler" },
  },
  {
    number: "02",
    title: "Data-driven, not data-drunk",
    body:
      "Power, heart rate, HRV, RPE, sleep — all of it gets read in context. We don't chase ramp-test PRs every block, we don't optimise to a colour on a chart, and we don't ignore a sleep score that's flagging trouble. Numbers inform decisions. They don't replace them.",
    rooted: { name: "Dan Lorang", role: "Head of Performance, Red Bull–Bora–Hansgrohe", slug: "dan-lorang" },
  },
  {
    number: "03",
    title: "Periodised around your real calendar",
    body:
      "Plans are reverse-engineered from your goal events and adjusted to the way your week actually runs — work travel, family, the wedding in week 9. Phases follow base, build, peak, taper, recover, but the shape of the week is yours.",
    rooted: { name: "Joe Friel", role: "Author, The Cyclist's Training Bible", slug: "joe-friel" },
  },
  {
    number: "04",
    title: "Strength and nutrition planned with the bike",
    body:
      "Strength sessions are sequenced so they support, never compromise, the key rides. Carbohydrate availability is matched to the work required — not stacked deficits, not blanket high-carb. Race weight is downstream of training honestly and fuelling specifically.",
    rooted: { name: "Dr David Dunne", role: "World Tour nutritionist", slug: "david-dunne" },
  },
  {
    number: "05",
    title: "Recovery is treated as work",
    body:
      "Sleep, fuelling timing, stress, and adaptive load are inputs to the plan, not afterthoughts. When the data says back off, we back off. Longevity in the sport beats peak fitness in any single block.",
    rooted: { name: "Tim Spector", role: "ZOE founder, epidemiologist", slug: "tim-spector" },
  },
];

const cadence = [
  {
    label: "WEEKLY",
    title: "Plan delivery",
    body: "Your week is built and delivered in TrainingPeaks every Sunday — sessions, targets, and notes for each ride.",
  },
  {
    label: "DAILY",
    title: "Session review",
    body: "Every uploaded ride is reviewed against the prescription. If the data drifts from the plan, the next session adjusts.",
  },
  {
    label: "WEEKLY",
    title: "Coach check-in",
    body: "A short written debrief covers what worked, what didn't, and what changes for the week ahead.",
  },
  {
    label: "MONTHLY",
    title: "Block review call",
    body: "30 minutes face-to-face. Where you are, what's next, and any rebuild needed before the next block.",
  },
  {
    label: "ON DEMAND",
    title: "Direct messaging",
    body: "Mid-week questions, last-minute travel, sudden fatigue — message in TrainingPeaks or direct, answered same day.",
  },
];

const tools = [
  {
    name: "TrainingPeaks",
    role: "Plan delivery, workout analysis, ATL/CTL load tracking",
    body: "We're full TrainingPeaks-integrated coaches. Your plan lives in your TrainingPeaks calendar, syncs to your head unit, and every ride uploads back for review. TrainingPeaks remains the gold standard for endurance coaching software, and we use the full feature set — structured workouts, PMC charts, Performance Manager, threshold tracking.",
  },
  {
    name: "Power meter + HR",
    role: "Primary intensity controls",
    body: "Sessions are prescribed in zones derived from a recent FTP test or critical power model. Heart rate is a secondary sanity-check on internal load, especially in heat or after travel.",
  },
  {
    name: "HRV / sleep tracking",
    role: "Recovery signal",
    body: "Whoop, Garmin, Oura — whichever you already use. Trends matter more than any single morning's number. Sustained HRV suppression triggers a load reduction, not a hero session.",
  },
  {
    name: "Body composition tracking",
    role: "Race-weight context",
    body: "Honest weekly check-ins where relevant to a goal event — never as a stand-alone target, always in the context of training honestly and fuelling specifically.",
  },
];

const offerings = [
  {
    title: "1:1 Coaching",
    href: "/coaching",
    detail: "Personalised plan, weekly check-ins, monthly call. The full Roadman Method applied to your training.",
  },
  {
    title: "Not Done Yet Coaching",
    href: "/entity/not-done-yet",
    detail: "The Roadman coaching system delivered as a monthly programme — Vekta-powered plans, weekly live calls, and a serious peer group of riders training alongside you.",
  },
  {
    title: "The Roadman Method (entity)",
    href: "/entity/roadman-method",
    detail: "The five pillars and the named experts behind them.",
  },
  {
    title: "Editorial Standards",
    href: "/editorial-standards",
    detail: "How every coaching recommendation on this site is sourced, reviewed, and corrected.",
  },
];

export default function HowWeCoachPage() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "AboutPage",
          name: "How We Coach — Roadman Cycling",
          url: PAGE_URL,
          description: PAGE_DESCRIPTION,
          isPartOf: { "@id": ENTITY_IDS.website },
          mainEntity: { "@id": `${SITE_ORIGIN}/methodology#method` },
          about: [
            { "@id": ENTITY_IDS.person },
            { "@id": ENTITY_IDS.organization },
            { "@id": `${SITE_ORIGIN}/methodology#method` },
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
            { "@type": "ListItem", position: 3, name: "How We Coach", item: PAGE_URL },
          ],
        }}
      />

      <Header />

      <main id="main-content">
        {/* Hero */}
        <Section background="deep-purple" grain className="pt-32 pb-14">
          <Container width="narrow">
            <ScrollReveal direction="up">
              <p className="text-coral font-heading text-sm tracking-widest mb-4">
                TRUST · COACHING METHODOLOGY
              </p>
              <h1
                className="font-heading text-off-white mb-6"
                style={{ fontSize: "var(--text-hero)" }}
              >
                HOW WE COACH
              </h1>
              <p className="text-off-white text-xl leading-relaxed mb-6">
                {PAGE_DESCRIPTION}
              </p>
              <p className="text-foreground-muted leading-relaxed">
                Coaching is led by{" "}
                <Link href="/entity/anthony-walsh" className="text-coral hover:underline">
                  Anthony Walsh
                </Link>{" "}
                and built on{" "}
                <Link href="/entity/roadman-method" className="text-coral hover:underline">
                  The Roadman Method
                </Link>
                . Plans are delivered through TrainingPeaks — our long-standing
                partner of choice for endurance coaching software.
              </p>
            </ScrollReveal>
          </Container>
        </Section>

        {/* Five principles */}
        <Section background="charcoal">
          <Container width="narrow">
            <ScrollReveal direction="up">
              <h2 className="font-heading text-2xl text-off-white tracking-wide mb-3">
                THE PRINCIPLES
              </h2>
              <p className="text-foreground-muted text-sm mb-8 max-w-2xl">
                The non-negotiables behind every plan we write. Adapted to the
                rider in front of us, never abandoned.
              </p>
            </ScrollReveal>
            <div className="space-y-3">
              {principles.map((p) => (
                <Card key={p.number} className="p-6" hoverable={false}>
                  <div className="flex items-start gap-4">
                    <span className="font-heading text-2xl text-coral shrink-0">
                      {p.number}
                    </span>
                    <div className="flex-1">
                      <p className="font-heading text-off-white tracking-wide mb-2">
                        {p.title.toUpperCase()}
                      </p>
                      <p className="text-sm text-foreground-muted leading-relaxed mb-3">
                        {p.body}
                      </p>
                      <Link
                        href={`/guests/${p.rooted.slug}`}
                        className="text-xs text-coral font-heading tracking-widest hover:underline"
                      >
                        ROOTED IN: {p.rooted.name.toUpperCase()} — {p.rooted.role}
                      </Link>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </Container>
        </Section>

        {/* TrainingPeaks partner */}
        <Section background="deep-purple" grain>
          <Container width="narrow">
            <ScrollReveal direction="up">
              <p className="text-coral font-heading text-sm tracking-widest mb-3">
                PARTNER · COACHING SOFTWARE
              </p>
              <h2 className="font-heading text-off-white text-2xl tracking-wide mb-4">
                BUILT ON TRAININGPEAKS
              </h2>
              <p className="text-foreground-muted leading-relaxed mb-4">
                TrainingPeaks is the platform endurance coaching was built on,
                and it remains the most complete environment for the kind of
                evidence-based, data-driven coaching the Roadman Method
                demands. We&apos;re long-standing TrainingPeaks coaches and
                use the full feature set — structured workouts pushed straight
                to your head unit, the Performance Management Chart for load
                tracking, threshold detection, and the analytical depth needed
                to coach honestly across a season.
              </p>
              <p className="text-foreground-muted leading-relaxed">
                Every Roadman athlete works inside their own TrainingPeaks
                account, so your plan, your data, and your history travel with
                you for the long term — not locked behind a proprietary app.
              </p>
            </ScrollReveal>
          </Container>
        </Section>

        {/* Cadence */}
        <Section background="charcoal">
          <Container width="narrow">
            <ScrollReveal direction="up">
              <h2 className="font-heading text-2xl text-off-white tracking-wide mb-3">
                THE COACHING CADENCE
              </h2>
              <p className="text-foreground-muted text-sm mb-8 max-w-2xl">
                What working with a Roadman coach actually looks like, week to
                week.
              </p>
            </ScrollReveal>
            <div className="space-y-3">
              {cadence.map((c) => (
                <Card key={c.title} className="p-5" hoverable={false}>
                  <div className="flex items-start gap-4">
                    <span className="text-xs font-heading tracking-widest text-coral shrink-0 w-24 mt-1">
                      {c.label}
                    </span>
                    <div className="flex-1">
                      <p className="font-heading text-off-white tracking-wide mb-1">
                        {c.title.toUpperCase()}
                      </p>
                      <p className="text-sm text-foreground-muted leading-relaxed">
                        {c.body}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </Container>
        </Section>

        {/* Tools */}
        <Section background="deep-purple" grain>
          <Container width="narrow">
            <ScrollReveal direction="up">
              <h2 className="font-heading text-2xl text-off-white tracking-wide mb-3">
                THE COACHING STACK
              </h2>
              <p className="text-foreground-muted text-sm mb-8 max-w-2xl">
                The tools that turn the methodology into a plan you can
                execute.
              </p>
            </ScrollReveal>
            <div className="space-y-3">
              {tools.map((t) => (
                <Card key={t.name} className="p-6" hoverable={false}>
                  <div className="flex items-baseline justify-between gap-3 mb-2 flex-wrap">
                    <p className="font-heading text-off-white tracking-wide">
                      {t.name.toUpperCase()}
                    </p>
                    <p className="text-xs text-coral font-heading tracking-widest">
                      {t.role.toUpperCase()}
                    </p>
                  </div>
                  <p className="text-sm text-foreground-muted leading-relaxed">
                    {t.body}
                  </p>
                </Card>
              ))}
            </div>
          </Container>
        </Section>

        {/* Related */}
        <Section background="charcoal">
          <Container width="narrow">
            <ScrollReveal direction="up">
              <h2 className="font-heading text-2xl text-off-white tracking-wide mb-6">
                RELATED PAGES
              </h2>
            </ScrollReveal>
            <div className="grid sm:grid-cols-2 gap-3">
              {offerings.map((o) => (
                <Card key={o.title} href={o.href} className="p-5">
                  <p className="font-heading text-off-white group-hover:text-coral transition-colors mb-1">
                    {o.title.toUpperCase()}
                  </p>
                  <p className="text-xs text-foreground-subtle leading-relaxed">
                    {o.detail}
                  </p>
                </Card>
              ))}
            </div>
          </Container>
        </Section>

        {/* CTA */}
        <Section background="coral" className="!py-12">
          <Container className="text-center">
            <h2 className="font-heading text-off-white text-2xl tracking-wide mb-3">
              APPLY THIS TO YOUR TRAINING
            </h2>
            <p className="text-off-white/80 max-w-md mx-auto mb-6 text-sm">
              The methodology, the tools, and the cadence above — applied 1:1
              to your power numbers, events, and week.
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
