'use server'

import { createClient } from '@/lib/supabase/server'
import {
  generateEmbedding,
  chunkText,
  countTokens,
  MODEL_NAME,
} from '@/lib/embeddings/embedding-service'
import type { ContentEmbeddingInsert } from '@/types/database'

// ---------------------------------------------------------------------------
// Embed a single asset (title + description) — chunk_index = 0
// ---------------------------------------------------------------------------

export async function embedAsset(
  assetId: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()

    const { data: asset, error: fetchErr } = await supabase
      .from('assets')
      .select('id, title, description')
      .eq('id', assetId)
      .single()

    if (fetchErr || !asset) {
      return { success: false, error: fetchErr?.message ?? 'Asset not found' }
    }

    const text = [asset.title, asset.description].filter(Boolean).join(' — ')
    const tokens = countTokens(text)
    const embedding = await generateEmbedding(text)

    // Remove existing embeddings for this entity first
    await supabase
      .from('content_embeddings')
      .delete()
      .eq('entity_type', 'asset')
      .eq('entity_id', assetId)

    const row: ContentEmbeddingInsert = {
      entity_type: 'asset',
      entity_id: assetId,
      chunk_index: 0,
      chunk_text: text,
      embedding,
      model: MODEL_NAME,
      token_count: tokens,
      metadata: {},
    }

    const { error: insertErr } = await supabase
      .from('content_embeddings')
      .insert(row)

    if (insertErr) {
      return { success: false, error: insertErr.message }
    }

    return { success: true }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unexpected error',
    }
  }
}

// ---------------------------------------------------------------------------
// Embed a transcript — chunks full_text, generates per-chunk embeddings
// ---------------------------------------------------------------------------

export async function embedTranscript(
  transcriptId: string,
): Promise<{ success: boolean; chunksCreated?: number; error?: string }> {
  try {
    const supabase = await createClient()

    const { data: transcript, error: fetchErr } = await supabase
      .from('transcripts')
      .select('id, full_text, asset_id')
      .eq('id', transcriptId)
      .single()

    if (fetchErr || !transcript) {
      return { success: false, error: fetchErr?.message ?? 'Transcript not found' }
    }

    const fullText = (transcript as { full_text: string }).full_text
    if (!fullText) {
      return { success: false, error: 'Transcript has no text' }
    }

    const chunks = chunkText(fullText, 500, 100)

    // Remove existing embeddings for this transcript
    await supabase
      .from('content_embeddings')
      .delete()
      .eq('entity_type', 'transcript')
      .eq('entity_id', transcriptId)

    const rows: ContentEmbeddingInsert[] = []

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i]
      const tokens = countTokens(chunk)
      const embedding = await generateEmbedding(chunk)

      rows.push({
        entity_type: 'transcript',
        entity_id: transcriptId,
        chunk_index: i,
        chunk_text: chunk,
        embedding,
        model: MODEL_NAME,
        token_count: tokens,
        metadata: { asset_id: (transcript as { asset_id: string }).asset_id },
      })
    }

    if (rows.length > 0) {
      const { error: insertErr } = await supabase
        .from('content_embeddings')
        .insert(rows)

      if (insertErr) {
        return { success: false, error: insertErr.message }
      }
    }

    return { success: true, chunksCreated: rows.length }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unexpected error',
    }
  }
}

// ---------------------------------------------------------------------------
// Embed an idea (title + description)
// ---------------------------------------------------------------------------

export async function embedIdea(
  ideaId: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()

    const { data: idea, error: fetchErr } = await supabase
      .from('ideas')
      .select('id, title, description')
      .eq('id', ideaId)
      .single()

    if (fetchErr || !idea) {
      return { success: false, error: fetchErr?.message ?? 'Idea not found' }
    }

    const text = [idea.title, idea.description].filter(Boolean).join(' — ')
    const tokens = countTokens(text)
    const embedding = await generateEmbedding(text)

    // Remove existing embeddings for this entity
    await supabase
      .from('content_embeddings')
      .delete()
      .eq('entity_type', 'idea')
      .eq('entity_id', ideaId)

    const row: ContentEmbeddingInsert = {
      entity_type: 'idea',
      entity_id: ideaId,
      chunk_index: 0,
      chunk_text: text,
      embedding,
      model: MODEL_NAME,
      token_count: tokens,
      metadata: {},
    }

    const { error: insertErr } = await supabase
      .from('content_embeddings')
      .insert(row)

    if (insertErr) {
      return { success: false, error: insertErr.message }
    }

    return { success: true }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unexpected error',
    }
  }
}

// ---------------------------------------------------------------------------
// Remove embeddings for a given entity
// ---------------------------------------------------------------------------

export async function removeEmbeddings(
  entityType: string,
  entityId: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()

    const { error } = await supabase
      .from('content_embeddings')
      .delete()
      .eq('entity_type', entityType)
      .eq('entity_id', entityId)

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unexpected error',
    }
  }
}
