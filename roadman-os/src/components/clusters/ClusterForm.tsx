'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { X } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { CONTENT_PILLARS } from '@/lib/constants'
import {
  clusterSchema,
  CLUSTER_STATUSES,
  type ClusterFormValues,
} from '@/lib/schemas/clusters'
import type { ContentCluster } from '@/types/database'

type Props = {
  mode: 'create' | 'edit'
  cluster?: ContentCluster
  assets: { id: string; title: string }[]
  onSubmit: (formData: FormData) => Promise<{ error?: string } | void>
}

export function ClusterForm({ mode, cluster, assets, onSubmit }: Props) {
  const [loading, setLoading] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [queryInput, setQueryInput] = useState('')

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ClusterFormValues>({
    resolver: zodResolver(clusterSchema),
    defaultValues: {
      name: cluster?.name ?? '',
      description: cluster?.description ?? '',
      pillar: cluster?.pillar ?? '',
      hub_asset_id: cluster?.hub_asset_id ?? '',
      target_query: cluster?.target_query ?? '',
      related_queries: cluster?.related_queries ?? [],
      status:
        (cluster?.status as ClusterFormValues['status']) || 'planned',
    },
  })

  const relatedQueries = watch('related_queries') || []

  const addQuery = () => {
    const trimmed = queryInput.trim()
    if (trimmed && !relatedQueries.includes(trimmed)) {
      setValue('related_queries', [...relatedQueries, trimmed])
      setQueryInput('')
    }
  }

  const removeQuery = (index: number) => {
    setValue(
      'related_queries',
      relatedQueries.filter((_, i) => i !== index),
    )
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addQuery()
    }
  }

  const onSubmitHandler = async (values: ClusterFormValues) => {
    setLoading(true)
    setSubmitError(null)
    try {
      const formData = new FormData()
      formData.set('name', values.name)
      formData.set('description', values.description || '')
      formData.set('pillar', values.pillar || '')
      formData.set('hub_asset_id', values.hub_asset_id || '')
      formData.set('target_query', values.target_query || '')
      formData.set(
        'related_queries',
        JSON.stringify(values.related_queries || []),
      )
      formData.set('status', values.status || 'planned')

      const result = await onSubmit(formData)
      if (result?.error) {
        setSubmitError(result.error)
      }
    } catch {
      // redirect() throws internally — not a real error
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmitHandler)} className="space-y-5">
      {submitError && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400">
          {submitError}
        </div>
      )}

      <Input
        label="Name"
        placeholder="e.g. Zone 2 Training Guide"
        error={errors.name?.message}
        {...register('name')}
      />

      <Textarea
        label="Description"
        placeholder="Brief description of this content cluster..."
        error={errors.description?.message}
        {...register('description')}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          label="Pillar"
          placeholder="Select a pillar..."
          options={CONTENT_PILLARS.map((p) => ({
            value: p.value,
            label: p.label,
          }))}
          error={errors.pillar?.message}
          {...register('pillar')}
        />

        <Select
          label="Status"
          options={CLUSTER_STATUSES.map((s) => ({
            value: s.value,
            label: s.label,
          }))}
          error={errors.status?.message}
          {...register('status')}
        />
      </div>

      <Select
        label="Pillar Page"
        placeholder="Select the hub asset..."
        options={assets.map((a) => ({ value: a.id, label: a.title }))}
        error={errors.hub_asset_id?.message}
        {...register('hub_asset_id')}
      />

      <Input
        label="Target Search Query"
        placeholder="e.g. zone 2 training for cyclists"
        error={errors.target_query?.message}
        {...register('target_query')}
      />

      {/* Related queries multi-input */}
      <div>
        <label className="block text-sm font-medium text-off-white mb-1.5">
          Related Queries
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={queryInput}
            onChange={(e) => setQueryInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a query and press Enter..."
            className="flex-1 bg-charcoal border border-mid-grey/30 rounded-lg px-3 py-2 text-off-white placeholder:text-mid-grey focus:outline-none focus:ring-2 focus:ring-coral/50 focus:border-coral transition-colors"
          />
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={addQuery}
          >
            Add
          </Button>
        </div>
        {relatedQueries.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {relatedQueries.map((query, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1 bg-mid-grey/20 text-off-white text-sm px-2.5 py-1 rounded-full"
              >
                {query}
                <button
                  type="button"
                  onClick={() => removeQuery(index)}
                  className="text-mid-grey hover:text-red-400 transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button type="submit" loading={loading}>
          {mode === 'create' ? 'Create Cluster' : 'Save Changes'}
        </Button>
      </div>
    </form>
  )
}
