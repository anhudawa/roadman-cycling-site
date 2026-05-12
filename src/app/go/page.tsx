import Image from "next/image";
import Link from "next/link";
import { Container, Section } from "@/components/layout";
import { BRAND_STATS, FOUNDER } from "@/lib/brand-facts";

/**
 * /go — PPC landing page for Google Ads cold traffic.
 *
 * This is NOT the canonical /plateau diagnostic landing page. It is a
 * stripped-down, single-CTA surface that exists to bridge ad click to
 * diagnostic start. Conversion logic on this page:
 *
 *  - No Header, no Footer, no mini-player, no exit-intent, no cohort
 *    banner — every distraction would compete with the one button.
 *  - Single CTA, repeated three times, all pointing to /plateau where
 *    the actual diagnostic flow lives. The diagnostic is the entry
 *    point to the Not Done Yet community sales motion (email nurture
 *    after the result).
 *  - Pure server-rendered: no framer-motion ScrollReveal, no Suspense,
 *    no per-request DB queries. The whole page should be on the wire
 *    in one round trip so it lands fast on mobile 4G.
 *  - `noindex` (set in layout.tsx) so it doesn't compete with
 *    /plateau in organic search.
 *
 * Copy is identity-led — "Not Done Yet" framing, not feature-led.
 * The hook is the user's exact words: FTP stuck, training isn't
 * working, you know there's more in you.
 */

// Source param flows through to the diagnostic so attribution survives
// the page hop. The Tracker.tsx data-track attributes also fire a
// cta_click event with the specific position on this page.
const CTA_HREF = "/plateau?source=go";

const PAIN_BULLETS = [
  "You're putting in the hours, but the FTP number won't move.",
  "You've tried plans from YouTube, TrainerRoad, magazines — and you're still stuck.",
  "You're 40-plus and you can feel the punch fading on the climbs and the sprints.",
  "You don't want another generic plan. You want to know what's actually wrong.",
];

const FOUR_REASONS = [
  {
    label: "Under-recovered",
    body: "You're doing the training. You're not getting the adaptation. Sleep, life stress and back-to-back hard sessions are eating the gains.",
  },
  {
    label: "Grey-zone trap",
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

const MEMBER_RESULTS = [
  {
    stat: "+90W",
    label: "FTP gain",
    quote:
      "I'd been stuck on 205 watts for two seasons. Six months in I tested 295. I'm racing again.",
    name: "Damien Maloney",
    detail: "Ireland · FTP 205w → 295w",
  },
  {
    stat: "3 → 1",
    label: "Category jump",
    quote:
      "I went from Cat 3 to Cat 1 in a year. The diagnosis told me exactly what I'd been doing wrong.",
    name: "Daniel Stone",
    detail: "Roadman Cycling Club · Category jump",
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

export default function GoLandingPage() {
  return (
    <main id="main-content" className="bg-charcoal">
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section
        className="
          relative overflow-hidden
          min-h-[88vh] md:min-h-[92vh] flex items-center
          pt-16 pb-16 md:pt-24 md:pb-24
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

        <Container width="narrow" className="relative text-center">
          <p className="text-coral font-heading text-[11px] md:text-xs tracking-[0.3em] mb-6">
            FOR CYCLISTS WHO REFUSE TO PLATEAU
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
            Twelve questions. Four minutes. A specific answer for why your
            progress has stalled &mdash; and the exact fix, written for riders
            who train 6 to 12 hours a week around a real life.
          </p>

          <Link
            href={CTA_HREF}
            data-cta="hero"
            data-track="go_hero_cta"
            className={ctaButtonClass}
          >
            FIND OUT WHY <CtaArrow />
          </Link>

          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-foreground-subtle text-xs md:text-sm mt-5 px-4">
            <span className="whitespace-nowrap">Free</span>
            <span className="opacity-40">&middot;</span>
            <span className="whitespace-nowrap">No card</span>
            <span className="opacity-40">&middot;</span>
            <span className="whitespace-nowrap">4 minutes</span>
          </div>

          {/* Built-by strip — Anthony presence above the fold */}
          <div className="mt-10 md:mt-12 inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.03] backdrop-blur-sm py-2 pl-2 pr-5 max-w-full">
            <span className="relative w-9 h-9 rounded-full overflow-hidden shrink-0 border border-white/15">
              <Image
                src="/images/about/anthony-profile-closeup-v2.jpg"
                alt="Anthony Walsh — host, Roadman Cycling"
                fill
                sizes="36px"
                priority
                className="object-cover"
              />
            </span>
            <span className="text-left text-foreground-muted text-xs md:text-sm leading-snug">
              Built by{" "}
              <span className="text-off-white">Anthony Walsh</span> from{" "}
              <span className="text-off-white">
                {BRAND_STATS.episodeCountLabel}
              </span>{" "}
              conversations with World Tour coaches and sports scientists.
            </span>
          </div>
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
            THE PLATEAU NOBODY HAS BEEN ABLE TO EXPLAIN
          </h2>

          <ul className="space-y-3 md:space-y-4 list-none p-0 max-w-xl mx-auto">
            {PAIN_BULLETS.map((line) => (
              <li
                key={line}
                className="flex items-start gap-3 text-foreground-muted text-base md:text-lg leading-relaxed"
              >
                <span
                  aria-hidden="true"
                  className="mt-2 inline-block w-2 h-2 rounded-full bg-coral shrink-0"
                />
                <span>{line}</span>
              </li>
            ))}
          </ul>

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
            THE FOUR
          </p>
          <h2
            className="font-heading text-off-white text-center mb-3"
            style={{ fontSize: "clamp(1.875rem, 4.5vw, 3rem)" }}
          >
            YOUR PLATEAU IS ONE OF THESE.
          </h2>
          <p className="text-foreground-muted text-center max-w-lg mx-auto mb-10 md:mb-12 leading-relaxed">
            Each one has a specific cause and a specific fix. Twelve questions
            tells us which is yours.
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

          <div className="mt-10 md:mt-12 text-center">
            <Link
              href={CTA_HREF}
              data-cta="mid"
              data-track="go_four_reasons_cta"
              className={ctaButtonClass}
            >
              FIND OUT WHICH IS MINE <CtaArrow />
            </Link>
            <p className="text-foreground-subtle text-xs mt-4">
              4 minutes &middot; No card
            </p>
          </div>
        </Container>
      </Section>

      <div className="gradient-divider" />

      {/* ── Social proof ─────────────────────────────────────────────── */}
      <Section background="deep-purple" grain>
        <Container width="default">
          <p className="text-coral font-heading text-[11px] md:text-xs tracking-[0.3em] text-center mb-3">
            WHY TRUST THIS
          </p>
          <h2
            className="font-heading text-off-white text-center mb-10 md:mb-12"
            style={{ fontSize: "clamp(1.875rem, 4.5vw, 3rem)" }}
          >
            THE WORLD&rsquo;S LARGEST CYCLING PERFORMANCE PODCAST
          </h2>

          {/* Stat row */}
          <dl className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-12 max-w-3xl mx-auto">
            <div className="text-center">
              <dt className="font-heading text-3xl md:text-5xl text-coral leading-none">
                100M+
              </dt>
              <dd className="text-foreground-subtle text-xs md:text-sm mt-2">
                Podcast downloads
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
          <p className="text-foreground-muted text-center max-w-2xl mx-auto leading-relaxed mb-12 md:mb-14 text-sm md:text-base">
            Built on on-the-record conversations with{" "}
            <span className="text-off-white">Prof. Stephen Seiler</span>,{" "}
            <span className="text-off-white">Dan Lorang</span>,{" "}
            <span className="text-off-white">Dr. David Dunne</span> and the
            coaches behind the riders winning at the World Tour. The
            diagnostic is that pattern recognition, distilled.
          </p>

          {/* Member results */}
          <ul className="grid md:grid-cols-2 gap-4 md:gap-5 list-none p-0 max-w-3xl mx-auto">
            {MEMBER_RESULTS.map((t) => (
              <li key={t.name}>
                <figure
                  className="
                    h-full rounded-2xl bg-charcoal
                    border border-white/10 p-5 md:p-6
                    flex flex-col
                  "
                >
                  <div className="mb-4 inline-flex items-center self-start gap-2 rounded-full bg-coral/10 border border-coral/30 px-3 py-1">
                    <span className="font-heading text-coral text-base tracking-wide">
                      {t.stat}
                    </span>
                    <span className="text-foreground-muted text-xs">
                      {t.label}
                    </span>
                  </div>
                  <blockquote className="text-off-white text-[15px] md:text-base leading-relaxed flex-1">
                    &ldquo;{t.quote}&rdquo;
                  </blockquote>
                  <figcaption className="mt-4 pt-4 border-t border-white/10">
                    <p className="font-heading text-off-white tracking-wide">
                      {t.name.toUpperCase()}
                    </p>
                    <p className="text-foreground-subtle text-xs mt-1">
                      {t.detail}
                    </p>
                  </figcaption>
                </figure>
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      <div className="gradient-divider" />

      {/* ── Final CTA ────────────────────────────────────────────────── */}
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
            data-track="go_final_cta"
            className={ctaButtonClass}
          >
            FIND OUT WHY <CtaArrow />
          </Link>
          <p className="text-foreground-subtle text-xs mt-5">
            Free &middot; No card &middot; 4 minutes &middot; Email only when
            you want the result
          </p>
        </Container>
      </section>

      {/* ── Minimal legal footer ─────────────────────────────────────── */}
      <footer className="bg-charcoal border-t border-white/5 py-8">
        <Container width="default">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-foreground-subtle text-xs">
            <p>
              &copy; {new Date().getFullYear()} Roadman Cycling &middot;{" "}
              {FOUNDER.location}
            </p>
            <div className="flex items-center gap-4">
              <Link
                href="/privacy"
                className="hover:text-coral transition-colors"
              >
                Privacy
              </Link>
              <Link
                href="/terms"
                className="hover:text-coral transition-colors"
              >
                Terms
              </Link>
            </div>
          </div>
        </Container>
      </footer>
    </main>
  );
}
