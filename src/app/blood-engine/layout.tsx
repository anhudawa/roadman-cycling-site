import type { Metadata } from "next";
import { Header, Footer } from "@/components/layout";

export const metadata: Metadata = {
  title: {
    default: "Blood Engine — Decode your bloodwork like a pro cyclist",
    template: "%s | Blood Engine",
  },
  description:
    "Cycling-specific bloodwork interpretation for masters cyclists. Upload your results, get a report tuned to athlete-optimal ranges — not generic lab norms.",
  alternates: { canonical: "https://roadmancycling.com/blood-engine" },
  openGraph: {
    title: "Blood Engine — Decode your bloodwork like a pro cyclist",
    description:
      "Cycling-specific bloodwork interpretation for masters cyclists. €97 lifetime access — every retest decoded forever.",
    type: "website",
    url: "https://roadmancycling.com/blood-engine",
    siteName: "Roadman Cycling",
  },
  twitter: {
    card: "summary_large_image",
    title: "Blood Engine — Decode your bloodwork like a pro cyclist",
    description:
      "Cycling-specific bloodwork interpretation for masters cyclists. Athlete-optimal ranges, not generic lab norms.",
  },
};

export default function BloodEngineLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main id="main-content" className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}
