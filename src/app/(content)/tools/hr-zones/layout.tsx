import type { Metadata } from "next";
import { ToolSchemas } from "@/components/seo/ToolSchemas";
import { ToolJourney } from "@/components/features/tools/ToolJourney";

export const metadata: Metadata = {
  title: "Heart Rate Zone Calculator — Cycling HR Zones from Max or LTHR",
  description:
    "Get your 5 cycling heart rate zones from either max HR or LTHR. Free, instant, with the rationale for each method and how to test if you don't have a number yet.",
  keywords: ["heart rate zone calculator", "cycling HR zones", "heart rate training zones", "max heart rate zones"],
  alternates: { canonical: "https://roadmancycling.com/tools/hr-zones" },
  openGraph: {
    title: "Heart Rate Zone Calculator — Cycling HR Zones from Max or LTHR",
    description: "Get your 5 cycling heart rate zones from either max HR or LTHR. With the rationale for each method and a quick test protocol.",
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
      <ToolJourney slug="hr-zones" />
    </>
  );
}
