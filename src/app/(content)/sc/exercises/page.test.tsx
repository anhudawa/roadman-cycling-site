import React from "react";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { CYCLING_EXERCISE_LIBRARY } from "@/lib/cycling-exercises";

vi.mock("@/components/seo/EvidenceBlock", () => ({
  EvidenceBlock: () => <aside>EVIDENCE SOURCES</aside>,
}));

vi.mock("./ExerciseLibraryClient", () => ({
  ExerciseLibraryClient: ({ exercises }: { exercises: unknown[] }) => (
    <div data-exercise-count={exercises.length}>EXERCISE CATALOGUE</div>
  ),
}));

describe("indexable cyclist exercise library", () => {
  it("renders a distinct collection owner with machine-readable catalogue", async () => {
    const mod = await import("./page");
    const html = renderToStaticMarkup(<mod.default />);

    expect(mod.metadata.alternates).toMatchObject({
      canonical: CYCLING_EXERCISE_LIBRARY.canonicalUrl,
      types: { "application/json": CYCLING_EXERCISE_LIBRARY.feedUrl },
    });
    expect(mod.metadata.robots).toMatchObject({ index: true, follow: true });
    expect(html).toContain('"@type":"CollectionPage"');
    expect(html).toContain('"@type":"ItemList"');
    expect(html).toContain('"numberOfItems":54');
    expect(html).toContain('data-exercise-count="54"');
    expect(html).toContain("A CATALOGUE IS NOT A RANKING");
    expect(html).toContain('href="/app#early-access"');
    expect(html).toContain('href="/blog/cycling-gym-exercises-best"');
  });

  it("overrides the section noindex only for the reviewed library page", () => {
    const layoutSource = readFileSync(
      resolve(process.cwd(), "src/app/(content)/sc/layout.tsx"),
      "utf8",
    );
    const pageSource = readFileSync(
      resolve(process.cwd(), "src/app/(content)/sc/exercises/page.tsx"),
      "utf8",
    );

    expect(layoutSource).toContain("index: false");
    expect(pageSource).toContain("index: true");
    expect(pageSource).toContain("cycling-gym-exercises-best");
    expect(pageSource).not.toMatch(/best exercises for every cyclist/i);
  });
});
