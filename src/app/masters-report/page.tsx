import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/layout";
import { BRAND_STATS, FOUNDER, SITE_ORIGIN } from "@/lib/brand-facts";
import { MastersReportCapture } from "./_components/MastersReportCapture";

/**
 * /masters-report — lead-gen squeeze page for the Masters Cycling
 * Training Report 2026.
 *
 * Built in the /go family: dark backgrounds, coral accents, Bebas Neue
 * headers, Work Sans body. Single purpose — email in, report opens.
 *
 *  - No Header, no Footer, no nav links away. The page draws its own
 *    minimal logo top-left (unlinked) and a quiet legal footer at the
 *    bottom. Same pattern as /go.
 *  - Single delivery surface: a server-rendered teaser layout with one
 *    `MastersReportCapture` client form at the top and a second one at
 *    the bottom. Both post to /api/newsletter (the Beehiiv-wired
 *    endpoint) and redirect to the canonical blog URL on success.
 *  - `noindex` in layout.tsx so this funnel surface can't dilute or
 *    cannibalise the canonical /blog/masters-cycling-training-report-2026
 *    URL in organic search.
 *  - Three teaser findings are real, sourced from the report itself
 *    (Tanaka & Seals 2008 VO2max decline, masters protein dose,
 *    72-hour recovery between hard sessions). The "what's inside"
 *    stat strip mirrors the report's editorial scope.
 */

const TEASER_FINDINGS: ReadonlyArray<{
  stat: string;
  label: string;
  body: string;
}> = [
  {
    stat: "0.5%",
    label: "VO2max decline per year",
    body: "If you train. Closer to 1% per year if you don't. Compounded over twenty years that's the difference between still racing at 60 and not.",
  },
  {
    stat: "72 HOURS",
    label: "Between hard sessions after 40",
    body: "Recovery capacity isn't broken at 45 — it's longer. Programming the gap is where masters athletes either keep gaining or accumulate fatigue until something gives.",
  },
  {
    stat: "1.6–2.2 G/KG",
    label: "Protein per day, four feedings",
    body: "Older athletes show anabolic resistance and need 40–50% more protein per meal than younger athletes to hit the same muscle protein synthesis response.",
  },
  {
    stat: "+43 WATTS",
    label: "Niall, 41 — FTP gain in 16 weeks",
    body: "Six years stuck at 218 watts. Audit showed 55% of his time in the grey zone. Fewer total hours, better distribution. First real movement in six years.",
  },
];

const INSIDE_STATS: ReadonlyArray<{
  value: string;
  label: string;
}> = [
  { value: "18", label: "Sections, head-to-toe" },
  { value: "40+", label: "Peer-reviewed citations" },
  { value: "5", label: "Named case studies" },
  { value: "12-WEEK", label: "Block you can run on Monday" },
];

const SECTION_HIGHLIGHTS: ReadonlyArray<string> = [
  "What actually declines after 35, 45, 55 — and what doesn't",
  "How much Zone 2 you actually need (most masters get this wrong)",
  "Intensity dose that still works after 40 — and the one that's wasted",
  "Strength training: why it's non-negotiable, and the exact programme",
  "Perimenopause and menopause — the section nobody writes properly",
  "Recovery architecture: sleep, HRV, the 2:1 loading model",
  "Protein, fuelling, body composition — the numbers in plain English",
  "A 12-week sample block, with weekly session prescriptions",
  "Five named case studies — riders 41 to 52, real numbers, real plans",
  "The masters mistakes I see every week (and how to fix them)",
];

export default function MastersReportSqueezePage() {
  return (
    <main
      id="main-content"
      className="bg-charcoal text-off-white"
    >
      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section
        className="
          relative overflow-hidden
          pt-24 pb-16 md:pt-28 md:pb-20
          bg-charcoal grain-overlay
        "
      >
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

        {/* Brand mark — decorative, unlinked, same pattern as /go. */}
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
            FREE REPORT &middot; FOR CYCLISTS 35+ STILL CHASING WATTS
          </p>

          <h1 className="font-heading text-off-white mb-6 leading-[0.95]">
            <span
              className="block"
              style={{ fontSize: "clamp(2.5rem, 7vw, 5.5rem)" }}
            >
              THE MASTERS CYCLING
            </span>
            <span
              className="block mt-1 text-coral"
              style={{ fontSize: "clamp(2.5rem, 7vw, 5.5rem)" }}
            >
              TRAINING REPORT 2026
            </span>
          </h1>

          <p className="text-foreground-muted text-base md:text-xl leading-relaxed mb-9 max-w-xl mx-auto">
            The 2026 reference for training after 40. What actually
            declines, what doesn&rsquo;t, and the training that holds up
            &mdash; built from 1,400+ conversations with World Tour coaches
            and the peer-reviewed evidence behind them.
          </p>

          <MastersReportCapture position="hero" />

          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-foreground-subtle text-xs md:text-sm mt-6 px-4">
            <span className="whitespace-nowrap">Free</span>
            <span className="opacity-40">&middot;</span>
            <span className="whitespace-nowrap">18 sections</span>
            <span className="opacity-40">&middot;</span>
            <span className="whitespace-nowrap">40+ citations</span>
            <span className="opacity-40">&middot;</span>
            <span className="whitespace-nowrap">Opens straight to the report</span>
          </div>
        </Container>
      </section>

      {/* ── Credibility ribbon ───────────────────────────────────── */}
      <section
        aria-label="Roadman Cycling at a glance"
        className="bg-deep-purple border-y border-white/5"
      >
        <Container width="default">
          <ul className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-x-8 md:gap-x-12 list-none p-0 py-5 md:py-6 text-center">
            <li className="flex items-center gap-2 font-heading text-[11px] md:text-[12px] tracking-[0.18em] text-off-white/85">
              <span className="text-coral">100M+</span>
              <span className="text-foreground-muted">PODCAST DOWNLOADS</span>
            </li>
            <li
              aria-hidden="true"
              className="hidden sm:block h-3 w-px bg-white/15"
            />
            <li className="flex items-center gap-2 font-heading text-[11px] md:text-[12px] tracking-[0.18em] text-off-white/85">
              <span className="text-coral">{BRAND_STATS.episodeCountLabel}</span>
              <span className="text-foreground-muted">EPISODES RECORDED</span>
            </li>
            <li
              aria-hidden="true"
              className="hidden sm:block h-3 w-px bg-white/15"
            />
            <li className="font-heading text-[11px] md:text-[12px] tracking-[0.18em] text-foreground-muted">
              BUILT ON CONVERSATIONS WITH{" "}
              <span className="text-off-white">SEILER</span>,{" "}
              <span className="text-off-white">LORANG</span>,{" "}
              <span className="text-off-white">FRIEL</span>
            </li>
          </ul>
        </Container>
      </section>

      {/* ── Teaser findings ──────────────────────────────────────── */}
      <section className="relative bg-charcoal py-20 md:py-24">
        <Container width="default">
          <div className="text-center mb-12 md:mb-14">
            <p className="text-coral font-heading text-[11px] md:text-xs tracking-[0.3em] mb-3">
              FOUR FINDINGS, STRAIGHT FROM THE REPORT
            </p>
            <h2
              className="font-heading text-off-white"
              style={{ fontSize: "clamp(1.875rem, 4.5vw, 3rem)" }}
            >
              THE THINGS YOU&rsquo;VE BEEN GETTING WRONG
            </h2>
          </div>

          <ul className="grid sm:grid-cols-2 gap-4 md:gap-5 list-none p-0 max-w-4xl mx-auto">
            {TEASER_FINDINGS.map((finding) => (
              <li key={finding.label}>
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
                  <p className="font-heading text-coral text-2xl md:text-3xl leading-none mb-2 tracking-wide">
                    {finding.stat}
                  </p>
                  <p className="font-heading text-off-white text-sm md:text-base tracking-wide mb-2">
                    {finding.label.toUpperCase()}
                  </p>
                  <p className="text-foreground-muted text-sm md:text-[15px] leading-relaxed">
                    {finding.body}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <div className="gradient-divider" />

      {/* ── Inside the report ────────────────────────────────────── */}
      <section className="relative bg-deep-purple grain-overlay py-20 md:py-24">
        <Container width="default">
          <div className="text-center mb-10 md:mb-12">
            <p className="text-coral font-heading text-[11px] md:text-xs tracking-[0.3em] mb-3">
              INSIDE THE REPORT
            </p>
            <h2
              className="font-heading text-off-white"
              style={{ fontSize: "clamp(1.875rem, 4.5vw, 3rem)" }}
            >
              EVERYTHING THAT MATTERS, IN ONE PLACE
            </h2>
          </div>

          <dl className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-3xl mx-auto mb-12 md:mb-14">
            {INSIDE_STATS.map((s) => (
              <div key={s.label} className="text-center">
                <dt className="font-heading text-3xl md:text-5xl text-coral leading-none">
                  {s.value}
                </dt>
                <dd className="text-foreground-muted text-xs md:text-sm mt-2 leading-snug">
                  {s.label}
                </dd>
              </div>
            ))}
          </dl>

          <ul className="grid sm:grid-cols-2 gap-x-8 gap-y-3 max-w-3xl mx-auto list-none p-0 text-foreground-muted text-[15px] md:text-base leading-relaxed">
            {SECTION_HIGHLIGHTS.map((s) => (
              <li key={s} className="flex items-start gap-3">
                <span
                  aria-hidden="true"
                  className="mt-2 inline-block w-1.5 h-1.5 rounded-full bg-coral shrink-0"
                />
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <div className="gradient-divider" />

      {/* ── Final capture ────────────────────────────────────────── */}
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
            className="font-heading text-off-white mb-5 leading-tight"
            style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)" }}
          >
            WHERE DO I{" "}
            <span className="text-coral">SEND IT?</span>
          </h2>
          <p className="text-foreground-muted mb-9 max-w-md mx-auto leading-relaxed">
            Drop your email. The report opens straight away &mdash; no
            inbox-hunting, no double opt-in. You&rsquo;ll also get the
            Saturday Spin newsletter. One-click unsubscribe.
          </p>

          <MastersReportCapture position="footer" />

          <p className="text-foreground-subtle text-xs mt-8">
            Already a subscriber?{" "}
            <Link
              href="/blog/masters-cycling-training-report-2026"
              className="text-foreground-muted underline decoration-foreground-subtle underline-offset-2 hover:text-coral hover:decoration-coral transition-colors"
            >
              Read the report without the form
            </Link>
            .
          </p>
        </Container>
      </section>

      {/* ── Minimal legal footer ─────────────────────────────────── */}
      <footer className="bg-charcoal border-t border-white/5 py-8">
        <Container width="default">
          <div className="flex flex-col items-center gap-3 text-center">
            <a
              href={SITE_ORIGIN}
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground-muted text-xs tracking-[0.18em] uppercase hover:text-coral transition-colors"
            >
              {SITE_ORIGIN.replace(/^https?:\/\//, "")}
            </a>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 w-full text-foreground-subtle text-xs">
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
          </div>
        </Container>
      </footer>
    </main>
  );
}
