import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { getCurrentProfile } from '@/lib/utils/auth'
import { getAsset } from '@/lib/queries/assets'
import { getBriefByAsset } from '@/lib/queries/briefs'
import { createBrief, updateBrief } from '@/lib/actions/briefs'
import { PageHeader } from '@/components/ui/PageHeader'
import { BriefForm } from '@/components/briefs/BriefForm'
import { BriefApproval } from '@/components/briefs/BriefApproval'
import { BriefStatusBadge } from '@/components/briefs/BriefStatusBadge'
import { createClient } from '@/lib/supabase/server'
import type { Asset } from '@/types/database'

// ---------------------------------------------------------------------------
// Metadata
// ---------------------------------------------------------------------------

export async function generateMetadata({ params }: { params: { id: string } }) {
  const asset = (await getAsset(params.id)) as { title: string } | null
  return {
    title: asset ? `Brief — ${asset.title} — Roadman OS` : 'Brief — Roadman OS',
  }
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

interface BriefPageProps {
  params: { id: string }
}

export default async function BriefPage({ params }: BriefPageProps) {
  const profile = await getCurrentProfile()
  if (!profile) redirect('/login')

  const assetData = await getAsset(params.id)
  if (!assetData) notFound()

  const asset = assetData as Asset & {
    creator?: { id: string; display_name: string | null; full_name: string } | null
  }

  const brief = await getBriefByAsset(params.id)

  // Extract status and approval metadata from distribution_plan
  const plan = (brief?.distribution_plan ?? {}) as Record<string, unknown>
  const briefStatus = (plan.status as string) ?? 'draft'
  const approvedBy = plan.approved_by as string | undefined
  const approvedAt = plan.approved_at as string | undefined
  const rejectionReason = plan.rejection_reason as string | undefined

  // Resolve approver name if approved
  let approverName: string | null = null
  if (approvedBy) {
    const supabase = await createClient()
    const { data: approver } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', approvedBy)
      .single()
    approverName = (approver as { full_name: string } | null)?.full_name ?? null
  }

  // Server action wrappers to bind asset/brief IDs
  async function handleCreate(formData: FormData) {
    'use server'
    const result = await createBrief(params.id, formData)
    if (!result.success) {
      throw new Error(result.error ?? 'Failed to create brief')
    }
  }

  async function handleUpdate(formData: FormData) {
    'use server'
    if (!brief) throw new Error('No brief to update')
    const result = await updateBrief(brief.id, formData)
    if (!result.success) {
      throw new Error(result.error ?? 'Failed to update brief')
    }
  }

  return (
    <div>
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1 text-sm text-mid-grey mb-4">
        <Link href="/assets" className="hover:text-off-white transition-colours">
          Assets
        </Link>
        <ChevronRight className="w-4 h-4" />
        <Link
          href={`/assets/${asset.id}`}
          className="hover:text-off-white transition-colours truncate max-w-[200px]"
        >
          {asset.title}
        </Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-off-white">Brief</span>
      </nav>

      <PageHeader
        title={brief ? 'Edit Content Brief' : 'Create Content Brief'}
        description={`Brief for: ${asset.title}`}
        actions={
          brief ? <BriefStatusBadge status={briefStatus} /> : undefined
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main content — 2/3 */}
        <div className="lg:col-span-2">
          <BriefForm
            mode={brief ? 'edit' : 'create'}
            brief={brief ?? undefined}
            assetId={params.id}
            onSubmit={brief ? handleUpdate : handleCreate}
          />
        </div>

        {/* Sidebar — 1/3 */}
        <div className="space-y-5">
          {brief && (
            <BriefApproval
              briefId={brief.id}
              status={briefStatus}
              userRole={profile.role}
              approverName={approverName}
              approvedAt={approvedAt}
              rejectionReason={rejectionReason}
            />
          )}

          {/* Brief metadata */}
          {brief && (
            <div className="bg-charcoal border border-mid-grey/20 rounded-lg p-5 space-y-3">
              <h3 className="text-sm font-medium text-mid-grey uppercase tracking-wider">
                Brief Info
              </h3>

              {brief.creator && (
                <div>
                  <p className="text-xs text-mid-grey">Created by</p>
                  <p className="text-sm text-off-white">
                    {brief.creator.full_name}
                  </p>
                </div>
              )}

              <div>
                <p className="text-xs text-mid-grey">Created</p>
                <p className="text-sm text-off-white">
                  {new Date(brief.created_at).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </p>
              </div>

              <div>
                <p className="text-xs text-mid-grey">Last updated</p>
                <p className="text-sm text-off-white">
                  {new Date(brief.updated_at).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
