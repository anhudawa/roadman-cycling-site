// Ask Roadman shared types. Server-only module $€” no React imports.

export type Intent =
  | "plateau"
  | "fuelling"
  | "content_discovery"
  | "recovery_masters"
  | "event_prep"
  | "coaching_decision"
  | "training_general"
  | "safety_medical"
  | "safety_injury"
  | "safety_weight"
  | "off_topic"
  | "unknown";

export interface IntentClassification {
  intent: Intent;
  confidence: "high" | "medium" | "low";
  deep: boolean;           // true $†’ route to Opus; false $†’ Haiku
  needsProfile: boolean;   // true $†’ inject profile into context
}

export type SafetyFlag =
  | "medical_escalation"
  | "injury_escalation"
  | "extreme_weight_loss"
  | "dangerous_training"
  | "underage";

export interface SafetyDecision {
  flags: SafetyFlag[];
  block: boolean;          // true $†’ bypass RAG, return fixed template
  templateKey?: "medical" | "injury" | "weight" | "dangerous";
}

export type CtaKey =
  | "plateau_diagnostic"
  | "fuelling_calculator"
  | "ftp_zones"
  | "saturday_spin"
  | "clubhouse"
  | "roadman_plus"
  | "ndy_coaching"
  | "vip_coaching"
  | "episode_list"
  | "none";

export interface CtaDescriptor {
  key: CtaKey;
  title: string;
  body: string;
  href: string;
  analyticsEvent: string;  // e.g. 'cta_clicked:plateau_diagnostic'
}

export type SourceType =
  | "episode"
  | "methodology"
  | "content_chunk"
  | "expert_quote";

export interface RetrievedChunk {
  sourceType: SourceType;
  sourceId: string;
  title: string;
  url?: string;
  excerpt: string;
  score: number;
}

export interface RetrievalResult {
  chunks: RetrievedChunk[];
  totalCandidates: number; // how many were considered before merge/cap
}

export interface Citation {
  type: SourceType;
  source_id: string;
  title: string;
  url?: string;
  excerpt?: string;
}

export interface AskMessageRecord {
  id: string;
  sessionId: string;
  role: "user" | "assistant" | "system";
  content: string;
  citations: Citation[] | null;
  ctaRecommended: string | null;
  safetyFlags: string[] | null;
  confidence: "high" | "medium" | "low" | null;
  model: string | null;
  inputTokens: number | null;
  outputTokens: number | null;
  latencyMs: number | null;
  flaggedForReview: boolean;
  createdAt: Date;
}

export interface OrchestratorInput {
  query: string;
  sessionId: string;
  riderProfileId: number | null;
  ip: string;
  /** Optional seed handoff from a saved tool result. */
  seed?: { tool: string; slug: string } | null;
}

export type OrchestratorEmitType =
  | "meta"
  | "delta"
  | "citation"
  | "cta"
  | "safety"
  | "done"
  | "error";

export interface OrchestratorEmit {
  type: OrchestratorEmitType;
  data: unknown;
}
