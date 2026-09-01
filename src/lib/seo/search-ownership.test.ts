import { describe, expect, it } from "vitest";
import {
  getSearchOwnerFallbackForTopicHub,
  getSearchOwnerWebPageId,
  hasDistinctSupportingIntent,
  SEARCH_OWNERS,
  SEARCH_OWNER_BY_ID,
  resolveSearchOwner,
  serialiseSearchOwners,
  stripRoadmanBrandSuffix,
} from "./search-ownership";

describe("search ownership registry", () => {
  it("declares one unique route for every priority query family", () => {
    expect(SEARCH_OWNERS).toHaveLength(7);
    expect(new Set(SEARCH_OWNERS.map((owner) => owner.path)).size).toBe(7);
    expect(new Set(SEARCH_OWNERS.map((owner) => owner.primaryQuery)).size).toBe(7);
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
    expect(resolveSearchOwner(["best cycling recovery app"])?.path).toBe(
      "/app",
    );
    expect(resolveSearchOwner(["strength training app for cyclists"])?.path).toBe(
      "/app",
    );
    expect(resolveSearchOwner(["how to recover after cycling"])?.path).toBe(
      "/blog/cycling-recovery-tips",
    );
    expect(resolveSearchOwner(["best cycling recovery app"])?.path).toBe(
      "/app",
    );
  });

  it("uses explicit supporting-route ownership before fuzzy metadata", () => {
    expect(
      resolveSearchOwner(["Training Like a Pro Cyclist for 60 Days"], {
        currentPath: "/blog/how-pro-cyclist-trains-60-days",
      })?.path,
    ).toBe("/training-plans");

    expect(
      resolveSearchOwner(["cycling coaching"], {
        currentPath: "/coaching/",
      }),
    ).toBeNull();

    expect(
      resolveSearchOwner(["Best Cycling Strength Training Apps"], {
        currentPath: "/best/best-cycling-strength-training-apps",
      })?.path,
    ).toBe("/app");
  });

  it("uses editorial topic ownership only as a broad fallback", () => {
    const trainingPlanFallback = getSearchOwnerFallbackForTopicHub(
      "cycling-training-plans",
    );

    expect(trainingPlanFallback).toBe("cycling-training-plans");
    expect(
      resolveSearchOwner(["Amstel Gold Race Sportive Guide"], {
        fallbackId: trainingPlanFallback,
      })?.path,
    ).toBe("/training-plans");
    expect(
      resolveSearchOwner(["Cycling Training Camp Preparation"], {
        fallbackId: trainingPlanFallback,
      })?.path,
    ).toBe("/training-camps");
    expect(
      getSearchOwnerFallbackForTopicHub("cycling-nutrition"),
    ).toBeUndefined();
    expect(getSearchOwnerFallbackForTopicHub("cycling-recovery")).toBe(
      "cycling-recovery",
    );
    expect(
      resolveSearchOwner(["Cycling Recovery: What Actually Works After a Ride"], {
        currentPath: "/blog/cycling-recovery-tips",
        fallbackId: "cycling-recovery",
      }),
    ).toBeNull();
  });

  it("does not manufacture a match for unrelated content", () => {
    expect(resolveSearchOwner(["How much carbohydrate should I eat?"])).toBeNull();
  });

  it("evaluates the visible title rather than a legacy Roadman suffix", () => {
    expect(
      stripRoadmanBrandSuffix(
        "Why Your FTP Hasn't Moved | Roadman Cycling Podcast",
      ),
    ).toBe("Why Your FTP Hasn't Moved");
    expect(stripRoadmanBrandSuffix("Roadman Method Review")).toBe(
      "Roadman Method Review",
    );
  });

  it("returns the canonical WebPage node for a search owner", () => {
    expect(getSearchOwnerWebPageId(SEARCH_OWNERS[1])).toBe(
      "https://roadmancycling.com/coaching#webpage",
    );
  });

  it("distinguishes narrow supporting intent from a generic head-term guide", () => {
    const coaching = SEARCH_OWNER_BY_ID.get("cycling-coaching")!;
    const podcast = SEARCH_OWNER_BY_ID.get("cycling-podcast")!;

    expect(
      hasDistinctSupportingIntent(
        "Cycling Coaching: The Complete Guide",
        coaching,
      ),
    ).toBe(false);
    expect(
      hasDistinctSupportingIntent(
        "Cycling Coaching Results: Before and After From Real Riders",
        coaching,
      ),
    ).toBe(true);
    expect(
      hasDistinctSupportingIntent("Best Cycling Podcasts 2026", podcast),
    ).toBe(true);
  });

  it("exposes absolute canonical URLs for agents", () => {
    const podcastOwner = serialiseSearchOwners()[0];
    expect(podcastOwner.url).toBe(
      "https://roadmancycling.com/podcast",
    );
    expect(podcastOwner.supportingDestinations[0].url).toBe(
      "https://roadmancycling.com/blog/best-cycling-podcasts-2026",
    );
    expect(
      serialiseSearchOwners().find((owner) => owner.id === "cycling-recovery")
        ?.dataUrl,
    ).toBe("https://roadmancycling.com/feeds/cycling-recovery.json");
  });
});
