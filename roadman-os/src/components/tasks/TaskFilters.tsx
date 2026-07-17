'use client'

import { LayoutGrid, List } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { TASK_PRIORITIES } from '@/lib/constants'
import type { Profile, Campaign } from '@/types/database'

export type ViewMode = 'kanban' | 'list'

export interface TaskFiltersProps {
  /** Current view mode */
  view: ViewMode
  /** Callback when the view mode is toggled */
  onViewChange: (view: ViewMode) => void
  /** Currently selected priority filter */
  priority: string
  /** Callback when priority filter changes */
  onPriorityChange: (priority: string) => void
  /** Currently selected assignee filter */
  assigneeId: string
  /** Callback when assignee filter changes */
  onAssigneeChange: (assigneeId: string) => void
  /** Currently selected campaign filter */
  campaignId: string
  /** Callback when campaign filter changes */
  onCampaignChange: (campaignId: string) => void
  /** Available profiles for the assignee dropdown */
  profiles: Pick<Profile, 'id' | 'full_name'>[]
  /** Available campaigns for the campaign dropdown */
  campaigns: Pick<Campaign, 'id' | 'title'>[]
}

/**
 * Filter bar for the Tasks page with view toggle and filter dropdowns.
 */
export function TaskFilters({
  view,
  onViewChange,
  priority,
  onPriorityChange,
  assigneeId,
  onAssigneeChange,
  campaignId,
  onCampaignChange,
  profiles,
  campaigns,
}: TaskFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 mb-6">
      {/* View Toggle */}
      <div className="flex items-center rounded-lg border border-mid-grey/30 overflow-hidden">
        <button
          type="button"
          onClick={() => onViewChange('kanban')}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 text-sm transition-colors',
            view === 'kanban'
              ? 'bg-purple/20 text-off-white'
              : 'text-mid-grey hover:text-off-white hover:bg-white/5',
          )}
        >
          <LayoutGrid className="h-4 w-4" />
          Kanban
        </button>
        <button
          type="button"
          onClick={() => onViewChange('list')}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 text-sm transition-colors',
            view === 'list'
              ? 'bg-purple/20 text-off-white'
              : 'text-mid-grey hover:text-off-white hover:bg-white/5',
          )}
        >
          <List className="h-4 w-4" />
          List
        </button>
      </div>

      {/* Priority Filter */}
      <select
        value={priority}
        onChange={(e) => onPriorityChange(e.target.value)}
        className="appearance-none bg-charcoal border border-mid-grey/30 rounded-lg px-3 py-1.5 pr-8 text-sm text-off-white focus:outline-none focus:ring-2 focus:ring-coral/50 focus:border-coral transition-colors"
      >
        <option value="">All Priorities</option>
        {TASK_PRIORITIES.map((p) => (
          <option key={p.value} value={p.value}>
            {p.label}
          </option>
        ))}
      </select>

      {/* Assignee Filter */}
      <select
        value={assigneeId}
        onChange={(e) => onAssigneeChange(e.target.value)}
        className="appearance-none bg-charcoal border border-mid-grey/30 rounded-lg px-3 py-1.5 pr-8 text-sm text-off-white focus:outline-none focus:ring-2 focus:ring-coral/50 focus:border-coral transition-colors"
      >
        <option value="">All Assignees</option>
        {profiles.map((p) => (
          <option key={p.id} value={p.id}>
            {p.full_name}
          </option>
        ))}
      </select>

      {/* Campaign Filter */}
      <select
        value={campaignId}
        onChange={(e) => onCampaignChange(e.target.value)}
        className="appearance-none bg-charcoal border border-mid-grey/30 rounded-lg px-3 py-1.5 pr-8 text-sm text-off-white focus:outline-none focus:ring-2 focus:ring-coral/50 focus:border-coral transition-colors"
      >
        <option value="">All Campaigns</option>
        {campaigns.map((c) => (
          <option key={c.id} value={c.id}>
            {c.title}
          </option>
        ))}
      </select>

      {/* Clear Filters */}
      {(priority || assigneeId || campaignId) && (
        <button
          type="button"
          onClick={() => {
            onPriorityChange('')
            onAssigneeChange('')
            onCampaignChange('')
          }}
          className="text-sm text-mid-grey hover:text-coral transition-colors"
        >
          Clear filters
        </button>
      )}
    </div>
  )
}
