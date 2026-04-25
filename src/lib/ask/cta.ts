/**
 * CTA selection.
 *
 * Intent + rider profile hints + retrieval signals map to a single contextual
 * CTA. Exhaustive switch over `Intent` $€” TypeScript will complain if a new
 * intent is added without a routing decision.
 */

import type { CtaDescriptor, CtaKey, Intent, RetrievedChunk } from "./types";

export interface CtaPickInput {
  intent: Intent;
  hasProfile: boolean;
  coachingInterest?: "none" | "curious" | "interested" | "ready" | null;
  retrieved: RetrievedChunk[];
}

export const CTA_CATALOG: Record<Exclude<CtaKey, "none">, CtaDescriptor> = {
  plateau_diagnostic: {
    key: "plateau_diagnostic",
    title: "Take the Plateau Diagnostic",
    body: "Three minutes. Get a named diagnosis, a 4-week fix, and an honest read on what's really holding you back.",
    href: "/diagnostic/plateau",
    analyticsEvent: "cta_clicked:plateau_diagnostic",
  },
  fuelling_calculator: {
    key: "fuelling_calculator",
    title: "Build your fuelling plan",
    body: "Tell us the session, get a gram-per-hour plan with exact bottle and feed math.",
    href: "/tools/fuelling",
    analyticsEvent: "cta_clicked:fuelling_calculator",
  },
  ftp_zones: {
    key: "ftp_zones",
    title: "Calculate your zones",
    body: "Punch in your FTP $€” get Coggan, Seiler, and the zones Anthony actually uses.",
    href: "/tools/ftp-zones",
    analyticsEvent: "cta_clicked:ftp_zones",
  },
  saturday_spin: {
    key: "saturday_spin",
    title: "Get Saturday Spin",
    body: "Anthony's weekly newsletter $€” one performance idea, grounded, no fluff.",
    href: "/saturday-spin",
    analyticsEvent: "cta_clicked:saturday_spin",
  },
  clubhouse: {
    key: "clubhouse",
    title: "Join the Roadman Clubhouse",
    body: "Free community of serious amateur cyclists. Live Q&As with Anthony weekly.",
    href: "https://www.skool.com/roadman",
    analyticsEvent: "cta_clicked:clubhouse",
  },
  roadman_plus: {
    key: "roadman_plus",
    title: "Roadman+ $€” Coming Soon",
    body: "Digital-only access to training plans, masterclasses, and structured coaching content. Launching later this year.",
    href: "/roadman-plus",
    analyticsEvent: "cta_clicked:roadman_plus",
  },
  ndy_coaching: {
    key: "ndy_coaching",
    title: "Inside Not Done Yet",
    body: "The paid Roadman community with Vekta plans, weekly coaching calls, and S&C roadmap.",
    href: "https://www.skool.com/roadman-not-done-yet",
    analyticsEvent: "cta_clicked:ndy_coaching",
  },
  vip_coaching: {
    key: "vip_coaching",
    title: "Apply for VIP 1:1",
    body: "Private coaching with Anthony $€” limited roster. Book a strategy call first.",
    href: "/coaching/apply",
    analyticsEvent: "cta_clicked:vip_coaching",
  },
  episode_list: {
    key: "episode_list",
    title: "Browse the podcast archive",
    body: "Every Roadman episode by topic $€” zone 2, fuelling, masters, pro stories, more.",
    href: "/podcast",
    analyticsEvent: "cta_clicked:episode_list",
  },
};

const NO_CTA: CtaDescriptor = {
  key: "none",
  title: "",
  body: "",
  href: "",
  analyticsEvent: "cta_clicked:none",
};

export function pickCta(input: CtaPickInput): CtaDescriptor {
  const intent = input.intent;
  switch (intent) {
    case "plateau":
      return CTA_CATALOG.plateau_diagnostic;
    case "fuelling":
      return CTA_CATALOG.fuelling_calculator;
    case "event_prep":
      return input.hasProfile ? CTA_CATALOG.ndy_coaching : CTA_CATALOG.plateau_diagnostic;
    case "coaching_decision":
      if (input.coachingInterest === "ready") return CTA_CATALOG.vip_coaching;
      if (input.coachingInterest === "interested") return CTA_CATALOG.ndy_coaching;
      return CTA_CATALOG.roadman_plus;
    case "recovery_masters":
      return CTA_CATALOG.clubhouse;
    case "content_discovery":
      return CTA_CATALOG.episode_list;
    case "training_general":
      return input.retrieved.length > 0 ? CTA_CATALOG.saturday_spin : CTA_CATALOG.clubhouse;
    case "off_topic":
    case "unknown":
    case "safety_medical":
    case "safety_injury":
    case "safety_weight":
      return NO_CTA;
    default: {
      const _exhaustive: never = intent;
      void _exhaustive;
      return NO_CTA;
    }
  }
}
