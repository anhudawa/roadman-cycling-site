/**
 * Shared helpers for Event / SportsEvent JSON-LD.
 *
 * Google's Event rich-result requires `startDate` and a `location`. Many
 * of our event pages (annual sportives, race guides) are evergreen and
 * only know the *month* an event usually runs — not a fixed calendar
 * date. These helpers derive a valid ISO `startDate` for the next
 * upcoming occurrence so the markup validates, and centralise the
 * `eventStatus` constant so every emitter agrees.
 *
 * IMPORTANT: only emit Event/SportsEvent markup when `nextAnnualStartDate`
 * returns a value. An Event without a `startDate` is invalid in Search
 * Console (that was the root of the 87/126 "invalid events" report), so
 * callers must omit the markup entirely for events with no known month
 * rather than ship a date-less Event.
 */

export const EVENT_STATUS_SCHEDULED = "https://schema.org/EventScheduled";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

/**
 * Derive an ISO `startDate` (`YYYY-MM-DD`, first of the month) for an
 * annual event known only by the month it runs in. Returns the *next*
 * upcoming occurrence so the date is always in the future — a past
 * `startDate` on a recurring event reads as a stale/cancelled event to
 * Google. Returns `undefined` when the month is missing or unparseable,
 * which signals the caller to omit Event markup entirely.
 *
 * A first-of-month day is a deliberate placeholder: these annual events
 * shift by a few days each year, so we assert only the month we actually
 * know, paired with `eventStatus: EventScheduled`. Full `YYYY-MM-DD`
 * (rather than a bare `YYYY-MM`) is used because Google's validator is
 * unambiguous about accepting complete dates.
 */
export function nextAnnualStartDate(
  month: string | undefined | null,
  now: Date = new Date(),
): string | undefined {
  if (!month) return undefined;
  const mi = MONTHS.indexOf(month.trim() as (typeof MONTHS)[number]);
  if (mi < 0) return undefined;
  const year =
    mi >= now.getMonth() ? now.getFullYear() : now.getFullYear() + 1;
  return `${year}-${String(mi + 1).padStart(2, "0")}-01`;
}

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
