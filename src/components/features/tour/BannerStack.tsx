"use client";

import dynamic from "next/dynamic";
import { isTourActive } from "@/lib/tour";

/**
 * Single top-banner slot. During the Tour window the yellow Tour banner
 * takes over; otherwise the normal cohort apply banner shows. Both write
 * the same `--cohort-banner-height` var, so only ever one occupies the
 * slot and the Header offset is unaffected.
 *
 * Both banners are loaded via next/dynamic (ssr:false) — the same kind the
 * cohort banner has always used — so the date-driven choice here never
 * causes a hydration mismatch and the module graph stays consistent.
 */
const TourBanner = dynamic(
  () => import("./TourBanner").then((m) => m.TourBanner),
  { ssr: false },
);

const CohortBanner = dynamic(
  () =>
    import("@/components/features/conversion/CohortBanner").then(
      (m) => m.CohortBanner,
    ),
  { ssr: false },
);

export function BannerStack() {
  return isTourActive() ? <TourBanner /> : <CohortBanner />;
}
