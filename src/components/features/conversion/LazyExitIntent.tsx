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

export function LazyExitIntent() {
  const pathname = usePathname();
  if (pathname.startsWith("/admin") || pathname === "/2026") return null;
  return <ExitIntentPopup />;
}
