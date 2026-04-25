import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { db } from "@/lib/db";
import { tedDrafts } from "@/lib/db/schema";
import { requireAuth } from "@/lib/admin/auth";
import {
  PILLAR_INSTRUCTIONS,
  PILLAR_KEYS,
  TED_SYSTEM_PROMPT,
} from "@/lib/ted/prompts";

export const dynamic = "force-dynamic";
// Claude calls can take 10$€“20s; bump Vercel serverless timeout.
export const maxDuration = 60;

interface Body {
  pillar?: string;
  date?: string; // YYYY-MM-DD
}

function nextOccurrence(pillar: keyof typeof PILLAR_INSTRUCTIONS): string {
  // 0=Sun..6=Sat ordering matches Dublin-weekday util, kept local here to
  // avoid reaching into agents/ted.
  const map: Record<string, number> = {
    sunday: 0,
    monday: 1,
    tuesday: 2,
    wednesday: 3,
    thursday: 4,
    friday: 5,
    saturday: 6,
  };
  const target = map[pillar];
  const now = new Date();
  const todayUtcDow = now.getUTCDay();
  let offset = (target - todayUtcDow + 7) % 7;
  if (offset === 0) offset = 7; // always schedule for the NEXT occurrence, not today
  const d = new Date(now);
  d.setUTCDate(d.getUTCDate() + offset);
  return d.toISOString().slice(0, 10);
}

// Cheap banned-word sweep before we persist $€” same list as the agent's
// quickBannedWordScan. Flags drafts rather than blocking them.
function bannedWordHits(text: string): string[] {
  const needles = [
    "sacred cow",
    "unlock your potential",
    "transform your journey",
    "game-changer",
    "game changer",
    "life hack",
    "crush it",
    "smash it",
    "no excuses",
    "sparked something",
    "worth stealing",
    "if this resonated",
    "in today's fast-paced",
    "it's important to note",
    "it's worth noting",
    "delve",
    "leverage",
    "tapestry",
    "ecosystem",
    "paradigm",
  ];
  const lower = text.toLowerCase();
  return needles.filter((n) => lower.includes(n));
}

export async function POST(request: Request) {
  try {
    await requireAuth();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      {
        error:
          "ANTHROPIC_API_KEY not set on this Vercel project. Add it in Vercel $†’ Settings $†’ Environment Variables and redeploy.",
      },
      { status: 503 }
    );
  }

  const body = (await request.json().catch(() => ({}))) as Body;
  const pillar = (
    body.pillar && PILLAR_KEYS.includes(body.pillar as (typeof PILLAR_KEYS)[number])
      ? body.pillar
      : PILLAR_KEYS[new Date().getUTCDay()]
  ) as keyof typeof PILLAR_INSTRUCTIONS;
  const targetDate = body.date ?? nextOccurrence(pillar);

  const instructions = PILLAR_INSTRUCTIONS[pillar];
  const system = `${TED_SYSTEM_PROMPT}\n\n---\n\n${instructions.prompt}`;

  const userMessage = [
    `Write today's Ted prompt.`,
    `Date: ${targetDate}`,
    `Pillar: ${pillar}`,
    ``,
    `Return only the post body (including the "$€” Ted" sign-off on its own line). No preamble, no JSON, no commentary.`,
  ].join("\n");

  const client = new Anthropic();
  const response = await client.messages.create({
    model: "claude-haiku-4-5",
    max_tokens: 600,
    system,
    messages: [{ role: "user", content: userMessage }],
  });

  const text = response.content
    .filter((b) => b.type === "text")
    .map((b) => (b as Anthropic.TextBlock).text)
    .join("")
    .trim();

  const hits = bannedWordHits(text);
  const voiceFlagged = hits.length > 0 || text.startsWith("[SKIP");
  const voiceCheck = {
    pass: !voiceFlagged,
    redFlags: hits,
    notes: voiceFlagged
      ? "Cheap banned-word scan flagged this draft. Review carefully."
      : "Draft passed the cheap banned-word scan.",
    regenerationNotes: hits.length > 0 ? `Remove: ${hits.join(", ")}` : "",
    generatedInline: true,
  };

  try {
    const [row] = await db
      .insert(tedDrafts)
      .values({
        pillar,
        scheduledFor: targetDate,
        status: voiceFlagged ? "voice_flagged" : "draft",
        originalBody: text,
        voiceCheck: voiceCheck as unknown as Record<string, unknown>,
        generationAttempts: 1,
      })
      .returning({ id: tedDrafts.id });
    return NextResponse.json({
      ok: true,
      draftId: row.id,
      pillar,
      scheduledFor: targetDate,
      voiceFlagged,
      body: text,
      tokensIn: response.usage.input_tokens,
      tokensOut: response.usage.output_tokens,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const migrationsNeeded =
      msg.includes("42P01") || msg.toLowerCase().includes("does not exist");
    return NextResponse.json(
      {
        error: msg,
        migrationsNeeded,
        hint: migrationsNeeded
          ? "Run npm run db:migrate to create the ted_* tables first."
          : undefined,
      },
      { status: migrationsNeeded ? 503 : 500 }
    );
  }
}
