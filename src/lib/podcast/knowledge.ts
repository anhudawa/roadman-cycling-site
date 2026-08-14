import type { EpisodeMeta } from "@/lib/podcast";

export const PODCAST_KNOWLEDGE_FIELDS = [
  "transcript",
  "answerCapsule",
  "keyTakeaways",
  "topicTags",
  "chapters",
  "claims",
  "citations",
  "keyQuotes",
  "relatedPosts",
] as const;

export type PodcastKnowledgeField = (typeof PODCAST_KNOWLEDGE_FIELDS)[number];
export type PodcastKnowledgeStatus =
  | "citation-ready"
  | "transcript-indexed"
  | "show-notes-only";

export function evaluatePodcastKnowledge(
  episode: EpisodeMeta,
  transcriptAvailable: boolean,
) {
  const fields: Record<PodcastKnowledgeField, boolean> = {
    transcript: transcriptAvailable,
    answerCapsule: Boolean(episode.answerCapsule?.trim()),
    keyTakeaways: Boolean(episode.keyTakeaways?.length),
    topicTags: Boolean(episode.topicTags?.length),
    chapters: Boolean(episode.chapters?.length),
    claims: Boolean(episode.claims?.length),
    citations: Boolean(episode.citations?.length),
    keyQuotes: Boolean(episode.keyQuotes?.length),
    relatedPosts: Boolean(episode.relatedPosts?.length),
  };
  const completed = PODCAST_KNOWLEDGE_FIELDS.filter((field) => fields[field]);
  const missing = PODCAST_KNOWLEDGE_FIELDS.filter((field) => !fields[field]);
  const hasEvidence = fields.claims || fields.citations || fields.keyQuotes;
  const citationReady =
    fields.transcript &&
    fields.answerCapsule &&
    fields.keyTakeaways &&
    fields.topicTags &&
    hasEvidence;
  const status: PodcastKnowledgeStatus = citationReady
    ? "citation-ready"
    : fields.transcript
      ? "transcript-indexed"
      : "show-notes-only";

  return {
    status,
    coveragePercent: Math.round(
      (completed.length / PODCAST_KNOWLEDGE_FIELDS.length) * 100,
    ),
    completed,
    missing,
  };
}
