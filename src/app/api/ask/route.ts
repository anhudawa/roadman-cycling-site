import { z } from "zod";
import { createHash } from "node:crypto";
import { streamAnswer } from "@/lib/ask/orchestrator";
import { createSseStream, sseFormat } from "@/lib/ask/stream";
import { checkAskRateLimit } from "@/lib/ask/rate-limit";
import { getOrCreateAnonSessionKey } from "@/lib/rider-profile/anon-session";
import {
  createSession,
  loadSessionByAnonKey,
  loadSessionByRiderProfile,
  loadSession,
  touchSession,
} from "@/lib/ask/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BodySchema = z.object({
  query: z.string().min(2).max(2000),
  sessionId: z.string().uuid().optional(),
  riderProfileId: z.number().int().positive().optional(),
  seed: z
    .object({
      tool: z.string().min(1).max(32),
      slug: z.string().min(1).max(64),
    })
    .optional()
    .nullable(),
});

function ipFromRequest(req: Request): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"
  );
}

function hashIp(ip: string): string {
  return createHash("sha256").update(ip).digest("hex").slice(0, 16);
}

export async function GET(): Promise<Response> {
  return new Response(
    JSON.stringify({ error: "Use POST with { query, sessionId?, riderProfileId? }" }),
    { status: 405, headers: { "content-type": "application/json" } },
  );
}

export async function POST(request: Request): Promise<Response> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError(400, "invalid_json", "Body must be JSON.");
  }

  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(400, "bad_request", parsed.error.issues[0]?.message ?? "Invalid payload");
  }
  const { query, sessionId: incomingSessionId, riderProfileId, seed } = parsed.data;

  const ip = ipFromRequest(request);
  const ipHash = hashIp(ip);
  const userAgent = request.headers.get("user-agent")?.slice(0, 240) ?? null;

  let anonKey: string;
  try {
    anonKey = await getOrCreateAnonSessionKey();
  } catch {
    anonKey = ipHash;
  }

  // Rate limit (tier-aware) — 429 stays JSON; the client handles it specifically
  const rl = await checkAskRateLimit({
    tier: riderProfileId ? "profile" : "anon",
    sessionKey: riderProfileId ? `profile:${riderProfileId}` : anonKey,
    ipHash,
  });
  if (!rl.success) {
    return jsonError(
      429,
      "rate_limited",
      `Hold up — too many questions in a short window. Try again in ${rl.retryAfterSeconds ?? 60}s.`,
      { retryAfterSeconds: rl.retryAfterSeconds },
    );
  }

  // Open the SSE stream before any DB work so all failures below can emit
  // structured error events instead of falling back to a JSON 500 response.
  const { response, controller } = createSseStream();
  const ctrl = await controller;

  // Resolve or create the session — errors after this point go through SSE
  let session = incomingSessionId ? await loadSession(incomingSessionId).catch(() => null) : null;
  if (!session) {
    session = riderProfileId
      ? await loadSessionByRiderProfile(riderProfileId).catch(() => null)
      : await loadSessionByAnonKey(anonKey).catch(() => null);
  }
  if (!session) {
    try {
      session = await createSession({
        riderProfileId: riderProfileId ?? null,
        anonSessionKey: riderProfileId ? null : anonKey,
        ipHash,
        userAgent,
      });
    } catch (err) {
      console.error("[ask] createSession failed", err);
      const msg = isTableMissingError(err)
        ? "Ask Roadman is being set up — please check back in a few minutes."
        : "Couldn't start a chat session. Try again in a moment.";
      ctrl.enqueue({ type: "error", data: { message: msg } });
      ctrl.close();
      return response;
    }
  } else {
    await touchSession(session.id).catch(() => undefined);
  }

  // Send an immediate session-id event so the client can store it.
  ctrl.enqueue({ type: "meta", data: { sessionId: session.id, kind: "session_ack" } });

  // Run the orchestrator without awaiting — the Response is the ReadableStream.
  streamAnswer(
    {
      query,
      sessionId: session.id,
      riderProfileId: session.riderProfileId,
      ip: ipHash,
      seed: seed ?? null,
    },
    ctrl,
  ).catch((err) => {
    console.error("[ask] orchestrator threw", err);
    ctrl.enqueue({ type: "error", data: { message: "Unexpected error. Please try again." } });
    ctrl.close();
  });

  return response;
}

function isTableMissingError(err: unknown): boolean {
  if (!err || typeof err !== "object") return false;
  const e = err as Record<string, unknown>;
  return (
    e.code === "42P01" ||
    (typeof e.message === "string" && e.message.includes("relation") && e.message.includes("does not exist"))
  );
}

function jsonError(
  status: number,
  code: string,
  message: string,
  extra?: Record<string, unknown>,
): Response {
  return new Response(JSON.stringify({ error: { code, message, ...extra } }), {
    status,
    headers: { "content-type": "application/json" },
  });
}
// Silence unused import warning if sseFormat becomes dead here:
void sseFormat;
