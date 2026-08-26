import type { Metadata } from "next";
import { ToolSchemas } from "@/components/seo/ToolSchemas";
import { ToolJourney } from "@/components/features/tools/ToolJourney";

export const metadata: Metadata = {
  title: "Cycling Sweat Rate Calculator — Test & Formula",
  description:
    "Calculate cycling sweat rate from pre/post body mass, fluid, urine and ride time. See the formula, assumptions and safe planning boundaries.",
  keywords: ["cycling sweat rate calculator", "sweat rate calculator cycling", "cycling hydration calculator", "sweat rate formula", "calculate sweat rate cycling"],
  alternates: { canonical: "/tools/hydration" },
  openGraph: {
    title: "Cycling Sweat Rate Calculator — Test & Formula",
    description:
      "Calculate cycling sweat rate from a real ride, with the formula, assumptions and safety boundaries visible.",
    type: "website",
    url: "https://roadmancycling.com/tools/hydration",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Roadman Cycling" }],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ToolSchemas slug="hydration" />
      {children}
      <ToolJourney slug="hydration" />
    </>
  );
}
