import {
  loadSession,
  loadSessionByAnonKey,
  listSessionMessages,
} from "@/lib/ask/store";
import { readAnonSessionKey } from "@/lib/rider-profile/anon-session";
import { loadById as loadProfileById } from "@/lib/rider-profile/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const sessionId = url.searchParams.get("sessionId");

  try {
    const session = sessionId
      ? await loadSession(sessionId)
      : await (async () => {
          const anon = await readAnonSessionKey();
          return anon ? loadSessionByAnonKey(anon) : null;
        })();

    if (!session) {
      return Response.json({ session: null, messages: [], profile: null });
    }

    const [messages, profile] = await Promise.all([
      listSessionMessages(session.id, 100),
      session.riderProfileId ? loadProfileById(session.riderProfileId) : Promise.resolve(null),
    ]);

    return Response.json({
      session: {
        id: session.id,
        riderProfileId: session.riderProfileId,
        startedAt: session.startedAt,
        lastActivityAt: session.lastActivityAt,
        messageCount: session.messageCount,
      },
      messages: messages.map((m) => ({
        id: m.id,
        role: m.role,
        content: m.content,
        citations: m.citations,
        ctaRecommended: m.ctaRecommended,
        safetyFlags: m.safetyFlags,
        createdAt: m.createdAt,
      })),
      profile: profile
        ? {
            id: profile.id,
            firstName: profile.firstName,
            ageRange: profile.ageRange,
            discipline: profile.discipline,
            mainGoal: profile.mainGoal,
            coachingInterest: profile.coachingInterest,
          }
        : null,
    });
  } catch (err) {
    console.error("[ask/session] GET failed", err);
    return Response.json({ error: "Failed to load session." }, { status: 500 });
  }
}
