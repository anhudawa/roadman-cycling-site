import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { requireAuth } from "@/lib/admin/auth";

const client = new Anthropic();

const SYSTEM = `You are a content strategist for Roadman Cycling, a cycling media brand with 100M+ podcast downloads. The host is Anthony Walsh — direct, warm, knowledgeable, with insider access to World Tour coaches and sports scientists.

Your job: given a YouTube video title, generate 5 content ideas that can be "exploded" from that single video into standalone pieces across LinkedIn, Facebook, X/Twitter, and blog.

Each idea should:
- Be a DIFFERENT angle, hook, or sub-topic from the video — not just rephrasing the title
- Work as a standalone piece (someone who hasn't seen the video should still get value)
- Be specific and actionable, not vague
- Appeal to serious amateur cyclists aged 35-55

Return ONLY a JSON array of 5 objects with "title" (short, punchy) and "hook" (1-2 sentence description of the angle). No markdown, no explanation, just the JSON array.`;

export async function POST(request: Request) {
  try {
    await requireAuth();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { videoTitle } = await request.json();
  if (!videoTitle) {
    return NextResponse.json({ error: "videoTitle required" }, { status: 400 });
  }

  try {
    const msg = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      system: SYSTEM,
      messages: [
        {
          role: "user",
          content: `YouTube video title: "${videoTitle}"\n\nGenerate 5 content ideas.`,
        },
      ],
    });

    const raw =
      msg.content[0].type === "text" ? msg.content[0].text : "";
    const cleaned = raw.replace(/^```json?\n?/m, "").replace(/\n?```$/m, "").trim();
    const ideas = JSON.parse(cleaned);
    return NextResponse.json({ ideas });
  } catch (err) {
    console.error("[Exploder] Ideas generation failed:", err);
    return NextResponse.json(
      { error: "Failed to generate ideas" },
      { status: 500 }
    );
  }
}
