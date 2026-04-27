import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { authSecret } from "./secret";

describe("authSecret", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    delete process.env.AUTH_SECRET;
    delete process.env.ADMIN_PASSWORD;
    process.env.NODE_ENV = "test";
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it("returns AUTH_SECRET when set", () => {
    process.env.AUTH_SECRET = "real-secret";
    expect(authSecret()).toBe("real-secret");
  });

  it("falls back to ADMIN_PASSWORD when AUTH_SECRET is missing", () => {
    process.env.ADMIN_PASSWORD = "admin-pw";
    expect(authSecret()).toBe("admin-pw");
  });

  it("returns the dev fallback in non-production with no secrets set", () => {
    process.env.NODE_ENV = "development";
    expect(authSecret()).toBe("fallback-dev-secret");
  });

  it("throws in production when no secret is configured", () => {
    process.env.NODE_ENV = "production";
    expect(() => authSecret()).toThrow(/AUTH_SECRET.*production/);
  });

  it("does NOT throw in production when AUTH_SECRET is set", () => {
    process.env.NODE_ENV = "production";
    process.env.AUTH_SECRET = "real-prod-secret";
    expect(authSecret()).toBe("real-prod-secret");
  });
});
