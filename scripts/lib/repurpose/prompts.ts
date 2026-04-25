import { type EpisodeInput } from "./types.js";

interface PromptPair {
  system: string;
  user: string;
}

interface RelatedEpisode {
  slug: string;
  title: string;
  episodeNumber: number;
}

const VOICE_SYSTEM = `You are a content writer for Roadman Cycling, a cycling media brand. Write in Anthony Walsh's voice: direct, practical, no fluff. Aimed at amateur cyclists who want to get faster. Not academic, not corporate. Warm but knowledgeable $— like advice from a cycling mate who happens to be an expert. Never use phrases like "in this episode" or "dive into" or "join us as". Never use corporate buzzwords. Be specific and actionable.`;

export function blogPrompt(
  episode: EpisodeInput,
  relatedEpisodes: RelatedEpisode[]
): PromptPair {
  const relatedLinks = relatedEpisodes
    .map(
      (ep) =>
        `- [Episode ${ep.episodeNumber}: ${ep.title}](/podcast/${ep.slug})`
    )
    .join("\n");

  return {
    system: VOICE_SYSTEM,
    user: `Write a 1500-2000 word SEO blog post based on this podcast episode transcript.

Episode: "${episode.title}" (Episode ${episode.episodeNumber})
${episode.guest ? `Guest: ${episode.guest}${episode.guestCredential ? ` $— ${episode.guestCredential}` : ""}` : "Solo/co-hosted episode"}
Pillar: ${episode.pillar}
Keywords to target naturally: ${episode.keywords.join(", ")}

Related episodes you can link to internally:
${relatedLinks || "None available"}

TRANSCRIPT:
${episode.transcript}

FORMAT REQUIREMENTS:
- Compelling opening paragraph that hooks the reader (no "in this episode" framing)
- 4-6 sections with H2 headers (## Header). Headers should be SEO-friendly and specific
- Each section should have actionable insights, not vague summaries
- Include a "Key Takeaways" section near the end with 4-6 bullet points
- End with a short conclusion and CTA to listen to the full episode
- Weave in internal links to the related episodes where contextually relevant, using the exact markdown format provided
- Write for Google $— use target keywords naturally in headers and body text

Also generate these metadata fields and include them at the very top of your response as a JSON block:
\`\`\`json
{
  "seoTitle": "An SEO-optimized title (different from episode title, <60 chars)",
  "seoDescription": "Meta description (<155 chars)",
  "excerpt": "2-3 sentence summary for listing cards",
  "additionalKeywords": ["any", "new", "keywords", "you", "identify"]
}
\`\`\`

Then write the blog post body below the JSON block.`,
  };
}

export function socialPrompt(episode: EpisodeInput): PromptPair {
  return {
    system: VOICE_SYSTEM,
    user: `Generate social media content for all 4 platforms based on this podcast episode.

Episode: "${episode.title}" (Episode ${episode.episodeNumber})
${episode.guest ? `Guest: ${episode.guest}${episode.guestCredential ? ` $— ${episode.guestCredential}` : ""}` : "Solo/co-hosted episode"}
Episode URL: /podcast/${episode.slug}

TRANSCRIPT:
${episode.transcript}

Respond with ONLY a JSON object in this exact format (no markdown, no code blocks):
{
  "twitter": {
    "tweets": [
      {"text": "Hook tweet $— bold claim or surprising insight from the episode", "index": 1},
      {"text": "Key insight #1...", "index": 2},
      {"text": "Key insight #2...", "index": 3},
      {"text": "Key insight #3...", "index": 4},
      {"text": "Key insight #4...", "index": 5},
      {"text": "Actionable takeaway...", "index": 6},
      {"text": "Full episode: https://roadmancycling.com/podcast/${episode.slug} 🎙️", "index": 7}
    ]
  },
  "instagram": {
    "caption": "Multi-line caption with\\n\\nline breaks for readability. Include a hook, 3-4 key insights, and a CTA to listen. Episode ${episode.episodeNumber} out now.",
    "hashtags": ["#cycling", "#roadmancycling", "#cyclingpodcast", "...15-20 relevant hashtags"]
  },
  "linkedin": {
    "post": "Professional-angle post, 3-4 paragraphs.\\n\\nMention the guest by name and credential if applicable.\\n\\nNo hashtags. End with a link to the episode."
  },
  "facebook": {
    "post": "500-800 word storytelling post in first person (Anthony's voice). Pick the single most compelling insight from the episode and build a personal, conversational post around it. Should feel like Anthony writing to his cycling community, not a brand posting content. Include personal anecdotes or reflections where natural.",
    "angle": "Brief 1-sentence description of the angle chosen"
  }
}

RULES:
- Each tweet must be under 280 characters
- Instagram caption should use line breaks (\\n) for readability
- LinkedIn should be professional but accessible $— not corporate
- Facebook should be personal, conversational, storytelling. First person. 500-800 words.
- All content should be specific to THIS episode $— no generic cycling advice`,
  };
}

export function quoteExtractionPrompt(
  transcript: string,
  title: string,
  guest?: string
): PromptPair {
  return {
    system:
      "You extract quotable moments from podcast transcripts. Return only JSON.",
    user: `Extract 3-5 of the most quotable, shareable moments from this podcast transcript.

Episode: "${title}"
${guest ? `Guest: ${guest}` : "Solo/co-hosted episode"}

TRANSCRIPT:
${transcript}

For each quote, pick moments that are:
- Surprising, counterintuitive, or memorable
- Specific and actionable (not vague platitudes)
- Self-contained (make sense without context)
- Short enough to fit on a quote card (1-3 sentences max)

Respond with ONLY a JSON array (no markdown, no code blocks):
[
  {"text": "The exact or near-exact quote", "speaker": "Speaker Name", "context": "Brief context (e.g., 'on training in zone 2')"},
  ...
]`,
  };
}
