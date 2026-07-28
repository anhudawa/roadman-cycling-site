"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import {
  configureConsentedGoogleTags,
  getGa4Id,
  trackConsentedGoogleEvent,
} from "@/lib/analytics/third-party-tags";

export function GoogleConsentRuntime({
  analytics,
  marketing,
}: {
  analytics: boolean;
  marketing: boolean;
}) {
  const pathname = usePathname();
  const lastPageViewRef = useRef<string | null>(null);

  useEffect(() => {
    if (!analytics && !marketing) return;
    configureConsentedGoogleTags();
  }, [analytics, marketing]);

  useEffect(() => {
    if (!analytics || !getGa4Id()) return;
    const pagePath = `${pathname || "/"}${window.location.search || ""}`;
    if (lastPageViewRef.current === pagePath) return;
    lastPageViewRef.current = pagePath;
    trackConsentedGoogleEvent(
      "page_view",
      {
        page_path: pagePath,
        page_location: window.location.href,
        page_title: document.title,
      },
      "analytics",
    );
  }, [analytics, pathname]);

  return null;
}
