import type { Metadata } from "next";
import { Header, Footer, Section, Container } from "@/components/layout";
import { Card, ScrollReveal } from "@/components/ui";
import { CohortApplicationForm } from "./CohortApplicationForm";

export const metadata: Metadata = {
  title: "Cohort 2 — Not Done Yet",
  description:
    "30 places. 5 pillars. $195/month. Applications open until Friday. Personalised cycling coaching with Anthony Walsh.",
  alternates: {
    canonical: "https://roadmancycling.com/apply",
  },
  openGraph: {
    title: "Cohort 2 — Not Done Yet",
    description:
      "30 places. 5 pillars. $195/month. Applications open until Friday. Personalised cycling coaching with Anthony Walsh.",
    type: "website",
    url: "https://roadmancycling.com/apply",
  },
};

// ── Testimonials (existing members + screenshots) ──────────────────

const heroStats = [
  { value: "+90w", label: "Damien's FTP gain" },
  { value: "3→1", label: "Daniel's cat jump in one season" },
  { value: "-16kg", label: "Chris's weight loss" },
  { value: "+15%", label: "Brian's FTP at age 52" },
];

const communityWins = [
  {
    name: "Blair Corey",
    title: "20 minute effort retest",
    quote:
      "Did my second 20 min effort since joining NDY. December 19th avg power 236 — March 30th avg power 296. Hard to believe a 60 watt increase in 3 months! Also felt like I had nothing left back in December, today I was left feeling I paced it wrong and could have gone harder.",
    stat: "+60W in 3 months",
  },
  {
    name: "Vern Locke",
    title: "Power PR when you least expect it",
    quote:
      "When I started pedaling, I noticed quickly that I felt like there was 'no chain' so to speak. Set a new 5sec PB for the freewheel. Towards the end I told the guys on the last hill I was gonna test myself. MAX power from 77W to 832W, and set a new 5sec PR of 915.",
    stat: "New 5sec PR: 915W",
  },
  {
    name: "Quinton Gothard",
    title: "1st Zwift race win",
    quote:
      "I've been riding the Zwift races and finally won a race despite the steep climbs coming at the end! Super pleased I had enough in the tank to cut sprint the small bunch that was left.",
    stat: "First race win",
  },
  {
    name: "Gregory Gross",
    title: "Hexis for the win",
    quote:
      "2019 was planning to compete in RAAM. Nov 2019 I was 315 pounds, about to go on disability. Quarantine was a godsend for me. Jan 5, I started Hexis. Today, I'm down 5 pounds and 1% bodyfat, to my lowest weight in 15 years. I cannot believe I'm under 100kg.",
    stat: "315lbs → under 100kg",
  },
  {
    name: "John Devlin",
    title: "Progress despite hurdles",
    quote:
      "Work has been beyond crazy the last two weeks. Anthony recently said it's the tougher weeks that define your progress. Since mid December I've gone from 103kg to 98.3kg — down 6.7kg. I'm really encouraged by the progress so far.",
    stat: "-6.7kg since Dec",
  },
  {
    name: "David Corrigan",
    title: "15 sec Power PB",
    quote:
      "Just back from a 3 hr endurance ride with some sprint efforts in the middle and end. Checked my data and I have just got a power PB for 15 secs. Delighted! Shows the work is paying off.",
    stat: "New 15sec PB",
  },
  {
    name: "Keano Donne",
    title: "2min PB",
    quote:
      "Got another PB while doing descending 4x2 today. Beat an old Ramblers of 2023 while doing my ever climb on Camber House. My 2min was 615watts and the climb was sub 5min. Big achievement for me. Today I wanted to beat that 2min. I did a 25w improvement to get 610w/2min.",
    stat: "2min PB: 610W",
  },
];

const featuredResults = [
  {
    name: "Daniel Stone",
    context: "Roadman Cycling Club",
    statLabel: "CATEGORY JUMP",
    statValue: "3 → 1",
    quote:
      "The system took me from Cat 3 to Cat 1. The structured approach changed everything about how I train and race.",
    ftpBefore: null,
    ftpAfter: null,
  },
  {
    name: "Brian Morrissey",
    context: "52yo shift worker",
    statLabel: "FTP GAIN",
    statValue: "+15%",
    quote:
      "This really works. I'm training so much less than last year, at lower intensities and not getting sick. FTHR up from 175 to 180, peak HR up to 193.",
    ftpBefore: 230,
    ftpAfter: 265,
  },
  {
    name: "Damien Maloney",
    context: "Plateaued sportive rider",
    statLabel: "FTP GAIN",
    statValue: "+90w",
    quote:
      "I was an average sportive rider who had plateaued. Roadman custom built a plan to achieve my goals. I've gotten much more out of Roadman than I ever imagined.",
    ftpBefore: 205,
    ftpAfter: 295,
  },
];

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

export default function Cohort2Page() {
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
                  CLOSES FRIDAY — 30 PLACES
                </span>
              </div>

              <h1
                className="font-heading text-off-white mb-2 text-gradient-animated"
                style={{ fontSize: "clamp(2.5rem, 8vw, 5rem)" }}
              >
                NOT DONE YET
              </h1>
              <p className="text-foreground-muted text-lg max-w-md mx-auto mb-10">
                5 pillars. $195/mo. Cancel anytime.
              </p>
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
                COHORT 1 RESULTS
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
                <ScrollReveal key={w.name + w.title} direction="up" delay={i * 0.06}>
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
                        <p className="text-foreground-subtle text-xs">{w.title}</p>
                      </div>
                    </div>
                    <p className="text-foreground-muted text-sm leading-relaxed mb-3">
                      &ldquo;{w.quote}&rdquo;
                    </p>
                    <div className="inline-flex items-center px-2.5 py-1 rounded-full bg-coral/10 border border-coral/20">
                      <span className="text-coral text-xs font-heading tracking-wider">
                        {w.stat.toUpperCase()}
                      </span>
                    </div>
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
                  APPLY NOW
                </h2>
                <p className="text-foreground-muted max-w-md mx-auto">
                  $195/mo. Cancel anytime. Takes 60 seconds.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal direction="up" delay={0.1}>
              <div className="bg-white/[0.03] rounded-2xl border border-white/10 p-8 md:p-12 backdrop-blur-sm">
                <CohortApplicationForm />
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
                  30 places. Applications close Friday.
                  Same coaches. Same system. Your turn.
                </p>
                <a
                  href="#apply"
                  className="inline-flex items-center px-8 py-4 rounded-xl bg-coral text-off-white font-heading text-lg tracking-wider hover:bg-coral/90 transition-all shadow-lg shadow-coral/20"
                >
                  APPLY NOW
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
