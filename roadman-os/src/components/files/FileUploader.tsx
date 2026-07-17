'use client'

import { useCallback, useRef, useState } from 'react'
import { Upload, CheckCircle2, AlertCircle, X, File as FileIcon } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { Button } from '@/components/ui/Button'
import { uploadFile } from '@/lib/actions/files'

const ACCEPTED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'application/pdf',
  'audio/mpeg',
  'audio/wav',
  'audio/x-m4a',
  'audio/m4a',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]

const ACCEPTED_EXTENSIONS = '.jpg,.jpeg,.png,.webp,.gif,.pdf,.mp3,.wav,.m4a,.doc,.docx'

const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50 MB

type QueuedFile = {
  id: string
  file: globalThis.File
  status: 'queued' | 'uploading' | 'done' | 'error'
  progress: number
  error?: string
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`
}

interface FileUploaderProps {
  assetId: string
  onUploadComplete?: () => void
}

export function FileUploader({ assetId, onUploadComplete }: FileUploaderProps) {
  const [queue, setQueue] = useState<QueuedFile[]>([])
  const [isDragOver, setIsDragOver] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const addFiles = useCallback(
    (files: globalThis.File[]) => {
      const newItems: QueuedFile[] = []

      for (const file of files) {
        // Validate file type
        const isAcceptedType = ACCEPTED_TYPES.includes(file.type)
        const ext = file.name.split('.').pop()?.toLowerCase()
        const isAcceptedExt = ext
          ? ACCEPTED_EXTENSIONS.includes(`.${ext}`)
          : false

        if (!isAcceptedType && !isAcceptedExt) {
          newItems.push({
            id: crypto.randomUUID(),
            file,
            status: 'error',
            progress: 0,
            error: 'Unsupported file type',
          })
          continue
        }

        // Validate file size
        if (file.size > MAX_FILE_SIZE) {
          newItems.push({
            id: crypto.randomUUID(),
            file,
            status: 'error',
            progress: 0,
            error: 'File exceeds the 50 MB limit',
          })
          continue
        }

        newItems.push({
          id: crypto.randomUUID(),
          file,
          status: 'queued',
          progress: 0,
        })
      }

      setQueue((prev) => [...prev, ...newItems])
    },
    [],
  )

  const processQueue = useCallback(async () => {
    setIsProcessing(true)

    setQueue((prev) => {
      const toProcess = prev.filter((f) => f.status === 'queued')
      if (toProcess.length === 0) return prev

      // Start processing sequentially
      void (async () => {
        for (const item of toProcess) {
          // Mark as uploading
          setQueue((q) =>
            q.map((f) =>
              f.id === item.id ? { ...f, status: 'uploading' as const, progress: 20 } : f,
            ),
          )

          const formData = new FormData()
          formData.append('file', item.file)

          // Simulate progress steps
          setQueue((q) =>
            q.map((f) =>
              f.id === item.id ? { ...f, progress: 50 } : f,
            ),
          )

          const result = await uploadFile(assetId, formData)

          if (result.success) {
            setQueue((q) =>
              q.map((f) =>
                f.id === item.id
                  ? { ...f, status: 'done' as const, progress: 100 }
                  : f,
              ),
            )
          } else {
            setQueue((q) =>
              q.map((f) =>
                f.id === item.id
                  ? {
                      ...f,
                      status: 'error' as const,
                      progress: 0,
                      error: result.error || 'Upload failed',
                    }
                  : f,
              ),
            )
          }
        }

        setIsProcessing(false)
        onUploadComplete?.()
      })()

      return prev
    })
  }, [assetId, onUploadComplete])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragOver(false)
      const files = Array.from(e.dataTransfer.files)
      if (files.length > 0) {
        addFiles(files)
      }
    },
    [addFiles],
  )

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || [])
      if (files.length > 0) {
        addFiles(files)
      }
      // Reset the input so the same file can be re-selected
      e.target.value = ''
    },
    [addFiles],
  )

  const removeFromQueue = useCallback((id: string) => {
    setQueue((prev) => prev.filter((f) => f.id !== id))
  }, [])

  const hasQueuedFiles = queue.some((f) => f.status === 'queued')

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault()
          setIsDragOver(true)
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={cn(
          'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colours',
          isDragOver
            ? 'border-coral bg-coral/5'
            : 'border-mid-grey/30 hover:border-mid-grey/50',
        )}
      >
        <Upload className="w-8 h-8 text-mid-grey mx-auto mb-3" />
        <p className="text-sm text-off-white font-medium">
          Drag and drop files here, or click to browse
        </p>
        <p className="text-xs text-mid-grey mt-1">
          Images, PDFs, audio, documents — up to 50 MB each
        </p>
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept={ACCEPTED_EXTENSIONS}
          multiple
          onChange={handleFileInput}
        />
      </div>

      {/* Queue list */}
      {queue.length > 0 && (
        <div className="space-y-2">
          {queue.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-3 bg-charcoal border border-mid-grey/20 rounded-lg px-4 py-3"
            >
              {/* Status icon */}
              {item.status === 'done' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              ) : item.status === 'error' ? (
                <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
              ) : (
                <FileIcon className="w-5 h-5 text-mid-grey shrink-0" />
              )}

              {/* File info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm text-off-white truncate">
                  {item.file.name}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-mid-grey">
                    {formatBytes(item.file.size)}
                  </span>
                  {item.error && (
                    <span className="text-xs text-red-400">{item.error}</span>
                  )}
                </div>

                {/* Progress bar */}
                {item.status === 'uploading' && (
                  <div className="mt-1.5 h-1 w-full bg-mid-grey/20 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-coral rounded-full transition-all duration-500"
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                )}
              </div>

              {/* Remove button */}
              {(item.status === 'queued' || item.status === 'error' || item.status === 'done') && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    removeFromQueue(item.id)
                  }}
                  className="text-mid-grey hover:text-off-white transition-colours p-1"
                  aria-label={`Remove ${item.file.name}`}
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}

          {/* Upload button */}
          {hasQueuedFiles && (
            <Button
              onClick={processQueue}
              loading={isProcessing}
              disabled={isProcessing}
              icon={<Upload className="w-4 h-4" />}
              size="md"
            >
              Upload {queue.filter((f) => f.status === 'queued').length} file
              {queue.filter((f) => f.status === 'queued').length !== 1 ? 's' : ''}
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
