'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Archive } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { archiveCampaign } from '@/lib/actions/campaigns'

interface CampaignArchiveButtonProps {
  campaignId: string
}

export function CampaignArchiveButton({ campaignId }: CampaignArchiveButtonProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleArchive() {
    setLoading(true)
    const result = await archiveCampaign(campaignId)
    setLoading(false)

    if (result.success) {
      setOpen(false)
      router.push('/campaigns')
    }
  }

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        icon={<Archive className="h-4 w-4" />}
        onClick={() => setOpen(true)}
      >
        Archive
      </Button>

      <ConfirmDialog
        open={open}
        onClose={() => setOpen(false)}
        onConfirm={handleArchive}
        title="Archive Campaign"
        message="This campaign will be archived and hidden from the default list. You can restore it later."
        confirmText="Archive"
        variant="warning"
        loading={loading}
      />
    </>
  )
}
