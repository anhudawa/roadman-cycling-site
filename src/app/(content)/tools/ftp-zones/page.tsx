import type { Metadata } from "next";
import { FTPZonesClient } from "./FTPZonesClient";

// Keep this high-demand public search owner static. Optional signed-in FTP
// defaults arrive from a private endpoint after hydration.
export const dynamic = "force-static";

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

export default function FTPZonesPage() {
  return <FTPZonesClient />;
}
