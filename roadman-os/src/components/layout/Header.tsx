'use client'

import { usePathname } from 'next/navigation'
import { Menu, Search } from 'lucide-react'
import { NotificationBell } from '@/components/notifications/NotificationBell'
import type { Profile } from '@/types/database'

const pathLabels: Record<string, string> = {
  '/': 'Dashboard',
  '/campaigns': 'Campaigns',
  '/assets': 'Assets',
  '/calendar': 'Calendar',
  '/ideas': 'Ideas',
  '/tasks': 'Tasks',
  '/transcripts': 'Transcripts',
  '/performance': 'Performance',
  '/settings': 'Settings',
}

function toTitleCase(segment: string): string {
  return segment
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

function getBreadcrumbs(pathname: string): string[] {
  // Check for a known label first
  if (pathLabels[pathname]) {
    return [pathLabels[pathname]]
  }

  // Build breadcrumbs from path segments
  const segments = pathname.split('/').filter(Boolean)
  return segments.map(toTitleCase)
}

export function Header({ profile: _profile }: { profile: Profile }) {
  const pathname = usePathname()
  const breadcrumbs = getBreadcrumbs(pathname)

  function handleToggleMobileNav() {
    window.dispatchEvent(new CustomEvent('toggle-mobile-nav'))
  }

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-mid-grey/20 bg-charcoal px-4 md:px-6">
      {/* Left: Breadcrumbs */}
      <div className="flex items-center gap-2">
        <nav className="font-body text-sm text-off-white">
          {breadcrumbs.map((crumb, index) => (
            <span key={crumb}>
              {index > 0 && (
                <span className="mx-2 text-mid-grey/50">/</span>
              )}
              <span
                className={
                  index === breadcrumbs.length - 1
                    ? 'text-off-white'
                    : 'text-mid-grey'
                }
              >
                {crumb}
              </span>
            </span>
          ))}
        </nav>
      </div>

      {/* Right: Search, Notifications, Mobile menu */}
      <div className="flex items-center gap-3">
        {/* Search placeholder */}
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-mid-grey/50" />
          <input
            type="text"
            placeholder="Search..."
            disabled
            className="w-64 rounded-lg border border-mid-grey/30 bg-charcoal py-1.5 pl-10 pr-4 font-body text-sm text-off-white placeholder:text-mid-grey/50 disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>

        {/* Notification bell */}
        <NotificationBell />

        {/* Mobile menu button */}
        <button
          type="button"
          onClick={handleToggleMobileNav}
          className="rounded-lg p-2 text-mid-grey transition-colors hover:bg-white/5 hover:text-off-white md:hidden"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>
    </header>
  )
}
