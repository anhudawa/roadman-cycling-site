import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { subscribeToBeehiiv } from "./beehiiv";

describe("subscribeToBeehiiv automation enrolment", () => {
  beforeEach(() => {
    vi.stubEnv("BEEHIIV_API_KEY", "test-key");
    vi.stubEnv("BEEHIIV_PUBLICATION_ID", "pub_test");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("adds a new subscriber to each unique Add-by-API journey", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ data: { id: "sub_new" } }), {
          status: 201,
        }),
      )
      .mockResolvedValueOnce(new Response(null, { status: 204 }))
      .mockResolvedValueOnce(new Response(null, { status: 204 }))
      .mockResolvedValueOnce(new Response(null, { status: 204 }));

    const result = await subscribeToBeehiiv({
      email: "rider@example.com",
      tags: ["plateau-diagnostic"],
      automationIds: ["aut_one", "aut_one", "aut_two"],
      customFields: { diagnostic_profile: "Under-Recovered" },
    });

    expect(result).toEqual({ subscriberId: "sub_new", created: true });
    const calls = fetchMock.mock.calls.map(([url, init]) => ({
      url: String(url),
      method: init?.method ?? "GET",
      body: init?.body,
    }));
    expect(calls.filter(({ url }) => url.endsWith("/journeys"))).toEqual([
      expect.objectContaining({
        url: expect.stringContaining("/automations/aut_one/journeys"),
        method: "POST",
        body: JSON.stringify({ subscription_id: "sub_new" }),
      }),
      expect.objectContaining({
        url: expect.stringContaining("/automations/aut_two/journeys"),
        method: "POST",
        body: JSON.stringify({ subscription_id: "sub_new" }),
      }),
    ]);
  });

  it("refreshes an existing subscriber before tagging and enrolment", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(new Response(null, { status: 409 }))
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ data: [{ id: "sub_existing" }] }), {
          status: 200,
        }),
      )
      .mockResolvedValueOnce(new Response(null, { status: 200 }))
      .mockResolvedValueOnce(new Response(null, { status: 204 }))
      .mockResolvedValueOnce(new Response(null, { status: 204 }));

    const result = await subscribeToBeehiiv({
      email: "existing@example.com",
      tags: ["profile-underRecovered"],
      automationIds: ["aut_under"],
      customFields: { diagnostic_profile: "Under-Recovered" },
    });

    expect(result).toEqual({ subscriberId: "sub_existing", created: false });
    expect(fetchMock.mock.calls.slice(2).map(([url, init]) => ({
      url: String(url),
      method: init?.method,
    }))).toEqual([
      {
        url: expect.stringContaining("/subscriptions/sub_existing"),
        method: "PATCH",
      },
      {
        url: expect.stringContaining("/subscriptions/sub_existing/tags"),
        method: "POST",
      },
      {
        url: expect.stringContaining("/automations/aut_under/journeys"),
        method: "POST",
      },
    ]);
  });
});
