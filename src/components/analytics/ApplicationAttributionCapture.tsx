"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import {
  captureApplicationAttribution,
  restoreAttributionToApplicationUrl,
} from "@/lib/analytics/application-attribution";

export function ApplicationAttributionCapture() {
  const pathname = usePathname();

  useEffect(() => {
    captureApplicationAttribution();
    restoreAttributionToApplicationUrl();
  }, [pathname]);

  return null;
}
