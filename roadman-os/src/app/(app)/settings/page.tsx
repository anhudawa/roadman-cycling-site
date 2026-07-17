import Link from 'next/link'
import { Layers } from 'lucide-react'

const SETTINGS_SECTIONS = [
  {
    label: 'Content Clusters',
    href: '/settings/clusters',
    description: 'Group related content for SEO topic authority.',
    icon: Layers,
  },
] as const

export default function SettingsPage() {
  return (
    <div>
      <h1 className="font-heading text-3xl text-off-white uppercase tracking-wide">
        Settings
      </h1>
      <p className="mt-2 text-mid-grey font-body mb-8">
        Manage your workspace configuration.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {SETTINGS_SECTIONS.map((section) => {
          const Icon = section.icon
          return (
            <Link key={section.href} href={section.href} className="block">
              <div className="bg-charcoal border border-mid-grey/20 rounded-xl p-5 hover:border-mid-grey/40 transition-colors">
                <div className="flex items-center gap-3 mb-2">
                  <Icon className="h-5 w-5 text-coral" />
                  <h3 className="text-base font-medium text-off-white">
                    {section.label}
                  </h3>
                </div>
                <p className="text-sm text-mid-grey">{section.description}</p>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
