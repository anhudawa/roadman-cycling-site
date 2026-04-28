import type { Metadata } from "next";
import { ToolSchemas } from "@/components/seo/ToolSchemas";

export const metadata: Metadata = {
  title: "Heart Rate Zone Calculator — Free Cycling HR Zones",
  description:
    "Calculate your 5 heart rate training zones from your max HR or LTHR. Free tool for cyclists who train by heart rate.",
  keywords: ["heart rate zone calculator", "cycling HR zones", "heart rate training zones", "max heart rate zones"],
  alternates: { canonical: "https://roadmancycling.com/tools/hr-zones" },
  openGraph: {
    title: "Heart Rate Zone Calculator — Free Cycling HR Zones",
    description: "Calculate your 5 heart rate training zones from your max HR or LTHR.",
    type: "website",
    url: "https://roadmancycling.com/tools/hr-zones",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Roadman Cycling" }],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ToolSchemas slug="hr-zones" />
      {children}
    </>
  );
}
