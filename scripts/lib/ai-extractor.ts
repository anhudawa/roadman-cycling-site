import Anthropic from "@anthropic-ai/sdk";

interface ExtractionResult {
  intro: string;
  keyTakeaways: string[];
  quotes: string[];
}

let client: Anthropic | null = null;

function getClient(): Anthropic {
  if (!client) {
    client = new Anthropic();
  }
  return client;
}

/**
 * Extract key takeaways and quotes from a transcript using Claude
 */
export async function extractFromTranscript(
  transcript: string,
  title: string,
  guest?: string
): Promise<ExtractionResult | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return null;
  }

  const guestContext = guest ? `The guest is ${guest}.` : "This is a solo or co-hosted episode.";

  try {
    const response = await getClient().messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: `You are helping create show notes for a cycling podcast episode.

Episode title: "${title}"
${guestContext}

Here is the transcript (may be truncated):

${transcript}

Please extract:

1. A 2-3 sentence intro paragraph summarising what this episode covers. Write it in a direct, warm, knowledgeable tone $€” like a mate explaining what you'll learn. Don't use phrases like "in this episode" or "join us as".

2. 4-6 key takeaways as concise bullet points. Each should be a specific, actionable insight $€” not vague summaries.

3. 2-3 standout quotes from the episode (verbatim or near-verbatim from the transcript). Pick quotes that are surprising, insightful, or memorable. Include who said them if clear.

Respond in exactly this JSON format (no markdown, no code blocks):
{"intro":"...","keyTakeaways":["...","..."],"quotes":["...","..."]}`,
        },
      ],
    });

    const text =
      response.content[0].type === "text" ? response.content[0].text : "";

    // Parse JSON response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.warn(`  $š  Could not parse AI response for: ${title}`);
      return null;
    }

    const parsed = JSON.parse(jsonMatch[0]) as ExtractionResult;

    // Validate structure
    if (!parsed.intro || !Array.isArray(parsed.keyTakeaways) || !Array.isArray(parsed.quotes)) {
      console.warn(`  $š  Invalid AI response structure for: ${title}`);
      return null;
    }

    return parsed;
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.warn(`  $š  AI extraction failed for "${title}": ${msg}`);
    return null;
  }
}

/**
 * Small delay between AI calls to respect rate limits
 */
export function aiDelay(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 500));
}
