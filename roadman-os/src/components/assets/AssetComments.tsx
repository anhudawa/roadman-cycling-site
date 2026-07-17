'use client'

import { useState, useCallback } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { MessageSquare, Send } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { createComment } from '@/lib/actions/comments'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type CommentAuthor = {
  id: string
  display_name: string | null
  full_name: string
  avatar_url: string | null
}

type CommentEntry = {
  id: string
  author_id: string
  asset_id: string | null
  parent_id: string | null
  body: string
  is_resolved: boolean
  created_at: string
  author?: CommentAuthor
}

interface AssetCommentsProps {
  assetId: string
  comments: CommentEntry[]
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

function getAuthorName(author?: CommentAuthor): string {
  if (!author) return 'Unknown'
  return author.display_name || author.full_name
}

// ---------------------------------------------------------------------------
// Single comment
// ---------------------------------------------------------------------------

function CommentItem({
  comment,
  replies,
  depth = 0,
}: {
  comment: CommentEntry
  replies: CommentEntry[]
  depth?: number
}) {
  const name = getAuthorName(comment.author)
  const initials = getInitials(name)

  return (
    <div className={cn(depth > 0 && 'ml-8 border-l-2 border-mid-grey/20 pl-4')}>
      <div className="flex gap-3 py-3">
        {/* Avatar / initials */}
        <div className="shrink-0 w-8 h-8 rounded-full bg-purple/30 flex items-center justify-center">
          <span className="text-xs font-medium text-off-white">
            {initials}
          </span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium text-off-white">
              {name}
            </span>
            <span className="text-xs text-mid-grey">
              {formatDistanceToNow(new Date(comment.created_at), {
                addSuffix: true,
              })}
            </span>
          </div>
          <p className="text-sm text-off-white/80 whitespace-pre-wrap">
            {comment.body}
          </p>
        </div>
      </div>

      {/* Replies */}
      {replies.map((reply) => (
        <CommentItem
          key={reply.id}
          comment={reply}
          replies={[]}
          depth={depth + 1}
        />
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function AssetComments({ assetId, comments }: AssetCommentsProps) {
  const [body, setBody] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Separate top-level comments from replies
  const topLevel = comments.filter((c) => !c.parent_id)
  const repliesByParent = new Map<string, CommentEntry[]>()
  for (const comment of comments) {
    if (comment.parent_id) {
      const existing = repliesByParent.get(comment.parent_id) ?? []
      existing.push(comment)
      repliesByParent.set(comment.parent_id, existing)
    }
  }

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      if (!body.trim()) return

      setIsSubmitting(true)
      setError(null)

      const formData = new FormData()
      formData.set('body', body.trim())
      formData.set('asset_id', assetId)

      const result = await createComment(formData)

      setIsSubmitting(false)

      if (result.success) {
        setBody('')
      } else {
        setError(result.error ?? 'Failed to add comment')
      }
    },
    [body, assetId],
  )

  return (
    <div className="space-y-4">
      {/* Comment list */}
      {topLevel.length > 0 ? (
        <div className="divide-y divide-mid-grey/10">
          {topLevel.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              replies={repliesByParent.get(comment.id) ?? []}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<MessageSquare className="w-10 h-10" />}
          title="No comments yet"
          description="Be the first to leave a comment on this asset."
        />
      )}

      {/* Add comment form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Write a comment..."
          rows={3}
          className={cn(
            'w-full bg-charcoal border border-mid-grey/30 rounded-lg px-4 py-3',
            'text-sm text-off-white placeholder:text-mid-grey',
            'focus:outline-none focus:border-coral focus:ring-2 focus:ring-coral/50',
            'resize-y',
          )}
        />
        {error && <p className="text-sm text-red-400">{error}</p>}
        <div className="flex justify-end">
          <Button
            type="submit"
            size="sm"
            loading={isSubmitting}
            disabled={!body.trim() || isSubmitting}
            icon={<Send className="w-4 h-4" />}
          >
            Post comment
          </Button>
        </div>
      </form>
    </div>
  )
}
