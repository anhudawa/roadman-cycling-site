import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

describe("12-week cyclist strength programme", () => {
  it("remains a supporting noindex tool and names the editorial owner", async () => {
    const page = await import("./page");
    const layout = await import("../layout");
    const html = renderToStaticMarkup(<page.default />);

    expect(layout.metadata.robots).toMatchObject({
      index: false,
      follow: true,
    });
    expect(html).toContain("not an individual prescription");
    expect(html).toContain(
      'href="/blog/cycling-strength-training-12-week-beginner-plan"',
    );
    expect(html).toContain('href="/feeds/cycling-strength-programme.json"');
    expect(html.match(/href="\/sc\/programme\/week\//g) ?? []).toHaveLength(12);
  });
});
