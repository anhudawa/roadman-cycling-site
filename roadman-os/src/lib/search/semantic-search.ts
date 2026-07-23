import { createClient } from '@/lib/supabase/server'
import { generateEmbedding } from '@/lib/embeddings/embedding-service'
import type { ContentEmbedding } from '@/types/database'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type SemanticSearchResult = {
  entity_type: string
  entity_id: string
  chunk_index: number
  chunk_text: string
  similarity: number
  metadata: Record<string, unknown>
}

const SIMILARITY_THRESHOLD = 0.7

// ---------------------------------------------------------------------------
// Semantic search — generates query embedding, performs similarity search
// ---------------------------------------------------------------------------

export async function semanticSearch(
  query: string,
  limit = 20,
  entityTypes?: string[],
): Promise<SemanticSearchResult[]> {
  const supabase = await createClient()
  const queryEmbedding = await generateEmbedding(query)

  // STUB: In production this would use a Supabase RPC with pgvector:
  //
  //   const { data, error } = await supabase.rpc('match_embeddings', {
  //     query_embedding: queryEmbedding,
  //     match_threshold: SIMILARITY_THRESHOLD,
  //     match_count: limit,
  //     filter_entity_types: entityTypes ?? null,
  //   })
  //
  // The RPC would execute:
  //   SELECT
  //     entity_type, entity_id, chunk_index, chunk_text, metadata,
  //     1 - (embedding <=> query_embedding) AS similarity
  //   FROM content_embeddings
  //   WHERE 1 - (embedding <=> query_embedding) > match_threshold
  //     AND (filter_entity_types IS NULL OR entity_type = ANY(filter_entity_types))
  //   ORDER BY similarity DESC
  //   LIMIT match_count;

  // Fallback: fetch all embeddings and compute cosine similarity in JS
  let embeddingsQuery = supabase
    .from('content_embeddings')
    .select('*')

  if (entityTypes && entityTypes.length > 0) {
    embeddingsQuery = embeddingsQuery.in('entity_type', entityTypes)
  }

  const { data: embeddings } = await embeddingsQuery

  if (!embeddings || embeddings.length === 0) {
    return []
  }

  // Compute cosine similarity for each embedding
  const scored = (embeddings as ContentEmbedding[])
    .map((emb) => {
      const similarity = emb.embedding
        ? cosineSimilarity(queryEmbedding, emb.embedding)
        : 0

      return {
        entity_type: emb.entity_type,
        entity_id: emb.entity_id,
        chunk_index: emb.chunk_index,
        chunk_text: emb.chunk_text,
        similarity,
        metadata: emb.metadata,
      }
    })
    .filter((r) => r.similarity >= SIMILARITY_THRESHOLD)
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, limit)

  return scored
}

// ---------------------------------------------------------------------------
// Find similar content to a given entity
// ---------------------------------------------------------------------------

export async function findSimilar(
  entityType: string,
  entityId: string,
  limit = 10,
): Promise<SemanticSearchResult[]> {
  const supabase = await createClient()

  // Get the entity's embedding
  const { data: existing } = await supabase
    .from('content_embeddings')
    .select('*')
    .eq('entity_type', entityType)
    .eq('entity_id', entityId)
    .eq('chunk_index', 0)
    .single()

  if (!existing || !(existing as ContentEmbedding).embedding) {
    return []
  }

  const sourceEmbedding = (existing as ContentEmbedding).embedding!

  // Fetch all other embeddings
  const { data: allEmbeddings } = await supabase
    .from('content_embeddings')
    .select('*')
    .eq('chunk_index', 0) // Only compare top-level chunks

  if (!allEmbeddings || allEmbeddings.length === 0) {
    return []
  }

  const scored = (allEmbeddings as ContentEmbedding[])
    .filter(
      (emb) =>
        !(emb.entity_type === entityType && emb.entity_id === entityId),
    )
    .map((emb) => {
      const similarity = emb.embedding
        ? cosineSimilarity(sourceEmbedding, emb.embedding)
        : 0

      return {
        entity_type: emb.entity_type,
        entity_id: emb.entity_id,
        chunk_index: emb.chunk_index,
        chunk_text: emb.chunk_text,
        similarity,
        metadata: emb.metadata,
      }
    })
    .filter((r) => r.similarity >= SIMILARITY_THRESHOLD)
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, limit)

  return scored
}

// ---------------------------------------------------------------------------
// Cosine similarity helper
// ---------------------------------------------------------------------------

function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0

  let dotProduct = 0
  let normA = 0
  let normB = 0

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i]
    normA += a[i] * a[i]
    normB += b[i] * b[i]
  }

  const denominator = Math.sqrt(normA) * Math.sqrt(normB)
  if (denominator === 0) return 0

  return dotProduct / denominator
}
