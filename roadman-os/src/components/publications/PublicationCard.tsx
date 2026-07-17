'use client'

import { useState, useCallback } from 'react'
import { format, parseISO } from 'date-fns'
import { CheckCircle2, XCircle, Calendar, Clock } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { markPublished, cancelPublication } from '@/lib/actions/publications'
import type { PublicationWithDetails } from '@/lib/queries/publications'

// ---------------------------------------------------------------------------
// Status badge variant mapping
// ---------------------------------------------------------------------------
const STATUS_VARIANTS: Record<string, 'grey' | 'blue' | 'green' | 'red'> = {
  draft: 'grey',
  scheduled: 'blue',
  published: 'green',
  failed: 'red',
  removed: 'grey',
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
interface PublicationCardProps {
  publication: PublicationWithDetails
}

export function PublicationCard({ publication }: PublicationCardProps) {
  const [isPublishing, setIsPublishing] = useState(false)
  const [isCancelling, setIsCancelling] = useState(false)
  const [confirmPublish, setConfirmPublish] = useState(false)
  const [confirmCancel, setConfirmCancel] = useState(false)

  const handleMarkPublished = useCallback(async () => {
    setIsPublishing(true)
    await markPublished(publication.id)
    setIsPublishing(false)
    setConfirmPublish(false)
  }, [publication.id])

  const handleCancel = useCallback(async () => {
    setIsCancelling(true)
    await cancelPublication(publication.id)
    setIsCancelling(false)
    setConfirmCancel(false)
  }, [publication.id])

  const statusLabel =
    publication.status.charAt(0).toUpperCase() + publication.status.slice(1)

  const canMarkPublished =
    publication.status === 'draft' || publication.status === 'scheduled'
  const canCancel =
    publication.status === 'draft' || publication.status === 'scheduled'

  return (
    <>
      <div className="bg-charcoal border border-mid-grey/20 rounded-lg p-4 space-y-3">
        {/* Top row: asset title + status badge */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-sm font-medium text-off-white truncate">
              {publication.asset?.title ?? 'Untitled Asset'}
            </h3>
            <p className="text-xs text-mid-grey mt-0.5">
              {publication.platform?.name ?? 'Unknown Platform'}
            </p>
          </div>
          <Badge
            variant={STATUS_VARIANTS[publication.status] ?? 'grey'}
            size="sm"
          >
            {statusLabel}
          </Badge>
        </div>

        {/* Schedule / publish timestamps */}
        <div className="flex flex-wrap items-center gap-4 text-xs text-mid-grey">
          {publication.scheduled_at && (
            <span className="inline-flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {format(parseISO(publication.scheduled_at), 'd MMM yyyy, HH:mm')}
            </span>
          )}
          {publication.published_at && (
            <span className="inline-flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Published{' '}
              {format(parseISO(publication.published_at), 'd MMM yyyy, HH:mm')}
            </span>
          )}
        </div>

        {/* Error message */}
        {publication.error_message && (
          <p className="text-xs text-red-400 bg-red-500/10 rounded px-2 py-1">
            {publication.error_message}
          </p>
        )}

        {/* Quick actions */}
        {(canMarkPublished || canCancel) && (
          <div className="flex items-center gap-2 pt-1">
            {canMarkPublished && (
              <Button
                variant="ghost"
                size="sm"
                icon={<CheckCircle2 className="w-3.5 h-3.5" />}
                onClick={() => setConfirmPublish(true)}
              >
                Mark Published
              </Button>
            )}
            {canCancel && (
              <Button
                variant="ghost"
                size="sm"
                icon={<XCircle className="w-3.5 h-3.5" />}
                onClick={() => setConfirmCancel(true)}
              >
                Cancel
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Confirm publish dialog */}
      <ConfirmDialog
        open={confirmPublish}
        onClose={() => setConfirmPublish(false)}
        onConfirm={handleMarkPublished}
        title="Mark as published?"
        message="This will mark the publication as published and record the current timestamp."
        confirmText="Mark Published"
        cancelText="Not yet"
        variant="info"
        loading={isPublishing}
      />

      {/* Confirm cancel dialog */}
      <ConfirmDialog
        open={confirmCancel}
        onClose={() => setConfirmCancel(false)}
        onConfirm={handleCancel}
        title="Cancel this publication?"
        message="This will remove the publication from the schedule. This action can be undone by editing the publication."
        confirmText="Cancel Publication"
        cancelText="Keep it"
        variant="danger"
        loading={isCancelling}
      />
    </>
  )
}
