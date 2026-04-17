"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";

const SmoothCursor = dynamic(
  () => import("@/components/ui/SmoothCursor").then((mod) => mod.SmoothCursor),
  { ssr: false }
);

export function SmoothCursorWrapper() {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;
  return <SmoothCursor />;
}
