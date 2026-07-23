'use client'

import { useState, useCallback } from 'react'
import { PageHeader } from '@/components/ui/PageHeader'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import {
  YOUTUBE_CHANNELS,
  type YouTubeVideoPreview,
  type DateRange,
} from '@/lib/import/youtube-import'

// ==========================================================================
// Step types
// ==========================================================================

type WizardStep = 'channels' | 'dates' | 'preview' | 'progress'

type ImportResult = {
  imported: number
  skipped: number
  errors: string[]
}

// ==========================================================================
// Component
// ==========================================================================

export default function YouTubeImportPage() {
  const [step, setStep] = useState<WizardStep>('channels')
  const [selectedChannels, setSelectedChannels] = useState<string[]>([])
  const [dateRange, setDateRange] = useState<DateRange>({
    start: null,
    end: null,
  })
  const [videos, setVideos] = useState<YouTubeVideoPreview[]>([])
  const [loading, setLoading] = useState(false)
  const [jobId, setJobId] = useState<string | null>(null)
  const [progress, setProgress] = useState<{
    current: number
    total: number
    currentTitle: string
    status: string
  }>({ current: 0, total: 0, currentTitle: '', status: 'pending' })
  const [result, setResult] = useState<ImportResult | null>(null)

  // ---------- Channel selection ----------

  const toggleChannel = (slug: string) => {
    setSelectedChannels((prev) =>
      prev.includes(slug)
        ? prev.filter((s) => s !== slug)
        : [...prev, slug],
    )
  }

  // ---------- Preview fetch ----------

  const fetchPreviews = useCallback(async () => {
    setLoading(true)
    try {
      // In production this would call the YouTube API via a server endpoint.
      // For now we show an empty preview — the stub returns [].
      const allVideos: YouTubeVideoPreview[] = []

      for (const channelSlug of selectedChannels) {
        const res = await fetch('/api/import/youtube/preview', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            channelSlug,
            dateRange,
          }),
        })

        if (res.ok) {
          const data = await res.json()
          if (Array.isArray(data.videos)) {
            allVideos.push(...data.videos)
          }
        }
      }

      setVideos(
        allVideos.map((v) => ({ ...v, selected: true })),
      )
    } finally {
      setLoading(false)
    }
  }, [selectedChannels, dateRange])

  // ---------- Import execution ----------

  const startImport = async () => {
    const selectedVideos = videos.filter((v) => v.selected)
    if (selectedVideos.length === 0) return

    setStep('progress')
    setLoading(true)

    try {
      const res = await fetch('/api/import/youtube', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channelSlug: selectedChannels[0],
          videos: selectedVideos,
        }),
      })

      if (!res.ok) {
        setResult({ imported: 0, skipped: 0, errors: ['Failed to start import'] })
        return
      }

      const { jobId: newJobId } = await res.json()
      setJobId(newJobId)

      // Poll for progress
      await pollProgress(newJobId)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Import failed'
      setResult({ imported: 0, skipped: 0, errors: [msg] })
    } finally {
      setLoading(false)
    }
  }

  const pollProgress = async (id: string) => {
    const maxPolls = 300 // 5 minutes at 1s intervals
    for (let i = 0; i < maxPolls; i++) {
      await new Promise((r) => setTimeout(r, 1000))

      try {
        const res = await fetch(`/api/import/status/${id}`)
        if (!res.ok) continue

        const job = await res.json()
        const meta = job.metadata as Record<string, unknown> ?? {}

        setProgress({
          current: (meta.current as number) ?? 0,
          total: (meta.total as number) ?? 0,
          currentTitle: (meta.currentTitle as string) ?? '',
          status: job.status,
        })

        if (job.status === 'completed' || job.status === 'failed') {
          setResult({
            imported: (meta.imported as number) ?? job.records_synced ?? 0,
            skipped: (meta.skipped as number) ?? 0,
            errors: job.error_message ? [job.error_message] : [],
          })
          return
        }
      } catch {
        // Continue polling
      }
    }
  }

  // ---------- Video toggle helpers ----------

  const toggleVideo = (videoId: string) => {
    setVideos((prev) =>
      prev.map((v) =>
        v.videoId === videoId ? { ...v, selected: !v.selected } : v,
      ),
    )
  }

  const selectAll = () =>
    setVideos((prev) => prev.map((v) => ({ ...v, selected: true })))

  const deselectAll = () =>
    setVideos((prev) => prev.map((v) => ({ ...v, selected: false })))

  // ---------- Render ----------

  return (
    <div>
      <PageHeader
        title="YouTube Import"
        description="Bulk import videos from your YouTube channels into Roadman OS."
      />

      {/* Step indicators */}
      <div className="flex items-center gap-2 mb-8">
        {(['channels', 'dates', 'preview', 'progress'] as WizardStep[]).map(
          (s, i) => (
            <div key={s} className="flex items-center gap-2">
              {i > 0 && (
                <div className="w-8 h-px bg-mid-grey/30" />
              )}
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                  step === s
                    ? 'bg-coral text-white'
                    : (['channels', 'dates', 'preview', 'progress'].indexOf(step) > i)
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-mid-grey/20 text-mid-grey'
                }`}
              >
                {i + 1}
              </div>
              <span
                className={`text-sm ${
                  step === s ? 'text-off-white' : 'text-mid-grey'
                }`}
              >
                {s === 'channels'
                  ? 'Channels'
                  : s === 'dates'
                    ? 'Date Range'
                    : s === 'preview'
                      ? 'Preview'
                      : 'Import'}
              </span>
            </div>
          ),
        )}
      </div>

      {/* Step 1: Channel selection */}
      {step === 'channels' && (
        <div className="space-y-4">
          <h2 className="text-lg font-medium text-off-white">
            Select channels to import from
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {YOUTUBE_CHANNELS.map((channel) => (
              <button
                key={channel.slug}
                type="button"
                onClick={() => toggleChannel(channel.slug)}
                className={`rounded-xl border p-5 text-left transition-colors ${
                  selectedChannels.includes(channel.slug)
                    ? 'border-coral bg-coral/10'
                    : 'border-mid-grey/20 bg-charcoal/50 hover:border-mid-grey/40'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                      selectedChannels.includes(channel.slug)
                        ? 'border-coral bg-coral'
                        : 'border-mid-grey/40'
                    }`}
                  >
                    {selectedChannels.includes(channel.slug) && (
                      <svg
                        className="w-3 h-3 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={3}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium text-off-white">
                      {channel.name}
                    </h3>
                    <p className="text-sm text-mid-grey mt-0.5">
                      Default type:{' '}
                      <Badge variant="default" size="sm">
                        {channel.defaultAssetType}
                      </Badge>
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
          <div className="flex justify-end pt-4">
            <Button
              disabled={selectedChannels.length === 0}
              onClick={() => setStep('dates')}
            >
              Next: Date Range
            </Button>
          </div>
        </div>
      )}

      {/* Step 2: Date range */}
      {step === 'dates' && (
        <div className="space-y-4">
          <h2 className="text-lg font-medium text-off-white">
            Select date range
          </h2>
          <p className="text-sm text-mid-grey">
            Leave blank to import all-time.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-lg">
            <div>
              <label
                htmlFor="start-date"
                className="block text-sm font-medium text-off-white mb-1"
              >
                Start date
              </label>
              <input
                id="start-date"
                type="date"
                value={dateRange.start ?? ''}
                onChange={(e) =>
                  setDateRange((prev) => ({
                    ...prev,
                    start: e.target.value || null,
                  }))
                }
                className="w-full rounded-lg border border-mid-grey/20 bg-charcoal px-3 py-2 text-off-white text-sm focus:outline-none focus:ring-2 focus:ring-coral/50"
              />
            </div>
            <div>
              <label
                htmlFor="end-date"
                className="block text-sm font-medium text-off-white mb-1"
              >
                End date
              </label>
              <input
                id="end-date"
                type="date"
                value={dateRange.end ?? ''}
                onChange={(e) =>
                  setDateRange((prev) => ({
                    ...prev,
                    end: e.target.value || null,
                  }))
                }
                className="w-full rounded-lg border border-mid-grey/20 bg-charcoal px-3 py-2 text-off-white text-sm focus:outline-none focus:ring-2 focus:ring-coral/50"
              />
            </div>
          </div>
          <div className="flex gap-3 justify-end pt-4">
            <Button variant="ghost" onClick={() => setStep('channels')}>
              Back
            </Button>
            <Button
              loading={loading}
              onClick={async () => {
                await fetchPreviews()
                setStep('preview')
              }}
            >
              Fetch Videos
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Preview table */}
      {step === 'preview' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-off-white">
              Preview &mdash; {videos.length} videos found
            </h2>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={selectAll}>
                Select All
              </Button>
              <Button variant="ghost" size="sm" onClick={deselectAll}>
                Deselect All
              </Button>
            </div>
          </div>

          {videos.length === 0 ? (
            <div className="rounded-xl border border-mid-grey/20 bg-charcoal/50 p-8 text-center">
              <p className="text-mid-grey">
                No videos found for the selected channels and date range.
              </p>
              <p className="text-sm text-mid-grey/60 mt-2">
                This may be because the YouTube API connection is not yet configured,
                or because the stub is returning empty results.
              </p>
            </div>
          ) : (
            <div className="rounded-xl border border-mid-grey/20 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-charcoal border-b border-mid-grey/20">
                  <tr>
                    <th className="py-3 px-4 text-left text-mid-grey font-medium w-10">
                      <span className="sr-only">Select</span>
                    </th>
                    <th className="py-3 px-4 text-left text-mid-grey font-medium">
                      Title
                    </th>
                    <th className="py-3 px-4 text-left text-mid-grey font-medium">
                      Date
                    </th>
                    <th className="py-3 px-4 text-right text-mid-grey font-medium">
                      Views
                    </th>
                    <th className="py-3 px-4 text-right text-mid-grey font-medium">
                      Duration
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-mid-grey/10">
                  {videos.map((video) => (
                    <tr
                      key={video.videoId}
                      className={`transition-colors ${
                        video.selected
                          ? 'bg-coral/5'
                          : 'bg-charcoal/30 opacity-60'
                      }`}
                    >
                      <td className="py-3 px-4">
                        <input
                          type="checkbox"
                          checked={video.selected}
                          onChange={() => toggleVideo(video.videoId)}
                          className="rounded border-mid-grey/30 bg-charcoal text-coral focus:ring-coral"
                        />
                      </td>
                      <td className="py-3 px-4 text-off-white">
                        {video.title}
                      </td>
                      <td className="py-3 px-4 text-mid-grey">
                        {new Date(video.publishedAt).toLocaleDateString(
                          'en-GB',
                        )}
                      </td>
                      <td className="py-3 px-4 text-right text-mid-grey">
                        {video.views.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right text-mid-grey">
                        {video.duration}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="flex gap-3 justify-end pt-4">
            <Button variant="ghost" onClick={() => setStep('dates')}>
              Back
            </Button>
            <Button
              disabled={videos.filter((v) => v.selected).length === 0}
              onClick={startImport}
            >
              Import {videos.filter((v) => v.selected).length} Videos
            </Button>
          </div>
        </div>
      )}

      {/* Step 4: Progress */}
      {step === 'progress' && (
        <div className="space-y-6">
          <h2 className="text-lg font-medium text-off-white">
            {result ? 'Import Complete' : 'Importing Videos...'}
          </h2>

          {/* Progress bar */}
          {!result && progress.total > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-mid-grey">
                <span>
                  Processing {progress.current} of {progress.total}
                </span>
                <span>
                  {Math.round(
                    (progress.current / progress.total) * 100,
                  )}
                  %
                </span>
              </div>
              <div className="h-2 rounded-full bg-mid-grey/20 overflow-hidden">
                <div
                  className="h-full rounded-full bg-coral transition-all duration-300"
                  style={{
                    width: `${(progress.current / progress.total) * 100}%`,
                  }}
                />
              </div>
              <p className="text-sm text-mid-grey truncate">
                {progress.currentTitle}
              </p>
            </div>
          )}

          {/* Loading state when no progress yet */}
          {!result && progress.total === 0 && (
            <div className="flex items-center gap-3 text-mid-grey">
              <svg
                className="w-5 h-5 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              <span>Starting import...</span>
            </div>
          )}

          {/* Results */}
          {result && (
            <div className="rounded-xl border border-mid-grey/20 bg-charcoal/50 p-6 space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-emerald-400">
                    {result.imported}
                  </p>
                  <p className="text-sm text-mid-grey">Imported</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-amber-400">
                    {result.skipped}
                  </p>
                  <p className="text-sm text-mid-grey">Skipped (duplicates)</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-400">
                    {result.errors.length}
                  </p>
                  <p className="text-sm text-mid-grey">Errors</p>
                </div>
              </div>

              {result.errors.length > 0 && (
                <div className="mt-4 space-y-1">
                  <h3 className="text-sm font-medium text-red-400">
                    Errors:
                  </h3>
                  {result.errors.map((err, i) => (
                    <p key={i} className="text-sm text-mid-grey">
                      {err}
                    </p>
                  ))}
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <Button
                  variant="ghost"
                  onClick={() => {
                    setStep('channels')
                    setVideos([])
                    setResult(null)
                    setJobId(null)
                    setProgress({
                      current: 0,
                      total: 0,
                      currentTitle: '',
                      status: 'pending',
                    })
                  }}
                >
                  Import More
                </Button>
                <Button
                  variant="outline"
                  onClick={() => (window.location.href = '/assets')}
                >
                  View Assets
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
