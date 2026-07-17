'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Send, Check, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Textarea'
import { BriefStatusBadge } from '@/components/briefs/BriefStatusBadge'
import { submitBrief, approveBrief, rejectBrief } from '@/lib/actions/briefs'
import type { UserRole } from '@/types/database'

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface BriefApprovalProps {
  briefId: string
  status: string
  userRole: UserRole
  approverName?: string | null
  approvedAt?: string | null
  rejectionReason?: string | null
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function BriefApproval({
  briefId,
  status,
  userRole,
  approverName,
  approvedAt,
  rejectionReason,
}: BriefApprovalProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showRejectForm, setShowRejectForm] = useState(false)
  const [rejectReason, setRejectReason] = useState('')

  const canApprove = userRole === 'admin' || userRole === 'leadership'

  async function handleSubmit() {
    setLoading(true)
    setError(null)
    const result = await submitBrief(briefId)
    if (!result.success) {
      setError(result.error ?? 'Failed to submit brief')
    }
    setLoading(false)
    router.refresh()
  }

  async function handleApprove() {
    setLoading(true)
    setError(null)
    const result = await approveBrief(briefId)
    if (!result.success) {
      setError(result.error ?? 'Failed to approve brief')
    }
    setLoading(false)
    router.refresh()
  }

  async function handleReject() {
    if (!rejectReason.trim()) {
      setError('Please provide a reason for rejection')
      return
    }
    setLoading(true)
    setError(null)
    const result = await rejectBrief(briefId, rejectReason.trim())
    if (!result.success) {
      setError(result.error ?? 'Failed to reject brief')
    } else {
      setShowRejectForm(false)
      setRejectReason('')
    }
    setLoading(false)
    router.refresh()
  }

  return (
    <div className="bg-charcoal border border-mid-grey/20 rounded-lg p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-mid-grey uppercase tracking-wider">
          Approval Status
        </h3>
        <BriefStatusBadge status={status} />
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Draft — show submit button */}
      {status === 'draft' && (
        <Button
          onClick={handleSubmit}
          loading={loading}
          variant="secondary"
          size="sm"
          icon={<Send className="w-4 h-4" />}
          className="w-full"
        >
          Submit for Review
        </Button>
      )}

      {/* Submitted — show approve/reject for admins */}
      {status === 'submitted' && canApprove && (
        <div className="space-y-3">
          <p className="text-sm text-mid-grey">
            This brief is awaiting your review.
          </p>

          {!showRejectForm ? (
            <div className="flex items-center gap-2">
              <Button
                onClick={handleApprove}
                loading={loading}
                variant="primary"
                size="sm"
                icon={<Check className="w-4 h-4" />}
                className="flex-1"
              >
                Approve
              </Button>
              <Button
                onClick={() => setShowRejectForm(true)}
                variant="danger"
                size="sm"
                icon={<X className="w-4 h-4" />}
                className="flex-1"
                disabled={loading}
              >
                Reject
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <Textarea
                label="Rejection Reason"
                placeholder="Explain what needs to change..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />
              <div className="flex items-center gap-2">
                <Button
                  onClick={handleReject}
                  loading={loading}
                  variant="danger"
                  size="sm"
                  className="flex-1"
                >
                  Confirm Rejection
                </Button>
                <Button
                  onClick={() => {
                    setShowRejectForm(false)
                    setRejectReason('')
                  }}
                  variant="ghost"
                  size="sm"
                  disabled={loading}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Submitted — non-admin sees waiting message */}
      {status === 'submitted' && !canApprove && (
        <p className="text-sm text-mid-grey">
          This brief has been submitted and is waiting for review.
        </p>
      )}

      {/* Approved — show details */}
      {status === 'approved' && (
        <div className="space-y-1">
          {approverName && (
            <p className="text-sm text-off-white">
              Approved by <span className="font-medium">{approverName}</span>
            </p>
          )}
          {approvedAt && (
            <p className="text-xs text-mid-grey">
              {new Date(approvedAt).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          )}
        </div>
      )}

      {/* Rejected — show reason */}
      {status === 'rejected' && (
        <div className="space-y-2">
          {rejectionReason && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
              <p className="text-xs text-mid-grey uppercase tracking-wider mb-1">
                Rejection Reason
              </p>
              <p className="text-sm text-off-white">{rejectionReason}</p>
            </div>
          )}
          <Button
            onClick={handleSubmit}
            loading={loading}
            variant="secondary"
            size="sm"
            icon={<Send className="w-4 h-4" />}
            className="w-full"
          >
            Re-submit for Review
          </Button>
        </div>
      )}
    </div>
  )
}
