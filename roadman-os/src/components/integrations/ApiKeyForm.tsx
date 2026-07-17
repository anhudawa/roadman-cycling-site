'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { saveApiKeyConnection } from '@/lib/actions/integrations'

export interface ApiKeyFormProps {
  platformSlug: string
  platformName: string
  /** Extra fields specific to the platform */
  extraFields?: {
    name: string
    label: string
    placeholder?: string
    hint?: string
  }[]
}

/**
 * Form for connecting platforms that use API key authentication (Beehiiv, GA4).
 */
export function ApiKeyForm({
  platformSlug,
  platformName,
  extraFields = [],
}: ApiKeyFormProps) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    const formData = new FormData(e.currentTarget)
    formData.set('platform_slug', platformSlug)

    startTransition(async () => {
      const result = await saveApiKeyConnection(formData)
      if (result.success) {
        setSuccess(true)
      } else {
        setError(result.error ?? 'Failed to save')
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        name="api_key"
        label="API Key"
        type="password"
        placeholder={`Enter your ${platformName} API key`}
        required
      />

      <Input
        name="account_name"
        label="Account Name"
        placeholder="Optional display name"
      />

      {extraFields.map((field) => (
        <Input
          key={field.name}
          name={field.name}
          label={field.label}
          placeholder={field.placeholder}
          hint={field.hint}
        />
      ))}

      {error && <p className="text-sm text-red-400">{error}</p>}
      {success && (
        <p className="text-sm text-emerald-400">
          Connected successfully
        </p>
      )}

      <Button type="submit" size="sm" loading={isPending}>
        Save Connection
      </Button>
    </form>
  )
}
