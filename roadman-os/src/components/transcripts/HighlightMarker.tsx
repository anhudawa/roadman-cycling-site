'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import { addHighlight } from '@/lib/actions/transcripts'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type HighlightType = {
  label: string
  colour: string
  name: string
}

const HIGHLIGHT_TYPES: HighlightType[] = [
  { label: 'quote', colour: '#3B82F6', name: 'Quote' },
  { label: 'insight', colour: '#4C1273', name: 'Insight' },
  { label: 'action_item', colour: '#F16363', name: 'Action Item' },
  { label: 'clip_worthy', colour: '#22C55E', name: 'Clip-Worthy' },
  { label: 'fact', colour: '#EAB308', name: 'Fact' },
]

interface HighlightMarkerProps {
  selectedText: string
  startMs: number
  endMs: number
  transcriptId: string
  position: { top: number; left: number }
  onClose: () => void
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function HighlightMarker({
  selectedText,
  startMs,
  endMs,
  transcriptId,
  position,
  onClose,
}: HighlightMarkerProps) {
  const [selectedType, setSelectedType] = useState<HighlightType>(HIGHLIGHT_TYPES[0])
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const toolbarRef = useRef<HTMLDivElement>(null)

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (toolbarRef.current && !toolbarRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onClose])

  // Close on Escape
  useEffect(() => {
    function handleEsc(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [onClose])

  const handleSave = useCallback(async () => {
    setSaving(true)
    setError(null)

    const result = await addHighlight({
      transcript_id: transcriptId,
      start_ms: startMs,
      end_ms: endMs,
      text: selectedText,
      label: selectedType.label,
      colour: selectedType.colour,
      notes: notes || undefined,
    })

    setSaving(false)

    if (result.success) {
      onClose()
    } else {
      setError(result.error ?? 'Failed to save highlight')
    }
  }, [transcriptId, startMs, endMs, selectedText, selectedType, notes, onClose])

  return (
    <div
      ref={toolbarRef}
      className="fixed z-50 bg-charcoal border border-mid-grey/30 rounded-xl shadow-xl p-4 w-80"
      style={{
        top: `${position.top - 10}px`,
        left: `${Math.max(position.left - 160, 16)}px`,
        transform: 'translateY(-100%)',
      }}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-2 right-2 text-mid-grey hover:text-off-white transition-colors"
        aria-label="Close"
      >
        <X className="h-4 w-4" />
      </button>

      {/* Selected text preview */}
      <p className="text-xs text-mid-grey mb-3 line-clamp-2 pr-6">
        &ldquo;{selectedText}&rdquo;
      </p>

      {/* Type selector */}
      <div className="flex flex-wrap gap-2 mb-3">
        {HIGHLIGHT_TYPES.map((type) => (
          <button
            key={type.label}
            onClick={() => setSelectedType(type)}
            className="flex items-center gap-1.5 px-2 py-1 rounded-full text-xs transition-all"
            style={{
              backgroundColor:
                selectedType.label === type.label
                  ? type.colour
                  : `${type.colour}20`,
              color:
                selectedType.label === type.label ? '#FAFAFA' : type.colour,
            }}
          >
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: type.colour }}
            />
            {type.name}
          </button>
        ))}
      </div>

      {/* Note field */}
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Add a note (optional)..."
        rows={2}
        className="w-full bg-deep-purple/20 border border-mid-grey/20 rounded-lg px-3 py-2 text-sm text-off-white placeholder:text-mid-grey/50 resize-none focus:outline-none focus:border-coral/50 mb-3"
      />

      {/* Error message */}
      {error && (
        <p className="text-xs text-red-400 mb-2">{error}</p>
      )}

      {/* Save button */}
      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full bg-coral hover:bg-coral/90 disabled:bg-coral/50 text-off-white text-sm font-medium py-2 rounded-lg transition-colors"
      >
        {saving ? 'Saving...' : 'Save Highlight'}
      </button>
    </div>
  )
}
