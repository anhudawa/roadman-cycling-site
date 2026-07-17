import { createClient } from '@/lib/supabase/server'
import type { File } from '@/types/database'

/**
 * Fetch all files for an asset, ordered by primary first then newest.
 */
export async function getFilesByAsset(assetId: string): Promise<File[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('files')
    .select('*')
    .eq('asset_id', assetId)
    .order('is_primary', { ascending: false })
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Failed to fetch files:', error.message)
    return []
  }

  return (data ?? []) as File[]
}

/**
 * Fetch a single file by its ID.
 */
export async function getFile(fileId: string): Promise<File | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('files')
    .select('*')
    .eq('id', fileId)
    .single()

  if (error) {
    console.error('Failed to fetch file:', error.message)
    return null
  }

  return data as File
}

/**
 * Generate a URL for accessing a file.
 * Supabase-stored files get a signed URL (1-hour expiry).
 * External files return the URL from metadata or file_path.
 */
export async function getFileUrl(file: File): Promise<string | null> {
  if (file.storage_type === 'supabase') {
    const supabase = await createClient()

    const { data, error } = await supabase.storage
      .from('assets')
      .createSignedUrl(file.file_path, 3600) // 1 hour

    if (error) {
      console.error('Failed to generate signed URL:', error.message)
      return null
    }

    return data.signedUrl
  }

  // External files: prefer metadata.external_url, fall back to file_path
  const externalUrl = file.metadata?.external_url as string | undefined
  return externalUrl || file.file_path || null
}
