'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/utils/auth'
import { logActivity } from '@/lib/utils/activity'
import type { TranscriptHighlight } from '@/types/database'

// ---------------------------------------------------------------------------
// Response type
// ---------------------------------------------------------------------------

type ActionResult = {
  success: boolean
  data?: TranscriptHighlight
  error?: string
}

// ---------------------------------------------------------------------------
// Add highlight
// ---------------------------------------------------------------------------

export async function addHighlight(formData: {
  transcript_id: string
  start_ms: number
  end_ms: number
  text: string
  label: string
  colour: string
  notes?: string
}): Promise<ActionResult> {
  const profile = await requireAuth()
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('transcript_highlights')
    .insert({
      transcript_id: formData.transcript_id,
      created_by: profile.id,
      start_ms: formData.start_ms,
      end_ms: formData.end_ms,
      text: formData.text,
      label: formData.label,
      colour: formData.colour,
      notes: formData.notes ?? null,
    })
    .select()
    .single()

  if (error) {
    return { success: false, error: error.message }
  }

  await logActivity(supabase, {
    actor_id: profile.id,
    action: 'highlight_added',
    entity_type: 'transcript_highlight',
    entity_id: data.id,
    changes: { label: formData.label, text: formData.text.slice(0, 100) },
  })

  revalidatePath('/transcripts')
  return { success: true, data: data as TranscriptHighlight }
}

// ---------------------------------------------------------------------------
// Update highlight
// ---------------------------------------------------------------------------

export async function updateHighlight(
  id: string,
  updates: {
    label?: string
    colour?: string
    notes?: string
    text?: string
  },
): Promise<ActionResult> {
  const profile = await requireAuth()
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('transcript_highlights')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return { success: false, error: error.message }
  }

  await logActivity(supabase, {
    actor_id: profile.id,
    action: 'updated',
    entity_type: 'transcript_highlight',
    entity_id: id,
    changes: updates,
  })

  revalidatePath('/transcripts')
  return { success: true, data: data as TranscriptHighlight }
}

// ---------------------------------------------------------------------------
// Delete highlight
// ---------------------------------------------------------------------------

export async function deleteHighlight(id: string): Promise<ActionResult> {
  const profile = await requireAuth()
  const supabase = await createClient()

  const { error } = await supabase
    .from('transcript_highlights')
    .delete()
    .eq('id', id)

  if (error) {
    return { success: false, error: error.message }
  }

  await logActivity(supabase, {
    actor_id: profile.id,
    action: 'archived',
    entity_type: 'transcript_highlight',
    entity_id: id,
  })

  revalidatePath('/transcripts')
  return { success: true }
}

// ---------------------------------------------------------------------------
// Mark highlight as used (e.g. in a publication or repurposed asset)
// ---------------------------------------------------------------------------

export async function markHighlightUsed(
  id: string,
  usedIn?: string,
): Promise<ActionResult> {
  const profile = await requireAuth()
  const supabase = await createClient()

  // Fetch existing highlight to merge notes
  const { data: existing } = await supabase
    .from('transcript_highlights')
    .select('notes')
    .eq('id', id)
    .single()

  const currentNotes = (existing as TranscriptHighlight | null)?.notes ?? ''
  const usedNote = usedIn
    ? `Used in: ${usedIn} (${new Date().toISOString().split('T')[0]})`
    : `Marked as used (${new Date().toISOString().split('T')[0]})`
  const updatedNotes = currentNotes ? `${currentNotes}\n${usedNote}` : usedNote

  const { data, error } = await supabase
    .from('transcript_highlights')
    .update({ notes: updatedNotes })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return { success: false, error: error.message }
  }

  await logActivity(supabase, {
    actor_id: profile.id,
    action: 'updated',
    entity_type: 'transcript_highlight',
    entity_id: id,
    changes: { marked_used: true, used_in: usedIn ?? null },
  })

  revalidatePath('/transcripts')
  return { success: true, data: data as TranscriptHighlight }
}
