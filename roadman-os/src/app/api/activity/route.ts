import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAuth } from '@/lib/utils/auth'
import { getActivityFeed } from '@/lib/queries/activity'
import type { ActivityAction } from '@/types/database'

const querySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  per_page: z.coerce.number().int().min(1).max(100).default(20),
  entity_type: z.string().optional(),
  action: z.string().optional(),
  actor_id: z.string().uuid().optional(),
  date_from: z.string().optional(),
  date_to: z.string().optional(),
})

export async function GET(request: NextRequest) {
  try {
    await requireAuth()

    const { searchParams } = new URL(request.url)
    const parsed = querySchema.safeParse(Object.fromEntries(searchParams))

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: parsed.error.flatten() },
        { status: 400 },
      )
    }

    const { page, per_page, entity_type, action, actor_id, date_from, date_to } = parsed.data

    const { entries, total } = await getActivityFeed(
      {
        entity_type,
        action: action as ActivityAction | undefined,
        actor_id,
        date_from,
        date_to,
      },
      page,
      per_page,
    )

    return NextResponse.json({
      entries,
      total,
      page,
      per_page,
      total_pages: Math.ceil(total / per_page),
    })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'An unexpected error occurred' },
      { status: 500 },
    )
  }
}
