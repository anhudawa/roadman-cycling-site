"use client";

import dynamic from "next/dynamic";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

const SmoothCursor = dynamic(
  () => import("@/components/ui/SmoothCursor").then((mod) => mod.SmoothCursor),
  { ssr: false }
);

export function SmoothCursorWrapper() {
  const pathname = usePathname();
  const active = !pathname?.startsWith("/admin");

  // Body class gates the global `cursor: none` rule in globals.css. Coupling
  // the rule to component lifecycle guarantees the native cursor is only
  // hidden where the custom cursor is actually drawn — preventing the
  // invisible-cursor regression on routes that skip ConversionChrome.
  useEffect(() => {
    if (!active) return;
    document.body.classList.add("smooth-cursor");
    return () => {
      document.body.classList.remove("smooth-cursor");
    };
  }, [active]);

  if (!active) return null;
  return <SmoothCursor />;
}
