import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { SEARCH_OWNER_BY_ID } from "./search-ownership";

describe("Google AI-feature source routing", () => {
  it("makes the masters FTP tool a reciprocal resource of the masters owner", () => {
    const mastersOwner = SEARCH_OWNER_BY_ID.get("masters-cycling");

    expect(mastersOwner?.supportingDestinations).toContainEqual({
      path: "/tools/masters-ftp-benchmark",
      label: "Masters FTP Benchmark Calculator",
      intent: "Age-graded FTP and W/kg benchmarking for masters cyclists",
    });
  });

  it("links the crawlable masters FTP methodology back to the knowledge owner", () => {
    const pageSource = readFileSync(
      resolve(
        process.cwd(),
        "src/app/(content)/tools/masters-ftp-benchmark/page.tsx",
      ),
      "utf8",
    );

    expect(pageSource).toContain('href="/masters"');
    expect(pageSource).toContain('data-track="tool_mastersftp_owner"');
  });

  it("declares the masters owner in the tool dataset graph", () => {
    const layoutSource = readFileSync(
      resolve(
        process.cwd(),
        "src/app/(content)/tools/masters-ftp-benchmark/layout.tsx",
      ),
      "utf8",
    );

    expect(layoutSource).toContain(
      'isPartOf: { "@id": `${SITE_ORIGIN}/masters#webpage` }',
    );
  });
});
