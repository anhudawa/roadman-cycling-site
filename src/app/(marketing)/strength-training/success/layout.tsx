import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Enrolment Confirmed — Strength Training",
  description:
    "You're in. Check your email for instant access to the 12-week Strength Training for Cyclists plan, instructional videos, and bonus guides.",
  // `noindex` keeps this post-purchase confirmation out of search. No
  // canonical: it's noindex (a self-canonical would contradict that), and
  // it's no longer disallowed in robots.ts so Googlebot can crawl it and
  // honour the noindex instead of leaving it "indexed, though blocked".
  robots: { index: false, follow: true },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
