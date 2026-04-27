/**
 * `const track = useTrack(); track('email_captured', { email })`
 *
 * Thin wrapper over the multi-destination `track()` from
 * `@/lib/analytics/events` that auto-injects the current page path,
 * document.referrer, and (if known) a stable client-side session id.
 *
 * Session-id sourcing: we DON'T read the httpOnly `roadman_ask_anon`
 * cookie (we can't from JS — that's the point). Instead we maintain a
 * separate, JS-visible `roadman_funnel_sid` in sessionStorage so
 * client-side fan-out destinations (Vercel Analytics, GA4) can correlate
 * within a tab. The server-side sink reads the httpOnly cookie itself
 * inside `/api/events`, so the canonical session id in the database
 * remains the auth-grade one.
 */

"use client";

import { usePathname } from "next/navigation";
import { useCallback } from "react";
import {
  track as dispatch,
  type EventPropsByName,
  type FunnelEventName,
  type TrackContext,
} from "@/lib/analytics/events";
import type { EventType } from "@/lib/admin/events-store";

const SID_KEY = "roadman_funnel_sid";

function readOrCreateClientSid(): string | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    const existing = window.sessionStorage.getItem(SID_KEY);
    if (existing) return existing;
    // crypto.randomUUID is widely supported in modern browsers; fall back
    // to a short timestamp+random combo if it isn't available.
    const next =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
    window.sessionStorage.setItem(SID_KEY, next);
    return next;
  } catch {
    return undefined;
  }
}

export interface TrackFunction {
  <N extends FunnelEventName>(name: N, props?: EventPropsByName[N], ctx?: Partial<TrackContext>): void;
  (name: EventType, props?: Record<string, unknown>, ctx?: Partial<TrackContext>): void;
}

/**
 * Hook returning a stable `track` callback. The callback memoizes on
 * pathname/search so re-renders don't churn the reference, and pulls a
 * fresh referrer at each call (referrer can shift mid-session if the page
 * navigates).
 */
/**
 * We deliberately avoid `useSearchParams` here. It would force every page
 * that calls `useTrack` to sit inside a Suspense boundary at static-prerender
 * time. Reading `window.location.search` at *call* time is functionally
 * equivalent for analytics (we just want the URL the user actually saw)
 * and lets the hook be safely invoked in any client component, statically
 * prerendered or not.
 */
export function useTrack(): TrackFunction {
  const pathname = usePathname();

  const track = useCallback(
    (name: string, props?: Record<string, unknown>, ctx?: Partial<TrackContext>) => {
      const search =
        typeof window !== "undefined" && window.location.search
          ? window.location.search
          : "";
      const page = ctx?.page ?? `${pathname || "/"}${search}`;
      const sessionId = ctx?.sessionId ?? readOrCreateClientSid();
      const referrer = ctx?.referrer ?? (typeof document !== "undefined" ? document.referrer || undefined : undefined);
      // Cast through `unknown` because the public `track` is overloaded —
      // the runtime accepts any string event name; the overloads only
      // enforce typed props for known funnel events at call sites.
      (dispatch as unknown as (n: string, p?: Record<string, unknown>, c?: TrackContext) => void)(
        name,
        props,
        { page, sessionId, referrer, variantId: ctx?.variantId },
      );
    },
    [pathname],
  );
  return track as TrackFunction;
}
