import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const PRIORITY_DISCOVERY_PATHS = [
  "/coaching",
  "/masters",
  "/training-plans",
  "/training-camps",
  "/podcast",
  "/plan",
  "/watch",
] as const;

describe("IndexNow priority search owners", () => {
  it("keeps every priority discovery surface in the curated submission", () => {
    const source = readFileSync(
      resolve(process.cwd(), "scripts/submit-indexnow.ts"),
      "utf8",
    );

    for (const path of PRIORITY_DISCOVERY_PATHS) {
      expect(source).toContain(`\`https://\${HOST}${path}\``);
    }
  });
});
