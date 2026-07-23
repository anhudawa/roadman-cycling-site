'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { HighlightMarker } from './HighlightMarker'
import type { Transcript, TranscriptHighlight } from '@/types/database'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Segment = {
  start_ms: number
  end_ms: number
  speaker?: string
  text: string
}

interface TranscriptViewerProps {
  transcript: Transcript
  highlights: TranscriptHighlight[]
  transcriptId: string
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatTimestamp(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  return [
    hours.toString().padStart(2, '0'),
    minutes.toString().padStart(2, '0'),
    seconds.toString().padStart(2, '0'),
  ].join(':')
}

function parseSegments(transcript: Transcript): Segment[] {
  // If segments exist, use them
  if (transcript.segments && transcript.segments.length > 0) {
    return transcript.segments.map((s) => {
      const seg = s as Record<string, unknown>
      return {
        start_ms: (seg.start_ms as number) ?? (seg.start as number) ?? 0,
        end_ms: (seg.end_ms as number) ?? (seg.end as number) ?? 0,
        speaker: (seg.speaker as string) ?? undefined,
        text: (seg.text as string) ?? '',
      }
    })
  }

  // Fallback: split full_text by paragraphs
  if (!transcript.full_text) return []

  const paragraphs = transcript.full_text.split('\n\n').filter(Boolean)
  const avgMs = transcript.word_count
    ? (transcript.word_count / paragraphs.length) * 400 // rough ~150 wpm
    : 30000

  return paragraphs.map((text, i) => ({
    start_ms: Math.round(i * avgMs),
    end_ms: Math.round((i + 1) * avgMs),
    text: text.trim(),
  }))
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function TranscriptViewer({
  transcript,
  highlights,
  transcriptId,
}: TranscriptViewerProps) {
  const [selection, setSelection] = useState<{
    text: string
    startMs: number
    endMs: number
    rect: { top: number; left: number }
  } | null>(null)

  const viewerRef = useRef<HTMLDivElement>(null)
  const segments = parseSegments(transcript)

  const handleTextSelect = useCallback(() => {
    const sel = window.getSelection()
    if (!sel || sel.isCollapsed || !sel.rangeCount) {
      return
    }

    const text = sel.toString().trim()
    if (!text) return

    // Find which segment the selection is in
    const range = sel.getRangeAt(0)
    const rect = range.getBoundingClientRect()
    const container = range.startContainer.parentElement?.closest('[data-segment-index]')
    const segmentIndex = container
      ? parseInt(container.getAttribute('data-segment-index') ?? '0', 10)
      : 0

    const segment = segments[segmentIndex]
    if (!segment) return

    setSelection({
      text,
      startMs: segment.start_ms,
      endMs: segment.end_ms,
      rect: {
        top: rect.top + window.scrollY,
        left: rect.left + rect.width / 2,
      },
    })
  }, [segments])

  // Listen for mouseup on the viewer
  useEffect(() => {
    const el = viewerRef.current
    if (!el) return

    el.addEventListener('mouseup', handleTextSelect)
    return () => el.removeEventListener('mouseup', handleTextSelect)
  }, [handleTextSelect])

  const handleMarkerClose = useCallback(() => {
    setSelection(null)
    window.getSelection()?.removeAllRanges()
  }, [])

  // Build set of highlighted ranges for visual marking
  const highlightedRanges = highlights.map((h) => ({
    start_ms: h.start_ms,
    end_ms: h.end_ms,
    colour: h.colour ?? '#4C1273',
    label: h.label ?? '',
  }))

  return (
    <div ref={viewerRef} className="relative">
      {/* Segments */}
      <div className="space-y-4">
        {segments.map((segment, i) => {
          // Check if this segment has any highlights
          const segHighlights = highlightedRanges.filter(
            (h) =>
              (h.start_ms >= segment.start_ms && h.start_ms < segment.end_ms) ||
              (h.end_ms > segment.start_ms && h.end_ms <= segment.end_ms),
          )

          return (
            <div
              key={i}
              data-segment-index={i}
              className="flex gap-4 group"
            >
              {/* Timestamp */}
              <div className="shrink-0 w-20 pt-0.5">
                <span className="text-xs font-mono text-mid-grey/60 group-hover:text-mid-grey transition-colors">
                  {formatTimestamp(segment.start_ms)}
                </span>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                {segment.speaker && (
                  <span className="font-bold text-coral text-sm mr-2">
                    {segment.speaker}:
                  </span>
                )}
                <span
                  className="text-off-white text-sm leading-relaxed"
                  style={
                    segHighlights.length > 0
                      ? { borderLeft: `3px solid ${segHighlights[0].colour}`, paddingLeft: '8px' }
                      : undefined
                  }
                >
                  {segment.text}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Floating highlight marker */}
      {selection && (
        <HighlightMarker
          selectedText={selection.text}
          startMs={selection.startMs}
          endMs={selection.endMs}
          transcriptId={transcriptId}
          position={selection.rect}
          onClose={handleMarkerClose}
        />
      )}
    </div>
  )
}
