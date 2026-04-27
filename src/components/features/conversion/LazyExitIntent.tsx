"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";

const ExitIntentPopup = dynamic(
  () =>
    import("@/components/features/conversion/ExitIntentPopup").then(
      (mod) => mod.ExitIntentPopup
    ),
  { ssr: false }
);

// Pages where the exit-intent popup must not fire. The popup mounts as a
// fixed z-[10000] overlay across the entire viewport, which blocks the
// shared header — including the Roadman logo's link back to '/'. On pages
// where a user is mid-flow with an interactive tool, that overlay reads as
// "the site is broken" rather than "we have a newsletter offer". Tool and
// utility surfaces are excluded; landing pages keep the popup.
const POPUP_EXCLUDED_PATHS = ["/apply", "/predict", "/ask", "/tools"];
const POPUP_EXCLUDED_PREFIXES = ["/admin", "/predict/", "/ask/", "/tools/"];

export function LazyExitIntent() {
  const pathname = usePathname();
  const blocked =
    POPUP_EXCLUDED_PATHS.includes(pathname) ||
    POPUP_EXCLUDED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  if (blocked) return null;
  return <ExitIntentPopup />;
}
