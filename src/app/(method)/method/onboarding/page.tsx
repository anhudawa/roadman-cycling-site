import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { OnboardingQuiz } from "./_components/OnboardingQuiz";

export const metadata: Metadata = {
  title: "Set your plan · The Method",
  description:
    "Five questions, one tailored training plan. Roadman Method onboarding routes you to the right TrainingPeaks block for your goal, your hours and your experience.",
  robots: { index: false, follow: false },
};

/**
 * /method/onboarding
 *
 * Post-purchase onboarding flow. Middleware gates access — this route
 * is not in GUEST_PATHS, so unauthenticated riders are bounced to
 * /method/login before they hit the component.
 *
 * The quiz itself is a client component (state machine + localStorage
 * persistence). The page just provides chrome + intro copy.
 */
export default function MethodOnboardingPage() {
  return (
    <>
      <section
        aria-labelledby="onboarding-headline"
        className="relative overflow-hidden border-b border-white/5"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(241,99,99,0.16)_0%,_transparent_55%)]"
        />
        <Container as="div" width="narrow" className="relative pt-12 sm:pt-16 md:pt-20 pb-8 md:pb-12">
          <p className="font-heading text-xs tracking-[0.3em] text-coral mb-3">
            ONBOARDING · STEP 02
          </p>
          <h1
            id="onboarding-headline"
            className="font-heading uppercase leading-[0.95] text-[clamp(2.5rem,7vw,5rem)]"
          >
            Pick your plan.
          </h1>
          <p className="mt-5 max-w-xl text-base md:text-lg text-off-white">
            Five questions. Two minutes. One training plan tuned to your
            goal, your hours and your experience.
          </p>
          <p className="mt-3 max-w-xl text-sm text-foreground-muted">
            We&apos;ll route you to the right TrainingPeaks block — the work
            starts the moment you say yes.
          </p>
        </Container>
      </section>

      <Container as="div" width="narrow" className="py-10 md:py-14">
        <OnboardingQuiz />
      </Container>
    </>
  );
}
