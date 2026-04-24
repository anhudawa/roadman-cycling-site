import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getAllPosts: vi.fn(),
  getAllEpisodes: vi.fn(),
}));

vi.mock("@/lib/blog", () => ({ getAllPosts: mocks.getAllPosts }));
vi.mock("@/lib/podcast", () => ({ getAllEpisodes: mocks.getAllEpisodes }));

describe("GET /llms.txt", () => {
  beforeEach(() => {
    for (const fn of Object.values(mocks)) fn.mockReset();
    mocks.getAllPosts.mockReturnValue([
      {
        slug: "polarised-vs-sweet-spot-training",
        title: "Polarised vs Sweet Spot",
        seoDescription: "Compare polarised and sweet spot training.",
      },
      {
        slug: "some-other-blog",
        title: "Other",
        seoDescription: "Other description.",
      },
    ]);
    mocks.getAllEpisodes.mockReturnValue([
      {
        slug: "ep-1",
        title: "Episode 1",
        seoDescription: "Ep 1 desc",
        guest: "Stephen Seiler",
        guestCredential: "Polarised training",
      },
    ]);
  });

  it("returns 200 with text/plain content-type and cache headers", async () => {
    const { GET } = await import("@/app/llms.txt/route");
    const res = await GET();
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toMatch(/text\/plain/);
    expect(res.headers.get("cache-control")).toMatch(/public/);
  });

  it("includes top-level Roadman heading and brand markers", async () => {
    const { GET } = await import("@/app/llms.txt/route");
    const body = await (await GET()).text();
    expect(body).toMatch(/^# Roadman Cycling/);
    expect(body).toContain("Anthony Walsh");
    expect(body).toContain("/api/mcp");
    expect(body).toContain("/.well-known/mcp.json");
  });

  it("tags Roadman URLs with utm_source=llms-txt for AI-referrer tracking", async () => {
    const { GET } = await import("@/app/llms.txt/route");
    const body = await (await GET()).text();
    expect(body).toContain("utm_source=llms-txt");
    expect(body).toContain("utm_medium=ai-crawler");
  });

  it("does NOT tag machine endpoints (sitemap, RSS, llms-full)", async () => {
    const { GET } = await import("@/app/llms.txt/route");
    const body = await (await GET()).text();
    expect(body).toMatch(/sitemap\.xml\)/);
    expect(body).not.toMatch(/sitemap\.xml\?utm/);
    expect(body).toMatch(/feed\/podcast\)/);
    expect(body).not.toMatch(/feed\/podcast\?utm/);
  });

  it("includes pinned high-value posts even if not in 'recent' window", async () => {
    const { GET } = await import("@/app/llms.txt/route");
    const body = await (await GET()).text();
    expect(body).toContain("polarised-vs-sweet-spot-training");
  });

  it("emits the MCP tools manifest pointer block", async () => {
    const { GET } = await import("@/app/llms.txt/route");
    const body = await (await GET()).text();
    expect(body).toContain("get_community_stats");
    expect(body).toContain("search_episodes");
    expect(body).toContain("60 requests/minute per IP");
  });
});
