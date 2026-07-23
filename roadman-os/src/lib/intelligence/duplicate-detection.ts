import { createClient } from '@/lib/supabase/server'
import type { ContentEmbedding } from '@/types/database'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type DuplicatePair = {
  pairKey: string
  entityA: { entity_type: string; entity_id: string; chunk_text: string }
  entityB: { entity_type: string; entity_id: string; chunk_text: string }
  similarity: number
}

export type DuplicateCheckResult = {
  assetId: string
  duplicates: DuplicatePair[]
}

const DEFAULT_THRESHOLD = 0.92

// ---------------------------------------------------------------------------
// Cosine similarity
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

// ---------------------------------------------------------------------------
// Find duplicates across all content
// ---------------------------------------------------------------------------

export async function findDuplicates(
  threshold = DEFAULT_THRESHOLD,
): Promise<DuplicatePair[]> {
  const supabase = await createClient()

  // STUB: In production this would use a pgvector query like:
  //   SELECT a.*, b.*, 1 - (a.embedding <=> b.embedding) as similarity
  //   FROM content_embeddings a, content_embeddings b
  //   WHERE a.id < b.id
  //     AND a.chunk_index = 0 AND b.chunk_index = 0
  //     AND 1 - (a.embedding <=> b.embedding) > threshold
  //   ORDER BY similarity DESC

  const { data: embeddings } = await supabase
    .from('content_embeddings')
    .select('*')
    .eq('chunk_index', 0)

  if (!embeddings || embeddings.length < 2) {
    return []
  }

  const items = embeddings as ContentEmbedding[]
  const pairs: DuplicatePair[] = []

  // Pairwise comparison (O(n^2) — fine for small sets, production uses pgvector)
  for (let i = 0; i < items.length; i++) {
    for (let j = i + 1; j < items.length; j++) {
      const a = items[i]
      const b = items[j]

      if (!a.embedding || !b.embedding) continue

      // Skip same entity
      if (a.entity_type === b.entity_type && a.entity_id === b.entity_id) continue

      const similarity = cosineSimilarity(a.embedding, b.embedding)

      if (similarity >= threshold) {
        const pairKey = [
          `${a.entity_type}:${a.entity_id}`,
          `${b.entity_type}:${b.entity_id}`,
        ].sort().join('||')

        pairs.push({
          pairKey,
          entityA: {
            entity_type: a.entity_type,
            entity_id: a.entity_id,
            chunk_text: a.chunk_text,
          },
          entityB: {
            entity_type: b.entity_type,
            entity_id: b.entity_id,
            chunk_text: b.chunk_text,
          },
          similarity,
        })
      }
    }
  }

  // Sort by similarity descending
  pairs.sort((a, b) => b.similarity - a.similarity)

  return pairs
}

// ---------------------------------------------------------------------------
// Check a single asset for duplicates
// ---------------------------------------------------------------------------

export async function checkForDuplicates(
  assetId: string,
  threshold = DEFAULT_THRESHOLD,
): Promise<DuplicateCheckResult> {
  const supabase = await createClient()

  // Get the asset's embedding
  const { data: assetEmbedding } = await supabase
    .from('content_embeddings')
    .select('*')
    .eq('entity_type', 'asset')
    .eq('entity_id', assetId)
    .eq('chunk_index', 0)
    .single()

  if (!assetEmbedding || !(assetEmbedding as ContentEmbedding).embedding) {
    return { assetId, duplicates: [] }
  }

  const sourceEmb = (assetEmbedding as ContentEmbedding).embedding!

  // Get all other chunk_index=0 embeddings
  const { data: others } = await supabase
    .from('content_embeddings')
    .select('*')
    .eq('chunk_index', 0)
    .neq('entity_id', assetId)

  if (!others || others.length === 0) {
    return { assetId, duplicates: [] }
  }

  const duplicates: DuplicatePair[] = []

  for (const other of others as ContentEmbedding[]) {
    if (!other.embedding) continue

    const similarity = cosineSimilarity(sourceEmb, other.embedding)

    if (similarity >= threshold) {
      const pairKey = [
        `asset:${assetId}`,
        `${other.entity_type}:${other.entity_id}`,
      ].sort().join('||')

      duplicates.push({
        pairKey,
        entityA: {
          entity_type: 'asset',
          entity_id: assetId,
          chunk_text: (assetEmbedding as ContentEmbedding).chunk_text,
        },
        entityB: {
          entity_type: other.entity_type,
          entity_id: other.entity_id,
          chunk_text: other.chunk_text,
        },
        similarity,
      })
    }
  }

  duplicates.sort((a, b) => b.similarity - a.similarity)

  return { assetId, duplicates }
}
