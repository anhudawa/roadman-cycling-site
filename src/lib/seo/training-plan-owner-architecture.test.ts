import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { metadata as eventPlanMetadata } from "@/app/(content)/plan/page";
import {
  hasDistinctSupportingIntent,
  SEARCH_OWNER_BY_ID,
} from "./search-ownership";
import { buildSearchOwnerTrustProperties } from "./search-owner-schema";

describe("training-plan owner architecture", () => {
  it("registers the event directory as a distinct supporting destination", () => {
    const owner = SEARCH_OWNER_BY_ID.get("cycling-training-plans");

    expect(owner?.supportingDestinations).toContainEqual({
      path: "/plan",
      label: "Cycling Training Plans by Event",
      intent: "Event-specific plan directory organised by weeks remaining",
    });
    expect(
      buildSearchOwnerTrustProperties("cycling-training-plans").relatedLink,
    ).toContain("https://roadmancycling.com/plan");
  });

  it("keeps the event directory snippet narrow and distinct from the owner", () => {
    const owner = SEARCH_OWNER_BY_ID.get("cycling-training-plans");
    const title =
      typeof eventPlanMetadata.title === "object" &&
      eventPlanMetadata.title !== null &&
      "absolute" in eventPlanMetadata.title
        ? eventPlanMetadata.title.absolute
        : undefined;

    expect(owner).toBeDefined();
    expect(title).toBe("Cycling Event Training Plans — 17 Sportives");
    expect(title?.length).toBeLessThanOrEqual(60);
    expect(hasDistinctSupportingIntent(title ?? "", owner!)).toBe(true);
    expect(String(eventPlanMetadata.description).length).toBeLessThanOrEqual(160);
    expect(eventPlanMetadata.alternates?.canonical).toBe(
      "https://roadmancycling.com/plan",
    );
  });

  it("links the canonical owner and event directory in both directions", () => {
    const ownerSource = readFileSync(
      resolve(process.cwd(), "src/app/(marketing)/training-plans/page.tsx"),
      "utf8",
    );
    const directorySource = readFileSync(
      resolve(process.cwd(), "src/app/(content)/plan/page.tsx"),
      "utf8",
    );

    expect(ownerSource).toContain('href="/plan"');
    expect(ownerSource).toContain('data-track="training_plans_event_directory"');
    expect(directorySource).toContain(
      "<SearchOwnerLink owner={TRAINING_PLAN_OWNER} />",
    );
    expect(directorySource).toContain(
      "getSearchOwnerWebPageId(TRAINING_PLAN_OWNER)",
    );
  });
});
