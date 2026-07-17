'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  briefSchema,
  type BriefFormValues,
  SEARCH_INTENT_OPTIONS,
  CANNIBALISATION_OPTIONS,
} from '@/lib/schemas/briefs'
import { CONTENT_PILLARS } from '@/lib/constants'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import type { ContentBrief } from '@/types/database'

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface BriefFormProps {
  mode: 'create' | 'edit'
  brief?: ContentBrief
  assetId: string
  onSubmit: (formData: FormData) => Promise<void>
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function BriefForm({ mode, brief, assetId, onSubmit }: BriefFormProps) {
  const [submitting, setSubmitting] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  // Extract extended fields from distribution_plan
  const plan = (brief?.distribution_plan ?? {}) as Record<string, unknown>

  const defaultValues: BriefFormValues = {
    // Targeting
    primary_query: (plan.primary_query as string) ?? '',
    secondary_queries: (plan.secondary_queries as string) ?? '',
    search_intent: (plan.search_intent as string) ?? '',
    target_persona: (plan.target_persona as string) ?? '',
    pillar: (plan.pillar as string) ?? '',

    // Angle
    unique_angle: (plan.unique_angle as string) ?? '',
    competitor_gaps: (plan.competitor_gaps as string) ?? '',
    original_sources: (plan.original_sources as string) ?? '',
    answer_capsule: (plan.answer_capsule as string) ?? '',
    decision_framework: (plan.decision_framework as string) ?? '',

    // Internal Linking
    pillar_page: (plan.pillar_page as string) ?? '',
    related_episodes: (plan.related_episodes as string) ?? '',
    tools_mentioned: (plan.tools_mentioned as string) ?? '',
    cta: (plan.cta as string) ?? '',

    // Cannibalisation
    existing_pages: (plan.existing_pages as string) ?? '',
    cannibalisation_decision: (plan.cannibalisation_decision as BriefFormValues['cannibalisation_decision']) ?? '',
    cannibalisation_rationale: (plan.cannibalisation_rationale as string) ?? '',

    // Standard fields
    objective: brief?.objective ?? '',
    target_audience: brief?.target_audience ?? '',
    tone: brief?.tone ?? '',
    seo_keywords: brief?.seo_keywords?.join(', ') ?? '',
    notes: brief?.notes ?? '',
  }

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BriefFormValues>({
    resolver: zodResolver(briefSchema),
    defaultValues,
  })

  async function handleFormSubmit(values: BriefFormValues) {
    setSubmitting(true)
    setServerError(null)

    try {
      const formData = new FormData()

      // Set all fields on the FormData
      for (const [key, value] of Object.entries(values)) {
        formData.set(key, String(value ?? ''))
      }

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
      className="space-y-8 max-w-3xl"
    >
      {serverError && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {serverError}
        </div>
      )}

      {/* ---- Section 1: Targeting ---- */}
      <section className="space-y-4">
        <h2 className="font-heading text-lg uppercase text-off-white">
          Targeting
        </h2>

        <Input
          label="Primary Query"
          placeholder="e.g. best cycling training plan for beginners"
          error={errors.primary_query?.message}
          {...register('primary_query')}
        />

        <Textarea
          label="Secondary Queries"
          placeholder="Comma-separated secondary queries..."
          hint="Separate multiple queries with commas"
          error={errors.secondary_queries?.message}
          {...register('secondary_queries')}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Search Intent"
            options={SEARCH_INTENT_OPTIONS as unknown as { value: string; label: string }[]}
            placeholder="Select intent..."
            error={errors.search_intent?.message}
            {...register('search_intent')}
          />

          <Input
            label="Target Persona"
            placeholder="e.g. Weekend warrior, Time-crunched pro"
            error={errors.target_persona?.message}
            {...register('target_persona')}
          />
        </div>

        <Select
          label="Content Pillar"
          options={CONTENT_PILLARS as unknown as { value: string; label: string }[]}
          placeholder="Select pillar..."
          error={errors.pillar?.message}
          {...register('pillar')}
        />
      </section>

      {/* ---- Section 2: Angle ---- */}
      <section className="space-y-4">
        <h2 className="font-heading text-lg uppercase text-off-white">
          Angle
        </h2>

        <Textarea
          label="Unique Angle"
          placeholder="What makes this piece different from existing content?"
          error={errors.unique_angle?.message}
          {...register('unique_angle')}
        />

        <Textarea
          label="Competitor Gaps"
          placeholder="What are competitors missing? What can we cover better?"
          error={errors.competitor_gaps?.message}
          {...register('competitor_gaps')}
        />

        <Textarea
          label="Original Sources"
          placeholder="Expert interviews, studies, personal experience..."
          error={errors.original_sources?.message}
          {...register('original_sources')}
        />

        <Textarea
          label="Answer Capsule"
          placeholder="One-paragraph summary that answers the primary query..."
          hint="A concise answer that could appear as a featured snippet"
          error={errors.answer_capsule?.message}
          {...register('answer_capsule')}
        />

        <Textarea
          label="Decision Framework"
          placeholder="How should the reader decide what to do with this information?"
          error={errors.decision_framework?.message}
          {...register('decision_framework')}
        />
      </section>

      {/* ---- Section 3: Internal Linking ---- */}
      <section className="space-y-4">
        <h2 className="font-heading text-lg uppercase text-off-white">
          Internal Linking
        </h2>

        <Input
          label="Pillar Page"
          placeholder="URL or asset reference for the parent pillar page"
          error={errors.pillar_page?.message}
          {...register('pillar_page')}
        />

        <Textarea
          label="Related Episodes"
          placeholder="List related podcast episodes to link to..."
          error={errors.related_episodes?.message}
          {...register('related_episodes')}
        />

        <Input
          label="Tools Mentioned"
          placeholder="e.g. TrainingPeaks, Wahoo KICKR, Zwift"
          error={errors.tools_mentioned?.message}
          {...register('tools_mentioned')}
        />

        <Input
          label="CTA"
          placeholder="e.g. Join Not Done Yet community"
          error={errors.cta?.message}
          {...register('cta')}
        />
      </section>

      {/* ---- Section 4: Cannibalisation Check ---- */}
      <section className="space-y-4">
        <h2 className="font-heading text-lg uppercase text-off-white">
          Cannibalisation Check
        </h2>

        <Textarea
          label="Existing Pages"
          placeholder="URLs of potentially competing pages on our site..."
          error={errors.existing_pages?.message}
          {...register('existing_pages')}
        />

        <Select
          label="Decision"
          options={CANNIBALISATION_OPTIONS as unknown as { value: string; label: string }[]}
          placeholder="Select decision..."
          error={errors.cannibalisation_decision?.message}
          {...register('cannibalisation_decision')}
        />

        <Textarea
          label="Rationale"
          placeholder="Why this decision? What differentiation strategy?"
          error={errors.cannibalisation_rationale?.message}
          {...register('cannibalisation_rationale')}
        />
      </section>

      {/* ---- Section 5: Standard Brief ---- */}
      <section className="space-y-4">
        <h2 className="font-heading text-lg uppercase text-off-white">
          Standard Brief
        </h2>

        <Textarea
          label="Objective"
          placeholder="What should this content achieve?"
          error={errors.objective?.message}
          {...register('objective')}
        />

        <Input
          label="Target Audience"
          placeholder="e.g. Intermediate road cyclists aged 30-50"
          error={errors.target_audience?.message}
          {...register('target_audience')}
        />

        <Input
          label="Tone"
          placeholder="e.g. Authoritative but approachable, Roadman voice"
          error={errors.tone?.message}
          {...register('tone')}
        />

        <Input
          label="SEO Keywords"
          placeholder="Comma-separated keywords..."
          hint="Separate multiple keywords with commas"
          error={errors.seo_keywords?.message}
          {...register('seo_keywords')}
        />

        <Textarea
          label="Notes"
          placeholder="Any additional notes or considerations..."
          error={errors.notes?.message}
          {...register('notes')}
        />
      </section>

      {/* ---- Submit ---- */}
      <div className="flex items-center gap-3 pt-4 border-t border-mid-grey/20">
        <Button type="submit" loading={submitting}>
          {mode === 'create' ? 'Create Brief' : 'Save Changes'}
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
