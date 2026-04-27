import { describe, it, expect, beforeEach } from "vitest";
import {
  checkUploadRateLimit,
  __resetUploadRateLimit,
} from "./upload-rate-limit";

function reqFromIp(ip: string | null): Request {
  const headers = new Headers();
  if (ip) headers.set("x-forwarded-for", ip);
  return new Request("http://localhost/api/courses/upload", {
    method: "POST",
    headers,
  });
}

describe("checkUploadRateLimit", () => {
  beforeEach(() => {
    __resetUploadRateLimit();
  });

  it("allows the first 5 uploads from a single IP", () => {
    for (let i = 0; i < 5; i++) {
      expect(checkUploadRateLimit(reqFromIp("1.2.3.4")).ok).toBe(true);
    }
  });

  it("blocks the 6th upload from a single IP with a Retry-After hint", () => {
    for (let i = 0; i < 5; i++) checkUploadRateLimit(reqFromIp("1.2.3.4"));
    const verdict = checkUploadRateLimit(reqFromIp("1.2.3.4"));
    expect(verdict.ok).toBe(false);
    if (!verdict.ok) {
      expect(verdict.retryAfterSeconds).toBeGreaterThan(0);
    }
  });

  it("buckets are independent across IPs", () => {
    for (let i = 0; i < 5; i++) checkUploadRateLimit(reqFromIp("1.2.3.4"));
    expect(checkUploadRateLimit(reqFromIp("5.6.7.8")).ok).toBe(true);
  });

  it("uses x-forwarded-for's first entry when chained", () => {
    for (let i = 0; i < 5; i++) {
      checkUploadRateLimit(reqFromIp("1.2.3.4, 10.0.0.1"));
    }
    const verdict = checkUploadRateLimit(reqFromIp("1.2.3.4, 10.0.0.1"));
    expect(verdict.ok).toBe(false);
  });

  it("does not silently bypass the limit for requests with no IP header", () => {
    for (let i = 0; i < 5; i++) checkUploadRateLimit(reqFromIp(null));
    const verdict = checkUploadRateLimit(reqFromIp(null));
    expect(verdict.ok).toBe(false);
  });
});
