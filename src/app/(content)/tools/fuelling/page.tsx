import type { Metadata } from "next";
import { getRiderSession } from "@/lib/profile-auth/auth";
import { getMethodSession } from "@/lib/method/auth";
import { loadByEmail } from "@/lib/rider-profile/store";
import { FuellingClient } from "./FuellingClient";

export const metadata: Metadata = {
  title: "Cycling Fuelling Calculator | Carbs, Fluid, Sodium per Hour | Roadman",
  description:
    "Evidence-based fuelling for endurance cycling. Get carbs/hour, fluid/hour, and sodium targets for your session. Pre-filled from your Roadman rider profile.",
  alternates: { canonical: "https://roadmancycling.com/tools/fuelling" },
  openGraph: {
    title: "Cycling Fuelling Calculator",
    description: "Evidence-based carbs, fluid, and sodium per hour for endurance cycling.",
    type: "website",
    url: "https://roadmancycling.com/tools/fuelling",
  },
};

/**
 * Server wrapper — pulls weight + FTP from the rider profile when
 * signed in and pre-fills the calculator. Anonymous riders still get
 * the full tool, just without pre-fills.
 */
export default async function FuellingPage() {
  let initialWeightKg: number | null = null;
  let initialFtp: number | null = null;

  const riderSession = await getRiderSession().catch(() => null);
  const email =
    riderSession?.profile.email ??
    (await getMethodSession().catch(() => null))?.enrollment.email ??
    null;

  if (email) {
    const profile = await loadByEmail(email);
    if (profile?.currentWeight) {
      initialWeightKg =
        profile.weightUnit === "lb"
          ? Math.round(profile.currentWeight * 0.45359237 * 10) / 10
          : profile.currentWeight;
    }
    if (profile?.currentFtp) initialFtp = profile.currentFtp;
  }

  return <FuellingClient initialWeightKg={initialWeightKg} initialFtp={initialFtp} />;
}
