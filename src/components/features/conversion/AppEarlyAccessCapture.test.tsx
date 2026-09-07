import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { AppEarlyAccessCaptureFallback } from "./AppEarlyAccessCapture";

vi.stubGlobal("React", React);

describe("Good Legs waitlist handoff", () => {
  it("renders a working product link without bundling newsletter consent", () => {
    const html = renderToStaticMarkup(<AppEarlyAccessCaptureFallback placement="hero" acquisitionSource="strength-guide" />);
    expect(html).toContain('href="https://getgoodlegs.com/?utm_source=roadman');
    expect(html).toContain("roadman-app-waitlist-strength-guide-hero");
    expect(html).toContain('href="/community/not-done-yet"');
    expect(html).toContain("will receive access at launch");
    expect(html).toContain("does not guarantee a beta invitation");
    expect(html).not.toContain("<form");
    expect(html).not.toContain("Saturday Spin");
  });
});
