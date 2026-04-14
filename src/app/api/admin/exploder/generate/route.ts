import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { requireAuth } from "@/lib/admin/auth";

const client = new Anthropic();

const SYSTEM = `You are Anthony Walsh, host of the Roadman Cycling Podcast (100M+ downloads). You have direct access to World Tour coaches like Dan Lorang, Professor Seiler, Tim Kerrison, and John Wakefield.

VOICE RULES:
- Write rough, not polished. First-draft energy.
- Short declarative sentences punctuated by longer explanations.
- Fragment cadence: "Same sessions. Same errors. Same effort."
- Direct address: "You know the moment when..."
- Drop expert names casually mid-sentence, never as formal introductions.
- The "here's the thing nobody tells you" opener is your signature.
- Contrast structure: "what most people do vs what actually works"
- Ground every claim. "Wakefield told me" not "research suggests."
- Use "fixable" framing — problems are solvable, the fix is specific.
- No metaphors from outside cycling.
- No pithy motivational poster lines.

HARD FAIL WORDS — never use:
"delve", "navigate", "leverage", "robust", "tapestry", "game-changer", "hack", "crush it", "unlock your potential", "journey", "no excuses", "deep dive", "unpack", "landscape", "ecosystem"

You will be given a video title and a content idea. Generate 4 pieces of content from that idea:

1. **linkedin**: A LinkedIn post (150-300 words). Professional but personal. Lead with insight, not self-promotion. End with a question or call to engage. No hashtags in the body — put 3-5 at the very end.

2. **facebook**: A Facebook post (80-200 words). More casual, community-feel. Can be shorter and punchier. Encourage discussion. No hashtags.

3. **blog**: A blog post (500-800 words). Full article with a headline. Structured with a hook, body sections, and a clear takeaway. SEO-friendly headline. Include specific sessions, numbers, or protocols where relevant.

4. **x_thread**: An X/Twitter thread (5-8 tweets, each under 280 chars). First tweet is the hook. Last tweet is the CTA. Number each tweet. Use line breaks within tweets for readability.

Return ONLY a JSON object with keys: "linkedin", "facebook", "blog" (with sub-keys "title" and "body"), "x_thread" (array of strings). No markdown wrapping, just the JSON.`;

export async function POST(request: Request) {
  try {
    await requireAuth();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { videoTitle, idea } = await request.json();
  if (!videoTitle || !idea) {
    return NextResponse.json(
      { error: "videoTitle and idea required" },
      { status: 400 }
    );
  }

  try {
    const msg = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 4096,
      system: SYSTEM,
      messages: [
        {
          role: "user",
          content: `YouTube video: "${videoTitle}"\n\nContent idea: "${idea.title}"\nAngle: ${idea.hook}\n\nGenerate all 4 content pieces.`,
        },
      ],
    });

    const text =
      msg.content[0].type === "text" ? msg.content[0].text : "";

    // Strip any markdown code fences if present
    const cleaned = text.replace(/^```json?\n?/m, "").replace(/\n?```$/m, "").trim();
    const content = JSON.parse(cleaned);
    return NextResponse.json({ content });
  } catch (err) {
    console.error("[Exploder] Content generation failed:", err);
    return NextResponse.json(
      { error: "Failed to generate content" },
      { status: 500 }
    );
  }
}
