'use client'

import { useState, useCallback } from 'react'
import {
  FileImage,
  FileAudio,
  FileVideo,
  FileText,
  Link as LinkIcon,
  Star,
  Trash2,
  ExternalLink,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils/cn'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { EmptyState } from '@/components/ui/EmptyState'
import { deleteFile, setPrimaryFile } from '@/lib/actions/files'
import type { File } from '@/types/database'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatBytes(bytes: number | null): string {
  if (bytes == null || bytes === 0) return '—'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`
}

function getFileIcon(file: File) {
  if (file.storage_type !== 'supabase') {
    return <LinkIcon className="w-5 h-5 text-blue-400" />
  }

  const mime = file.mime_type?.toLowerCase() || ''

  if (mime.startsWith('image/')) {
    return <FileImage className="w-5 h-5 text-emerald-400" />
  }
  if (mime.startsWith('audio/')) {
    return <FileAudio className="w-5 h-5 text-purple" />
  }
  if (mime.startsWith('video/')) {
    return <FileVideo className="w-5 h-5 text-coral" />
  }
  return <FileText className="w-5 h-5 text-amber-400" />
}

function getStorageLabel(type: string): string {
  const labels: Record<string, string> = {
    youtube: 'YouTube',
    spotify: 'Spotify',
    google_drive: 'Google Drive',
    dropbox: 'Dropbox',
    external_url: 'External',
    supabase: 'Uploaded',
  }
  return labels[type] || type
}

function isImageFile(file: File): boolean {
  return (
    file.storage_type === 'supabase' &&
    !!file.mime_type?.startsWith('image/')
  )
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface FileListProps {
  assetId: string
  files: File[]
  canEdit: boolean
  /** Called after a mutation so the parent can re-fetch files */
  onMutate?: () => void
}

export function FileList({ assetId, files, canEdit, onMutate }: FileListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [settingPrimaryId, setSettingPrimaryId] = useState<string | null>(null)

  const handleDelete = useCallback(async () => {
    if (!deletingId) return
    setIsDeleting(true)

    const result = await deleteFile(deletingId)
    setIsDeleting(false)
    setConfirmOpen(false)
    setDeletingId(null)

    if (result.success) {
      onMutate?.()
    }
  }, [deletingId, onMutate])

  const handleSetPrimary = useCallback(
    async (fileId: string) => {
      setSettingPrimaryId(fileId)
      const result = await setPrimaryFile(fileId, assetId)
      setSettingPrimaryId(null)

      if (result.success) {
        onMutate?.()
      }
    },
    [assetId, onMutate],
  )

  const openDeleteConfirm = useCallback((fileId: string) => {
    setDeletingId(fileId)
    setConfirmOpen(true)
  }, [])

  if (files.length === 0) {
    return (
      <EmptyState
        title="No files yet"
        description="Upload files or add external links to get started."
      />
    )
  }

  const deletingFile = files.find((f) => f.id === deletingId)

  return (
    <>
      <div className="space-y-2">
        {files.map((file) => {
          const fileUrl =
            file.storage_type !== 'supabase'
              ? (file.metadata?.external_url as string) || file.file_path
              : undefined

          return (
            <div
              key={file.id}
              className="flex items-center gap-3 bg-charcoal border border-mid-grey/20 rounded-lg px-4 py-3 group"
            >
              {/* Thumbnail or icon */}
              {isImageFile(file) ? (
                <div className="w-10 h-10 rounded bg-mid-grey/10 overflow-hidden shrink-0 flex items-center justify-center">
                  {/* Thumbnail generated via Supabase transform or placeholder */}
                  <FileImage className="w-5 h-5 text-emerald-400" />
                </div>
              ) : (
                <div className="w-10 h-10 rounded bg-mid-grey/10 flex items-center justify-center shrink-0">
                  {getFileIcon(file)}
                </div>
              )}

              {/* File details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  {fileUrl ? (
                    <a
                      href={fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-off-white hover:text-coral truncate transition-colours"
                    >
                      {file.file_name}
                      <ExternalLink className="inline w-3 h-3 ml-1 opacity-50" />
                    </a>
                  ) : (
                    <span className="text-sm text-off-white truncate">
                      {file.file_name}
                    </span>
                  )}

                  {file.is_primary && (
                    <Badge variant="amber" size="sm">
                      <Star className="w-3 h-3 mr-1 fill-current" />
                      Primary
                    </Badge>
                  )}

                  {file.storage_type !== 'supabase' && (
                    <Badge variant="blue" size="sm">
                      {getStorageLabel(file.storage_type)}
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-3 mt-0.5">
                  <span className="text-xs text-mid-grey">
                    {formatBytes(file.file_size_bytes)}
                  </span>
                  <span className="text-xs text-mid-grey">
                    {formatDistanceToNow(new Date(file.created_at), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
              </div>

              {/* Actions */}
              {canEdit && (
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {!file.is_primary && (
                    <button
                      type="button"
                      onClick={() => handleSetPrimary(file.id)}
                      disabled={settingPrimaryId === file.id}
                      className={cn(
                        'p-1.5 rounded-md text-mid-grey hover:text-amber-400 hover:bg-amber-500/10 transition-colours',
                        settingPrimaryId === file.id && 'opacity-50 cursor-not-allowed',
                      )}
                      title="Set as primary"
                      aria-label={`Set ${file.file_name} as primary`}
                    >
                      <Star className="w-4 h-4" />
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => openDeleteConfirm(file.id)}
                    className="p-1.5 rounded-md text-mid-grey hover:text-red-400 hover:bg-red-500/10 transition-colours"
                    title="Delete file"
                    aria-label={`Delete ${file.file_name}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Delete confirmation */}
      <ConfirmDialog
        open={confirmOpen}
        onClose={() => {
          setConfirmOpen(false)
          setDeletingId(null)
        }}
        onConfirm={handleDelete}
        title="Delete file?"
        message={
          deletingFile
            ? `This will permanently remove "${deletingFile.file_name}". This action cannot be undone.`
            : 'This will permanently remove the selected file.'
        }
        confirmText="Delete"
        cancelText="Keep it"
        variant="danger"
        loading={isDeleting}
      />
    </>
  )
}
