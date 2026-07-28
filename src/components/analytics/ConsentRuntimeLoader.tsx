"use client";

import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { trackAnalyticsEvent } from "@/lib/analytics/client";
import { readClientConsent } from "@/lib/analytics/consent-client";
import { GoogleConsentRuntime } from "./GoogleConsentRuntime";
import { OptionalRuntimeBoundary } from "./OptionalRuntimeBoundary";

const AnalyticsRuntime = lazy(() =>
  import("./AnalyticsConsentRuntime").then((mod) => ({
    default: mod.AnalyticsConsentRuntime,
  })),
);

const MarketingRuntime = lazy(() =>
  import("./MarketingConsentRuntime").then((mod) => ({
    default: mod.MarketingConsentRuntime,
  })),
);

function AnalyticsEventBootstrap({ enabled }: { enabled: boolean }) {
  const pathname = usePathname();
  const lastPageViewRef = useRef<string | null>(null);

  useEffect(() => {
    if (!enabled || pathname.startsWith("/admin")) return;
    const page = `${pathname || "/"}${window.location.search || ""}`;
    if (lastPageViewRef.current === page) return;
    lastPageViewRef.current = page;
    trackAnalyticsEvent({ type: "pageview", page });
  }, [enabled, pathname]);

  useEffect(() => {
    if (!enabled) return;

    const onClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;
      const trackedElement = target.closest<HTMLElement>("[data-track]");
      const trackId = trackedElement?.getAttribute("data-track");
      if (!trackedElement || !trackId) return;

      const globalTrack = (
        window as unknown as {
          __roadmanTrack?: (
            eventName: string,
            eventMeta?: Record<string, string>,
          ) => void;
        }
      ).__roadmanTrack;
      const meta = {
        track_id: trackId,
        destination: trackedElement.getAttribute("href") || "",
      };
      if (typeof globalTrack === "function") {
        globalTrack("cta_click", meta);
      } else {
        trackAnalyticsEvent({
          type: "cta_click",
          page: `${window.location.pathname}${window.location.search || ""}`,
          meta,
        });
      }
    };

    document.addEventListener("click", onClick, { capture: true });
    return () =>
      document.removeEventListener("click", onClick, { capture: true });
  }, [enabled]);

  return null;
}

export function ConsentRuntimeLoader() {
  const [consent, setConsent] = useState(() => readClientConsent());

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- local consent is only available after hydration
    setConsent(readClientConsent());

    const onConsentUpdated = (event: Event) => {
      const detail = (
        event as CustomEvent<{ analytics?: boolean; marketing?: boolean }>
      ).detail;
      setConsent({
        analytics: detail?.analytics === true,
        marketing: detail?.marketing === true,
      });
    };

    window.addEventListener("consent-updated", onConsentUpdated);
    return () =>
      window.removeEventListener("consent-updated", onConsentUpdated);
  }, []);

  return (
    <>
      <AnalyticsEventBootstrap enabled={consent.analytics} />
      <GoogleConsentRuntime {...consent} />
      {consent.analytics ? (
        <OptionalRuntimeBoundary key="analytics-consented">
          <Suspense fallback={null}>
            <AnalyticsRuntime />
          </Suspense>
        </OptionalRuntimeBoundary>
      ) : null}
      {consent.marketing ? (
        <OptionalRuntimeBoundary key="marketing-consented">
          <Suspense fallback={null}>
            <MarketingRuntime />
          </Suspense>
        </OptionalRuntimeBoundary>
      ) : null}
    </>
  );
}
