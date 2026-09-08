import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { enrollNdyApplicant } from "./application-beehiiv";
import { applicationNextUrl, assessApplication } from "./application-offer";

const input = { name: "Sam Rider", email: "sam@example.com", accessToken: "a".repeat(64),
  goal: "Race or event with a date", hours: "6-9 hours", frustration: "No structure" };
const subscriber = { id: "sub_123", email: input.email, status: "active" };
const json = (data: unknown, status = 200) => new Response(JSON.stringify({ data }), { status });
const fetcher = vi.fn<typeof fetch>();
const beforeEnroll = vi.fn<(id: string) => Promise<void>>();

describe("NDY Beehiiv application email", () => {
  beforeEach(() => {
    vi.stubEnv("BEEHIIV_API_KEY", "test-only"); vi.stubEnv("BEEHIIV_PUBLICATION_ID", "pub_test");
    vi.stubEnv("BEEHIIV_AUTOMATION_NDY_APPLICATION", "aut_test");
    vi.stubGlobal("fetch", fetcher); fetcher.mockReset(); beforeEnroll.mockReset().mockResolvedValue(undefined);
  });
  afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); });

  it("updates an existing subscriber before enrolling once", async () => {
    const order: string[] = [];
    beforeEnroll.mockImplementation(async () => { order.push("persist"); });
    fetcher.mockImplementation(async (url) => {
      if (String(url).includes("?email=")) return json([subscriber]);
      if (String(url).endsWith("/journeys")) { order.push("enroll"); return json({ id: "aj_123" }); }
      return json({});
    });
    const result = await enrollNdyApplicant(input, beforeEnroll);
    expect(result).toEqual({ status: "enrolled", subscriberId: "sub_123", journeyId: "aj_123" });
    expect(order).toEqual(["persist", "enroll"]);
    const payload = JSON.parse(String(fetcher.mock.calls[1][1]?.body));
    expect(payload.custom_fields).toContainEqual({ name: "ndy_questions_url", value: applicationNextUrl(input.accessToken, "questions") });
    expect(fetcher.mock.calls.filter(([url]) => String(url).endsWith("/journeys"))).toHaveLength(1);
  });

  it("creates a new subscriber without triggering a generic welcome or reactivation", async () => {
    fetcher.mockResolvedValueOnce(json([])).mockResolvedValueOnce(json(subscriber))
      .mockResolvedValueOnce(json({})).mockResolvedValueOnce(json({})).mockResolvedValueOnce(json({ id: "aj_new" }));
    expect((await enrollNdyApplicant(input, beforeEnroll)).status).toBe("enrolled");
    expect(JSON.parse(String(fetcher.mock.calls[1][1]?.body))).toMatchObject({ reactivate_existing: false, send_welcome_email: false });
    expect(JSON.parse(String(fetcher.mock.calls[1][1]?.body))).not.toHaveProperty("automation_ids");
  });

  it("handles a subscriber created concurrently by another form", async () => {
    fetcher.mockResolvedValueOnce(json([])).mockResolvedValueOnce(json({}, 409)).mockResolvedValueOnce(json([subscriber]))
      .mockResolvedValueOnce(json({})).mockResolvedValueOnce(json({})).mockResolvedValueOnce(json({ id: "aj_123" }));
    expect((await enrollNdyApplicant(input, beforeEnroll)).status).toBe("enrolled");
  });

  it.each(["inactive", "pending", "validating", "invalid"])("does not reactivate or email %s subscribers", async (status) => {
    fetcher.mockResolvedValueOnce(json([{ ...subscriber, status }]));
    expect((await enrollNdyApplicant(input, beforeEnroll)).status).toBe("suppressed");
    expect(fetcher).toHaveBeenCalledTimes(1); expect(beforeEnroll).not.toHaveBeenCalled();
  });

  it("does not enroll when personalised fields could not be saved", async () => {
    fetcher.mockResolvedValueOnce(json([subscriber])).mockResolvedValueOnce(json({}, 422));
    expect((await enrollNdyApplicant(input, beforeEnroll)).status).toBe("failed");
    expect(beforeEnroll).not.toHaveBeenCalled(); expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it("does not enroll when the durable marker cannot be saved", async () => {
    fetcher.mockResolvedValueOnce(json([subscriber])).mockResolvedValueOnce(json({})).mockResolvedValueOnce(json({}));
    beforeEnroll.mockRejectedValue(new Error("Database unavailable"));
    expect((await enrollNdyApplicant(input, beforeEnroll)).status).toBe("failed");
    expect(fetcher).toHaveBeenCalledTimes(3);
  });

  it.each(["timeout", "server-error", "missing-id"])("holds ambiguous %s enrollment instead of silently retrying", async (failure) => {
    fetcher.mockResolvedValueOnce(json([subscriber])).mockResolvedValueOnce(json({})).mockResolvedValueOnce(json({}));
    if (failure === "timeout") fetcher.mockRejectedValueOnce(new Error("Timed out"));
    else fetcher.mockResolvedValueOnce(json({}, failure === "server-error" ? 503 : 200));
    expect((await enrollNdyApplicant(input, beforeEnroll)).status).toBe("uncertain");
    expect(fetcher).toHaveBeenCalledTimes(4);
  });

  it("leaves a rejected enrollment retryable", async () => {
    fetcher.mockResolvedValueOnce(json([subscriber])).mockResolvedValueOnce(json({})).mockResolvedValueOnce(json({})).mockResolvedValueOnce(json({}, 429));
    expect((await enrollNdyApplicant(input, beforeEnroll)).status).toBe("failed");
  });

  it("keeps unconfigured jobs visible without making requests", async () => {
    vi.stubEnv("BEEHIIV_AUTOMATION_NDY_APPLICATION", "");
    expect((await enrollNdyApplicant(input, beforeEnroll)).status).toBe("failed"); expect(fetcher).not.toHaveBeenCalled();
  });
});

describe("the automatic fit screen", () => {
  it("gives the fit message for a supported cycling goal and sufficient time", () => {
    expect(assessApplication(input).outcome).toBe("ready");
  });
  it.each([{ hours: "Under 4 hours" }, { frustration: "Injury or comeback — trying to get back" }, { frustration: "Knee pain" }, { goal: "Something unrelated" }])("does not imply a perfect fit for cases needing discussion", (change) => {
    const result = assessApplication({ ...input, ...change });
    expect(result.outcome).toBe("review"); expect(result.message).not.toContain("great fit");
  });
  it("keeps bearer tokens out of URL queries and server request paths", () => {
    const url = new URL(applicationNextUrl(input.accessToken));
    expect(url.search).toBe(""); expect(url.pathname).toBe("/apply/next"); expect(url.hash).toContain(input.accessToken);
  });
});
