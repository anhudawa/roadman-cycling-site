import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { isAuthenticated } from "@/lib/admin/auth";
import { db } from "@/lib/db";
import { repurposedContent, contentChatMessages } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";

const SYSTEM_PROMPT =
  "You are editing content for Roadman Cycling. Maintain Anthony Walsh's voice: direct, practical, warm, knowledgeable. Aimed at amateur cyclists who want to get faster. You will receive the current content and a request to amend it. Return the COMPLETE revised content $€” not a diff, the full replacement. Match the exact format of the input.";

const EPISODE_PAGE_SYSTEM_PROMPT = `You are editing episode page content for Roadman Cycling. You are writing as Anthony Walsh $€” not "in the style of", as him.

VOICE RULES:
- Write rough, not polished. First-draft energy. Anthony doesn't revise for elegance.
- No metaphors from outside cycling. No engines, chassis, foundations, architecture.
- No pithy one-liners. If it sounds like a motivational poster, delete it.
- No "writerly" transitions. Just say the next thing.
- Ground every claim. "Wakefield told me" not "research suggests."
- Short declarative sentences punctuated by longer explanations.
- Fragment cadence: "Same sessions, same errors, same effort."
- Direct address: "You know the moment when..."
- Maximum 2 em-dashes in the entire output.

HARD FAIL WORDS $€” never use:
"delve", "navigate", "leverage", "robust", "tapestry", "game-changer", "hack", "crush it", "unlock your potential", "journey", "no excuses", "sparked something", "deep dive", "unpack", "landscape", "ecosystem"

Return the COMPLETE revised content $€” not a diff, the full replacement.`;


export async function POST(request: Request) {
  try {
    const authed = await isAuthenticated();
    if (!authed) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { contentId, message } = (await request.json()) as {
      contentId: number;
      message: string;
    };

    if (!contentId || !message) {
      return NextResponse.json(
        { error: "contentId and message are required" },
        { status: 400 },
      );
    }

    // Load the content piece
    const [piece] = await db
      .select()
      .from(repurposedContent)
      .where(eq(repurposedContent.id, contentId));

    if (!piece) {
      return NextResponse.json(
        { error: "Content not found" },
        { status: 404 },
      );
    }

    // Select system prompt based on content type
    const systemPrompt = piece.contentType === "episode-page"
      ? EPISODE_PAGE_SYSTEM_PROMPT
      : SYSTEM_PROMPT;

    // Load chat history
    const history = await db
      .select()
      .from(contentChatMessages)
      .where(eq(contentChatMessages.contentId, contentId))
      .orderBy(asc(contentChatMessages.createdAt));

    // Save the user message
    await db.insert(contentChatMessages).values({
      contentId,
      role: "user",
      message,
    });

    // Build messages array for Claude
    const claudeMessages: Anthropic.MessageParam[] = [];

    // If there's no prior history, include the current content as context in the first user message
    if (history.length === 0) {
      claudeMessages.push({
        role: "user",
        content: `Here is the current content:\n\n---\n${piece.content}\n---\n\nPlease amend it as follows: ${message}`,
      });
    } else {
      // Add history, injecting content context into the first user message
      let firstUserDone = false;
      for (const msg of history) {
        if (!firstUserDone && msg.role === "user") {
          claudeMessages.push({
            role: "user",
            content: `Here is the current content:\n\n---\n${piece.content}\n---\n\nPlease amend it as follows: ${msg.message}`,
          });
          firstUserDone = true;
        } else {
          claudeMessages.push({
            role: msg.role as "user" | "assistant",
            content: msg.message,
          });
        }
      }
      // Add the new user message
      claudeMessages.push({ role: "user", content: message });
    }

    // Stream from Claude
    const client = new Anthropic();

    const stream = client.messages.stream({
      model: "claude-sonnet-4-6",
      max_tokens: 4096,
      system: systemPrompt,
      messages: claudeMessages,
    });

    let fullResponse = "";

    const readable = new ReadableStream({
      async start(controller) {
        try {
          const encoder = new TextEncoder();

          stream.on("text", (text) => {
            fullResponse += text;
            controller.enqueue(encoder.encode(text));
          });

          stream.on("end", async () => {
            try {
              // Only save if we actually got a response $€” prevents wiping content on API errors
              if (fullResponse.trim().length > 0) {
                // Save assistant response
                await db.insert(contentChatMessages).values({
                  contentId,
                  role: "assistant",
                  message: fullResponse,
                });

                // Update the content piece
                await db
                  .update(repurposedContent)
                  .set({
                    content: fullResponse,
                    version: piece.version + 1,
                    status: "amended",
                    updatedAt: new Date(),
                  })
                  .where(eq(repurposedContent.id, contentId));
              } else {
                console.warn("[Chat] Empty response from Claude $€” content not updated");
              }
            } catch (err) {
              console.error("[Chat] Error saving response:", err);
            }

            controller.close();
          });

          stream.on("error", (err) => {
            console.error("[Chat] Stream error:", err);
            controller.error(err);
          });
        } catch (err) {
          console.error("[Chat] Setup error:", err);
          controller.error(err);
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("[Chat] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
