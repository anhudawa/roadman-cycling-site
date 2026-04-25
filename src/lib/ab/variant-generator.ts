import Anthropic from "@anthropic-ai/sdk";
import type { ABVariant } from "./types";

const client = new Anthropic();

/**
 * Generate A/B test variant suggestions using Claude Haiku.
 *
 * @param page - The page being tested (e.g. "/", "/skool")
 * @param currentContent - The current content of the element
 * @param elementType - The type of element ("headline" | "cta_button" | "form_copy" | "hero_image" | "layout")
 * @returns Array of suggested variants
 */
export async function generateVariants(
  page: string,
  currentContent: string,
  elementType: string
): Promise<ABVariant[]> {
  try {
    const response = await client.messages.create({
      model: "claude-haiku-4-20250414",
      max_tokens: 1024,
      system:
        "You are a CRO expert for a cycling media business called Roadman Cycling. " +
        "They run a podcast, newsletter, and Skool community for road cycling enthusiasts. " +
        "Generate 2-3 alternative variations for the given page element that could improve conversion rates. " +
        "Each variation should be meaningfully different from the original while staying on-brand. " +
        "The brand voice is bold, authentic, and community-driven $€” not corporate.\n\n" +
        "Respond with a JSON array of objects, each with:\n" +
        '- "label": a short descriptive name for the variant (e.g. "Urgency CTA", "Social Proof Headline")\n' +
        '- "content": the actual text/content for the variant\n\n' +
        "Respond ONLY with the JSON array, no other text.",
      messages: [
        {
          role: "user",
          content:
            `Page: ${page}\n` +
            `Element type: ${elementType}\n` +
            `Current content: ${currentContent}\n\n` +
            `Generate 2-3 alternative variations that could improve conversions.`,
        },
      ],
    });

    // Extract text from response
    const textBlock = response.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      console.error("[VariantGenerator] No text in response");
      return [];
    }

    const parsed: { label: string; content: string }[] = JSON.parse(
      textBlock.text
    );

    // Add unique IDs
    return parsed.map((v, i) => ({
      id: `var_${Date.now()}_${i}`,
      label: v.label,
      content: v.content,
    }));
  } catch (err) {
    console.error("[VariantGenerator] Error generating variants:", err);
    return [];
  }
}
