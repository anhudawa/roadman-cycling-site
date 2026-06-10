import { Container } from "@/components/layout/Container";

/**
 * Instant skeleton for the module viewer. Mirrors the two-column shell
 * (left nav rail + header / video / protocol / sidebar) so the session +
 * progress read never shows a blank frame on navigation between modules.
 */
export default function ModuleLoading() {
  return (
    <div className="relative">
      <Container as="div" width="wide" className="pt-10 pb-16">
        <span className="sr-only" role="status">
          Loading module…
        </span>
        <div aria-hidden>
          <div className="skeleton mb-6 h-4 w-28 rounded" />

          <div className="grid gap-12 lg:grid-cols-[260px_1fr]">
            {/* Nav rail */}
            <aside className="hidden lg:block space-y-2">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="skeleton h-11 w-full rounded-lg" />
              ))}
            </aside>

            <div className="grid gap-10 lg:grid-cols-12">
              {/* Header */}
              <div className="lg:col-span-12 space-y-4">
                <div className="skeleton h-6 w-32 rounded-full" />
                <div className="skeleton h-12 w-3/4 rounded-lg" />
                <div className="skeleton skeleton-text h-4 w-full max-w-2xl" />
              </div>

              {/* Main content column */}
              <div className="lg:col-span-8 space-y-8">
                <div className="skeleton aspect-video w-full rounded-xl" />
                <div className="space-y-3 rounded-xl border border-white/10 bg-charcoal/60 p-6">
                  <div className="skeleton h-5 w-40 rounded" />
                  <div className="skeleton skeleton-text h-4 w-full" />
                  <div className="skeleton skeleton-text h-4 w-5/6" />
                  <div className="skeleton skeleton-text h-4 w-2/3" />
                </div>
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-4 space-y-5">
                <div className="skeleton h-32 w-full rounded-xl" />
                <div className="skeleton h-24 w-full rounded-xl" />
              </div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
