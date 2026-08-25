import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

function source(path: string) {
  return readFileSync(resolve(process.cwd(), path), "utf8");
}

describe("search-owner navigation intent", () => {
  it("reserves broad navigation labels for canonical owner pages", () => {
    const navigation = source("src/types/index.ts");

    expect(navigation).toContain(
      '{ label: "Cycling Training Plans", href: "/training-plans" }',
    );
    expect(navigation).toContain(
      '{ label: "Training Plan Guides", href: "/topics/cycling-training-plans" }',
    );
    expect(navigation).toContain(
      '{ label: "Cycling Coaching Guides", href: "/topics/cycling-coaching" }',
    );
    expect(navigation).toContain(
      '{ label: "Masters Cycling Guides", href: "/topics/masters-cycling" }',
    );

    expect(navigation).not.toContain(
      '{ label: "Training Plans", href: "/topics/cycling-training-plans" }',
    );
    expect(navigation).not.toContain(
      '{ label: "Cycling Coaching", href: "/topics/cycling-coaching" }',
    );
    expect(navigation).not.toContain(
      '{ label: "Masters Cycling", href: "/topics/masters-cycling" }',
    );
  });
});
