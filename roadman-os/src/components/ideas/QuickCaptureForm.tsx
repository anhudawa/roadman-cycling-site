'use client'

import { useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Zap } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { CONTENT_PILLARS } from '@/lib/constants'
import { captureIdea } from '@/lib/actions/ideas'

/**
 * Inline quick-capture form for ideas.
 * Large text input + optional pillar dropdown + submit.
 */
export function QuickCaptureForm() {
  const router = useRouter()
  const formRef = useRef<HTMLFormElement>(null)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(formData: FormData) {
    setError(null)

    startTransition(async () => {
      const result = await captureIdea(formData)

      if (!result.success) {
        setError(result.error ?? 'Something went wrong')
        return
      }

      formRef.current?.reset()
      router.refresh()
    })
  }

  return (
    <form
      ref={formRef}
      action={handleSubmit}
      className="rounded-xl border border-mid-grey/20 bg-charcoal p-4"
    >
      <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3">
        <div className="flex-1">
          <Input
            name="title"
            placeholder="What's the idea?"
            className="text-lg py-3"
            required
          />
        </div>

        <div className="w-full sm:w-48">
          <Select
            name="pillar"
            options={CONTENT_PILLARS as unknown as { value: string; label: string }[]}
            placeholder="Pillar (optional)"
            defaultValue=""
          />
        </div>

        <Button
          type="submit"
          loading={isPending}
          icon={<Zap className="h-4 w-4" />}
        >
          Capture
        </Button>
      </div>

      {error && (
        <p className="text-sm text-red-400 mt-2">{error}</p>
      )}
    </form>
  )
}
