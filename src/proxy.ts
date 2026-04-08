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

const ACTIVE_TESTS: ActiveTest[] = [
  // Example — uncomment when a real test is running:
  // {
  //   id: "exp_homepage_hero",
  //   pathPrefix: "/",
  //   variantIds: ["control", "var_1", "var_2"],
  // },
];

/** Generate a UUID v4 using the Web Crypto API (available in all proxy runtimes). */
function generateUUID(): string {
  return crypto.randomUUID();
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const response = NextResponse.next();

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
  if (ACTIVE_TESTS.length === 0) {
    return response;
  }

  const assignments: Record<string, string> = {};

  for (const test of ACTIVE_TESTS) {
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
