import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Active A/B test configuration.
 *
 * Because the proxy (middleware) runs on every matched request and cannot
 * reliably hit the database, we keep a lightweight config here.  When an
 * experiment is started via the admin API the dev should add it here as
 * well (a future enhancement could auto-generate this from the DB).
 */
interface ActiveTest {
  /** Unique experiment id — used as the cookie suffix */
  id: string;
  /** URL path prefix the test applies to (e.g. "/" or "/skool") */
  pathPrefix: string;
  /** Variant IDs to randomly assign — first is always "control" */
  variantIds: string[];
}

let cachedTests: ActiveTest[] = [];
let cacheTimestamp = 0;
const CACHE_TTL = 60_000; // 60 seconds

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

/** Generate a UUID v4 using the Web Crypto API (available in all proxy runtimes). */
function generateUUID(): string {
  return crypto.randomUUID();
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const origin = new URL(request.url).origin;
  const activeTests = await getActiveTests(origin);

  // Forward the current pathname to server components via a request header.
  // Next 16 server components don't have direct access to the pathname, so
  // any component that needs it (e.g. MembersHeader for active-link state)
  // reads it from this header.
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", pathname);

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });

  // ── Global visitor variant assignment cookie ──────────────────────────
  // Every visitor gets a stable `ab_variant` UUID that persists for 30 days.
  // This ID is used to deterministically bucket visitors into experiment
  // cohorts and ensure a consistent experience across sessions.
  const existingVariant = request.cookies.get("ab_variant")?.value;

  if (!existingVariant) {
    response.cookies.set("ab_variant", generateUUID(), {
      path: "/",
      httpOnly: false, // Client-side tracker needs to read this
      maxAge: 60 * 60 * 24 * 30, // 30 days
      sameSite: "lax",
    });
  }

  // ── Per-experiment variant assignment ─────────────────────────────────
  if (activeTests.length === 0) {
    return response;
  }

  const assignments: Record<string, string> = {};

  for (const test of activeTests) {
    // Only process tests whose path matches
    if (!pathname.startsWith(test.pathPrefix)) continue;

    const cookieName = `roadman_ab_${test.id}`;
    const existing = request.cookies.get(cookieName)?.value;

    if (existing && test.variantIds.includes(existing)) {
      // Already assigned — carry forward
      assignments[test.id] = existing;
    } else {
      // Randomly assign a variant
      const idx = Math.floor(Math.random() * test.variantIds.length);
      const assigned = test.variantIds[idx];
      assignments[test.id] = assigned;

      response.cookies.set(cookieName, assigned, {
        path: "/",
        httpOnly: false, // Client-side tracker needs to read this
        maxAge: 60 * 60 * 24 * 90, // 90 days
        sameSite: "lax",
      });
    }
  }

  // Expose all assignments as a response header for server components / API routes
  if (Object.keys(assignments).length > 0) {
    response.headers.set("x-ab-variants", JSON.stringify(assignments));
  }

  return response;
}

/**
 * Only run on public-facing pages.
 * Excludes admin dashboard, API routes, Next.js internals, and static assets.
 */
export const config = {
  matcher: [
    "/((?!admin|api|_next/static|_next/image|favicon.ico|icon.svg|sitemap.xml|robots.txt).*)",
  ],
};
