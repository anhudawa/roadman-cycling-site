/**
 * Lead magnet registry — the source of truth for every email-capture
 * intent CTA on the site. Each magnet id maps to:
 *
 *   - the Beehiiv tag(s) applied on signup (so the right delivery
 *     automation in Beehiiv fires)
 *   - the Beehiiv custom fields recorded on the subscriber
 *   - the human-readable name + confirmation copy used by the form
 *
 * Add new magnets here, never hard-code a tag inside a component.
 *
 * Beehiiv handles the actual asset delivery via its automation rules
 * keyed off the tag. The /api/lead-magnets route only does subscription
 * + tagging; it does not send the asset itself.
 */
export type LeadMagnetId =
  | "zones-plan"
  | "event-plan"
  | "masters-checklist"
  | "fuelling-guide"
  | "strength-2day"
  | "episode-playlist";

export interface LeadMagnetDefinition {
  id: LeadMagnetId;
  /** Short human label — used in form heading + analytics. */
  label: string;
  /** Beehiiv tags applied to the subscriber. The first one is the
   * automation-trigger; any extras are taxonomy. */
  beehiivTags: string[];
  /** Confirmation copy shown after a successful submission. */
  successMessage: string;
  /** Whether the magnet accepts a free-text context value (e.g. event
   * name for the event plan magnet). When true, the API route stores
   * it on the subscriber as a custom field. */
  acceptsContext?: boolean;
  /** Custom-field name to use for the context value. */
  contextFieldName?: string;
}

export const LEAD_MAGNETS: Record<LeadMagnetId, LeadMagnetDefinition> = {
  "zones-plan": {
    id: "zones-plan",
    label: "Saved zones + matched training plan",
    beehiivTags: ["lm-zones-plan", "intent-zones"],
    successMessage:
      "You're in. Your zones and matched plan are on the way — check your inbox in the next few minutes.",
  },
  "event-plan": {
    id: "event-plan",
    label: "Event training plan",
    beehiivTags: ["lm-event-plan", "intent-event"],
    successMessage:
      "Locked in. Your event-specific plan is queuing up — check your inbox.",
    acceptsContext: true,
    contextFieldName: "target_event",
  },
  "masters-checklist": {
    id: "masters-checklist",
    label: "Masters Training Checklist",
    beehiivTags: ["lm-masters-checklist", "intent-masters"],
    successMessage:
      "Done. The Masters Training Checklist is on its way — give it a few minutes.",
  },
  "fuelling-guide": {
    id: "fuelling-guide",
    label: "Fuelling guide",
    beehiivTags: ["lm-fuelling-guide", "intent-nutrition"],
    successMessage:
      "Sent. Watch your inbox for the fuelling guide — and use the calculator above for your next session.",
  },
  "strength-2day": {
    id: "strength-2day",
    label: "2-Day Cyclist Gym Plan",
    beehiivTags: ["lm-strength-2day", "intent-strength"],
    successMessage:
      "Done. The 2-Day Cyclist Gym Plan is queuing up — first email lands in a few minutes.",
  },
  "episode-playlist": {
    id: "episode-playlist",
    label: "Curated episode playlist",
    beehiivTags: ["lm-episode-playlist", "intent-podcast"],
    successMessage:
      "You're in. The curated playlist is on its way — first email lands in a few minutes.",
    acceptsContext: true,
    contextFieldName: "playlist_topic",
  },
};

export function getLeadMagnet(id: LeadMagnetId): LeadMagnetDefinition {
  return LEAD_MAGNETS[id];
}

export function isLeadMagnetId(value: unknown): value is LeadMagnetId {
  return typeof value === "string" && value in LEAD_MAGNETS;
}
