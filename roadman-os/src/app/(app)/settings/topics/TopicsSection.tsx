'use client'

import { useState, useCallback, useTransition } from 'react'
import { Plus, Pencil, Trash2, GripVertical } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { CONTENT_PILLARS } from '@/lib/constants'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { EmptyState } from '@/components/ui/EmptyState'
import { createTopic, updateTopic, deleteTopic, reorderTopics } from '@/lib/actions/topics'
import type { Topic, ContentPillar } from '@/types/database'

const PILLAR_BADGE_VARIANTS: Record<string, 'coral' | 'purple' | 'green' | 'amber' | 'blue'> = {
  coaching: 'coral',
  nutrition: 'green',
  strength_and_conditioning: 'amber',
  recovery: 'blue',
  le_metier: 'purple',
}

const PILLAR_TABS = [
  { value: 'all', label: 'All' },
  ...CONTENT_PILLARS.map((p) => ({ value: p.value, label: p.label })),
]

interface TopicsSectionProps {
  initialTopics: Topic[]
}

export function TopicsSection({ initialTopics }: TopicsSectionProps) {
  const [topics, setTopics] = useState(initialTopics)
  const [activePillar, setActivePillar] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Topic | null>(null)
  const [inlineEditId, setInlineEditId] = useState<string | null>(null)
  const [inlineEditValue, setInlineEditValue] = useState('')
  const [formError, setFormError] = useState('')
  const [isPending, startTransition] = useTransition()

  // Filtered topics based on active pillar tab
  const filteredTopics = activePillar === 'all'
    ? topics
    : topics.filter((t) => t.pillar === activePillar)

  // Build hierarchy: parent topics first, children indented
  const parentTopics = filteredTopics.filter((t) => !t.parent_id)
  const childTopicsByParent = new Map<string, Topic[]>()
  for (const topic of filteredTopics) {
    if (topic.parent_id) {
      const existing = childTopicsByParent.get(topic.parent_id) ?? []
      existing.push(topic)
      childTopicsByParent.set(topic.parent_id, existing)
    }
  }

  const orderedTopics: { topic: Topic; depth: number }[] = []
  for (const parent of parentTopics) {
    orderedTopics.push({ topic: parent, depth: 0 })
    const children = childTopicsByParent.get(parent.id) ?? []
    for (const child of children) {
      orderedTopics.push({ topic: child, depth: 1 })
    }
  }
  // Include orphaned children (parent not visible in current filter)
  for (const topic of filteredTopics) {
    if (topic.parent_id && !orderedTopics.some((o) => o.topic.id === topic.id)) {
      orderedTopics.push({ topic, depth: 1 })
    }
  }

  const pillarLabel = (pillar: string | null) =>
    CONTENT_PILLARS.find((p) => p.value === pillar)?.label ?? ''

  const openCreateModal = useCallback(() => {
    setEditingTopic(null)
    setFormError('')
    setShowModal(true)
  }, [])

  const openEditModal = useCallback((topic: Topic) => {
    setEditingTopic(topic)
    setFormError('')
    setShowModal(true)
  }, [])

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      const form = e.currentTarget
      const formData = new FormData(form)

      startTransition(async () => {
        let result
        if (editingTopic) {
          result = await updateTopic(editingTopic.id, formData)
        } else {
          result = await createTopic(formData)
        }

        if (!result.success) {
          setFormError(result.error ?? 'Something went wrong')
          return
        }

        // Refresh the topics list by re-fetching via a page reload
        // In production you'd optimistically update, but revalidatePath
        // in the server action handles the Next.js cache already.
        setShowModal(false)
        setEditingTopic(null)
        setFormError('')

        // Optimistic update: add or replace the topic in local state
        if (editingTopic && result.data) {
          setTopics((prev) =>
            prev.map((t) =>
              t.id === editingTopic.id
                ? {
                    ...t,
                    name: formData.get('name') as string,
                    pillar: (formData.get('pillar') as ContentPillar) || null,
                    description: (formData.get('description') as string) || null,
                    parent_id: (formData.get('parent_id') as string) || null,
                    sort_order: Number(formData.get('sort_order')) || 0,
                  }
                : t,
            ),
          )
        } else if (result.data) {
          const newTopic: Topic = {
            id: result.data.id,
            name: formData.get('name') as string,
            slug: (formData.get('name') as string)
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, '-')
              .replace(/(^-|-$)/g, ''),
            pillar: (formData.get('pillar') as ContentPillar) || null,
            description: (formData.get('description') as string) || null,
            parent_id: (formData.get('parent_id') as string) || null,
            sort_order: Number(formData.get('sort_order')) || 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }
          setTopics((prev) => [...prev, newTopic])
        }
      })
    },
    [editingTopic],
  )

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return

    startTransition(async () => {
      const result = await deleteTopic(deleteTarget.id)
      if (result.success) {
        setTopics((prev) => prev.filter((t) => t.id !== deleteTarget.id))
      }
      setDeleteTarget(null)
    })
  }, [deleteTarget])

  const handleInlineEditSave = useCallback(
    async (topic: Topic) => {
      if (!inlineEditValue.trim() || inlineEditValue === topic.name) {
        setInlineEditId(null)
        return
      }

      const formData = new FormData()
      formData.set('name', inlineEditValue.trim())
      if (topic.pillar) formData.set('pillar', topic.pillar)
      if (topic.description) formData.set('description', topic.description)
      if (topic.parent_id) formData.set('parent_id', topic.parent_id)
      formData.set('sort_order', String(topic.sort_order))

      startTransition(async () => {
        const result = await updateTopic(topic.id, formData)
        if (result.success) {
          setTopics((prev) =>
            prev.map((t) =>
              t.id === topic.id ? { ...t, name: inlineEditValue.trim() } : t,
            ),
          )
        }
        setInlineEditId(null)
      })
    },
    [inlineEditValue],
  )

  const handleSortChange = useCallback(
    async (topicId: string, newOrder: number) => {
      const updates = [{ id: topicId, sort_order: newOrder }]

      setTopics((prev) =>
        prev.map((t) => (t.id === topicId ? { ...t, sort_order: newOrder } : t)),
      )

      startTransition(async () => {
        await reorderTopics(updates)
      })
    },
    [],
  )

  // Parent topic options for the select (exclude the topic being edited)
  const parentOptions = topics
    .filter((t) => !t.parent_id && t.id !== editingTopic?.id)
    .map((t) => ({ value: t.id, label: t.name }))

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-heading text-xl uppercase text-off-white">Topics</h2>
        <Button
          variant="primary"
          size="sm"
          icon={<Plus className="h-4 w-4" />}
          onClick={openCreateModal}
        >
          Add Topic
        </Button>
      </div>

      {/* Pillar filter tabs */}
      <div className="flex flex-wrap gap-1 mb-4">
        {PILLAR_TABS.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => setActivePillar(tab.value)}
            className={cn(
              'px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
              activePillar === tab.value
                ? 'bg-coral text-white'
                : 'bg-mid-grey/10 text-mid-grey hover:bg-mid-grey/20 hover:text-off-white',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Topics list */}
      {orderedTopics.length === 0 ? (
        <EmptyState
          title="No topics yet"
          description="Create your first topic to start organising content."
          action={
            <Button
              variant="primary"
              size="sm"
              icon={<Plus className="h-4 w-4" />}
              onClick={openCreateModal}
            >
              Add Topic
            </Button>
          }
        />
      ) : (
        <div className="border border-mid-grey/20 rounded-lg overflow-hidden">
          {/* Table header */}
          <div className="grid grid-cols-[auto_1fr_120px_140px_80px_80px] gap-2 px-4 py-2 bg-mid-grey/5 border-b border-mid-grey/20 text-xs font-medium text-mid-grey uppercase tracking-wider">
            <div className="w-6" />
            <div>Name</div>
            <div>Pillar</div>
            <div>Parent</div>
            <div className="text-centre">Order</div>
            <div />
          </div>

          {/* Topic rows */}
          {orderedTopics.map(({ topic, depth }) => (
            <div
              key={topic.id}
              className="grid grid-cols-[auto_1fr_120px_140px_80px_80px] gap-2 px-4 py-2.5 items-center border-b border-mid-grey/10 last:border-b-0 hover:bg-white/[0.02] transition-colors"
            >
              {/* Drag handle / indent */}
              <div className="w-6 flex items-center" style={{ paddingLeft: depth * 20 }}>
                <GripVertical className="h-4 w-4 text-mid-grey/40 cursor-grab" />
              </div>

              {/* Name (inline editable) */}
              <div>
                {inlineEditId === topic.id ? (
                  <input
                    type="text"
                    value={inlineEditValue}
                    onChange={(e) => setInlineEditValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleInlineEditSave(topic)
                      }
                      if (e.key === 'Escape') {
                        setInlineEditId(null)
                      }
                    }}
                    onBlur={() => handleInlineEditSave(topic)}
                    className="bg-charcoal border border-coral/50 rounded px-2 py-0.5 text-sm text-off-white outline-none w-full"
                    autoFocus
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setInlineEditId(topic.id)
                      setInlineEditValue(topic.name)
                    }}
                    className="text-sm text-off-white hover:text-coral transition-colors text-left"
                    title="Click to edit name"
                  >
                    {topic.name}
                  </button>
                )}
              </div>

              {/* Pillar badge */}
              <div>
                {topic.pillar && (
                  <Badge variant={PILLAR_BADGE_VARIANTS[topic.pillar] ?? 'default'} size="sm">
                    {pillarLabel(topic.pillar)}
                  </Badge>
                )}
              </div>

              {/* Parent topic */}
              <div className="text-sm text-mid-grey truncate">
                {topic.parent_id
                  ? topics.find((t) => t.id === topic.parent_id)?.name ?? ''
                  : ''}
              </div>

              {/* Sort order */}
              <div className="text-centre">
                <input
                  type="number"
                  value={topic.sort_order}
                  onChange={(e) => handleSortChange(topic.id, Number(e.target.value))}
                  className="w-14 bg-charcoal border border-mid-grey/20 rounded px-2 py-0.5 text-sm text-off-white text-centre outline-none focus:border-coral/50"
                  min={0}
                />
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => openEditModal(topic)}
                  className="p-1 text-mid-grey hover:text-off-white transition-colors rounded hover:bg-white/10"
                  aria-label="Edit topic"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteTarget(topic)}
                  className="p-1 text-mid-grey hover:text-red-400 transition-colors rounded hover:bg-red-500/10"
                  aria-label="Delete topic"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Topic Modal */}
      <Modal
        open={showModal}
        onClose={() => {
          setShowModal(false)
          setEditingTopic(null)
          setFormError('')
        }}
        title={editingTopic ? 'Edit Topic' : 'Add Topic'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            name="name"
            label="Name"
            placeholder="e.g. Interval Training"
            defaultValue={editingTopic?.name ?? ''}
            required
          />

          <Select
            name="pillar"
            label="Pillar"
            placeholder="Select a pillar..."
            options={CONTENT_PILLARS.map((p) => ({ value: p.value, label: p.label }))}
            defaultValue={editingTopic?.pillar ?? ''}
          />

          <Select
            name="parent_id"
            label="Parent Topic"
            placeholder="None (top-level)"
            options={parentOptions}
            defaultValue={editingTopic?.parent_id ?? ''}
          />

          <Textarea
            name="description"
            label="Description"
            placeholder="Optional description..."
            defaultValue={editingTopic?.description ?? ''}
            maxLength={500}
          />

          <Input
            name="sort_order"
            label="Sort Order"
            type="number"
            defaultValue={editingTopic?.sort_order ?? 0}
            min={0}
          />

          {formError && (
            <p className="text-sm text-red-400">{formError}</p>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="ghost"
              type="button"
              onClick={() => {
                setShowModal(false)
                setEditingTopic(null)
                setFormError('')
              }}
            >
              Cancel
            </Button>
            <Button type="submit" loading={isPending}>
              {editingTopic ? 'Save Changes' : 'Create Topic'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Topic"
        message={`This will permanently delete "${deleteTarget?.name ?? ''}" and remove it from all assets. This cannot be undone.`}
        confirmText="Delete"
        variant="danger"
        loading={isPending}
      />
    </div>
  )
}
