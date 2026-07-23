import { notFound } from 'next/navigation'
import Link from 'next/link'
import { PageHeader } from '@/components/ui/PageHeader'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { TranscriptViewer } from '@/components/transcripts/TranscriptViewer'
import { getTranscript } from '@/lib/queries/transcripts'

export const metadata = {
  title: 'Transcript — Roadman OS',
}

interface TranscriptDetailPageProps {
  params: { id: string }
}

function formatLabel(value: string): string {
  return value
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

function formatDuration(seconds: number | null): string {
  if (!seconds) return '—'
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) return `${h}h ${m}m ${s}s`
  return `${m}m ${s}s`
}

const HIGHLIGHT_COLOURS: Record<string, { bg: string; text: string; label: string }> = {
  quote: { bg: 'bg-blue-500/20', text: 'text-blue-400', label: 'Quote' },
  insight: { bg: 'bg-purple/20', text: 'text-purple', label: 'Insight' },
  action_item: { bg: 'bg-coral/20', text: 'text-coral', label: 'Action Item' },
  clip_worthy: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', label: 'Clip-Worthy' },
  fact: { bg: 'bg-amber-500/20', text: 'text-amber-400', label: 'Fact' },
}

export default async function TranscriptDetailPage({ params }: TranscriptDetailPageProps) {
  const transcript = await getTranscript(params.id)

  if (!transcript) {
    notFound()
  }

  const meta = (transcript.asset?.metadata ?? {}) as Record<string, unknown>
  const episodeNumber = meta.episode_number as string | undefined
  const guestName = meta.guest_name as string | undefined

  return (
    <div className="space-y-6">
      {/* Asset header */}
      <PageHeader
        title={transcript.asset?.title ?? 'Transcript'}
        actions={
          <div className="flex items-center gap-3">
            {transcript.asset && (
              <Link href={`/assets/${transcript.asset.id}`}>
                <Button variant="outline" size="sm">
                  View Asset
                </Button>
              </Link>
            )}
            <Link href="/transcripts">
              <Button variant="outline" size="sm">
                All Transcripts
              </Button>
            </Link>
          </div>
        }
      />

      {/* Episode info bar */}
      <div className="flex flex-wrap items-center gap-3">
        {transcript.asset?.type && (
          <Badge variant="default" size="md">
            {formatLabel(transcript.asset.type)}
          </Badge>
        )}
        {episodeNumber && (
          <span className="text-sm text-mid-grey">
            Episode {episodeNumber}
          </span>
        )}
        {guestName && (
          <span className="text-sm text-mid-grey">
            Guest: {guestName}
          </span>
        )}
        {transcript.word_count && (
          <span className="text-sm text-mid-grey">
            {transcript.word_count.toLocaleString()} words
          </span>
        )}
        {transcript.asset?.duration_seconds && (
          <span className="text-sm text-mid-grey">
            {formatDuration(transcript.asset.duration_seconds)}
          </span>
        )}
        {transcript.confidence !== null && transcript.confidence !== undefined && (
          <span className="text-sm text-mid-grey">
            Confidence: {Math.round(transcript.confidence * 100)}%
          </span>
        )}
      </div>

      {/* Two-column layout: transcript (70%) + sidebar (30%) */}
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
        {/* Transcript viewer */}
        <div className="lg:col-span-7 rounded-xl border border-mid-grey/20 bg-deep-purple/10 p-6">
          <TranscriptViewer
            transcript={transcript}
            highlights={transcript.highlights}
            transcriptId={transcript.id}
          />
        </div>

        {/* Sidebar — highlights list */}
        <div className="lg:col-span-3 space-y-4">
          <h3 className="font-heading text-sm uppercase text-mid-grey">
            Highlights ({transcript.highlights.length})
          </h3>

          {transcript.highlights.length === 0 ? (
            <div className="rounded-xl border border-mid-grey/20 bg-deep-purple/10 p-4">
              <p className="text-sm text-mid-grey">
                Select text in the transcript to create highlights.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {transcript.highlights.map((h) => {
                const typeInfo = HIGHLIGHT_COLOURS[h.label ?? ''] ?? {
                  bg: 'bg-mid-grey/20',
                  text: 'text-mid-grey',
                  label: h.label ?? 'Note',
                }

                return (
                  <div
                    key={h.id}
                    className="rounded-xl border border-mid-grey/20 bg-deep-purple/10 p-4"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${typeInfo.bg} ${typeInfo.text}`}>
                        {typeInfo.label}
                      </span>
                      <span className="text-xs text-mid-grey font-mono">
                        {formatTimestamp(h.start_ms)}
                      </span>
                    </div>
                    <p className="text-sm text-off-white/80 line-clamp-3">
                      &ldquo;{h.text}&rdquo;
                    </p>
                    {h.notes && (
                      <p className="text-xs text-mid-grey mt-2">{h.notes}</p>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

function formatTimestamp(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  return [
    hours.toString().padStart(2, '0'),
    minutes.toString().padStart(2, '0'),
    seconds.toString().padStart(2, '0'),
  ].join(':')
}
