import { NextResponse, type NextRequest } from "next/server";
import { GO_HERO_COOKIE, isGoHeroVariant, type GoHeroVariant } from "@/lib/ab/go-hero";

/* ═══════════════════════════════════════════════════════════════
 * Unified middleware — Method auth gate + A/B proxy + SEO cleanup
 *
 * Next.js 16 does not allow both middleware.ts and proxy.ts.
 * This file combines the Method auth routing with the A/B test
 * proxy and legacy query-param stripping that previously lived
 * in src/proxy.ts.
 * ═══════════════════════════════════════════════════════════════ */

/* ── Method auth constants ──────────────────────────────────── */

const SESSION_COOKIE = "method_session";

const GUEST_PATHS = new Set([
  "/method",
  "/method/checkout",
  "/method/login",
  "/method/login/check-email",
  "/method/login/verify",
  "/method/welcome",
]);

function isGuestPath(pathname: string): boolean {
  return GUEST_PATHS.has(pathname);
}

/* ── A/B test constants ─────────────────────────────────────── */

interface ActiveTest {
  id: string;
  pathPrefix: string;
  variantIds: string[];
}

let cachedTests: ActiveTest[] = [];
let cacheTimestamp = 0;
const CACHE_TTL = 60_000;

const STRIP_QUERY_PARAMS = ["post_page", "post_pages", "replytocom"] as const;

// Paths where an admin-defined A/B test may run. Acts as a fast-path so
// cold edge instances skip the /api/admin/experiments/active fetch
// (50–200ms) for paths that can't possibly match a registered test —
// most notably /go/ads, where any extra latency directly burns ad spend.
// When a new admin experiment targets a different page, add its prefix
// here. The static /go hero split below is unaffected.
const AB_TEST_CANDIDATE_PREFIXES: readonly string[] = [];

function pathMayHaveActiveTest(pathname: string): boolean {
  return AB_TEST_CANDIDATE_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix),
  );
}

async function getActiveTests(origin: string): Promise<ActiveTest[]> {
  const now = Date.now();
  if (now - cacheTimestamp < CACHE_TTL) return cachedTests;
  try {
    const res = await fetch(`${origin}/api/admin/experiments/active`);
    if (res.ok) {
      const data = await res.json();
      cachedTests = data.tests ?? [];
      cacheTimestamp = now;
    }
  } catch {
    // Use last known good value
  }
  return cachedTests;
}

/* ── Middleware ──────────────────────────────────────────────── */

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  /* ────────────────────────────────────────────────────────────
   * 1. METHOD AUTH GATE — only runs on /method/*
   * ──────────────────────────────────────────────────────────── */
  if (pathname === "/method" || pathname.startsWith("/method/")) {
    const hasCookie = request.cookies.has(SESSION_COOKIE);

    // Rule 1: authenticated user on sales page → dashboard
    if (pathname === "/method" && hasCookie) {
      return NextResponse.redirect(
        new URL("/method/dashboard", request.url),
      );
    }

    // Rule 2: guest on protected page → login
    if (!isGuestPath(pathname) && !hasCookie) {
      return NextResponse.redirect(
        new URL("/method/login", request.url),
      );
    }

    // Rule 3: pass through with x-pathname for layout rendering
    const headers = new Headers(request.headers);
    headers.set("x-pathname", pathname);
    return NextResponse.next({ request: { headers } });
  }

  /* ────────────────────────────────────────────────────────────
   * 2. SEO QUERY-PARAM CLEANUP — strip legacy WP junk params
   * ──────────────────────────────────────────────────────────── */
  const cleanUrl = request.nextUrl.clone();
  let strippedAny = false;
  for (const key of STRIP_QUERY_PARAMS) {
    if (cleanUrl.searchParams.has(key)) {
      cleanUrl.searchParams.delete(key);
      strippedAny = true;
    }
  }
  if (strippedAny) {
    return NextResponse.redirect(cleanUrl, 308);
  }

  /* ────────────────────────────────────────────────────────────
   * 3. A/B TEST VARIANT ASSIGNMENT
   * ──────────────────────────────────────────────────────────── */
  // Fast-path: skip the experiments fetch entirely for paths that
  // aren't candidates for an admin-defined test. The /go hero split
  // below is static and runs unconditionally.
  const activeTests: ActiveTest[] = pathMayHaveActiveTest(pathname)
    ? await getActiveTests(new URL(request.url).origin)
    : [];

  // ── /go hero headline split (static, code-owned) ──────────
  // Path-scoped to /go so the cookie is only seeded for visitors who
  // actually land on the PPC surface. Mutating `request.cookies` here
  // is what lets the server component read the fresh value on the
  // first paint — the response cookie alone wouldn't be in scope until
  // the next request. The forwarded request headers below carry the
  // mutation through.
  let goHeroAssigned: GoHeroVariant | null = null;
  if (pathname === "/go") {
    const existing = request.cookies.get(GO_HERO_COOKIE)?.value;
    if (isGoHeroVariant(existing)) {
      goHeroAssigned = null; // already sticky, no response cookie needed
    } else {
      goHeroAssigned = Math.random() < 0.5 ? "A" : "B";
      request.cookies.set(GO_HERO_COOKIE, goHeroAssigned);
    }
  }

  // Forward x-pathname to all server components — used by Blood Engine's
  // MembersHeader and any other component that needs the current route.
  const fwdHeaders = new Headers(request.headers);
  fwdHeaders.set("x-pathname", pathname);

  const response = NextResponse.next({
    request: { headers: fwdHeaders },
  });

  if (goHeroAssigned) {
    response.cookies.set(GO_HERO_COOKIE, goHeroAssigned, {
      path: "/",
      httpOnly: false,
      maxAge: 60 * 60 * 24 * 90,
      sameSite: "lax",
    });
  }

  // Global visitor variant cookie
  if (!request.cookies.get("ab_variant")?.value) {
    response.cookies.set("ab_variant", crypto.randomUUID(), {
      path: "/",
      httpOnly: false,
      maxAge: 60 * 60 * 24 * 30,
      sameSite: "lax",
    });
  }

  if (activeTests.length === 0) return response;

  const assignments: Record<string, string> = {};
  for (const test of activeTests) {
    if (!pathname.startsWith(test.pathPrefix)) continue;
    const cookieName = `roadman_ab_${test.id}`;
    const existing = request.cookies.get(cookieName)?.value;
    if (existing && test.variantIds.includes(existing)) {
      assignments[test.id] = existing;
    } else {
      const idx = Math.floor(Math.random() * test.variantIds.length);
      const assigned = test.variantIds[idx];
      assignments[test.id] = assigned;
      response.cookies.set(cookieName, assigned, {
        path: "/",
        httpOnly: false,
        maxAge: 60 * 60 * 24 * 90,
        sameSite: "lax",
      });
    }
  }

  if (Object.keys(assignments).length > 0) {
    response.headers.set("x-ab-variants", JSON.stringify(assignments));
  }

  return response;
}

export const config = {
  matcher: [
    // Method auth routes
    "/method",
    "/method/:path*",
    // Everything else except admin, API, static assets (for A/B + SEO cleanup)
    "/((?!admin|api|_next/static|_next/image|favicon.ico|icon.svg|sitemap.xml|robots.txt).*)",
  ],
};
