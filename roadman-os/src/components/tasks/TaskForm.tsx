'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { taskSchema, type TaskFormValues } from '@/lib/schemas/tasks'
import { TASK_STATUSES, TASK_PRIORITIES } from '@/lib/constants'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import type { Task, Profile, Campaign, Asset } from '@/types/database'

export interface TaskFormProps {
  mode: 'create' | 'edit'
  task?: Task
  profiles: Pick<Profile, 'id' | 'full_name'>[]
  campaigns: Pick<Campaign, 'id' | 'title'>[]
  assets: Pick<Asset, 'id' | 'title'>[]
  onSubmit: (formData: FormData) => Promise<void>
}

/**
 * Task create/edit form.
 * Uses react-hook-form + Zod for client-side validation.
 * Serialises array fields (labels) as JSON in the FormData.
 */
export function TaskForm({ mode, task, profiles, campaigns, assets, onSubmit }: TaskFormProps) {
  const [submitting, setSubmitting] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const meta = (task?.metadata ?? {}) as Record<string, unknown>

  const defaultValues: TaskFormValues = {
    title: task?.title ?? '',
    description: task?.description ?? '',
    status: (task?.status ?? 'backlog') as TaskFormValues['status'],
    priority: (task?.priority ?? 'medium') as TaskFormValues['priority'],
    asset_id: task?.asset_id ?? '',
    campaign_id: task?.campaign_id ?? '',
    assignee_id: task?.assignee_id ?? '',
    due_date: task?.due_date ?? '',
    labels: task?.labels ?? [],
    estimated_minutes: (meta.estimated_minutes as number) ?? undefined,
    parent_task_id: (meta.parent_task_id as string) ?? '',
  }

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues,
  })

  // --- Submit handler ---
  async function handleFormSubmit(values: TaskFormValues) {
    setSubmitting(true)
    setServerError(null)

    try {
      const formData = new FormData()

      // Scalar fields
      formData.set('title', values.title)
      formData.set('description', values.description ?? '')
      formData.set('status', values.status ?? 'backlog')
      formData.set('priority', values.priority ?? 'medium')
      formData.set('asset_id', values.asset_id ?? '')
      formData.set('campaign_id', values.campaign_id ?? '')
      formData.set('assignee_id', values.assignee_id ?? '')
      formData.set('due_date', values.due_date ?? '')
      formData.set('parent_task_id', values.parent_task_id ?? '')

      // Numeric field
      if (values.estimated_minutes !== undefined && values.estimated_minutes !== null) {
        formData.set('estimated_minutes', String(values.estimated_minutes))
      } else {
        formData.set('estimated_minutes', '')
      }

      // Array fields as JSON strings
      const filteredLabels = (values.labels ?? []).filter((l) => l.trim() !== '')
      formData.set('labels', JSON.stringify(filteredLabels))

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

  const campaignOptions = campaigns.map((c) => ({
    value: c.id,
    label: c.title,
  }))

  const assetOptions = assets.map((a) => ({
    value: a.id,
    label: a.title,
  }))

  // Labels are handled as a comma-separated string for simplicity
  const labelsValue = watch('labels') ?? []

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
          placeholder="e.g. Edit podcast episode thumbnail"
          error={errors.title?.message}
          {...register('title')}
        />

        <Textarea
          label="Description"
          placeholder="What needs to be done..."
          error={errors.description?.message}
          {...register('description')}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Status"
            options={TASK_STATUSES as unknown as { value: string; label: string }[]}
            error={errors.status?.message}
            {...register('status')}
          />

          <Select
            label="Priority"
            options={TASK_PRIORITIES as unknown as { value: string; label: string }[]}
            error={errors.priority?.message}
            {...register('priority')}
          />
        </div>
      </section>

      {/* ---- People ---- */}
      <section className="space-y-4">
        <h2 className="font-heading text-lg uppercase text-off-white">
          Assignee
        </h2>

        <Select
          label="Assignee"
          options={profileOptions}
          placeholder="Assign to..."
          {...register('assignee_id')}
        />
      </section>

      {/* ---- Linked Items ---- */}
      <section className="space-y-4">
        <h2 className="font-heading text-lg uppercase text-off-white">
          Linked Items
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Campaign"
            options={campaignOptions}
            placeholder="Link to campaign..."
            {...register('campaign_id')}
          />

          <Select
            label="Asset"
            options={assetOptions}
            placeholder="Link to asset..."
            {...register('asset_id')}
          />
        </div>
      </section>

      {/* ---- Schedule ---- */}
      <section className="space-y-4">
        <h2 className="font-heading text-lg uppercase text-off-white">
          Schedule
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Due Date"
            type="date"
            error={errors.due_date?.message}
            {...register('due_date')}
          />

          <Input
            label="Estimated Minutes"
            type="number"
            placeholder="e.g. 60"
            min={0}
            {...register('estimated_minutes')}
          />
        </div>
      </section>

      {/* ---- Labels ---- */}
      <section className="space-y-4">
        <h2 className="font-heading text-lg uppercase text-off-white">
          Labels
        </h2>

        <Input
          label="Labels"
          placeholder="Enter labels separated by commas"
          hint="e.g. design, urgent, podcast"
          value={labelsValue.join(', ')}
          onChange={(e) => {
            const newLabels = e.target.value.split(',').map((l) => l.trim())
            setValue('labels', newLabels)
          }}
        />
      </section>

      {/* ---- Submit ---- */}
      <div className="flex items-center gap-3 pt-4 border-t border-mid-grey/20">
        <Button type="submit" loading={submitting}>
          {mode === 'create' ? 'Create Task' : 'Save Changes'}
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
