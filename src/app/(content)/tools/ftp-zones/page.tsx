import type { Metadata } from "next";
import { getRiderSession } from "@/lib/profile-auth/auth";
import { getMethodSession } from "@/lib/method/auth";
import { loadByEmail } from "@/lib/rider-profile/store";
import { FTPZonesClient } from "./FTPZonesClient";

export const metadata: Metadata = {
  title: "FTP Power Zone Calculator — Your 7 Cycling Training Zones",
  description:
    "Enter your FTP, get your 7-zone power table instantly. Free, no signup, pre-filled if you've saved an FTP to your Roadman profile. Built on the Coggan zone model.",
  alternates: {
    canonical: "https://roadmancycling.com/tools/ftp-zones",
  },
  openGraph: {
    title: "FTP Power Zone Calculator — Your 7 Cycling Training Zones",
    description:
      "Enter your FTP and get your 7-zone power table instantly. Free, no signup needed. Built on the Coggan zone model.",
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
