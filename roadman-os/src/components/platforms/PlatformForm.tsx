'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { platformSchema, type PlatformFormValues } from '@/lib/schemas/platforms'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import type { Platform } from '@/types/database'

export interface PlatformFormProps {
  mode: 'create' | 'edit'
  platform?: Platform
  onSubmit: (formData: FormData) => Promise<void>
}

/**
 * Platform create/edit form.
 * Uses react-hook-form + Zod for client-side validation.
 */
export function PlatformForm({ mode, platform, onSubmit }: PlatformFormProps) {
  const [submitting, setSubmitting] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const defaultValues: PlatformFormValues = {
    name: platform?.name ?? '',
    platform_type: '',
    account_handle: '',
    base_url: platform?.base_url ?? '',
    is_active: platform?.is_active ?? true,
  }

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<PlatformFormValues>({
    resolver: zodResolver(platformSchema),
    defaultValues,
  })

  const isActive = watch('is_active')

  async function handleFormSubmit(values: PlatformFormValues) {
    setSubmitting(true)
    setServerError(null)

    try {
      const formData = new FormData()
      formData.set('name', values.name)
      formData.set('base_url', values.base_url ?? '')
      formData.set('is_active', String(values.is_active))

      await onSubmit(formData)
    } catch (err) {
      setServerError(
        err instanceof Error ? err.message : 'Something went wrong. Please try again.',
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit(handleFormSubmit)}
      className="space-y-4"
    >
      {serverError && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {serverError}
        </div>
      )}

      <Input
        label="Name"
        placeholder="e.g. YouTube (Main)"
        error={errors.name?.message}
        {...register('name')}
      />

      <Input
        label="Base URL"
        placeholder="https://..."
        error={errors.base_url?.message}
        {...register('base_url')}
      />

      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="is_active"
          checked={isActive}
          onChange={(e) => setValue('is_active', e.target.checked)}
          className="h-4 w-4 rounded border-mid-grey/30 bg-charcoal text-coral focus:ring-coral/50"
        />
        <label htmlFor="is_active" className="text-sm text-off-white">
          Active
        </label>
      </div>

      <div className="flex items-center gap-3 pt-4 border-t border-mid-grey/20">
        <Button type="submit" loading={submitting}>
          {mode === 'create' ? 'Add Platform' : 'Save Changes'}
        </Button>
      </div>
    </form>
  )
}
