import Image from "next/image";
import Link from "next/link";
import { Container, Section } from "@/components/layout";
import { BRAND_STATS } from "@/lib/brand-facts";
import { TRUSTPILOT } from "@/lib/trustpilot";
import { AdsLandingAnalytics } from "./AdsLandingAnalytics";

/**
 * /go/ads — bare-metal Google Ads landing page.
 *
 * Sister page to /go. Same content spine, but stripped of every
 * external link, footer escape route and A/B variant cookie. The
 * only clickable thing on the page is the CTA → /plateau?source=ads.
 *
 * Why a separate route (not just a query param on /go):
 *  - The /go path is wired into a middleware-driven A/B headline test.
 *    Adding "is this an ads-only render?" branching there would muddy
 *    the test sample. Splitting paths keeps both surfaces clean.
 *  - The ad-side and the cold-organic-side of /go diverge over time
 *    (different creative, different offers, different test cycles).
 *    A separate file lets each evolve without merge-conflict pain.
 *  - Reporting: every conversion attribution stays clear — /go traffic
 *    is from organic / direct / non-Google-ads paid; /go/ads is the
 *    paid surface. No source-param sniffing required downstream.
 *
 * Server-rendered, pure CSS interactions, no client hydration in the
 * page itself. Goal: smallest TTFB + LCP we can ship on mobile 4G.
 */

// Source param flows through to the diagnostic so attribution survives
// the page hop. No A/B variant — this page renders one fixed headline.
const CTA_HREF = "/plateau?source=ads";

const FAQS: ReadonlyArray<{ q: string; a: string }> = [
  {
    q: "What does the diagnostic actually do?",
    a: "Twelve questions about your training, recovery and fuelling. You get one of four plateau patterns back, plus the three changes to make this week. Four minutes, on screen, done.",
  },
  {
    q: "Is the result accurate or generic?",
    a: "It's the same four-cause pattern I've built from years of conversations with the coaches behind World Tour wins. Generic plans treat every plateaued rider the same. This doesn't — what you tell me changes what you get back.",
  },
  {
    q: "What happens to my email?",
    a: "Nothing, unless you give it to me — the result shows on screen. If you do leave your email you'll get the Saturday Spin newsletter and nothing else. One-click unsubscribe.",
  },
  {
    q: "I don't have a power meter — can I still use this?",
    a: "Yes. Most questions are about how your training feels and how you're recovering. Power data sharpens the answer. If you don't have it, you tell me what you've noticed on the road and we work from there.",
  },
  {
    q: "What's Not Done Yet?",
    a: "The paid community I run for serious masters cyclists who refuse to accept their best days are behind them. Training plans, weekly live calls with me, the S&C roadmap. You don't have to join anything to take the diagnostic.",
  },
  {
    q: "What happens after I get my result?",
    a: "You see your plateau type and the three changes to make this week. From there you can run with it yourself or see if Not Done Yet is the right fit. Either way, you leave clearer than you arrived.",
  },
];

const FOUR_REASONS = [
  {
    label: "Under-recovered",
    body: "You're doing the training. You're not getting the adaptation. Sleep, life stress and back-to-back hard sessions are eating the gains.",
  },
  {
    label: "No-man's-land",
    body: "Most of your riding is neither easy enough to recover from nor hard enough to drive change. The middle is where progress dies.",
  },
  {
    label: "Strength gap",
    body: "Your aerobic engine still works. The neuromuscular power that drives it is leaking quietly — about 1% per year after 40 if you're not lifting.",
  },
  {
    label: "Fuelling deficit",
    body: "Training hungry. Chasing race weight. Every session is paid for with tomorrow's adaptation.",
  },
];

// Qualifier copy. Serious riders self-select in; beginners and
// quick-fix seekers self-select out before they hit the testimonials.
const WHO_FOR: readonly string[] = [
  "You've been riding 2+ years and still feel stuck at the same level",
  "You train 6-12 hours a week but your FTP hasn't moved in months",
  "You're a serious amateur who refuses to accept your best days are behind you",
  "You want structure and accountability, not another generic training plan",
  "You're willing to invest in yourself like the competitive athlete you are",
];

const WHO_NOT_FOR: readonly string[] = [
  "You're just getting into cycling and need beginner basics",
  "You want a quick fix or magic shortcut to race fitness",
  "You're not willing to follow a structured programme",
  "You're looking for the cheapest option, not the most effective one",
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
      "Average sportive rider, plateaued, going nowhere. Anthony built a custom plan around my work week and what time I actually had. My FTP went from the low 200s to 295.",
  },
  {
    name: "Brian Morrisey",
    initials: "BM",
    photoSrc: "/images/testimonials/brian.jpg",
    hasPhoto: true,
    stat: "FTP +15% at 46",
    detail: "Plan moved around shift work",
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
    name: "Mark O'Donnell",
    initials: "MO",
    photoSrc: "/images/testimonials/mark.jpg",
    hasPhoto: true,
    stat: "4 years coached",
    detail: "Balancing training around work and family",
    quote:
      "Almost four years as a coaching client. Came from three decades of structured martial arts wanting the same for cycling. Real flexibility around work and family — that's been the difference.",
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

const TRUSTPILOT_GREEN = "#00B67A";

const TrustpilotStar = ({ size = 28 }: { size?: number }) => (
  <span
    aria-hidden="true"
    style={{
      width: size,
      height: size,
      background: TRUSTPILOT_GREEN,
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 2,
    }}
  >
    <svg
      width={size * 0.72}
      height={size * 0.72}
      viewBox="0 0 24 24"
      fill="white"
      aria-hidden="true"
    >
      <path d="M12 2l2.95 6.69L22 9.74l-5.5 4.93L18.18 22 12 18.27 5.82 22l1.68-7.33L2 9.74l7.05-1.05L12 2z" />
    </svg>
  </span>
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
  const textSize = size === "lg" ? "text-xl md:text-2xl" : "text-base md:text-lg";

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

export default function GoAdsLandingPage() {
  return (
    <main id="main-content" className="bg-charcoal" data-go-variant="ads">
      <AdsLandingAnalytics />
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

        {/* Brand logo — decorative, unlinked. Same affordance as /go:
            cold ad traffic can see this is a real brand, but the mark
            isn't a navigation handle that would steal the click. */}
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
            FOR CYCLISTS TRAINING 6&ndash;12 HOURS A WEEK
          </p>
          <h1 className="font-heading text-off-white mb-6 leading-[0.95]">
            <span
              className="block"
              style={{ fontSize: "clamp(2.5rem, 7vw, 5.5rem)" }}
            >
              YOUR FTP IS STUCK.
            </span>
            <span
              className="block mt-1"
              style={{ fontSize: "clamp(2.5rem, 7vw, 5.5rem)" }}
            >
              YOUR TRAINING ISN&rsquo;T WORKING.
            </span>
            <span
              className="block mt-3 text-coral"
              style={{ fontSize: "clamp(1.75rem, 4.8vw, 3.75rem)" }}
            >
              YOU KNOW THERE&rsquo;S MORE IN YOU.
            </span>
          </h1>
          <p className="text-foreground-muted text-base md:text-xl leading-relaxed mb-8 max-w-xl mx-auto">
            Four minutes, twelve questions, and I&rsquo;ll tell you exactly why
            your FTP has stalled &mdash; and the three changes to make this
            week. It&rsquo;s the same pattern I&rsquo;ve watched Dan Lorang,
            Stephen Seiler and the World Tour coaches I&rsquo;ve interviewed
            apply to riders for years.
          </p>

          <Link
            href={CTA_HREF}
            data-cta="hero"
            data-track="go_ads_hero_cta"
            className={ctaButtonClass}
          >
            GET MY FREE DIAGNOSIS <CtaArrow />
          </Link>

          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-foreground-subtle text-xs md:text-sm mt-5 px-4">
            <span className="whitespace-nowrap">Free</span>
            <span className="opacity-40">&middot;</span>
            <span className="whitespace-nowrap">No card</span>
            <span className="opacity-40">&middot;</span>
            <span className="whitespace-nowrap">4 minutes</span>
            <span className="opacity-40">&middot;</span>
            <span className="whitespace-nowrap">No email needed to start</span>
          </div>

          {/* Value stack — enriches the CTA area for cold ad traffic so
              the click feels like it leads to something concrete. */}
          <div className="mt-7 md:mt-8 mx-auto max-w-md text-left">
            <p className="text-foreground-subtle font-heading text-[10px] md:text-[11px] tracking-[0.28em] text-center mb-3">
              YOUR RESULT INCLUDES
            </p>
            <ul className="space-y-1.5 list-none p-0 text-foreground-muted text-[13px] md:text-sm leading-relaxed">
              <li className="flex items-start gap-2.5">
                <span
                  aria-hidden="true"
                  className="mt-1.5 inline-block w-1.5 h-1.5 rounded-full bg-coral shrink-0"
                />
                <span>
                  Your specific plateau type &mdash; under-recovered,
                  no-man&rsquo;s-land, strength gap or fuelling deficit
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span
                  aria-hidden="true"
                  className="mt-1.5 inline-block w-1.5 h-1.5 rounded-full bg-coral shrink-0"
                />
                <span>The root cause behind it, in plain English</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span
                  aria-hidden="true"
                  className="mt-1.5 inline-block w-1.5 h-1.5 rounded-full bg-coral shrink-0"
                />
                <span>Three changes to make this week</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span
                  aria-hidden="true"
                  className="mt-1.5 inline-block w-1.5 h-1.5 rounded-full bg-coral shrink-0"
                />
                <span>
                  Why the generic plans you&rsquo;ve tried haven&rsquo;t moved
                  your FTP
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span
                  aria-hidden="true"
                  className="mt-1.5 inline-block w-1.5 h-1.5 rounded-full bg-coral shrink-0"
                />
                <span>
                  Result shown on screen in 4 minutes. No email needed to
                  start.
                </span>
              </li>
            </ul>
          </div>

          {/* Trustpilot rating — cold-ad credibility next to the CTA.
              The shared TrustpilotBadge always wraps the score in an
              anchor to trustpilot.com, which would leak the click. We
              inline a static version here so the page stays
              zero-escape. */}
          <div className="mt-7 md:mt-8 flex flex-col items-center gap-2">
            <div className="flex items-center gap-1.5">
              <TrustpilotStar size={20} />
              <TrustpilotStar size={20} />
              <TrustpilotStar size={20} />
              <TrustpilotStar size={20} />
              <TrustpilotStar size={20} />
            </div>
            <p className="text-off-white font-body text-sm leading-snug">
              <span className="font-heading text-2xl tracking-wide mr-2 align-middle">
                {TRUSTPILOT.rating.toFixed(1)}
              </span>
              <span className="text-foreground-muted">
                {TRUSTPILOT.tierLabel} on Trustpilot
              </span>
            </p>
          </div>

          {/* Built-by row — names the author and the experts behind the
              method. Same as /go but without the second priority image. */}
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
      {/* Icons are non-link decoration. On /go these double as podcast
          platform deep-links; here they stay as static credibility
          signals so the only clickable thing remains the CTA. */}
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
            THE PLATEAU NOBODY&rsquo;S EXPLAINED TO YOU
          </h2>

          <div className="max-w-xl mx-auto text-foreground-muted text-base md:text-lg leading-relaxed space-y-4">
            <p>
              You&rsquo;re putting in the hours and the FTP number won&rsquo;t
              move. You&rsquo;ve tried the YouTube plans, the TrainerRoad plans,
              the ones in the magazines &mdash; same story.
            </p>
            <p>
              You can feel the punch fading on the climbs and the sprints, and
              you&rsquo;re not ready to accept it. You don&rsquo;t want another
              generic plan. You want to know what&rsquo;s actually wrong.
            </p>
          </div>

          <p className="text-foreground-muted text-base md:text-lg leading-relaxed text-center max-w-xl mx-auto mt-10">
            You&rsquo;re not lazy. You&rsquo;re not undertrained. There are only{" "}
            <span className="text-off-white">four reasons</span> a serious
            masters cyclist&rsquo;s FTP stops moving. Find out which one is
            yours.
          </p>
        </Container>
      </Section>

      <div className="gradient-divider" />

      {/* ── The four reasons ─────────────────────────────────────────── */}
      <Section background="charcoal">
        <Container width="default">
          <p className="text-coral font-heading text-[11px] md:text-xs tracking-[0.3em] text-center mb-3">
            THE ROADMAN FOUR-CAUSE DIAGNOSTIC
          </p>
          <h2
            className="font-heading text-off-white text-center mb-3"
            style={{ fontSize: "clamp(1.875rem, 4.5vw, 3rem)" }}
          >
            YOUR PLATEAU IS ONE OF THESE.
          </h2>
          <p className="text-foreground-muted text-center max-w-lg mx-auto mb-10 md:mb-12 leading-relaxed">
            Each one has a specific cause and a specific fix. Twelve questions
            tell you which of the four is yours.
          </p>

          <ul className="grid sm:grid-cols-2 gap-4 md:gap-5 list-none p-0 max-w-3xl mx-auto">
            {FOUR_REASONS.map((reason, i) => (
              <li key={reason.label}>
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
                    {String(i + 1).padStart(2, "0")}
                  </p>
                  <h3 className="font-heading text-lg md:text-xl text-off-white tracking-wide mb-2">
                    {reason.label.toUpperCase()}
                  </h3>
                  <p className="text-foreground-muted text-sm md:text-[15px] leading-relaxed">
                    {reason.body}
                  </p>
                </div>
              </li>
            ))}
          </ul>

          <p className="text-off-white text-center max-w-2xl mx-auto mt-10 md:mt-12 text-lg md:text-xl leading-relaxed">
            Plans give you workouts. This tells you the one reason none of them
            have moved your FTP &mdash; and what the next plan you start has to
            fix first.
          </p>

          <div className="mt-8 md:mt-10 text-center">
            <Link
              href={CTA_HREF}
              data-cta="mid"
              data-track="go_ads_four_reasons_cta"
              className={ctaButtonClass}
            >
              GET MY FREE DIAGNOSIS <CtaArrow />
            </Link>
            <p className="text-foreground-subtle text-xs mt-4">
              4 minutes &middot; No card
            </p>
          </div>
        </Container>
      </Section>

      <div className="gradient-divider" />

      {/* ── Who this is for ──────────────────────────────────────────── */}
      {/* Qualifier section. Sits after the four-cause framework (the
          reader now believes the diagnosis is specific, not generic) and
          before social proof (so the testimonials land on a reader who
          has already self-identified as the target rider). Highest-
          performing conversion element in the Precision Nutrition
          competitive teardown: serious riders opt in, tyre-kickers opt
          out. */}
      <Section background="deep-purple">
        <Container width="default">
          <p className="text-coral font-heading text-[11px] md:text-xs tracking-[0.3em] text-center mb-3">
            WHO THIS IS FOR
          </p>
          <h2
            className="font-heading text-off-white text-center mb-3"
            style={{ fontSize: "clamp(1.875rem, 4.5vw, 3rem)" }}
          >
            IS THIS FOR YOU?
          </h2>
          <p className="text-foreground-muted text-center max-w-lg mx-auto mb-10 md:mb-12 leading-relaxed">
            The Plateau Diagnostic is designed for a specific type of cyclist.
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
      {/* Same content spine as /go but with every outbound link removed
          — no testimonial.to "see all reviews", no podcast platform
          links, no Trustpilot review-site click-through. The Trustpilot
          card stays as a visual credibility cue rendered as a static
          element rather than an anchor. */}
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

          {/* Grid — remaining 4 testimonials */}
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
                    <p className="text-foreground-subtle text-xs">
                      {t.detail}
                    </p>
                  </figcaption>
                </figure>
              </li>
            ))}
          </ul>

          {/* Divider between member outcomes and podcast credibility */}
          <div className="mx-auto max-w-3xl mt-16 md:mt-20 mb-12 md:mb-14 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />

          {/* Podcast scale + experts — supporting credibility */}
          <p className="text-coral font-heading text-[11px] md:text-xs tracking-[0.3em] text-center mb-3">
            THE CREDENTIALS BEHIND THE METHOD
          </p>
          <h3
            className="font-heading text-off-white text-center mb-10 md:mb-12"
            style={{ fontSize: "clamp(1.5rem, 3.5vw, 2.25rem)" }}
          >
            THE CYCLING PODCAST THE PROS&rsquo; COACHES ACTUALLY COME ON
          </h3>

          {/* Stat row — podcast platform icons rendered as static
              decoration (no anchors). */}
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

          {/* Named experts */}
          <p className="text-foreground-muted text-center max-w-2xl mx-auto leading-relaxed mb-14 md:mb-16 text-sm md:text-base">
            Built on conversations with{" "}
            <span className="text-off-white">Prof. Stephen Seiler</span>,{" "}
            <span className="text-off-white">Dan Lorang</span>,{" "}
            <span className="text-off-white">Dr. David Dunne</span> and the
            coaches behind World Tour wins. Twelve questions, four plateau
            patterns, the changes that work &mdash; that&rsquo;s the
            diagnostic.
          </p>

          {/* Trustpilot strip — rendered as a static card. On /go this
              is wrapped in an anchor to trustpilot.com; here we keep
              only the visual element so the page has no outbound
              clicks. */}
          <div
            className="
              block max-w-xl mx-auto
              rounded-2xl border border-white/15 bg-white/[0.04]
              px-6 py-7 md:px-8 md:py-8
              shadow-[0_10px_30px_rgba(0,0,0,0.25)]
            "
          >
            <div className="flex flex-col items-center gap-3 text-center">
              <p className="font-heading text-foreground-muted text-[10px] md:text-xs tracking-[0.3em]">
                REVIEWED ON TRUSTPILOT
              </p>
              <div className="flex items-center gap-1.5 md:gap-2">
                <TrustpilotStar size={26} />
                <TrustpilotStar size={26} />
                <TrustpilotStar size={26} />
                <TrustpilotStar size={26} />
                <TrustpilotStar size={26} />
              </div>
              <div className="flex items-baseline gap-3 mt-1">
                <span className="font-heading text-off-white text-5xl md:text-6xl leading-none">
                  4.5
                </span>
                <span className="font-heading text-coral text-lg md:text-xl tracking-[0.2em]">
                  EXCELLENT
                </span>
              </div>
              <p className="text-foreground-muted text-sm">
                Verified on Trustpilot
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
            BEFORE YOU CLICK
          </p>
          <h2
            className="font-heading text-off-white text-center mb-10 md:mb-12"
            style={{ fontSize: "clamp(1.875rem, 4.5vw, 3rem)" }}
          >
            THE QUESTIONS I GET ASKED MOST
          </h2>
          {/* Checkbox-hack disclosure, identical to /go: zero JS, mobile
              collapsed, desktop expanded. */}
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
                    id={`go-ads-faq-${i + 1}`}
                    className="sr-only"
                  />
                  <label
                    data-track={`go_ads_faq_q${i + 1}`}
                    htmlFor={`go-ads-faq-${i + 1}`}
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
      {/* The page ends here. No legal footer, no /tools fallback, no
          outbound brand-verify link. The only thing left on screen is
          the CTA. */}
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
            STOP GUESSING.{" "}
            <span className="text-coral">START GETTING FASTER.</span>
          </h2>
          <p className="text-foreground-muted mb-10 max-w-md mx-auto leading-relaxed">
            Four minutes from now you&rsquo;ll have a specific answer for why
            your FTP has stalled &mdash; and the exact three steps to fix it.
          </p>
          <Link
            href={CTA_HREF}
            data-cta="bottom"
            data-track="go_ads_final_cta"
            className={ctaButtonClass}
          >
            GET MY FREE DIAGNOSIS <CtaArrow />
          </Link>
          <p className="text-foreground-subtle text-xs mt-5">
            Free &middot; No card &middot; 4 minutes &middot; No email needed
            to start
          </p>
        </Container>
      </section>
    </main>
  );
}
