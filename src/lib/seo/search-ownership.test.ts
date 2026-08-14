import { describe, expect, it } from "vitest";
import {
  SEARCH_OWNERS,
  resolveSearchOwner,
  serialiseSearchOwners,
} from "./search-ownership";

describe("search ownership registry", () => {
  it("declares one unique route for every priority query family", () => {
    expect(SEARCH_OWNERS).toHaveLength(5);
    expect(new Set(SEARCH_OWNERS.map((owner) => owner.path)).size).toBe(5);
    expect(new Set(SEARCH_OWNERS.map((owner) => owner.primaryQuery)).size).toBe(5);
  });

  it("maps narrow supporting content to its broad owner", () => {
    expect(resolveSearchOwner(["How to improve your cycling after 40"])?.path).toBe(
      "/masters",
    );
    expect(resolveSearchOwner(["Your first Girona cycling camp"])?.path).toBe(
      "/training-camps",
    );
    expect(resolveSearchOwner(["Is an online cycling coach worth it?"])?.path).toBe(
      "/coaching",
    );
  });

  it("does not manufacture a match for unrelated content", () => {
    expect(resolveSearchOwner(["How much carbohydrate should I eat?"])).toBeNull();
  });

  it("exposes absolute canonical URLs for agents", () => {
    expect(serialiseSearchOwners()[0].url).toBe(
      "https://roadmancycling.com/podcast",
    );
  });
});
