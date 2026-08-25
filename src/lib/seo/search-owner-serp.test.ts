import type { Metadata } from "next";
import { describe, expect, it } from "vitest";
import { metadata as coachingMetadata } from "@/app/(marketing)/coaching/page";
import { metadata as mastersMetadata } from "@/app/(marketing)/masters/page";
import { metadata as trainingPlansMetadata } from "@/app/(marketing)/training-plans/page";
import { metadata as trainingCampsMetadata } from "@/app/(marketing)/training-camps/page";

function absoluteTitle(value: Metadata["title"]): string | undefined {
  if (typeof value !== "object" || value === null || !("absolute" in value)) {
    return undefined;
  }

  return typeof value.absolute === "string" ? value.absolute : undefined;
}

const OWNER_SNIPPETS = [
  {
    id: "cycling coaching",
    metadata: coachingMetadata,
    query: "Cycling Coaching",
    canonical: "https://roadmancycling.com/coaching",
  },
  {
    id: "masters cycling",
    metadata: mastersMetadata,
    query: "Masters Cycling Training",
    canonical: "https://roadmancycling.com/masters",
  },
  {
    id: "cycling training plans",
    metadata: trainingPlansMetadata,
    query: "Cycling Training Plans",
    canonical: "https://roadmancycling.com/training-plans",
  },
  {
    id: "cycling training camps",
    metadata: trainingCampsMetadata,
    query: "Cycling Training Camps",
    canonical: "https://roadmancycling.com/training-camps",
  },
] as const;

describe("priority search-owner SERP propositions", () => {
  it.each(OWNER_SNIPPETS)(
    "keeps the $id owner concise, specific and self-canonical",
    ({ metadata, query, canonical }) => {
      const title = absoluteTitle(metadata.title);
      const description = String(metadata.description);

      expect(title).toContain(query);
      expect(title?.length).toBeLessThanOrEqual(60);
      expect(description.length).toBeGreaterThanOrEqual(120);
      expect(description.length).toBeLessThanOrEqual(160);
      expect(metadata.alternates?.canonical).toBe(canonical);
    },
  );
});
