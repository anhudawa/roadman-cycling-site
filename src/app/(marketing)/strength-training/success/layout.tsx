import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Enrolment Confirmed $€” Strength Training",
  description:
    "You're in. Check your email for instant access to the 12-week Strength Training for Cyclists plan, instructional videos, and bonus guides.",
  robots: { index: false, follow: true },
  alternates: {
    canonical: "https://roadmancycling.com/strength-training/success",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
