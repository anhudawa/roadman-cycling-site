import { cookies } from "next/headers";

/**
 * /go hero headline split test — variant assignment helpers.
 *
 * The middleware assigns one of two variants (`A` or `B`) on first
 * visit to /go, persists it in a 90-day cookie, and forwards the
 * fresh value to the request that's about to render so the server
 * component sees the variant on the very first paint.
 *
 * Variants:
 *   A (control) — "YOUR FTP IS STUCK." three-line headline
 *   B (test)    — "WHY YOUR FTP IS STUCK / (AND THE EXACT FIX THIS WEEK)"
 *
 * The cookie name uses the existing `roadman_ab_` namespace so it
 * matches the DB-driven experiments middleware uses for everything else.
 */

export const GO_HERO_COOKIE = "roadman_ab_go_hero";
export const GO_HERO_VARIANT_IDS = ["A", "B"] as const;
export type GoHeroVariant = (typeof GO_HERO_VARIANT_IDS)[number];

export function isGoHeroVariant(value: string | undefined): value is GoHeroVariant {
  return value === "A" || value === "B";
}

/**
 * Read the assigned /go hero variant from the request cookie. Falls
 * back to `A` (control) if the cookie is missing or malformed — that
 * fallback should only trigger if middleware has been skipped (e.g.
 * direct internal calls), since middleware writes the cookie inline
 * onto the forwarded request on first visit.
 */
export async function readGoHeroVariant(): Promise<GoHeroVariant> {
  const store = await cookies();
  const raw = store.get(GO_HERO_COOKIE)?.value;
  return isGoHeroVariant(raw) ? raw : "A";
}
