import { describe, expect, it } from "vitest";
import { verifyBasicAuth } from "./basic-auth";

function basic(username: string, password: string) {
  return `Basic ${Buffer.from(`${username}:${password}`).toString("base64")}`;
}

describe("verifyBasicAuth", () => {
  it("accepts the exact credentials", () => {
    expect(verifyBasicAuth(basic("google", "secret"), "google", "secret")).toBe(
      true,
    );
  });

  it("rejects missing, malformed, and mismatched credentials", () => {
    expect(verifyBasicAuth(null, "google", "secret")).toBe(false);
    expect(verifyBasicAuth("Bearer secret", "google", "secret")).toBe(false);
    expect(verifyBasicAuth("Basic !!!", "google", "secret")).toBe(false);
    expect(verifyBasicAuth(basic("google", "wrong"), "google", "secret")).toBe(
      false,
    );
  });
});
