import {
  startOfMonth,
  endOfMonth,
  subWeeks,
  addWeeks,
  format,
} from 'date-fns'

export const metadata = {
  title: 'Calendar — Roadman OS',
}

import { requireAuth } from '@/lib/utils/auth'
import { getPublicationsForDateRange } from '@/lib/queries/publications'
import { getActivePlatforms } from '@/lib/queries/platforms'
import { PageHeader } from '@/components/ui/PageHeader'
import { PublicationCalendar } from '@/components/calendar/PublicationCalendar'

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function CalendarPage() {
  await requireAuth()

  // Fetch a broad range: 1 week before and 5 weeks after today.
  // This covers both week and month views without needing re-fetch
  // when the user navigates within the current month.
  const now = new Date()
  const rangeStart = format(
    startOfMonth(subWeeks(now, 1)),
    "yyyy-MM-dd'T'00:00:00",
  )
  const rangeEnd = format(
    endOfMonth(addWeeks(now, 5)),
    "yyyy-MM-dd'T'23:59:59",
  )

  const [publications, platforms] = await Promise.all([
    getPublicationsForDateRange(rangeStart, rangeEnd),
    getActivePlatforms(),
  ])

  return (
    <div>
      <PageHeader title="Calendar" />
      <PublicationCalendar publications={publications} platforms={platforms} />
    </div>
  )
}
