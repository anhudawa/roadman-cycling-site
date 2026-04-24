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
  const anonKey = await getOrCreateAnonSessionKey();
  const userAgent = request.headers.get("user-agent")?.slice(0, 240) ?? null;

  // Rate limit (tier-aware)
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

  // Resolve or create the session
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
      return jsonError(500, "session_failed", "Couldn't start a chat session. Try again in a moment.");
    }
  } else {
    await touchSession(session.id).catch(() => undefined);
  }

  const { response, controller } = createSseStream();
  const ctrl = await controller;

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
