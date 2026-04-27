/**
 * Typed conversion-funnel events + multi-destination dispatcher.
 *
 * Why this module exists:
 * - The internal `EventType` union in `@/lib/admin/events-store` is the
 *   server-side allowlist. This module re-exports the funnel-relevant
 *   subset with a friendlier client surface and a `track()` that fans out
 *   to GA4, Vercel Analytics, and the internal `/api/events` sink in one
 *   call.
 * - Callers who don't care about destinations or auto-context just call
 *   `track('email_captured', { email })` and stop thinking.
 *
 * Destinations:
 *   - Internal:  POST /api/events (writes to the `events` Postgres table)
 *   - GA4:       window.gtag (existing, untouched)
 *   - Vercel:    @vercel/analytics `track()` (added 2026-04)
 *
 * On the server (RSC, route handlers), import `recordEvent` directly from
 * `@/lib/admin/events-store` — `track()` here is client-only.
 */

import type { EventType } from "@/lib/admin/events-store";
import { track as vercelTrack } from "@vercel/analytics";

// Funnel events — the named subset the conversion dashboard cares about.
// All of these are part of `EventType`; this is just the friendlier surface.
export const FUNNEL_EVENTS = {
  PAGE_VIEW: "page_view",
  PREDICTION_STARTED: "prediction_started",
  PREDICTION_COMPLETED: "prediction_completed",
  EMAIL_CAPTURED: "email_captured",
  REPORT_PURCHASED: "report_purchased",
  COMMUNITY_CTA_CLICKED: "community_cta_clicked",
  ASK_ROADMAN_USED: "ask_roadman_used",
  RACE_PAGE_VIEWED: "race_page_viewed",
  SHARE_CLICKED: "share_clicked",
} as const;

export type FunnelEventName = (typeof FUNNEL_EVENTS)[keyof typeof FUNNEL_EVENTS];

// Per-event property shapes. Keep these tight — anything optional but
// useful goes in `meta`. All values are strings so they round-trip cleanly
// through the `events.meta` jsonb column (which is typed as
// Record<string, string> on insert).
type Props = Record<string, string | number | boolean | null | undefined>;

export interface EventPropsByName {
  page_view: Props;
  prediction_started: { tool: string } & Props;
  prediction_completed: { tool: string; resultSlug?: string } & Props;
  email_captured: { source?: string; email?: string } & Props;
  report_purchased: { product: string; price?: number } & Props;
  community_cta_clicked: { destination: "skool" | "newsletter" | "apply" | "other"; placement?: string } & Props;
  ask_roadman_used: { intent?: string; sessionId?: string } & Props;
  race_page_viewed: { race: string } & Props;
  share_clicked: { channel: "twitter" | "facebook" | "email" | "copy" | "other"; url?: string } & Props;
}

export interface TrackContext {
  /** Override the auto-detected current page path. */
  page?: string;
  /** Stable session id (anon cookie or rider profile id). */
  sessionId?: string;
  /** document.referrer at the time of the event. */
  referrer?: string;
  /** A/B variant id (existing system). */
  variantId?: string;
}

const INTERNAL_ENDPOINT = "/api/events";

/**
 * Coerce a typed Props object to the wire-shape the internal sink expects:
 * a flat `Record<string, string>` for the `meta` jsonb column.
 *
 * Numbers / booleans are stringified; null and undefined are dropped so we
 * don't pollute the meta column with empty values.
 */
function coerceMeta(props: Props | undefined): Record<string, string> | undefined {
  if (!props) return undefined;
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(props)) {
    if (v === null || v === undefined) continue;
    out[k] = typeof v === "string" ? v : String(v);
  }
  return Object.keys(out).length === 0 ? undefined : out;
}

function currentPage(): string {
  if (typeof window === "undefined") return "/";
  return window.location.pathname + (window.location.search || "");
}

function currentReferrer(): string | undefined {
  if (typeof document === "undefined") return undefined;
  return document.referrer || undefined;
}

function postInternal(payload: {
  type: EventType;
  page: string;
  meta?: Record<string, string>;
  session_id?: string;
  variant_id?: string;
  referrer?: string;
  email?: string;
  source?: string;
}): void {
  if (typeof window === "undefined") return;
  try {
    fetch(INTERNAL_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => undefined);
  } catch {
    // analytics never breaks user flow
  }
}

interface GtagFn {
  (command: "event", action: string, params?: Record<string, unknown>): void;
}
interface AnalyticsWindow extends Window {
  gtag?: GtagFn;
}

function postVercel(name: string, props: Props | undefined): void {
  if (typeof window === "undefined") return;
  // Vercel Analytics accepts string/number/boolean/null only — drop any
  // undefined properties so the SDK doesn't choke on optional fields.
  const safe: Record<string, string | number | boolean | null> = {};
  for (const [k, v] of Object.entries(props ?? {})) {
    if (v === undefined) continue;
    safe[k] = v;
  }
  try {
    vercelTrack(name, Object.keys(safe).length ? safe : undefined);
  } catch {
    // ignore — analytics never breaks user flow
  }
}

function postGa4(name: string, props: Props | undefined): void {
  if (typeof window === "undefined") return;
  const w = window as AnalyticsWindow;
  if (typeof w.gtag !== "function") return;
  try {
    w.gtag("event", name, props ?? {});
  } catch {
    // ignore
  }
}

/**
 * Fire-and-forget event tracker. Fans out to the internal sink, GA4 (if
 * configured), and Vercel Analytics (if loaded). Never throws.
 *
 * The function signature is overloaded for known funnel events (typed
 * props) and falls through to a permissive shape for events outside the
 * funnel set so callers can still use the existing event vocabulary.
 */
export function track<N extends FunnelEventName>(
  name: N,
  props?: EventPropsByName[N],
  ctx?: TrackContext,
): void;
export function track(name: EventType, props?: Props, ctx?: TrackContext): void;
export function track(name: string, props?: Props, ctx?: TrackContext): void {
  const page = ctx?.page ?? currentPage();
  const referrer = ctx?.referrer ?? currentReferrer();
  const meta = coerceMeta(props);

  // Pull email/source out of meta if the caller passed them — the events
  // table has dedicated columns, and signup-style events trigger the
  // subscriber upsert on the server only when `email` is at the top level.
  const email = typeof props?.email === "string" ? (props.email as string) : undefined;
  const source = typeof props?.source === "string" ? (props.source as string) : undefined;

  postInternal({
    type: name as EventType,
    page,
    meta,
    session_id: ctx?.sessionId,
    variant_id: ctx?.variantId,
    referrer,
    email,
    source,
  });
  postVercel(name, props);
  postGa4(name, props);
}
