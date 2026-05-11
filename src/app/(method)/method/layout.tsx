import { redirect } from "next/navigation";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { headers } from "next/headers";
import { getMethodSession } from "@/lib/method/auth";
import { MethodHeader } from "./_components/MethodHeader";

export const metadata: Metadata = {
  title: "The Roadman Method — A 12-Week System for Cyclists Who Are Stuck",
  description:
    "Twelve weeks. Five pillars. One system. Built on 1,400+ conversations with World Tour coaches, sports scientists and pro cyclists. For serious amateurs who are training hard but not getting faster.",
};

const PUBLIC_PATHS: ReadonlySet<string> = new Set([
  "/method",
  "/method/login",
  "/method/login/check-email",
  "/method/login/verify",
  "/method/checkout",
  "/method/welcome",
]);

/**
 * Server-component gate for /method/*.
 *
 * /method itself is the public sales page. Members go to /method/dashboard.
 * If a signed-in member lands on the sales page, send them to the dashboard
 * so they don't see the marketing screen they already paid for.
 */
export default async function MethodLayout({ children }: { children: ReactNode }) {
  const hdrs = await headers();
  const pathname = resolvePathname(hdrs);
  const session = await getMethodSession();

  if (!isPublicPath(pathname) && !session) {
    redirect("/method/login");
  }

  // Only redirect sales page → dashboard, never redirect if already deeper
  if (pathname === "/method" && session) {
    redirect("/method/dashboard");
  }

  const isSalesPage = pathname === "/method";

  return (
    <div className="min-h-screen bg-charcoal text-off-white antialiased">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--color-deep-purple)_0%,_var(--color-charcoal)_55%)]"
      />
      <MethodHeader
        sessionEmail={session?.payload.email ?? null}
        variant={isSalesPage ? "marketing" : "members"}
      />
      <main id="method-main" className={isSalesPage ? "" : "pb-24"}>
        {children}
      </main>
      <footer className="border-t border-white/5 py-10 text-center text-xs text-foreground-muted">
        <p>The Roadman Method · © Roadman Cycling. Built in Ireland.</p>
      </footer>
    </div>
  );
}

/**
 * Extract the pathname from request headers. Priority:
 *   1. x-pathname — set by our middleware (src/middleware.ts)
 *   2. x-invoke-path — set by Next.js internally on some routes
 *   3. Parse from x-forwarded-url / referer as a last resort
 *   4. Fall back to "/method" only if nothing else is available
 *
 * The "/method" default is safe: it's a public path, so unauthenticated
 * users see the sales page, and authenticated users redirect to dashboard.
 * The redirect loop that prompted this fix happened when deeper paths
 * (e.g. /method/dashboard) fell through to the "/method" default while
 * a session was active.
 */
function resolvePathname(hdrs: Headers): string {
  const direct = hdrs.get("x-pathname") ?? hdrs.get("x-invoke-path");
  if (direct) return direct;

  // Vercel and other proxies often set x-forwarded-url or x-url
  for (const h of ["x-forwarded-url", "x-url", "x-original-url"]) {
    const raw = hdrs.get(h);
    if (raw) {
      try {
        return new URL(raw).pathname;
      } catch {
        // malformed — skip
      }
    }
  }

  return "/method";
}

function isPublicPath(pathname: string): boolean {
  if (PUBLIC_PATHS.has(pathname)) return true;
  for (const p of PUBLIC_PATHS) {
    if (pathname.startsWith(`${p}/`)) return true;
  }
  return false;
}
