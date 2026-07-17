'use client'

import { useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { format, parseISO, formatDistanceToNow, isBefore } from 'date-fns'
import { Plus } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { cn } from '@/lib/utils/cn'
import {
  ASSET_TYPES,
  ASSET_STATUSES,
  TASK_STATUSES,
  TASK_PRIORITIES,
  PUBLICATION_STATUSES,
  ACTIVITY_ACTIONS,
} from '@/lib/constants'
import type {
  CampaignAsset,
  CampaignTask,
  CampaignPublication,
  CampaignActivity,
} from '@/lib/queries/campaigns'

// ---------------------------------------------------------------------------
// Badge variant maps
// ---------------------------------------------------------------------------

const assetStatusVariant: Record<string, 'green' | 'blue' | 'amber' | 'grey' | 'red' | 'purple' | 'coral' | 'default'> = {
  idea: 'grey',
  brief_written: 'blue',
  in_production: 'amber',
  in_review: 'purple',
  approved: 'green',
  scheduled: 'blue',
  published: 'green',
  repurposed: 'coral',
  archived: 'grey',
}

const taskStatusVariant: Record<string, 'green' | 'blue' | 'amber' | 'grey' | 'red' | 'purple' | 'default'> = {
  backlog: 'grey',
  todo: 'blue',
  in_progress: 'amber',
  in_review: 'purple',
  done: 'green',
  blocked: 'red',
}

const taskPriorityVariant: Record<string, 'green' | 'blue' | 'amber' | 'grey' | 'red' | 'default'> = {
  low: 'grey',
  medium: 'blue',
  high: 'amber',
  urgent: 'red',
}

const pubStatusVariant: Record<string, 'green' | 'blue' | 'amber' | 'grey' | 'red' | 'default'> = {
  draft: 'grey',
  scheduled: 'blue',
  published: 'green',
  failed: 'red',
  removed: 'grey',
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface CampaignTabsProps {
  campaignId: string
  assets: CampaignAsset[]
  tasks: CampaignTask[]
  publications: CampaignPublication[]
  activity: CampaignActivity[]
}

const TABS = [
  { key: 'assets', label: 'Assets' },
  { key: 'tasks', label: 'Tasks' },
  { key: 'publications', label: 'Publications' },
  { key: 'activity', label: 'Activity' },
] as const

type TabKey = (typeof TABS)[number]['key']

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function CampaignTabs({
  campaignId,
  assets,
  tasks,
  publications,
  activity,
}: CampaignTabsProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const activeTab = (searchParams.get('tab') as TabKey) || 'assets'

  const switchTab = useCallback(
    (tab: string) => {
      const params = new URLSearchParams(searchParams.toString())
      params.set('tab', tab)
      router.push(`/campaigns/${campaignId}?${params.toString()}`)
    },
    [router, searchParams, campaignId],
  )

  return (
    <div>
      {/* Tab navigation */}
      <div className="flex gap-6 border-b border-mid-grey/20 mb-6">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => switchTab(tab.key)}
            className={cn(
              'pb-3 text-sm font-medium transition-colors',
              activeTab === tab.key
                ? 'text-coral border-b-2 border-coral'
                : 'text-mid-grey hover:text-off-white',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'assets' && (
        <AssetsTab assets={assets} campaignId={campaignId} />
      )}
      {activeTab === 'tasks' && <TasksTab tasks={tasks} />}
      {activeTab === 'publications' && (
        <PublicationsTab publications={publications} />
      )}
      {activeTab === 'activity' && <ActivityTab activity={activity} />}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Assets tab
// ---------------------------------------------------------------------------

function AssetsTab({ assets, campaignId }: { assets: CampaignAsset[]; campaignId: string }) {
  if (assets.length === 0) {
    return (
      <EmptyState
        title="No assets linked to this campaign"
        description="Create an asset and link it to this campaign."
        action={
          <Link href={`/assets/new?campaign_id=${campaignId}`}>
            <Button icon={<Plus className="h-4 w-4" />}>Create Asset</Button>
          </Link>
        }
      />
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-mid-grey/20 text-left">
            <th className="pb-3 font-medium text-mid-grey">Title</th>
            <th className="pb-3 font-medium text-mid-grey">Type</th>
            <th className="pb-3 font-medium text-mid-grey">Status</th>
            <th className="pb-3 font-medium text-mid-grey">Assigned To</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-mid-grey/10">
          {assets.map((asset) => {
            const typeLabel = ASSET_TYPES.find((t) => t.value === asset.type)?.label ?? asset.type
            const statusLabel = ASSET_STATUSES.find((s) => s.value === asset.status)?.label ?? asset.status

            return (
              <tr key={asset.id} className="group">
                <td className="py-3 pr-4">
                  <Link
                    href={`/assets/${asset.id}`}
                    className="text-off-white hover:text-coral transition-colors"
                  >
                    {asset.title}
                  </Link>
                </td>
                <td className="py-3 pr-4">
                  <Badge variant="default" size="sm">{typeLabel}</Badge>
                </td>
                <td className="py-3 pr-4">
                  <Badge variant={assetStatusVariant[asset.status] ?? 'default'} size="sm">
                    {statusLabel}
                  </Badge>
                </td>
                <td className="py-3 text-mid-grey">
                  {asset.assignee?.full_name ?? '—'}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Tasks tab
// ---------------------------------------------------------------------------

function TasksTab({ tasks }: { tasks: CampaignTask[] }) {
  if (tasks.length === 0) {
    return <EmptyState title="No tasks for this campaign" />
  }

  const now = new Date()

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-mid-grey/20 text-left">
            <th className="pb-3 font-medium text-mid-grey">Title</th>
            <th className="pb-3 font-medium text-mid-grey">Status</th>
            <th className="pb-3 font-medium text-mid-grey">Priority</th>
            <th className="pb-3 font-medium text-mid-grey">Assignee</th>
            <th className="pb-3 font-medium text-mid-grey">Due Date</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-mid-grey/10">
          {tasks.map((task) => {
            const statusLabel = TASK_STATUSES.find((s) => s.value === task.status)?.label ?? task.status
            const priorityLabel = TASK_PRIORITIES.find((p) => p.value === task.priority)?.label ?? task.priority
            const isOverdue = task.due_date && isBefore(parseISO(task.due_date), now) && task.status !== 'done'

            return (
              <tr key={task.id}>
                <td className="py-3 pr-4 text-off-white">{task.title}</td>
                <td className="py-3 pr-4">
                  <Badge variant={taskStatusVariant[task.status] ?? 'default'} size="sm">
                    {statusLabel}
                  </Badge>
                </td>
                <td className="py-3 pr-4">
                  <Badge variant={taskPriorityVariant[task.priority] ?? 'default'} size="sm">
                    {priorityLabel}
                  </Badge>
                </td>
                <td className="py-3 pr-4 text-mid-grey">
                  {task.assignee?.full_name ?? '—'}
                </td>
                <td className={cn('py-3', isOverdue ? 'text-red-400' : 'text-mid-grey')}>
                  {task.due_date ? format(parseISO(task.due_date), 'd MMM yyyy') : '—'}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Publications tab
// ---------------------------------------------------------------------------

function PublicationsTab({ publications }: { publications: CampaignPublication[] }) {
  if (publications.length === 0) {
    return <EmptyState title="No publications scheduled" />
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-mid-grey/20 text-left">
            <th className="pb-3 font-medium text-mid-grey">Asset</th>
            <th className="pb-3 font-medium text-mid-grey">Platform</th>
            <th className="pb-3 font-medium text-mid-grey">Scheduled</th>
            <th className="pb-3 font-medium text-mid-grey">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-mid-grey/10">
          {publications.map((pub) => {
            const statusLabel = PUBLICATION_STATUSES.find((s) => s.value === pub.status)?.label ?? pub.status

            return (
              <tr key={pub.id}>
                <td className="py-3 pr-4 text-off-white">{pub.asset_title}</td>
                <td className="py-3 pr-4 text-mid-grey">{pub.platform_name}</td>
                <td className="py-3 pr-4 text-mid-grey">
                  {pub.scheduled_at ? format(parseISO(pub.scheduled_at), 'd MMM yyyy') : '—'}
                </td>
                <td className="py-3">
                  <Badge variant={pubStatusVariant[pub.status] ?? 'default'} size="sm">
                    {statusLabel}
                  </Badge>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Activity tab
// ---------------------------------------------------------------------------

function ActivityTab({ activity }: { activity: CampaignActivity[] }) {
  if (activity.length === 0) {
    return <EmptyState title="No activity recorded" />
  }

  return (
    <ul className="space-y-3">
      {activity.map((entry) => {
        const actionLabel = ACTIVITY_ACTIONS.find((a) => a.value === entry.action)?.label ?? entry.action

        return (
          <li
            key={entry.id}
            className="flex items-start justify-between gap-4 rounded-lg border border-mid-grey/10 bg-deep-purple/5 px-4 py-3"
          >
            <div className="min-w-0 flex-1">
              <p className="text-sm text-off-white">
                <span className="font-medium">{entry.actor_name ?? 'System'}</span>
                {' '}
                <span className="text-mid-grey">{actionLabel.toLowerCase()}</span>
                {' this campaign'}
              </p>
            </div>
            <span className="shrink-0 text-xs text-mid-grey">
              {formatDistanceToNow(parseISO(entry.created_at), { addSuffix: true })}
            </span>
          </li>
        )
      })}
    </ul>
  )
}
