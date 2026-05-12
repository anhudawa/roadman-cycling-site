import type { Metadata } from "next";
import Link from "next/link";
import { Header, Footer, Section, Container } from "@/components/layout";
import { Button, Card, ScrollReveal, GradientText } from "@/components/ui";
import { JsonLd } from "@/components/seo/JsonLd";
import { ENTITY_IDS } from "@/lib/brand-facts";

export const metadata: Metadata = {
  title: "Careers — Cycling Coach (Remote) | Roadman Cycling",
  description:
    "Roadman Cycling is hiring a cycling coach to work with serious amateur and masters athletes. Remote, 10 hours per week scaling to full-time, TrainingPeaks-based, evidence-led methodology.",
  alternates: {
    canonical: "https://roadmancycling.com/careers",
  },
  openGraph: {
    title: "We're Hiring — Cycling Coach | Roadman Cycling",
    description:
      "Join Roadman Cycling. Remote cycling coach role working with serious amateurs and masters cyclists. 10 hours/week to start, scaling with the roster.",
    type: "website",
    url: "https://roadmancycling.com/careers",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Roadman Cycling" }],
  },
};

const APPLY_MAILTO =
  "mailto:anthony@roadmancycling.com?subject=Cycling%20Coach%20Application";

const responsibilities = [
  {
    title: "Build the training",
    body: "Design and write structured workouts in TrainingPeaks. Periodise blocks around each athlete's target events, life context, and recovery state. Read the PMC, adjust the plan when the data says to.",
  },
  {
    title: "Coach the athlete",
    body: "Weekly check-ins, plan reviews, and message-based support. Translate complex training science into instructions the athlete can act on. Hold them accountable through the bad weeks as well as the good ones.",
  },
  {
    title: "Own the data",
    body: "Manage athlete accounts in TrainingPeaks end-to-end. Track CTL/ATL/TSB, fitness trends, FTP changes, and race readiness. Spot problems before the athlete does.",
  },
  {
    title: "Work with Anthony",
    body: "Sit inside a team that talks to World Tour coaches and sports scientists every week. Bring that thinking into how we coach. Help shape the methodology as the roster grows.",
  },
];

const mustHaves = [
  "An academic background in sports science, exercise physiology, or a related field",
  "Deep, hands-on proficiency in TrainingPeaks — building structured workouts, reading the PMC, managing athlete accounts at scale",
  "A working understanding of periodisation and training stress management — you can defend your decisions with the science",
  "Evidence-based methodology — you can name the studies behind your approach, not just the influencers",
  "Coaching certification (British Cycling, UCI Level 1/2, TrainingPeaks-accredited coach, or equivalent)",
  "Experience with power-based training and structured race preparation",
  "Experience coaching amateur or masters cyclists remotely",
  "Strong written communication — you can explain a complex concept to a busy professional in three sentences",
  "Working knowledge of nutrition periodisation and body composition management for endurance athletes",
  "References from athletes you have coached",
];

const niceToHaves = [
  "A presence on social media or YouTube — comfortable on camera and able to contribute to content",
  "Familiarity with the Roadman Cycling podcast and the methodology we have built across 1,400+ expert conversations",
  "Experience with masters-specific training (40+ athletes, hormonal context, recovery management)",
  "Background as a competitive cyclist yourself — Cat 3 or better, or equivalent gran fondo / time trial pedigree",
  "Comfort working inside a small, fast-moving team that ships content as well as coaching",
];

const aboutFacts = [
  {
    stat: "100M+",
    label: "Podcast downloads",
    detail: "The Roadman Cycling Podcast — one of the largest cycling podcasts in the world",
  },
  {
    stat: "1,400+",
    label: "Expert conversations",
    detail: "World Tour coaches, sports scientists, pro cyclists — methodology built on direct access, not theory",
  },
  {
    stat: "TrainingPeaks",
    label: "Partner network",
    detail: "Plus TrainingPeaks, expert reviewers, and a coaching platform scaling across Ireland, the UK, and the USA",
  },
];

export default function CareersPage() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "JobPosting",
          title: "Cycling Coach",
          description:
            "Roadman Cycling is hiring a cycling coach to work with serious amateur and masters athletes. Remote, 10 hours per week scaling to 40 as the roster grows. TrainingPeaks-based, evidence-led methodology, working alongside Anthony Walsh and the Roadman team.",
          datePosted: "2026-05-12",
          employmentType: ["PART_TIME", "CONTRACTOR"],
          hiringOrganization: { "@id": ENTITY_IDS.organization },
          jobLocationType: "TELECOMMUTE",
          applicantLocationRequirements: [
            { "@type": "Country", name: "Ireland" },
            { "@type": "Country", name: "United Kingdom" },
            { "@type": "Country", name: "United States" },
          ],
          directApply: false,
          applicationContact: {
            "@type": "ContactPoint",
            email: "anthony@roadmancycling.com",
          },
          qualifications:
            "Academic background in sports science, exercise physiology, or related field. Deep proficiency in TrainingPeaks. Coaching certification (British Cycling, UCI, TrainingPeaks-accredited, or equivalent). Working knowledge of periodisation, training stress management, evidence-based methodology, and nutrition periodisation. Experience coaching amateur or masters cyclists remotely. References required.",
          skills:
            "TrainingPeaks, PMC analysis, power-based training, periodisation, training stress management, nutrition periodisation, body composition management, remote athlete management, written communication.",
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: "https://roadmancycling.com" },
            { "@type": "ListItem", position: 2, name: "Careers", item: "https://roadmancycling.com/careers" },
          ],
        }}
      />

      <Header />

      <main id="main-content">
        {/* Hero */}
        <Section background="deep-purple" grain className="pt-32 pb-20">
          <Container className="text-center">
            <ScrollReveal direction="up" eager>
              <p className="text-coral font-heading text-sm tracking-widest mb-6">
                WE&apos;RE HIRING — CYCLING COACH
              </p>
              <h1
                className="font-heading text-off-white mb-6"
                style={{ fontSize: "var(--text-hero)" }}
              >
                COACH THE CYCLISTS
                <br />
                <span className="text-coral">WHO AREN&apos;T DONE YET.</span>
              </h1>
              <p className="text-foreground-muted text-xl max-w-2xl mx-auto mb-8 leading-relaxed">
                Roadman Cycling is hiring a cycling coach to work directly with
                our growing roster of serious amateur and masters athletes.
                Remote. TrainingPeaks-based. Built on the same methodology
                we&apos;ve pulled out of 1,400+ conversations with the best
                coaches and scientists in the sport.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-6">
                <Button href={APPLY_MAILTO} size="lg" dataTrack="careers_hero_apply">
                  Apply Now
                </Button>
                <Button href="#the-role" variant="ghost" size="lg">
                  Read the Brief
                </Button>
              </div>
              <p className="text-foreground-subtle text-sm">
                10 hrs/week to start &middot; scaling to 40 hrs &middot; remote &middot; Ireland, UK, US time zones welcome
              </p>
            </ScrollReveal>
          </Container>
        </Section>

        <div className="gradient-divider" />

        {/* Who we are — at a glance */}
        <Section background="charcoal">
          <Container>
            <ScrollReveal direction="up" className="text-center mb-12">
              <p className="text-coral font-heading text-xs tracking-widest mb-3">
                ABOUT ROADMAN
              </p>
              <h2
                className="font-heading text-off-white mb-4"
                style={{ fontSize: "var(--text-section)" }}
              >
                NOT A SIDE PROJECT.
              </h2>
              <p className="text-foreground-muted max-w-xl mx-auto">
                Roadman Cycling is one of the largest cycling brands in the
                English-speaking world — and the coaching arm is scaling fast.
                This is a role inside a real, growing business.
              </p>
            </ScrollReveal>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {aboutFacts.map((f, i) => (
                <ScrollReveal key={f.label} direction="up" delay={i * 0.08}>
                  <Card className="p-7 h-full text-center" glass hoverable={false}>
                    <p className="font-heading text-5xl text-coral mb-2">
                      {f.stat}
                    </p>
                    <p className="text-off-white font-medium mb-2">{f.label}</p>
                    <p className="text-sm text-foreground-subtle leading-relaxed">
                      {f.detail}
                    </p>
                  </Card>
                </ScrollReveal>
              ))}
            </div>
          </Container>
        </Section>

        {/* The Role */}
        <Section background="deep-purple" grain id="the-role">
          <Container width="narrow">
            <div className="grid md:grid-cols-2 gap-12 items-start">
              <ScrollReveal direction="left">
                <p className="text-coral font-heading text-xs tracking-widest mb-3">
                  THE ROLE
                </p>
                <h2
                  className="font-heading text-off-white mb-6"
                  style={{ fontSize: "var(--text-section)" }}
                >
                  <GradientText as="span">A REAL COACHING SEAT — NOT A CONTENT GIG.</GradientText>
                </h2>
                <div className="space-y-4 text-foreground-muted leading-relaxed">
                  <p>
                    You will own a roster of athletes from day one. Build their
                    plans, manage their data, run their check-ins, and answer for
                    their results. Anthony stays close — methodology, athlete
                    intake, hard cases — but the coaching seat is yours.
                  </p>
                  <p>
                    The athletes are serious amateurs and masters cyclists.
                    Cat 3 chasing Cat 1. The sportive rider who refuses to
                    accept their best days are behind them. The comeback athlete
                    rebuilding after a decade away. Smart, demanding, and
                    coachable when you bring real structure.
                  </p>
                  <p className="text-off-white font-medium">
                    Start at 10 hours per week. Scale to 40 as the roster
                    grows. The ceiling is set by how fast you can take on
                    athletes well.
                  </p>
                </div>
              </ScrollReveal>

              <ScrollReveal direction="right">
                <div className="space-y-4">
                  {responsibilities.map((r) => (
                    <Card key={r.title} className="p-5" glass hoverable={false}>
                      <h3 className="font-heading text-base text-off-white mb-2 tracking-wide">
                        {r.title.toUpperCase()}
                      </h3>
                      <p className="text-sm text-foreground-muted leading-relaxed">
                        {r.body}
                      </p>
                    </Card>
                  ))}
                </div>
              </ScrollReveal>
            </div>
          </Container>
        </Section>

        {/* Visual break */}
        <div className="relative h-[20vh] overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-coral/20 via-deep-purple to-charcoal" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_50%,rgba(255,107,74,0.15),transparent_70%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_20%,rgba(139,92,246,0.2),transparent_60%)]" />
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="font-heading text-off-white/10 text-[7rem] md:text-[10rem] select-none tracking-tighter leading-none">
              ROADMAN
            </p>
          </div>
        </div>

        {/* Must-haves */}
        <Section background="charcoal" id="requirements">
          <Container width="narrow">
            <ScrollReveal direction="up" className="text-center mb-12">
              <p className="text-coral font-heading text-xs tracking-widest mb-3">
                WHAT WE&apos;RE LOOKING FOR
              </p>
              <h2
                className="font-heading text-off-white mb-4"
                style={{ fontSize: "var(--text-section)" }}
              >
                THE MUST-HAVES.
              </h2>
              <p className="text-foreground-muted max-w-xl mx-auto">
                This is a senior coaching seat. We&apos;re not training you on
                the fundamentals — we&apos;re hiring you because you already
                have them.
              </p>
            </ScrollReveal>

            <Card className="p-6 md:p-8" hoverable={false}>
              <ul className="space-y-4">
                {mustHaves.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3 text-foreground-muted leading-relaxed"
                  >
                    <span className="text-coral mt-1 shrink-0">&#10003;</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </Container>
        </Section>

        {/* Nice-to-haves */}
        <Section background="deep-purple" grain>
          <Container width="narrow">
            <ScrollReveal direction="up" className="text-center mb-12">
              <p className="text-coral font-heading text-xs tracking-widest mb-3">
                NICE TO HAVE
              </p>
              <h2
                className="font-heading text-off-white mb-4"
                style={{ fontSize: "var(--text-section)" }}
              >
                THESE WILL MOVE YOU UP THE PILE.
              </h2>
              <p className="text-foreground-muted max-w-xl mx-auto">
                None of these are required. Each of them tilts the decision.
              </p>
            </ScrollReveal>

            <Card className="p-6 md:p-8" glass hoverable={false}>
              <ul className="space-y-4">
                {niceToHaves.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3 text-foreground-muted leading-relaxed"
                  >
                    <span className="text-coral mt-1 shrink-0">+</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </Container>
        </Section>

        {/* The offer / why this role */}
        <Section background="charcoal">
          <Container width="narrow">
            <ScrollReveal direction="up" className="text-center mb-12">
              <p className="text-coral font-heading text-xs tracking-widest mb-3">
                WHY THIS ROLE
              </p>
              <h2
                className="font-heading text-off-white mb-4"
                style={{ fontSize: "var(--text-section)" }}
              >
                WHAT YOU GET OUT OF IT.
              </h2>
            </ScrollReveal>

            <div className="grid md:grid-cols-2 gap-6">
              {[
                {
                  title: "A roster that grows with you",
                  body: "10 hours per week to start while you find your rhythm. We add athletes as fast as you can coach them well — up to a full 40-hour load. Pay scales with hours and outcomes.",
                },
                {
                  title: "Direct line to the expert network",
                  body: "Working inside a team that talks to Professor Stephen Seiler, Dan Lorang, Dr. David Dunne and the rest of the Roadman guest bench. The methodology is live and updated — you help shape it.",
                },
                {
                  title: "Remote, on your schedule",
                  body: "All coaching is delivered online. Ireland, UK, or US time zones all work. Coaching calls are scheduled flexibly. The work is the work — not the commute or the office.",
                },
                {
                  title: "A platform if you want it",
                  body: "Roadman has one of the largest cycling audiences in the English-speaking world. If you want to build a public presence — on camera, in podcasts, on socials — you have a runway. If you&apos;d rather just coach quietly, that also works.",
                },
              ].map((b, i) => (
                <ScrollReveal key={b.title} direction="up" delay={i * 0.06}>
                  <Card className="p-6 h-full" glass hoverable={false}>
                    <h3 className="font-heading text-lg text-off-white mb-3 tracking-wide">
                      {b.title.toUpperCase()}
                    </h3>
                    <p className="text-sm text-foreground-muted leading-relaxed">
                      {b.body}
                    </p>
                  </Card>
                </ScrollReveal>
              ))}
            </div>
          </Container>
        </Section>

        {/* How to apply */}
        <Section background="deep-purple" grain id="apply">
          <Container width="narrow">
            <ScrollReveal direction="up" className="text-center mb-10">
              <p className="text-coral font-heading text-xs tracking-widest mb-3">
                HOW TO APPLY
              </p>
              <h2
                className="font-heading text-off-white mb-4"
                style={{ fontSize: "var(--text-section)" }}
              >
                SEND ONE EMAIL.
              </h2>
              <p className="text-foreground-muted max-w-xl mx-auto">
                No portal. No application form. One email, three attachments,
                and you&apos;re in the pile.
              </p>
            </ScrollReveal>

            <Card className="p-6 md:p-8" hoverable={false}>
              <p className="text-foreground-muted text-sm mb-4">
                Email{" "}
                <a
                  href={APPLY_MAILTO}
                  className="text-coral hover:text-coral/80 underline underline-offset-4 font-medium"
                >
                  anthony@roadmancycling.com
                </a>{" "}
                with the subject{" "}
                <span className="text-off-white font-medium">
                  &ldquo;Cycling Coach Application&rdquo;
                </span>{" "}
                and include:
              </p>

              <ol className="space-y-4 mb-8">
                {[
                  {
                    title: "Your CV",
                    body: "Qualifications, certifications, coaching experience, athletes you have worked with.",
                  },
                  {
                    title: "A short cover letter",
                    body: "Why you want this role specifically — not just any coaching role. What you would bring that we don’t already have.",
                  },
                  {
                    title: "Two athlete references",
                    body: "Cyclists you have coached, who we can contact. Ideally amateurs or masters athletes.",
                  },
                ].map((step, i) => (
                  <li key={step.title} className="flex items-start gap-4">
                    <span className="font-heading text-2xl text-coral/70 shrink-0 leading-none">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <p className="font-heading text-off-white text-base mb-1 tracking-wide">
                        {step.title.toUpperCase()}
                      </p>
                      <p className="text-sm text-foreground-muted leading-relaxed">
                        {step.body}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>

              <div className="rounded-lg border border-coral/20 bg-coral/5 p-5 mb-8">
                <p className="font-heading text-coral text-xs tracking-widest mb-2">
                  BONUS POINTS
                </p>
                <p className="text-sm text-foreground-muted leading-relaxed">
                  Attach a sample TrainingPeaks plan you have written — one
                  block, real athlete, anonymised. Or link to content
                  you&apos;ve produced. Show us how you think, not just what
                  you&apos;ve done.
                </p>
              </div>

              <div className="text-center">
                <Button href={APPLY_MAILTO} size="lg" dataTrack="careers_footer_apply">
                  Start Your Application
                </Button>
                <p className="text-foreground-subtle text-xs mt-4">
                  Every application is read personally by Anthony. Expect a
                  reply within 5 business days.
                </p>
              </div>
            </Card>
          </Container>
        </Section>

        {/* Closing context */}
        <Section background="charcoal">
          <Container width="narrow" className="text-center">
            <ScrollReveal direction="up">
              <h2
                className="font-heading text-off-white mb-4"
                style={{ fontSize: "var(--text-section)" }}
              >
                NOT FOR YOU?
              </h2>
              <p className="text-foreground-muted max-w-xl mx-auto mb-6 leading-relaxed">
                If you&apos;re a cyclist who wants to be coached rather than to
                coach, that path is here too. If you know someone who&apos;d be
                a fit for this role, forward it on — we owe you a beer if it
                works out.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  href="/coaching"
                  className="text-coral hover:text-coral/80 transition-colors text-sm tracking-wider font-heading"
                >
                  GET COACHED INSTEAD →
                </Link>
                <span className="hidden sm:inline text-foreground-subtle">&middot;</span>
                <Link
                  href="/about"
                  className="text-coral hover:text-coral/80 transition-colors text-sm tracking-wider font-heading"
                >
                  ABOUT ROADMAN →
                </Link>
              </div>
            </ScrollReveal>
          </Container>
        </Section>
      </main>

      <Footer />
    </>
  );
}
