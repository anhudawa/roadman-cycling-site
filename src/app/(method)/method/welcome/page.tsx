import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { VideoEmbed } from "../_components/VideoEmbed";
import { WelcomeStaggerIn } from "../_components/WelcomeStaggerIn";

export const metadata: Metadata = {
  title: "You're in · The Method",
  robots: { index: false, follow: false },
};

/**
 * /method/welcome
 *
 * Post-payment landing. Stripe redirects here on success; the
 * fulfilment (welcome email with magic link) is fired asynchronously
 * by the webhook. We deliberately do NOT attempt to read enrollment
 * status from the session_id query param — that would race against the
 * webhook on slow days. The email is the source of truth for "you have
 * access".
 *
 * Premium-feel goals on this page:
 *   1. The first beat is a celebration, not a confirmation receipt.
 *   2. Tell the rider exactly what happens next, in three concrete steps.
 *   3. Give immediate value — a tease of the Module 01 work.
 */
export default function MethodWelcomePage() {
  const welcomeVideoId = process.env.METHOD_WELCOME_VIDEO_YT_ID ?? null;

  return (
    <>
      <section
        aria-labelledby="welcome-headline"
        className="relative overflow-hidden border-b border-white/5"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(241,99,99,0.18)_0%,_transparent_55%)]"
        />
        <Container as="div" width="wide" className="relative pt-16 md:pt-24 pb-16 md:pb-20">
          <WelcomeStaggerIn delay={0}>
            <p className="font-heading text-xs tracking-[0.3em] text-coral mb-4">
              ENROLLED · LIFETIME ACCESS
            </p>
          </WelcomeStaggerIn>
          <WelcomeStaggerIn delay={0.08}>
            <h1
              id="welcome-headline"
              className="font-heading uppercase leading-[0.9] text-[clamp(3.5rem,10vw,8rem)]"
            >
              You&apos;re in.
            </h1>
          </WelcomeStaggerIn>
          <WelcomeStaggerIn delay={0.16}>
            <p className="mt-6 max-w-2xl text-lg md:text-xl text-off-white">
              Twelve weeks. Five pillars. One framework — built on conversations
              with World Tour coaches and the sport scientists who actually move
              the needle.
            </p>
          </WelcomeStaggerIn>
          <WelcomeStaggerIn delay={0.22}>
            <p className="mt-3 max-w-2xl text-foreground-muted">
              The work starts at the start. We&apos;ll send your sign-in link in the
              next minute — open it, and Module 01 is waiting.
            </p>
          </WelcomeStaggerIn>
        </Container>
      </section>

      <Container as="div" width="wide" className="py-14 md:py-20">
        <div className="grid gap-14 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
          <WelcomeStaggerIn delay={0.3}>
            <section aria-label="Welcome from Anthony">
              <p className="font-heading text-xs tracking-[0.3em] text-coral mb-3">
                FROM ANTHONY
              </p>
              <h2 className="font-heading uppercase leading-[0.95] text-3xl md:text-4xl mb-5">
                A short message before you start
              </h2>
              <p className="text-foreground-muted mb-6 max-w-md">
                Three minutes on what The Method is, what it isn&apos;t, and how to
                get the most out of the next twelve weeks.
              </p>
              <VideoEmbed
                youTubeId={welcomeVideoId}
                title="Anthony — welcome to The Method"
              />
            </section>
          </WelcomeStaggerIn>

          <WelcomeStaggerIn delay={0.42}>
            <section aria-labelledby="next-steps-heading" className="space-y-4">
              <p className="font-heading text-xs tracking-[0.3em] text-coral">
                DO THESE THREE THINGS
              </p>
              <h2
                id="next-steps-heading"
                className="font-heading uppercase leading-[0.95] text-3xl md:text-4xl"
              >
                Get set up in five minutes
              </h2>
              <ol className="space-y-4 mt-2">
                <NextStep
                  number="01"
                  title="Open your sign-in email"
                  body="We&apos;ve sent it to the address you used at checkout. Tap the button — it sets your access for 30 days, no password to remember."
                />
                <NextStep
                  number="02"
                  title="Connect TrainingPeaks"
                  body="Premium members link TrainingPeaks from the dashboard. Workouts land on your calendar — targets, RPE and notes already filled in."
                />
                <NextStep
                  number="03"
                  title="Start Module 01 — The Honest Baseline"
                  body="Twelve minutes of video, plus the audit workbook. Don&apos;t race it. The next eleven modules build on what you map this week."
                />
              </ol>
            </section>
          </WelcomeStaggerIn>
        </div>

        <WelcomeStaggerIn delay={0.55}>
          <section
            aria-labelledby="module-one-heading"
            className="mt-16 md:mt-20 rounded-xl border border-coral/30 bg-gradient-to-br from-deep-purple/30 via-charcoal/80 to-charcoal p-6 md:p-10"
          >
            <p className="font-heading text-xs tracking-[0.3em] text-coral mb-3">
              MODULE 01 · WEEK 01 · COACHING
            </p>
            <div className="grid gap-6 md:grid-cols-[auto_1fr] md:items-end">
              <span
                className="font-heading text-[clamp(5rem,12vw,9rem)] leading-none text-coral/70 select-none"
                aria-hidden
              >
                01
              </span>
              <div>
                <h2
                  id="module-one-heading"
                  className="font-heading uppercase leading-[0.95] text-3xl md:text-5xl mb-3"
                >
                  The Honest Baseline
                </h2>
                <p className="text-foreground-muted max-w-xl">
                  Where you actually are — power, weight, sleep, stress. Most
                  serious amateurs have never properly audited their own
                  training. We start here so everything that follows is
                  measurable.
                </p>
              </div>
            </div>
            <ul className="mt-8 grid gap-3 md:grid-cols-3">
              <BaselineItem title="FTP & training audit">
                Validate your number. Map your real hours, intensity
                distribution, and recovery against the framework.
              </BaselineItem>
              <BaselineItem title="Body composition baseline">
                A simple, lab-free baseline you&apos;ll measure against in
                Week 12. No guessing, no obsessing.
              </BaselineItem>
              <BaselineItem title="One-Two-Twelve goal">
                One primary goal, two supporting goals, twelve-week timeline.
                The Roadman target you&apos;ll hold yourself to.
              </BaselineItem>
            </ul>
          </section>
        </WelcomeStaggerIn>

        <WelcomeStaggerIn delay={0.68}>
          <section
            aria-labelledby="email-heading"
            className="mt-12 rounded-lg border border-white/10 bg-charcoal/60 p-6 md:p-8"
          >
            <h2
              id="email-heading"
              className="font-heading uppercase tracking-wider text-xl mb-3"
            >
              Email hasn&apos;t arrived?
            </h2>
            <p className="text-foreground-muted mb-4">
              Give it sixty seconds, then check spam. Still nothing? Request a
              fresh sign-in link — same email you used at checkout.
            </p>
            <a
              href="/method/login"
              className="inline-flex items-center gap-2 font-heading uppercase tracking-wider text-coral hover:text-coral-hover"
            >
              Go to sign-in →
            </a>
          </section>
        </WelcomeStaggerIn>
      </Container>
    </>
  );
}

interface NextStepProps {
  number: string;
  title: string;
  body: string;
}

function NextStep({ number, title, body }: NextStepProps) {
  return (
    <li className="grid grid-cols-[auto_1fr] gap-5 rounded-lg border border-white/10 bg-charcoal/60 p-5 hover:border-coral/40 transition-colors">
      <span
        aria-hidden
        className="font-heading text-3xl text-coral leading-none pt-0.5"
      >
        {number}
      </span>
      <div>
        <p className="font-heading uppercase tracking-wider text-off-white mb-1">
          {title}
        </p>
        <p className="text-sm text-foreground-muted">{body}</p>
      </div>
    </li>
  );
}

interface BaselineItemProps {
  title: string;
  children: string;
}

function BaselineItem({ title, children }: BaselineItemProps) {
  return (
    <li className="rounded-md border border-white/5 bg-charcoal/40 p-4">
      <p className="font-heading text-sm tracking-[0.2em] text-coral mb-2 uppercase">
        {title}
      </p>
      <p className="text-sm text-foreground-muted">{children}</p>
    </li>
  );
}
