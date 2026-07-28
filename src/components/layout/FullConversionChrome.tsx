"use client";

import { LazyExitIntent } from "@/components/features/conversion/LazyExitIntent";
import { MobileStickyApply } from "@/components/features/conversion/MobileStickyApply";
import { BannerStack } from "@/components/features/tour/BannerStack";
import { SmoothCursorWrapper } from "@/components/ui/SmoothCursorWrapper";

export function FullConversionChrome() {
  return (
    <>
      <SmoothCursorWrapper />
      <BannerStack />
      <MobileStickyApply />
      <LazyExitIntent />
    </>
  );
}
