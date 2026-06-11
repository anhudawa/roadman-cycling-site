import type { Metadata } from "next";
import Link from "next/link";
import { betaGateEnabled, hasBetaAccess } from "@/lib/fantasy/beta-gate";

export const metadata: Metadata = {
  title: {
    default: "Roadman Fantasy Tour — Tour de France 2026",
    template: "%s | Roadman Fantasy Tour",
  },
  description:
    "Pick 8 riders, 100 credits, three weeks of racing. The free fantasy Tour de France game from Roadman Cycling. Teams lock 4 July.",
  alternates: { canonical: "https://roadmancycling.com/fantasy" },
  openGraph: {
    title: "Roadman Fantasy Tour — Tour de France 2026",
    description:
      "Pick 8 riders inside 100 credits. Daily scoring, mini-leagues for your club run, free to play.",
    url: "https://roadmancycling.com/fantasy",
    siteName: "Roadman Cycling",
  },
};

/**
 * Beta-gate screen: rendered in place of the whole game when
 * FANTASY_BETA_CODE is set and this device hasn't presented the code.
 * Plain form, no JS — works on any phone the share link lands on.
 */
function BetaGateScreen() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-deep-purple to-charcoal px-4 text-off-white">
      <p className="font-heading text-sm tracking-[0.35em] text-coral">PRIVATE BETA</p>
      <h1 className="mt-3 text-center font-heading text-5xl tracking-wide sm:text-6xl">
        ROADMAN FANTASY TOUR
      </h1>
      <p className="mt-4 max-w-md text-center text-off-white/70">
        This is the pre-Tour demo, open to the beta group only. Enter the access code from your
        invite — one time per device.
      </p>
      <form method="post" action="/api/fantasy/beta" className="mt-8 flex w-full max-w-sm gap-2">
        <input
          required
          name="code"
          autoComplete="off"
          autoCapitalize="off"
          placeholder="Access code"
          aria-label="Beta access code"
          className="min-w-0 flex-1 rounded-md border border-white/20 bg-charcoal px-4 py-3 text-off-white placeholder:text-mid-grey"
        />
        <button
          type="submit"
          className="rounded-md bg-coral px-6 py-3 font-heading tracking-[0.15em] text-charcoal transition-colors hover:bg-coral-hover"
        >
          ENTER
        </button>
      </form>
      <p className="mt-4 text-xs text-mid-grey">
        Wrong or missing code? Ask whoever sent you the invite.
      </p>
    </div>
  );
}

/**
 * Immersive game chrome: slim header, no funnel overlays (route is in
 * ConversionChrome's lean list). Dark throughout — charcoal canvas,
 * deep purple surfaces, coral for live/CTA only.
 *
 * On gated demo deployments the gate check runs first; in production
 * FANTASY_BETA_CODE is unset, betaGateEnabled() short-circuits before
 * any dynamic API is touched, and the landing stays statically rendered.
 */
export default async function FantasyLayout({ children }: { children: React.ReactNode }) {
  if (betaGateEnabled() && !(await hasBetaAccess())) {
    return <BetaGateScreen />;
  }
  return (
    <div className="min-h-screen bg-charcoal text-off-white">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-charcoal/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <Link href="/fantasy" className="flex items-baseline gap-2">
            <span className="font-heading text-xl tracking-wider text-off-white">ROADMAN</span>
            <span className="font-heading text-xl tracking-wider text-coral">FANTASY TOUR</span>
          </Link>
          <nav aria-label="Fantasy Tour" className="flex items-center gap-1 sm:gap-2">
            <Link
              href="/fantasy/build"
              className="rounded-md px-3 py-2 font-heading text-sm tracking-widest text-off-white/80 transition-colors hover:text-off-white"
            >
              BUILD
            </Link>
            <Link
              href="/fantasy/team"
              className="rounded-md px-3 py-2 font-heading text-sm tracking-widest text-off-white/80 transition-colors hover:text-off-white"
            >
              MY TEAM
            </Link>
            <Link
              href="/fantasy/leaderboard"
              className="rounded-md px-3 py-2 font-heading text-sm tracking-widest text-off-white/80 transition-colors hover:text-off-white"
            >
              STANDINGS
            </Link>
            <Link
              href="/fantasy/rules"
              className="hidden rounded-md px-3 py-2 font-heading text-sm tracking-widest text-off-white/80 transition-colors hover:text-off-white sm:block"
            >
              RULES
            </Link>
          </nav>
        </div>
      </header>

      <main id="main-content">{children}</main>

      <footer className="border-t border-white/10 bg-charcoal">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-8 text-sm text-mid-grey sm:flex-row sm:items-center sm:justify-between">
          <p>
            Free to play. No entry fee, ever. Ages 16+.{" "}
            <span className="text-off-white/50">A Roadman Cycling production.</span>
          </p>
          <nav aria-label="Legal" className="flex gap-4">
            <Link href="/fantasy/rules" className="hover:text-off-white">
              Rules
            </Link>
            <Link href="/fantasy/terms" className="hover:text-off-white">
              Game terms
            </Link>
            <Link href="/privacy" className="hover:text-off-white">
              Privacy
            </Link>
            <Link href="/" className="hover:text-off-white">
              roadmancycling.com
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
