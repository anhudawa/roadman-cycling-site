'use client'

import { useState } from 'react'
import { Pencil, Check, X, BookOpen } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ConventionSection = {
  id: string
  title: string
  body: string
}

// ---------------------------------------------------------------------------
// Default Conventions
// ---------------------------------------------------------------------------

const DEFAULT_CONVENTIONS: ConventionSection[] = [
  {
    id: 'status-flow',
    title: 'Status Flow',
    body: `Assets follow this status progression:
- Idea -> Brief Written -> In Production -> In Review -> Approved -> Scheduled -> Published
- Assets can be moved to "Archived" from any status
- "Repurposed" is used when a published asset spawns derivative content
- Tasks use: Backlog -> To Do -> In Progress -> In Review -> Done (or Blocked)
- Campaigns: Draft -> Planned -> Active -> Completed (or Cancelled)`,
  },
  {
    id: 'naming',
    title: 'Naming Conventions',
    body: `- Campaign titles: "Week [N]: [Theme]" for weekly focuses, descriptive for others
- Asset titles: Clear, descriptive — no abbreviations unless standard (e.g. "S&C")
- Episode format: "EP [N]: [Guest Name] — [Topic]" for podcasts
- Blog posts: SEO-friendly titles, include primary keyword
- Tags: lowercase, hyphen-separated (e.g. "zone-2", "nutrition-basics")
- Topics: Title Case, match the content pillar taxonomy`,
  },
  {
    id: 'tagging',
    title: 'Tagging Practices',
    body: `- Every asset must have at least one content pillar assigned
- Add relevant topics from the topic taxonomy (don't create duplicates)
- Use tags for cross-cutting themes (e.g. "beginner", "advanced", "race-prep")
- Sponsor-related content must be tagged with the sponsor name
- Seasonal content should be tagged with the relevant season/event`,
  },
  {
    id: 'scheduling',
    title: 'Scheduling Guidelines',
    body: `- Podcasts publish on Tuesday mornings (7:00 AM GMT)
- Newsletter goes out on Thursday mornings (8:00 AM GMT)
- Social posts: 2-3 per day spread across platforms
- YouTube Shorts/Reels: daily where possible
- Blog posts: aim for 2 per week minimum
- Allow 48 hours between publishing the same content type
- Sponsor content must be reviewed at least 72 hours before scheduled publication`,
  },
  {
    id: 'review',
    title: 'Review Process',
    body: `- All content must be reviewed before publication
- Self-review is acceptable for social posts and quote cards
- Blog posts, podcasts, and newsletters require a second pair of eyes
- Sponsor content requires both internal review and sponsor approval
- Use the "In Review" status and assign the reviewer
- Leave comments on the asset for feedback — don't use external channels`,
  },
]

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function ConventionsPage() {
  const { toast } = useToast()
  const [sections, setSections] = useState<ConventionSection[]>(DEFAULT_CONVENTIONS)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editBody, setEditBody] = useState('')

  function startEditing(section: ConventionSection) {
    setEditingId(section.id)
    setEditBody(section.body)
  }

  function cancelEditing() {
    setEditingId(null)
    setEditBody('')
  }

  function saveEditing() {
    if (!editingId) return

    setSections((prev) =>
      prev.map((s) =>
        s.id === editingId ? { ...s, body: editBody } : s,
      ),
    )

    toast({
      type: 'success',
      title: 'Convention updated',
      message: 'Your changes have been saved.',
    })

    setEditingId(null)
    setEditBody('')
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-3xl text-off-white uppercase tracking-wide">
          Team Conventions
        </h1>
        <p className="mt-2 text-mid-grey font-body">
          Shared guidelines for how the team operates. Edit any section to update the conventions.
        </p>
      </div>

      <div className="space-y-6">
        {sections.map((section) => {
          const isEditing = editingId === section.id

          return (
            <div
              key={section.id}
              className="rounded-xl border border-mid-grey/20 bg-charcoal overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-mid-grey/20">
                <div className="flex items-center gap-3">
                  <BookOpen className="w-4 h-4 text-coral" />
                  <h2 className="font-heading text-sm uppercase tracking-wider text-off-white">
                    {section.title}
                  </h2>
                </div>

                {!isEditing ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => startEditing(section)}
                    icon={<Pencil className="w-3.5 h-3.5" />}
                  >
                    Edit
                  </Button>
                ) : (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={saveEditing}
                      icon={<Check className="w-3.5 h-3.5" />}
                    >
                      Save
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={cancelEditing}
                      icon={<X className="w-3.5 h-3.5" />}
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </div>

              {/* Body */}
              <div className="px-6 py-4">
                {isEditing ? (
                  <textarea
                    value={editBody}
                    onChange={(e) => setEditBody(e.target.value)}
                    rows={10}
                    className={cn(
                      'w-full bg-deep-purple/20 border border-mid-grey/30 rounded-lg px-4 py-3',
                      'text-sm text-off-white font-mono leading-relaxed',
                      'focus:outline-none focus:border-coral focus:ring-1 focus:ring-coral/50',
                      'resize-y',
                    )}
                  />
                ) : (
                  <div className="text-sm text-off-white/80 leading-relaxed whitespace-pre-wrap">
                    {section.body}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
