import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { buildMcpServer } from "@/lib/mcp/server";
import { checkRateLimit } from "@/lib/mcp/rate-limiter";

// Force Node.js runtime $— pgvector + @vercel/postgres require it
export const runtime = "nodejs";

// GET: return discovery hint
export async function GET(): Promise<Response> {
  return new Response(
    JSON.stringify({
      error:
        "Use POST for MCP requests. Discovery manifest at /.well-known/mcp.json",
    }),
    { status: 405, headers: { "content-type": "application/json" } }
  );
}

export async function POST(request: Request): Promise<Response> {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    request.headers.get("x-real-ip") ??
    "unknown";

  const { success } = await checkRateLimit(ip);
  if (!success) {
    return new Response(
      JSON.stringify({
        jsonrpc: "2.0",
        error: {
          code: -32000,
          message: "Rate limit exceeded. Max 60 requests/minute per IP.",
        },
      }),
      { status: 429, headers: { "content-type": "application/json" } }
    );
  }

  const transport = new WebStandardStreamableHTTPServerTransport({
    sessionIdGenerator: undefined, // stateless $— new session per request
  });

  const server = buildMcpServer(ip);
  await server.connect(transport);

  return transport.handleRequest(request);
}
