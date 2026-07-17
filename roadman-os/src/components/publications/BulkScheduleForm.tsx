'use client'

import { useState, useCallback } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'

interface PlatformEntry {
  platform_id: string
  name: string
  selected: boolean
  scheduled_at: string
  platform_title: string
  platform_body: string
  expanded: boolean
}

interface BulkScheduleFormProps {
  assets: { id: string; title: string }[]
  platforms: { id: string; name: string }[]
  onSubmit: (formData: FormData) => Promise<void>
  onClose: () => void
}

export function BulkScheduleForm({
  assets,
  platforms,
  onSubmit,
  onClose,
}: BulkScheduleFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [assetId, setAssetId] = useState('')
  const [sameTime, setSameTime] = useState(false)
  const [sharedTime, setSharedTime] = useState('')

  const [platformEntries, setPlatformEntries] = useState<PlatformEntry[]>(
    platforms.map((p) => ({
      platform_id: p.id,
      name: p.name,
      selected: false,
      scheduled_at: '',
      platform_title: '',
      platform_body: '',
      expanded: false,
    })),
  )

  const updateEntry = useCallback(
    (index: number, updates: Partial<PlatformEntry>) => {
      setPlatformEntries((prev) =>
        prev.map((entry, i) => (i === index ? { ...entry, ...updates } : entry)),
      )
    },
    [],
  )

  const selectedCount = platformEntries.filter((p) => p.selected).length

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      setError(null)

      if (!assetId) {
        setError('Please select an asset')
        return
      }

      const selectedPlatforms = platformEntries.filter((p) => p.selected)
      if (selectedPlatforms.length === 0) {
        setError('Please select at least one platform')
        return
      }

      // Validate each selected platform has a time (either shared or individual)
      for (const p of selectedPlatforms) {
        const time = sameTime ? sharedTime : p.scheduled_at
        if (!time) {
          setError(
            sameTime
              ? 'Please set a shared schedule time'
              : `Please set a schedule time for ${p.name}`,
          )
          return
        }
      }

      setIsSubmitting(true)

      try {
        const bulkData = {
          asset_id: assetId,
          same_time: sameTime,
          shared_time: sharedTime,
          platforms: selectedPlatforms.map((p) => ({
            platform_id: p.platform_id,
            scheduled_at: sameTime ? sharedTime : p.scheduled_at,
            platform_title: p.platform_title || undefined,
            platform_body: p.platform_body || undefined,
          })),
        }

        const formData = new FormData()
        formData.set('bulk_data', JSON.stringify(bulkData))
        await onSubmit(formData)
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'An unexpected error occurred',
        )
      } finally {
        setIsSubmitting(false)
      }
    },
    [assetId, platformEntries, sameTime, sharedTime, onSubmit],
  )

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* Asset selector */}
      <Select
        label="Asset"
        placeholder="Select an asset..."
        options={assets.map((a) => ({ value: a.id, label: a.title }))}
        value={assetId}
        onChange={(e) => setAssetId(e.target.value)}
      />

      {/* Same time toggle */}
      <div className="flex items-center gap-3">
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={sameTime}
            onChange={(e) => setSameTime(e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-9 h-5 bg-mid-grey/30 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-coral/50 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-off-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-coral" />
        </label>
        <span className="text-sm text-off-white">Same time for all platforms</span>
      </div>

      {/* Shared time picker */}
      {sameTime && (
        <Input
          label="Shared Schedule Time"
          type="datetime-local"
          value={sharedTime}
          onChange={(e) => setSharedTime(e.target.value)}
        />
      )}

      {/* Platform checklist */}
      <div>
        <p className="block text-sm font-medium text-off-white mb-2">
          Platforms ({selectedCount} selected)
        </p>
        <div className="space-y-2">
          {platformEntries.map((entry, index) => (
            <div
              key={entry.platform_id}
              className="border border-mid-grey/20 rounded-lg overflow-hidden"
            >
              {/* Platform row */}
              <div className="flex items-center gap-3 px-4 py-3">
                <input
                  type="checkbox"
                  checked={entry.selected}
                  onChange={(e) =>
                    updateEntry(index, { selected: e.target.checked })
                  }
                  className="h-4 w-4 rounded border-mid-grey/30 bg-charcoal text-coral focus:ring-coral/50"
                />
                <span className="text-sm text-off-white flex-1">
                  {entry.name}
                </span>

                {/* Per-platform datetime (when not using same time) */}
                {entry.selected && !sameTime && (
                  <input
                    type="datetime-local"
                    value={entry.scheduled_at}
                    onChange={(e) =>
                      updateEntry(index, { scheduled_at: e.target.value })
                    }
                    className="bg-charcoal border border-mid-grey/30 rounded-lg px-2 py-1 text-sm text-off-white focus:outline-none focus:ring-2 focus:ring-coral/50 focus:border-coral"
                  />
                )}

                {/* Expand toggle for content overrides */}
                {entry.selected && (
                  <button
                    type="button"
                    onClick={() =>
                      updateEntry(index, { expanded: !entry.expanded })
                    }
                    className="text-mid-grey hover:text-off-white transition-colors p-1"
                    aria-label={entry.expanded ? 'Collapse' : 'Expand'}
                  >
                    {entry.expanded ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </button>
                )}
              </div>

              {/* Expanded content overrides */}
              {entry.selected && entry.expanded && (
                <div className="px-4 pb-3 space-y-3 border-t border-mid-grey/10 pt-3">
                  <Input
                    label="Title Override"
                    placeholder="Custom title for this platform"
                    value={entry.platform_title}
                    onChange={(e) =>
                      updateEntry(index, {
                        platform_title: e.target.value,
                      })
                    }
                  />
                  <Textarea
                    label="Body Override"
                    placeholder="Custom content for this platform"
                    value={entry.platform_body}
                    onChange={(e) =>
                      updateEntry(index, {
                        platform_body: e.target.value,
                      })
                    }
                    rows={3}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
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
        <Button
          type="submit"
          size="sm"
          loading={isSubmitting}
          disabled={selectedCount === 0}
        >
          Schedule {selectedCount} Publication{selectedCount !== 1 ? 's' : ''}
        </Button>
      </div>
    </form>
  )
}
