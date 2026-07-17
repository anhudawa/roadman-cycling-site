'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { LinkIcon } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { addExternalFile } from '@/lib/actions/files'
import { externalFileSchema, type ExternalFileFormValues } from '@/lib/schemas/files'
import type { FileStorageType } from '@/types/database'

const storageTypeOptions = [
  { value: 'youtube', label: 'YouTube' },
  { value: 'spotify', label: 'Spotify' },
  { value: 'google_drive', label: 'Google Drive' },
  { value: 'dropbox', label: 'Dropbox' },
  { value: 'external_url', label: 'External URL' },
]

interface ExternalFileFormProps {
  assetId: string
  onSuccess?: () => void
}

export function ExternalFileForm({ assetId, onSuccess }: ExternalFileFormProps) {
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ExternalFileFormValues>({
    resolver: zodResolver(externalFileSchema),
    defaultValues: {
      url: '',
      file_name: '',
      storage_type: 'external_url',
      description: '',
    },
  })

  const onSubmit = async (values: ExternalFileFormValues) => {
    setServerError(null)

    const result = await addExternalFile(assetId, {
      url: values.url,
      storage_type: values.storage_type as FileStorageType,
      file_name: values.file_name,
      description: values.description,
    })

    if (result.success) {
      reset()
      onSuccess?.()
    } else {
      setServerError(result.error || 'Failed to add external file')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label="URL"
        placeholder="https://..."
        error={errors.url?.message}
        {...register('url')}
      />

      <Input
        label="Display name"
        placeholder="e.g. Episode 42 — Full Video"
        error={errors.file_name?.message}
        {...register('file_name')}
      />

      <Select
        label="Source type"
        options={storageTypeOptions}
        error={errors.storage_type?.message}
        {...register('storage_type')}
      />

      <Input
        label="Description"
        placeholder="Optional — brief note about this file"
        error={errors.description?.message}
        {...register('description')}
      />

      {serverError && (
        <p className="text-sm text-red-400">{serverError}</p>
      )}

      <Button
        type="submit"
        loading={isSubmitting}
        icon={<LinkIcon className="w-4 h-4" />}
        size="md"
      >
        Add external file
      </Button>
    </form>
  )
}
