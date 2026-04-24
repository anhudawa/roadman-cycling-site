import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getSubmissionBySlug: vi.fn(),
  maskEmail: vi.fn((email: string) => email.replace(/(.).+(@.+)/, "$1***$2")),
}));

vi.mock("@/lib/diagnostic/store", () => ({
  getSubmissionBySlug: mocks.getSubmissionBySlug,
}));
vi.mock("@/lib/admin/events-store", () => ({
  maskEmail: mocks.maskEmail,
}));

const SLUG = "abc1234567";
const submission = {
  slug: SLUG,
  email: "rider@example.com",
  primaryProfile: "underRecovered",
  secondaryProfile: "fuelingDeficit",
  severeMultiSystem: false,
  closeToBreakthrough: false,
  breakdown: { headline: "You are under-recovered." },
  createdAt: new Date("2026-04-20T10:00:00Z"),
};

describe("GET /api/diagnostic/[slug]", () => {
  beforeEach(() => {
    for (const fn of Object.values(mocks)) fn.mockReset();
    mocks.maskEmail.mockImplementation((email: string) =>
      email.replace(/(.).+(@.+)/, "$1***$2"),
    );
  });

  it("returns 404 for missing slug param", async () => {
    const { GET } = await import("@/app/api/diagnostic/[slug]/route");
    const res = await GET(new Request("https://example.test/api/diagnostic/"), {
      params: Promise.resolve({ slug: "" }),
    });
    expect(res.status).toBe(404);
  });

  it("returns 404 when slug is too long", async () => {
    const { GET } = await import("@/app/api/diagnostic/[slug]/route");
    const res = await GET(new Request("https://example.test/x"), {
      params: Promise.resolve({ slug: "x".repeat(40) }),
    });
    expect(res.status).toBe(404);
  });

  it("returns 404 when submission not found", async () => {
    mocks.getSubmissionBySlug.mockResolvedValue(null);
    const { GET } = await import("@/app/api/diagnostic/[slug]/route");
    const res = await GET(new Request("https://example.test/x"), {
      params: Promise.resolve({ slug: "missing" }),
    });
    expect(res.status).toBe(404);
  });

  it("returns submission render-safe fields without raw email", async () => {
    mocks.getSubmissionBySlug.mockResolvedValue(submission);
    const { GET } = await import("@/app/api/diagnostic/[slug]/route");
    const res = await GET(new Request("https://example.test/x"), {
      params: Promise.resolve({ slug: SLUG }),
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.slug).toBe(SLUG);
    expect(body.primaryProfile).toBe("underRecovered");
    expect(body.secondaryProfile).toBe("fuelingDeficit");
    expect(body.breakdown.headline).toBe("You are under-recovered.");
    expect(body.emailHint).toBe("r***@example.com");
    expect(body.email).toBeUndefined();
    expect(body.answers).toBeUndefined();
    expect(body.createdAt).toBe("2026-04-20T10:00:00.000Z");
  });
});
