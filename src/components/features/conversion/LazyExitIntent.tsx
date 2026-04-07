"use client";

import dynamic from "next/dynamic";

const ExitIntentPopup = dynamic(
  () =>
    import("@/components/features/conversion/ExitIntentPopup").then(
      (mod) => mod.ExitIntentPopup
    ),
  { ssr: false }
);

export function LazyExitIntent() {
  return <ExitIntentPopup />;
}
