// ---------------------------------------------------------------------------
// Transcript Indexer Agent $— Core Types
// ---------------------------------------------------------------------------

export interface EpisodeInput {
  slug: string;
  title: string;
  episodeNumber: number;
  publishDate: string;
  youtubeId: string;
  transcript: string;
  duration?: string;
  pillar?: string;
  type?: string;
}

// Step 1 output
export interface EpisodeMetadata {
  guest_name: string | null;
  guest_credentials: string | null;
  key_claims: string[];
  named_experts: string[];
  specific_numbers: string[];
  ndy_members: string[];
  episode_type: string;
  topics: string[];
}

// Step 2 output
export interface ClusterAssignment {
  primary_cluster: string;
  secondary_clusters: string[];
  primary_persona: string;
  cluster_reasoning: string;
}

// Step 3 output
export interface GeneratedContent {
  lede: string;
  key_takeaways: string;
  ai_citation_block: string;
  internal_links_prose: string;
  internal_link_slugs: string[];
  meta_description: string;
  seo_title: string;
}

// Step 3b output $— social content
export interface SocialContent {
  facebook: {
    post: string;
    angle: string;
  };
  linkedin: {
    post: string;
  };
  twitter: {
    tweets: { text: string; index: number }[];
  };
}

// Step 3c output $— blog content
export interface BlogContent {
  title: string;
  seoTitle: string;
  seoDescription: string;
  excerpt: string;
  body: string;
  keywords: string[];
  relatedEpisodeSlugs: string[];
}

// Step 4 output
export interface SacredCowResult {
  pass: boolean;
  note: string;
}

export interface VoiceCheckResult {
  sacred_cow_results: {
    contrarian_hook: SacredCowResult;
    villain_identified: SacredCowResult;
    insider_credibility: SacredCowResult;
    evidence_layer: SacredCowResult;
    universal_principle: SacredCowResult;
    personal_story: SacredCowResult;
    cultural_critique: SacredCowResult;
  };
  sacred_cow_score: number;
  voice_red_flags: string[];
  voice_red_flag_count: number;
  overall_pass: boolean;
  failure_reasons: string[];
  regeneration_notes: string;
}

// Full pipeline result for one episode
export interface PipelineResult {
  slug: string;
  episodeNumber: number;
  title: string;
  metadata: EpisodeMetadata;
  cluster: ClusterAssignment;
  content: GeneratedContent;
  socialContent: SocialContent | null;
  blogContent: BlogContent | null;
  voiceCheck: VoiceCheckResult;
  regenerationAttempts: number;
  mdxContent: string;
  metaSidecar: object;
  reciprocalEdits: ReciprocalEdit[];
  usage: UsageStats;
}

export interface ReciprocalEdit {
  targetSlug: string;
  linkAdded: string;
  sectionModified: string;
}

export interface UsageStats {
  totalInputTokens: number;
  totalOutputTokens: number;
  totalCost: number;
  runtimeMs: number;
  stepBreakdown: StepUsage[];
}

export interface StepUsage {
  step: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  cost: number;
  runtimeMs: number;
}

// Log entry
export interface LogEntry {
  timestamp: string;
  runId: string;
  episodeSlug: string;
  episodeNumber: number;
  step: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  runtimeMs: number;
  regenerationAttempt: number;
  sacredCowScore?: number;
  pass: boolean;
  error?: string;
}

// Agent modes
export type AgentMode = "watch" | "backfill";

export interface AgentConfig {
  mode: AgentMode;
  dryRun: boolean;
  podcastRssUrl: string;
  repoRoot: string;
  backfillFrom?: number;
  backfillTo?: number;
  maxEpisodesPerHour: number;
}

// RSS episode from feed
export interface RSSEpisode {
  title: string;
  guid: string;
  pubDate: string;
  enclosureUrl?: string;
  duration?: string;
}

// Index tracking
export interface EpisodeIndex {
  processedEpisodes: Record<string, { processedAt: string; prUrl?: string }>;
  lastPollAt: string;
}
