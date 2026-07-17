'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  Target,
  FileText,
  Calendar,
  Lightbulb,
  CheckSquare,
  FileAudio,
  BarChart3,
  Settings,
  LogOut,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils/cn'
import type { Profile } from '@/types/database'

const navItems = [
  { label: 'Dashboard', href: '/', icon: LayoutDashboard },
  { label: 'Campaigns', href: '/campaigns', icon: Target },
  { label: 'Assets', href: '/assets', icon: FileText },
  { label: 'Calendar', href: '/calendar', icon: Calendar },
  { label: 'Ideas', href: '/ideas', icon: Lightbulb },
  { label: 'Tasks', href: '/tasks', icon: CheckSquare },
  { label: 'Transcripts', href: '/transcripts', icon: FileAudio },
  { label: 'Performance', href: '/performance', icon: BarChart3 },
  { label: 'Settings', href: '/settings', icon: Settings },
]

export function Sidebar({ profile }: { profile: Profile }) {
  const pathname = usePathname()
  const router = useRouter()

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  function isActive(href: string) {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <aside className="hidden md:flex w-60 flex-col bg-deep-purple h-full">
      {/* Brand */}
      <div className="px-6 pt-6 pb-4">
        <h1 className="font-heading text-xl tracking-wider text-off-white">
          ROADMAN OS
        </h1>
        <div className="mt-2 h-0.5 w-10 bg-coral" />
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-0.5 px-3 py-4">
        {navItems.map((item) => {
          const active = isActive(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 font-body text-sm transition-colors',
                active
                  ? 'border-l-[3px] border-coral text-coral'
                  : 'text-off-white/70 hover:bg-white/5 hover:text-off-white'
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* User info */}
      <div className="border-t border-white/10 px-4 py-4">
        <p className="font-body text-sm text-off-white">
          {profile.display_name}
        </p>
        <span className="mt-1 inline-block rounded bg-purple/50 px-2 py-0.5 font-body text-xs capitalize text-off-white/70">
          {profile.role}
        </span>
        <button
          onClick={handleSignOut}
          className="mt-3 flex items-center gap-2 font-body text-xs text-mid-grey transition-colors hover:text-off-white"
        >
          <LogOut className="h-3.5 w-3.5" />
          Sign out
        </button>
      </div>
    </aside>
  )
}
