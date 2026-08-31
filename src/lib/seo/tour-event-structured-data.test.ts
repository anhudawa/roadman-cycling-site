import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

function source(path: string) {
  return readFileSync(resolve(process.cwd(), path), "utf8");
}

describe("Tour de France Event structured data", () => {
  const hub = source("src/app/tour-de-france/page.tsx");
  const stage = source("src/app/tour-de-france/stage/[number]/page.tsx");

  it("gives the parent Tour event a stable graph identifier", () => {
    expect(hub).toContain('"@id": `${URL}#event`');
    expect(hub).toContain(
      'eventStatus: "https://schema.org/EventCompleted"',
    );
  });

  it("does not emit an ID-only superEvent that Google infers as an empty Event", () => {
    expect(stage).not.toContain("superEvent:");
  });

  it("keeps every stage Event complete for Google rich results", () => {
    for (const property of [
      '"@type": "SportsEvent"',
      "startDate: stage.date",
      "endDate: stage.date",
      'eventStatus: "https://schema.org/EventCompleted"',
      "location: [tourPlace(stage.start), tourPlace(stage.finish)]",
      "description: result?.summary ?? stage.description",
    ]) {
      expect(stage).toContain(property);
    }
  });
});
