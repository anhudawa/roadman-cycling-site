import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getAllPosts: vi.fn(),
  getAllEpisodes: vi.fn(),
  tagUrlForAICrawler: vi.fn(),
}));

vi.mock("@/lib/blog", () => ({ getAllPosts: mocks.getAllPosts }));
vi.mock("@/lib/podcast", () => ({ getAllEpisodes: mocks.getAllEpisodes }));
vi.mock("@/lib/analytics/ai-referrer", () => ({
  tagUrlForAICrawler: mocks.tagUrlForAICrawler,
}));
vi.mock("@/lib/brand-facts", () => ({
  BRAND_STATS: {
    monthlyListenersLabel: "100k",
    countriesReachedLabel: "60",
    episodeCountLabel: "200",
    searchableEpisodePagesLabel: "180",
    newsletterSubscribersLabel: "30k",
  },
  FOUNDER: { name: "Anthony Walsh", location: "Dublin", foundedYear: 2018 },
  SITE_ORIGIN: "https://roadmancycling.com",
}));

const POST_FIXTURE = {
  slug: "test-post",
  title: "Test Post",
  seoDescription: "A test post about cycling.",
};

const EPISODE_FIXTURE = {
  slug: "ep-100",
  title: "Episode 100",
  seoDescription: "A great episode.",
  guest: null,
  guestCredential: null,
};

describe("GET /llms.txt", () => {
  beforeEach(() => {
    for (const fn of Object.values(mocks)) fn.mockReset();
    mocks.getAllPosts.mockReturnValue([POST_FIXTURE]);
    mocks.getAllEpisodes.mockReturnValue([EPISODE_FIXTURE]);
    mocks.tagUrlForAICrawler.mockImplementation((url: string) => `${url}?utm=test`);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns 200 with content-type text/plain", async () => {
    const { GET } = await import("./route");
    const res = await GET();
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toMatch(/text\/plain/);
  });

  it("body starts with # Roadman Cycling", async () => {
    const { GET } = await import("./route");
    const res = await GET();
    const text = await res.text();
    expect(text.startsWith("# Roadman Cycling")).toBe(true);
  });

  it("includes the blog post title in the body", async () => {
    const { GET } = await import("./route");
    const res = await GET();
    const text = await res.text();
    expect(text).toContain("Test Post");
  });

  it("includes the episode title in the body", async () => {
    const { GET } = await import("./route");
    const res = await GET();
    const text = await res.text();
    expect(text).toContain("Episode 100");
  });

  it("sets a cache-control header with s-maxage", async () => {
    const { GET } = await import("./route");
    const res = await GET();
    const cc = res.headers.get("cache-control");
    expect(cc).toMatch(/s-maxage|max-age/i);
  });

  it("includes MCP server section", async () => {
    const { GET } = await import("./route");
    const res = await GET();
    const text = await res.text();
    expect(text).toContain("MCP Server");
  });
});
