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

const TRAINING_CAMP_DISCOVERY_PATHS = [
  "/blog/best-cycling-holidays-europe-2026",
  "/blog/cycling-training-camp-nutrition-guide",
  "/blog/cycling-training-camp-preparation-guide",
  "/blog/cycling-training-camps-what-to-expect-guide",
  "/blog/girona-training-camps-2026",
  "/blog/mallorca-cycling-training-camp-guide",
  "/blog/what-to-expect-cycling-training-camp",
  "/podcast/ep-2175-lessons-from-riding-in-mallorca",
] as const;

const FTP_BENCHMARK_DISCOVERY_PATHS = [
  "/blog/age-group-ftp-benchmarks-2026",
  "/blog/ftp-benchmarks-by-age-and-experience",
  "/tools/masters-ftp-benchmark",
  "/answers/ftp-by-age",
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

  it("keeps the training-camp authority cluster in repeatable discovery", () => {
    const source = readFileSync(
      resolve(process.cwd(), "scripts/submit-indexnow.ts"),
      "utf8",
    );

    for (const path of TRAINING_CAMP_DISCOVERY_PATHS) {
      if (path.startsWith("/blog/")) {
        expect(source).toContain(`"${path.slice("/blog/".length)}"`);
      } else {
        expect(source).toContain(`\`https://\${HOST}${path}\``);
      }
    }
  });

  it("keeps both FTP benchmark intents and their utilities discoverable", () => {
    const source = readFileSync(
      resolve(process.cwd(), "scripts/submit-indexnow.ts"),
      "utf8",
    );

    for (const path of FTP_BENCHMARK_DISCOVERY_PATHS) {
      expect(source).toContain(`\`https://\${HOST}${path}\``);
    }
  });
});
