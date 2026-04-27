import { LeadMagnetCapture } from "./LeadMagnetCapture";

/**
 * ZonesCTA — for FTP-zones articles and tool result pages. Captures
 * email and triggers the Beehiiv "lm-zones-plan" automation, which
 * sends the rider their saved zones and the matched starter plan.
 */
export interface ZonesCTAProps {
  source?: string;
  className?: string;
}

export function ZonesCTA({ source = "zones-cta", className }: ZonesCTAProps) {
  return (
    <LeadMagnetCapture
      magnet="zones-plan"
      eyebrow="MATCHED PLAN"
      heading="SAVE YOUR ZONES + GET A MATCHED TRAINING PLAN"
      subheading="Drop your email. We'll send your zones to your inbox and a starter plan that targets the zones you actually need to train. No fluff, no upsell required."
      buttonText="GET MY PLAN"
      source={source}
      className={className}
    />
  );
}
