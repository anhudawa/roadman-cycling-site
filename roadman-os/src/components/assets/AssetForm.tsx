'use client'

import { useState, useTransition, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { X, Plus } from 'lucide-react'
import { assetSchema, type AssetFormValues } from '@/lib/schemas/assets'
import { createAsset, updateAsset } from '@/lib/actions/assets'
import { ASSET_TYPES, ASSET_STATUSES, CONTENT_PILLARS } from '@/lib/constants'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { cn } from '@/lib/utils/cn'
import type { Asset, Topic, Tag } from '@/types/database'

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------
type DropdownProfile = { id: string; display_name: string }
type DropdownItem = { id: string; title: string }

interface AssetFormProps {
  mode: 'create' | 'edit'
  asset?: Asset
  campaigns: DropdownItem[]
  profiles: DropdownProfile[]
  topics: Topic[]
  tags: Tag[]
  assets: DropdownItem[]
  existingTopicIds?: string[]
  existingTagIds?: string[]
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export function AssetForm({
  mode,
  asset,
  campaigns,
  profiles,
  topics,
  tags,
  assets,
  existingTopicIds = [],
  existingTagIds = [],
}: AssetFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [serverError, setServerError] = useState<string | null>(null)

  // Topic/tag local state
  const [selectedTopicIds, setSelectedTopicIds] = useState<string[]>(existingTopicIds)
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(existingTagIds)
  const [tagInput, setTagInput] = useState('')

  // Parse metadata defaults for edit mode
  const metadata = (asset?.metadata ?? {}) as Record<string, unknown>

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<AssetFormValues>({
    resolver: zodResolver(assetSchema),
    defaultValues: {
      title: asset?.title ?? '',
      type: asset?.type ?? undefined,
      status: asset?.status ?? 'idea',
      pillar: asset?.pillar ?? '',
      description: asset?.description ?? '',
      body: asset?.body ?? '',
      campaign_id: asset?.campaign_id ?? '',
      parent_asset_id: asset?.parent_asset_id ?? '',
      assignee_id: asset?.assignee_id ?? '',
      due_date: asset?.due_date?.slice(0, 10) ?? '',
      // Podcast metadata
      episode_number: metadata.episode_number as number | undefined ?? undefined,
      season_number: metadata.season_number as number | undefined ?? undefined,
      duration_seconds: metadata.duration_seconds as number | undefined ?? undefined,
      youtube_id: (metadata.youtube_id as string) ?? '',
      spotify_url: (metadata.spotify_url as string) ?? '',
      guest_name: (metadata.guest_name as string) ?? '',
      guest_credential: (metadata.guest_credential as string) ?? '',
      recording_date: (metadata.recording_date as string) ?? '',
      // Blog metadata
      seo_title: (metadata.seo_title as string) ?? '',
      seo_description: (metadata.seo_description as string) ?? '',
      keywords: Array.isArray(metadata.keywords)
        ? (metadata.keywords as string[]).join(', ')
        : '',
      answer_capsule: (metadata.answer_capsule as string) ?? '',
      canonical_url: (metadata.canonical_url as string) ?? '',
      // Social metadata
      platform_char_count: metadata.platform_char_count as number | undefined ?? undefined,
    },
  })

  const watchedType = watch('type')

  // --------------------------------------------------
  // Topic toggle
  // --------------------------------------------------
  const toggleTopic = useCallback((topicId: string) => {
    setSelectedTopicIds((prev) =>
      prev.includes(topicId)
        ? prev.filter((id) => id !== topicId)
        : [...prev, topicId],
    )
  }, [])

  // --------------------------------------------------
  // Tag management
  // --------------------------------------------------
  const addTagById = useCallback((tagId: string) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId) ? prev : [...prev, tagId],
    )
  }, [])

  const removeTag = useCallback((tagId: string) => {
    setSelectedTagIds((prev) => prev.filter((id) => id !== tagId))
  }, [])

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      const value = tagInput.trim()
      if (!value) return

      // Find existing tag by name
      const existing = tags.find(
        (t) => t.name.toLowerCase() === value.toLowerCase(),
      )
      if (existing) {
        addTagById(existing.id)
      }
      setTagInput('')
    }
  }

  // --------------------------------------------------
  // Submit
  // --------------------------------------------------
  const onSubmit = (values: AssetFormValues) => {
    setServerError(null)

    startTransition(async () => {
      const formData = new FormData()

      // Append all form values
      for (const [key, value] of Object.entries(values)) {
        if (value !== undefined && value !== null) {
          formData.set(key, String(value))
        }
      }

      // Append topic IDs
      for (const id of selectedTopicIds) {
        formData.append('topic_ids', id)
      }

      // Append tag IDs
      for (const id of selectedTagIds) {
        formData.append('tag_ids', id)
      }

      const result =
        mode === 'create'
          ? await createAsset(formData)
          : await updateAsset(asset!.id, formData)

      if (!result.success) {
        setServerError(result.error ?? 'Something went wrong')
        return
      }

      router.push('/assets')
    })
  }

  // --------------------------------------------------
  // Group topics by pillar
  // --------------------------------------------------
  const topicsByPillar = topics.reduce<Record<string, Topic[]>>((acc, topic) => {
    const pillar = topic.pillar ?? 'uncategorised'
    if (!acc[pillar]) acc[pillar] = []
    acc[pillar].push(topic)
    return acc
  }, {})

  const pillarLabels: Record<string, string> = {
    coaching: 'Coaching',
    nutrition: 'Nutrition',
    strength_and_conditioning: 'Strength & Conditioning',
    recovery: 'Recovery',
    le_metier: 'Le Metier',
    uncategorised: 'Uncategorised',
  }

  // --------------------------------------------------
  // Render
  // --------------------------------------------------
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 max-w-3xl">
      {/* Server error banner */}
      {serverError && (
        <div className="rounded-lg bg-red-500/10 border border-red-500/30 p-4 text-sm text-red-400">
          {serverError}
        </div>
      )}

      {/* ============================================================= */}
      {/* Common fields */}
      {/* ============================================================= */}
      <section className="space-y-5">
        <h2 className="font-heading text-lg uppercase text-off-white">
          Details
        </h2>

        <Input
          label="Title"
          placeholder="e.g. S3E12 — Threshold Power Explained"
          error={errors.title?.message}
          {...register('title')}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Type"
            options={ASSET_TYPES.map((t) => ({ value: t.value, label: t.label }))}
            placeholder="Select type..."
            error={errors.type?.message}
            {...register('type')}
          />

          <Select
            label="Status"
            options={ASSET_STATUSES.map((s) => ({ value: s.value, label: s.label }))}
            placeholder="Select status..."
            error={errors.status?.message}
            {...register('status')}
          />
        </div>

        <Select
          label="Pillar"
          options={CONTENT_PILLARS.map((p) => ({ value: p.value, label: p.label }))}
          placeholder="Select pillar..."
          error={errors.pillar?.message}
          {...register('pillar')}
        />

        <Textarea
          label="Description"
          placeholder="Brief summary of this asset"
          hint="A short description for internal reference"
          rows={3}
          error={errors.description?.message}
          {...register('description')}
        />

        <Textarea
          label="Body"
          placeholder="Full content or notes"
          rows={8}
          error={errors.body?.message}
          {...register('body')}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Campaign"
            options={campaigns.map((c) => ({ value: c.id, label: c.title }))}
            placeholder="None"
            error={errors.campaign_id?.message}
            {...register('campaign_id')}
          />

          <Select
            label="Source Asset"
            options={assets
              .filter((a) => a.id !== asset?.id)
              .map((a) => ({ value: a.id, label: a.title }))}
            placeholder="None"
            error={errors.parent_asset_id?.message}
            {...register('parent_asset_id')}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Assigned To"
            options={profiles.map((p) => ({
              value: p.id,
              label: p.display_name || p.id,
            }))}
            placeholder="Unassigned"
            error={errors.assignee_id?.message}
            {...register('assignee_id')}
          />

          <Input
            label="Due Date"
            type="date"
            error={errors.due_date?.message}
            {...register('due_date')}
          />
        </div>
      </section>

      {/* ============================================================= */}
      {/* Podcast episode fields */}
      {/* ============================================================= */}
      {watchedType === 'podcast_episode' && (
        <section className="space-y-5">
          <h2 className="font-heading text-lg uppercase text-off-white">
            Podcast Episode
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Episode Number"
              type="number"
              placeholder="e.g. 42"
              error={errors.episode_number?.message}
              {...register('episode_number')}
            />
            <Input
              label="Season Number"
              type="number"
              placeholder="e.g. 3"
              error={errors.season_number?.message}
              {...register('season_number')}
            />
            <Input
              label="Duration (seconds)"
              type="number"
              placeholder="e.g. 3600"
              error={errors.duration_seconds?.message}
              {...register('duration_seconds')}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="YouTube ID"
              placeholder="e.g. dQw4w9WgXcQ"
              error={errors.youtube_id?.message}
              {...register('youtube_id')}
            />
            <Input
              label="Spotify URL"
              placeholder="https://open.spotify.com/..."
              error={errors.spotify_url?.message}
              {...register('spotify_url')}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Guest Name"
              placeholder="e.g. Dr Jane Smith"
              error={errors.guest_name?.message}
              {...register('guest_name')}
            />
            <Input
              label="Guest Credential"
              placeholder="e.g. Sports Scientist, PhD"
              error={errors.guest_credential?.message}
              {...register('guest_credential')}
            />
          </div>

          <Input
            label="Recording Date"
            type="date"
            error={errors.recording_date?.message}
            {...register('recording_date')}
          />
        </section>
      )}

      {/* ============================================================= */}
      {/* Blog post fields */}
      {/* ============================================================= */}
      {watchedType === 'blog_post' && (
        <section className="space-y-5">
          <h2 className="font-heading text-lg uppercase text-off-white">
            Blog Post SEO
          </h2>

          <Input
            label="SEO Title"
            placeholder="Max 60 characters"
            maxLength={60}
            hint={`${(watch('seo_title') ?? '').length} / 60 characters`}
            error={errors.seo_title?.message}
            {...register('seo_title')}
          />

          <Textarea
            label="SEO Description"
            placeholder="Max 160 characters"
            maxLength={160}
            rows={3}
            error={errors.seo_description?.message}
            {...register('seo_description')}
          />

          <Input
            label="Keywords"
            placeholder="Comma-separated, e.g. threshold power, FTP, cycling"
            hint="Enter keywords separated by commas"
            error={errors.keywords?.message}
            {...register('keywords')}
          />

          <Textarea
            label="Answer Capsule"
            placeholder="A concise answer for featured snippets"
            rows={3}
            error={errors.answer_capsule?.message}
            {...register('answer_capsule')}
          />

          <Input
            label="Canonical URL"
            placeholder="https://..."
            error={errors.canonical_url?.message}
            {...register('canonical_url')}
          />
        </section>
      )}

      {/* ============================================================= */}
      {/* YouTube video fields */}
      {/* ============================================================= */}
      {watchedType === 'youtube_video' && (
        <section className="space-y-5">
          <h2 className="font-heading text-lg uppercase text-off-white">
            YouTube Video
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="YouTube ID"
              placeholder="e.g. dQw4w9WgXcQ"
              error={errors.youtube_id?.message}
              {...register('youtube_id')}
            />
            <Input
              label="Duration (seconds)"
              type="number"
              placeholder="e.g. 600"
              error={errors.duration_seconds?.message}
              {...register('duration_seconds')}
            />
          </div>
        </section>
      )}

      {/* ============================================================= */}
      {/* Social post fields */}
      {/* ============================================================= */}
      {watchedType === 'social_post' && (
        <section className="space-y-5">
          <h2 className="font-heading text-lg uppercase text-off-white">
            Social Post
          </h2>

          <Input
            label="Character Count Target"
            type="number"
            placeholder="e.g. 280 for X/Twitter"
            hint="Platform character limit for reference"
            error={errors.platform_char_count?.message}
            {...register('platform_char_count')}
          />
        </section>
      )}

      {/* ============================================================= */}
      {/* Topics */}
      {/* ============================================================= */}
      <section className="space-y-4">
        <h2 className="font-heading text-lg uppercase text-off-white">
          Topics
        </h2>

        {Object.entries(topicsByPillar).map(([pillar, pillarTopics]) => (
          <div key={pillar}>
            <p className="text-xs uppercase tracking-wider text-mid-grey mb-2">
              {pillarLabels[pillar] ?? pillar}
            </p>
            <div className="flex flex-wrap gap-2">
              {pillarTopics.map((topic) => {
                const isSelected = selectedTopicIds.includes(topic.id)
                return (
                  <button
                    key={topic.id}
                    type="button"
                    onClick={() => toggleTopic(topic.id)}
                    className={cn(
                      'px-3 py-1 text-sm rounded-full border transition-colors',
                      isSelected
                        ? 'bg-purple text-white border-purple'
                        : 'bg-transparent text-mid-grey border-mid-grey/30 hover:border-off-white hover:text-off-white',
                    )}
                  >
                    {topic.name}
                  </button>
                )
              })}
            </div>
          </div>
        ))}

        {topics.length === 0 && (
          <p className="text-sm text-mid-grey">No topics available.</p>
        )}
      </section>

      {/* ============================================================= */}
      {/* Tags */}
      {/* ============================================================= */}
      <section className="space-y-4">
        <h2 className="font-heading text-lg uppercase text-off-white">Tags</h2>

        {/* Selected tags */}
        {selectedTagIds.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {selectedTagIds.map((tagId) => {
              const tag = tags.find((t) => t.id === tagId)
              if (!tag) return null
              return (
                <span
                  key={tagId}
                  className="inline-flex items-center gap-1 px-3 py-1 text-sm rounded-full bg-coral/20 text-coral border border-coral/30"
                >
                  {tag.name}
                  <button
                    type="button"
                    onClick={() => removeTag(tagId)}
                    className="hover:text-white transition-colors"
                    aria-label={`Remove ${tag.name}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )
            })}
          </div>
        )}

        {/* Tag input */}
        <div className="flex gap-2">
          <div className="flex-1">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagKeyDown}
              placeholder="Type a tag name and press Enter"
              className={cn(
                'w-full bg-charcoal border border-mid-grey/30 rounded-lg px-3 py-2 text-off-white',
                'placeholder:text-mid-grey',
                'focus:outline-none focus:ring-2 focus:ring-coral/50 focus:border-coral transition-colors',
              )}
            />
          </div>
        </div>

        {/* Tag suggestions dropdown */}
        {tagInput.trim() && (
          <div className="flex flex-wrap gap-2">
            {tags
              .filter(
                (t) =>
                  t.name.toLowerCase().includes(tagInput.toLowerCase()) &&
                  !selectedTagIds.includes(t.id),
              )
              .slice(0, 10)
              .map((tag) => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => {
                    addTagById(tag.id)
                    setTagInput('')
                  }}
                  className="inline-flex items-center gap-1 px-3 py-1 text-sm rounded-full border border-mid-grey/30 text-mid-grey hover:border-coral hover:text-coral transition-colors"
                >
                  <Plus className="h-3 w-3" />
                  {tag.name}
                </button>
              ))}
          </div>
        )}
      </section>

      {/* ============================================================= */}
      {/* Actions */}
      {/* ============================================================= */}
      <div className="flex items-center gap-3 pt-4 border-t border-mid-grey/20">
        <Button type="submit" loading={isPending}>
          {mode === 'create' ? 'Create Asset' : 'Save Changes'}
        </Button>

        <Button
          type="button"
          variant="ghost"
          onClick={() => router.push('/assets')}
          disabled={isPending}
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}
