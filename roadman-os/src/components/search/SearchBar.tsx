'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Search, FileText, Lightbulb, Target, CheckSquare, FileAudio, X } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type SearchResultItem = {
  entity_type: string
  entity_id: string
  title: string
  description: string | null
  similarity?: number
  metadata?: Record<string, unknown>
}

type GroupedResults = {
  entity_type: string
  label: string
  icon: React.ReactNode
  items: SearchResultItem[]
}

// ---------------------------------------------------------------------------
// Entity type config
// ---------------------------------------------------------------------------

const ENTITY_CONFIG: Record<string, { label: string; icon: React.ReactNode; href: (id: string) => string }> = {
  asset: { label: 'Assets', icon: <FileText className="h-3.5 w-3.5" />, href: (id) => `/assets/${id}` },
  idea: { label: 'Ideas', icon: <Lightbulb className="h-3.5 w-3.5" />, href: (id) => `/ideas/${id}` },
  campaign: { label: 'Campaigns', icon: <Target className="h-3.5 w-3.5" />, href: (id) => `/campaigns/${id}` },
  task: { label: 'Tasks', icon: <CheckSquare className="h-3.5 w-3.5" />, href: (id) => `/tasks/${id}` },
  transcript: { label: 'Transcripts', icon: <FileAudio className="h-3.5 w-3.5" />, href: (id) => `/transcripts/${id}` },
}

const MAX_PER_GROUP = 3

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function SearchBar() {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResultItem[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // -------------------------------------------------------------------------
  // Cmd+K shortcut
  // -------------------------------------------------------------------------
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        inputRef.current?.focus()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // -------------------------------------------------------------------------
  // Close dropdown on outside click
  // -------------------------------------------------------------------------
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // -------------------------------------------------------------------------
  // Debounced search
  // -------------------------------------------------------------------------
  const fetchResults = useCallback(async (q: string) => {
    if (q.length < 2) {
      setResults([])
      setIsOpen(false)
      return
    }

    setIsLoading(true)
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}&mode=keyword&limit=15`)
      if (res.ok) {
        const data = await res.json()
        setResults(data.results ?? [])
        setIsOpen(true)
      }
    } catch {
      // Silently fail — user will see no results
    } finally {
      setIsLoading(false)
    }
  }, [])

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value
    setQuery(value)
    setActiveIndex(-1)

    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    debounceRef.current = setTimeout(() => {
      fetchResults(value)
    }, 200)
  }

  // -------------------------------------------------------------------------
  // Group results by entity type (max 3 per group)
  // -------------------------------------------------------------------------
  const grouped: GroupedResults[] = []
  const typeOrder = ['asset', 'idea', 'campaign', 'task', 'transcript']

  for (const type of typeOrder) {
    const items = results
      .filter((r) => r.entity_type === type)
      .slice(0, MAX_PER_GROUP)

    if (items.length > 0) {
      const config = ENTITY_CONFIG[type]
      if (config) {
        grouped.push({
          entity_type: type,
          label: config.label,
          icon: config.icon,
          items,
        })
      }
    }
  }

  // Flatten for keyboard navigation
  const flatItems = grouped.flatMap((g) => g.items)

  // -------------------------------------------------------------------------
  // Keyboard navigation
  // -------------------------------------------------------------------------
  function handleKeyDown(e: React.KeyboardEvent) {
    if (!isOpen) {
      if (e.key === 'Enter' && query.length >= 2) {
        router.push(`/search?q=${encodeURIComponent(query)}`)
        setIsOpen(false)
      }
      return
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setActiveIndex((prev) => Math.min(prev + 1, flatItems.length - 1))
        break
      case 'ArrowUp':
        e.preventDefault()
        setActiveIndex((prev) => Math.max(prev - 1, -1))
        break
      case 'Enter':
        e.preventDefault()
        if (activeIndex >= 0 && activeIndex < flatItems.length) {
          navigateToResult(flatItems[activeIndex])
        } else {
          router.push(`/search?q=${encodeURIComponent(query)}`)
          setIsOpen(false)
        }
        break
      case 'Escape':
        setIsOpen(false)
        inputRef.current?.blur()
        break
    }
  }

  function navigateToResult(item: SearchResultItem) {
    const config = ENTITY_CONFIG[item.entity_type]
    if (config) {
      router.push(config.href(item.entity_id))
    }
    setIsOpen(false)
    setQuery('')
  }

  function handleClear() {
    setQuery('')
    setResults([])
    setIsOpen(false)
    inputRef.current?.focus()
  }

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  let flatIndex = -1

  return (
    <div ref={containerRef} className="relative hidden md:block">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-mid-grey/50" />
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={() => {
          if (results.length > 0) setIsOpen(true)
        }}
        placeholder="Search... (Cmd+K)"
        className="w-64 rounded-lg border border-mid-grey/30 bg-charcoal py-1.5 pl-10 pr-8 font-body text-sm text-off-white placeholder:text-mid-grey/50 focus:border-coral/50 focus:outline-none focus:ring-1 focus:ring-coral/30"
      />
      {query && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-mid-grey/50 hover:text-off-white"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-80 overflow-y-auto rounded-lg border border-mid-grey/20 bg-charcoal shadow-xl">
          {isLoading && (
            <div className="px-4 py-3 text-sm text-mid-grey">Searching...</div>
          )}

          {!isLoading && grouped.length === 0 && (
            <div className="px-4 py-3 text-sm text-mid-grey">No results found</div>
          )}

          {!isLoading &&
            grouped.map((group) => (
              <div key={group.entity_type}>
                <div className="flex items-center gap-2 px-4 py-1.5 text-[10px] uppercase tracking-wider text-mid-grey/60">
                  {group.icon}
                  <span>{group.label}</span>
                </div>
                {group.items.map((item) => {
                  flatIndex++
                  const idx = flatIndex
                  return (
                    <button
                      key={`${item.entity_type}-${item.entity_id}`}
                      type="button"
                      onClick={() => navigateToResult(item)}
                      onMouseEnter={() => setActiveIndex(idx)}
                      className={cn(
                        'w-full px-4 py-2 text-left text-sm transition-colors',
                        idx === activeIndex
                          ? 'bg-white/10 text-off-white'
                          : 'text-off-white/80 hover:bg-white/5',
                      )}
                    >
                      <div className="truncate font-medium">{item.title}</div>
                      {item.description && (
                        <div className="truncate text-xs text-mid-grey/60">
                          {item.description.slice(0, 80)}
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            ))}

          {!isLoading && grouped.length > 0 && (
            <button
              type="button"
              onClick={() => {
                router.push(`/search?q=${encodeURIComponent(query)}`)
                setIsOpen(false)
              }}
              className="w-full border-t border-mid-grey/20 px-4 py-2 text-left text-xs text-coral hover:bg-white/5"
            >
              View all results for &ldquo;{query}&rdquo;
            </button>
          )}
        </div>
      )}
    </div>
  )
}
