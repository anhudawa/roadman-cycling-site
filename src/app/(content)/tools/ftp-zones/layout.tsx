import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FTP Zone Calculator — Free Cycling Power Zone Tool",
  description:
    "Calculate your 7 cycling power zones from your FTP instantly. Free tool based on the training methodology discussed with Professor Seiler and World Tour coaches.",
  keywords: ["FTP zone calculator", "cycling power zones", "FTP calculator", "training zones cycling"],
  alternates: { canonical: "https://roadmancycling.com/tools/ftp-zones" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
