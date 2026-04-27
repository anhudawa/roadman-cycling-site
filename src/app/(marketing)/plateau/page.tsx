import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { sql } from "drizzle-orm";
import { Container, Footer, Header, Section } from "@/components/layout";
import { ScrollReveal } from "@/components/ui";
import { db } from "@/lib/db";
import { diagnosticSubmissions } from "@/lib/db/schema";
import { JsonLd, FAQPageJsonLd } from "@/components/seo/JsonLd";
import { DiagnosticFlow } from "@/components/features/diagnostic/DiagnosticFlow";
import { MetaPixel } from "@/components/features/diagnostic/MetaPixel";
import { BRAND_STATS, ENTITY_IDS, FOUNDER } from "@/lib/brand-facts";
import { getTestimonialsByName } from "@/lib/testimonials";
import { FaqAccordion } from "./_components/FaqAccordion";
import { StickyMobileCta } from "./_components/StickyMobileCta";

/**
 * /plateau — landing page for the Masters Plateau Diagnostic.
 *
 * Designed for cold paid traffic. The page is built around three
 * conversion principles:
 *  1. Earn trust before asking for a click — Anthony's name and the
 *     four named experts surface in the first viewport, not the FAQ.
 *  2. Promote the no-hard-sell promise above the diagnostic itself —
 *     it is the single most disarming sentence on the page.
 *  3. Three commit moments (hero CTA, mid-page CTA, final CTA) plus a
 *     sticky mobile button so a thumb is never more than one tap from
 *     starting the quiz.
 *
 * The diagnostic component is embedded below the fold so the user can
 * scroll straight into the flow without a route change — keeps session
 * state intact and removes a click from the ad → start funnel.
 */

export const metadata: Metadata = {
  title: "The Masters Plateau Diagnostic",
  description:
    "Twelve questions. Four minutes. A specific answer for why your FTP has stalled — and the exact fix, written for riders who train 6 to 12 hours a week around a real life.",
  alternates: {
    canonical: "https://roadmancycling.com/plateau",
  },
  openGraph: {
    title: "The Masters Plateau Diagnostic",
    description:
      "If you're over 40 and your FTP hasn't moved in 18 months, it's one of four things. Find out which one in four minutes.",
    type: "website",
    url: "https://roadmancycling.com/plateau",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Roadman Cycling" }],
  },
  // The results pages are personal and shouldn't leak to search.
  // The landing page itself is fine.
  robots: { index: true, follow: true },
};

export const revalidate = 3600;

type IconProps = { className?: string };

const IconBike = ({ className }: IconProps) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <circle cx="6" cy="17" r="4" />
    <circle cx="18" cy="17" r="4" />
    <path d="M15 17h-3l-2-7H8m4 0l3 7m-3-7V6h2" />
  </svg>
);

const IconChecklist = ({ className }: IconProps) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M9 11l3 3L22 4" />
    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
  </svg>
);

const IconTarget = ({ className }: IconProps) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" />
  </svg>
);

const IconMoon = ({ className }: IconProps) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

const IconWave = ({ className }: IconProps) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M3 12h3l3-7 4 14 3-7h5" />
  </svg>
);

const IconDumbbell = ({ className }: IconProps) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M6 7v10M3 9v6M18 7v10M21 9v6M6 12h12" />
  </svg>
);

const IconFlame = ({ className }: IconProps) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M12 22c4.97 0 8-3.13 8-7 0-3-1.5-5-3-7-1.5-2-2-3-2-5 0 2-1 3-3 5s-3 4-3 7c0 3.87 3 7 3 7z" />
    <path d="M12 18c1.66 0 3-1.34 3-3 0-1.5-1-2.5-1.5-3-1 1-1.5 2-1.5 3 0 1.66-1.34 3 0 3z" />
  </svg>
);

const IconCompass = ({ className }: IconProps) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="10" />
    <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
  </svg>
);

const IconDoc = ({ className }: IconProps) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="9" y1="13" x2="15" y2="13" />
    <line x1="9" y1="17" x2="15" y2="17" />
  </svg>
);

const IconArrow = ({ className }: IconProps) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

const HOW_IT_WORKS = [
  {
    n: "01",
    title: "Tell us about your training",
    body: "Age, weekly hours, optionally your FTP and goal. Two taps each.",
    time: "30 seconds",
    Icon: IconBike,
  },
  {
    n: "02",
    title: "Twelve quick questions",
    body: "Sleep, intensity distribution, strength, fuelling. One screen at a time, with a back button.",
    time: "3 minutes",
    Icon: IconChecklist,
  },
  {
    n: "03",
    title: "Get your specific profile",
    body: "One of four profiles, named and explained — and the exact three steps to fix it. Sent to your inbox.",
    time: "30 seconds",
    Icon: IconTarget,
  },
];

/**
 * The four profiles surfaced as a teaser grid.
 *
 * `Polarisation Failure` was renamed to `Grey-zone trap` for cold
 * traffic — the clinical name stays inside the diagnosis itself and
 * is preserved in `PROFILE_LABELS`/`profiles.ts` so analytics, OG
 * images and the result pages keep their existing taxonomy. This is
 * a pure presentation rename, not a model change.
 *
 * Pillar colours are the canonical content-pillar palette from the
 * design tokens — Recovery (blue), Coaching (coral), Strength
 * (orange), Nutrition (green) — so the diagnostic visually maps to
 * the rest of the brand surface.
 */
const PROFILE_PREVIEWS = [
  {
    n: "01",
    title: "Under-recovered",
    line: "Doing the training. Not getting the adaptation. Sleep, life stress and back-to-back hard sessions are eating the gains.",
    tells: ["Wakes tired", "HR creeping up", "Hard days hit hard"],
    accent: "var(--color-pillar-recovery)",
    accentBg: "rgba(33, 150, 243, 0.10)",
    accentRing: "rgba(33, 150, 243, 0.35)",
    Icon: IconMoon,
  },
  {
    n: "02",
    title: "Grey-zone trap",
    line: "Most of your riding is neither easy enough to recover from nor hard enough to drive change. The middle is where progress dies.",
    tells: ["Tempo by default", "Easy isn't easy", "Hard isn't hard"],
    accent: "var(--color-pillar-coaching)",
    accentBg: "rgba(241, 99, 99, 0.10)",
    accentRing: "rgba(241, 99, 99, 0.40)",
    Icon: IconWave,
  },
  {
    n: "03",
    title: "Strength gap",
    line: "Your aerobic engine still works. The neuromuscular power that drives it is leaking quietly — about 1% per year after 40 if you're not lifting.",
    tells: ["Dropped on punches", "Sprint gone", "Climbs feel heavy"],
    accent: "var(--color-pillar-strength)",
    accentBg: "rgba(255, 152, 0, 0.10)",
    accentRing: "rgba(255, 152, 0, 0.40)",
    Icon: IconDumbbell,
  },
  {
    n: "04",
    title: "Fuelling deficit",
    line: "Training hungry. Chasing race weight. Every session is paid for with tomorrow's adaptation.",
    tells: ["Bonking late", "Sleep wrecked", "Race-weight chase"],
    accent: "var(--color-pillar-nutrition)",
    accentBg: "rgba(76, 175, 80, 0.10)",
    accentRing: "rgba(76, 175, 80, 0.40)",
    Icon: IconFlame,
  },
];

const WHAT_YOU_GET = [
  {
    title: "Your specific profile",
    body: "One of four reasons your FTP has stalled, named and explained in plain language.",
    Icon: IconCompass,
  },
  {
    title: "A two-page breakdown",
    body: "What's actually happening, what it's costing you, and the three steps to fix it.",
    Icon: IconDoc,
  },
  {
    title: "Your next move",
    body: "A clear recommendation, not a generic plan. Built for riders with a life.",
    Icon: IconArrow,
  },
];

// FAQ order: the no-hard-sell answer goes first because it is the
// single most cold-traffic-disarming sentence on the page (see audit).
const FAQS = [
  {
    q: "Is this just going to sell me something?",
    a: "At the end you'll see whether Not Done Yet is the right fit. If it's not, the diagnosis is yours to keep — we don't run a hard-sell sequence. The follow-up email comes from Anthony, written like an email from a friend, and one click takes you off the list.",
  },
  {
    q: "How long does it take?",
    a: "Four minutes, give or take. Twelve questions, one screen at a time, back button always available.",
  },
  {
    q: "Is it free?",
    a: "Yes, completely. No card, no trial.",
  },
  {
    q: "Will I be added to a list?",
    a: "Yes — your email is how we send the diagnosis. After that you'll get the Saturday Spin newsletter, which currently goes to over 65,000 cyclists and runs a 65%+ open rate. One click and you're off it.",
  },
  {
    q: "What if my diagnosis doesn't sound like me?",
    a: "Reply to the email it lands in and tell me. I'll personally re-run it and we'll work out what's missing. The diagnostic is only useful if it's right.",
  },
];

const TESTIMONIAL_NAMES = ["Damien Maloney", "Daniel Stone", "Brian Morrissey"];

function DiagnosticSkeleton() {
  return (
    <div className="mx-auto w-full max-w-[640px]">
      <div className="h-1 w-full bg-white/10 rounded-full" />
      <div className="mt-8 rounded-2xl bg-white/5 border border-white/10 p-6 md:p-10 min-h-[340px]" />
    </div>
  );
}

/**
 * Soft social-proof: how many riders have completed the diagnostic
 * in the past week. Pulled live from Postgres on every revalidation
 * (page is cached for 1h, see `revalidate` above) so it stays
 * truthful but doesn't add a per-request DB hit.
 *
 * Returns null on a clean install (or any DB hiccup) so callers can
 * render a static fallback line — never empty, never broken.
 */
async function recentSubmissionCount(): Promise<number | null> {
  try {
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const [row] = await db
      .select({ cnt: sql<number>`count(*)` })
      .from(diagnosticSubmissions)
      .where(sql`${diagnosticSubmissions.createdAt} >= ${since}`);
    const count = Number(row?.cnt ?? 0);
    return count > 0 ? count : null;
  } catch (err) {
    console.error("[Plateau] recentSubmissionCount failed:", err);
    return null;
  }
}

const ctaButtonClass = `
  inline-flex items-center justify-center gap-2
  font-heading tracking-wider text-lg
  bg-coral hover:bg-coral-hover active:bg-coral-hover
  text-off-white px-10 py-4 rounded-md
  transition-all
  shadow-[0_10px_30px_rgba(241,99,99,0.35)]
  hover:shadow-[0_14px_40px_rgba(241,99,99,0.55)]
  hover:-translate-y-0.5
`;

const ctaArrow = (
  <svg
    width="18"
    height="18"
    viewBox="0 0 18 18"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M3 9h12M10 4l5 5-5 5" />
  </svg>
);

export default async function PlateauPage() {
  const recentCount = await recentSubmissionCount();
  const testimonials = getTestimonialsByName(TESTIMONIAL_NAMES);

  return (
    <>
      <MetaPixel />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: "The Masters Plateau Diagnostic — Roadman Cycling",
          description:
            "A 12-question interactive diagnostic for cyclists over 35 whose FTP has stalled. Returns one of four personalised plateau profiles.",
          url: "https://roadmancycling.com/plateau",
          isPartOf: { "@id": ENTITY_IDS.website },
          publisher: { "@id": ENTITY_IDS.organization },
        }}
      />
      <FAQPageJsonLd
        questions={FAQS.map((f) => ({ question: f.q, answer: f.a }))}
      />
      <Header />
      <main id="main-content">
        {/* ── Hero — full-bleed, aurora ambient, two-line headline ───── */}
        <section
          id="plateau-hero"
          className="
            relative overflow-hidden
            min-h-[92vh] flex items-center
            pt-32 pb-16 md:pt-40 md:pb-24
            bg-charcoal grain-overlay
          "
        >
          {/* Aurora ambient bands (filter:blur 80px), beneath the gradient wash */}
          <div className="aurora-container pointer-events-none">
            <div className="aurora-band aurora-band-1" />
            <div className="aurora-band aurora-band-2" />
            <div className="aurora-band aurora-band-3" />
          </div>
          {/* Layered gradient wash — refines the aurora into directional light */}
          <div
            aria-hidden="true"
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse at 20% 0%, rgba(76, 18, 115, 0.55), transparent 60%), radial-gradient(ellipse at 80% 100%, rgba(33, 1, 64, 0.7), transparent 55%)",
            }}
          />
          {/* Subtle coral hairline at the very top */}
          <div
            aria-hidden="true"
            className="absolute top-0 inset-x-0 h-px"
            style={{
              background:
                "linear-gradient(90deg, transparent, rgba(241,99,99,0.6), transparent)",
            }}
          />
          <Container width="narrow" className="relative text-center">
            <ScrollReveal direction="up">
              <p className="text-coral font-heading text-xs md:text-sm tracking-[0.3em] mb-6">
                THE MASTERS PLATEAU DIAGNOSTIC
              </p>
              <h1 className="font-heading text-off-white mb-6 leading-[0.95]">
                <span
                  className="block"
                  style={{ fontSize: "clamp(2.75rem, 7vw, 6rem)" }}
                >
                  FTP STUCK FOR A YEAR?
                </span>
                <span
                  className="block mt-2 text-coral"
                  style={{ fontSize: "clamp(2rem, 5.2vw, 4.5rem)" }}
                >
                  THERE ARE ONLY FOUR REASONS.
                </span>
              </h1>
              <p className="text-foreground-muted text-lg md:text-xl leading-relaxed mb-8 max-w-xl mx-auto">
                Twelve questions. Four minutes. A specific answer for why your
                progress has stalled &mdash; and the exact fix.
              </p>
              <a href="#start" data-cta="hero" className={ctaButtonClass}>
                FIND MY PROFILE {ctaArrow}
              </a>
              <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-foreground-subtle text-xs md:text-sm mt-5 px-4">
                <span className="whitespace-nowrap">No card</span>
                <span className="opacity-40">·</span>
                <span className="whitespace-nowrap">4 minutes</span>
                <span className="opacity-40">·</span>
                <span className="whitespace-nowrap">
                  Email only when you want the result
                </span>
                {recentCount !== null && (
                  <>
                    <span className="opacity-40">·</span>
                    <span className="inline-flex items-center gap-2 whitespace-nowrap">
                      <span className="relative flex h-2 w-2">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-coral opacity-60" />
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-coral" />
                      </span>
                      {recentCount.toLocaleString()} took it this week
                    </span>
                  </>
                )}
              </div>

              {/* Built-by strip — Anthony presence above the fold */}
              <div className="mt-12 inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.03] backdrop-blur-sm py-2 pl-2 pr-5">
                <span className="relative w-9 h-9 rounded-full overflow-hidden shrink-0 border border-white/15">
                  <Image
                    src="/images/about/anthony-profile-closeup-v2.jpg"
                    alt="Anthony Walsh"
                    fill
                    sizes="36px"
                    className="object-cover"
                  />
                </span>
                <span className="text-left text-foreground-muted text-xs md:text-sm leading-snug">
                  Built by{" "}
                  <span className="text-off-white">Anthony Walsh</span> from{" "}
                  <span className="text-off-white">
                    {BRAND_STATS.episodeCountLabel}
                  </span>{" "}
                  on-the-record conversations with World Tour coaches and sports
                  scientists.
                </span>
              </div>
            </ScrollReveal>

            {/* Scroll cue — desktop only, low-key */}
            <div
              aria-hidden="true"
              className="hidden md:flex absolute left-1/2 -translate-x-1/2 -bottom-4 flex-col items-center text-foreground-subtle/60"
            >
              <span className="font-heading text-[10px] tracking-[0.3em] mb-2">
                SCROLL
              </span>
              <svg
                width="14"
                height="22"
                viewBox="0 0 14 22"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              >
                <rect x="1" y="1" width="12" height="20" rx="6" />
                <line x1="7" y1="6" x2="7" y2="10">
                  <animate
                    attributeName="y2"
                    values="10;14;10"
                    dur="1.6s"
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="y1"
                    values="6;10;6"
                    dur="1.6s"
                    repeatCount="indefinite"
                  />
                </line>
              </svg>
            </div>
          </Container>
        </section>

        {/* ── Promoted no-hard-sell strip ────────────────────────────── */}
        <section className="bg-deep-purple/60 border-y border-white/5">
          <Container width="default" className="py-6 md:py-8">
            <ScrollReveal direction="up" eager>
              <p className="text-center text-foreground-muted text-sm md:text-base leading-relaxed">
                <span className="text-coral font-heading tracking-wider mr-2">
                  NO HARD SELL.
                </span>
                If Not Done Yet isn&rsquo;t right for you, the diagnosis is
                yours to keep. The follow-up comes from Anthony &mdash; one
                click and you&rsquo;re off the list.
              </p>
            </ScrollReveal>
          </Container>
        </section>

        {/* ── Anthony intro — who built it, why it works ─────────────── */}
        <Section background="charcoal">
          <Container width="default">
            <div className="grid md:grid-cols-[280px_1fr] gap-10 md:gap-14 items-center">
              <ScrollReveal direction="up" eager>
                <div className="relative aspect-square rounded-2xl overflow-hidden border border-white/10 max-w-[280px] mx-auto md:mx-0">
                  <Image
                    src="/images/about/anthony-profile-closeup-v2.jpg"
                    alt="Anthony Walsh — founder, Roadman Cycling"
                    fill
                    sizes="(min-width: 768px) 280px, 220px"
                    className="object-cover"
                  />
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-2xl"
                  />
                  {/* Soft coral spotlight on the portrait */}
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      background:
                        "radial-gradient(ellipse at 75% 0%, rgba(241,99,99,0.18), transparent 60%)",
                    }}
                  />
                </div>
              </ScrollReveal>

              <ScrollReveal direction="up" delay={0.1} eager>
                <p className="text-coral font-heading text-xs tracking-[0.3em] mb-3">
                  BUILT BY
                </p>
                <h2
                  className="font-heading text-off-white mb-4 leading-tight"
                  style={{ fontSize: "clamp(2rem, 4vw, 3rem)" }}
                >
                  ANTHONY WALSH
                </h2>
                <p className="text-foreground-muted text-base md:text-lg leading-relaxed mb-6">
                  Over four years and{" "}
                  <span className="text-off-white">
                    {BRAND_STATS.episodeCountLabel} on-the-record conversations
                  </span>{" "}
                  with World Tour coaches, sports scientists and pro riders
                  &mdash; including{" "}
                  <span className="text-off-white">Prof. Stephen Seiler</span>,{" "}
                  <span className="text-off-white">Dan Lorang</span>,{" "}
                  <span className="text-off-white">Greg LeMond</span> and{" "}
                  <span className="text-off-white">Joe Friel</span> &mdash;
                  Anthony kept seeing the same four patterns explain why
                  otherwise serious masters cyclists stop improving. The
                  diagnostic is that pattern recognition, distilled.
                </p>

                <dl className="grid grid-cols-3 gap-3 md:gap-6 max-w-md">
                  <div>
                    <dt className="font-heading text-2xl md:text-3xl text-coral">
                      {BRAND_STATS.episodeCountLabel}
                    </dt>
                    <dd className="text-foreground-subtle text-xs md:text-sm mt-1">
                      Conversations
                    </dd>
                  </div>
                  <div>
                    <dt className="font-heading text-2xl md:text-3xl text-coral">
                      {BRAND_STATS.monthlyListenersLabel}
                    </dt>
                    <dd className="text-foreground-subtle text-xs md:text-sm mt-1">
                      Monthly listeners
                    </dd>
                  </div>
                  <div>
                    <dt className="font-heading text-2xl md:text-3xl text-coral">
                      {BRAND_STATS.countriesReachedLabel}
                    </dt>
                    <dd className="text-foreground-subtle text-xs md:text-sm mt-1">
                      Countries
                    </dd>
                  </div>
                </dl>

                <p className="text-foreground-subtle text-xs mt-6">
                  Founded in {FOUNDER.location} in {FOUNDER.foundedYear}.
                </p>
              </ScrollReveal>
            </div>
          </Container>
        </Section>

        <div className="gradient-divider" />

        {/* ── Profiles grid — four named profiles, pillar colours ────── */}
        <Section background="charcoal">
          <Container width="default">
            <ScrollReveal direction="up" eager>
              <p className="text-coral font-heading text-xs tracking-[0.3em] text-center mb-3">
                THE FOUR
              </p>
              <h2
                className="font-heading text-off-white text-center mb-4"
                style={{ fontSize: "var(--text-section)" }}
              >
                YOU&rsquo;LL BE ONE OF THESE FOUR.
              </h2>
              <p className="text-foreground-muted text-center max-w-xl mx-auto mb-12 leading-relaxed">
                Each one has a specific cause and a specific fix. Twelve
                questions tells us which is yours.
              </p>
            </ScrollReveal>

            <ul className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 list-none p-0">
              {PROFILE_PREVIEWS.map((p, i) => {
                const Icon = p.Icon;
                return (
                  <li key={p.title}>
                    <ScrollReveal direction="up" delay={i * 0.08} eager>
                      <div
                        className="
                          group relative h-full rounded-2xl
                          bg-background-elevated border border-white/10
                          p-6 md:p-7
                          transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
                          hover:-translate-y-1 hover:border-white/20
                        "
                        style={{
                          boxShadow: "0 6px 20px rgba(0,0,0,0.25)",
                        }}
                      >
                        <span
                          aria-hidden="true"
                          className="absolute left-0 top-6 bottom-6 w-[3px] rounded-r"
                          style={{ background: p.accent }}
                        />
                        <span
                          aria-hidden="true"
                          className="
                            absolute inset-0 rounded-2xl pointer-events-none
                            opacity-0 group-hover:opacity-100
                            transition-opacity duration-300
                          "
                          style={{
                            boxShadow: `0 14px 40px ${p.accentBg}, inset 0 0 0 1px ${p.accentRing}`,
                          }}
                        />

                        <div className="flex items-center justify-between mb-3">
                          <p
                            className="font-heading text-3xl leading-none"
                            style={{ color: p.accent }}
                          >
                            {p.n}
                          </p>
                          <span
                            className="
                              inline-flex items-center justify-center
                              w-10 h-10 rounded-lg border
                              transition-colors duration-300
                            "
                            style={{
                              color: p.accent,
                              background: p.accentBg,
                              borderColor: p.accentRing,
                            }}
                          >
                            <Icon className="w-5 h-5" />
                          </span>
                        </div>

                        <h3 className="font-heading text-xl text-off-white tracking-wide mb-3">
                          {p.title.toUpperCase()}
                        </h3>
                        <p className="text-foreground-muted text-sm leading-relaxed mb-5">
                          {p.line}
                        </p>

                        <ul className="flex flex-wrap gap-1.5 list-none p-0">
                          {p.tells.map((t) => (
                            <li
                              key={t}
                              className="text-[11px] tracking-wide text-foreground-subtle rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1"
                            >
                              {t}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </ScrollReveal>
                  </li>
                );
              })}
            </ul>

            {/* Mid-page CTA */}
            <div className="mt-12 text-center">
              <ScrollReveal direction="up" eager>
                <a href="#start" data-cta="mid" className={ctaButtonClass}>
                  FIND MY PROFILE {ctaArrow}
                </a>
                <p className="text-foreground-subtle text-xs mt-4">
                  4 minutes &middot; No card
                </p>
              </ScrollReveal>
            </div>
          </Container>
        </Section>

        <div className="gradient-divider" />

        {/* ── How it works timeline ─────────────────────────────────── */}
        <Section background="deep-purple" grain>
          <Container width="default">
            <ScrollReveal direction="up" eager>
              <p className="text-coral font-heading text-xs tracking-[0.3em] text-center mb-3">
                HOW IT WORKS
              </p>
              <h2
                className="font-heading text-off-white text-center mb-14"
                style={{ fontSize: "var(--text-section)" }}
              >
                FOUR MINUTES TO YOUR ANSWER
              </h2>
            </ScrollReveal>

            <ol className="relative grid md:grid-cols-3 gap-8 md:gap-6 list-none p-0">
              {/* Connecting line — desktop horizontal */}
              <span
                aria-hidden="true"
                className="hidden md:block absolute left-[12%] right-[12%] top-[36px] h-[2px]"
                style={{
                  background:
                    "linear-gradient(90deg, transparent, rgba(241,99,99,0.5), rgba(241,99,99,0.5), transparent)",
                }}
              />
              {HOW_IT_WORKS.map((step, i) => {
                const Icon = step.Icon;
                return (
                  <li key={step.n} className="relative">
                    <ScrollReveal direction="up" delay={i * 0.1} eager>
                      <div className="relative text-center md:text-left">
                        <div className="flex md:block items-center gap-4 md:gap-0 mb-4">
                          <span
                            className="
                              relative inline-flex items-center justify-center
                              w-[72px] h-[72px] rounded-full
                              bg-charcoal border-2 border-coral/60
                              text-coral
                              shadow-[0_0_24px_rgba(241,99,99,0.25)]
                              mx-auto md:mx-0
                            "
                          >
                            <Icon className="w-7 h-7" />
                            <span
                              aria-hidden="true"
                              className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-coral text-off-white font-heading text-xs flex items-center justify-center shadow-[0_4px_10px_rgba(241,99,99,0.5)]"
                            >
                              {step.n}
                            </span>
                          </span>
                          <span className="md:hidden font-heading text-base text-foreground-subtle tracking-wider">
                            {step.time.toUpperCase()}
                          </span>
                        </div>
                        <p className="hidden md:block font-heading text-xs text-foreground-subtle tracking-widest mb-2">
                          {step.time.toUpperCase()}
                        </p>
                        <h3 className="font-heading text-xl text-off-white tracking-wide mb-2">
                          {step.title.toUpperCase()}
                        </h3>
                        <p className="text-foreground-muted text-sm leading-relaxed">
                          {step.body}
                        </p>
                      </div>
                    </ScrollReveal>
                  </li>
                );
              })}
            </ol>
          </Container>
        </Section>

        <div className="gradient-divider" />

        {/* ── The diagnostic itself — framed with eyebrow + ambient glow ── */}
        <Section background="deep-purple" grain id="start">
          <Container width="narrow">
            <ScrollReveal direction="up" className="text-center mb-10" eager>
              <p className="text-coral font-heading text-xs tracking-[0.3em] mb-3">
                START HERE
              </p>
              <h2
                className="font-heading text-off-white mb-3"
                style={{ fontSize: "var(--text-section)" }}
              >
                ANSWER YOUR FIRST QUESTION.
              </h2>
              <p className="text-foreground-muted leading-relaxed">
                Twelve questions. Save-as-you-go. The diagnosis lands in your
                inbox the moment you finish.
              </p>
            </ScrollReveal>

            <div className="relative">
              {/* Ambient coral glow behind the form */}
              <div
                aria-hidden="true"
                className="absolute -inset-x-8 -inset-y-6 pointer-events-none blur-3xl"
                style={{
                  background:
                    "radial-gradient(ellipse at center, rgba(241,99,99,0.14), transparent 70%)",
                }}
              />
              <div className="relative">
                <Suspense fallback={<DiagnosticSkeleton />}>
                  <DiagnosticFlow />
                </Suspense>
              </div>
            </div>
          </Container>
        </Section>

        <div className="gradient-divider" />

        {/* ── Member testimonials — real numbers, real names ────────── */}
        <Section background="charcoal">
          <Container width="default">
            <ScrollReveal direction="up" eager>
              <p className="text-coral font-heading text-xs tracking-[0.3em] text-center mb-3">
                IN THEIR WORDS
              </p>
              <h2
                className="font-heading text-off-white text-center mb-3"
                style={{ fontSize: "var(--text-section)" }}
              >
                WHAT BREAKING THE PLATEAU LOOKS LIKE
              </h2>
              <p className="text-foreground-muted text-center max-w-lg mx-auto mb-12 leading-relaxed">
                Real members. Real numbers. None of these are paid.
              </p>
            </ScrollReveal>

            <ul className="grid md:grid-cols-3 gap-5 list-none p-0">
              {testimonials.map((t, i) => (
                <li key={t.name}>
                  <ScrollReveal direction="up" delay={i * 0.08} eager>
                    <figure
                      className="
                        h-full rounded-2xl bg-background-elevated
                        border border-white/10 p-6 md:p-7
                        flex flex-col
                        transition-all duration-300
                        hover:border-coral/30 hover:-translate-y-0.5
                        hover:shadow-[0_18px_40px_rgba(0,0,0,0.35)]
                      "
                    >
                      {t.stat && (
                        <div className="mb-5 inline-flex items-center self-start gap-2 rounded-full bg-coral/10 border border-coral/30 px-3 py-1">
                          <span className="font-heading text-coral text-base tracking-wide">
                            {t.stat}
                          </span>
                          {t.statLabel && (
                            <span className="text-foreground-muted text-xs">
                              {t.statLabel}
                            </span>
                          )}
                        </div>
                      )}
                      <blockquote className="text-off-white text-base leading-relaxed flex-1">
                        &ldquo;{t.shortQuote ?? t.quote}&rdquo;
                      </blockquote>
                      <figcaption className="mt-5 pt-5 border-t border-white/10">
                        <p className="font-heading text-off-white tracking-wide">
                          {t.name.toUpperCase()}
                        </p>
                        <p className="text-foreground-subtle text-xs mt-1">
                          {t.detail}
                        </p>
                      </figcaption>
                    </figure>
                  </ScrollReveal>
                </li>
              ))}
            </ul>
          </Container>
        </Section>

        <div className="gradient-divider" />

        {/* ── What you'll get ───────────────────────────────────────── */}
        <Section background="deep-purple">
          <Container width="default">
            <ScrollReveal direction="up" eager>
              <p className="text-coral font-heading text-xs tracking-[0.3em] text-center mb-3">
                WHAT YOU GET
              </p>
              <h2
                className="font-heading text-off-white text-center mb-12"
                style={{ fontSize: "var(--text-section)" }}
              >
                WHAT LANDS IN YOUR INBOX
              </h2>
            </ScrollReveal>
            <div className="grid md:grid-cols-3 gap-5">
              {WHAT_YOU_GET.map((card, i) => {
                const Icon = card.Icon;
                return (
                  <ScrollReveal key={card.title} direction="up" delay={i * 0.1} eager>
                    <div
                      className="
                        group h-full bg-charcoal rounded-2xl border border-white/10
                        p-6 md:p-7
                        transition-all duration-300
                        hover:border-coral/30 hover:-translate-y-0.5
                      "
                    >
                      <div className="w-11 h-11 rounded-lg bg-coral/10 border border-coral/30 flex items-center justify-center text-coral mb-5 group-hover:bg-coral/20 transition-colors duration-300">
                        <Icon className="w-5 h-5" />
                      </div>
                      <h3 className="font-heading text-xl text-off-white tracking-wide mb-3">
                        {card.title.toUpperCase()}
                      </h3>
                      <p className="text-foreground-muted text-sm leading-relaxed">
                        {card.body}
                      </p>
                    </div>
                  </ScrollReveal>
                );
              })}
            </div>
          </Container>
        </Section>

        <div className="gradient-divider" />

        {/* ── FAQ accordion ─────────────────────────────────────────── */}
        <Section background="charcoal">
          <Container width="narrow">
            <ScrollReveal direction="up" eager>
              <p className="text-coral font-heading text-xs tracking-[0.3em] text-center mb-3">
                COMMON QUESTIONS
              </p>
              <h2
                className="font-heading text-off-white text-center mb-12"
                style={{ fontSize: "var(--text-section)" }}
              >
                BEFORE YOU START
              </h2>
            </ScrollReveal>
            <FaqAccordion items={FAQS} defaultOpenIndex={0} />
            <p className="text-center text-foreground-subtle text-xs mt-8">
              Still on the fence? Drop a note to{" "}
              <Link
                href={`mailto:${FOUNDER.email}`}
                className="text-coral hover:text-coral-hover transition-colors"
              >
                {FOUNDER.email}
              </Link>
              .
            </p>
          </Container>
        </Section>

        {/* ── Final CTA — aurora + radial wash ───────────────────────── */}
        <section
          id="plateau-final-cta"
          className="relative overflow-hidden bg-deep-purple grain-overlay py-20 md:py-28"
        >
          <div className="aurora-container pointer-events-none">
            <div className="aurora-band aurora-band-1" />
            <div className="aurora-band aurora-band-2" />
          </div>
          <div
            aria-hidden="true"
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse at center, rgba(76, 18, 115, 0.45), transparent 65%)",
            }}
          />
          <Container width="narrow" className="relative text-center">
            <ScrollReveal direction="up" eager>
              <h2
                className="font-heading text-off-white mb-6 leading-tight"
                style={{ fontSize: "var(--text-section)" }}
              >
                STILL HERE?{" "}
                <span className="text-coral">ANSWER YOUR FIRST QUESTION.</span>
              </h2>
              <p className="text-foreground-muted mb-10 max-w-md mx-auto leading-relaxed">
                Four minutes from now you&rsquo;ll have a specific answer for
                why your FTP has stalled.
              </p>
              <a href="#start" data-cta="bottom" className={ctaButtonClass}>
                FIND MY PROFILE {ctaArrow}
              </a>
              <p className="text-foreground-subtle text-xs mt-5">
                No card &middot; 4 minutes &middot; Email only when you want
                the result
              </p>
            </ScrollReveal>
          </Container>
        </section>
      </main>
      <Footer />
      <StickyMobileCta />
    </>
  );
}
