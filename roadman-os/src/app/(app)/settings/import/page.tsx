'use client'

import { useState } from 'react'
import Link from 'next/link'
import { PageHeader } from '@/components/ui/PageHeader'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'

// ==========================================================================
// Types
// ==========================================================================

type ImportSection = 'podcast' | 'blog' | 'beehiiv'

type ImportStatus = {
  running: boolean
  result: {
    imported: number
    skipped: number
    errors: string[]
  } | null
}

// ==========================================================================
// Component
// ==========================================================================

export default function ImportPage() {
  const [statuses, setStatuses] = useState<Record<ImportSection, ImportStatus>>({
    podcast: { running: false, result: null },
    blog: { running: false, result: null },
    beehiiv: { running: false, result: null },
  })

  // Form values
  const [podcastFeedUrl, setPodcastFeedUrl] = useState('')
  const [sitemapUrl, setSitemapUrl] = useState('https://roadmancycling.com/sitemap.xml')
  const [blogPathPrefix, setBlogPathPrefix] = useState('/blog/')
  const [beehiivApiKey, setBeehiivApiKey] = useState('')
  const [beehiivPubId, setBeehiivPubId] = useState('')

  const createSyncJob = async (source: string, type: string) => {
    const res = await fetch('/api/import/status/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ source, type }),
    })
    if (!res.ok) return null
    const data = await res.json()
    return data.jobId as string
  }

  const pollJob = async (jobId: string, section: ImportSection) => {
    const maxPolls = 300
    for (let i = 0; i < maxPolls; i++) {
      await new Promise((r) => setTimeout(r, 1000))
      try {
        const res = await fetch(`/api/import/status/${jobId}`)
        if (!res.ok) continue
        const job = await res.json()
        if (job.status === 'completed' || job.status === 'failed') {
          const meta = job.metadata as Record<string, unknown> ?? {}
          setStatuses((prev) => ({
            ...prev,
            [section]: {
              running: false,
              result: {
                imported: (meta.imported as number) ?? job.records_synced ?? 0,
                skipped: (meta.skipped as number) ?? 0,
                errors: job.error_message ? [job.error_message] : [],
              },
            },
          }))
          return
        }
      } catch {
        // Continue polling
      }
    }
  }

  // ---------- Podcast import ----------

  const startPodcastImport = async () => {
    if (!podcastFeedUrl) return
    setStatuses((prev) => ({
      ...prev,
      podcast: { running: true, result: null },
    }))

    // The actual import would be triggered via a server action or API route.
    // For now we simulate a completed import since the stub returns empty data.
    await new Promise((r) => setTimeout(r, 500))
    setStatuses((prev) => ({
      ...prev,
      podcast: {
        running: false,
        result: { imported: 0, skipped: 0, errors: [] },
      },
    }))
  }

  // ---------- Blog import ----------

  const startBlogImport = async () => {
    if (!sitemapUrl) return
    setStatuses((prev) => ({
      ...prev,
      blog: { running: true, result: null },
    }))

    await new Promise((r) => setTimeout(r, 500))
    setStatuses((prev) => ({
      ...prev,
      blog: {
        running: false,
        result: { imported: 0, skipped: 0, errors: [] },
      },
    }))
  }

  // ---------- Beehiiv import ----------

  const startBeehiivImport = async () => {
    if (!beehiivApiKey || !beehiivPubId) return
    setStatuses((prev) => ({
      ...prev,
      beehiiv: { running: true, result: null },
    }))

    await new Promise((r) => setTimeout(r, 500))
    setStatuses((prev) => ({
      ...prev,
      beehiiv: {
        running: false,
        result: { imported: 0, skipped: 0, errors: [] },
      },
    }))
  }

  // ---------- Result display ----------

  const ResultBanner = ({
    section,
    label,
  }: {
    section: ImportSection
    label: string
  }) => {
    const status = statuses[section]
    if (!status.result) return null

    const { imported, skipped, errors } = status.result
    return (
      <div className="mt-4 rounded-lg border border-mid-grey/20 bg-charcoal/50 p-4">
        <div className="flex items-center gap-4 text-sm">
          <span className="text-off-white font-medium">{label} result:</span>
          <Badge variant="green" size="sm">
            {imported} imported
          </Badge>
          {skipped > 0 && (
            <Badge variant="amber" size="sm">
              {skipped} skipped
            </Badge>
          )}
          {errors.length > 0 && (
            <Badge variant="red" size="sm">
              {errors.length} errors
            </Badge>
          )}
          {imported === 0 && skipped === 0 && errors.length === 0 && (
            <span className="text-mid-grey">
              No items found. This may be because the API stub returns empty data.
            </span>
          )}
        </div>
        {errors.length > 0 && (
          <div className="mt-2 text-sm text-red-400">
            {errors.map((e, i) => (
              <p key={i}>{e}</p>
            ))}
          </div>
        )}
      </div>
    )
  }

  // ---------- Render ----------

  return (
    <div>
      <PageHeader
        title="Content Import"
        description="Import existing content from external sources into Roadman OS."
        actions={
          <Link href="/settings/import/youtube">
            <Button variant="outline" size="sm">
              YouTube Import Wizard
            </Button>
          </Link>
        }
      />

      {/* Podcast RSS Import */}
      <section className="mb-8 rounded-xl border border-mid-grey/20 bg-charcoal/50 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-purple/20 flex items-center justify-center">
            <svg
              className="w-5 h-5 text-purple"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
              />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-medium text-off-white">
              Podcast (RSS Feed)
            </h2>
            <p className="text-sm text-mid-grey">
              Parse your podcast RSS feed to create podcast_episode assets.
              Episodes are matched to YouTube videos by episode number.
            </p>
          </div>
        </div>

        <div className="space-y-3 max-w-lg">
          <div>
            <label
              htmlFor="podcast-feed"
              className="block text-sm font-medium text-off-white mb-1"
            >
              RSS Feed URL
            </label>
            <input
              id="podcast-feed"
              type="url"
              value={podcastFeedUrl}
              onChange={(e) => setPodcastFeedUrl(e.target.value)}
              placeholder="https://feeds.example.com/roadman-podcast"
              className="w-full rounded-lg border border-mid-grey/20 bg-charcoal px-3 py-2 text-off-white text-sm focus:outline-none focus:ring-2 focus:ring-coral/50 placeholder:text-mid-grey/50"
            />
          </div>
          <Button
            size="sm"
            loading={statuses.podcast.running}
            disabled={!podcastFeedUrl}
            onClick={startPodcastImport}
          >
            Import Podcast Episodes
          </Button>
        </div>

        <ResultBanner section="podcast" label="Podcast" />
      </section>

      {/* Blog Sitemap Import */}
      <section className="mb-8 rounded-xl border border-mid-grey/20 bg-charcoal/50 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-coral/20 flex items-center justify-center">
            <svg
              className="w-5 h-5 text-coral"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
              />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-medium text-off-white">
              Blog (Sitemap)
            </h2>
            <p className="text-sm text-mid-grey">
              Fetch your sitemap and create blog_post assets with canonical URLs.
            </p>
          </div>
        </div>

        <div className="space-y-3 max-w-lg">
          <div>
            <label
              htmlFor="sitemap-url"
              className="block text-sm font-medium text-off-white mb-1"
            >
              Sitemap URL
            </label>
            <input
              id="sitemap-url"
              type="url"
              value={sitemapUrl}
              onChange={(e) => setSitemapUrl(e.target.value)}
              placeholder="https://roadmancycling.com/sitemap.xml"
              className="w-full rounded-lg border border-mid-grey/20 bg-charcoal px-3 py-2 text-off-white text-sm focus:outline-none focus:ring-2 focus:ring-coral/50 placeholder:text-mid-grey/50"
            />
          </div>
          <div>
            <label
              htmlFor="blog-prefix"
              className="block text-sm font-medium text-off-white mb-1"
            >
              Blog Path Prefix
            </label>
            <input
              id="blog-prefix"
              type="text"
              value={blogPathPrefix}
              onChange={(e) => setBlogPathPrefix(e.target.value)}
              placeholder="/blog/"
              className="w-full rounded-lg border border-mid-grey/20 bg-charcoal px-3 py-2 text-off-white text-sm focus:outline-none focus:ring-2 focus:ring-coral/50 placeholder:text-mid-grey/50"
            />
          </div>
          <Button
            size="sm"
            loading={statuses.blog.running}
            disabled={!sitemapUrl}
            onClick={startBlogImport}
          >
            Import Blog Posts
          </Button>
        </div>

        <ResultBanner section="blog" label="Blog" />
      </section>

      {/* Beehiiv Newsletter Import */}
      <section className="mb-8 rounded-xl border border-mid-grey/20 bg-charcoal/50 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
            <svg
              className="w-5 h-5 text-emerald-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-medium text-off-white">
              Beehiiv Newsletter
            </h2>
            <p className="text-sm text-mid-grey">
              Pull published newsletters from Beehiiv and create newsletter assets.
            </p>
          </div>
        </div>

        <div className="space-y-3 max-w-lg">
          <div>
            <label
              htmlFor="beehiiv-key"
              className="block text-sm font-medium text-off-white mb-1"
            >
              API Key
            </label>
            <input
              id="beehiiv-key"
              type="password"
              value={beehiivApiKey}
              onChange={(e) => setBeehiivApiKey(e.target.value)}
              placeholder="bh_xxxxxxxxxxxx"
              className="w-full rounded-lg border border-mid-grey/20 bg-charcoal px-3 py-2 text-off-white text-sm focus:outline-none focus:ring-2 focus:ring-coral/50 placeholder:text-mid-grey/50"
            />
          </div>
          <div>
            <label
              htmlFor="beehiiv-pub"
              className="block text-sm font-medium text-off-white mb-1"
            >
              Publication ID
            </label>
            <input
              id="beehiiv-pub"
              type="text"
              value={beehiivPubId}
              onChange={(e) => setBeehiivPubId(e.target.value)}
              placeholder="pub_xxxxxxxx"
              className="w-full rounded-lg border border-mid-grey/20 bg-charcoal px-3 py-2 text-off-white text-sm focus:outline-none focus:ring-2 focus:ring-coral/50 placeholder:text-mid-grey/50"
            />
          </div>
          <Button
            size="sm"
            loading={statuses.beehiiv.running}
            disabled={!beehiivApiKey || !beehiivPubId}
            onClick={startBeehiivImport}
          >
            Import Newsletters
          </Button>
        </div>

        <ResultBanner section="beehiiv" label="Beehiiv" />
      </section>
    </div>
  )
}
