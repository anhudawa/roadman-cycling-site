import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Integration tests for POST /api/tools/report.
 *
 * The route has two branches:
 *   a) Saveable tools ("ftp-zones", "fuelling") $€” route through completeToolResult
 *      which persists a tool_results row and emails a report.
 *   b) Legacy tools ("tyre-pressure", "race-weight", etc.) $€” generate an HTML
 *      report and email it directly via Resend.
 *
 * Coverage: tool routing (saveable vs legacy), validation, email/Beehiiv/CRM
 * resilience (non-fatal side-effects), and email failure handling.
 */

const mocks = vi.hoisted(() => ({
  subscribeToBeehiiv: vi.fn(),
  generateToolReport: vi.fn(),
  completeToolResult: vi.fn(),
  upsertContact: vi.fn(),
  addActivity: vi.fn(),
  normaliseEmail: vi.fn(),
  clampString: vi.fn(),
  getDefinition: vi.fn(),
  fuellingTags: vi.fn(),
  ftpZonesTags: vi.fn(),
  fetch: vi.fn(),
}));

vi.mock("@/lib/integrations/beehiiv", () => ({
  subscribeToBeehiiv: mocks.subscribeToBeehiiv,
}));
vi.mock("@/lib/tool-results/pipeline", () => ({
  completeToolResult: mocks.completeToolResult,
}));
vi.mock("@/lib/tools/reports", () => ({
  generateToolReport: mocks.generateToolReport,
}));
vi.mock("@/lib/crm/contacts", () => ({
  upsertContact: mocks.upsertContact,
  addActivity: mocks.addActivity,
}));
vi.mock("@/lib/validation", () => ({
  normaliseEmail: mocks.normaliseEmail,
  clampString: mocks.clampString,
  LIMITS: { name: 100 },
}));
vi.mock("@/lib/diagnostics/framework/registry", () => ({
  getDefinition: mocks.getDefinition,
}));
vi.mock("@/lib/tool-results/tags", () => ({
  fuellingTags: mocks.fuellingTags,
  ftpZonesTags: mocks.ftpZonesTags,
}));

// Shared stubs
const COMPLETE_RESULT_STUB = {
  emailSent: true,
  result: { slug: "xyz123", toolSlug: "ftp_zones", primaryResult: "moderate" },
};
const LEGACY_REPORT_STUB = {
  subject: "Your Tyre Pressure Report",
  html: "<html><body>Optimal: 95/80 PSI</body></html>",
  beehiivTag: "tool-tyre-pressure",
  beehiivFields: { tyre_width: 28 },
};
const DEF_STUB = {
  pickPrimary: vi.fn().mockReturnValue({ primary: "moderate" }),
  buildSummary: vi.fn().mockReturnValue("You're in moderate territory."),
};

function req(body: unknown): Request {
  return new Request("https://example.test/api/tools/report", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/tools/report", () => {
  beforeEach(() => {
    for (const fn of Object.values(mocks)) fn.mockReset();

    mocks.normaliseEmail.mockReturnValue("rider@example.com");
    mocks.clampString.mockImplementation((s: unknown) => (typeof s === "string" ? s : null));
    mocks.generateToolReport.mockReturnValue(LEGACY_REPORT_STUB);
    mocks.completeToolResult.mockResolvedValue(COMPLETE_RESULT_STUB);
    mocks.getDefinition.mockReturnValue(DEF_STUB);
    mocks.fuellingTags.mockReturnValue(["fuelling"]);
    mocks.ftpZonesTags.mockReturnValue(["ftp-zones"]);
    mocks.subscribeToBeehiiv.mockResolvedValue({ subscriberId: "sub_abc" });
    mocks.upsertContact.mockResolvedValue({ id: 42 });
    mocks.addActivity.mockResolvedValue(undefined);
    vi.stubGlobal("fetch", mocks.fetch);
    mocks.fetch.mockResolvedValue({ ok: true, text: async () => "" });
    process.env.RESEND_API_KEY = "re_test_key";
  });

  afterEach(() => {
    delete process.env.RESEND_API_KEY;
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  describe("saveable path (ftp-zones, fuelling)", () => {
    it("routes ftp-zones through completeToolResult and returns slug + permalink", async () => {
      const { POST } = await import("@/app/api/tools/report/route");
      const res = await POST(req({ tool: "ftp-zones", email: "rider@example.com", inputs: { ftp: 280, weight: 75 } }));
      expect(res.status).toBe(200);
      const data = (await res.json()) as Record<string, unknown>;
      expect(data.success).toBe(true);
      expect(data.emailSent).toBe(true);
      expect(data.slug).toBe("xyz123");
      expect(data.permalink).toContain("xyz123");
      expect(mocks.completeToolResult).toHaveBeenCalledOnce();
    });

    it("routes fuelling through completeToolResult", async () => {
      mocks.completeToolResult.mockResolvedValue({
        emailSent: true,
        result: { slug: "abc456", toolSlug: "fuelling", primaryResult: "high-carb" },
      });
      const { POST } = await import("@/app/api/tools/report/route");
      const res = await POST(req({ tool: "fuelling", email: "rider@example.com", inputs: { carbsPerHour: 60 } }));
      expect(res.status).toBe(200);
      expect(mocks.completeToolResult).toHaveBeenCalledOnce();
    });

    it("passes emailSent:false through when completeToolResult reports email failed", async () => {
      mocks.completeToolResult.mockResolvedValue({
        emailSent: false,
        result: { slug: "xyz123", toolSlug: "ftp_zones", primaryResult: "moderate" },
      });
      const { POST } = await import("@/app/api/tools/report/route");
      const res = await POST(req({ tool: "ftp-zones", email: "rider@example.com", inputs: { ftp: 280 } }));
      expect(res.status).toBe(200);
      const data = (await res.json()) as Record<string, unknown>;
      expect(data.emailSent).toBe(false);
    });
  });

  describe("legacy path (tyre-pressure, race-weight, energy-availability, shock-pressure)", () => {
    it("routes tyre-pressure through the legacy email path and returns emailSent:true", async () => {
      const { POST } = await import("@/app/api/tools/report/route");
      const res = await POST(req({ tool: "tyre-pressure", email: "rider@example.com", inputs: { weight: 75, tyreWidth: 28 } }));
      expect(res.status).toBe(200);
      const data = (await res.json()) as Record<string, unknown>;
      expect(data.success).toBe(true);
      expect(data.emailSent).toBe(true);
      expect(mocks.generateToolReport).toHaveBeenCalledOnce();
      expect(mocks.completeToolResult).not.toHaveBeenCalled();
    });

    it("returns 422 when generateToolReport returns null for a legacy tool", async () => {
      mocks.generateToolReport.mockReturnValue(null);
      const { POST } = await import("@/app/api/tools/report/route");
      const res = await POST(req({ tool: "race-weight", email: "rider@example.com", inputs: { weight: 80 } }));
      expect(res.status).toBe(422);
    });

    it("sends the report HTML to Resend with the correct from address", async () => {
      const { POST } = await import("@/app/api/tools/report/route");
      await POST(req({ tool: "tyre-pressure", email: "rider@example.com", inputs: { weight: 75 } }));
      const [, fetchInit] = mocks.fetch.mock.calls[0];
      const payload = JSON.parse((fetchInit as RequestInit).body as string);
      expect(payload.from).toMatch(/noreply@roadmancycling\.com/);
      expect(payload.subject).toBe(LEGACY_REPORT_STUB.subject);
    });

    it("tags Beehiiv with the tool-specific report tag", async () => {
      const { POST } = await import("@/app/api/tools/report/route");
      await POST(req({ tool: "tyre-pressure", email: "rider@example.com", inputs: { weight: 75 } }));
      const beehiivCall = mocks.subscribeToBeehiiv.mock.calls[0][0];
      expect(beehiivCall.tags).toContain(LEGACY_REPORT_STUB.beehiivTag);
      expect(beehiivCall.tags).toContain("tool-tyre-pressure");
    });

    it("still returns 200 when Beehiiv throws (non-fatal side-effect)", async () => {
      mocks.subscribeToBeehiiv.mockRejectedValue(new Error("beehiiv outage"));
      const { POST } = await import("@/app/api/tools/report/route");
      const res = await POST(req({ tool: "tyre-pressure", email: "rider@example.com", inputs: { weight: 75 } }));
      expect(res.status).toBe(200);
    });

    it("still returns 200 when CRM upsert throws (non-fatal side-effect)", async () => {
      mocks.upsertContact.mockRejectedValue(new Error("crm down"));
      const { POST } = await import("@/app/api/tools/report/route");
      const res = await POST(req({ tool: "tyre-pressure", email: "rider@example.com", inputs: { weight: 75 } }));
      expect(res.status).toBe(200);
    });

    it("returns 200 with emailSent:false when Resend responds with an error", async () => {
      mocks.fetch.mockResolvedValue({ ok: false, text: async () => "quota exceeded" });
      const { POST } = await import("@/app/api/tools/report/route");
      const res = await POST(req({ tool: "tyre-pressure", email: "rider@example.com", inputs: { weight: 75 } }));
      expect(res.status).toBe(200);
      const data = (await res.json()) as Record<string, unknown>;
      expect(data.success).toBe(true);
      expect(data.emailSent).toBe(false);
    });
  });

  describe("shared validation (both paths)", () => {
    it("rejects an unknown tool slug with 400", async () => {
      const { POST } = await import("@/app/api/tools/report/route");
      const res = await POST(req({ tool: "not-a-tool", email: "rider@example.com", inputs: {} }));
      expect(res.status).toBe(400);
      const data = (await res.json()) as Record<string, unknown>;
      expect(data.error).toMatch(/invalid tool/i);
    });

    it("rejects a missing tool field with 400", async () => {
      const { POST } = await import("@/app/api/tools/report/route");
      const res = await POST(req({ email: "rider@example.com", inputs: { ftp: 280 } }));
      expect(res.status).toBe(400);
    });

    it("rejects an invalid email with 400", async () => {
      mocks.normaliseEmail.mockReturnValue(null);
      const { POST } = await import("@/app/api/tools/report/route");
      const res = await POST(req({ tool: "tyre-pressure", email: "not-an-email", inputs: { weight: 75 } }));
      expect(res.status).toBe(400);
      const data = (await res.json()) as Record<string, unknown>;
      expect(data.error).toMatch(/email/i);
    });

    it("rejects missing inputs with 400", async () => {
      const { POST } = await import("@/app/api/tools/report/route");
      const res = await POST(req({ tool: "tyre-pressure", email: "rider@example.com" }));
      expect(res.status).toBe(400);
      const data = (await res.json()) as Record<string, unknown>;
      expect(data.error).toMatch(/inputs/i);
    });
  });
});
