'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { CalendarPlus, Layers, Send } from 'lucide-react'
import { PageHeader } from '@/components/ui/PageHeader'
import { EmptyState } from '@/components/ui/EmptyState'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { ScheduleForm } from '@/components/publications/ScheduleForm'
import { BulkScheduleForm } from '@/components/publications/BulkScheduleForm'
import { PublicationCard } from '@/components/publications/PublicationCard'
import {
  schedulePublication,
  bulkSchedulePublications,
} from '@/lib/actions/publications'
import type { Asset } from '@/types/database'
import type { PublicationWithDetails } from '@/lib/queries/publications'

interface PublicationsClientProps {
  asset: Asset
  publications: PublicationWithDetails[]
  assetOptions: { id: string; title: string }[]
  platformOptions: { id: string; name: string; slug: string }[]
}

export function PublicationsClient({
  asset,
  publications,
  assetOptions,
  platformOptions,
}: PublicationsClientProps) {
  const router = useRouter()
  const [scheduleOpen, setScheduleOpen] = useState(false)
  const [bulkOpen, setBulkOpen] = useState(false)

  const handleScheduleSubmit = useCallback(
    async (formData: FormData) => {
      const result = await schedulePublication(formData)
      if (result.success) {
        setScheduleOpen(false)
        router.refresh()
      } else {
        throw new Error(result.error ?? 'Failed to schedule publication')
      }
    },
    [router],
  )

  const handleBulkSubmit = useCallback(
    async (formData: FormData) => {
      const result = await bulkSchedulePublications(formData)
      if (result.success) {
        setBulkOpen(false)
        router.refresh()
      } else {
        throw new Error(result.error ?? 'Failed to bulk schedule')
      }
    },
    [router],
  )

  return (
    <>
      <PageHeader
        title="Publications"
        description={`Manage publication schedule for "${asset.title}"`}
        actions={
          <>
            <Button
              variant="outline"
              size="sm"
              icon={<Layers className="w-4 h-4" />}
              onClick={() => setBulkOpen(true)}
            >
              Bulk Schedule
            </Button>
            <Button
              size="sm"
              icon={<CalendarPlus className="w-4 h-4" />}
              onClick={() => setScheduleOpen(true)}
            >
              Schedule
            </Button>
          </>
        }
      />

      {/* Publication list */}
      {publications.length === 0 ? (
        <EmptyState
          icon={<Send className="w-12 h-12" />}
          title="No publications yet"
          description="Schedule this asset for publication on one or more platforms."
          action={
            <Button
              size="sm"
              icon={<CalendarPlus className="w-4 h-4" />}
              onClick={() => setScheduleOpen(true)}
            >
              Schedule Publication
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {publications.map((pub) => (
            <PublicationCard key={pub.id} publication={pub} />
          ))}
        </div>
      )}

      {/* Schedule modal */}
      <Modal
        open={scheduleOpen}
        onClose={() => setScheduleOpen(false)}
        title="Schedule Publication"
        size="lg"
      >
        <ScheduleForm
          mode="create"
          assets={assetOptions}
          platforms={platformOptions}
          onSubmit={handleScheduleSubmit}
          onClose={() => setScheduleOpen(false)}
        />
      </Modal>

      {/* Bulk schedule modal */}
      <Modal
        open={bulkOpen}
        onClose={() => setBulkOpen(false)}
        title="Bulk Schedule"
        size="xl"
      >
        <BulkScheduleForm
          assets={assetOptions}
          platforms={platformOptions}
          onSubmit={handleBulkSubmit}
          onClose={() => setBulkOpen(false)}
        />
      </Modal>
    </>
  )
}
