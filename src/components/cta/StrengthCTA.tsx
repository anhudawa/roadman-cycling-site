import { LeadMagnetCapture } from "./LeadMagnetCapture";

/**
 * StrengthCTA — for strength training content. Hooks into the
 * "lm-strength-2day" Beehiiv automation, which delivers the 2-Day
 * Cyclist Gym Plan as a sequenced email asset (and is a known feeder
 * into the paid Strength Training course funnel).
 */
export interface StrengthCTAProps {
  source?: string;
  className?: string;
}

export function StrengthCTA({
  source = "strength-cta",
  className,
}: StrengthCTAProps) {
  return (
    <LeadMagnetCapture
      magnet="strength-2day"
      eyebrow="STRENGTH FOR CYCLISTS"
      heading="GET THE 2-DAY CYCLIST GYM PLAN"
      subheading="Two sessions a week. Built around big riding loads, not gym-bro hypertrophy. The same template our coached riders use through base and build."
      buttonText="SEND THE PLAN"
      source={source}
      className={className}
    />
  );
}
