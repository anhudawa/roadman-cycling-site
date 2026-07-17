'use client'

import { useState, useRef, useCallback, useEffect, useMemo } from 'react'
import { X, Plus } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { CONTENT_PILLARS } from '@/lib/constants'

export interface TagInputOption {
  id: string
  name: string
  colour?: string | null
  pillar?: string | null
}

export interface TagInputProps {
  /** Array of selected IDs */
  value: string[]
  /** Callback when selection changes */
  onChange: (ids: string[]) => void
  /** Available options to select from */
  options: TagInputOption[]
  /** Input placeholder text */
  placeholder?: string
  /** When true, typing + Enter creates a new item */
  allowCreate?: boolean
  /** Callback to create a new item — returns the created item or null */
  onCreateNew?: (name: string) => Promise<{ id: string; name: string } | null>
  /** When set, group options by pillar */
  groupBy?: 'pillar'
  /** Label displayed above the input */
  label?: string
  /** Error message displayed below the input */
  error?: string
  /** Additional CSS classes */
  className?: string
}

/**
 * Reusable multi-select input with autocomplete, pills, and optional create-new.
 * Supports keyboard navigation and pillar-based grouping.
 */
export function TagInput({
  value,
  onChange,
  options,
  placeholder = 'Search or select...',
  allowCreate = false,
  onCreateNew,
  groupBy,
  label,
  error,
  className,
}: TagInputProps) {
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [highlightIndex, setHighlightIndex] = useState(0)
  const [isCreating, setIsCreating] = useState(false)

  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout>>()

  // Map of id -> option for quick lookup
  const optionMap = useMemo(() => {
    const map = new Map<string, TagInputOption>()
    for (const opt of options) {
      map.set(opt.id, opt)
    }
    return map
  }, [options])

  // Selected option objects
  const selectedOptions = useMemo(
    () => value.map((id) => optionMap.get(id)).filter(Boolean) as TagInputOption[],
    [value, optionMap],
  )

  // Debounced query for filtering
  const [debouncedQuery, setDebouncedQuery] = useState('')

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }
    debounceRef.current = setTimeout(() => {
      setDebouncedQuery(query)
    }, 150)
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [query])

  // Filtered options (exclude already selected, match query)
  const filteredOptions = useMemo(() => {
    const selectedSet = new Set(value)
    return options.filter(
      (opt) =>
        !selectedSet.has(opt.id) &&
        opt.name.toLowerCase().includes(debouncedQuery.toLowerCase()),
    )
  }, [options, value, debouncedQuery])

  // Determine if "Create" option should appear
  const showCreateOption = useMemo(() => {
    if (!allowCreate || !debouncedQuery.trim()) return false
    const normalised = debouncedQuery.trim().toLowerCase()
    return !options.some((opt) => opt.name.toLowerCase() === normalised)
  }, [allowCreate, debouncedQuery, options])

  // Build the flat list used for keyboard navigation
  const flatItems = useMemo(() => {
    const items: { type: 'option' | 'create'; option?: TagInputOption; label?: string }[] = []
    for (const opt of filteredOptions) {
      items.push({ type: 'option', option: opt })
    }
    if (showCreateOption) {
      items.push({ type: 'create', label: debouncedQuery.trim() })
    }
    return items
  }, [filteredOptions, showCreateOption, debouncedQuery])

  // Group options by pillar if requested
  const groupedOptions = useMemo(() => {
    if (groupBy !== 'pillar') return null

    const groups: { label: string; value: string; options: TagInputOption[] }[] = []
    const pillarMap = new Map<string, TagInputOption[]>()
    const ungrouped: TagInputOption[] = []

    for (const opt of filteredOptions) {
      if (opt.pillar) {
        const existing = pillarMap.get(opt.pillar)
        if (existing) {
          existing.push(opt)
        } else {
          pillarMap.set(opt.pillar, [opt])
        }
      } else {
        ungrouped.push(opt)
      }
    }

    for (const pillar of CONTENT_PILLARS) {
      const opts = pillarMap.get(pillar.value)
      if (opts && opts.length > 0) {
        groups.push({ label: pillar.label, value: pillar.value, options: opts })
      }
    }

    if (ungrouped.length > 0) {
      groups.push({ label: 'Other', value: 'other', options: ungrouped })
    }

    return groups
  }, [filteredOptions, groupBy])

  // Reset highlight when filtered options change
  useEffect(() => {
    setHighlightIndex(0)
  }, [flatItems.length])

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const addItem = useCallback(
    (id: string) => {
      if (!value.includes(id)) {
        onChange([...value, id])
      }
      setQuery('')
      setIsOpen(false)
      inputRef.current?.focus()
    },
    [value, onChange],
  )

  const removeItem = useCallback(
    (id: string) => {
      onChange(value.filter((v) => v !== id))
      inputRef.current?.focus()
    },
    [value, onChange],
  )

  const handleCreate = useCallback(
    async (name: string) => {
      if (!onCreateNew || isCreating) return
      setIsCreating(true)
      try {
        const result = await onCreateNew(name)
        if (result) {
          addItem(result.id)
        }
      } finally {
        setIsCreating(false)
      }
    },
    [onCreateNew, isCreating, addItem],
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Escape') {
        setIsOpen(false)
        return
      }

      if (e.key === 'Backspace' && query === '' && value.length > 0) {
        // Remove last selected item
        removeItem(value[value.length - 1])
        return
      }

      if (!isOpen || flatItems.length === 0) return

      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setHighlightIndex((prev) => Math.min(prev + 1, flatItems.length - 1))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setHighlightIndex((prev) => Math.max(prev - 1, 0))
      } else if (e.key === 'Enter') {
        e.preventDefault()
        const item = flatItems[highlightIndex]
        if (item) {
          if (item.type === 'option' && item.option) {
            addItem(item.option.id)
          } else if (item.type === 'create' && item.label) {
            handleCreate(item.label)
          }
        }
      }
    },
    [query, value, isOpen, flatItems, highlightIndex, addItem, removeItem, handleCreate],
  )

  // Compute the flat index of an option for highlight comparison
  const getFlatIndex = useCallback(
    (optionId: string) => {
      return flatItems.findIndex(
        (item) => item.type === 'option' && item.option?.id === optionId,
      )
    },
    [flatItems],
  )

  return (
    <div className={cn('w-full', className)} ref={containerRef}>
      {label && (
        <label className="block text-sm font-medium text-off-white mb-1.5">
          {label}
        </label>
      )}

      {/* Input container with pills */}
      <div
        className={cn(
          'flex flex-wrap items-center gap-1.5 min-h-[42px] bg-charcoal border rounded-lg px-2 py-1.5 cursor-text',
          'transition-colors',
          error
            ? 'border-red-500'
            : isOpen
              ? 'border-coral ring-2 ring-coral/50'
              : 'border-mid-grey/30 hover:border-mid-grey/50',
        )}
        onClick={() => inputRef.current?.focus()}
      >
        {/* Selected pills */}
        {selectedOptions.map((opt) => (
          <span
            key={opt.id}
            className="inline-flex items-center gap-1 bg-purple/20 text-off-white text-sm px-2 py-0.5 rounded-md"
          >
            {opt.colour && (
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: opt.colour }}
              />
            )}
            <span className="truncate max-w-[150px]">{opt.name}</span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                removeItem(opt.id)
              }}
              className="text-mid-grey hover:text-off-white transition-colors ml-0.5"
              aria-label={`Remove ${opt.name}`}
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}

        {/* Text input */}
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setIsOpen(true)
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={selectedOptions.length === 0 ? placeholder : ''}
          className="flex-1 min-w-[80px] bg-transparent text-off-white text-sm placeholder:text-mid-grey outline-none"
        />
      </div>

      {/* Dropdown */}
      {isOpen && (flatItems.length > 0 || showCreateOption) && (
        <div className="relative z-10">
          <div className="absolute top-1 left-0 right-0 max-h-60 overflow-y-auto bg-charcoal border border-mid-grey/20 rounded-lg shadow-xl">
            {groupBy === 'pillar' && groupedOptions ? (
              // Grouped display
              <>
                {groupedOptions.map((group) => (
                  <div key={group.value}>
                    <div className="px-3 py-1.5 text-xs font-heading uppercase text-mid-grey tracking-wider">
                      {group.label}
                    </div>
                    {group.options.map((opt) => {
                      const flatIdx = getFlatIndex(opt.id)
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          className={cn(
                            'w-full flex items-center gap-2 px-3 py-2 text-sm text-left transition-colors',
                            flatIdx === highlightIndex
                              ? 'bg-purple/20 text-off-white'
                              : 'text-off-white/80 hover:bg-white/5',
                          )}
                          onMouseEnter={() => setHighlightIndex(flatIdx)}
                          onClick={() => addItem(opt.id)}
                        >
                          {opt.colour && (
                            <span
                              className="w-2 h-2 rounded-full shrink-0"
                              style={{ backgroundColor: opt.colour }}
                            />
                          )}
                          {opt.name}
                        </button>
                      )
                    })}
                  </div>
                ))}
              </>
            ) : (
              // Flat display
              filteredOptions.map((opt) => {
                const flatIdx = getFlatIndex(opt.id)
                return (
                  <button
                    key={opt.id}
                    type="button"
                    className={cn(
                      'w-full flex items-center gap-2 px-3 py-2 text-sm text-left transition-colors',
                      flatIdx === highlightIndex
                        ? 'bg-purple/20 text-off-white'
                        : 'text-off-white/80 hover:bg-white/5',
                    )}
                    onMouseEnter={() => setHighlightIndex(flatIdx)}
                    onClick={() => addItem(opt.id)}
                  >
                    {opt.colour && (
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: opt.colour }}
                      />
                    )}
                    {opt.name}
                  </button>
                )
              })
            )}

            {/* Create new option */}
            {showCreateOption && (
              <button
                type="button"
                className={cn(
                  'w-full flex items-center gap-2 px-3 py-2 text-sm text-left border-t border-mid-grey/20 transition-colors',
                  flatItems.length - 1 === highlightIndex
                    ? 'bg-purple/20 text-off-white'
                    : 'text-coral hover:bg-white/5',
                )}
                onMouseEnter={() => setHighlightIndex(flatItems.length - 1)}
                onClick={() => handleCreate(debouncedQuery.trim())}
                disabled={isCreating}
              >
                <Plus className="h-3.5 w-3.5" />
                {isCreating ? 'Creating...' : `Create '${debouncedQuery.trim()}'`}
              </button>
            )}
          </div>
        </div>
      )}

      {error && (
        <p className="text-sm text-red-400 mt-1">{error}</p>
      )}
    </div>
  )
}
