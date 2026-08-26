"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { ScrollReveal } from "@/components/ui";
import styles from "./faster-after-40.module.css";

// ── Constants ───────────────────────────────────────────────
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PDF_URL = "/downloads/faster-after-40-report.pdf";

// ── SVG icons (inline, matching the original page) ──────────

function CheckSvg() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-3.5 h-3.5 text-coral"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function ActivitySvg() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--color-coral)" }}>
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  );
}

function CoffeeSvg() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--color-coral)" }}>
      <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
      <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
      <line x1="6" y1="1" x2="6" y2="4" />
      <line x1="10" y1="1" x2="10" y2="4" />
      <line x1="14" y1="1" x2="14" y2="4" />
    </svg>
  );
}

function TrendUpSvg() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--color-coral)" }}>
      <path d="M6 18L18 6" />
      <path d="M8 6h10v10" />
    </svg>
  );
}

function ClockSvg() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--color-coral)" }}>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>
  );
}

function UsersSvg() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--color-coral)" }}>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

// ── CaptureForm component ───────────────────────────────────

interface CaptureFormProps {
  submitted: boolean;
  downloadUrl: string;
  onSuccess: (url: string) => void;
}

function CaptureForm({ submitted, downloadUrl, onSuccess }: CaptureFormProps) {
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const clearError = () => {
    if (status === "error") {
      setStatus("idle");
      setErrorMsg("");
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (status === "loading") return;

    const trimmedEmail = email.trim();
    const trimmedName = firstName.trim();

    if (!trimmedEmail) {
      setStatus("error");
      setErrorMsg("Please enter your email address.");
      return;
    }

    if (!EMAIL_REGEX.test(trimmedEmail)) {
      setStatus("error");
      setErrorMsg("That doesn’t look like a valid email. Give it another go.");
      return;
    }

    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/faster-after-40", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: trimmedEmail,
          ...(trimmedName && { firstName: trimmedName }),
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        onSuccess(data.downloadUrl || PDF_URL);
      } else {
        setStatus("error");
        setErrorMsg(
          data.error ||
            "Something went wrong. Try again or email anthony@roadmancycling.com"
        );
      }
    } catch {
      setStatus("error");
      setErrorMsg(
        "Something went wrong. Try again or email anthony@roadmancycling.com"
      );
    }
  };

  // ── Success state ──
  if (submitted) {
    return (
      <div className="max-w-[420px] mx-auto">
        <button
          type="button"
          disabled
          className={`${styles.ctaBtn} ${styles.ctaBtnSuccess}`}
        >
          Done ✓
        </button>
        <div className="text-center pt-6">
          <p className="text-base text-off-white/70 leading-relaxed mb-5 font-light">
            Check your inbox — the report is on its way.
          </p>
          <a href={downloadUrl} className={styles.downloadBtn} download>
            Download Now (PDF)
          </a>
        </div>
      </div>
    );
  }

  // ── Form state ──
  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="max-w-[420px] mx-auto"
    >
      <div className="flex flex-col gap-2.5 mb-4">
        <input
          type="text"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          className={styles.formInput}
          placeholder="Your first name (optional)"
          aria-label="First name"
          autoComplete="given-name"
        />
        <input
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            clearError();
          }}
          className={`${styles.formInput} ${status === "error" ? styles.formInputError : ""}`}
          placeholder="Your email address"
          required
          aria-label="Email address"
          autoComplete="email"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className={`${styles.ctaBtn} ${status === "loading" ? styles.ctaBtnLoading : ""}`}
        >
          {status === "loading" ? "Sending…" : "Send Me the Guide"}
        </button>
      </div>
      {errorMsg && (
        <p
          className="text-[0.78rem] text-coral text-center mt-2.5 leading-normal"
          role="alert"
        >
          {errorMsg}
        </p>
      )}
      <p className="text-xs text-off-white/40 text-center mt-4 leading-relaxed">
        Delivered straight to your inbox. You&apos;ll also get Anthony&apos;s
        weekly riding notes. Unsubscribe any time.
      </p>
    </form>
  );
}

// ── Main squeeze page component ─────────────────────────────

export default function FA40Squeeze() {
  const [submitted, setSubmitted] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState(PDF_URL);

  const handleFormSuccess = (url: string) => {
    setDownloadUrl(url);
    setSubmitted(true);
  };

  return (
    <div className={styles.page}>
      {/* ====== HEADER ====== */}
      <header className="py-6 text-center relative z-10">
        <div className="w-full max-w-[720px] mx-auto px-7">
          <Link
            href="/"
            className="font-heading text-[1.1rem] tracking-[0.2em] uppercase text-off-white no-underline opacity-50 hover:opacity-85 transition-opacity duration-300"
          >
            Roadman Cycling
          </Link>
        </div>
      </header>

      {/* ====== HERO ====== */}
      <section className={`${styles.heroSection} py-10 pb-24 text-center overflow-hidden`}>
        <div className="w-full max-w-[720px] mx-auto px-7">
          <p className={`${styles.heroBadge} mb-9`}>A Free 30-Page Guide</p>
          <h1 className="font-heading text-[clamp(3.2rem,9vw,5.5rem)] text-off-white mb-2 max-w-[700px] mx-auto leading-[0.95] uppercase tracking-[0.02em]">
            Faster After 40
          </h1>
          <p className="block font-heading text-[clamp(1.3rem,3.5vw,1.9rem)] uppercase tracking-[0.04em] text-coral leading-[1.15] mt-3 mb-9 max-w-[600px] mx-auto">
            What World Tour Coaches Actually Prescribe to Riders Your Age
          </p>
          <p className="text-[1.05rem] leading-relaxed text-off-white/70 max-w-[520px] mx-auto mb-12 font-light">
            I distilled{" "}
            <strong className="text-off-white font-medium">
              5 years of podcast conversations
            </strong>{" "}
            with Dan Lorang, Professor Seiler, and the coaches behind Grand Tour
            wins into a 30-page field manual for cyclists who refuse to slow
            down.
          </p>
          <CaptureForm
            submitted={submitted}
            downloadUrl={downloadUrl}
            onSuccess={handleFormSuccess}
          />
        </div>
      </section>

      {/* ====== COVER MOCKUP ====== */}
      <section className={`${styles.coverSection} py-5 pb-28 text-center`}>
        <div className="w-full max-w-[720px] mx-auto px-7">
          <div className={styles.coverWrapper}>
            <div className={styles.coverMockup}>
              <p className="font-body text-[0.6rem] font-semibold tracking-[0.22em] uppercase text-coral mb-8 opacity-80">
                Roadman Cycling
              </p>
              <h2 className="font-heading text-[clamp(2.4rem,7vw,3.2rem)] text-off-white text-center mb-6 leading-[0.95] uppercase tracking-[0.02em]">
                Faster
                <br />
                After <span className="text-coral">40</span>
              </h2>
              <div className={styles.coverDivider} />
              <p className="font-body text-[0.78rem] text-off-white/70 text-center leading-relaxed max-w-[280px] font-light opacity-85">
                The 5-pillar system World Tour coaches use — adapted for
                cyclists with real jobs, real families, and real ambitions on the
                bike.
              </p>
              <div className="mt-auto pt-7 text-center">
                <p className="font-body text-[0.68rem] font-medium tracking-[0.12em] uppercase text-off-white/40">
                  Anthony Walsh
                </p>
                <p className="font-heading text-[0.75rem] tracking-[0.18em] uppercase text-off-white/40 mt-1 opacity-60">
                  Roadman Cycling
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====== SOCIAL PROOF ====== */}
      <section className={`${styles.proofSection} py-20`}>
        <div className="w-full max-w-[880px] mx-auto px-7">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { number: "100M+", label: "Podcast Downloads" },
              { number: "5", label: "World Tour Coaches Interviewed" },
              { number: "30", label: "Pages of Distilled Coaching Intelligence" },
            ].map((item) => (
              <ScrollReveal key={item.number} direction="up">
                <div className={`${styles.glassCard} p-8 text-center md:text-center`}>
                  <p className="font-heading text-[clamp(2.4rem,6vw,3.2rem)] text-coral leading-none mb-2.5">
                    {item.number}
                  </p>
                  <p className="text-[0.72rem] text-off-white/40 uppercase tracking-[0.1em] font-medium leading-normal">
                    {item.label}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ====== WHAT'S INSIDE: PILLARS ====== */}
      <section className={`${styles.insideSection} py-24`}>
        <div className="w-full max-w-[720px] mx-auto px-7">
          <span className={styles.accentLine} />
          <h2 className="font-heading text-[clamp(2.2rem,5.5vw,3.4rem)] text-off-white text-center mb-4 uppercase tracking-[0.02em] leading-[1.05]">
            What&apos;s Inside
          </h2>
          <p className="text-base text-off-white/70 text-center max-w-[520px] mx-auto mb-14 font-light leading-relaxed">
            Five pillars. Each one built from conversations with the coaches and
            scientists behind the best riders on earth. Each one written for the
            rider with a job, a family, and 8–12 hours a week to train.
          </p>
          <ol className="list-none flex flex-col gap-2">
            {[
              {
                number: "01",
                title: "Coaching",
                desc: (
                  <>
                    Why 90% of age-group cyclists are stuck in the grey zone —
                    and the{" "}
                    <strong className="text-off-white font-medium">
                      polarised model
                    </strong>{" "}
                    that Seiler proved and Lorang applies to Grand Tour winners.
                    Includes the exact sessions World Tour coaches prescribe for
                    time-limited riders and the low-cadence torque protocol the
                    science has finally validated.
                  </>
                ),
              },
              {
                number: "02",
                title: "Nutrition",
                desc: (
                  <>
                    Why &ldquo;eat less, ride more&rdquo; is making you slower
                    and fatter. The{" "}
                    <strong className="text-off-white font-medium">
                      fuelling-first approach
                    </strong>{" "}
                    that helped me drop 7kg in 12 weeks while eating more food
                    than ever. Plus the in-ride nutrition protocol the pros use —
                    and why you&apos;re probably bonking at 60km from home.
                  </>
                ),
              },
              {
                number: "03",
                title: "Strength & Conditioning",
                desc: (
                  <>
                    The exercises to avoid after 40 (and why heavy barbell work
                    is a bad bet at this stage). Five movements adapted from{" "}
                    <strong className="text-off-white font-medium">
                      Pogačar&apos;s own programme
                    </strong>{" "}
                    for amateur cyclists — designed to build power off the bike,
                    prevent injury, and add years to your riding.
                  </>
                ),
              },
              {
                number: "04",
                title: "Recovery",
                desc: (
                  <>
                    The over-40 recovery equation: why what worked at 30
                    doesn&apos;t work now.{" "}
                    <strong className="text-off-white font-medium">
                      Sleep, stress, and HRV
                    </strong>{" "}
                    — the three metrics that determine whether your training is
                    building you up or breaking you down. Plus the adaptation
                    protocol for riders who can&apos;t afford to get this wrong.
                  </>
                ),
              },
              {
                number: "05",
                title: "Community — Le Métier",
                desc: (
                  <>
                    Why the lone wolf cyclist always plateaus.{" "}
                    <strong className="text-off-white font-medium">
                      Le métier
                    </strong>{" "}
                    — the craft of being a cyclist — is more than watts and
                    weight. What riding with serious cyclists actually does to
                    your physiology, your motivation, and your ceiling. And how
                    113 riders are applying all five pillars together inside Not
                    Done Yet.
                  </>
                ),
              },
            ].map((pillar) => (
              <ScrollReveal key={pillar.number} direction="up">
                <li
                  className={`${styles.pillarCard} flex items-start gap-4 md:gap-6 p-5 md:p-7`}
                >
                  <div
                    className={`${styles.pillarNumber} shrink-0 w-11 h-11 md:w-[52px] md:h-[52px] flex items-center justify-center font-heading text-[1.2rem] md:text-[1.4rem] text-coral`}
                  >
                    {pillar.number}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-heading text-2xl text-off-white mb-2 tracking-[0.04em] uppercase leading-[1.05]">
                      {pillar.title}
                    </h3>
                    <p className="text-[0.9rem] text-off-white/70 leading-relaxed font-light">
                      {pillar.desc}
                    </p>
                  </div>
                </li>
              </ScrollReveal>
            ))}
          </ol>
        </div>
      </section>

      {/* ====== PULL QUOTE ====== */}
      <section className={`${styles.quoteSection} py-20 text-center`}>
        <div className="w-full max-w-[600px] mx-auto px-7">
          <ScrollReveal direction="up">
            <div className="max-w-[580px] mx-auto">
              <span className="font-heading text-[4rem] leading-none text-coral opacity-30 -mb-5 block">
                &ldquo;
              </span>
              <p className="text-[1.25rem] font-light italic text-off-white/70 leading-relaxed mb-5">
                I went from 84kg and an average wattage I&apos;m embarrassed to
                mention, to a body fat percentage I haven&apos;t had since
                university and power numbers I didn&apos;t think were possible
                any more.
              </p>
              <p className="text-[0.78rem] text-off-white/40 font-medium tracking-[0.06em] uppercase">
                Chris O&apos;Connor{" "}
                <span className="text-coral opacity-60">—</span> Not Done Yet
                Member
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ====== CHAPTER BREAKDOWN ====== */}
      <section className={`${styles.chaptersSection} py-24`}>
        <div className="w-full max-w-[720px] mx-auto px-7">
          <span className={styles.accentLine} />
          <h2 className="font-heading text-[clamp(2.2rem,5.5vw,3.4rem)] text-off-white text-center mb-4 uppercase tracking-[0.02em] leading-[1.05]">
            The Full Breakdown
          </h2>
          <p className="text-base text-off-white/70 text-center max-w-[520px] mx-auto mb-14 font-light leading-relaxed">
            30 pages. No filler. Every chapter pairs the science with a specific
            framework you can apply this week.
          </p>

          {[
            {
              icon: <ActivitySvg />,
              name: "Coaching",
              items: [
                "Why 90% of age-group cyclists are training in the grey zone — and what it’s costing them",
                "The polarised model: what Seiler proved and how Lorang applies it at Red Bull–Bora–Hansgrohe",
                "Periodisation for riders with real jobs — building a season plan around 8 hours a week",
                "The exact interval sessions World Tour coaches prescribe for time-limited athletes",
                "Low-cadence torque intervals: the most underrated session in cycling (and the 2024 study that proved it)",
                "Framework: your weekly training architecture — structured, specific, and built around your life",
              ],
            },
            {
              icon: <CoffeeSvg />,
              name: "Nutrition",
              items: [
                'Why "eat less, ride more" is outdated, incomplete, and actively making you slower',
                "How I lost 7kg in 12 weeks while eating more food than I’d ever eaten in my life",
                "In-ride fuelling: what the pros actually consume and why you’re bonking at 60km from home",
                "Protein timing: the new research every masters cyclist needs to understand",
                "Body composition vs. scale weight: the metric that actually determines your climbing speed",
                "Framework: the fuelling-first protocol — 12 weeks to race weight without restriction",
              ],
            },
            {
              icon: <TrendUpSvg />,
              name: "Strength & Conditioning",
              items: [
                "Why cyclists over 40 lose power year on year — and how S&C reverses it",
                "The exercises to AVOID: why heavy barbell work is a bad bet for this age group",
                "5 movements adapted from Pogačar’s programme for amateur cyclists over 40",
                "Building functional power off the bike without adding bulk",
                "Injury-proofing your body for 20 more years of serious riding",
                "Framework: the 12-week S&C roadmap — designed to complement your time on the bike",
              ],
            },
            {
              icon: <ClockSvg />,
              name: "Recovery",
              items: [
                "The over-40 recovery equation: why the rules changed and nobody told you",
                "Sleep science for athletes: the single biggest performance lever most riders ignore",
                "Your body can’t tell the difference between work stress and training stress — and that matters",
                "Active recovery vs. rest days: when to spin easy, when to do nothing",
                "HRV: the one metric that tells you when to push and when to back off",
                "Framework: the adaptation protocol — structured recovery for structured training",
              ],
            },
            {
              icon: <UsersSvg />,
              name: "Community — Le Métier",
              items: [
                "Why the lone wolf cyclist always hits a ceiling (and the data behind group training effects)",
                "Le métier: the craft of being a cyclist — and why it matters as much as your FTP",
                "What riding with better cyclists actually does to your physiology and your race-day confidence",
                "Accountability structures that work for adults with careers and families",
                "The Not Done Yet effect: how 113 serious cyclists are applying all five pillars together",
                "Your next step: what it looks like to apply for the community",
              ],
            },
          ].map((chapter) => (
            <ScrollReveal key={chapter.name} direction="up">
              <div className={`${styles.glassCard} p-5 md:p-7 mb-4 last:mb-0`}>
                <div
                  className={`${styles.chapterHeader} flex items-center gap-3.5 mb-5 pb-4`}
                >
                  <div
                    className={`${styles.chapterIcon} w-9 h-9 flex items-center justify-center shrink-0`}
                  >
                    {chapter.icon}
                  </div>
                  <h3 className="font-heading text-[1.2rem] text-coral tracking-[0.06em] uppercase leading-[1.05]">
                    {chapter.name}
                  </h3>
                </div>
                <ul className="list-none flex flex-col gap-2.5">
                  {chapter.items.map((item) => (
                    <li
                      key={item}
                      className={`${styles.chapterItem} text-[0.88rem] text-off-white/70 leading-relaxed font-light`}
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* ====== EXPERT ACCESS ====== */}
      <section className={`${styles.expertsSection} py-24`}>
        <div className="w-full max-w-[720px] mx-auto px-7">
          <span className={styles.accentLine} />
          <h2 className="font-heading text-[clamp(2.2rem,5.5vw,3.4rem)] text-off-white text-center mb-4 uppercase tracking-[0.02em] leading-[1.05]">
            Built From Conversations With
          </h2>
          <p className="text-base text-off-white/70 text-center max-w-[520px] mx-auto font-light leading-relaxed">
            This isn&apos;t theory pulled from textbooks. Every framework in
            this guide was shaped by direct conversations with the coaches and
            scientists behind the best riders on the planet.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-12">
            {[
              {
                name: "Dan Lorang",
                role: "Head of Performance, Lidl-Trek",
                detail:
                  "Coaches Frodeno, Haug, and Cavendish. His periodisation framework for time-limited athletes forms the backbone of the Coaching chapter.",
              },
              {
                name: "Prof. Stephen Seiler",
                role: "Exercise Physiologist & Polarised Training Pioneer",
                detail:
                  "The researcher who proved the 80/20 intensity distribution. His work underpins every training recommendation in this guide.",
              },
              {
                name: "Dr. David Dunne",
                role: "Sports Scientist",
                detail:
                  "Evidence-based performance optimisation. His research on recovery and adaptation informs the Recovery and Nutrition chapters.",
              },
              {
                name: "Lachlan Morton",
                role: "EF Education Pro Cyclist",
                detail:
                  "World Tour rider and alt-racing pioneer. His perspective on what really matters in the sport shaped the Le Métier chapter.",
              },
            ].map((expert) => (
              <ScrollReveal key={expert.name} direction="up">
                <div className={styles.expertCard}>
                  <h3 className="font-heading text-[1.2rem] text-off-white mb-1.5 tracking-[0.03em] uppercase leading-[1.05]">
                    {expert.name}
                  </h3>
                  <p className="text-[0.76rem] text-coral font-medium mb-3 leading-snug tracking-[0.02em]">
                    {expert.role}
                  </p>
                  <p className="text-[0.82rem] text-off-white/40 leading-relaxed font-light">
                    {expert.detail}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ====== WHO THIS IS FOR ====== */}
      <section className={`${styles.forSection} py-24`}>
        <div className="w-full max-w-[720px] mx-auto px-7">
          <span className={styles.accentLine} />
          <h2 className="font-heading text-[clamp(2.2rem,5.5vw,3.4rem)] text-off-white text-center mb-4 uppercase tracking-[0.02em] leading-[1.05]">
            This Guide Is For You If
          </h2>
          <ul className="list-none max-w-[560px] mx-auto flex flex-col mt-8">
            {[
              "You’re over 35, you train seriously, and you refuse to accept your best riding is behind you",
              "Your FTP has been stuck for months and you’ve tried everything the cycling internet told you to try",
              "You’ve got a real job, a real family, and 8–12 hours a week to train — not 25",
              "You want structure and clarity — not another YouTube rabbit hole of conflicting advice",
              "You know there’s more in you — you just need the right system to get it out",
              "You’d rather hear from World Tour coaches than wade through another Reddit thread",
            ].map((item) => (
              <ScrollReveal key={item} direction="up">
                <li
                  className={`${styles.forItem} flex items-start gap-4 text-[0.95rem] text-off-white/70 leading-relaxed font-light py-4`}
                >
                  <span
                    className={`${styles.checkIcon} shrink-0 w-7 h-7 flex items-center justify-center mt-0.5`}
                  >
                    <CheckSvg />
                  </span>
                  {item}
                </li>
              </ScrollReveal>
            ))}
          </ul>
        </div>
      </section>

      {/* ====== ABOUT ANTHONY ====== */}
      <section className="bg-deep-purple py-24 text-center">
        <div className="w-full max-w-[720px] mx-auto px-7">
          <div className="max-w-[540px] mx-auto">
            <div
              className={`${styles.aboutAvatar} w-[88px] h-[88px] rounded-full mx-auto mb-7 flex items-center justify-center font-heading text-[1.8rem] text-off-white`}
            >
              AW
            </div>
            <p className="text-base text-off-white/70 leading-loose mx-auto mb-7 font-light">
              I&apos;m Anthony. I host the{" "}
              <strong className="text-off-white font-medium">
                Roadman Cycling Podcast
              </strong>{" "}
              — 100 million downloads and counting. Over the past five years
              I&apos;ve sat across from the coaches behind Grand Tour wins,
              Olympic medals, and World Championship jerseys. I&apos;ve asked
              them the question every serious amateur wants answered:{" "}
              <strong className="text-off-white font-medium">
                what would you actually prescribe to someone like us?
              </strong>
            </p>
            <p className="text-base text-off-white/70 leading-loose mx-auto mb-7 font-light">
              This guide is their answer. Distilled, structured, and written for
              the rider with a career, a family, and a quiet refusal to accept
              that the best days are done. I built it because I needed it myself
              — and because I know you do too.
            </p>
            <p className="font-body italic text-[1.1rem] text-off-white/40 mb-0.5">
              Anthony Walsh
            </p>
            <p className="text-[0.72rem] text-off-white/40 uppercase tracking-[0.14em] font-semibold opacity-50">
              Roadman Cycling
            </p>
          </div>
        </div>
      </section>

      {/* ====== BOTTOM CTA ====== */}
      <section className={`${styles.ctaSection} py-24 pb-28 text-center`}>
        <div className="w-full max-w-[720px] mx-auto px-7">
          <span className={styles.accentLine} />
          <h2 className="font-heading text-[clamp(2.2rem,5.5vw,3.4rem)] text-off-white text-center mb-3 uppercase tracking-[0.02em] leading-[1.05]">
            Get Your Free Copy
          </h2>
          <p className="text-base text-off-white/70 text-center max-w-[520px] mx-auto mb-12 font-light leading-relaxed">
            30 pages of World Tour coaching intelligence. Free. In your inbox in
            60 seconds.
          </p>
          <CaptureForm
            submitted={submitted}
            downloadUrl={downloadUrl}
            onSuccess={handleFormSuccess}
          />
        </div>
      </section>

      {/* ====== FOOTER ====== */}
      <footer className={`${styles.footer} py-9 text-center`}>
        <div className="w-full max-w-[720px] mx-auto px-7">
          <p className="text-[0.72rem] text-off-white/40 leading-relaxed tracking-[0.02em]">
            &copy; 2026 Roadman Cycling. All rights reserved.
          </p>
          <div className="mt-2 flex justify-center gap-6">
            <Link
              href="https://roadmancycling.com/apply"
              className="text-[0.7rem] text-off-white/40 no-underline uppercase tracking-[0.1em] font-medium hover:text-coral transition-colors duration-200"
            >
              Community
            </Link>
            <Link
              href="/privacy"
              className="text-[0.7rem] text-off-white/40 no-underline uppercase tracking-[0.1em] font-medium hover:text-coral transition-colors duration-200"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="text-[0.7rem] text-off-white/40 no-underline uppercase tracking-[0.1em] font-medium hover:text-coral transition-colors duration-200"
            >
              Terms
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
