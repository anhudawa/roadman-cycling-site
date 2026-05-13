import { describe, expect, it } from "vitest";
import { sanitizeBeehiivHtml } from "@/lib/integrations/beehiiv";

describe("sanitizeBeehiivHtml", () => {
  it("returns null for null", () => {
    expect(sanitizeBeehiivHtml(null)).toBeNull();
  });

  it("returns empty string for empty input", () => {
    expect(sanitizeBeehiivHtml("")).toBe("");
  });

  it("strips DOCTYPE declaration", () => {
    const out = sanitizeBeehiivHtml("<!DOCTYPE html><p>hi</p>");
    expect(out).toBe("<p>hi</p>");
  });

  it("strips <html> open and close tags", () => {
    const out = sanitizeBeehiivHtml("<html><p>hi</p></html>");
    expect(out).toBe("<p>hi</p>");
  });

  it("strips the entire <head>...</head> block including external font links", () => {
    const input =
      "<head><link href='https://fonts.googleapis.com/css2?family=Poppins' rel='stylesheet'><style>:root { --wt-text-on-background-color: #222 }</style></head><p>hi</p>";
    const out = sanitizeBeehiivHtml(input);
    expect(out).toBe("<p>hi</p>");
    expect(out).not.toContain("fonts.googleapis.com");
    expect(out).not.toContain("--wt-text-on-background-color");
  });

  it("strips <body> open tag including its class/style attributes (prevents merge into page body)", () => {
    const input =
      "<body class='bg-wt-background' style='color: var(--wt-text-on-background-color) !important;'><p>hi</p></body>";
    const out = sanitizeBeehiivHtml(input);
    expect(out).toBe("<p>hi</p>");
    expect(out).not.toContain("<body");
    expect(out).not.toContain("bg-wt-background");
  });

  it("preserves headings, paragraphs, and inline styles inside the body", () => {
    const input =
      "<body><h2>Title</h2><p style=\"color:#2D2D2D;color:var(--wt-text-on-background-color) !important;\">Hello <strong>world</strong></p></body>";
    const out = sanitizeBeehiivHtml(input);
    expect(out).toContain("<h2>Title</h2>");
    expect(out).toContain("<strong>world</strong>");
    expect(out).toContain('color:var(--wt-text-on-background-color)');
  });

  it("handles a full Beehiiv envelope", () => {
    const input = [
      "<!DOCTYPE html>",
      "<html>",
      "<head>",
      "<link href='https://fonts.gstatic.com' rel='preconnect'>",
      "<style>:root { --wt-text-on-background-color: #222 }</style>",
      "</head>",
      "<body class='bg-wt-background' style='color: var(--wt-text-on-background-color) !important;'>",
      "<h2>The Saturday Spin</h2>",
      "<p>Newsletter copy.</p>",
      "</body>",
      "</html>",
    ].join("");
    const out = sanitizeBeehiivHtml(input);
    expect(out).toContain("<h2>The Saturday Spin</h2>");
    expect(out).toContain("<p>Newsletter copy.</p>");
    expect(out).not.toContain("<!DOCTYPE");
    expect(out).not.toContain("<html");
    expect(out).not.toContain("<head");
    expect(out).not.toContain("<body");
    expect(out).not.toContain("--wt-text-on-background-color: #222");
    expect(out).not.toContain("fonts.gstatic.com");
  });

  it("handles malformed input with missing </body>", () => {
    const input =
      "<!DOCTYPE html><html><body class='bg-wt-background'><p>hi</p>";
    const out = sanitizeBeehiivHtml(input);
    expect(out).toContain("<p>hi</p>");
    expect(out).not.toContain("<body");
    expect(out).not.toContain("bg-wt-background");
  });

  it("leaves plain HTML untouched when there are no wrappers", () => {
    const input = "<h2>Hello</h2><p>World</p>";
    expect(sanitizeBeehiivHtml(input)).toBe(input);
  });
});
