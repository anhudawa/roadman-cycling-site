export const APPLICATION_START_OPTIONS = [
  { value: "right_now", label: "Right now" },
  { value: "coming_weeks", label: "Coming weeks" },
  { value: "specific_date", label: "Specific date" },
] as const;

export type ApplicationStartPreference =
  (typeof APPLICATION_START_OPTIONS)[number]["value"];

export function isApplicationStartPreference(
  value: unknown,
): value is ApplicationStartPreference {
  return APPLICATION_START_OPTIONS.some((option) => option.value === value);
}

export function isIsoCalendarDate(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const [year, month, day] = value.split("-").map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));
  return (
    parsed.getUTCFullYear() === year &&
    parsed.getUTCMonth() === month - 1 &&
    parsed.getUTCDate() === day
  );
}

export function isValidApplicationStartDate(
  value: unknown,
  todayIso: string,
): value is string {
  return isIsoCalendarDate(value) && value >= todayIso;
}

export function formatApplicationStart(
  preference: string | null | undefined,
  preferredStartDate: string | null | undefined,
): string {
  if (preference === "right_now") return "Right now";
  if (preference === "coming_weeks") return "Coming weeks";
  if (preference === "specific_date") {
    return preferredStartDate
      ? `Specific date — ${formatApplicationStartDate(preferredStartDate)}`
      : "Specific date";
  }
  return "Not provided";
}

export function formatApplicationStartDate(value: string): string {
  if (!isIsoCalendarDate(value)) return value;
  const [year, month, day] = value.split("-").map(Number);
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, day)));
}
