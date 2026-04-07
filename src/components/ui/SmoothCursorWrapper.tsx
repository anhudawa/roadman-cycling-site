"use client";

import dynamic from "next/dynamic";

const SmoothCursor = dynamic(
  () => import("@/components/ui/SmoothCursor").then((mod) => mod.SmoothCursor),
  { ssr: false }
);

export function SmoothCursorWrapper() {
  return <SmoothCursor />;
}
