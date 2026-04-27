import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Is Not Done Yet a Fit For You? — 60-Second Check",
  description:
    "Five quick questions to find out whether the Not Done Yet coaching community matches what you actually want from your cycling. Honest answer, no commitment.",
  alternates: {
    canonical: "https://roadmancycling.com/community/not-done-yet/fit",
  },
  openGraph: {
    title: "Is Not Done Yet a Fit For You? — 60-Second Check",
    description:
      "Five quick questions to find out whether the Not Done Yet coaching community matches what you actually want from your cycling.",
    type: "website",
    url: "https://roadmancycling.com/community/not-done-yet/fit",
  },
};

export default function NdyFitLayout({ children }: { children: React.ReactNode }) {
  return children;
}
