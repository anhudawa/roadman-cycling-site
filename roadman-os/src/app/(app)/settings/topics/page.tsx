import { getTopics } from '@/lib/queries/topics'
import { getTagsWithCounts } from '@/lib/queries/tags'
import { PageHeader } from '@/components/ui/PageHeader'
import { TopicsSection } from './TopicsSection'
import { TagsSection } from './TagsSection'

/**
 * Topics & Tags settings page.
 * Manages the content taxonomy — topics (grouped by pillar) and free-form tags.
 *
 * TODO: Gate this page behind admin permissions once the RBAC system is built.
 */
export default async function TopicsSettingsPage() {
  const [topics, tags] = await Promise.all([
    getTopics(),
    getTagsWithCounts(),
  ])

  return (
    <div>
      <PageHeader
        title="Topics & Tags"
        description="Manage your content taxonomy"
      />

      {/* Topics */}
      <section className="mb-12">
        <TopicsSection initialTopics={topics} />
      </section>

      {/* Tags */}
      <section>
        <TagsSection initialTags={tags} />
      </section>
    </div>
  )
}
