import type { Pillar } from "./config.js";

export interface LLMUsage {
  inputTokens: number;
  outputTokens: number;
  cost: number;
  runtimeMs: number;
}

export interface VoiceCheckResult {
  pass: boolean;
  redFlags: string[];
  notes: string;
  regenerationNotes: string;
}

export interface PromptDraftResult {
  pillar: Pillar;
  body: string;
  voiceCheck: VoiceCheckResult;
  attempts: number;
  usage: { generation: LLMUsage; voiceCheck: LLMUsage };
}

export interface WelcomeDraftResult {
  body: string;
  voiceCheck: VoiceCheckResult;
  attempts: number;
  personaNote?: string;
}

export type SurfaceType = "tag" | "link" | "summary";

export interface SurfaceDraftResult {
  surfaceType: SurfaceType;
  body: string;
  targetPostId: string;
  voiceCheck: VoiceCheckResult;
}

export interface SkoolPost {
  id: string;
  url: string;
  author: string;
  authorId: string;
  body: string;
  replies: number;
  createdAt: string;
  lastReplyAt?: string;
  category?: string;
}

export interface EpisodeTopicMap {
  [topic: string]: Array<{
    slug: string;
    title: string;
    episodeNumber?: number;
    guest?: string;
    relevance: string;
  }>;
}
