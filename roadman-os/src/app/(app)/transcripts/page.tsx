import Link from 'next/link'
import { PageHeader } from '@/components/ui/PageHeader'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { getTranscriptsWithAssets } from '@/lib/queries/transcripts'

export const metadata = {
  title: 'Transcripts — Roadman OS',
}

interface TranscriptsPageProps {
  searchParams: {
    search?: string
  }
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
  if (h > 0) return `${h}h ${m}m`
  return `${m}m ${s}s`
}

export default async function TranscriptsPage({ searchParams }: TranscriptsPageProps) {
  const transcripts = await getTranscriptsWithAssets(searchParams.search)

  return (
    <div className="space-y-8">
      <PageHeader
        title="Transcripts"
        description="Browse episode transcripts, search content, and manage highlights"
      />

      {/* Search bar */}
      <form method="get" action="/transcripts" className="flex gap-3">
        <input
          type="text"
          name="search"
          defaultValue={searchParams.search ?? ''}
          placeholder="Search transcripts by title or content..."
          className="flex-1 bg-deep-purple/20 border border-mid-grey/20 rounded-lg px-4 py-2 text-sm text-off-white placeholder:text-mid-grey/50 focus:outline-none focus:border-coral/50"
        />
        <button
          type="submit"
          className="bg-coral hover:bg-coral/90 text-off-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          Search
        </button>
        {searchParams.search && (
          <Link
            href="/transcripts"
            className="bg-deep-purple/20 text-mid-grey hover:text-off-white text-sm px-4 py-2 rounded-lg transition-colors"
          >
            Clear
          </Link>
        )}
      </form>

      {/* Transcript list */}
      {transcripts.length === 0 ? (
        <EmptyState
          title={searchParams.search ? 'No matching transcripts' : 'No transcripts yet'}
          description={
            searchParams.search
              ? 'Try a different search term.'
              : 'Transcripts will appear here once episodes are transcribed.'
          }
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-mid-grey/20 text-left">
                <th className="pb-3 font-medium text-mid-grey">Episode</th>
                <th className="pb-3 font-medium text-mid-grey">Type</th>
                <th className="pb-3 font-medium text-mid-grey text-right">Words</th>
                <th className="pb-3 font-medium text-mid-grey text-right">Duration</th>
                <th className="pb-3 font-medium text-mid-grey text-right">Highlights</th>
                <th className="pb-3 font-medium text-mid-grey">Language</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-mid-grey/10">
              {transcripts.map((t) => (
                <tr key={t.id} className="group">
                  <td className="py-3 pr-4">
                    <Link
                      href={`/transcripts/${t.id}`}
                      className="text-off-white hover:text-coral transition-colors"
                    >
                      {t.asset?.title ?? 'Untitled'}
                    </Link>
                    {t.asset?.publish_date && (
                      <p className="text-xs text-mid-grey mt-0.5">
                        Published: {t.asset.publish_date}
                      </p>
                    )}
                  </td>
                  <td className="py-3 pr-4">
                    {t.asset?.type && (
                      <Badge variant="default" size="sm">
                        {formatLabel(t.asset.type)}
                      </Badge>
                    )}
                  </td>
                  <td className="py-3 text-right text-off-white">
                    {t.word_count?.toLocaleString() ?? '—'}
                  </td>
                  <td className="py-3 text-right text-mid-grey">
                    {formatDuration(t.asset?.duration_seconds ?? null)}
                  </td>
                  <td className="py-3 text-right">
                    {t.highlightCount > 0 ? (
                      <Badge variant="coral" size="sm">
                        {t.highlightCount}
                      </Badge>
                    ) : (
                      <span className="text-mid-grey">0</span>
                    )}
                  </td>
                  <td className="py-3 text-mid-grey uppercase text-xs">
                    {t.language}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
