import React from "react";
import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { EvidenceBlock } from "@/components/seo/EvidenceBlock";
import { SourceMethodology } from "@/components/features/aeo/SourceMethodology";

describe("review credits need recorded evidence", () => {
  for (const Component of [EvidenceBlock, SourceMethodology]) {
    it(`${Component.name} does not infer review from the brand or author`, () => {
      const html = renderToStaticMarkup(<Component />);
      expect(html).not.toContain("Reviewed by");
      expect(html).not.toContain("Last reviewed");
      expect(html).not.toContain("synthesised from the full podcast catalogue");
      expect(html).toContain("Editorial standards");
    });
    it(`${Component.name} preserves explicit review credits and dates`, () => {
      const html = renderToStaticMarkup(<Component reviewedBy="Recorded reviewer" lastReviewed="2026-08-25" />);
      expect(html).toContain("Reviewed by Recorded reviewer");
      expect(html).toContain("Last reviewed 2026-08-25");
    });
  }
  it("does not give an unrecorded methodology to a page", () => {
    expect(renderToStaticMarkup(<SourceMethodology />)).not.toContain("on-the-record podcast conversations");
    expect(renderToStaticMarkup(<SourceMethodology methodology="Checked against the named primary reference." />)).toContain("Checked against the named primary reference.");
  });
  it("blog and answer callers do not substitute modification dates or the author", () => {
    const blog = readFileSync("src/app/(content)/blog/[slug]/page.tsx", "utf8");
    const answer = readFileSync("src/components/templates/AnswerTemplate.tsx", "utf8");
    expect(blog).not.toMatch(/post\.lastReviewed\s*\|\|/);
    expect(blog).not.toMatch(/post\.reviewedBy\s*\|\|/);
    expect(answer).not.toMatch(/answer\.reviewedBy\s*\|\|/);
    expect(answer).not.toContain("lastReviewed={dateFmt(updated)}");
  });
});
