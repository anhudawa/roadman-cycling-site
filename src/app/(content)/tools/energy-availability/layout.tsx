import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Energy Availability Calculator — RED-S Risk",
  description:
    "Check if you're eating enough to support your cycling training. Calculate your energy availability score and assess RED-S risk.",
  keywords: ["energy availability calculator", "RED-S cycling", "cyclist energy availability", "relative energy deficiency"],
  alternates: { canonical: "https://roadmancycling.com/tools/energy-availability" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
