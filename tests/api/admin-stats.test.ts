import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Integration tests for GET /api/admin/stats.
 *
 * Auth-protected route that fans out to different stat queries based on
 * a `view` query parameter. Covers the auth gate, view routing, and the
 * 500 fallback when a downstream DB call throws.
 */

const mocks = vi.hoisted(() => ({
  isAuthenticated: vi.fn(),
  getDashboardStats: vi.fn(),
  getPageStats: vi.fn(),
  getRecentLeads: vi.fn(),
  getTrafficStats: vi.fn(),
  getLeadTotals: vi.fn(),
}));

vi.mock("@/lib/admin/auth", () => ({ isAuthenticated: mocks.isAuthenticated }));
vi.mock("@/lib/admin/events-store", () => ({
  getDashboardStats: mocks.getDashboardStats,
  getPageStats: mocks.getPageStats,
  getRecentLeads: mocks.getRecentLeads,
  getTrafficStats: mocks.getTrafficStats,
  getLeadTotals: mocks.getLeadTotals,
}));

function reqWithView(view?: string): Request {
  const url = view
    ? `https://example.test/api/admin/stats?view=${view}`
    : "https://example.test/api/admin/stats";
  return new Request(url);
}

describe("GET /api/admin/stats", () => {
  beforeEach(() => {
    for (const fn of Object.values(mocks)) fn.mockReset();
    mocks.isAuthenticated.mockResolvedValue(true);
    mocks.getDashboardStats.mockResolvedValue({ today: { events: 5 } });
    mocks.getPageStats.mockResolvedValue([{ page: "/ask", count: 3 }]);
    mocks.getRecentLeads.mockResolvedValue([{ email: "a@b.co" }]);
    mocks.getLeadTotals.mockResolvedValue({ total: 12 });
    mocks.getTrafficStats.mockResolvedValue({ visitors: 100 });
  });

  it("returns 401 when not authenticated", async () => {
    mocks.isAuthenticated.mockResolvedValue(false);
    const { GET } = await import("@/app/api/admin/stats/route");
    const res = await GET(reqWithView());
    expect(res.status).toBe(401);
  });

  it("defaults to dashboard view", async () => {
    const { GET } = await import("@/app/api/admin/stats/route");
    const res = await GET(reqWithView());
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({ today: { events: 5 } });
    expect(mocks.getDashboardStats).toHaveBeenCalledOnce();
  });

  it("dispatches view=emails to getPageStats", async () => {
    const { GET } = await import("@/app/api/admin/stats/route");
    const res = await GET(reqWithView("emails"));
    expect(res.status).toBe(200);
    expect(mocks.getPageStats).toHaveBeenCalledOnce();
  });

  it("dispatches view=leads to getRecentLeads + getLeadTotals", async () => {
    const { GET } = await import("@/app/api/admin/stats/route");
    const res = await GET(reqWithView("leads"));
    const body = await res.json();
    expect(body.leads).toHaveLength(1);
    expect(body.totals.total).toBe(12);
    expect(mocks.getRecentLeads).toHaveBeenCalledOnce();
    expect(mocks.getLeadTotals).toHaveBeenCalledOnce();
  });

  it("dispatches view=traffic to getTrafficStats", async () => {
    const { GET } = await import("@/app/api/admin/stats/route");
    const res = await GET(reqWithView("traffic"));
    const body = await res.json();
    expect(body.visitors).toBe(100);
  });

  it("returns 400 on unknown view", async () => {
    const { GET } = await import("@/app/api/admin/stats/route");
    const res = await GET(reqWithView("not-a-real-view"));
    expect(res.status).toBe(400);
  });

  it("returns 500 when an underlying store throws", async () => {
    mocks.getDashboardStats.mockRejectedValue(new Error("db down"));
    const { GET } = await import("@/app/api/admin/stats/route");
    const res = await GET(reqWithView("dashboard"));
    expect(res.status).toBe(500);
  });
});
