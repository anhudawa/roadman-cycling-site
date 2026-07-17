'use client'

import { useState, useTransition } from 'react'
import { type ColumnDef } from '@tanstack/react-table'
import { Pencil, Plus } from 'lucide-react'
import { DataTable } from '@/components/ui/DataTable'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { PlatformForm } from '@/components/platforms/PlatformForm'
import { createPlatform, updatePlatform, togglePlatformActive } from '@/lib/actions/platforms'
import type { Platform } from '@/types/database'

interface PlatformTableProps {
  platforms: Platform[]
}

export function PlatformTable({ platforms }: PlatformTableProps) {
  const [modalOpen, setModalOpen] = useState(false)
  const [editingPlatform, setEditingPlatform] = useState<Platform | null>(null)
  const [isPending, startTransition] = useTransition()

  function openCreate() {
    setEditingPlatform(null)
    setModalOpen(true)
  }

  function openEdit(platform: Platform) {
    setEditingPlatform(platform)
    setModalOpen(true)
  }

  function closeModal() {
    setModalOpen(false)
    setEditingPlatform(null)
  }

  async function handleCreate(formData: FormData) {
    const result = await createPlatform(formData)
    if (!result.success) {
      throw new Error(result.error ?? 'Failed to create platform')
    }
    closeModal()
  }

  async function handleUpdate(formData: FormData) {
    if (!editingPlatform) return
    const result = await updatePlatform(editingPlatform.id, formData)
    if (!result.success) {
      throw new Error(result.error ?? 'Failed to update platform')
    }
    closeModal()
  }

  function handleToggle(id: string) {
    startTransition(async () => {
      await togglePlatformActive(id)
    })
  }

  const columns: ColumnDef<Platform, unknown>[] = [
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => (
        <span className="font-medium text-off-white">{row.original.name}</span>
      ),
    },
    {
      accessorKey: 'slug',
      header: 'Slug',
      cell: ({ row }) => (
        <span className="text-mid-grey font-mono text-xs">{row.original.slug}</span>
      ),
    },
    {
      accessorKey: 'base_url',
      header: 'Base URL',
      cell: ({ row }) => (
        <span className="text-mid-grey text-sm truncate max-w-[200px] block">
          {row.original.base_url ?? '--'}
        </span>
      ),
    },
    {
      accessorKey: 'is_active',
      header: 'Active',
      cell: ({ row }) => (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            handleToggle(row.original.id)
          }}
          disabled={isPending}
        >
          <Badge variant={row.original.is_active ? 'green' : 'grey'}>
            {row.original.is_active ? 'Active' : 'Inactive'}
          </Badge>
        </button>
      ),
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="sm"
          icon={<Pencil className="h-4 w-4" />}
          onClick={(e) => {
            e.stopPropagation()
            openEdit(row.original)
          }}
        >
          Edit
        </Button>
      ),
    },
  ]

  return (
    <>
      <div className="mb-4 flex justify-end">
        <Button
          icon={<Plus className="h-4 w-4" />}
          onClick={openCreate}
        >
          Add Platform
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={platforms}
        emptyMessage="No platforms found. Add your first platform to get started."
      />

      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={editingPlatform ? 'Edit Platform' : 'Add Platform'}
        size="md"
      >
        <PlatformForm
          mode={editingPlatform ? 'edit' : 'create'}
          platform={editingPlatform ?? undefined}
          onSubmit={editingPlatform ? handleUpdate : handleCreate}
        />
      </Modal>
    </>
  )
}
