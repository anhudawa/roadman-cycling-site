import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  requireAuth: vi.fn(),
  getSubmissionBySlug: vi.fn(),
  replaceBreakdown: vi.fn(),
  generateBreakdown: vi.fn(),
}));

vi.mock("@/lib/admin/auth", () => ({ requireAuth: mocks.requireAuth }));
vi.mock("@/lib/diagnostic/store", () => ({
  getSubmissionBySlug: mocks.getSubmissionBySlug,
  replaceBreakdown: mocks.replaceBreakdown,
}));
vi.mock("@/lib/diagnostic/generator", () => ({
  generateBreakdown: mocks.generateBreakdown,
}));

const SLUG = "regen12345";

describe("POST /api/diagnostic/[slug]/regenerate", () => {
  beforeEach(() => {
    for (const fn of Object.values(mocks)) fn.mockReset();
    mocks.requireAuth.mockResolvedValue(undefined);
    mocks.getSubmissionBySlug.mockResolvedValue({
      slug: SLUG,
      primaryProfile: "polarisation",
      secondaryProfile: null,
      answers: { Q1: 1, Q2: 2 },
    });
    mocks.generateBreakdown.mockResolvedValue({
      breakdown: { headline: "regenerated" },
      source: "claude",
      attempts: 1,
      errors: [],
    });
    mocks.replaceBreakdown.mockResolvedValue(true);
  });

  it("returns 404 when submission missing", async () => {
    mocks.getSubmissionBySlug.mockResolvedValue(null);
    const { POST } = await import("@/app/api/diagnostic/[slug]/regenerate/route");
    const res = await POST(new Request("https://example.test/x", { method: "POST" }), {
      params: Promise.resolve({ slug: "missing" }),
    });
    expect(res.status).toBe(404);
  });

  it("returns 500 when replaceBreakdown returns falsy", async () => {
    mocks.replaceBreakdown.mockResolvedValue(false);
    const { POST } = await import("@/app/api/diagnostic/[slug]/regenerate/route");
    const res = await POST(new Request("https://example.test/x", { method: "POST" }), {
      params: Promise.resolve({ slug: SLUG }),
    });
    expect(res.status).toBe(500);
  });

  it("regenerates and returns success metadata", async () => {
    const { POST } = await import("@/app/api/diagnostic/[slug]/regenerate/route");
    const res = await POST(new Request("https://example.test/x", { method: "POST" }), {
      params: Promise.resolve({ slug: SLUG }),
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.source).toBe("claude");
    expect(mocks.generateBreakdown).toHaveBeenCalledWith(
      "polarisation",
      null,
      { Q1: 1, Q2: 2 },
    );
    expect(mocks.replaceBreakdown).toHaveBeenCalledWith(SLUG, expect.any(Object));
  });

  it("requires auth (calls requireAuth before any work)", async () => {
    mocks.requireAuth.mockRejectedValueOnce(new Error("not authenticated"));
    const { POST } = await import("@/app/api/diagnostic/[slug]/regenerate/route");
    await expect(
      POST(new Request("https://example.test/x", { method: "POST" }), {
        params: Promise.resolve({ slug: SLUG }),
      }),
    ).rejects.toThrow("not authenticated");
    expect(mocks.getSubmissionBySlug).not.toHaveBeenCalled();
  });
});
