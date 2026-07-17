'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, X } from 'lucide-react'
import { campaignSchema, type CampaignFormValues } from '@/lib/schemas/campaigns'
import { CAMPAIGN_TYPES, CAMPAIGN_STATUSES, CONTENT_PILLARS } from '@/lib/constants'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import type { Campaign, Profile } from '@/types/database'

export interface CampaignFormProps {
  mode: 'create' | 'edit'
  campaign?: Campaign
  profiles: Pick<Profile, 'id' | 'full_name'>[]
  onSubmit: (formData: FormData) => Promise<void>
}

/**
 * Campaign create/edit form.
 * Uses react-hook-form + Zod for client-side validation.
 * Serialises array fields (goals, key_messages) as JSON in the FormData.
 */
export function CampaignForm({ mode, campaign, profiles, onSubmit }: CampaignFormProps) {
  const [submitting, setSubmitting] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const meta = (campaign?.metadata ?? {}) as Record<string, unknown>

  const defaultValues: CampaignFormValues = {
    title: campaign?.title ?? '',
    description: campaign?.description ?? '',
    type: (campaign?.type ?? 'weekly_focus') as CampaignFormValues['type'],
    status: (campaign?.status ?? 'draft') as CampaignFormValues['status'],
    start_date: campaign?.start_date ?? '',
    end_date: campaign?.end_date ?? '',
    goal: campaign?.goal ?? '',
    owner_id: campaign?.owner_id ?? '',
    sponsor_id: campaign?.sponsor_id ?? '',
    product_id: campaign?.product_id ?? '',
    pillar: (meta.pillar as string) ?? '',
    goals: (meta.goals as string[]) ?? [],
    key_messages: (meta.key_messages as string[]) ?? [],
    target_audience: (meta.target_audience as string) ?? '',
    cta_url: (meta.cta_url as string) ?? '',
    cta_text: (meta.cta_text as string) ?? '',
    colour: (meta.colour as string) ?? '',
    notes: (meta.notes as string) ?? '',
  }

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CampaignFormValues>({
    resolver: zodResolver(campaignSchema),
    defaultValues,
  })

  const goals = watch('goals')
  const keyMessages = watch('key_messages')

  // --- Array field helpers ---
  function addGoal() {
    setValue('goals', [...(goals ?? []), ''])
  }
  function removeGoal(index: number) {
    setValue('goals', (goals ?? []).filter((_, i) => i !== index))
  }
  function updateGoal(index: number, value: string) {
    const updated = [...(goals ?? [])]
    updated[index] = value
    setValue('goals', updated)
  }

  function addKeyMessage() {
    setValue('key_messages', [...(keyMessages ?? []), ''])
  }
  function removeKeyMessage(index: number) {
    setValue('key_messages', (keyMessages ?? []).filter((_, i) => i !== index))
  }
  function updateKeyMessage(index: number, value: string) {
    const updated = [...(keyMessages ?? [])]
    updated[index] = value
    setValue('key_messages', updated)
  }

  // --- Submit handler ---
  async function handleFormSubmit(values: CampaignFormValues) {
    setSubmitting(true)
    setServerError(null)

    try {
      const formData = new FormData()

      // Scalar fields
      formData.set('title', values.title)
      formData.set('description', values.description ?? '')
      formData.set('type', values.type ?? 'weekly_focus')
      formData.set('status', values.status ?? 'draft')
      formData.set('start_date', values.start_date)
      formData.set('end_date', values.end_date)
      formData.set('goal', values.goal ?? '')
      formData.set('owner_id', values.owner_id ?? '')
      formData.set('sponsor_id', values.sponsor_id ?? '')
      formData.set('product_id', values.product_id ?? '')
      formData.set('pillar', values.pillar ?? '')
      formData.set('target_audience', values.target_audience ?? '')
      formData.set('cta_url', values.cta_url ?? '')
      formData.set('cta_text', values.cta_text ?? '')
      formData.set('colour', values.colour ?? '')
      formData.set('notes', values.notes ?? '')

      // Array fields as JSON strings
      const filteredGoals = (values.goals ?? []).filter((g) => g.trim() !== '')
      const filteredMessages = (values.key_messages ?? []).filter((m) => m.trim() !== '')
      formData.set('goals', JSON.stringify(filteredGoals))
      formData.set('key_messages', JSON.stringify(filteredMessages))

      await onSubmit(formData)
    } catch (err) {
      setServerError(
        err instanceof Error ? err.message : 'Something went wrong. Please try again.',
      )
    } finally {
      setSubmitting(false)
    }
  }

  const profileOptions = profiles.map((p) => ({
    value: p.id,
    label: p.full_name,
  }))

  return (
    <form
      onSubmit={handleSubmit(handleFormSubmit)}
      className="space-y-8 max-w-3xl"
    >
      {serverError && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {serverError}
        </div>
      )}

      {/* ---- Core Details ---- */}
      <section className="space-y-4">
        <h2 className="font-heading text-lg uppercase text-off-white">
          Core Details
        </h2>

        <Input
          label="Title"
          placeholder="e.g. Summer Base Training Week"
          error={errors.title?.message}
          {...register('title')}
        />

        <Textarea
          label="Description"
          placeholder="Brief overview of this campaign..."
          error={errors.description?.message}
          {...register('description')}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Type"
            options={CAMPAIGN_TYPES as unknown as { value: string; label: string }[]}
            error={errors.type?.message}
            {...register('type')}
          />

          <Select
            label="Status"
            options={CAMPAIGN_STATUSES as unknown as { value: string; label: string }[]}
            error={errors.status?.message}
            {...register('status')}
          />
        </div>

        <Select
          label="Content Pillar"
          options={CONTENT_PILLARS as unknown as { value: string; label: string }[]}
          placeholder="Select pillar..."
          {...register('pillar')}
        />
      </section>

      {/* ---- Dates ---- */}
      <section className="space-y-4">
        <h2 className="font-heading text-lg uppercase text-off-white">
          Dates
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Start Date"
            type="date"
            error={errors.start_date?.message}
            {...register('start_date')}
          />

          <Input
            label="End Date"
            type="date"
            error={errors.end_date?.message}
            {...register('end_date')}
          />
        </div>
      </section>

      {/* ---- People ---- */}
      <section className="space-y-4">
        <h2 className="font-heading text-lg uppercase text-off-white">
          People
        </h2>

        <Select
          label="Owner"
          options={profileOptions}
          placeholder="Assign an owner..."
          {...register('owner_id')}
        />
      </section>

      {/* ---- Goals ---- */}
      <section className="space-y-4">
        <h2 className="font-heading text-lg uppercase text-off-white">
          Goals
        </h2>

        <Input
          label="Primary Goal"
          placeholder="e.g. Drive 500 sign-ups to Not Done Yet"
          {...register('goal')}
        />

        <div className="space-y-2">
          <label className="block text-sm font-medium text-off-white">
            Additional Goals
          </label>
          {(goals ?? []).map((goal, index) => (
            <div key={index} className="flex items-center gap-2">
              <input
                type="text"
                value={goal}
                onChange={(e) => updateGoal(index, e.target.value)}
                placeholder={`Goal ${index + 1}`}
                className="flex-1 bg-charcoal border border-mid-grey/30 rounded-lg px-3 py-2 text-off-white placeholder:text-mid-grey focus:outline-none focus:ring-2 focus:ring-coral/50 focus:border-coral transition-colors"
              />
              <button
                type="button"
                onClick={() => removeGoal(index)}
                className="p-2 text-mid-grey hover:text-red-400 transition-colors"
                aria-label="Remove goal"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            icon={<Plus className="h-4 w-4" />}
            onClick={addGoal}
          >
            Add Goal
          </Button>
        </div>
      </section>

      {/* ---- Key Messages ---- */}
      <section className="space-y-4">
        <h2 className="font-heading text-lg uppercase text-off-white">
          Key Messages
        </h2>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-off-white">
            Messages
          </label>
          {(keyMessages ?? []).map((msg, index) => (
            <div key={index} className="flex items-center gap-2">
              <input
                type="text"
                value={msg}
                onChange={(e) => updateKeyMessage(index, e.target.value)}
                placeholder={`Message ${index + 1}`}
                className="flex-1 bg-charcoal border border-mid-grey/30 rounded-lg px-3 py-2 text-off-white placeholder:text-mid-grey focus:outline-none focus:ring-2 focus:ring-coral/50 focus:border-coral transition-colors"
              />
              <button
                type="button"
                onClick={() => removeKeyMessage(index)}
                className="p-2 text-mid-grey hover:text-red-400 transition-colors"
                aria-label="Remove message"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            icon={<Plus className="h-4 w-4" />}
            onClick={addKeyMessage}
          >
            Add Message
          </Button>
        </div>
      </section>

      {/* ---- Call to Action ---- */}
      <section className="space-y-4">
        <h2 className="font-heading text-lg uppercase text-off-white">
          Call to Action
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="CTA URL"
            type="url"
            placeholder="https://..."
            {...register('cta_url')}
          />

          <Input
            label="CTA Text"
            placeholder="e.g. Join the Community"
            {...register('cta_text')}
          />
        </div>
      </section>

      {/* ---- Extras ---- */}
      <section className="space-y-4">
        <h2 className="font-heading text-lg uppercase text-off-white">
          Additional
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Target Audience"
            placeholder="e.g. Intermediate road cyclists aged 30–50"
            {...register('target_audience')}
          />

          <div className="w-full">
            <label
              htmlFor="colour"
              className="block text-sm font-medium text-off-white mb-1.5"
            >
              Campaign Colour
            </label>
            <input
              id="colour"
              type="color"
              defaultValue={defaultValues.colour || '#4C1273'}
              {...register('colour')}
              className="h-10 w-full rounded-lg border border-mid-grey/30 bg-charcoal cursor-pointer"
            />
          </div>
        </div>

        <Textarea
          label="Notes"
          placeholder="Internal notes about this campaign..."
          {...register('notes')}
        />
      </section>

      {/* ---- Submit ---- */}
      <div className="flex items-center gap-3 pt-4 border-t border-mid-grey/20">
        <Button type="submit" loading={submitting}>
          {mode === 'create' ? 'Create Campaign' : 'Save Changes'}
        </Button>

        <Button
          type="button"
          variant="ghost"
          onClick={() => window.history.back()}
          disabled={submitting}
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}
