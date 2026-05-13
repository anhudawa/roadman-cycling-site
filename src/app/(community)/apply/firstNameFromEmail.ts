/**
 * Derive a displayable first name from an email address. Used by the
 * personalised /apply variant where we don't ask the rider to re-type
 * their name — we read it off the diagnostic submission's email.
 *
 * Best-effort heuristic, not a parser. Falls back to "rider" on input
 * we can't make sense of so the greeting still reads naturally.
 */
export function firstNameFromEmail(input: string): string {
  const trimmed = input.trim();
  const at = trimmed.indexOf("@");
  const local = at === -1 ? trimmed : trimmed.slice(0, at);
  if (!local) return "rider";

  const beforePlus = local.split("+")[0];
  const firstSegment = beforePlus.split(/[._-]/).find((s) => s.length > 0);
  if (!firstSegment) return "rider";

  return firstSegment[0].toUpperCase() + firstSegment.slice(1).toLowerCase();
}
