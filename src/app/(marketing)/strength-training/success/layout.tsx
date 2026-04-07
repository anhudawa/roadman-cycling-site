import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Enrolment Confirmed — Strength Training",
  description:
    "You're in. Check your email for access details to the Strength Training for Cyclists course.",
  robots: { index: false, follow: true },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
