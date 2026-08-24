import { describe, expect, it } from "vitest";
import { aggregateSearchOwnerClickRows } from "./search-owner-clicks";

describe("search owner click aggregation", () => {
  it("retains and sorts the source pages behind each owner total", () => {
    const result = aggregateSearchOwnerClickRows([
      {
        trackId: "search_owner_cycling-training-plans",
        destination: "/training-plans",
        page: "/blog/how-pro-cyclist-trains-60-days",
        clicks: 7,
      },
      {
        trackId: "search_owner_cycling-training-plans",
        destination: "/training-plans",
        page: "/topics/cycling-training-plans",
        clicks: 2,
      },
      {
        trackId: "search_owner_cycling-training-plans",
        destination: "/training-plans",
        page: "/blog/how-pro-cyclist-trains-60-days",
        clicks: 1,
      },
      {
        trackId: "search_owner_cycling-coaching",
        destination: "",
        page: "/blog/best-online-cycling-coach-how-to-choose",
        clicks: 3,
      },
    ]);

    expect(result).toEqual([
      {
        ownerId: "cycling-training-plans",
        destination: "/training-plans",
        clicks: 10,
        sourcePages: 2,
        sources: [
          {
            page: "/blog/how-pro-cyclist-trains-60-days",
            clicks: 8,
          },
          { page: "/topics/cycling-training-plans", clicks: 2 },
        ],
      },
      {
        ownerId: "cycling-coaching",
        destination: "/coaching",
        clicks: 3,
        sourcePages: 1,
        sources: [
          {
            page: "/blog/best-online-cycling-coach-how-to-choose",
            clicks: 3,
          },
        ],
      },
    ]);
  });

  it("ignores invalid owners and non-positive counts", () => {
    expect(
      aggregateSearchOwnerClickRows([
        {
          trackId: "search_owner_not-a-real-owner",
          destination: "/wrong",
          page: "/blog/wrong",
          clicks: 5,
        },
        {
          trackId: "search_owner_cycling-podcast",
          destination: "/podcast",
          page: "/blog/best-cycling-podcasts-2026",
          clicks: 0,
        },
      ]),
    ).toEqual([]);
  });
});
