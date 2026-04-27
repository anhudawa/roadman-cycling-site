import Link from "next/link";
import { LeadMagnetCapture } from "./LeadMagnetCapture";

/**
 * NutritionCTA — for fuelling and in-ride nutrition content. Two
 * paths in one component:
 *
 *   1. A direct link to /tools/fuelling so problem-aware readers can
 *      calculate their carbs/hour right now (zero-friction)
 *   2. The fuelling-guide email capture for readers who want the
 *      bigger picture delivered to their inbox
 */
export interface NutritionCTAProps {
  source?: string;
  /** Override the calculator destination if a more specific tool exists. */
  calculatorHref?: string;
  className?: string;
}

export function NutritionCTA({
  source = "nutrition-cta",
  calculatorHref = "/tools/fuelling",
  className,
}: NutritionCTAProps) {
  const calculatorLink = (
    <Link
      href={calculatorHref}
      data-track={`${source}-calculator`}
      className="
        inline-flex items-center gap-2
        font-heading text-xs tracking-widest
        text-coral hover:text-coral-hover
        transition-colors
      "
    >
      <span aria-hidden="true">→</span> CALCULATE YOUR CARBS/HOUR (NO EMAIL NEEDED)
    </Link>
  );

  return (
    <LeadMagnetCapture
      magnet="fuelling-guide"
      eyebrow="FUELLING"
      heading="FUEL YOUR NEXT BIG RIDE PROPERLY"
      subheading="Use the calculator for your next session — or get the full fuelling guide emailed over: dual-source carbs, gut training protocol, race-day script."
      buttonText="EMAIL THE GUIDE"
      source={source}
      secondaryAction={calculatorLink}
      className={className}
    />
  );
}
