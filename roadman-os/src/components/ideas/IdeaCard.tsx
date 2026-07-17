'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowUp, Rocket, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { CONTENT_PILLARS } from '@/lib/constants'
import { voteIdea, promoteIdea, discardIdea } from '@/lib/actions/ideas'
import type { IdeaWithCreator } from '@/lib/queries/ideas'

// ---------------------------------------------------------------------------
// Badge variant maps
// ---------------------------------------------------------------------------

const statusVariant: Record<string, 'grey' | 'blue' | 'green' | 'purple' | 'red' | 'default'> = {
  captured: 'grey',
  developing: 'blue',
  ready: 'green',
  used: 'purple',
  discarded: 'red',
}

const statusLabel: Record<string, string> = {
  captured: 'Captured',
  developing: 'Developing',
  ready: 'Ready',
  used: 'Used',
  discarded: 'Discarded',
}

const pillarVariant: Record<string, 'blue' | 'green' | 'amber' | 'purple' | 'coral' | 'default'> = {
  coaching: 'blue',
  nutrition: 'green',
  strength_and_conditioning: 'amber',
  recovery: 'purple',
  le_metier: 'coral',
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface IdeaCardProps {
  idea: IdeaWithCreator
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function IdeaCard({ idea }: IdeaCardProps) {
  const router = useRouter()
  const [isVoting, startVoting] = useTransition()
  const [isPromoting, startPromoting] = useTransition()
  const [isDiscarding, startDiscarding] = useTransition()

  const pillarLabel = idea.pillar
    ? CONTENT_PILLARS.find((p) => p.value === idea.pillar)?.label ?? idea.pillar
    : null

  function handleVote() {
    startVoting(async () => {
      await voteIdea(idea.id)
      router.refresh()
    })
  }

  function handlePromote() {
    startPromoting(async () => {
      await promoteIdea(idea.id)
      router.refresh()
    })
  }

  function handleDiscard() {
    startDiscarding(async () => {
      await discardIdea(idea.id)
      router.refresh()
    })
  }

  return (
    <div className="rounded-xl border border-mid-grey/20 bg-charcoal p-5 space-y-3 hover:border-coral/30 transition-colors">
      {/* Title */}
      <h3 className="font-heading text-lg uppercase text-off-white truncate">
        {idea.title}
      </h3>

      {/* Badges row */}
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant={statusVariant[idea.status] ?? 'default'} size="sm">
          {statusLabel[idea.status] ?? idea.status}
        </Badge>
        {pillarLabel && (
          <Badge variant={pillarVariant[idea.pillar!] ?? 'default'} size="sm">
            {pillarLabel}
          </Badge>
        )}
      </div>

      {/* Source */}
      {idea.source && (
        <p className="text-xs text-mid-grey truncate">
          Source: {idea.source}
        </p>
      )}

      {/* Creator + score */}
      <div className="flex items-center justify-between text-xs text-mid-grey pt-1">
        <span>{idea.creator?.full_name ?? 'Unknown'}</span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleVote}
            disabled={isVoting || idea.status === 'discarded' || idea.status === 'used'}
            className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-off-white bg-mid-grey/20 hover:bg-coral/20 hover:text-coral transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowUp className="h-3 w-3" />
            {idea.score}
          </button>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-2 pt-1">
        {idea.status === 'ready' && (
          <Button
            variant="secondary"
            size="sm"
            onClick={handlePromote}
            loading={isPromoting}
            icon={<Rocket className="h-3.5 w-3.5" />}
          >
            Promote to Asset
          </Button>
        )}
        {idea.status !== 'discarded' && idea.status !== 'used' && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDiscard}
            loading={isDiscarding}
            icon={<Trash2 className="h-3.5 w-3.5" />}
          >
            Discard
          </Button>
        )}
      </div>
    </div>
  )
}
