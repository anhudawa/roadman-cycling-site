/**
 * Deterministic regex safety pre-filter + fixed escalation templates.
 *
 * Philosophy: false positives are tolerable (an extra "go see a pro" response
 * is harmless). False negatives are not $€” so this is a cheap, predictable
 * layer that runs BEFORE the model sees anything. No hidden LLM judgement.
 *
 * Also exports a post-filter that scans assistant output for invented
 * episode citations (any `"title"` the retrieval set didn't contain).
 */

import type { CtaDescriptor, SafetyDecision, SafetyFlag } from "./types";

const MEDICAL_PATTERNS: RegExp[] = [
  /\bchest (pain|tightness|pressure)\b/i,
  /\bheart (attack|arrhythmia|palpitation)/i,
  /\bfaint(ed|ing)?\b/i,
  /\bpassed out\b/i,
  /\bblack(ed)? out\b/i,
  /\bshortness of breath\b/i,
  /\bcoughing up\b/i,
  /\bvision (blurred|loss|problems)\b/i,
  /\bbleeding\b/i,
  /\bsevere (pain|headache|dizziness)\b/i,
  /\bcan't breathe\b/i,
  /\bhaving a heart/i,
];

const INJURY_PATTERNS: RegExp[] = [
  /\b(torn|tore|ruptur(e|ed)|broken|fractur(e|ed))\b/i,
  /\bacl\b|\bpcl\b|\bmcl\b|\bmeniscus\b/i,
  /\bstress fracture\b/i,
  /\bherniat(ed|ion)\b/i,
  /\btendon rupture\b/i,
  /\bacute (injury|pain)\b/i,
];

const WEIGHT_PATTERNS: RegExp[] = [
  /\bdrop (\d{2,})\s*(kg|lb|pounds)\b/i,
  /\blose (\d{2,})\s*(kg|lb|pounds) in (\d+)\s*(day|week|month)/i,
  /\banorexi[ac]\b|\bbulimi[ac]\b|\beating disorder\b/i,
  /\bstop eating\b|\bstarve (myself|me)\b/i,
  /\b(under|extreme) (caloric? )?deficit\b/i,
];

const DANGEROUS_PATTERNS: RegExp[] = [
  /\btrain through (chest pain|severe pain|pneumonia|flu)\b/i,
  /\bride with (a )?concussion\b/i,
];

function matches(patterns: RegExp[], text: string): boolean {
  return patterns.some((p) => p.test(text));
}

export function detectSafety(query: string): SafetyDecision {
  const flags: SafetyFlag[] = [];
  let templateKey: SafetyDecision["templateKey"];

  if (matches(MEDICAL_PATTERNS, query)) {
    flags.push("medical_escalation");
    templateKey = templateKey ?? "medical";
  }
  if (matches(INJURY_PATTERNS, query)) {
    flags.push("injury_escalation");
    templateKey = templateKey ?? "injury";
  }
  if (matches(WEIGHT_PATTERNS, query)) {
    flags.push("extreme_weight_loss");
    templateKey = templateKey ?? "weight";
  }
  if (matches(DANGEROUS_PATTERNS, query)) {
    flags.push("dangerous_training");
    templateKey = templateKey ?? "dangerous";
  }

  return {
    flags,
    block: flags.length > 0,
    templateKey,
  };
}

export function isBlocked(d: SafetyDecision): boolean {
  return d.block;
}

const SATURDAY_SPIN_CTA: CtaDescriptor = {
  key: "saturday_spin",
  title: "Get Saturday Spin",
  body: "Roadman's weekly newsletter $€” safe, evidence-led performance writing.",
  href: "https://roadmancycling.com/saturday-spin",
  analyticsEvent: "cta_clicked:saturday_spin",
};

const CLUBHOUSE_CTA: CtaDescriptor = {
  key: "clubhouse",
  title: "Join the Clubhouse",
  body: "Free Roadman community $€” ask riders and coaches who've been there.",
  href: "https://www.skool.com/roadman",
  analyticsEvent: "cta_clicked:clubhouse",
};

export interface SafeResponseOutput {
  text: string;
  cta: CtaDescriptor;
}

export function buildSafeResponse(decision: SafetyDecision): SafeResponseOutput {
  switch (decision.templateKey) {
    case "medical":
      return {
        text:
          "This sounds like a medical concern, not a training question. Please stop riding and speak to a doctor $€” same-day if the symptoms are new or getting worse. Chest pain, fainting, shortness of breath, or sudden vision changes can be serious and a GP or A&E is the right next call, not an AI or a coach.\n\nOnce you've been medically cleared, Roadman's nutrition, zone 2, and recovery content can help rebuild $€” but get the medical side sorted first.",
        cta: SATURDAY_SPIN_CTA,
      };
    case "injury":
      return {
        text:
          "For an acute injury like this, a physio or sports-medicine doctor is the right first stop $€” not an AI, a coach, or a training app. Rehab prescriptions need hands-on assessment that we can't replicate.\n\nOnce you've got a diagnosis and a rehab plan, Roadman has content on getting back into riding conservatively $€” but don't skip the assessment.",
        cta: CLUBHOUSE_CTA,
      };
    case "weight":
      return {
        text:
          "Large, fast weight cuts aren't something we'll help design. Underfuelling wrecks training adaptations, wrecks recovery, and in some cases wrecks health. If food feels out of control, please speak to a registered dietitian or your GP $€” that's the right support, not a cycling AI.\n\nRoadman's nutrition content focuses on fuelling for performance and sustainable body composition changes measured in months, not weeks.",
        cta: SATURDAY_SPIN_CTA,
      };
    case "dangerous":
      return {
        text:
          "Training through serious symptoms isn't something we'll encourage. Take the session off, get the issue properly assessed, and come back when you're clear.",
        cta: SATURDAY_SPIN_CTA,
      };
    default:
      return {
        text:
          "This one sits outside what Ask Roadman should answer. Please speak to the right professional $€” doctor, physio, or registered dietitian $€” depending on the specifics.",
        cta: SATURDAY_SPIN_CTA,
      };
  }
}

/**
 * Post-filter: scan an assistant response for invented episode references.
 * A quoted title that is directly described as an episode/podcast but doesn't
 * appear in the retrieved set is flagged as invented.
 */
export function postFilterCitations(
  text: string,
  knownTitles: string[],
): { text: string; flaggedInvented: string[] } {
  const flagged: string[] = [];
  const quoted = text.match(/"([^"]{8,120})"/g) ?? [];
  const known = knownTitles.map((t) => t.toLowerCase());

  for (const q of quoted) {
    const inner = q.slice(1, -1);
    const innerLower = inner.toLowerCase();
    const seen = known.some((t) => t.includes(innerLower.slice(0, 30)) || innerLower.includes(t.slice(0, 30)));
    if (seen) continue;

    const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const contextRegex = new RegExp(
      `(episode|podcast)\\s*(named|titled|called)?\\s*${escaped}`,
      "i",
    );
    if (contextRegex.test(text)) {
      flagged.push(inner);
    }
  }
  return { text, flaggedInvented: flagged };
}
