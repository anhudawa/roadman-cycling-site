import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  checkRateLimit: vi.fn(),
  buildMcpServer: vi.fn(),
  serverConnect: vi.fn(),
  handleRequest: vi.fn(),
  TransportCtor: vi.fn(),
}));

vi.mock("@/lib/mcp/rate-limiter", () => ({
  checkRateLimit: mocks.checkRateLimit,
}));
vi.mock("@/lib/mcp/server", () => ({
  buildMcpServer: mocks.buildMcpServer,
}));
vi.mock(
  "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js",
  () => ({
    WebStandardStreamableHTTPServerTransport: function (
      this: { handleRequest: typeof mocks.handleRequest },
      opts: unknown,
    ) {
      mocks.TransportCtor(opts);
      this.handleRequest = mocks.handleRequest;
    },
  }),
);

describe("/api/mcp route", () => {
  beforeEach(() => {
    for (const fn of Object.values(mocks)) fn.mockReset();
    mocks.checkRateLimit.mockResolvedValue({ success: true });
    mocks.buildMcpServer.mockReturnValue({ connect: mocks.serverConnect });
    mocks.serverConnect.mockResolvedValue(undefined);
    mocks.handleRequest.mockResolvedValue(
      new Response(JSON.stringify({ jsonrpc: "2.0", result: {} }), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    );
  });

  it("GET returns 405 with discovery hint", async () => {
    const { GET } = await import("@/app/api/mcp/route");
    const res = await GET();
    expect(res.status).toBe(405);
    const body = await res.json();
    expect(body.error).toContain("/.well-known/mcp.json");
  });

  it("POST returns 429 when rate limit is exceeded", async () => {
    mocks.checkRateLimit.mockResolvedValue({ success: false });
    const { POST } = await import("@/app/api/mcp/route");
    const res = await POST(
      new Request("https://example.test/api/mcp", {
        method: "POST",
        body: JSON.stringify({ jsonrpc: "2.0", method: "tools/list", id: 1 }),
      }),
    );
    expect(res.status).toBe(429);
    const body = await res.json();
    expect(body.error.code).toBe(-32000);
    expect(body.error.message).toMatch(/Rate limit/i);
  });

  it("POST extracts client IP from x-forwarded-for", async () => {
    const { POST } = await import("@/app/api/mcp/route");
    await POST(
      new Request("https://example.test/api/mcp", {
        method: "POST",
        headers: { "x-forwarded-for": "203.0.113.7, 10.0.0.1" },
        body: JSON.stringify({ jsonrpc: "2.0", method: "tools/list", id: 1 }),
      }),
    );
    expect(mocks.checkRateLimit).toHaveBeenCalledWith("203.0.113.7");
    expect(mocks.buildMcpServer).toHaveBeenCalledWith("203.0.113.7");
  });

  it("POST falls back to x-real-ip when x-forwarded-for is missing", async () => {
    const { POST } = await import("@/app/api/mcp/route");
    await POST(
      new Request("https://example.test/api/mcp", {
        method: "POST",
        headers: { "x-real-ip": "198.51.100.5" },
        body: JSON.stringify({ jsonrpc: "2.0", method: "tools/list", id: 1 }),
      }),
    );
    expect(mocks.checkRateLimit).toHaveBeenCalledWith("198.51.100.5");
  });

  it("POST connects MCP server to transport and returns transport response", async () => {
    const { POST } = await import("@/app/api/mcp/route");
    const res = await POST(
      new Request("https://example.test/api/mcp", {
        method: "POST",
        body: JSON.stringify({ jsonrpc: "2.0", method: "tools/list", id: 1 }),
      }),
    );
    expect(res.status).toBe(200);
    expect(mocks.TransportCtor).toHaveBeenCalledWith(
      expect.objectContaining({ sessionIdGenerator: undefined }),
    );
    expect(mocks.buildMcpServer).toHaveBeenCalledOnce();
    expect(mocks.serverConnect).toHaveBeenCalledOnce();
    expect(mocks.handleRequest).toHaveBeenCalledOnce();
  });
});
