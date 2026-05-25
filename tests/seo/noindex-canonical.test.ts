import { describe, expect, it } from "vitest";
import type { Metadata } from "next";

import { metadata as goMeta } from "@/app/go/layout";
import { metadata as goAdsMeta } from "@/app/go/ads/layout";
import { metadata as mastersReportMeta } from "@/app/masters-report/layout";
import { metadata as strengthSuccessMeta } from "@/app/(marketing)/strength-training/success/layout";

/**
 * Noindex surfaces must NOT also declare a canonical. Pairing
 * `robots: noindex` with a self-`alternates.canonical` is a
 * contradictory signal — Google may resolve it by ignoring the
 * noindex and indexing the page, which is what produced "Duplicate,
 * Google chose different canonical than user" in Search Console.
 */
const NOINDEX_SURFACES: Array<{ name: string; meta: Metadata }> = [
  { name: "/go", meta: goMeta },
  { name: "/go/ads", meta: goAdsMeta },
  { name: "/masters-report", meta: mastersReportMeta },
  { name: "/strength-training/success", meta: strengthSuccessMeta },
];

describe("noindex surfaces declare no canonical", () => {
  for (const { name, meta } of NOINDEX_SURFACES) {
    it(`${name} is noindex`, () => {
      expect((meta.robots as { index?: boolean } | undefined)?.index).toBe(false);
    });

    it(`${name} sets no alternates.canonical`, () => {
      expect(meta.alternates?.canonical).toBeUndefined();
    });
  }
});
