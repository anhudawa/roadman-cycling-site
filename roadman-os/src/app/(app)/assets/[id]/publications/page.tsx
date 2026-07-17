import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ChevronRight, Send } from 'lucide-react'
import { getCurrentProfile } from '@/lib/utils/auth'
import { getAsset } from '@/lib/queries/assets'
import { getPublicationsByAsset } from '@/lib/queries/publications'
import { getActivePlatforms } from '@/lib/queries/platforms'
import { PageHeader } from '@/components/ui/PageHeader'
import { EmptyState } from '@/components/ui/EmptyState'
import { PublicationsClient } from './PublicationsClient'
import type { Asset } from '@/types/database'

// ---------------------------------------------------------------------------
// Metadata
// ---------------------------------------------------------------------------

export async function generateMetadata({ params }: { params: { id: string } }) {
  const asset = await getAsset(params.id) as { title: string } | null
  return {
    title: asset
      ? `Publications - ${asset.title} - Roadman OS`
      : 'Publications - Roadman OS',
  }
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

interface PublicationsPageProps {
  params: { id: string }
}

export default async function PublicationsPage({ params }: PublicationsPageProps) {
  const profile = await getCurrentProfile()
  if (!profile) redirect('/login')

  const [assetData, publications, platforms] = await Promise.all([
    getAsset(params.id),
    getPublicationsByAsset(params.id),
    getActivePlatforms(),
  ])

  if (!assetData) notFound()

  const asset = assetData as Asset

  // Build dropdown data for the forms
  const assetOptions = [{ id: asset.id, title: asset.title }]
  const platformOptions = platforms.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
  }))

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
        <span className="text-off-white">Publications</span>
      </nav>

      {/* Client wrapper handles modals + list */}
      <PublicationsClient
        asset={asset}
        publications={publications}
        assetOptions={assetOptions}
        platformOptions={platformOptions}
      />
    </div>
  )
}
