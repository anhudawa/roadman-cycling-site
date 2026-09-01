import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const read = (path: string) =>
  readFileSync(resolve(process.cwd(), path), "utf8");

describe("cycling strength commercial bridges", () => {
  const sources = [
    "content/blog/cycling-strength-training-guide.mdx",
    "content/blog/cycling-strength-training-12-week-beginner-plan.mdx",
    "content/blog/cycling-gym-exercises-best.mdx",
    "content/topics/cycling-strength-conditioning.mdx",
  ];

  it("routes every high-authority strength resource into the sole course owner", () => {
    for (const source of sources) {
      expect(read(source), `${source} -> /strength-training`).toContain(
        "](/strength-training)",
      );
    }
  });

  it("keeps the fixed course, adaptive app and individual coaching distinct", () => {
    const guide = read(sources[0]);
    const hub = read(sources[3]);

    expect(guide).toContain("](/best/best-cycling-strength-training-apps)");
    expect(guide).toContain("](/app?source=strength-guide)");
    expect(guide).toContain("](/coaching)");
    expect(hub).toContain("](/app?source=strength-hub)");
    expect(hub).toContain("](/coaching)");
  });

  it("does not attach unsafe outcome promises to the commercial handoffs", () => {
    const bridgeCopy = sources.map(read).join("\n");

    for (const claim of [
      "guaranteed FTP",
      "prevent injury",
      "pain-free",
      "directly transfer",
    ]) {
      expect(bridgeCopy.toLowerCase()).not.toContain(claim.toLowerCase());
    }
  });

  it("preserves one indexable course owner", () => {
    const owner = read("src/app/(marketing)/strength-training/page.tsx");
    const redirects = read("next.config.ts");

    expect(owner).toContain('const PRODUCT_PATH = "/strength-training"');
    expect(owner).toContain("alternates: { canonical: PRODUCT_URL }");
    expect(redirects).toContain('destination: "/strength-training"');
  });
});
