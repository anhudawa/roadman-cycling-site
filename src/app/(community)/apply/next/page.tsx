import type { Metadata } from "next";
import Link from "next/link";
import { ApplicationNextSteps } from "./ApplicationNextSteps";

export const metadata: Metadata = {
  title: "Your next step | Not Done Yet",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

export default function ApplicationNextPage() {
  return <main id="main-content" className="min-h-screen bg-deep-purple px-5 py-16 text-off-white sm:py-24">
    <div className="mx-auto max-w-2xl">
      <Link href="/" className="text-sm font-semibold uppercase tracking-widest text-coral">Roadman Cycling</Link>
      <h1 className="mt-10 font-heading text-4xl sm:text-5xl">NOT DONE YET</h1>
      <p className="mt-4 text-base leading-7 text-foreground-muted">Start your 7-day free trial, or send Sarah a question about the programme.</p>
      <ApplicationNextSteps />
    </div>
  </main>;
}
