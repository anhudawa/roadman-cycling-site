import type { Metadata } from "next";
import { getRiderSession } from "@/lib/profile-auth/auth";
import { getMethodSession } from "@/lib/method/auth";
import { loadByEmail } from "@/lib/rider-profile/store";
import { FTPZonesClient } from "./FTPZonesClient";

export const metadata: Metadata = {
  title: {
    absolute: "FTP Calculator: 7 Cycling Power Zones (2026)",
  },
  description:
    "Enter your FTP to calculate seven cycling power zones with gap-free watt ranges. Free, instant, coach-reviewed, with test guidance and evidence limits.",
  alternates: {
    canonical: "https://roadmancycling.com/tools/ftp-zones",
  },
  openGraph: {
    title: "FTP Calculator: 7 Cycling Power Zones (2026)",
    description:
      "Calculate seven cycling power zones from FTP, with gap-free watt ranges, test guidance and evidence limits.",
    type: "website",
    url: "https://roadmancycling.com/tools/ftp-zones",
  },
};

/**
 * Server wrapper that pulls the rider's stored FTP (if signed in)
 * and pre-fills the calculator. Falls through to anonymous if no
 * session — the tool remains usable for cold visitors.
 */
export default async function FTPZonesPage() {
  let initialFtp: number | null = null;

  const riderSession = await getRiderSession().catch(() => null);
  const email =
    riderSession?.profile.email ??
    (await getMethodSession().catch(() => null))?.enrollment.email ??
    null;

  if (email) {
    const profile = await loadByEmail(email);
    if (profile?.currentFtp) initialFtp = profile.currentFtp;
  }

  return <FTPZonesClient initialFtp={initialFtp} />;
}
