import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/utils/auth'
import { semanticSearch } from '@/lib/search/semantic-search'
import type { Asset, Idea, Task, Campaign, Transcript } from '@/types/database'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type SearchMode = 'keyword' | 'semantic' | 'combined'

type SearchResultItem = {
  entity_type: string
  entity_id: string
  title: string
  description: string | null
  similarity?: number
  metadata?: Record<string, unknown>
}

// ---------------------------------------------------------------------------
// GET /api/search?q=...&type=...&pillar=...&limit=20&offset=0&mode=keyword
// ---------------------------------------------------------------------------

export async function GET(request: NextRequest) {
  try {
    await requireAuth()

    const url = new URL(request.url)
    const q = url.searchParams.get('q')?.trim()
    const entityType = url.searchParams.get('type')
    const pillar = url.searchParams.get('pillar')
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '20'), 100)
    const offset = parseInt(url.searchParams.get('offset') || '0')
    const mode = (url.searchParams.get('mode') || 'keyword') as SearchMode

    if (!q) {
      return NextResponse.json({ error: 'Query parameter "q" is required' }, { status: 400 })
    }

    let results: SearchResultItem[] = []

    if (mode === 'keyword' || mode === 'combined') {
      const keywordResults = await keywordSearch(q, entityType, pillar, limit + offset)
      results.push(...keywordResults)
    }

    if (mode === 'semantic' || mode === 'combined') {
      const entityTypes = entityType ? [entityType] : undefined
      const semanticResults = await semanticSearch(q, limit + offset, entityTypes)

      const mapped: SearchResultItem[] = semanticResults.map((r) => ({
        entity_type: r.entity_type,
        entity_id: r.entity_id,
        title: r.chunk_text.slice(0, 100),
        description: r.chunk_text,
        similarity: r.similarity,
        metadata: r.metadata,
      }))

      results.push(...mapped)
    }

    // Deduplicate by entity_type + entity_id (keep highest similarity)
    if (mode === 'combined') {
      const seen = new Map<string, SearchResultItem>()
      for (const item of results) {
        const key = `${item.entity_type}:${item.entity_id}`
        const existing = seen.get(key)
        if (!existing || (item.similarity ?? 0) > (existing.similarity ?? 0)) {
          seen.set(key, item)
        }
      }
      results = Array.from(seen.values())
    }

    // Sort: items with similarity score first, then by title
    results.sort((a, b) => {
      if (a.similarity && b.similarity) return b.similarity - a.similarity
      if (a.similarity) return -1
      if (b.similarity) return 1
      return a.title.localeCompare(b.title)
    })

    // Apply pagination
    const paginated = results.slice(offset, offset + limit)
    const total = results.length

    return NextResponse.json({
      results: paginated,
      total,
      limit,
      offset,
      mode,
    })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unexpected error' },
      { status: 500 },
    )
  }
}

// ---------------------------------------------------------------------------
// Keyword search across multiple tables
// ---------------------------------------------------------------------------

async function keywordSearch(
  query: string,
  entityType: string | null,
  pillar: string | null,
  limit: number,
): Promise<SearchResultItem[]> {
  const supabase = await createClient()
  const results: SearchResultItem[] = []
  const pattern = `%${query}%`

  const shouldSearch = (type: string) => !entityType || entityType === type

  // Assets
  if (shouldSearch('asset')) {
    let assetQuery = supabase
      .from('assets')
      .select('id, title, description, type, pillar, status')
      .neq('status', 'archived')
      .or(`title.ilike.${pattern},description.ilike.${pattern}`)
      .order('updated_at', { ascending: false })
      .limit(limit)

    if (pillar) {
      assetQuery = assetQuery.eq('pillar', pillar)
    }

    const { data: assets } = await assetQuery

    if (assets) {
      for (const a of assets as Asset[]) {
        results.push({
          entity_type: 'asset',
          entity_id: a.id,
          title: a.title,
          description: a.description,
          metadata: { type: a.type, pillar: a.pillar, status: a.status },
        })
      }
    }
  }

  // Ideas
  if (shouldSearch('idea')) {
    let ideaQuery = supabase
      .from('ideas')
      .select('id, title, description, pillar, status')
      .neq('status', 'discarded')
      .or(`title.ilike.${pattern},description.ilike.${pattern}`)
      .order('updated_at', { ascending: false })
      .limit(limit)

    if (pillar) {
      ideaQuery = ideaQuery.eq('pillar', pillar)
    }

    const { data: ideas } = await ideaQuery

    if (ideas) {
      for (const i of ideas as Idea[]) {
        results.push({
          entity_type: 'idea',
          entity_id: i.id,
          title: i.title,
          description: i.description,
          metadata: { pillar: i.pillar, status: i.status },
        })
      }
    }
  }

  // Campaigns
  if (shouldSearch('campaign')) {
    const { data: campaigns } = await supabase
      .from('campaigns')
      .select('id, title, description, type, status')
      .neq('status', 'cancelled')
      .or(`title.ilike.${pattern},description.ilike.${pattern}`)
      .order('updated_at', { ascending: false })
      .limit(limit)

    if (campaigns) {
      for (const c of campaigns as Campaign[]) {
        results.push({
          entity_type: 'campaign',
          entity_id: c.id,
          title: c.title,
          description: c.description,
          metadata: { type: c.type, status: c.status },
        })
      }
    }
  }

  // Transcripts
  if (shouldSearch('transcript')) {
    const { data: transcripts } = await supabase
      .from('transcripts')
      .select('id, asset_id, full_text, language')
      .ilike('full_text', pattern)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (transcripts) {
      for (const t of transcripts as Transcript[]) {
        const snippet = t.full_text.slice(0, 200)
        results.push({
          entity_type: 'transcript',
          entity_id: t.id,
          title: `Transcript (${t.language})`,
          description: snippet,
          metadata: { asset_id: t.asset_id },
        })
      }
    }
  }

  // Tasks
  if (shouldSearch('task')) {
    const { data: tasks } = await supabase
      .from('tasks')
      .select('id, title, description, status, priority')
      .neq('status', 'done')
      .or(`title.ilike.${pattern},description.ilike.${pattern}`)
      .order('updated_at', { ascending: false })
      .limit(limit)

    if (tasks) {
      for (const t of tasks as Task[]) {
        results.push({
          entity_type: 'task',
          entity_id: t.id,
          title: t.title,
          description: t.description,
          metadata: { status: t.status, priority: t.priority },
        })
      }
    }
  }

  return results
}
