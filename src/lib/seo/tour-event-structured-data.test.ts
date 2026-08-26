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
  });

  it("references the parent without emitting a second incomplete Event", () => {
    expect(stage).toContain(
      'superEvent: {\n            "@id": `${SITE_ORIGIN}/tour-de-france#event`,\n          }',
    );
    expect(stage).not.toContain(
      'superEvent: {\n            "@type": "SportsEvent"',
    );
  });

  it("keeps every stage Event complete for Google rich results", () => {
    for (const property of [
      '"@type": "SportsEvent"',
      "startDate: stage.date",
      "endDate: stage.date",
      "eventStatus: result",
      '"https://schema.org/EventCompleted"',
      '"https://schema.org/EventScheduled"',
      "location: [tourPlace(stage.start), tourPlace(stage.finish)]",
      "description: result?.summary ?? stage.description",
    ]) {
      expect(stage).toContain(property);
    }
  });
});
