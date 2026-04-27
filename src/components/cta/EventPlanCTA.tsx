import { LeadMagnetCapture } from "./LeadMagnetCapture";

/**
 * EventPlanCTA — for sportive, gran fondo, and event prep content.
 * Accepts an `event` prop so the headline names the specific event
 * the article is about ("Download your Etape du Tour training plan").
 *
 * The event name is also stored on the subscriber as `target_event`
 * so Beehiiv automations and CRM segmentation know which event to
 * tailor follow-ups for.
 */
export interface EventPlanCTAProps {
  /** Specific event name — e.g. "Etape du Tour", "Marmotte". */
  event: string;
  /** Optional friendly display variant — defaults to `event`. */
  eventDisplay?: string;
  source?: string;
  className?: string;
}

export function EventPlanCTA({
  event,
  eventDisplay,
  source = "event-plan-cta",
  className,
}: EventPlanCTAProps) {
  const display = eventDisplay ?? event;

  return (
    <LeadMagnetCapture
      magnet="event-plan"
      eyebrow="EVENT TRAINING PLAN"
      heading={`DOWNLOAD YOUR ${display.toUpperCase()} TRAINING PLAN`}
      subheading={`Built for amateurs targeting ${display}. Weekly structure, key sessions, taper — the version we'd give a member of the paid community.`}
      buttonText="SEND THE PLAN"
      source={source}
      context={event}
      className={className}
    />
  );
}
