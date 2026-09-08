import { afterEach, describe, expect, it, vi } from "vitest";
import { GET } from "./route";
import nextConfig from "../../../next.config";

afterEach(() => vi.unstubAllEnvs());
describe("preview-only responsive QA", () => {
  it.each(["production", "development", ""])("returns 404 in %s", async env => {
    vi.stubEnv("VERCEL_ENV", env);
    const response = GET(new Request("https://roadmancycling.com/preview-qa"));
    expect(response.status).toBe(404);
    expect(response.headers.get("X-Robots-Tag")).toContain("noindex");
    expect(await response.text()).not.toContain("iframe");
  });
  it("renders the actual page in a phone-width browsing context", async () => {
    vi.stubEnv("VERCEL_ENV", "preview");
    const response = GET(new Request("https://preview.example/preview-qa?path=/tools/training-load&width=390"));
    expect(response.status).toBe(200);
    expect(await response.text()).toContain('src="/tools/training-load" width="390" height="844"');
    expect(response.headers.get("Cache-Control")).toBe("no-store");
  });
  it.each(["?path=https://example.com", "?path=//example.com", "?path=/preview-qa", "?width=1200", "?path=%22%3E%3Cscript%3E"])("rejects unsafe selection %s", query => {
    vi.stubEnv("VERCEL_ENV", "preview");
    expect(GET(new Request(`https://preview.example/preview-qa${query}`)).status).toBe(400);
  });
  it.each([["production", "DENY"], ["preview", "SAMEORIGIN"]])("keeps %s frame protection", async (env, expected) => {
    vi.stubEnv("VERCEL_ENV", env);
    const rules = await nextConfig.headers!();
    const rule = rules.find(rule => rule.source === "/:path((?!embed(?:/|$)).*)");
    expect(rule?.headers.find(header => header.key === "X-Frame-Options")?.value).toBe(expected);
  });
});
