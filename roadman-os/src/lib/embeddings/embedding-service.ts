/**
 * Embedding service — STUB implementation.
 *
 * In production this would call OpenAI text-embedding-3-small (1536 dims).
 * For now returns random vectors so the pipeline compiles end-to-end.
 */

const EMBEDDING_DIMENSION = 1536
const MODEL_NAME = 'text-embedding-3-small'
const COST_PER_1K_TOKENS = 0.00002 // USD

// ---------------------------------------------------------------------------
// Generate embedding — STUB: returns random 1536-dim vector
// ---------------------------------------------------------------------------

export async function generateEmbedding(text: string): Promise<number[]> {
  // Simulate latency of a real API call
  await new Promise((resolve) => setTimeout(resolve, 50))

  // In production: call OpenAI /v1/embeddings with model text-embedding-3-small
  // const response = await openai.embeddings.create({
  //   model: MODEL_NAME,
  //   input: text,
  // })
  // return response.data[0].embedding

  const vector: number[] = []
  for (let i = 0; i < EMBEDDING_DIMENSION; i++) {
    vector.push(Math.random() * 2 - 1)
  }

  // Normalise to unit length
  const magnitude = Math.sqrt(vector.reduce((sum, v) => sum + v * v, 0))
  return vector.map((v) => v / magnitude)
}

// ---------------------------------------------------------------------------
// Chunk text by word count with overlap
// ---------------------------------------------------------------------------

export function chunkText(
  text: string,
  chunkSize = 500,
  overlap = 100,
): string[] {
  const words = text.split(/\s+/).filter(Boolean)

  if (words.length <= chunkSize) {
    return [words.join(' ')]
  }

  const chunks: string[] = []
  let start = 0

  while (start < words.length) {
    const end = Math.min(start + chunkSize, words.length)
    chunks.push(words.slice(start, end).join(' '))

    if (end >= words.length) break
    start += chunkSize - overlap
  }

  return chunks
}

// ---------------------------------------------------------------------------
// Token count estimate — words x 1.3
// ---------------------------------------------------------------------------

export function countTokens(text: string): number {
  const wordCount = text.split(/\s+/).filter(Boolean).length
  return Math.ceil(wordCount * 1.3)
}

// ---------------------------------------------------------------------------
// Cost estimate in USD
// ---------------------------------------------------------------------------

export function estimateCost(tokenCount: number): number {
  return (tokenCount / 1000) * COST_PER_1K_TOKENS
}

// ---------------------------------------------------------------------------
// Exports for reference
// ---------------------------------------------------------------------------

export { EMBEDDING_DIMENSION, MODEL_NAME, COST_PER_1K_TOKENS }
