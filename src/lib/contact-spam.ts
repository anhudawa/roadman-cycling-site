export type ContactSpamReason = "honeypot" | "synthetic_payload";

interface ContactSpamInput {
  name?: unknown;
  subject?: unknown;
  message?: unknown;
  website?: unknown;
}

const HUMAN_MESSAGE_HINTS = [
  "advert",
  "brand",
  "campaign",
  "collab",
  "cycling",
  "discuss",
  "hello",
  "interested",
  "media",
  "partner",
  "podcast",
  "roadman",
  "sponsor",
  "together",
  "work",
];

function looksLikeSyntheticToken(value: string): boolean {
  const token = value.trim();
  if (!/^[A-Za-z]{16,32}$/.test(token)) return false;
  const lowerToken = token.toLowerCase();
  if (HUMAN_MESSAGE_HINTS.some((hint) => lowerToken.includes(hint))) {
    return false;
  }

  const uppercaseCount = token.replace(/[^A-Z]/g, "").length;
  const lowercaseCount = token.replace(/[^a-z]/g, "").length;
  let caseTransitions = 0;

  for (let index = 1; index < token.length; index += 1) {
    const previousIsUppercase = /[A-Z]/.test(token[index - 1]);
    const currentIsUppercase = /[A-Z]/.test(token[index]);
    if (previousIsUppercase !== currentIsUppercase) caseTransitions += 1;
  }

  return uppercaseCount >= 5 && lowercaseCount >= 3 && caseTransitions >= 5;
}

function looksLikeSyntheticName(value: string): boolean {
  const name = value.trim();
  if (looksLikeSyntheticToken(name)) return true;

  const parts = name.split(/\s+/);
  return (
    parts.length === 2 &&
    parts.every((part) => /^[A-Z][a-z]{3,11}$/.test(part))
  );
}

/**
 * Detect the low-risk signatures used by automated contact-form submissions.
 * A reason is returned for server-side observability; callers should give bots
 * the same success response as a genuine submission.
 */
export function classifyContactSpam(
  input: ContactSpamInput,
): ContactSpamReason | null {
  if (typeof input.website === "string" && input.website.trim()) {
    return "honeypot";
  }

  if (
    typeof input.name === "string" &&
    typeof input.message === "string" &&
    looksLikeSyntheticName(input.name) &&
    looksLikeSyntheticToken(input.message)
  ) {
    return "synthetic_payload";
  }

  return null;
}
