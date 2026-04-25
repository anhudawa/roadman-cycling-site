import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getProductBySlug: vi.fn(),
  createOrder: vi.fn(),
  createPaidReport: vi.fn(),
  upsertRiderProfile: vi.fn(),
  getToolResultBySlug: vi.fn(),
  logCrmSync: vi.fn(),
  isPaidProductSlug: vi.fn(),
}));

vi.mock("@/lib/paid-reports/products", () => ({
  getProductBySlug: mocks.getProductBySlug,
}));
vi.mock("@/lib/paid-reports/orders", () => ({
  createOrder: mocks.createOrder,
}));
vi.mock("@/lib/paid-reports/reports", () => ({
  createPaidReport: mocks.createPaidReport,
}));
vi.mock("@/lib/rider-profile/store", () => ({
  upsertByEmail: mocks.upsertRiderProfile,
}));
vi.mock("@/lib/tool-results/store", () => ({
  getToolResultBySlug: mocks.getToolResultBySlug,
}));
vi.mock("@/lib/paid-reports/crm-sync-log", () => ({
  logCrmSync: mocks.logCrmSync,
}));
vi.mock("@/lib/paid-reports/types", () => ({
  isPaidProductSlug: mocks.isPaidProductSlug,
}));

function req(body: unknown): Request {
  return new Request("https://example.test/api/reports/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

describe("POST /api/reports/checkout $€” validation", () => {
  const original = process.env.STRIPE_SECRET_KEY;

  beforeEach(() => {
    for (const fn of Object.values(mocks)) fn.mockReset();
    mocks.isPaidProductSlug.mockReturnValue(true);
    mocks.upsertRiderProfile.mockResolvedValue({ id: 1 });
    mocks.logCrmSync.mockResolvedValue(undefined);
    delete process.env.STRIPE_SECRET_KEY;
  });

  afterEach(() => {
    if (original === undefined) delete process.env.STRIPE_SECRET_KEY;
    else process.env.STRIPE_SECRET_KEY = original;
  });

  it("rejects missing/invalid email with 400", async () => {
    const { POST } = await import("@/app/api/reports/checkout/route");
    const res = await POST(req({ productSlug: "x", email: "not-an-email" }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/valid email/i);
  });

  it("rejects unknown product slug with 400", async () => {
    mocks.isPaidProductSlug.mockReturnValue(false);
    const { POST } = await import("@/app/api/reports/checkout/route");
    const res = await POST(req({ email: "rider@example.com", productSlug: "bogus" }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/Unknown report product/i);
  });

  it("returns 404 when product is not found / not active", async () => {
    mocks.getProductBySlug.mockResolvedValue(null);
    const { POST } = await import("@/app/api/reports/checkout/route");
    const res = await POST(req({ email: "rider@example.com", productSlug: "plateau" }));
    expect(res.status).toBe(404);
  });

  it("returns 404 when product is inactive", async () => {
    mocks.getProductBySlug.mockResolvedValue({
      slug: "plateau", active: false, priceCents: 4900, currency: "usd",
      name: "Plateau", description: "x",
    });
    const { POST } = await import("@/app/api/reports/checkout/route");
    const res = await POST(req({ email: "rider@example.com", productSlug: "plateau" }));
    expect(res.status).toBe(404);
  });

  it("returns 404 when toolResultSlug references missing tool result", async () => {
    mocks.getProductBySlug.mockResolvedValue({
      slug: "plateau", active: true, priceCents: 4900, currency: "usd",
      name: "Plateau", description: "x",
    });
    mocks.getToolResultBySlug.mockResolvedValue(null);
    const { POST } = await import("@/app/api/reports/checkout/route");
    const res = await POST(
      req({ email: "rider@example.com", productSlug: "plateau", toolResultSlug: "missing" }),
    );
    expect(res.status).toBe(404);
  });

  it("returns 403 when toolResult email does not match request email", async () => {
    mocks.getProductBySlug.mockResolvedValue({
      slug: "plateau", active: true, priceCents: 4900, currency: "usd",
      name: "Plateau", description: "x",
    });
    mocks.getToolResultBySlug.mockResolvedValue({
      id: 1, slug: "abc", email: "other@example.com", toolSlug: "plateau",
    });
    const { POST } = await import("@/app/api/reports/checkout/route");
    const res = await POST(
      req({ email: "rider@example.com", productSlug: "plateau", toolResultSlug: "abc" }),
    );
    expect(res.status).toBe(403);
  });

  it("returns 500 when STRIPE_SECRET_KEY is not configured", async () => {
    mocks.getProductBySlug.mockResolvedValue({
      slug: "plateau", active: true, priceCents: 4900, currency: "usd",
      name: "Plateau", description: "x",
    });
    const { POST } = await import("@/app/api/reports/checkout/route");
    const res = await POST(req({ email: "rider@example.com", productSlug: "plateau" }));
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toMatch(/Stripe not configured/i);
  });
});
