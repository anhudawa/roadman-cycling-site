/**
 * Helpers for the published weekly community schedule.
 * Annual race guides must not infer a specific date from a usual month.
 * Only use Event markup when the underlying schedule is actually known.
 */
export const EVENT_STATUS_SCHEDULED = "https://schema.org/EventScheduled";

const WEEKDAY_INDEX: Record<string, number> = {
  Sunday: 0,
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
};

/**
 * Derive an ISO date (`YYYY-MM-DD`) for the next occurrence of a weekly
 * event on the given weekday. `day` accepts a schema.org day URL
 * (`https://schema.org/Monday`) or a bare weekday name. Returns today
 * when the event falls today. Pairs with an `eventSchedule` that carries
 * the time-of-day, so the top-level Event has the `startDate` Google's
 * Event rich-result requires without pinning a timezone-sensitive
 * datetime. Returns `undefined` for an unrecognised day.
 */
export function nextWeekdayDate(
  day: string,
  now: Date = new Date(),
): string | undefined {
  const name = day.split("/").pop() ?? day;
  const target = WEEKDAY_INDEX[name];
  if (target === undefined) return undefined;
  const delta = (target - now.getDay() + 7) % 7;
  const d = new Date(now);
  d.setDate(now.getDate() + delta);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day2 = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day2}`;
}
