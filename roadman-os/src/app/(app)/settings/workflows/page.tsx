'use client'

import { useState } from 'react'
import {
  Mic,
  PenLine,
  Megaphone,
  CheckCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import { createTask } from '@/lib/actions/tasks'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type WorkflowTask = {
  title: string
  description: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  labels: string[]
}

type WorkflowTemplate = {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  tasks: WorkflowTask[]
}

// ---------------------------------------------------------------------------
// Templates
// ---------------------------------------------------------------------------

const WORKFLOW_TEMPLATES: WorkflowTemplate[] = [
  {
    id: 'new-podcast-episode',
    name: 'New Podcast Episode',
    description: 'Full workflow from recording to publication with 8 tasks.',
    icon: <Mic className="w-5 h-5" />,
    tasks: [
      {
        title: 'Record episode',
        description: 'Record the podcast episode with guest if applicable.',
        priority: 'high',
        labels: ['podcast', 'recording'],
      },
      {
        title: 'Edit audio',
        description: 'Clean up audio, add intro/outro, level audio.',
        priority: 'high',
        labels: ['podcast', 'editing'],
      },
      {
        title: 'Write show notes',
        description: 'Write episode description, timestamps, and key takeaways.',
        priority: 'medium',
        labels: ['podcast', 'copywriting'],
      },
      {
        title: 'Create thumbnail',
        description: 'Design episode thumbnail for YouTube and social media.',
        priority: 'medium',
        labels: ['podcast', 'design'],
      },
      {
        title: 'Upload to hosting',
        description: 'Upload final audio to podcast hosting platform.',
        priority: 'high',
        labels: ['podcast', 'distribution'],
      },
      {
        title: 'Schedule YouTube video',
        description: 'Upload video version, add metadata, and schedule.',
        priority: 'high',
        labels: ['podcast', 'youtube'],
      },
      {
        title: 'Create social clips',
        description: 'Cut 3-5 short clips for Reels/TikTok/Shorts.',
        priority: 'medium',
        labels: ['podcast', 'social', 'repurpose'],
      },
      {
        title: 'Newsletter mention',
        description: 'Add episode link and summary to weekly newsletter.',
        priority: 'low',
        labels: ['podcast', 'newsletter'],
      },
    ],
  },
  {
    id: 'new-blog-post',
    name: 'New Blog Post',
    description: 'Blog post workflow from draft to publication with 5 tasks.',
    icon: <PenLine className="w-5 h-5" />,
    tasks: [
      {
        title: 'Research and outline',
        description: 'Research topic, gather sources, create outline with H2/H3 structure.',
        priority: 'high',
        labels: ['blog', 'research'],
      },
      {
        title: 'Write first draft',
        description: 'Write the full article following the outline and SEO brief.',
        priority: 'high',
        labels: ['blog', 'writing'],
      },
      {
        title: 'Review and edit',
        description: 'Proofread, check facts, improve flow, add internal links.',
        priority: 'medium',
        labels: ['blog', 'review'],
      },
      {
        title: 'Add images and formatting',
        description: 'Add featured image, in-body images, format headings and CTAs.',
        priority: 'medium',
        labels: ['blog', 'design'],
      },
      {
        title: 'Publish and promote',
        description: 'Publish on website, share on social channels, notify newsletter.',
        priority: 'high',
        labels: ['blog', 'distribution'],
      },
    ],
  },
  {
    id: 'sponsor-campaign',
    name: 'Sponsor Campaign',
    description: 'End-to-end sponsor deliverable workflow with 6 tasks.',
    icon: <Megaphone className="w-5 h-5" />,
    tasks: [
      {
        title: 'Create campaign brief',
        description: 'Define sponsor deliverables, timelines, and creative requirements.',
        priority: 'urgent',
        labels: ['sponsor', 'planning'],
      },
      {
        title: 'Produce sponsored content',
        description: 'Create the sponsored asset(s) as per the brief.',
        priority: 'high',
        labels: ['sponsor', 'production'],
      },
      {
        title: 'Sponsor review',
        description: 'Send content to sponsor for approval and incorporate feedback.',
        priority: 'high',
        labels: ['sponsor', 'review'],
      },
      {
        title: 'Schedule publication',
        description: 'Schedule the approved content across agreed platforms.',
        priority: 'high',
        labels: ['sponsor', 'distribution'],
      },
      {
        title: 'Collect performance data',
        description: 'Gather analytics after publication for the sponsor report.',
        priority: 'medium',
        labels: ['sponsor', 'analytics'],
      },
      {
        title: 'Deliver sponsor report',
        description: 'Compile performance report and send to sponsor contact.',
        priority: 'high',
        labels: ['sponsor', 'reporting'],
      },
    ],
  },
]

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function WorkflowTemplatesPage() {
  const { toast } = useToast()
  const [applying, setApplying] = useState<string | null>(null)
  const [campaignId, setCampaignId] = useState('')
  const [expandedTemplate, setExpandedTemplate] = useState<string | null>(null)

  async function handleApplyTemplate(template: WorkflowTemplate) {
    if (!campaignId.trim()) {
      toast({
        type: 'warning',
        title: 'Campaign ID required',
        message: 'Enter a campaign ID to link the tasks to.',
      })
      return
    }

    setApplying(template.id)

    try {
      // Create tasks via server action
      for (const task of template.tasks) {
        const formData = new FormData()
        formData.set('title', task.title)
        formData.set('description', task.description)
        formData.set('priority', task.priority)
        formData.set('labels', JSON.stringify(task.labels))
        formData.set('campaign_id', campaignId.trim())
        formData.set('status', 'backlog')
        await createTask(formData)
      }

      toast({
        type: 'success',
        title: 'Template applied',
        message: `${template.tasks.length} tasks created from "${template.name}".`,
      })

      setCampaignId('')
    } catch {
      toast({
        type: 'error',
        title: 'Failed to apply template',
        message: 'An error occurred while creating the tasks.',
      })
    } finally {
      setApplying(null)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-3xl text-off-white uppercase tracking-wide">
          Workflow Templates
        </h1>
        <p className="mt-2 text-mid-grey font-body">
          Pre-built task templates for common content workflows. Apply a template to create linked tasks for a campaign.
        </p>
      </div>

      {/* Campaign ID input */}
      <div className="rounded-xl border border-mid-grey/20 bg-charcoal p-5">
        <label className="text-sm text-mid-grey mb-2 block">
          Campaign ID (paste from campaign detail page)
        </label>
        <input
          type="text"
          value={campaignId}
          onChange={(e) => setCampaignId(e.target.value)}
          placeholder="Enter campaign ID..."
          className={cn(
            'w-full max-w-md bg-charcoal border border-mid-grey/30 rounded-lg px-4 py-2.5',
            'text-sm text-off-white placeholder:text-mid-grey',
            'focus:outline-none focus:border-coral focus:ring-1 focus:ring-coral/50',
          )}
        />
      </div>

      {/* Templates */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {WORKFLOW_TEMPLATES.map((template) => {
          const isExpanded = expandedTemplate === template.id
          const isApplying = applying === template.id

          return (
            <div
              key={template.id}
              className="rounded-xl border border-mid-grey/20 bg-charcoal overflow-hidden"
            >
              {/* Header */}
              <div className="p-5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="text-coral">{template.icon}</div>
                  <h3 className="font-heading text-base uppercase tracking-wide text-off-white">
                    {template.name}
                  </h3>
                </div>
                <p className="text-sm text-mid-grey mb-4">
                  {template.description}
                </p>

                <div className="flex items-center gap-2">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleApplyTemplate(template)}
                    loading={isApplying}
                    disabled={isApplying || !campaignId.trim()}
                  >
                    Apply Template
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setExpandedTemplate(isExpanded ? null : template.id)
                    }
                  >
                    {isExpanded ? 'Hide tasks' : `View ${template.tasks.length} tasks`}
                  </Button>
                </div>
              </div>

              {/* Task list (expandable) */}
              {isExpanded && (
                <div className="border-t border-mid-grey/20 divide-y divide-mid-grey/10">
                  {template.tasks.map((task, idx) => (
                    <div key={idx} className="px-5 py-3">
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-mid-grey/50 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-off-white">
                            {task.title}
                          </p>
                          <p className="text-xs text-mid-grey mt-0.5">
                            {task.description}
                          </p>
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            <span
                              className={cn(
                                'text-xs px-1.5 py-0.5 rounded',
                                task.priority === 'urgent'
                                  ? 'bg-red-500/20 text-red-400'
                                  : task.priority === 'high'
                                    ? 'bg-amber-500/20 text-amber-400'
                                    : task.priority === 'medium'
                                      ? 'bg-blue-500/20 text-blue-400'
                                      : 'bg-mid-grey/20 text-mid-grey',
                              )}
                            >
                              {task.priority}
                            </span>
                            {task.labels.map((label) => (
                              <span
                                key={label}
                                className="text-xs px-1.5 py-0.5 rounded bg-purple/20 text-purple"
                              >
                                {label}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
