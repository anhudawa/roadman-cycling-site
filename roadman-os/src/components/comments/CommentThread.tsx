'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { formatDistanceToNow } from 'date-fns'
import {
  MessageSquare,
  Send,
  Reply,
  Pencil,
  Trash2,
  X,
  Check,
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { createComment, updateComment, deleteComment } from '@/lib/actions/comments'

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
  task_id: string | null
  idea_id: string | null
  parent_id: string | null
  body: string
  is_resolved: boolean
  created_at: string
  updated_at: string
  author?: CommentAuthor | null
}

type MentionUser = {
  id: string
  display_name: string | null
  full_name: string
}

interface CommentThreadProps {
  /** Entity type this thread belongs to */
  entityType: 'asset' | 'task' | 'idea'
  /** Entity ID for the comment target */
  entityId: string
  /** Pre-loaded comments */
  comments: CommentEntry[]
  /** Current user's profile ID for ownership checks */
  currentUserId: string
  /** Team members for @-mention autocomplete */
  teamMembers?: MentionUser[]
  /** Compact mode for inline/sidebar usage */
  compact?: boolean
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

function getAuthorName(author?: CommentAuthor | null): string {
  if (!author) return 'Unknown'
  return author.display_name || author.full_name
}

/**
 * Render markdown-light formatting: **bold**, *italic*, and [links](url).
 */
function renderBody(body: string): React.ReactNode {
  if (body === '[deleted]') {
    return <span className="italic text-mid-grey">[deleted]</span>
  }

  // Process bold, italic, links, and @-mentions
  const parts: React.ReactNode[] = []
  let remaining = body
  let key = 0

  // Simple regex-based processing
  const regex = /(\*\*(.+?)\*\*)|(\*(.+?)\*)|(\[(.+?)\]\((.+?)\))|(@([a-zA-Z0-9_]+))/g
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = regex.exec(remaining)) !== null) {
    // Add text before match
    if (match.index > lastIndex) {
      parts.push(remaining.slice(lastIndex, match.index))
    }

    if (match[1]) {
      // **bold**
      parts.push(
        <strong key={`b-${key++}`} className="font-semibold">
          {match[2]}
        </strong>,
      )
    } else if (match[3]) {
      // *italic*
      parts.push(
        <em key={`i-${key++}`} className="italic">
          {match[4]}
        </em>,
      )
    } else if (match[5]) {
      // [link](url)
      parts.push(
        <a
          key={`a-${key++}`}
          href={match[7]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-coral hover:text-coral/80 underline"
        >
          {match[6]}
        </a>,
      )
    } else if (match[8]) {
      // @mention
      parts.push(
        <span
          key={`m-${key++}`}
          className="text-coral font-medium"
        >
          {match[8]}
        </span>,
      )
    }

    lastIndex = match.index + match[0].length
  }

  // Add remaining text
  if (lastIndex < remaining.length) {
    parts.push(remaining.slice(lastIndex))
  }

  return parts.length > 0 ? parts : body
}

// ---------------------------------------------------------------------------
// Mention Autocomplete
// ---------------------------------------------------------------------------

function MentionDropdown({
  query,
  users,
  onSelect,
}: {
  query: string
  users: MentionUser[]
  onSelect: (user: MentionUser) => void
}) {
  const filtered = users.filter(
    (u) =>
      (u.display_name?.toLowerCase().includes(query.toLowerCase()) ?? false) ||
      u.full_name.toLowerCase().includes(query.toLowerCase()),
  )

  if (filtered.length === 0) return null

  return (
    <div className="absolute bottom-full left-0 mb-1 w-64 max-h-40 overflow-y-auto rounded-lg border border-mid-grey/30 bg-charcoal shadow-lg z-10">
      {filtered.map((user) => (
        <button
          key={user.id}
          type="button"
          onClick={() => onSelect(user)}
          className="flex items-center gap-2 w-full px-3 py-2 text-sm text-off-white hover:bg-white/10 transition-colors text-left"
        >
          <div className="w-6 h-6 rounded-full bg-purple/30 flex items-center justify-center shrink-0">
            <span className="text-xs text-off-white">
              {getInitials(user.display_name || user.full_name)}
            </span>
          </div>
          <span>{user.display_name || user.full_name}</span>
        </button>
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Single Comment
// ---------------------------------------------------------------------------

function CommentItem({
  comment,
  replies,
  currentUserId,
  entityType,
  entityId,
  teamMembers,
  depth = 0,
}: {
  comment: CommentEntry
  replies: CommentEntry[]
  currentUserId: string
  entityType: 'asset' | 'task' | 'idea'
  entityId: string
  teamMembers: MentionUser[]
  depth?: number
}) {
  const [replying, setReplying] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editBody, setEditBody] = useState(comment.body)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const isOwner = comment.author_id === currentUserId
  const isDeleted = comment.is_resolved && comment.body === '[deleted]'
  const isEdited =
    comment.updated_at !== comment.created_at && !isDeleted
  const name = getAuthorName(comment.author)
  const initials = getInitials(name)

  async function handleEdit() {
    if (!editBody.trim()) return
    setSubmitting(true)
    const result = await updateComment(comment.id, editBody)
    setSubmitting(false)
    if (result.success) {
      setEditing(false)
    }
  }

  async function handleDelete() {
    setSubmitting(true)
    await deleteComment(comment.id)
    setSubmitting(false)
    setConfirmDelete(false)
  }

  return (
    <div className={cn(depth > 0 && 'ml-8 border-l-2 border-mid-grey/20 pl-4')}>
      <div className="flex gap-3 py-3">
        {/* Avatar */}
        <div className="shrink-0 w-8 h-8 rounded-full bg-purple/30 flex items-center justify-center">
          <span className="text-xs font-medium text-off-white">{initials}</span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium text-off-white">{name}</span>
            <span className="text-xs text-mid-grey">
              {formatDistanceToNow(new Date(comment.created_at), {
                addSuffix: true,
              })}
            </span>
            {isEdited && (
              <span className="text-xs text-mid-grey italic">(edited)</span>
            )}
          </div>

          {editing ? (
            <div className="space-y-2">
              <textarea
                value={editBody}
                onChange={(e) => setEditBody(e.target.value)}
                rows={2}
                className={cn(
                  'w-full bg-charcoal border border-mid-grey/30 rounded-lg px-3 py-2',
                  'text-sm text-off-white placeholder:text-mid-grey',
                  'focus:outline-none focus:border-coral focus:ring-1 focus:ring-coral/50',
                  'resize-y',
                )}
              />
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="primary"
                  onClick={handleEdit}
                  loading={submitting}
                  disabled={!editBody.trim()}
                  icon={<Check className="w-3 h-3" />}
                >
                  Save
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setEditing(false)
                    setEditBody(comment.body)
                  }}
                  icon={<X className="w-3 h-3" />}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-off-white/80 whitespace-pre-wrap">
              {renderBody(comment.body)}
            </p>
          )}

          {/* Actions */}
          {!editing && !isDeleted && (
            <div className="flex items-center gap-3 mt-1.5">
              {depth === 0 && (
                <button
                  type="button"
                  onClick={() => setReplying(!replying)}
                  className="flex items-center gap-1 text-xs text-mid-grey hover:text-off-white transition-colors"
                >
                  <Reply className="w-3 h-3" />
                  Reply
                </button>
              )}
              {isOwner && (
                <>
                  <button
                    type="button"
                    onClick={() => setEditing(true)}
                    className="flex items-center gap-1 text-xs text-mid-grey hover:text-off-white transition-colors"
                  >
                    <Pencil className="w-3 h-3" />
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(true)}
                    className="flex items-center gap-1 text-xs text-mid-grey hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                    Delete
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Reply form */}
      {replying && (
        <div className="ml-11 mb-2">
          <CommentInput
            entityType={entityType}
            entityId={entityId}
            parentId={comment.id}
            teamMembers={teamMembers}
            onSubmitted={() => setReplying(false)}
            placeholder="Write a reply..."
            compact
          />
        </div>
      )}

      {/* Replies */}
      {replies.map((reply) => (
        <CommentItem
          key={reply.id}
          comment={reply}
          replies={[]}
          currentUserId={currentUserId}
          entityType={entityType}
          entityId={entityId}
          teamMembers={teamMembers}
          depth={depth + 1}
        />
      ))}

      {/* Delete confirmation */}
      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={handleDelete}
        title="Delete comment"
        message="Are you sure you want to delete this comment? This action cannot be undone."
        confirmText="Delete"
        variant="danger"
        loading={submitting}
      />
    </div>
  )
}

// ---------------------------------------------------------------------------
// Comment Input
// ---------------------------------------------------------------------------

function CommentInput({
  entityType,
  entityId,
  parentId = null,
  teamMembers = [],
  onSubmitted,
  placeholder = 'Write a comment...',
  compact = false,
}: {
  entityType: 'asset' | 'task' | 'idea'
  entityId: string
  parentId?: string | null
  teamMembers?: MentionUser[]
  onSubmitted?: () => void
  placeholder?: string
  compact?: boolean
}) {
  const [body, setBody] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mentionQuery, setMentionQuery] = useState<string | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Detect @-mention typing
  function handleInputChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const value = e.target.value
    setBody(value)

    // Check if user is typing a @-mention
    const cursorPos = e.target.selectionStart
    const textBeforeCursor = value.slice(0, cursorPos)
    const mentionMatch = textBeforeCursor.match(/@(\w*)$/)

    if (mentionMatch) {
      setMentionQuery(mentionMatch[1])
    } else {
      setMentionQuery(null)
    }
  }

  function handleMentionSelect(user: MentionUser) {
    if (!textareaRef.current) return

    const cursorPos = textareaRef.current.selectionStart
    const textBeforeCursor = body.slice(0, cursorPos)
    const mentionMatch = textBeforeCursor.match(/@(\w*)$/)

    if (mentionMatch) {
      const handle = user.display_name || user.full_name.split(' ')[0]
      const before = textBeforeCursor.slice(0, mentionMatch.index)
      const after = body.slice(cursorPos)
      setBody(`${before}@${handle} ${after}`)
    }

    setMentionQuery(null)
    textareaRef.current.focus()
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!body.trim()) return

    setIsSubmitting(true)
    setError(null)

    const formData = new FormData()
    formData.set('body', body.trim())
    formData.set(`${entityType}_id`, entityId)
    if (parentId) {
      formData.set('parent_id', parentId)
    }

    const result = await createComment(formData)

    setIsSubmitting(false)

    if (result.success) {
      setBody('')
      onSubmitted?.()
    } else {
      setError(result.error ?? 'Failed to add comment')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={body}
          onChange={handleInputChange}
          placeholder={placeholder}
          rows={compact ? 2 : 3}
          className={cn(
            'w-full bg-charcoal border border-mid-grey/30 rounded-lg px-4 py-3',
            'text-sm text-off-white placeholder:text-mid-grey',
            'focus:outline-none focus:border-coral focus:ring-2 focus:ring-coral/50',
            'resize-y',
          )}
        />
        {mentionQuery !== null && teamMembers.length > 0 && (
          <MentionDropdown
            query={mentionQuery}
            users={teamMembers}
            onSelect={handleMentionSelect}
          />
        )}
      </div>
      {!compact && (
        <p className="text-xs text-mid-grey">
          Supports **bold**, *italic*, [links](url), and @mentions
        </p>
      )}
      {error && <p className="text-sm text-red-400">{error}</p>}
      <div className="flex justify-end">
        <Button
          type="submit"
          size="sm"
          loading={isSubmitting}
          disabled={!body.trim() || isSubmitting}
          icon={<Send className="w-4 h-4" />}
        >
          {parentId ? 'Reply' : 'Post comment'}
        </Button>
      </div>
    </form>
  )
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export function CommentThread({
  entityType,
  entityId,
  comments,
  currentUserId,
  teamMembers = [],
  compact = false,
}: CommentThreadProps) {
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
              currentUserId={currentUserId}
              entityType={entityType}
              entityId={entityId}
              teamMembers={teamMembers}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<MessageSquare className="w-10 h-10" />}
          title="No comments yet"
          description="Be the first to leave a comment."
        />
      )}

      {/* Add comment form */}
      <CommentInput
        entityType={entityType}
        entityId={entityId}
        teamMembers={teamMembers}
        compact={compact}
      />
    </div>
  )
}
