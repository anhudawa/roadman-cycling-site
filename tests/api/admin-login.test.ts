import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Integration tests for POST /api/admin/login.
 *
 * Covers both email+password and legacy password-only auth paths,
 * plus cookie setting, credential rejection, and input validation.
 */

const mocks = vi.hoisted(() => ({
  verifyAndCreateToken: vi.fn(),
  verifyAndCreateTokenForUser: vi.fn(),
}));

vi.mock("@/lib/admin/auth", () => ({
  verifyAndCreateToken: mocks.verifyAndCreateToken,
  verifyAndCreateTokenForUser: mocks.verifyAndCreateTokenForUser,
  COOKIE_NAME: "roadman_admin_session",
  SESSION_DURATION: 604800,
}));

function req(body: unknown): Request {
  return new Request("https://example.test/api/admin/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const STUB_USER = {
  id: 1,
  slug: "ted",
  name: "Ted Crilly",
  email: "ted@roadmancycling.com",
  role: "admin",
};

describe("POST /api/admin/login", () => {
  beforeEach(() => {
    for (const fn of Object.values(mocks)) fn.mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("email + password (per-user auth)", () => {
    it("returns 200 with success:true and user data on valid credentials", async () => {
      mocks.verifyAndCreateTokenForUser.mockResolvedValue({
        token: "tok_valid",
        user: STUB_USER,
      });
      const { POST } = await import("@/app/api/admin/login/route");
      const res = await POST(req({ email: "ted@roadmancycling.com", password: "correct" }));
      expect(res.status).toBe(200);
      const data = (await res.json()) as Record<string, unknown>;
      expect(data.success).toBe(true);
      expect((data.user as typeof STUB_USER).slug).toBe("ted");
    });

    it("sets an HttpOnly session cookie on successful login", async () => {
      mocks.verifyAndCreateTokenForUser.mockResolvedValue({
        token: "tok_valid",
        user: STUB_USER,
      });
      const { POST } = await import("@/app/api/admin/login/route");
      const res = await POST(req({ email: "ted@roadmancycling.com", password: "correct" }));
      const setCookie = res.headers.get("set-cookie") ?? "";
      expect(setCookie).toMatch(/roadman_admin_session/);
      expect(setCookie).toMatch(/HttpOnly/i);
    });

    it("returns 401 on invalid email+password", async () => {
      mocks.verifyAndCreateTokenForUser.mockResolvedValue(null);
      const { POST } = await import("@/app/api/admin/login/route");
      const res = await POST(req({ email: "bad@example.com", password: "wrong" }));
      expect(res.status).toBe(401);
      const data = (await res.json()) as Record<string, unknown>;
      expect(data.error).toMatch(/invalid credentials/i);
    });
  });

  describe("legacy password-only auth", () => {
    it("returns 200 when the legacy password is correct", async () => {
      mocks.verifyAndCreateToken.mockResolvedValue("tok_legacy");
      const { POST } = await import("@/app/api/admin/login/route");
      const res = await POST(req({ password: "legacy_secret" }));
      expect(res.status).toBe(200);
      const data = (await res.json()) as Record<string, unknown>;
      expect(data.success).toBe(true);
    });

    it("returns 401 when the legacy password is wrong", async () => {
      mocks.verifyAndCreateToken.mockResolvedValue(null);
      const { POST } = await import("@/app/api/admin/login/route");
      const res = await POST(req({ password: "wrong" }));
      expect(res.status).toBe(401);
    });
  });

  describe("input validation", () => {
    it("returns 400 when password is missing", async () => {
      const { POST } = await import("@/app/api/admin/login/route");
      const res = await POST(req({ email: "ted@roadmancycling.com" }));
      expect(res.status).toBe(400);
      const data = (await res.json()) as Record<string, unknown>;
      expect(data.error).toMatch(/password/i);
    });

    it("does not call any auth function when password is absent", async () => {
      const { POST } = await import("@/app/api/admin/login/route");
      await POST(req({}));
      expect(mocks.verifyAndCreateToken).not.toHaveBeenCalled();
      expect(mocks.verifyAndCreateTokenForUser).not.toHaveBeenCalled();
    });
  });
});
