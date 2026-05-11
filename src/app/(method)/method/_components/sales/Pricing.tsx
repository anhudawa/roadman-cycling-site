import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { Reveal } from "./Reveal";
import { COURSE_PRICE_STANDARD_USD, COURSE_PRICE_PREMIUM_USD } from "./data";

const STANDARD_INCLUDES = [
  "All 12 video modules — lifetime access",
  "Every written companion guide",
  "Every downloadable template, worksheet & protocol card",
  "Entry & Exit Assessment frameworks",
  "Discussion forum with the cohort",
  "30-day full refund — no interrogation",
] as const;

const PREMIUM_INCLUDES = [
  "Personalised TrainingPeaks plan built around your audit",
  "Mid-course plan adjustment at Week 6 (data-backed)",
  "Post-course written training-data review",
  "Priority access to a Not Done Yet community trial",
  "Everything in Standard",
] as const;

export function Pricing() {
  return (
    <section id="pricing" className="py-24 md:py-32 border-t border-white/5 relative">
      <div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(ellipse 50% 60% at 50% 0%, rgba(76,18,115,0.35) 0%, rgba(37,37,38,0) 60%)",
        }}
      />
      <Container width="wide">
        <div className="text-center mb-16 max-w-[700px] mx-auto">
          <Reveal>
            <p className="font-heading text-sm tracking-[0.3em] text-coral mb-4">
              ENROL
            </p>
          </Reveal>
          <Reveal delay={80}>
            <h2 className="font-heading uppercase leading-[0.95] text-[clamp(2rem,5vw,4.5rem)]">
              One price. <span className="text-coral">Lifetime access.</span>
            </h2>
          </Reveal>
          <Reveal delay={140}>
            <p className="mt-6 text-lg text-foreground-muted leading-relaxed">
              No subscription. No upsells inside the course. The Method is finite — you
              finish it, you keep it. Take it again next season. Every update is included
              for life.
            </p>
          </Reveal>
        </div>

        <div className="grid gap-6 md:grid-cols-2 max-w-[1000px] mx-auto">
          <Reveal as="article">
            <PricingCard
              tier="STANDARD"
              price={COURSE_PRICE_STANDARD_USD}
              tagline="The full course. Self-directed."
              includes={STANDARD_INCLUDES}
              ctaLabel="Enrol Now — Standard"
              ctaHref="/method/checkout?tier=standard"
              recommended={false}
            />
          </Reveal>
          <Reveal delay={80} as="article">
            <PricingCard
              tier="PREMIUM"
              price={COURSE_PRICE_PREMIUM_USD}
              tagline="Course + your own TrainingPeaks plan."
              includes={PREMIUM_INCLUDES}
              ctaLabel="Enrol Now — Premium"
              ctaHref="/method/checkout?tier=premium"
              recommended
            />
          </Reveal>
        </div>

        <Reveal delay={160}>
          <p className="mt-12 text-center text-sm text-foreground-muted max-w-[60ch] mx-auto">
            All prices in USD. Secure checkout via Stripe. The Method opens immediately
            after payment — Module 01 unlocks the moment you log in.
          </p>
        </Reveal>
      </Container>
    </section>
  );
}

interface PricingCardProps {
  tier: string;
  price: number;
  tagline: string;
  includes: readonly string[];
  ctaLabel: string;
  ctaHref: string;
  recommended: boolean;
}

function PricingCard({
  tier,
  price,
  tagline,
  includes,
  ctaLabel,
  ctaHref,
  recommended,
}: PricingCardProps) {
  return (
    <div
      className={`relative h-full flex flex-col rounded-sm border p-8 md:p-10 ${
        recommended
          ? "border-coral/50 bg-[color:var(--color-elevated)] shadow-[0_30px_80px_-30px_rgba(241,99,99,0.3)]"
          : "border-white/10 bg-[color:var(--color-elevated)]/40"
      }`}
    >
      {recommended ? (
        <span className="absolute -top-3 left-8 bg-coral text-charcoal text-xs font-heading uppercase tracking-[0.3em] px-3 py-1 rounded-sm">
          Recommended
        </span>
      ) : null}
      <p className="font-heading text-xs tracking-[0.4em] text-foreground-muted mb-3">
        {tier}
      </p>
      <p className="text-base text-foreground-muted mb-6">{tagline}</p>
      <p className="font-heading text-6xl md:text-7xl text-off-white leading-none mb-2">
        ${price}
        <span className="text-base text-foreground-muted ml-3">USD · once</span>
      </p>
      <p className="text-xs text-foreground-muted mb-8">Lifetime access. 30-day refund.</p>

      <ul className="space-y-3.5 mb-10 flex-1">
        {includes.map((item) => (
          <li key={item} className="flex gap-3 text-sm md:text-base">
            <span
              className={`font-heading text-base leading-none mt-1 ${
                recommended ? "text-coral" : "text-off-white"
              }`}
            >
              ✓
            </span>
            <span className="text-off-white/90 leading-relaxed">{item}</span>
          </li>
        ))}
      </ul>

      <Link
        href={ctaHref}
        className={`block text-center font-heading uppercase tracking-wider px-6 py-4 rounded-sm transition-colors ${
          recommended
            ? "bg-coral text-charcoal hover:bg-coral-hover"
            : "border border-white/20 text-off-white hover:border-coral hover:text-coral"
        }`}
      >
        {ctaLabel}
      </Link>
    </div>
  );
}
