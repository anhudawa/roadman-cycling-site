import type { Metadata } from "next";
import { ToolSchemas } from "@/components/seo/ToolSchemas";

export const metadata: Metadata = {
  title: "Cycling Strength Session Planner",
  description:
    "Map your real riding week and place one or two 30, 45 or 60-minute cyclist strength sessions without sitting them directly before a key or long ride.",
  keywords: [
    "cycling strength training schedule",
    "when to strength train cycling",
    "cycling and gym weekly plan",
    "strength session planner cyclists",
    "fit strength training around cycling",
  ],
  alternates: { canonical: "/tools/strength-session-planner" },
  openGraph: {
    title: "Cycling Strength Session Planner",
    description:
      "Map the week you actually ride. Find the least-conflicting 30, 45 or 60-minute strength windows while protecting key and long rides.",
    type: "website",
    url: "https://roadmancycling.com/tools/strength-session-planner",
    images: [
      {
        url: "/api/og/blog-hero?title=Cycling%20Strength%20Session%20Planner&pillar=strength",
        width: 1200,
        height: 630,
        alt: "Roadman Cycling strength session planner",
      },
    ],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ToolSchemas slug="strength-session-planner" />
      {children}
    </>
  );
}
