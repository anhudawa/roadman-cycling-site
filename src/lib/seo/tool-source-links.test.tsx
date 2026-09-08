import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { TOOL_LANDING_CONTENT } from "@/lib/tools/landing-content";
import { findInternalSearchLanguage } from "./reader-copy";

vi.mock("@/components/layout", () => ({
  Section: ({ children, id }: { children: React.ReactNode; id?: string }) => <section id={id}>{children}</section>,
  Container: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));
import { ToolLanding } from "@/components/features/tools/ToolLanding";

describe("calculator evidence is usable and reader-facing", () => {
  it.each(Object.entries(TOOL_LANDING_CONTENT))("keeps %s free from internal search prose", (_slug, content) => {
    expect(findInternalSearchLanguage(JSON.stringify(content))).toEqual([]);
  });
  it("uses source titles as crawlable link text and labels modification dates accurately", () => {
    const html = renderToStaticMarkup(<ToolLanding slug="tyre-pressure" />);
    const source = TOOL_LANDING_CONTENT["tyre-pressure"].evidenceSources![0];
    const anchor = [...html.matchAll(/<a\b[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g)]
      .find((match) => match[1] === source.href.replaceAll("&", "&amp;"));
    expect(anchor?.[2]).toContain(source.name.replaceAll("&", "&amp;"));
    expect(html).toContain("Updated ");
    expect(html).not.toContain("Last reviewed ");
    for (const id of ["methodology", "worked-examples", "limitations", "sources"]) {
      expect(html).toContain(`href="#${id}"`);
      expect(html.match(new RegExp(`id="${id}"`, "g"))).toHaveLength(1);
    }
  });
});
