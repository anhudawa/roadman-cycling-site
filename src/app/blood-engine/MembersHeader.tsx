import Link from "next/link";
import { headers } from "next/headers";
import { getBloodEngineUser } from "@/lib/blood-engine/access";

/**
 * Members-area header for the signed-in parts of Blood Engine.
 *
 * Signals "you're inside a private product area" vs. the marketing site:
 *   - Blood Engine wordmark that doubles as "back to dashboard"
 *   - Sub-nav (Dashboard / New report / Compare / Markers / Account)
 *   - Signed-in email pill + POST sign-out form
 *   - Mobile-friendly horizontal sub-nav
 *
 * Renders nothing if no BE user is signed in — each authenticated page has
 * its own requireBloodEngineAccess() guard that redirects, so in practice
 * this component is always called with a signed-in user.
 */
export async function MembersHeader() {
  const [user, headerList] = await Promise.all([getBloodEngineUser(), headers()]);
  if (!user?.hasAccess) return null;

  // Next 16 server components don't have direct access to the current
  // pathname. We read it from the middleware-set x-pathname header if
  // present, otherwise fall back to referer. If neither is available,
  // no sub-nav item is marked active (harmless).
  const pathname =
    headerList.get("x-pathname") ??
    (headerList.get("referer")
      ? new URL(headerList.get("referer")!).pathname
      : "") ??
    "";

  return (
    <header className="sticky top-0 z-40 bg-background-deep/95 backdrop-blur-md border-b border-white/10 print:hidden">
      <div className="max-w-[1400px] mx-auto px-5 md:px-8">
        <div className="h-14 flex items-center justify-between gap-4">
          {/* Wordmark → dashboard */}
          <Link
            href="/blood-engine/dashboard"
            className="flex items-center gap-2 group shrink-0"
            aria-label="Blood Engine dashboard"
          >
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-coral group-hover:shadow-[0_0_12px_rgba(241,99,99,0.6)] transition-shadow" />
            <span className="font-heading uppercase tracking-[0.2em] text-off-white text-sm">
              Blood Engine
            </span>
          </Link>

          {/* Desktop sub-nav */}
          <nav
            aria-label="Members area"
            className="hidden md:flex items-center gap-1"
          >
            {SUBNAV.map((item) => {
              const active = isActive(pathname, item.match);
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={[
                    "font-heading uppercase tracking-wider text-xs px-3 py-1.5 rounded-md transition-colors",
                    active
                      ? "text-coral bg-coral/10"
                      : "text-foreground-muted hover:text-off-white hover:bg-white/5",
                  ].join(" ")}
                  aria-current={active ? "page" : undefined}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Identity + sign out */}
          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/blood-engine/account"
              className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 text-xs text-foreground-muted hover:text-off-white hover:border-white/30 transition-colors"
              aria-label={`Account — signed in as ${user.email}`}
              title={user.email}
            >
              <span
                className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400"
                aria-hidden="true"
              />
              <span className="max-w-[180px] truncate">{user.email}</span>
            </Link>
            <form action="/api/blood-engine/auth/logout" method="post">
              <button
                type="submit"
                className="font-heading uppercase tracking-wider text-xs text-foreground-subtle hover:text-off-white px-2 py-1.5 cursor-pointer"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>

        {/* Mobile sub-nav (horizontal scroll) */}
        <nav
          aria-label="Members area (mobile)"
          className="md:hidden flex items-center gap-1 overflow-x-auto pb-2 -mx-1 px-1"
        >
          {SUBNAV.map((item) => {
            const active = isActive(pathname, item.match);
            return (
              <Link
                key={item.label}
                href={item.href}
                className={[
                  "font-heading uppercase tracking-wider text-[11px] px-3 py-1.5 rounded-md whitespace-nowrap",
                  active
                    ? "text-coral bg-coral/10"
                    : "text-foreground-muted hover:text-off-white",
                ].join(" ")}
                aria-current={active ? "page" : undefined}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}

interface SubNavItem {
  label: string;
  href: string;
  /** Pathname prefix(es) that mark this item as the active page. */
  match: string[];
}

const SUBNAV: SubNavItem[] = [
  { label: "Dashboard", href: "/blood-engine/dashboard", match: ["/blood-engine/dashboard"] },
  { label: "New report", href: "/blood-engine/new", match: ["/blood-engine/new"] },
  { label: "Reports", href: "/blood-engine/dashboard", match: ["/blood-engine/report"] },
  { label: "Compare", href: "/blood-engine/compare", match: ["/blood-engine/compare"] },
  { label: "Markers", href: "/blood-engine/markers", match: ["/blood-engine/markers"] },
  { label: "Account", href: "/blood-engine/account", match: ["/blood-engine/account"] },
];

function isActive(pathname: string, matches: string[]): boolean {
  return matches.some((m) => pathname === m || pathname.startsWith(m + "/"));
}
