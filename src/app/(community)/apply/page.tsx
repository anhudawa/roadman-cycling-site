import type { Metadata } from "next";
import { Header, Footer, Section, Container } from "@/components/layout";
import { Card, ScrollReveal } from "@/components/ui";
import { CohortApplicationForm } from "./CohortApplicationForm";
import { CountdownTimer } from "./CountdownTimer";
import {
  TESTIMONIALS,
  getTestimonialsByName,
} from "@/lib/testimonials";
import { getCohortState } from "@/lib/cohort";

// Metadata is cohort-aware. Copy is keyed off getCohortState() so it
// flips automatically between "open" and "waitlist" phases with no
// hardcoded cohort numbers or dates.
export async function generateMetadata(): Promise<Metadata> {
  const state = getCohortState();
  const isWaitlist = state.phase === "waitlist";
  const title = isWaitlist
    ? `Cohort ${state.targetCohort} Waitlist — Not Done Yet Coaching Community`
    : `Cohort ${state.currentCohort} — Not Done Yet Coaching Community`;
  const description = isWaitlist
    ? `Cohort ${state.targetCohort} is coming soon. Apply now to join the waitlist and get 24-hour early access. Personalised cycling coaching with Anthony Walsh.`
    : "30 places. 5 pillars. $195/month. Applications open now. Personalised cycling coaching with Anthony Walsh.";
  return {
    title,
    description,
    alternates: {
      canonical: "https://roadmancycling.com/apply",
    },
    openGraph: {
      title,
      description,
      type: "website",
      url: "https://roadmancycling.com/apply",
    },
  };
}

// ── Testimonials (existing members + screenshots) ──────────────────

const heroStats = [
  { value: "+90w", label: "Damien's FTP gain" },
  { value: "3→1", label: "Daniel's cat jump in one season" },
  { value: "-16kg", label: "Chris's weight loss" },
  { value: "+15%", label: "Brian's FTP at age 52" },
];

// "Wins this week" wall — pulled from the central testimonials library
// in editorial order. David Lundy leads (comeback fits the "not done yet"
// angle most directly), then the power-PR quotes.
const communityWins = getTestimonialsByName([
  "David Lundy",
  "Blair Corey",
  "Vern Locke",
  "Quinton Gothard",
  "Gregory Gross",
  "John Devlin",
  "David Corrigan",
  "Keano Donne",
]);

// Featured results — quote + stat pulled from the central library;
// FTP-before/after bars are page-specific visuals so they stay local.
const featuredResults = (
  [
    { name: "Daniel Stone", ftpBefore: null, ftpAfter: null },
    { name: "Brian Morrissey", ftpBefore: 230, ftpAfter: 265 },
    { name: "Damien Maloney", ftpBefore: 205, ftpAfter: 295 },
  ] as const
).map(({ name, ftpBefore, ftpAfter }) => {
  const t = TESTIMONIALS.find((x) => x.name === name);
  return {
    name,
    context: t?.detail ?? "",
    statLabel: (t?.statLabel ?? "").toUpperCase(),
    statValue: t?.stat ?? "",
    quote: t?.quote ?? "",
    ftpBefore,
    ftpAfter,
  };
});

const pillars = [
  {
    icon: "🎯",
    name: "Training",
    description: "Personalised TrainingPeaks plans built by Anthony's coaching methodology",
  },
  {
    icon: "🍎",
    name: "Nutrition",
    description: "Race weight, fuelling strategy, and body composition — not calorie counting",
  },
  {
    icon: "💪",
    name: "Strength",
    description: "Cycling-specific S&C programme that transfers to the bike",
  },
  {
    icon: "😴",
    name: "Recovery",
    description: "Sleep, stress management, and adaptation protocols",
  },
  {
    icon: "🤝",
    name: "Accountability",
    description: "Weekly coaching calls, community support, and 1:1 plan reviews",
  },
];

const objections = [
  {
    q: "Is this just another online coaching programme?",
    a: "No. It's a system built from 1,400+ conversations with the coaches, nutritionists, and scientists at the top of the sport. Not recycled content — structured, applied knowledge with accountability.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes. Month-to-month. No contracts. No lock-in. We keep you because the system works, not because you're stuck.",
  },
  {
    q: "I only have 6 hours a week — is that enough?",
    a: "That's our sweet spot. Most members are professionals training 4-9 hours a week. The plans are built for real life, not the fantasy schedule you'll never follow.",
  },
  {
    q: "Why do I need to apply?",
    a: "We keep cohorts small (30 people) so the coaching stays personal. We want to make sure you're a fit — and that we can actually help you with where you are right now.",
  },
];

export default function ApplyPage() {
  const cohortState = getCohortState();
  const isWaitlist = cohortState.phase === "waitlist";
  return (
    <>
      <Header />

      <main id="main-content">
        {/* ── Hero ───────────────────────────────────────── */}
        <Section background="deep-purple" grain className="pt-32 pb-16 relative overflow-hidden">
          {/* Animated gradient orb behind text */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-coral/5 blur-[120px] pointer-events-none" />

          <Container className="text-center relative z-10">
            <ScrollReveal direction="up">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-coral/10 border border-coral/20 mb-6">
                <span className="w-2 h-2 rounded-full bg-coral animate-pulse" />
                <span className="text-coral text-sm font-medium tracking-wide">
                  {isWaitlist
                    ? `COHORT ${cohortState.targetCohort} COMING SOON — JOIN THE WAITLIST`
                    : "APPLICATIONS OPEN — 30 PLACES"}
                </span>
              </div>

              <h1
                className="font-heading text-off-white mb-2 text-gradient-animated"
                style={{ fontSize: "clamp(2.5rem, 8vw, 5rem)" }}
              >
                NOT DONE YET
              </h1>
              <p
                className="font-heading text-off-white/60 mb-4 tracking-widest"
                style={{ fontSize: "clamp(0.9rem, 2vw, 1.2rem)" }}
              >
                {isWaitlist
                  ? `COHORT ${cohortState.targetCohort} · WAITLIST`
                  : "COACHING PROGRAM"}
              </p>
              <p className="text-foreground-muted text-lg max-w-md mx-auto mb-6">
                {isWaitlist
                  ? `Cohort ${cohortState.targetCohort} is coming soon. Apply now to secure your spot on the waitlist — members get 24-hour early access before public launch.`
                  : "7-day free trial. 5 pillars. $195/mo. Cancel anytime."}
              </p>

              {!isWaitlist && (
                <div className="mb-6">
                  <CountdownTimer />
                </div>
              )}

              <a
                href="#apply"
                className="inline-flex items-center px-8 py-4 rounded-xl bg-coral text-off-white font-heading text-lg tracking-wider hover:bg-coral/90 transition-all shadow-lg shadow-coral/20 mb-10"
              >
                {isWaitlist ? "APPLY NOW — JOIN THE WAITLIST" : "APPLY NOW"}
              </a>
            </ScrollReveal>

            {/* Quick stats ticker */}
            <ScrollReveal direction="up" delay={0.2}>
              <div className="flex flex-wrap justify-center gap-6 md:gap-10">
                {heroStats.map((s) => (
                  <div key={s.label} className="text-center">
                    <p className="font-heading text-coral text-2xl md:text-3xl">{s.value}</p>
                    <p className="text-foreground-subtle text-xs mt-1">{s.label}</p>
                  </div>
                ))}
              </div>
            </ScrollReveal>
          </Container>
        </Section>

        {/* ── YouTube intro video ────────────────────────── */}
        <Section background="charcoal">
          <Container width="narrow">
            <ScrollReveal direction="up">
              <div className="relative aspect-video rounded-xl overflow-hidden border border-white/10 bg-background-elevated shadow-2xl">
                <iframe
                  src="https://www.youtube-nocookie.com/embed/mQJuKIjXxXg"
                  title="Not Done Yet — Roadman Cycling"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  loading="lazy"
                  className="absolute inset-0 w-full h-full"
                />
              </div>
            </ScrollReveal>
          </Container>
        </Section>

        {/* ── Five Pillars ───────────────────────────────── */}
        <Section background="charcoal">
          <Container>
            <ScrollReveal direction="up">
              <p className="text-coral font-heading text-lg text-center mb-3 tracking-widest">
                THE SYSTEM
              </p>
              <h2
                className="font-heading text-off-white text-center mb-12"
                style={{ fontSize: "var(--text-section)" }}
              >
                FIVE PILLARS
              </h2>
            </ScrollReveal>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 max-w-4xl mx-auto">
              {pillars.map((p, i) => (
                <ScrollReveal key={p.name} direction="up" delay={i * 0.08}>
                  <div className="text-center p-5 rounded-xl border border-white/5 bg-white/[0.02] hover:border-coral/20 transition-colors">
                    <span className="text-3xl block mb-3">{p.icon}</span>
                    <p className="font-heading text-off-white text-sm mb-1">
                      {p.name.toUpperCase()}
                    </p>
                    <p className="text-foreground-subtle text-xs leading-relaxed">
                      {p.description}
                    </p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </Container>
        </Section>

        {/* ── Gradient divider ──────────────────────────── */}
        <div className="gradient-divider" />

        {/* ── Featured Results ───────────────────────────── */}
        <Section background="deep-purple" grain>
          <Container>
            <ScrollReveal direction="up">
              <p className="text-coral font-heading text-lg text-center mb-3 tracking-widest">
                PAST COHORT RESULTS
              </p>
              <h2
                className="font-heading text-off-white text-center mb-12"
                style={{ fontSize: "var(--text-section)" }}
              >
                THE NUMBERS DON&apos;T LIE
              </h2>
            </ScrollReveal>
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {featuredResults.map((r, i) => (
                <ScrollReveal key={r.name} direction="up" delay={i * 0.12}>
                  <Card className="p-8 card-shimmer h-full" glass hoverable={false}>
                    <div className="text-center mb-6">
                      <p className="text-foreground-subtle text-xs tracking-widest mb-1">
                        {r.statLabel}
                      </p>
                      <p className="font-heading text-coral" style={{ fontSize: "2.5rem" }}>
                        {r.statValue}
                      </p>
                    </div>
                    {r.ftpBefore && r.ftpAfter && (
                      <div className="mb-6 space-y-3">
                        <div>
                          <div className="flex justify-between text-xs text-foreground-subtle mb-1">
                            <span>Before</span>
                            <span>{r.ftpBefore}w</span>
                          </div>
                          <div className="h-3 rounded-full bg-white/5 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-foreground-subtle/40"
                              style={{ width: `${(r.ftpBefore / 320) * 100}%` }}
                            />
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-xs text-foreground-subtle mb-1">
                            <span>After</span>
                            <span>{r.ftpAfter}w</span>
                          </div>
                          <div className="h-3 rounded-full bg-white/5 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-coral to-coral/70"
                              style={{ width: `${(r.ftpAfter / 320) * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                    <p className="font-heading text-off-white text-lg mb-1">{r.name}</p>
                    <p className="text-foreground-subtle text-xs tracking-wider mb-3">
                      {r.context.toUpperCase()}
                    </p>
                    <p className="text-foreground-muted text-sm leading-relaxed italic">
                      &ldquo;{r.quote}&rdquo;
                    </p>
                  </Card>
                </ScrollReveal>
              ))}
            </div>
          </Container>
        </Section>

        {/* ── Gradient divider ──────────────────────────── */}
        <div className="gradient-divider" />

        {/* ── Community Wins Wall ─────────────────────────── */}
        <Section background="charcoal">
          <Container>
            <ScrollReveal direction="up">
              <p className="text-coral font-heading text-lg text-center mb-3 tracking-widest">
                FROM THE COMMUNITY
              </p>
              <h2
                className="font-heading text-off-white text-center mb-4"
                style={{ fontSize: "var(--text-section)" }}
              >
                WINS THIS WEEK
              </h2>
              <p className="text-foreground-muted text-center max-w-lg mx-auto mb-12">
                Real posts from real members. No cherry-picking.
              </p>
            </ScrollReveal>
            <div className="columns-1 md:columns-2 lg:columns-3 gap-4 max-w-6xl mx-auto">
              {communityWins.map((w, i) => (
                <ScrollReveal key={w.name} direction="up" delay={i * 0.06}>
                  <Card
                    className="p-6 card-shimmer mb-4 break-inside-avoid"
                    glass
                    hoverable={false}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 rounded-full bg-coral/10 flex items-center justify-center shrink-0">
                        <span className="font-heading text-coral text-xs">
                          {w.name.split(" ").map((n) => n[0]).join("")}
                        </span>
                      </div>
                      <div>
                        <p className="text-off-white text-sm font-medium">{w.name}</p>
                        <p className="text-foreground-subtle text-xs">{w.detail}</p>
                      </div>
                    </div>
                    <p className="text-foreground-muted text-sm leading-relaxed mb-3">
                      &ldquo;{w.quote}&rdquo;
                    </p>
                    {w.stat && (
                      <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-coral/10 border border-coral/20">
                        <span className="text-coral text-xs font-heading tracking-wider">
                          {w.stat.toUpperCase()}
                        </span>
                        {w.statLabel && (
                          <span className="text-coral/70 text-[10px] font-body tracking-widest uppercase">
                            {w.statLabel}
                          </span>
                        )}
                      </div>
                    )}
                  </Card>
                </ScrollReveal>
              ))}
            </div>
          </Container>
        </Section>

        {/* ── Gradient divider ──────────────────────────── */}
        <div className="gradient-divider" />

        {/* ── Application Form ───────────────────────────── */}
        <Section background="deep-purple" grain className="relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full bg-coral/5 blur-[150px] pointer-events-none" />

          <Container width="narrow" className="relative z-10">
            <ScrollReveal direction="up">
              <div className="text-center mb-10" id="apply">
                <h2
                  className="font-heading text-off-white mb-3"
                  style={{ fontSize: "var(--text-section)" }}
                >
                  {cohortState.form.kicker}
                </h2>
                <p className="text-foreground-muted max-w-md mx-auto">
                  {cohortState.form.subheading}
                </p>
              </div>
            </ScrollReveal>

            {/* What happens next — reduces apprehension before the form.
                Prospects are much more likely to submit when they know a
                real human (Anthony) is on the other end and what the
                concrete next step looks like. */}
            <ScrollReveal direction="up" delay={0.05}>
              <div className="mb-10 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 max-w-2xl mx-auto">
                {(isWaitlist
                  ? [
                      {
                        n: "01",
                        t: "Apply now for the waitlist",
                        d: "Two minutes. Four questions so we know where you are now and what you're aiming at.",
                      },
                      {
                        n: "02",
                        t: "Weekly updates from inside the current cohort",
                        d: "What's working, what members are achieving, and the coaching ideas worth trying now.",
                      },
                      {
                        n: "03",
                        t: "24-hour early access",
                        d: `Cohort ${cohortState.targetCohort} is coming soon. Waitlist members get 24 hours before public launch. 30 places, first served.`,
                      },
                    ]
                  : [
                      {
                        n: "01",
                        t: "Submit your application",
                        d: "Takes under 2 minutes. Four questions, no credit card.",
                      },
                      {
                        n: "02",
                        t: "Anthony reviews it personally",
                        d: "Usually within 48 hours. You get a reply from Anthony, not an autoresponder.",
                      },
                      {
                        n: "03",
                        t: "Start your 7-day trial",
                        d: "Onboarding call, your first plan, full access to the community. Cancel inside the week if it isn't for you.",
                      },
                    ]
                ).map((step) => (
                  <div
                    key={step.n}
                    className="rounded-xl border border-white/10 bg-white/[0.02] p-5 text-left"
                  >
                    <p className="font-heading text-coral text-sm tracking-widest mb-2">
                      STEP {step.n}
                    </p>
                    <p className="font-heading text-off-white text-base leading-tight mb-2">
                      {step.t.toUpperCase()}
                    </p>
                    <p className="text-foreground-muted text-xs leading-relaxed">
                      {step.d}
                    </p>
                  </div>
                ))}
              </div>
            </ScrollReveal>

            <ScrollReveal direction="up" delay={0.1}>
              <div className="bg-white/[0.03] rounded-2xl border border-white/10 p-8 md:p-12 backdrop-blur-sm">
                <CohortApplicationForm />
                <p className="text-center text-foreground-subtle text-xs mt-6">
                  Your application goes straight to Anthony. No spam, no
                  upsell emails &mdash; just a personal reply.
                </p>
              </div>
            </ScrollReveal>
          </Container>
        </Section>

        {/* ── FAQ ─────────────────────────────────────────── */}
        <Section background="charcoal">
          <Container width="narrow">
            <ScrollReveal direction="up">
              <h2
                className="font-heading text-off-white text-center mb-12"
                style={{ fontSize: "var(--text-section)" }}
              >
                COMMON QUESTIONS
              </h2>
            </ScrollReveal>
            <div className="space-y-4">
              {objections.map((obj) => (
                <div
                  key={obj.q}
                  className="bg-background-elevated rounded-lg border border-white/5 p-6"
                >
                  <h3 className="font-heading text-lg text-off-white mb-2">
                    {obj.q.toUpperCase()}
                  </h3>
                  <p className="text-foreground-muted text-sm leading-relaxed">
                    {obj.a}
                  </p>
                </div>
              ))}
            </div>

            {/* Final urgency CTA */}
            <ScrollReveal direction="up">
              <div className="mt-16 text-center bg-coral/5 rounded-xl border border-coral/20 p-10">
                <h2 className="font-heading text-3xl text-off-white mb-3">
                  YOU&apos;RE NOT DONE YET.
                </h2>
                <p className="text-foreground-muted mb-6 max-w-md mx-auto">
                  {isWaitlist
                    ? `Cohort ${cohortState.targetCohort} is coming soon. 30 places. Apply now — waitlist members get first access.`
                    : "30 places. Same coaches. Same system. Your turn."}
                </p>
                <a
                  href="#apply"
                  className="inline-flex items-center px-8 py-4 rounded-xl bg-coral text-off-white font-heading text-lg tracking-wider hover:bg-coral/90 transition-all shadow-lg shadow-coral/20"
                >
                  {isWaitlist ? "APPLY NOW — JOIN THE WAITLIST" : "APPLY NOW"}
                </a>
              </div>
            </ScrollReveal>
          </Container>
        </Section>
      </main>

      <Footer />
    </>
  );
}
