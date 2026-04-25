import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { requireAuth } from "@/lib/admin/auth";

const client = new Anthropic();

const SYSTEM = `You are a fact-checker for cycling content. Your job is to review a piece of social media content and flag anything that is:

1. FACTUALLY WRONG — incorrect stats, wrong names, misattributed quotes, wrong study references, incorrect training zones or protocols
2. MISLEADING — technically true but presented in a way that could mislead a knowledgeable cyclist
3. UNVERIFIABLE — claims presented as fact that you cannot confirm (e.g. specific percentages, study results that don't match known research)
4. AI SLOP — generic phrases, filler sentences, or patterns that sound like AI wrote it rather than a human cycling expert

For each issue found, provide:
- The specific text that's problematic
- Why it's flagged (wrong/misleading/unverifiable/slop)
- A suggested fix if applicable

If the content is clean, say so. Be thorough but not pedantic — don't flag stylistic choices, only substantive issues.

Known facts you can verify against:
- Professor Stephen Seiler: exercise physiologist, polarised training research pioneer
- Dan Lorang: coached Tadej Pogacar (UAE Team Emirates) and Jonas Vingegaard (Visma-Lease a Bike)
- John Wakefield: coach at Bora-Hansgrohe
- Tim Kerrison: former head of performance at Team Sky/Ineos
- Lachlan Morton: rides for EF Education-EasyPost
- Ben Healy: Irish pro cyclist
- Michael Matthews: Australian pro cyclist (15+ years)
- Joe Friel: author of The Cyclist's Training Bible
- 2024 Habis study (PLOS ONE): low cadence intervals, VO2max improvement 8.7% vs 4.6%
- Zone 2 / polarised training: 80/20 intensity distribution is well-established
- Roadman Cycling Podcast: hosted by Anthony Walsh, 100M+ downloads

Return a JSON object:
- "status": "clean" | "issues_found"
- "issues": array of objects with "text", "type" (wrong/misleading/unverifiable/slop), "explanation", "suggestion"
- "summary": one sentence overall assessment

No markdown fences. Just the JSON.`;

export async function POST(request: Request) {
  try {
    await requireAuth();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { content, platform } = await request.json();
  if (!content) {
    return NextResponse.json({ error: "content required" }, { status: 400 });
  }

  try {
    const msg = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2048,
      system: SYSTEM,
      messages: [
        {
          role: "user",
          content: `Platform: ${platform || "unknown"}\n\nContent to fact-check:\n\n${content}`,
        },
      ],
    });

    const text =
      msg.content[0].type === "text" ? msg.content[0].text : "";
    const cleaned = text.replace(/^```json?\n?/m, "").replace(/\n?```$/m, "").trim();
    const result = JSON.parse(cleaned);
    return NextResponse.json({ result });
  } catch (err) {
    console.error("[Exploder] Fact check failed:", err);
    return NextResponse.json(
      { error: "Failed to fact-check content" },
      { status: 500 }
    );
  }
}
