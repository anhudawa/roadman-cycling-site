import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getProductBySlug: vi.fn(),
}));

vi.mock("@/lib/paid-reports/products", () => ({
  getProductBySlug: mocks.getProductBySlug,
}));

describe("GET /api/paid-reports/availability", () => {
  const originalStripeSecret = process.env.STRIPE_SECRET_KEY;
  const originalResendKey = process.env.RESEND_API_KEY;

  beforeEach(() => {
    mocks.getProductBySlug.mockReset();
    delete process.env.STRIPE_SECRET_KEY;
    delete process.env.RESEND_API_KEY;
  });

  afterEach(() => {
    if (originalStripeSecret === undefined) delete process.env.STRIPE_SECRET_KEY;
    else process.env.STRIPE_SECRET_KEY = originalStripeSecret;

    if (originalResendKey === undefined) delete process.env.RESEND_API_KEY;
    else process.env.RESEND_API_KEY = originalResendKey;
  });

  it("reports checkout unavailable without Stripe while keeping product price visible", async () => {
    mocks.getProductBySlug.mockResolvedValue({
      slug: "report_race",
      active: true,
      priceCents: 2900,
      currency: "usd",
    });

    const { GET } = await import("@/app/api/paid-reports/availability/route");
    const res = await GET();
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toMatchObject({
      stripeReady: false,
      raceReportReady: true,
      raceReportPriceCents: 2900,
      raceReportCurrency: "usd",
      resendReady: false,
    });
    expect(res.headers.get("Cache-Control")).toContain("max-age=60");
  });

  it("reports checkout ready only when Stripe and an active Race Report product are present", async () => {
    process.env.STRIPE_SECRET_KEY = "sk_test_123";
    process.env.RESEND_API_KEY = "re_123";
    mocks.getProductBySlug.mockResolvedValue({
      slug: "report_race",
      active: true,
      priceCents: 3900,
      currency: "eur",
    });

    const { GET } = await import("@/app/api/paid-reports/availability/route");
    const res = await GET();
    const body = await res.json();

    expect(body).toMatchObject({
      stripeReady: true,
      raceReportReady: true,
      raceReportPriceCents: 3900,
      raceReportCurrency: "eur",
      resendReady: true,
    });
  });
});
