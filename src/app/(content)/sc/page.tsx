import type { Metadata } from "next";
import Link from "next/link";
import { PROGRAMME, PHASES } from "@/lib/sc-programme";

export const metadata: Metadata = {
  title: "Strength & Conditioning for Cyclists — 12-Week Periodised Programme | Roadman Cycling",
  description:
    "The only cycling-specific S&C programme built by experts who coach World Tour riders. 12 weeks, periodised through GPP, Strength, and Power. Push/Pull split. Video demos. Core + stretching. $95 one-time, lifetime access.",
  alternates: { canonical: "https://roadmancycling.com/sc" },
  openGraph: {
    title: "Strength & Conditioning for Cyclists — 12-Week Programme",
    description:
      "12-week periodised S&C built for serious cyclists. Push/Pull split, video demos, core training, stretching. $95 one-time.",
    type: "website",
    url: "https://roadmancycling.com/sc",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Roadman Cycling S&C" }],
  },
};

/* ------------------------------------------------------------------ */
/*  Phase colour mapping                                               */
/* ------------------------------------------------------------------ */

const PHASE_COLOURS: Record<string, { bg: string; text: string; border: string }> = {
  gpp: { bg: "bg-[#4C1273]", text: "text-[#4C1273]", border: "border-[#4C1273]" },
  deload: { bg: "bg-[#545559]", text: "text-[#545559]", border: "border-[#545559]" },
  strength: { bg: "bg-[#F16363]", text: "text-[#F16363]", border: "border-[#F16363]" },
  power: { bg: "bg-[#4AAE8C]", text: "text-[#4AAE8C]", border: "border-[#4AAE8C]" },
};

/* ------------------------------------------------------------------ */
/*  Static data                                                        */
/* ------------------------------------------------------------------ */

const COMPETITORS = [
  { name: "BaseCamp", price: "$279–329", model: "One-time" },
  { name: "Dialed Health", price: "$30/mo", model: "Subscription" },
  { name: "CTS", price: "$25/mo", model: "Subscription" },
  { name: "Dylan Johnson", price: "$79–99", model: "One-time" },
  { name: "Roadman", price: "$95", model: "One-time, lifetime", highlight: true },
];

const FAQS = [
  {
    q: "Do I need a gym membership?",
    a: "No. The programme is designed around equipment you can use at home or in any gym. Dumbbells, a stability ball, and a bench cover the vast majority of exercises. If you train at a gym, you'll use the trap bar and cable machines for a few movements — but home alternatives are noted throughout.",
  },
  {
    q: "Will this interfere with my riding?",
    a: "The programme is periodised specifically to complement your cycling. Two sessions per week — a push day and a pull day — with built-in deload weeks at 5 and 9. The loading is designed so your legs are never wrecked before a key ride. Most riders in our community do S&C on the same day as an easy ride or on a rest day.",
  },
  {
    q: "I'm over 50. Is this appropriate for me?",
    a: "Yes — and it's arguably more important for you than for a 30-year-old. Strength training after 40 is the single most effective intervention against the muscle loss and bone density decline that comes with age. Every exercise has tempo and rest guidance. There are no maximal lifts, no Olympic lifts, nothing that puts you at unnecessary risk.",
  },
  {
    q: "How is this different from a generic gym programme?",
    a: "Every exercise is chosen for direct on-bike transfer. The periodisation matches a cycling training calendar — GPP in the off-season, strength in the build phase, power as you approach your target events. Generic gym programmes don't account for your riding volume, and they load your legs on days when you need them fresh.",
  },
  {
    q: "What if I've never done strength training before?",
    a: "The GPP phase (weeks 1–4) starts with foundational movement patterns at moderate loads. Video demos show exact form for every exercise. The programme builds progressively — you won't be thrown into heavy lifts on day one.",
  },
  {
    q: "Is this a subscription?",
    a: "No. $95, one payment, lifetime access. No recurring charges. No content locked behind tiers. You get the full 12-week programme, every video demo, core training, and stretching guide — permanently.",
  },
];

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function SCLandingPage() {
  return (
    <div className="font-body">
      {/* ============================================================ */}
      {/*  HERO — Identity-led, not feature-led                        */}
      {/* ============================================================ */}
      <section className="relative bg-deep-purple overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 opacity-30"
          aria-hidden="true"
          style={{
            background:
              "radial-gradient(ellipse 60% 50% at 50% 30%, rgba(76,18,115,0.6) 0%, transparent 70%)",
          }}
        />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 sm:py-32 lg:py-40">
          <div className="max-w-3xl">
            <p className="text-coral font-heading text-sm tracking-widest mb-6">
              FROM THE ROADMAN CYCLING PODCAST · 100M+ DOWNLOADS
            </p>
            <h1 className="font-heading leading-[0.9]" style={{ fontSize: "clamp(2.75rem, 7vw, 6rem)" }}>
              THE S&amp;C PROGRAMME
              <br />
              <span className="text-coral">CYCLISTS ACTUALLY NEED.</span>
            </h1>

            <p className="mt-8 text-lg sm:text-xl text-foreground-muted max-w-2xl leading-relaxed">
              12 weeks. Two sessions per week. Periodised to peak when you do.
              Built from conversations with the coaches behind Grand Tour wins —
              adapted for serious amateurs with 8–12 hours a week on the bike.
            </p>

            <p className="mt-4 text-base text-foreground-muted max-w-2xl leading-relaxed">
              <span className="text-off-white font-medium">$95 one-time.</span>{" "}
              Lifetime access. No subscription.
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <a
                href="#pricing"
                className="inline-flex items-center gap-2 font-heading text-base tracking-wide bg-coral hover:bg-coral/90 text-off-white px-8 py-4 rounded-md transition-colors"
              >
                GET THE PROGRAMME
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3" />
                </svg>
              </a>
              <Link
                href="/sc/programme"
                className="inline-flex items-center gap-2 font-heading text-base tracking-wide border border-white/20 hover:border-white/40 text-off-white px-8 py-4 rounded-md transition-colors"
              >
                PREVIEW THE PROGRAMME
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  PROBLEM — Why most cyclists skip S&C (and pay for it)       */}
      {/* ============================================================ */}
      <section className="bg-charcoal py-20 sm:py-28">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h2
            className="font-heading text-off-white mb-8"
            style={{ fontSize: "var(--text-section)" }}
          >
            YOU ALREADY KNOW
            <br />
            <span className="text-coral">YOU SHOULD BE DOING THIS.</span>
          </h2>

          <div className="space-y-6 text-foreground-muted text-lg leading-relaxed">
            <p>
              You&apos;ve read the articles. You&apos;ve heard the coaches on the podcast.
              Professor Seiler, Dan Lorang, the strength researchers — they all say the
              same thing: cyclists who add structured strength work get faster, stay
              healthier, and ride longer into their careers.
            </p>
            <p>
              And yet. You open YouTube, find a &ldquo;gym workout for cyclists&rdquo;
              video, do it twice, and stop. The exercises feel random. You&apos;re not
              sure if you&apos;re doing them right. You don&apos;t know how they fit
              around your riding. Three weeks later the gym bag is back under the stairs.
            </p>
            <p className="text-off-white font-medium">
              The problem was never motivation. It was the programme.
            </p>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  THE COST OF NOT DOING S&C                                   */}
      {/* ============================================================ */}
      <section className="bg-[#210140] py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2
            className="font-heading text-off-white text-center mb-4"
            style={{ fontSize: "var(--text-section)" }}
          >
            WHAT HAPPENS WHEN YOU DON&apos;T.
          </h2>
          <p className="text-foreground-muted text-center max-w-2xl mx-auto text-lg mb-14">
            Every year without structured strength work compounds. These are the
            problems we see in cyclists over 35 who ride without an off-bike programme.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                stat: "1.5–2%",
                label: "muscle mass lost per year after 40",
                body: "Without resistance training, your body breaks down the fast-twitch fibres you need for sprints, climbs, and closing gaps. The watts disappear so slowly you don't notice until someone you used to drop starts riding away from you.",
              },
              {
                stat: "Lower back",
                label: "the #1 complaint in amateur cycling",
                body: "Weak glutes and a dormant core force your lower back to stabilise every pedal stroke. Over a four-hour ride, that's 20,000+ revolutions loading a structure that was never designed to be the primary stabiliser.",
              },
              {
                stat: "Plateau",
                label: "the FTP ceiling S&C breaks through",
                body: "You can only improve aerobic fitness so far before neuromuscular capacity becomes the limiter. Riders who add structured S&C often see FTP jumps they hadn't managed in years of riding alone — because the engine finally has a chassis to match.",
              },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-xl border border-white/10 p-6 sm:p-8"
                style={{ backgroundColor: "rgba(255,255,255,0.03)" }}
              >
                <p className="font-heading text-coral text-3xl sm:text-4xl leading-none mb-2">
                  {item.stat}
                </p>
                <p className="font-heading text-off-white text-sm tracking-wide uppercase mb-4">
                  {item.label}
                </p>
                <p className="text-foreground-muted text-sm leading-relaxed">
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  THE PROGRAMME — What makes this different                    */}
      {/* ============================================================ */}
      <section className="bg-charcoal py-20 sm:py-28">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <p className="text-coral font-heading text-xs tracking-widest mb-4">
            WHAT YOU GET
          </p>
          <h2
            className="font-heading text-off-white mb-8"
            style={{ fontSize: "var(--text-section)" }}
          >
            NOT A RANDOM COLLECTION
            <br />
            <span className="text-coral">OF GYM EXERCISES.</span>
          </h2>

          <div className="space-y-6 text-foreground-muted text-lg leading-relaxed">
            <p>
              This is a 12-week periodised programme with a clear structure:
              four weeks of GPP to build your movement foundation, a deload,
              four weeks of strength work with progressive overload, another
              deload, then four weeks of power development timed to peak
              for your target events.
            </p>
            <p>
              Every session follows a Push/Pull split — two days per week, each
              taking 45–60 minutes. The exercises are cycling-specific: goblet
              squats, Bulgarian split squats, trap-bar deadlifts, single-leg
              work that mirrors the unilateral demands of pedalling. Nothing
              is in here because it looks good on Instagram.
            </p>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  PHASE CARDS                                                 */}
      {/* ============================================================ */}
      <section className="bg-deep-purple py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2
            className="font-heading text-off-white text-center"
            style={{ fontSize: "var(--text-section)" }}
          >
            FOUR PHASES. ONE DIRECTION.
          </h2>
          <p className="mt-4 text-foreground-muted text-center max-w-2xl mx-auto text-lg">
            Volume drops as intensity climbs. Your body adapts, then peaks.
          </p>

          <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {PHASES.map((phase) => {
              const colours = PHASE_COLOURS[phase.phase];
              return (
                <div
                  key={phase.phase}
                  className="rounded-xl border border-white/10 p-6 flex flex-col"
                  style={{ backgroundColor: "#2E2E30" }}
                >
                  <span
                    className={`inline-block self-start font-heading text-xs tracking-wider px-3 py-1 rounded-full ${colours.bg} text-off-white mb-4`}
                  >
                    {phase.label.toUpperCase()}
                  </span>
                  <p className="text-foreground-muted text-sm font-body mb-4">
                    Weeks {phase.weeks}
                  </p>
                  <p className="text-off-white text-sm leading-relaxed flex-1">
                    {phase.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  12-WEEK TIMELINE                                            */}
      {/* ============================================================ */}
      <section className="bg-charcoal py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2
            className="font-heading text-off-white text-center"
            style={{ fontSize: "var(--text-section)" }}
          >
            12 WEEKS AT A GLANCE
          </h2>

          <div className="mt-14 overflow-x-auto scrollbar-hide -mx-4 px-4">
            <div className="flex gap-3 min-w-max pb-4">
              {PROGRAMME.map((week) => {
                const colours = PHASE_COLOURS[week.phase];
                return (
                  <Link
                    key={week.weekNumber}
                    href={`/sc/programme/week/${week.weekNumber}`}
                    className={`flex flex-col items-center rounded-lg border ${colours.border} border-opacity-40 px-4 py-5 min-w-[80px] hover:bg-white/5 transition-colors`}
                    style={{ backgroundColor: "rgba(255,255,255,0.03)" }}
                  >
                    <span className="text-foreground-muted text-xs font-body mb-2">WK</span>
                    <span className="font-heading text-2xl text-off-white">{week.weekNumber}</span>
                    <span className={`mt-2 inline-block w-3 h-3 rounded-full ${colours.bg}`} aria-label={week.phaseLabel} />
                    <span className="mt-2 text-foreground-muted text-[11px] font-body">{week.phaseLabel}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="mt-8 flex flex-wrap justify-center gap-6">
            {PHASES.map((phase) => {
              const colours = PHASE_COLOURS[phase.phase];
              return (
                <div key={phase.phase} className="flex items-center gap-2">
                  <span className={`inline-block w-3 h-3 rounded-full ${colours.bg}`} />
                  <span className="text-foreground-muted text-sm font-body">{phase.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  WHAT'S INCLUDED — Expanded                                  */}
      {/* ============================================================ */}
      <section className="bg-[#210140] py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2
            className="font-heading text-off-white text-center"
            style={{ fontSize: "var(--text-section)" }}
          >
            EVERYTHING YOU NEED.
            <br />
            <span className="text-coral">NOTHING YOU DON&apos;T.</span>
          </h2>

          <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: "Push/Pull Split",
                body: "Two sessions per week, intelligently structured around push and pull movement patterns so you can slot them around your riding without wrecking your legs.",
                icon: "M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5",
              },
              {
                title: "Progressive Overload",
                body: "Systematic rep and load progression across 12 weeks. Reps decrease and intensity increases as you move from GPP through to Power. No guessing.",
                icon: "M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941",
              },
              {
                title: "Core Circuits",
                body: "Dedicated core work that progresses weekly. Six exercises per circuit, building from 10 reps to 20 reps. The trunk stability that transfers directly to the pedals.",
                icon: "M21 7.5l-2.25-1.313M21 7.5v2.25m0-2.25l-2.25 1.313M3 7.5l2.25-1.313M3 7.5l2.25 1.313M3 7.5v2.25m9 3l2.25-1.313M12 12.75l-2.25-1.313M12 12.75V15m0 6.75l2.25-1.313M12 21.75V19.5m0 2.25l-2.25-1.313m0-16.875L12 2.25l2.25 1.313M21 14.25v2.25l-2.25 1.313m-13.5 0L3 16.5v-2.25",
              },
              {
                title: "Stretching & Mobility",
                body: "Eight targeted stretches covering every muscle group cyclists hammer on the bike. Dynamic warmups before every session. Foam rolling protocols for recovery.",
                icon: "M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z",
              },
              {
                title: "Video Demos",
                body: "Exercise demonstrations filmed by Anthony for every key movement. Not stock footage from a library — real coaching cues for real cyclists.",
                icon: "m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25z",
              },
              {
                title: "Built-In Tracking",
                body: "Log your sets and reps directly in the programme. Track your progress week to week. See exactly where you are in the 12-week block at a glance.",
                icon: "M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="rounded-xl border border-white/10 p-6"
                style={{ backgroundColor: "rgba(255,255,255,0.03)" }}
              >
                <div className="mb-4">
                  <svg className="w-8 h-8 text-coral" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={feature.icon} />
                  </svg>
                </div>
                <h3 className="font-heading text-xl text-off-white mb-2">{feature.title}</h3>
                <p className="text-foreground-muted text-sm leading-relaxed">{feature.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  WHO THIS IS FOR                                             */}
      {/* ============================================================ */}
      <section className="bg-charcoal py-20 sm:py-28">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h2
            className="font-heading text-off-white mb-10"
            style={{ fontSize: "var(--text-section)" }}
          >
            BUILT FOR CYCLISTS
            <br />
            <span className="text-coral">WHO TRAIN SERIOUSLY.</span>
          </h2>

          <div className="space-y-8">
            {[
              {
                who: "The plateau-stuck racer",
                body: "Your FTP hasn't moved in six months. You've done every interval protocol. The limiter might not be your aerobic system — it might be the chassis underneath it. Neuromuscular capacity sets the ceiling that aerobic fitness alone can't break through.",
              },
              {
                who: "The masters cyclist (35–55+)",
                body: "You're losing muscle mass whether you train or not. The question is how fast. Two sessions a week of structured resistance work is the single most evidence-backed intervention for preserving power output, bone density, and injury resilience as you age.",
              },
              {
                who: "The rider with recurring niggles",
                body: "Lower back after long rides. Knee pain on climbs. IT band tightness that won't shift. Most cycling injuries aren't impact injuries — they're repetitive-strain injuries caused by muscles that aren't strong enough for the load you're asking of them.",
              },
              {
                who: "The comeback athlete",
                body: "You used to be fit. Life got in the way. Coming back to cycling without an S&C foundation is how injuries happen — your cardiovascular fitness returns faster than your structural strength, and the gap between what you want to do and what your body can handle is where things break.",
              },
            ].map((persona) => (
              <div
                key={persona.who}
                className="border-l-2 border-coral pl-6"
              >
                <p className="font-heading text-off-white text-lg tracking-wide mb-2">
                  {persona.who.toUpperCase()}
                </p>
                <p className="text-foreground-muted leading-relaxed">
                  {persona.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  AUTHORITY — Why Roadman                                     */}
      {/* ============================================================ */}
      <section className="bg-deep-purple py-20 sm:py-28">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <p className="text-coral font-heading text-xs tracking-widest mb-4">
            WHY THIS PROGRAMME
          </p>
          <h2
            className="font-heading text-off-white mb-8"
            style={{ fontSize: "var(--text-section)" }}
          >
            BUILT FROM 1,400+ CONVERSATIONS
            <br />
            <span className="text-coral">WITH THE BEST IN THE SPORT.</span>
          </h2>

          <div className="space-y-6 text-foreground-muted text-lg leading-relaxed">
            <p>
              This programme didn&apos;t come from a textbook. It came from years of
              conversations with the coaches and scientists behind Grand Tour wins —
              Dan Lorang at Lidl-Trek, Professor Stephen Seiler, strength
              researchers working with pro teams — and from coaching hundreds of
              serious amateurs inside the Not Done Yet community.
            </p>
            <p>
              Every exercise selection, every tempo prescription, every progression
              choice is grounded in what actually works for time-crunched cyclists
              over 35 who need to get stronger without burning themselves out.
            </p>
            <p>
              The old S&amp;C programme on ClickFunnels had 114 members and a 4%
              completion rate. This rebuild exists because those numbers weren&apos;t
              good enough. A programme that people don&apos;t finish is a programme
              that doesn&apos;t work — so we rebuilt the entire experience from scratch.
            </p>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  COMPETITOR COMPARISON                                       */}
      {/* ============================================================ */}
      <section className="bg-charcoal py-20 sm:py-28">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h2
            className="font-heading text-off-white text-center mb-4"
            style={{ fontSize: "var(--text-section)" }}
          >
            HOW IT COMPARES.
          </h2>
          <p className="text-foreground-muted text-center max-w-xl mx-auto text-lg mb-12">
            Cycling-specific S&amp;C programmes on the market right now.
          </p>

          <div className="overflow-x-auto -mx-4 px-4">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="font-heading text-foreground-subtle text-xs tracking-wider pb-4 pr-6">PROGRAMME</th>
                  <th className="font-heading text-foreground-subtle text-xs tracking-wider pb-4 pr-6">PRICE</th>
                  <th className="font-heading text-foreground-subtle text-xs tracking-wider pb-4">MODEL</th>
                </tr>
              </thead>
              <tbody>
                {COMPETITORS.map((c) => (
                  <tr
                    key={c.name}
                    className={`border-b border-white/5 ${c.highlight ? "bg-coral/10" : ""}`}
                  >
                    <td className={`py-4 pr-6 text-sm ${c.highlight ? "text-off-white font-medium" : "text-foreground-muted"}`}>
                      {c.name}
                      {c.highlight && (
                        <span className="ml-2 inline-block bg-coral/20 text-coral text-[10px] font-heading tracking-wider px-2 py-0.5 rounded-full">
                          THIS
                        </span>
                      )}
                    </td>
                    <td className={`py-4 pr-6 text-sm tabular-nums ${c.highlight ? "text-off-white font-medium" : "text-foreground-muted"}`}>
                      {c.price}
                    </td>
                    <td className={`py-4 text-sm ${c.highlight ? "text-off-white font-medium" : "text-foreground-muted"}`}>
                      {c.model}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="mt-8 text-foreground-muted text-sm text-center leading-relaxed max-w-lg mx-auto">
            $95 gets you the full programme — strength, core, stretching, video
            demos, and tracking. No subscription. No upsells. Pay once, use it
            for as many 12-week cycles as you want.
          </p>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  FAQ                                                         */}
      {/* ============================================================ */}
      <section className="bg-[#210140] py-20 sm:py-28">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h2
            className="font-heading text-off-white text-center mb-14"
            style={{ fontSize: "var(--text-section)" }}
          >
            QUESTIONS.
          </h2>

          <div className="space-y-8">
            {FAQS.map((faq) => (
              <div key={faq.q} className="border-b border-white/10 pb-8">
                <p className="font-heading text-off-white text-lg tracking-wide mb-3">
                  {faq.q.toUpperCase()}
                </p>
                <p className="text-foreground-muted leading-relaxed">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  PRICING — Final CTA                                         */}
      {/* ============================================================ */}
      <section id="pricing" className="bg-deep-purple py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2
            className="font-heading text-off-white"
            style={{ fontSize: "var(--text-section)" }}
          >
            STOP GUESSING
            <br />
            <span className="text-coral">IN THE GYM.</span>
          </h2>
          <p className="mt-6 text-foreground-muted text-lg max-w-xl mx-auto">
            12 weeks of structured, periodised S&amp;C. Every exercise chosen for
            on-bike transfer. Every session tracked. Everything you need to get
            stronger without wrecking your riding.
          </p>

          {/* Price card */}
          <div className="mt-10 mx-auto max-w-md rounded-2xl bg-[#2E2E30] border border-coral/30 p-8 sm:p-10">
            <p className="text-foreground-muted text-sm font-heading tracking-wider">ONE-TIME PURCHASE</p>
            <p className="mt-3 font-heading text-off-white leading-none" style={{ fontSize: "4.5rem" }}>
              $95
            </p>
            <p className="mt-2 text-foreground-muted text-sm">Lifetime access &middot; No subscription &middot; No upsells</p>

            <ul className="mt-8 text-left text-sm text-off-white space-y-3">
              {[
                "12-week periodised programme (GPP → Strength → Power)",
                "Push/Pull split — 2 sessions per week",
                "Video demos filmed by Anthony for every exercise",
                "Core training circuit with weekly progression",
                "8 targeted stretches + dynamic warmup protocol",
                "Built-in set/rep tracking",
                "Foam rolling recovery guide",
                "Access via email magic link — no passwords",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <svg className="w-4 h-4 text-coral shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <div className="mt-8">
              <Link
                href="/sc/programme"
                className="w-full inline-flex items-center justify-center gap-2 font-heading text-base tracking-wide bg-coral hover:bg-coral/90 text-off-white px-10 py-4 rounded-lg transition-colors"
              >
                GET THE PROGRAMME
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Link>
            </div>

            <p className="mt-4 text-foreground-subtle text-xs">
              Comparable programmes cost $279–329. Subscriptions cost $25–30/month.
              This is $95, once, forever.
            </p>
          </div>

          {/* Secondary CTA */}
          <div className="mt-12">
            <p className="text-foreground-muted text-sm mb-4">
              Not sure yet? Preview the full programme structure first.
            </p>
            <Link
              href="/sc/programme"
              className="inline-flex items-center gap-2 font-heading text-sm tracking-wide text-coral hover:text-coral/80 transition-colors"
            >
              PREVIEW ALL 12 WEEKS →
            </Link>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  FINAL NUDGE                                                 */}
      {/* ============================================================ */}
      <section className="bg-charcoal py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-foreground-muted leading-relaxed">
            Already a{" "}
            <Link href="/community/not-done-yet" className="text-coral hover:text-coral/80 transition-colors">
              Not Done Yet
            </Link>{" "}
            member? The S&amp;C programme is included in your membership — check
            the members area. For everyone else: $95, one time, and you&apos;re in.
          </p>
        </div>
      </section>
    </div>
  );
}
