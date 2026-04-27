import { describe, it, expect } from "vitest";
import crypto from "crypto";
import {
  verifyPassword,
  hashPasswordForStorage,
  generateRandomPassword,
} from "./password";

function legacySha256(pw: string): string {
  return crypto.createHash("sha256").update(pw).digest("hex");
}

describe("verifyPassword", () => {
  it("rejects empty inputs", async () => {
    expect((await verifyPassword("", "x")).ok).toBe(false);
    expect((await verifyPassword("x", "")).ok).toBe(false);
  });

  it("verifies a freshly bcrypt-hashed password", async () => {
    const stored = await hashPasswordForStorage("hunter2");
    expect(stored).toMatch(/^\$2[aby]\$/);
    const verdict = await verifyPassword("hunter2", stored);
    expect(verdict.ok).toBe(true);
    expect(verdict.needsRehash).toBe(false);
  });

  it("rejects wrong passwords against a bcrypt hash", async () => {
    const stored = await hashPasswordForStorage("hunter2");
    const verdict = await verifyPassword("wrong", stored);
    expect(verdict.ok).toBe(false);
    expect(verdict.needsRehash).toBe(false);
  });

  it("verifies legacy SHA-256 hashes and flags them for rehash", async () => {
    const stored = legacySha256("legacy-pass");
    const verdict = await verifyPassword("legacy-pass", stored);
    expect(verdict.ok).toBe(true);
    expect(verdict.needsRehash).toBe(true);
  });

  it("rejects wrong passwords against a legacy SHA-256 hash", async () => {
    const stored = legacySha256("legacy-pass");
    const verdict = await verifyPassword("wrong", stored);
    expect(verdict.ok).toBe(false);
    expect(verdict.needsRehash).toBe(false);
  });

  it("rejects garbage stored hashes", async () => {
    const verdict = await verifyPassword("anything", "not-a-real-hash");
    expect(verdict.ok).toBe(false);
    expect(verdict.needsRehash).toBe(false);
  });
});

describe("generateRandomPassword", () => {
  it("returns a string of the requested length", () => {
    expect(generateRandomPassword(20)).toHaveLength(20);
    expect(generateRandomPassword(8)).toHaveLength(8);
  });
});
