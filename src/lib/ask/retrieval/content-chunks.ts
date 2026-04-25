/**
 * Retrieval from the shared content layer (blog posts, tools, FAQs, capsules).
 *
 * PR #76 only seeded episodes + methodology. The `content_sources` /
 * `content_chunks` tables ship in Phase 4. Until then this returns `[]`
 * so the orchestrator's merge logic still works.
 */

import type { RetrievedChunk } from "../types";

export async function searchContentChunks(
  _query: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _limit = 4,
): Promise<RetrievedChunk[]> {
  // Placeholder $— Phase 4 adds the real implementation.
  return [];
}
