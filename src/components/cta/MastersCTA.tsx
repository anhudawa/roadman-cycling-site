import { LeadMagnetCapture } from "./LeadMagnetCapture";

/**
 * MastersCTA — for masters-cycling content (40+, 50+, comeback). The
 * "Not Done Yet" framing is the deepest emotional truth for this
 * audience, so the copy leans into that explicitly.
 */
export interface MastersCTAProps {
  source?: string;
  className?: string;
}

export function MastersCTA({
  source = "masters-cta",
  className,
}: MastersCTAProps) {
  return (
    <LeadMagnetCapture
      magnet="masters-checklist"
      eyebrow="NOT DONE YET"
      heading="GET THE MASTERS TRAINING CHECKLIST"
      subheading="The 12-point checklist we use with masters athletes — recovery, strength, hormonal context, and the sessions that still move the needle in your 40s and 50s."
      buttonText="SEND IT"
      source={source}
      className={className}
    />
  );
}
