import { Container } from "@/components/layout/Container";

/**
 * Instant skeleton for the member dashboard. Mirrors the real shell
 * (hero + progress ring, four quick-stats, current-module card, the
 * twelve-module grid) so navigating in never flashes a blank screen
 * while the session + progress read resolves. Decorative only — hidden
 * from assistive tech.
 */
export default function DashboardLoading() {
  return (
    <Container as="div" width="wide" className="pt-8 pb-16 md:pt-16">
      <span className="sr-only" role="status">
        Loading your dashboard…
      </span>
      <div aria-hidden className="space-y-10 md:space-y-16">
      {/* Hero */}
      <div className="grid gap-8 md:gap-10 md:grid-cols-[1fr_auto] md:items-end">
        <div className="min-w-0 space-y-4">
          <div className="skeleton h-6 w-40 rounded-full" />
          <div className="skeleton h-16 w-3/4 rounded-lg" />
          <div className="skeleton skeleton-text h-4 w-full max-w-xl" />
          <div className="skeleton skeleton-text h-4 w-2/3 max-w-xl" />
        </div>
        <div className="skeleton h-32 w-32 rounded-full md:justify-self-end" />
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-white/10 bg-charcoal/60 p-5 space-y-3"
          >
            <div className="skeleton h-3 w-16 rounded" />
            <div className="skeleton h-8 w-20 rounded" />
            <div className="skeleton h-3 w-24 rounded" />
          </div>
        ))}
      </div>

      {/* Current module card */}
      <div className="rounded-xl border border-white/10 bg-charcoal/60 p-6 md:p-8 space-y-4">
        <div className="skeleton h-3 w-28 rounded" />
        <div className="skeleton h-10 w-2/3 rounded-lg" />
        <div className="skeleton skeleton-text h-4 w-full max-w-2xl" />
        <div className="skeleton h-12 w-44 rounded-md" />
      </div>

      {/* Module grid */}
      <div className="space-y-8">
        <div className="skeleton h-9 w-72 rounded-lg" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl border border-white/10 bg-charcoal/60 p-6 space-y-3"
            >
              <div className="skeleton h-4 w-14 rounded" />
              <div className="skeleton skeleton-heading h-6 w-3/4" />
              <div className="skeleton skeleton-text h-4 w-full" />
            </div>
          ))}
        </div>
      </div>
      </div>
    </Container>
  );
}
