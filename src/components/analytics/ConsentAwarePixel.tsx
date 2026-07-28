"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { trackConsentedMetaEvent } from "@/lib/analytics/third-party-tags";

export function ConsentAwarePixel() {
  const pathname = usePathname();
  const lastPageViewRef = useRef<string | null>(null);

  useEffect(() => {
    const pagePath = `${pathname || "/"}${window.location.search || ""}`;
    if (lastPageViewRef.current === pagePath) return;
    lastPageViewRef.current = pagePath;
    trackConsentedMetaEvent("PageView");
  }, [pathname]);

  return null;
}
