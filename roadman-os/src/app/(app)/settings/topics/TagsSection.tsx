'use client'

import { useState, useCallback, useMemo, useTransition } from 'react'
import { Plus, Search, Trash2, GitMerge } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { EmptyState } from '@/components/ui/EmptyState'
import { Select } from '@/components/ui/Select'
import { createTag, updateTag, deleteTag, mergeTags } from '@/lib/actions/tags'
import type { TagWithCount } from '@/lib/queries/tags'

/** Predefined colour palette for quick selection. */
const COLOUR_PRESETS = [
  '#F16363', // coral
  '#4C1273', // purple
  '#10B981', // emerald
  '#F59E0B', // amber
  '#3B82F6', // blue
  '#EC4899', // pink
  '#8B5CF6', // violet
  '#14B8A6', // teal
  '#EF4444', // red
  '#6366F1', // indigo
]

interface TagsSectionProps {
  initialTags: TagWithCount[]
}

export function TagsSection({ initialTags }: TagsSectionProps) {
  const [tags, setTags] = useState(initialTags)
  const [searchQuery, setSearchQuery] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingTag, setEditingTag] = useState<TagWithCount | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<TagWithCount | null>(null)
  const [showMerge, setShowMerge] = useState(false)
  const [mergeTargetId, setMergeTargetId] = useState('')
  const [formError, setFormError] = useState('')
  const [createName, setCreateName] = useState('')
  const [createColour, setCreateColour] = useState('')
  const [editName, setEditName] = useState('')
  const [editColour, setEditColour] = useState('')
  const [isPending, startTransition] = useTransition()

  const filteredTags = useMemo(() => {
    if (!searchQuery.trim()) return tags
    const q = searchQuery.toLowerCase()
    return tags.filter((t) => t.name.toLowerCase().includes(q))
  }, [tags, searchQuery])

  const openEditModal = useCallback((tag: TagWithCount) => {
    setEditingTag(tag)
    setEditName(tag.name)
    setEditColour(tag.colour ?? '')
    setShowMerge(false)
    setMergeTargetId('')
    setFormError('')
  }, [])

  const handleCreate = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      if (!createName.trim()) {
        setFormError('Name is required')
        return
      }

      startTransition(async () => {
        const result = await createTag({
          name: createName.trim(),
          colour: createColour || undefined,
        })

        if (!result.success) {
          setFormError(result.error ?? 'Something went wrong')
          return
        }

        if (result.data) {
          const newTag: TagWithCount = {
            id: result.data.id,
            name: result.data.name,
            slug: result.data.name
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, '-')
              .replace(/(^-|-$)/g, ''),
            colour: createColour || null,
            created_at: new Date().toISOString(),
            usage_count: 0,
          }
          setTags((prev) => [...prev, newTag].sort((a, b) => a.name.localeCompare(b.name)))
        }

        setShowCreateModal(false)
        setCreateName('')
        setCreateColour('')
        setFormError('')
      })
    },
    [createName, createColour],
  )

  const handleUpdate = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      if (!editingTag || !editName.trim()) {
        setFormError('Name is required')
        return
      }

      startTransition(async () => {
        const result = await updateTag(editingTag.id, {
          name: editName.trim(),
          colour: editColour || undefined,
        })

        if (!result.success) {
          setFormError(result.error ?? 'Something went wrong')
          return
        }

        setTags((prev) =>
          prev
            .map((t) =>
              t.id === editingTag.id
                ? { ...t, name: editName.trim(), colour: editColour || null }
                : t,
            )
            .sort((a, b) => a.name.localeCompare(b.name)),
        )

        setEditingTag(null)
        setFormError('')
      })
    },
    [editingTag, editName, editColour],
  )

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return

    startTransition(async () => {
      const result = await deleteTag(deleteTarget.id)
      if (result.success) {
        setTags((prev) => prev.filter((t) => t.id !== deleteTarget.id))
      }
      setDeleteTarget(null)
      setEditingTag(null)
    })
  }, [deleteTarget])

  const handleMerge = useCallback(async () => {
    if (!editingTag || !mergeTargetId) return

    startTransition(async () => {
      const result = await mergeTags(editingTag.id, mergeTargetId)

      if (!result.success) {
        setFormError(result.error ?? 'Merge failed')
        return
      }

      // Remove source tag and update target count
      setTags((prev) => {
        const sourceCount = editingTag.usage_count
        return prev
          .filter((t) => t.id !== editingTag.id)
          .map((t) =>
            t.id === mergeTargetId
              ? { ...t, usage_count: t.usage_count + sourceCount }
              : t,
          )
      })

      setEditingTag(null)
      setShowMerge(false)
      setMergeTargetId('')
      setFormError('')
    })
  }, [editingTag, mergeTargetId])

  // Merge target options: all tags except the one being edited
  const mergeOptions = useMemo(
    () =>
      tags
        .filter((t) => t.id !== editingTag?.id)
        .map((t) => ({ value: t.id, label: t.name })),
    [tags, editingTag],
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-heading text-xl uppercase text-off-white">Tags</h2>
        <Button
          variant="primary"
          size="sm"
          icon={<Plus className="h-4 w-4" />}
          onClick={() => {
            setShowCreateModal(true)
            setCreateName('')
            setCreateColour('')
            setFormError('')
          }}
        >
          Add Tag
        </Button>
      </div>

      {/* Search */}
      <div className="relative mb-4 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-mid-grey pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search tags..."
          className="w-full bg-charcoal border border-mid-grey/30 rounded-lg pl-9 pr-3 py-2 text-sm text-off-white placeholder:text-mid-grey focus:outline-none focus:ring-2 focus:ring-coral/50 focus:border-coral transition-colors"
        />
      </div>

      {/* Tags grid */}
      {filteredTags.length === 0 ? (
        <EmptyState
          title={searchQuery ? 'No matching tags' : 'No tags yet'}
          description={
            searchQuery
              ? 'Try a different search term.'
              : 'Create your first tag to start labelling content.'
          }
          action={
            !searchQuery ? (
              <Button
                variant="primary"
                size="sm"
                icon={<Plus className="h-4 w-4" />}
                onClick={() => {
                  setShowCreateModal(true)
                  setCreateName('')
                  setCreateColour('')
                  setFormError('')
                }}
              >
                Add Tag
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="flex flex-wrap gap-2">
          {filteredTags.map((tag) => (
            <button
              key={tag.id}
              type="button"
              onClick={() => openEditModal(tag)}
              className={cn(
                'inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm',
                'bg-mid-grey/10 text-off-white border border-mid-grey/20',
                'hover:bg-mid-grey/20 hover:border-mid-grey/30 transition-colors',
                'cursor-pointer',
              )}
            >
              {tag.colour && (
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: tag.colour }}
                />
              )}
              <span>{tag.name}</span>
              <span className="text-xs text-mid-grey">{tag.usage_count}</span>
            </button>
          ))}
        </div>
      )}

      {/* Create Tag Modal */}
      <Modal
        open={showCreateModal}
        onClose={() => {
          setShowCreateModal(false)
          setFormError('')
        }}
        title="Add Tag"
        size="sm"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="Name"
            placeholder="e.g. race day"
            value={createName}
            onChange={(e) => setCreateName(e.target.value)}
            required
          />

          <div>
            <label className="block text-sm font-medium text-off-white mb-1.5">
              Colour
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {COLOUR_PRESETS.map((colour) => (
                <button
                  key={colour}
                  type="button"
                  onClick={() => setCreateColour(colour)}
                  className={cn(
                    'w-7 h-7 rounded-full border-2 transition-all',
                    createColour === colour
                      ? 'border-off-white scale-110'
                      : 'border-transparent hover:border-mid-grey/50',
                  )}
                  style={{ backgroundColor: colour }}
                  aria-label={`Select colour ${colour}`}
                />
              ))}
              {createColour && (
                <button
                  type="button"
                  onClick={() => setCreateColour('')}
                  className="text-xs text-mid-grey hover:text-off-white transition-colors self-center ml-1"
                >
                  Clear
                </button>
              )}
            </div>
            <Input
              placeholder="#FF5733"
              value={createColour}
              onChange={(e) => setCreateColour(e.target.value)}
              hint="Optional hex colour"
            />
          </div>

          {formError && (
            <p className="text-sm text-red-400">{formError}</p>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="ghost"
              type="button"
              onClick={() => {
                setShowCreateModal(false)
                setFormError('')
              }}
            >
              Cancel
            </Button>
            <Button type="submit" loading={isPending}>
              Create Tag
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Tag Modal */}
      <Modal
        open={!!editingTag}
        onClose={() => {
          setEditingTag(null)
          setShowMerge(false)
          setFormError('')
        }}
        title="Edit Tag"
        size="sm"
      >
        {editingTag && (
          <div className="space-y-4">
            {!showMerge ? (
              <form onSubmit={handleUpdate} className="space-y-4">
                <Input
                  label="Name"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                />

                <div>
                  <label className="block text-sm font-medium text-off-white mb-1.5">
                    Colour
                  </label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {COLOUR_PRESETS.map((colour) => (
                      <button
                        key={colour}
                        type="button"
                        onClick={() => setEditColour(colour)}
                        className={cn(
                          'w-7 h-7 rounded-full border-2 transition-all',
                          editColour === colour
                            ? 'border-off-white scale-110'
                            : 'border-transparent hover:border-mid-grey/50',
                        )}
                        style={{ backgroundColor: colour }}
                        aria-label={`Select colour ${colour}`}
                      />
                    ))}
                    {editColour && (
                      <button
                        type="button"
                        onClick={() => setEditColour('')}
                        className="text-xs text-mid-grey hover:text-off-white transition-colors self-center ml-1"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  <Input
                    placeholder="#FF5733"
                    value={editColour}
                    onChange={(e) => setEditColour(e.target.value)}
                    hint="Optional hex colour"
                  />
                </div>

                <div className="text-sm text-mid-grey">
                  Used in <span className="text-off-white font-medium">{editingTag.usage_count}</span> asset{editingTag.usage_count !== 1 ? 's' : ''}
                </div>

                {formError && (
                  <p className="text-sm text-red-400">{formError}</p>
                )}

                <div className="flex items-center justify-between pt-2">
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      type="button"
                      icon={<GitMerge className="h-3.5 w-3.5" />}
                      onClick={() => setShowMerge(true)}
                    >
                      Merge
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      type="button"
                      icon={<Trash2 className="h-3.5 w-3.5" />}
                      className="text-red-400 hover:text-red-300"
                      onClick={() => setDeleteTarget(editingTag)}
                    >
                      Delete
                    </Button>
                  </div>
                  <div className="flex gap-3">
                    <Button
                      variant="ghost"
                      type="button"
                      onClick={() => {
                        setEditingTag(null)
                        setFormError('')
                      }}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" loading={isPending}>
                      Save
                    </Button>
                  </div>
                </div>
              </form>
            ) : (
              /* Merge view */
              <div className="space-y-4">
                <p className="text-sm text-mid-grey">
                  Merge <span className="text-off-white font-medium">{editingTag.name}</span> into
                  another tag. All assets tagged with this tag will be reassigned to the target,
                  and this tag will be deleted.
                </p>

                <Select
                  label="Merge into"
                  placeholder="Select target tag..."
                  options={mergeOptions}
                  value={mergeTargetId}
                  onChange={(e) => setMergeTargetId(e.target.value)}
                />

                {formError && (
                  <p className="text-sm text-red-400">{formError}</p>
                )}

                <div className="flex justify-end gap-3 pt-2">
                  <Button
                    variant="ghost"
                    type="button"
                    onClick={() => {
                      setShowMerge(false)
                      setMergeTargetId('')
                      setFormError('')
                    }}
                  >
                    Back
                  </Button>
                  <Button
                    variant="danger"
                    onClick={handleMerge}
                    loading={isPending}
                    disabled={!mergeTargetId}
                  >
                    Merge & Delete
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Tag"
        message={`This will permanently delete "${deleteTarget?.name ?? ''}" and remove it from all assets. This cannot be undone.`}
        confirmText="Delete"
        variant="danger"
        loading={isPending}
      />
    </div>
  )
}
