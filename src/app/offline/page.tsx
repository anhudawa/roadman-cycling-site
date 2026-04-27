import type { Metadata } from "next";
import Link from "next/link";
import { RetryButton } from "./RetryButton";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Offline — Roadman Cycling",
  description: "You're offline. Get back on the road and we'll be here.",
  robots: { index: false, follow: false },
};

export default function OfflinePage() {
  return (
    <main
      id="main-content"
      className="min-h-[100svh] flex items-center justify-center px-6 py-16 bg-charcoal text-off-white"
    >
      <div className="max-w-lg text-center">
        <p className="font-heading text-xs tracking-[0.3em] text-coral uppercase mb-6">
          You&rsquo;re offline
        </p>
        <h1 className="font-heading text-4xl md:text-5xl tracking-wide leading-[0.95] mb-6">
          Get back on the road and we&rsquo;ll be here.
        </h1>
        <p className="text-foreground-muted leading-relaxed mb-8">
          Your connection dropped. Reconnect and the page you wanted will load.
          Episodes you&rsquo;ve already opened are still available — try the
          back button.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center font-heading tracking-wider uppercase text-sm bg-coral hover:bg-coral-hover text-off-white px-6 py-3 rounded-md transition-colors min-h-[44px]"
          >
            Try the home page
          </Link>
          <RetryButton />
        </div>
      </div>
    </main>
  );
}
