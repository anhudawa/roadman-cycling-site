import Link from 'next/link'
import { Plus, CheckSquare } from 'lucide-react'
import { PageHeader } from '@/components/ui/PageHeader'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { getTasks } from '@/lib/queries/tasks'
import { getProfiles, getActiveCampaigns } from '@/lib/queries/campaigns'
import { TaskBoard } from '@/components/tasks/TaskBoard'

export const metadata = {
  title: 'Tasks — Roadman OS',
}

export default async function TasksPage() {
  const [tasks, profiles, campaigns] = await Promise.all([
    getTasks(),
    getProfiles(),
    getActiveCampaigns(),
  ])

  // Map profiles and campaigns to the shape the filter dropdowns expect
  const profileOptions = profiles.map((p) => ({ id: p.id, full_name: p.full_name }))
  const campaignOptions = campaigns.map((c) => ({ id: c.id, title: c.title }))

  return (
    <div>
      <PageHeader
        title="Tasks"
        description="Manage and track your team's tasks."
        actions={
          <Link href="/tasks/new">
            <Button icon={<Plus className="h-4 w-4" />}>
              New Task
            </Button>
          </Link>
        }
      />

      {tasks.length === 0 ? (
        <EmptyState
          icon={<CheckSquare className="w-12 h-12" />}
          title="No tasks yet"
          description="Create your first task to start tracking work."
          action={
            <Link href="/tasks/new">
              <Button icon={<Plus className="h-4 w-4" />}>
                New Task
              </Button>
            </Link>
          }
        />
      ) : (
        <TaskBoard
          tasks={tasks}
          profiles={profileOptions}
          campaigns={campaignOptions}
        />
      )}
    </div>
  )
}
