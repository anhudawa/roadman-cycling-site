import Image from "next/image";
import Link from "next/link";
import { Container, Section } from "@/components/layout";
import { BRAND_STATS } from "@/lib/brand-facts";
import {
  COURSE_PRICE_STANDARD_USD,
  COURSE_PRICE_PREMIUM_USD,
} from "@/app/(method)/method/_components/sales/data";

/**
 * /go/method — bare-metal PPC landing page for The Roadman Method.
 *
 * Sister page to /go and /go/ads. Same zero-escape conversion spine —
 * no Header, no Footer, no shared chrome (all path-suppressed and the
 * /go/layout.tsx wrapper sets `noindex`). The only clickable thing on
 * the page is the single repeated CTA → /method/checkout?tier=standard.
 *
 * Difference from /go and /go/ads: those point cold traffic at the free
 * Plateau Diagnostic (a lead-gen funnel). This one points warm/cold paid
 * traffic straight at the paid product — the $297 self-paced 12-week
 * Roadman Method course (Premium $397). It's the bottom-of-funnel paid
 * surface: a visitor who already knows they want a structured plan, not
 * a quiz.
 *
 * Server-rendered, pure CSS interactions, no client hydration in the
 * page itself. Goal: smallest TTFB + LCP on mobile 4G. All proof is
 * real — podcast scale, named expert reviewers, attributed member
 * outcomes drawn from src/lib/testimonials.ts. No fabricated numbers.
 */

// The only destination on the page. Standard tier is the headline price;
// Premium is mentioned in copy and the order-bump line so the visitor
// self-selects up if they want the personalised TrainingPeaks plan.
const CTA_HREF = "/method/checkout?tier=standard";

const FAQS: ReadonlyArray<{ q: string; a: string }> = [
  {
    q: "What exactly do I get?",
    a: "Twelve video modules with me, twelve written companion guides, every worksheet, protocol card and TrainingPeaks plan, plus the entry and exit assessments. Lifetime access — you finish it once and keep it for good.",
  },
  {
    q: "How is this different from a TrainerRoad or Zwift plan?",
    a: "Those hand you workouts. The Method hands you understanding. By Week 12 you'll know why each session exists, how to adjust it when life gets in the way, and how to plan the next block yourself. You become your own coach — with the world's best coaches backing your decisions.",
  },
  {
    q: "What's the difference between Standard and Premium?",
    a: `Standard is the full course — all 12 modules, every companion, every download, the assessments, the forum, for $${COURSE_PRICE_STANDARD_USD}. Premium ($${COURSE_PRICE_PREMIUM_USD}) adds a personalised TrainingPeaks plan built around your audit, a mid-course adjustment at Week 6, and a written training-data review at the end. Same content, more accountability. You can pick Premium on the next screen.`,
  },
  {
    q: "I work full-time and have kids. Is 12 weeks realistic?",
    a: "Yes — the whole programme is built for time-crunched cyclists. The architecture works at 6, 8, 10 or 12 hours a week. Strength is two 30-minute sessions. Lessons are 12–15 minutes each. It restructures the hours you already train, it doesn't add to them.",
  },
  {
    q: "Do I need a power meter?",
    a: "Recommended, not required. The framework works with heart rate and RPE — Dan Lorang himself prefers heart rate for amateurs because it folds in life stress and fatigue in a way power doesn't. You get both protocols.",
  },
  {
    q: "What if it doesn't work for me?",
    a: "30-day full refund. Watch the modules, do the work, and if you're not seeing a measurable shift in clarity, structure or progress, email me and I'll refund you in full. No interrogation, no 500-word essay required.",
  },
];

const PILLARS: ReadonlyArray<{ n: string; label: string; body: string }> = [
  {
    n: "01",
    label: "Coaching",
    body: "The training architecture. Polarised structure and periodisation — the framework Pogačar's coach uses, scaled to your real hours.",
  },
  {
    n: "02",
    label: "Nutrition",
    body: "Fuelling for performance and body composition at once. Carb periodisation, in-ride fuelling and race weight done properly — no misery.",
  },
  {
    n: "03",
    label: "Strength & Conditioning",
    body: "Two sessions a week, heavy compound work — built on the 2025 masters meta-analysis that ended the strength-training debate for cyclists over 40.",
  },
  {
    n: "04",
    label: "Recovery",
    body: "Adaptation is where you grow, not on the bike. Sleep, HRV and the recovery week — the unglamorous work that makes the training count.",
  },
  {
    n: "05",
    label: "Le Métier",
    body: "The craft. Pacing, positioning, the mental game that decides whether your fitness actually shows up when it matters.",
  },
];

// Qualifier copy. Serious, time-crunched amateurs self-select in;
// beginners and quick-fix seekers self-select out before the proof.
const WHO_FOR: readonly string[] = [
  "You train 6+ hours a week and your FTP hasn't moved in months",
  "You've consumed more training content than most coaches have read",
  "You have a job, a family and a life — and you're not pretending otherwise",
  "You want a finite system you own, not another monthly subscription",
  "You're 35–55 and you refuse to accept your best riding is behind you",
];

const WHO_NOT_FOR: readonly string[] = [
  "You want a magic 4-week plan that adds 30 watts",
  "You won't lift weights twice a week",
  "You're a beginner — this assumes a baseline of structured training",
  "You think recovery is for people who aren't serious",
];

const WHAT_YOU_GET: readonly string[] = [
  "12 video modules with Anthony — 12 to 15 minutes each, no fluff",
  "12 written companion guides — the same material to read on the train",
  "Every worksheet, protocol card and downloadable template",
  "A TrainingPeaks plan for every block — load it and ride",
  "Entry & Exit Assessment — a measurable baseline and a measurable result",
  "Lifetime access. One payment. 30-day full refund.",
];

type Testimonial = {
  name: string;
  initials: string;
  photoSrc: string;
  hasPhoto: boolean;
  stat: string;
  detail: string;
  quote: string;
};

const TESTIMONIALS: readonly Testimonial[] = [
  {
    name: "Damien Maloney",
    initials: "DM",
    photoSrc: "/images/testimonials/damien.jpg",
    hasPhoto: true,
    stat: "FTP 200s → 295w",
    detail: "Plateaued sportive rider, plan built around shift work",
    quote:
      "Average sportive rider, plateaued, going nowhere. Anthony built a structure around my work week and what time I actually had. My FTP went from the low 200s to 295.",
  },
  {
    name: "Brian Morrissey",
    initials: "BM",
    photoSrc: "/images/testimonials/brian.jpg",
    hasPhoto: true,
    stat: "FTP +15% at 46",
    detail: "Training less, at lower intensity, and not getting sick",
    quote:
      "Week 10 of base. FTP up 15%, peak HR back to 193 — at 46. I'm training so much less than last year, at lower intensities, and not getting sick. This really works.",
  },
  {
    name: "Chris O'Connor",
    initials: "CO",
    photoSrc: "/images/testimonials/chris.jpg",
    hasPhoto: true,
    stat: "Body fat 20% → 7%",
    detail: "Decades out of the saddle, came back with a bang",
    quote:
      "Decades out of the saddle when I came back. Body fat 20% to 7%. 84 kg to 68. Average wattage doubled — weekly 100 km rides are now the norm.",
  },
  {
    name: "Ian Hennessy",
    initials: "IH",
    photoSrc: "/images/testimonials/ian.jpg",
    hasPhoto: true,
    stat: "Haute Route Pyrenees finisher",
    detail: "From weight-loss riding to event finisher",
    quote:
      "Took up cycling to lose weight and get fit. With Roadman I learned how to actually train. This year I finished the Haute Route Pyrenees — and I already know what's next.",
  },
  {
    name: "Daniel Stone",
    initials: "DS",
    photoSrc: "/images/testimonials/daniel.jpg",
    hasPhoto: true,
    stat: "Cat 3 → Cat 1",
    detail: "One season inside the system",
    quote:
      "Cat 3 to Cat 1 in a season. The difference was the structure, not the volume — knowing exactly what each session was for and how the weeks stacked into something.",
  },
];

const ctaButtonClass = `
  inline-flex items-center justify-center gap-2
  font-heading tracking-wider text-base md:text-lg
  bg-coral hover:bg-coral-hover active:bg-coral-hover
  text-off-white px-8 md:px-10 py-4 rounded-md
  transition-all
  shadow-[0_10px_30px_rgba(241,99,99,0.35)]
  hover:shadow-[0_14px_40px_rgba(241,99,99,0.55)]
  hover:-translate-y-0.5
  w-full sm:w-auto
`;

const CtaArrow = () => (
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

const CheckIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 18 18"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    className="mt-0.5 shrink-0"
  >
    <path d="M3.5 9.5l3.5 3.5 7.5-8" />
  </svg>
);

const CrossIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 18 18"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    className="mt-0.5 shrink-0"
  >
    <path d="M4.5 4.5l9 9M13.5 4.5l-9 9" />
  </svg>
);

const SpotifyIcon = ({ size = 18 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
  </svg>
);

const ApplePodcastsIcon = ({ size = 18 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M5.34 0A5.328 5.328 0 000 5.34v13.32A5.328 5.328 0 005.34 24h13.32A5.328 5.328 0 0024 18.66V5.34A5.328 5.328 0 0018.66 0H5.34zm6.525 2.568c2.336 0 4.448.902 6.056 2.587 1.224 1.272 1.912 2.619 2.264 4.392.12.6-.12 1.2-.72 1.32-.6.12-1.2-.12-1.32-.72-.264-1.368-.816-2.4-1.74-3.36-1.32-1.392-2.94-2.088-4.92-2.088-3.456 0-6.48 3.024-6.48 6.48 0 1.584.576 3.024 1.536 4.176.36.432.312 1.08-.12 1.44-.432.36-1.08.312-1.44-.12C3.744 15.264 2.904 13.392 2.904 11.4c0-4.464 3.72-8.832 8.96-8.832zM11.7 6.744c1.584 0 3.072.624 4.2 1.776 1.032 1.056 1.584 2.4 1.584 3.84 0 .984-.264 1.968-.768 2.856-.36.6-1.08.84-1.68.48-.6-.36-.84-1.08-.48-1.68.288-.504.432-1.056.432-1.632 0-.912-.36-1.776-.984-2.424-.72-.72-1.68-1.104-2.712-1.08-2.064.048-3.648 1.776-3.648 3.96 0 .816.24 1.608.672 2.28.36.6.12 1.32-.48 1.68-.6.36-1.32.12-1.68-.48-.672-1.08-1.008-2.28-1.008-3.48.024-3.36 2.784-6.12 6.552-6.096zM12 10.8c.72 0 1.2.504 1.2 1.2 0 .168-.024.312-.072.456l-.696 4.416c-.096.6-.504.888-1.056.888-.552 0-.96-.288-1.056-.888l-.696-4.416c-.048-.144-.072-.288-.072-.456 0-.696.48-1.2 1.2-1.2h1.248zm-.624 8.568c0-.72.576-1.296 1.296-1.296s1.296.576 1.296 1.296-.576 1.296-1.296 1.296-1.296-.576-1.296-1.296z" />
  </svg>
);

const TestimonialAvatar = ({
  testimonial,
  size = "md",
}: {
  testimonial: Testimonial;
  size?: "md" | "lg";
}) => {
  const dimensions =
    size === "lg" ? "w-16 h-16 md:w-20 md:h-20" : "w-12 h-12 md:w-14 md:h-14";
  const textSize =
    size === "lg" ? "text-xl md:text-2xl" : "text-base md:text-lg";

  if (testimonial.hasPhoto) {
    return (
      <span
        className={`relative ${dimensions} rounded-full overflow-hidden shrink-0 border border-white/15`}
      >
        <Image
          src={testimonial.photoSrc}
          alt={testimonial.name}
          fill
          sizes={size === "lg" ? "80px" : "56px"}
          className="object-cover"
        />
      </span>
    );
  }
  return (
    <span
      aria-hidden="true"
      className={`
        inline-flex items-center justify-center
        ${dimensions} shrink-0 rounded-full
        bg-coral/15 border border-coral/30
      `}
    >
      <span className={`font-heading text-coral tracking-wider ${textSize}`}>
        {testimonial.initials}
      </span>
    </span>
  );
};

export default function GoMethodLandingPage() {
  return (
    <main id="main-content" className="bg-charcoal" data-go-variant="method">
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section
        className="
          relative overflow-hidden
          min-h-[88vh] md:min-h-[92vh] flex items-center
          pt-24 pb-16 md:pt-28 md:pb-24
          bg-charcoal grain-overlay
        "
      >
        {/* Static radial gradient — no animation, keeps paint cheap */}
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at 20% 0%, rgba(76, 18, 115, 0.55), transparent 60%), radial-gradient(ellipse at 80% 100%, rgba(33, 1, 64, 0.7), transparent 55%)",
          }}
        />
        <div
          aria-hidden="true"
          className="absolute top-0 inset-x-0 h-px"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(241,99,99,0.6), transparent)",
          }}
        />

        {/* Brand logo — decorative, unlinked. Same affordance as /go and
            /go/ads: cold paid traffic can see this is a real brand, but
            the mark isn't a navigation handle that would steal the click. */}
        <div className="absolute top-5 left-5 md:top-7 md:left-8 z-20">
          <Image
            src="/images/logo-white.png"
            alt="Roadman Cycling"
            width={763}
            height={345}
            priority
            sizes="(min-width: 768px) 130px, 100px"
            className="w-[100px] md:w-[130px] h-auto select-none drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]"
          />
        </div>

        <Container width="narrow" className="relative text-center">
          <p className="text-coral font-heading text-[11px] md:text-xs tracking-[0.3em] mb-6">
            THE ROADMAN METHOD &middot; A 12-WEEK COURSE
          </p>
          <h1 className="font-heading text-off-white mb-6 leading-[0.95]">
            <span
              className="block"
              style={{ fontSize: "clamp(2.5rem, 7vw, 5.5rem)" }}
            >
              STOP GUESSING.
            </span>
            <span
              className="block mt-1"
              style={{ fontSize: "clamp(2.5rem, 7vw, 5.5rem)" }}
            >
              START TRAINING LIKE
            </span>
            <span
              className="block mt-3 text-coral"
              style={{ fontSize: "clamp(1.75rem, 4.8vw, 3.75rem)" }}
            >
              YOU ACTUALLY MEAN IT.
            </span>
          </h1>
          <p className="text-foreground-muted text-base md:text-xl leading-relaxed mb-8 max-w-xl mx-auto">
            Twelve weeks. Five pillars. One finite system you finish and keep
            for life &mdash; built from {BRAND_STATS.episodeCountLabel}{" "}
            on-the-record conversations with the coaches behind Pog&aacute;car,
            sports scientists, and World Tour nutritionists.
          </p>

          <Link
            href={CTA_HREF}
            data-cta="hero"
            data-track="go_method_hero_cta"
            className={ctaButtonClass}
          >
            ENROL IN THE METHOD &mdash; ${COURSE_PRICE_STANDARD_USD} <CtaArrow />
          </Link>

          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-foreground-subtle text-xs md:text-sm mt-5 px-4">
            <span className="whitespace-nowrap">One payment</span>
            <span className="opacity-40">&middot;</span>
            <span className="whitespace-nowrap">Lifetime access</span>
            <span className="opacity-40">&middot;</span>
            <span className="whitespace-nowrap">30-day refund</span>
            <span className="opacity-40">&middot;</span>
            <span className="whitespace-nowrap">
              Premium with your own plan from ${COURSE_PRICE_PREMIUM_USD}
            </span>
          </div>

          {/* Value stack — enriches the CTA area so the click feels like
              it leads to something concrete, not a vague "course". */}
          <div className="mt-7 md:mt-8 mx-auto max-w-md text-left">
            <p className="text-foreground-subtle font-heading text-[10px] md:text-[11px] tracking-[0.28em] text-center mb-3">
              WHAT&rsquo;S INSIDE
            </p>
            <ul className="space-y-1.5 list-none p-0 text-foreground-muted text-[13px] md:text-sm leading-relaxed">
              {WHAT_YOU_GET.map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <span
                    aria-hidden="true"
                    className="mt-1.5 inline-block w-1.5 h-1.5 rounded-full bg-coral shrink-0"
                  />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Cold-traffic credibility next to the CTA — anchored on the
              podcast's audited scale, zero outbound clicks. */}
          <div className="mt-7 md:mt-8 flex flex-col items-center gap-2">
            <p className="font-heading text-coral text-[11px] tracking-[0.3em]">
              TRUSTED BY SERIOUS CYCLISTS
            </p>
            <p className="text-off-white font-body text-sm leading-snug text-center">
              <span className="font-heading text-2xl tracking-wide mr-2 align-middle">
                {BRAND_STATS.monthlyListenersLabel}
              </span>
              <span className="text-foreground-muted">
                riders a month &middot; {BRAND_STATS.episodeCountLabel} episodes
              </span>
            </p>
          </div>

          {/* Built-by row — answers "who built this and on what basis?"
              above the fold, the biggest credibility gap for paid traffic. */}
          <div className="mt-8 md:mt-10 mx-auto inline-flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm py-3 pl-3 pr-4 md:pr-5 max-w-md">
            <span className="relative w-11 h-11 rounded-full overflow-hidden shrink-0 border border-white/15">
              <Image
                src="/images/about/anthony-profile-closeup-v2.jpg"
                alt="Anthony Walsh — host, Roadman Cycling"
                fill
                sizes="44px"
                className="object-cover"
              />
            </span>
            <span className="text-left text-foreground-muted text-[12px] md:text-sm leading-snug">
              <span className="block text-off-white">
                Built by Anthony Walsh — host, Roadman Cycling Podcast
              </span>
              <span className="block mt-0.5">
                The same coaches you&rsquo;ve heard on the show: Seiler, Lorang,
                Dunne.
              </span>
            </span>
          </div>
        </Container>
      </section>

      {/* ── Credibility bar ──────────────────────────────────────────── */}
      {/* Icons are static credibility decoration here, not links, so the
          only clickable thing on the page stays the CTA. */}
      <section
        aria-label="Roadman Cycling at a glance"
        className="bg-deep-purple border-y border-white/5"
      >
        <Container width="default">
          <ul className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-x-8 md:gap-x-12 list-none p-0 py-5 md:py-6 text-center">
            <li className="flex items-center gap-2 font-heading text-[11px] md:text-[12px] tracking-[0.18em] text-off-white/85">
              <span className="text-coral">100M+</span>
              <span className="text-foreground-muted">PODCAST DOWNLOADS</span>
              <span className="ml-1 flex items-center gap-1.5 text-off-white/55">
                <ApplePodcastsIcon size={14} />
                <SpotifyIcon size={14} />
              </span>
            </li>
            <li
              aria-hidden="true"
              className="hidden sm:block h-3 w-px bg-white/15"
            />
            <li className="flex items-center gap-2 font-heading text-[11px] md:text-[12px] tracking-[0.18em] text-off-white/85">
              <span className="text-coral">
                {BRAND_STATS.youtubeSubscribersLabel}
              </span>
              <span className="text-foreground-muted">YOUTUBE SUBSCRIBERS</span>
            </li>
            <li
              aria-hidden="true"
              className="hidden sm:block h-3 w-px bg-white/15"
            />
            <li className="font-heading text-[11px] md:text-[12px] tracking-[0.18em] text-foreground-muted">
              METHODS FROM{" "}
              <span className="text-off-white">WORLD TOUR COACHES</span> &amp;{" "}
              <span className="text-off-white">SPORTS SCIENTISTS</span>
            </li>
          </ul>
        </Container>
      </section>

      {/* ── Pain identification ──────────────────────────────────────── */}
      <Section background="deep-purple">
        <Container width="narrow">
          <p className="text-coral font-heading text-[11px] md:text-xs tracking-[0.3em] text-center mb-3">
            DOES THIS SOUND LIKE YOU?
          </p>
          <h2
            className="font-heading text-off-white text-center mb-10"
            style={{ fontSize: "clamp(1.875rem, 4.5vw, 3rem)" }}
          >
            YOU&rsquo;RE NOT SHORT ON EFFORT. YOU&rsquo;RE SHORT ON A SYSTEM.
          </h2>

          <div className="max-w-xl mx-auto text-foreground-muted text-base md:text-lg leading-relaxed space-y-4">
            <p>
              You&rsquo;ve put in the hours and the FTP number won&rsquo;t move.
              You&rsquo;ve stitched together YouTube videos, a TrainerRoad plan,
              a strength routine off Instagram &mdash; and none of it adds up to
              one thing that goes somewhere.
            </p>
            <p>
              You don&rsquo;t need more content. You&rsquo;ve consumed more
              training content than most coaches have read. What you&rsquo;re
              missing is the architecture that turns all of it into a season
              that actually peaks.
            </p>
          </div>

          <p className="text-foreground-muted text-base md:text-lg leading-relaxed text-center max-w-xl mx-auto mt-10">
            The Roadman Method is that architecture &mdash;{" "}
            <span className="text-off-white">twelve weeks</span>, five pillars,
            and a finite system you finish and own. Not a subscription. Not
            endless drip content.
          </p>
        </Container>
      </Section>

      <div className="gradient-divider" />

      {/* ── The five pillars ─────────────────────────────────────────── */}
      <Section background="charcoal">
        <Container width="default">
          <p className="text-coral font-heading text-[11px] md:text-xs tracking-[0.3em] text-center mb-3">
            THE FIVE PILLARS
          </p>
          <h2
            className="font-heading text-off-white text-center mb-3"
            style={{ fontSize: "clamp(1.875rem, 4.5vw, 3rem)" }}
          >
            EVERYTHING THAT MOVES THE NEEDLE. NOTHING THAT DOESN&rsquo;T.
          </h2>
          <p className="text-foreground-muted text-center max-w-lg mx-auto mb-10 md:mb-12 leading-relaxed">
            Most plans cover the bike work and ignore the rest. The Method
            covers all five &mdash; properly, in sequence, over twelve weeks.
          </p>

          <ul className="grid sm:grid-cols-2 gap-4 md:gap-5 list-none p-0 max-w-3xl mx-auto">
            {PILLARS.map((pillar) => (
              <li key={pillar.label}>
                <div
                  className="
                    relative h-full rounded-2xl
                    bg-background-elevated border border-white/10
                    p-5 md:p-6
                  "
                  style={{ boxShadow: "0 6px 20px rgba(0,0,0,0.25)" }}
                >
                  <span
                    aria-hidden="true"
                    className="absolute left-0 top-5 bottom-5 w-[3px] rounded-r bg-coral"
                  />
                  <p className="font-heading text-coral text-2xl leading-none mb-2">
                    {pillar.n}
                  </p>
                  <h3 className="font-heading text-lg md:text-xl text-off-white tracking-wide mb-2">
                    {pillar.label.toUpperCase()}
                  </h3>
                  <p className="text-foreground-muted text-sm md:text-[15px] leading-relaxed">
                    {pillar.body}
                  </p>
                </div>
              </li>
            ))}
          </ul>

          <p className="text-off-white text-center max-w-2xl mx-auto mt-10 md:mt-12 text-lg md:text-xl leading-relaxed">
            Coaching architecture from the people behind Pog&aacute;car and
            Froome. Nutrition from a World Tour performance dietitian. S&amp;C
            built on the 2025 masters meta-analysis. Recovery treated as
            training.
          </p>

          <div className="mt-8 md:mt-10 text-center">
            <Link
              href={CTA_HREF}
              data-cta="mid"
              data-track="go_method_pillars_cta"
              className={ctaButtonClass}
            >
              ENROL IN THE METHOD &mdash; ${COURSE_PRICE_STANDARD_USD}{" "}
              <CtaArrow />
            </Link>
            <p className="text-foreground-subtle text-xs mt-4">
              Lifetime access &middot; 30-day refund
            </p>
          </div>
        </Container>
      </Section>

      <div className="gradient-divider" />

      {/* ── Who this is for ──────────────────────────────────────────── */}
      <Section background="deep-purple">
        <Container width="default">
          <p className="text-coral font-heading text-[11px] md:text-xs tracking-[0.3em] text-center mb-3">
            WHO THIS IS FOR
          </p>
          <h2
            className="font-heading text-off-white text-center mb-3"
            style={{ fontSize: "clamp(1.875rem, 4.5vw, 3rem)" }}
          >
            IS THE METHOD FOR YOU?
          </h2>
          <p className="text-foreground-muted text-center max-w-lg mx-auto mb-10 md:mb-12 leading-relaxed">
            The Method is built for a specific kind of cyclist. Be honest with
            yourself before you enrol.
          </p>

          <div className="grid md:grid-cols-2 gap-4 md:gap-5 max-w-4xl mx-auto">
            <div
              className="
                relative h-full rounded-2xl
                bg-charcoal border border-white/10
                p-6 md:p-8
                shadow-[0_6px_20px_rgba(0,0,0,0.25)]
              "
            >
              <span
                aria-hidden="true"
                className="absolute left-0 top-6 bottom-6 w-[3px] rounded-r bg-emerald-400"
              />
              <h3 className="font-heading text-emerald-400 text-xl md:text-2xl tracking-wide mb-5">
                THIS IS FOR YOU IF
              </h3>
              <ul className="space-y-3.5 list-none p-0 m-0">
                {WHO_FOR.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3 text-foreground-muted text-sm md:text-[15px] leading-relaxed"
                  >
                    <span className="text-emerald-400">
                      <CheckIcon />
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div
              className="
                relative h-full rounded-2xl
                bg-charcoal border border-white/10
                p-6 md:p-8
                shadow-[0_6px_20px_rgba(0,0,0,0.25)]
              "
            >
              <span
                aria-hidden="true"
                className="absolute left-0 top-6 bottom-6 w-[3px] rounded-r bg-red-400"
              />
              <h3 className="font-heading text-red-400 text-xl md:text-2xl tracking-wide mb-5">
                THIS IS NOT FOR YOU IF
              </h3>
              <ul className="space-y-3.5 list-none p-0 m-0">
                {WHO_NOT_FOR.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3 text-foreground-muted text-sm md:text-[15px] leading-relaxed"
                  >
                    <span className="text-red-400">
                      <CrossIcon />
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Container>
      </Section>

      <div className="gradient-divider" />

      {/* ── Social proof ─────────────────────────────────────────────── */}
      {/* Member outcomes first (people like me got results), then podcast
          scale and named experts as supporting credibility. Every outbound
          link removed — the page stays zero-escape. */}
      <Section background="deep-purple" grain>
        <Container width="default">
          <p className="text-coral font-heading text-[11px] md:text-xs tracking-[0.3em] text-center mb-3">
            REAL RIDERS &middot; REAL CHANGES
          </p>
          <h2
            className="font-heading text-off-white text-center mb-10 md:mb-12"
            style={{ fontSize: "clamp(1.875rem, 4.5vw, 3rem)" }}
          >
            THE RIDERS WHO STOPPED GUESSING
          </h2>

          {/* Featured testimonial — Damien */}
          <figure
            className="
              relative max-w-4xl mx-auto mb-4 md:mb-5
              rounded-2xl bg-charcoal border border-white/10
              p-6 md:p-8
              shadow-[0_10px_30px_rgba(0,0,0,0.25)]
            "
          >
            <span
              aria-hidden="true"
              className="absolute left-0 top-6 bottom-6 w-[3px] rounded-r bg-coral"
            />
            <div className="flex flex-col md:flex-row gap-5 md:gap-7 items-start">
              <TestimonialAvatar testimonial={TESTIMONIALS[0]} size="lg" />
              <div className="flex-1">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-coral/10 border border-coral/30 px-3 py-1">
                  <span className="font-heading text-coral text-sm md:text-base tracking-wide">
                    {TESTIMONIALS[0].stat}
                  </span>
                </div>
                <blockquote className="text-off-white text-lg md:text-xl leading-relaxed m-0">
                  &ldquo;{TESTIMONIALS[0].quote}&rdquo;
                </blockquote>
                <figcaption className="mt-5 pt-4 border-t border-white/10">
                  <p className="font-heading text-off-white tracking-wide">
                    {TESTIMONIALS[0].name.toUpperCase()}
                  </p>
                  <p className="text-foreground-subtle text-xs mt-1">
                    {TESTIMONIALS[0].detail}
                  </p>
                </figcaption>
              </div>
            </div>
          </figure>

          {/* Grid — remaining testimonials */}
          <ul className="grid sm:grid-cols-2 gap-4 md:gap-5 list-none p-0 max-w-4xl mx-auto">
            {TESTIMONIALS.slice(1).map((t) => (
              <li key={t.name}>
                <figure
                  className="
                    h-full rounded-2xl bg-charcoal
                    border border-white/10 p-5 md:p-6
                    flex flex-col
                    shadow-[0_6px_20px_rgba(0,0,0,0.2)]
                  "
                >
                  <div className="flex items-center gap-3 mb-4">
                    <TestimonialAvatar testimonial={t} />
                    <div className="flex-1 min-w-0">
                      <p className="font-heading text-off-white text-sm md:text-base tracking-wide leading-tight">
                        {t.name.toUpperCase()}
                      </p>
                      <p className="font-heading text-coral text-xs md:text-sm tracking-wide mt-0.5">
                        {t.stat}
                      </p>
                    </div>
                  </div>
                  <blockquote className="text-foreground-muted text-sm md:text-[15px] leading-relaxed flex-1 m-0">
                    &ldquo;{t.quote}&rdquo;
                  </blockquote>
                  <figcaption className="mt-4 pt-3 border-t border-white/5">
                    <p className="text-foreground-subtle text-xs">{t.detail}</p>
                  </figcaption>
                </figure>
              </li>
            ))}
          </ul>

          {/* Divider between member outcomes and podcast credibility */}
          <div className="mx-auto max-w-3xl mt-16 md:mt-20 mb-12 md:mb-14 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />

          {/* Podcast scale + experts — supporting credibility */}
          <p className="text-coral font-heading text-[11px] md:text-xs tracking-[0.3em] text-center mb-3">
            THE WORK BEHIND THE WORK
          </p>
          <h3
            className="font-heading text-off-white text-center mb-10 md:mb-12"
            style={{ fontSize: "clamp(1.5rem, 3.5vw, 2.25rem)" }}
          >
            BUILT FROM CONVERSATIONS MOST COACHES NEVER GET
          </h3>

          {/* Stat row — platform icons rendered as static decoration */}
          <dl className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-8 max-w-3xl mx-auto">
            <div className="text-center">
              <dt className="font-heading text-3xl md:text-5xl text-coral leading-none">
                100M+
              </dt>
              <dd className="text-foreground-subtle text-xs md:text-sm mt-2">
                Podcast downloads
              </dd>
              <dd className="mt-2 flex items-center justify-center gap-2 text-off-white/55">
                <ApplePodcastsIcon size={16} />
                <SpotifyIcon size={16} />
              </dd>
            </div>
            <div className="text-center">
              <dt className="font-heading text-3xl md:text-5xl text-coral leading-none">
                {BRAND_STATS.episodeCountLabel}
              </dt>
              <dd className="text-foreground-subtle text-xs md:text-sm mt-2">
                Episodes recorded
              </dd>
            </div>
            <div className="text-center">
              <dt className="font-heading text-3xl md:text-5xl text-coral leading-none">
                {BRAND_STATS.monthlyListenersLabel}
              </dt>
              <dd className="text-foreground-subtle text-xs md:text-sm mt-2">
                Monthly listeners
              </dd>
            </div>
            <div className="text-center">
              <dt className="font-heading text-3xl md:text-5xl text-coral leading-none">
                {BRAND_STATS.countriesReachedLabel}
              </dt>
              <dd className="text-foreground-subtle text-xs md:text-sm mt-2">
                Countries
              </dd>
            </div>
          </dl>

          {/* Named experts — the reviewers behind the method */}
          <p className="text-foreground-muted text-center max-w-2xl mx-auto leading-relaxed mb-14 md:mb-16 text-sm md:text-base">
            Every module is built from on-the-record conversations with the
            people who actually move performance forward &mdash;{" "}
            <span className="text-off-white">Prof. Stephen Seiler</span> on
            polarised training,{" "}
            <span className="text-off-white">Dan Lorang</span> on
            periodisation, <span className="text-off-white">Dr. David Dunne</span>{" "}
            on fuelling, and{" "}
            <span className="text-off-white">John Wakefield</span> on the torque
            protocols Bora-Hansgrohe riders run twice a week.
          </p>

          {/* By-the-numbers strip — audited scale as a static card */}
          <div
            className="
              block max-w-xl mx-auto
              rounded-2xl border border-white/15 bg-white/[0.04]
              px-6 py-7 md:px-8 md:py-8
              shadow-[0_10px_30px_rgba(0,0,0,0.25)]
            "
          >
            <div className="flex flex-col items-center gap-5 text-center">
              <p className="font-heading text-foreground-muted text-[10px] md:text-xs tracking-[0.3em]">
                TRUSTED BY CYCLISTS WORLDWIDE
              </p>
              <div className="grid grid-cols-3 gap-4 md:gap-8 w-full">
                <div>
                  <p className="font-heading text-off-white text-3xl md:text-4xl leading-none">
                    {BRAND_STATS.monthlyListenersLabel}
                  </p>
                  <p className="text-foreground-muted text-xs mt-1.5 leading-snug">
                    monthly listeners
                  </p>
                </div>
                <div>
                  <p className="font-heading text-off-white text-3xl md:text-4xl leading-none">
                    {BRAND_STATS.episodeCountLabel}
                  </p>
                  <p className="text-foreground-muted text-xs mt-1.5 leading-snug">
                    episodes
                  </p>
                </div>
                <div>
                  <p className="font-heading text-off-white text-3xl md:text-4xl leading-none">
                    {BRAND_STATS.countriesReachedLabel}
                  </p>
                  <p className="text-foreground-muted text-xs mt-1.5 leading-snug">
                    countries reached
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      <div className="gradient-divider" />

      {/* ── Guarantee ────────────────────────────────────────────────── */}
      <Section background="charcoal">
        <Container width="narrow">
          <div className="relative rounded-2xl border border-coral/30 bg-background-elevated/60 p-8 md:p-10 overflow-hidden max-w-2xl mx-auto">
            <div
              aria-hidden="true"
              className="absolute inset-0 -z-10 pointer-events-none"
              style={{
                background:
                  "radial-gradient(ellipse 60% 80% at 0% 0%, rgba(241,99,99,0.12) 0%, rgba(37,37,38,0) 60%)",
              }}
            />
            <p className="font-heading text-[11px] md:text-xs tracking-[0.3em] text-coral mb-4">
              THE GUARANTEE
            </p>
            <h2
              className="font-heading uppercase leading-[1] text-off-white mb-6"
              style={{ fontSize: "clamp(1.75rem, 4vw, 2.75rem)" }}
            >
              THIRTY DAYS. FULL REFUND. NO INTERROGATION.
            </h2>
            <div className="space-y-4 text-foreground-muted text-base md:text-lg leading-relaxed">
              <p>
                Open the course. Watch the first modules. Do the worksheets.
                Load the TrainingPeaks plan and ride a week of it.
              </p>
              <p>
                If, inside 30 days, you&rsquo;re not seeing a measurable shift
                in clarity, structure or progress &mdash; email me. I refund you
                in full and you keep what you&rsquo;ve learned. A one-line email
                is enough.
              </p>
            </div>
          </div>
        </Container>
      </Section>

      <div className="gradient-divider" />

      {/* ── FAQ ──────────────────────────────────────────────────────── */}
      <Section background="charcoal">
        <Container width="narrow">
          <p className="text-coral font-heading text-[11px] md:text-xs tracking-[0.3em] text-center mb-3">
            BEFORE YOU ENROL
          </p>
          <h2
            className="font-heading text-off-white text-center mb-10 md:mb-12"
            style={{ fontSize: "clamp(1.875rem, 4.5vw, 3rem)" }}
          >
            THE QUESTIONS I GET ASKED MOST
          </h2>
          {/* Checkbox-hack disclosure, identical pattern to /go and
              /go/ads: zero JS, mobile collapsed, desktop expanded. */}
          <style>{`
            .go-faq-card .go-faq-answer { display: none; }
            .go-faq-card .go-faq-chevron::before { content: "▾"; }
            .go-faq-card:has(input:checked) .go-faq-answer { display: block; }
            .go-faq-card:has(input:checked) .go-faq-chevron::before { content: "▴"; }
            @media (min-width: 640px) {
              .go-faq-card .go-faq-answer { display: block; }
              .go-faq-card .go-faq-label { cursor: default; }
              .go-faq-card .go-faq-chevron { display: none; }
            }
          `}</style>
          <ul className="space-y-3 md:space-y-4 list-none p-0 max-w-2xl mx-auto">
            {FAQS.map(({ q, a }, i) => (
              <li key={q}>
                <div
                  className="
                    go-faq-card
                    rounded-2xl bg-deep-purple border border-white/10
                    p-5 md:p-6
                    shadow-[0_6px_20px_rgba(0,0,0,0.2)]
                  "
                >
                  <input
                    type="checkbox"
                    id={`go-method-faq-${i + 1}`}
                    className="sr-only"
                  />
                  <label
                    data-track={`go_method_faq_q${i + 1}`}
                    htmlFor={`go-method-faq-${i + 1}`}
                    className="
                      go-faq-label
                      flex items-start justify-between gap-3
                      cursor-pointer select-none
                    "
                  >
                    <h3 className="font-heading text-coral text-lg md:text-xl tracking-wide leading-snug m-0">
                      {q.toUpperCase()}
                    </h3>
                    <span
                      aria-hidden="true"
                      className="
                        go-faq-chevron
                        shrink-0 mt-1 text-coral/70 text-base
                      "
                    />
                  </label>
                  <p className="go-faq-answer text-foreground-muted text-[15px] md:text-base leading-relaxed m-0 mt-3">
                    {a}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      <div className="gradient-divider" />

      {/* ── Final CTA ────────────────────────────────────────────────── */}
      {/* The page ends here. No legal footer, no fallback link, no
          outbound brand-verify link. The only thing left is the CTA. */}
      <section className="relative overflow-hidden bg-charcoal grain-overlay py-20 md:py-28">
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(76, 18, 115, 0.45), transparent 65%)",
          }}
        />
        <Container width="narrow" className="relative text-center">
          <h2
            className="font-heading text-off-white mb-6 leading-tight"
            style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)" }}
          >
            TWELVE WEEKS FROM NOW,{" "}
            <span className="text-coral">YOU&rsquo;LL HAVE A SYSTEM.</span>
          </h2>
          <p className="text-foreground-muted mb-10 max-w-md mx-auto leading-relaxed">
            Module 01 unlocks the moment you log in. One payment, lifetime
            access, and a 30-day full refund if it&rsquo;s not for you.
          </p>
          <Link
            href={CTA_HREF}
            data-cta="bottom"
            data-track="go_method_final_cta"
            className={ctaButtonClass}
          >
            ENROL IN THE METHOD &mdash; ${COURSE_PRICE_STANDARD_USD} <CtaArrow />
          </Link>
          <p className="text-foreground-subtle text-xs mt-5">
            One payment &middot; Lifetime access &middot; 30-day refund &middot;
            Premium with your own plan from ${COURSE_PRICE_PREMIUM_USD}
          </p>
        </Container>
      </section>
    </main>
  );
}
