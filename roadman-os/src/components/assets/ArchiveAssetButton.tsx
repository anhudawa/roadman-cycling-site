'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Archive } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { archiveAsset } from '@/lib/actions/assets'

interface ArchiveAssetButtonProps {
  assetId: string
}

export function ArchiveAssetButton({ assetId }: ArchiveAssetButtonProps) {
  const router = useRouter()
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [isArchiving, setIsArchiving] = useState(false)

  const handleArchive = useCallback(async () => {
    setIsArchiving(true)
    const result = await archiveAsset(assetId)
    setIsArchiving(false)
    setConfirmOpen(false)

    if (result.success) {
      router.push('/assets')
    }
  }, [assetId, router])

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        icon={<Archive className="w-4 h-4" />}
        onClick={() => setConfirmOpen(true)}
      >
        Archive
      </Button>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleArchive}
        title="Archive this asset?"
        message="This will move the asset to the archive. You can restore it later if needed."
        confirmText="Archive"
        cancelText="Keep it"
        variant="danger"
        loading={isArchiving}
      />
    </>
  )
}
