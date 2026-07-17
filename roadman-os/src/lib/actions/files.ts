'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/utils/auth'
import { logActivity } from '@/lib/utils/activity'
import type { FileStorageType, File } from '@/types/database'

type ActionResult<T = File> = {
  success: boolean
  data?: T
  error?: string
}

/**
 * Upload a file to Supabase Storage and record it in the database.
 * Expects a FormData with:
 *   - file: the File blob
 *   - assetId: the parent asset ID
 */
export async function uploadFile(
  assetId: string,
  formData: FormData,
): Promise<ActionResult> {
  try {
    const profile = await requireAuth()
    const supabase = await createClient()

    const file = formData.get('file') as globalThis.File | null
    if (!file || !file.name) {
      return { success: false, error: 'No file provided' }
    }

    // 50 MB limit
    const MAX_SIZE = 50 * 1024 * 1024
    if (file.size > MAX_SIZE) {
      return { success: false, error: 'File exceeds the 50 MB size limit' }
    }

    // Generate a collision-safe path
    const uuid = crypto.randomUUID()
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
    const storagePath = `${assetId}/${uuid}-${safeName}`

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('assets')
      .upload(storagePath, file, {
        contentType: file.type || 'application/octet-stream',
        upsert: false,
      })

    if (uploadError) {
      console.error('Storage upload failed:', uploadError.message)
      return { success: false, error: 'Upload failed. Please try again.' }
    }

    // Insert the file record
    const { data: fileRecord, error: insertError } = await supabase
      .from('files')
      .insert({
        asset_id: assetId,
        uploaded_by: profile.id,
        storage_type: 'supabase' as FileStorageType,
        file_name: file.name,
        file_path: storagePath,
        mime_type: file.type || null,
        file_size_bytes: file.size,
        is_primary: false,
        metadata: {},
      })
      .select()
      .single()

    if (insertError) {
      // Clean up the uploaded file if DB insert fails
      await supabase.storage.from('assets').remove([storagePath])
      console.error('File record insert failed:', insertError.message)
      return { success: false, error: 'Failed to save file record' }
    }

    await logActivity(supabase, {
      actor_id: profile.id,
      action: 'file_uploaded',
      entity_type: 'file',
      entity_id: fileRecord.id,
      changes: {
        file_name: file.name,
        file_size_bytes: file.size,
        asset_id: assetId,
      },
    })

    revalidatePath(`/assets/${assetId}`)
    return { success: true, data: fileRecord as File }
  } catch (err) {
    console.error('uploadFile error:', err)
    return { success: false, error: 'Something went wrong during upload' }
  }
}

/**
 * Add an external file reference (no actual upload).
 */
export async function addExternalFile(
  assetId: string,
  data: {
    url: string
    storage_type: FileStorageType
    file_name: string
    description?: string
  },
): Promise<ActionResult> {
  try {
    const profile = await requireAuth()
    const supabase = await createClient()

    const { data: fileRecord, error } = await supabase
      .from('files')
      .insert({
        asset_id: assetId,
        uploaded_by: profile.id,
        storage_type: data.storage_type,
        file_name: data.file_name,
        file_path: data.url,
        mime_type: null,
        file_size_bytes: null,
        is_primary: false,
        metadata: {
          external_url: data.url,
          ...(data.description ? { description: data.description } : {}),
        },
      })
      .select()
      .single()

    if (error) {
      console.error('External file insert failed:', error.message)
      return { success: false, error: 'Failed to add external file' }
    }

    await logActivity(supabase, {
      actor_id: profile.id,
      action: 'file_uploaded',
      entity_type: 'file',
      entity_id: fileRecord.id,
      changes: {
        file_name: data.file_name,
        storage_type: data.storage_type,
        external_url: data.url,
        asset_id: assetId,
      },
    })

    revalidatePath(`/assets/${assetId}`)
    return { success: true, data: fileRecord as File }
  } catch (err) {
    console.error('addExternalFile error:', err)
    return { success: false, error: 'Something went wrong' }
  }
}

/**
 * Delete a file. Removes from Supabase Storage if applicable, then deletes the DB record.
 */
export async function deleteFile(fileId: string): Promise<ActionResult<null>> {
  try {
    const profile = await requireAuth()
    const supabase = await createClient()

    // Fetch the file record first
    const { data: file, error: fetchError } = await supabase
      .from('files')
      .select('*')
      .eq('id', fileId)
      .single()

    if (fetchError || !file) {
      return { success: false, error: 'File not found' }
    }

    // Remove from storage if it's a Supabase file
    if (file.storage_type === 'supabase') {
      const { error: storageError } = await supabase.storage
        .from('assets')
        .remove([file.file_path])

      if (storageError) {
        console.error('Storage deletion failed:', storageError.message)
        // Proceed with DB deletion anyway — orphaned storage is less harmful than phantom records
      }
    }

    // Delete the database record
    const { error: deleteError } = await supabase
      .from('files')
      .delete()
      .eq('id', fileId)

    if (deleteError) {
      console.error('File record deletion failed:', deleteError.message)
      return { success: false, error: 'Failed to delete file record' }
    }

    await logActivity(supabase, {
      actor_id: profile.id,
      action: 'file_deleted',
      entity_type: 'file',
      entity_id: fileId,
      changes: {
        file_name: file.file_name,
        storage_type: file.storage_type,
        asset_id: file.asset_id,
      },
    })

    revalidatePath(`/assets/${file.asset_id}`)
    return { success: true, data: null }
  } catch (err) {
    console.error('deleteFile error:', err)
    return { success: false, error: 'Something went wrong' }
  }
}

/**
 * Set a file as the primary file for its asset.
 * Clears is_primary on all sibling files first.
 */
export async function setPrimaryFile(
  fileId: string,
  assetId: string,
): Promise<ActionResult<null>> {
  try {
    await requireAuth()
    const supabase = await createClient()

    // Clear primary on all files for this asset
    const { error: clearError } = await supabase
      .from('files')
      .update({ is_primary: false })
      .eq('asset_id', assetId)

    if (clearError) {
      console.error('Failed to clear primary flags:', clearError.message)
      return { success: false, error: 'Failed to update primary file' }
    }

    // Set the selected file as primary
    const { error: setError } = await supabase
      .from('files')
      .update({ is_primary: true })
      .eq('id', fileId)

    if (setError) {
      console.error('Failed to set primary file:', setError.message)
      return { success: false, error: 'Failed to set primary file' }
    }

    revalidatePath(`/assets/${assetId}`)
    return { success: true, data: null }
  } catch (err) {
    console.error('setPrimaryFile error:', err)
    return { success: false, error: 'Something went wrong' }
  }
}
