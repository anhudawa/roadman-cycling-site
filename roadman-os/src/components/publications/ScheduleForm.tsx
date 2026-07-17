'use client'

import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { PUBLICATION_STATUSES } from '@/lib/constants'
import type { Publication } from '@/types/database'

// Platform character limits (approximate)
const PLATFORM_CHAR_LIMITS: Record<string, number> = {
  twitter_x: 280,
  instagram: 2200,
  linkedin: 3000,
  facebook: 63206,
  tiktok: 2200,
  youtube: 5000,
}

interface ScheduleFormProps {
  mode: 'create' | 'edit'
  publication?: Publication
  assets: { id: string; title: string }[]
  platforms: { id: string; name: string; slug?: string }[]
  onSubmit: (formData: FormData) => Promise<void>
  onClose: () => void
}

export function ScheduleForm({
  mode,
  publication,
  assets,
  platforms,
  onSubmit,
  onClose,
}: ScheduleFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Pull initial values from publication metadata if editing
  const meta = (publication?.platform_metadata ?? {}) as Record<string, unknown>

  const [selectedPlatformId, setSelectedPlatformId] = useState(
    publication?.platform_id ?? '',
  )

  // Find the selected platform's slug for character limits
  const selectedPlatform = platforms.find((p) => p.id === selectedPlatformId)
  const charLimit = selectedPlatform?.slug
    ? PLATFORM_CHAR_LIMITS[selectedPlatform.slug]
    : undefined

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      setIsSubmitting(true)
      setError(null)

      try {
        const formData = new FormData(e.currentTarget)
        await onSubmit(formData)
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'An unexpected error occurred',
        )
      } finally {
        setIsSubmitting(false)
      }
    },
    [onSubmit],
  )

  // Format scheduled_at for datetime-local input (strip seconds and timezone)
  const formatDatetimeLocal = (isoString: string | null | undefined): string => {
    if (!isoString) return ''
    try {
      const date = new Date(isoString)
      // Format as YYYY-MM-DDTHH:mm
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const hours = String(date.getHours()).padStart(2, '0')
      const minutes = String(date.getMinutes()).padStart(2, '0')
      return `${year}-${month}-${day}T${hours}:${minutes}`
    } catch {
      return ''
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      <Select
        name="asset_id"
        label="Asset"
        placeholder="Select an asset..."
        options={assets.map((a) => ({ value: a.id, label: a.title }))}
        defaultValue={publication?.asset_id ?? ''}
        required
      />

      <Select
        name="platform_id"
        label="Platform"
        placeholder="Select a platform..."
        options={platforms.map((p) => ({ value: p.id, label: p.name }))}
        defaultValue={publication?.platform_id ?? ''}
        onChange={(e) => setSelectedPlatformId(e.target.value)}
        required
      />

      <Input
        name="scheduled_at"
        label="Scheduled Date & Time"
        type="datetime-local"
        defaultValue={formatDatetimeLocal(publication?.scheduled_at)}
      />

      {mode === 'edit' && (
        <Select
          name="status"
          label="Status"
          options={PUBLICATION_STATUSES.map((s) => ({
            value: s.value,
            label: s.label,
          }))}
          defaultValue={publication?.status ?? 'draft'}
        />
      )}

      <Input
        name="platform_title"
        label="Platform Title"
        placeholder="Title for this platform (optional)"
        defaultValue={(meta.platform_title as string) ?? ''}
      />

      <Textarea
        name="platform_body"
        label="Platform Body"
        placeholder="Content body for this platform (optional)"
        defaultValue={(meta.platform_body as string) ?? ''}
        maxLength={charLimit}
        rows={4}
      />

      <Input
        name="hashtags"
        label="Hashtags"
        placeholder="#cycling #fitness #training"
        defaultValue={(meta.hashtags as string) ?? ''}
        hint="Separate with spaces"
      />

      <Input
        name="mentions"
        label="Mentions"
        placeholder="@roadmancycling @partner"
        defaultValue={(meta.mentions as string) ?? ''}
        hint="Separate with spaces"
      />

      <div className="flex items-center justify-end gap-3 pt-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onClose}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" size="sm" loading={isSubmitting}>
          {mode === 'create' ? 'Schedule' : 'Update'}
        </Button>
      </div>
    </form>
  )
}
