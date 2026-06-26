'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Menu, Home, ChevronRight, Crown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/shared/ThemeToggle'
import { Badge } from '@/components/ui/badge'
import { useRole } from '@/hooks/useRole'
import { useAuth } from '@/hooks/useAuth'

const SEGMENT_LABELS = {
  dashboard: 'Dashboard',
  'add-lesson': 'Add Lesson',
  'my-lessons': 'My Lessons',
  'my-favorites': 'My Favorites',
  profile: 'Profile',
  admin: 'Admin',
  users: 'Manage Users',
  lessons: 'Manage Lessons',
  reports: 'Reports',
}

function Breadcrumbs() {
  const pathname = usePathname()
  const segments = pathname.split('/').filter(Boolean)

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-sm">
      <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
        <Home className="h-3.5 w-3.5" />
        <span className="sr-only">Home</span>
      </Link>
      {segments.map((seg, i) => {
        const href = '/' + segments.slice(0, i + 1).join('/')
        const isLast = i === segments.length - 1
        const label = SEGMENT_LABELS[seg] || (seg.length === 24 ? 'Edit' : seg)
        return (
          <span key={href} className="flex items-center gap-1">
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
            {isLast ? (
              <span className="font-medium text-foreground">{label}</span>
            ) : (
              <Link href={href} className="text-muted-foreground hover:text-foreground transition-colors">
                {label}
              </Link>
            )}
          </span>
        )
      })}
    </nav>
  )
}

export function DashboardTopbar({ onMenuClick }) {
  const { isPremiumRole, isAdmin } = useRole()
  const { user } = useAuth()

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-background/90 backdrop-blur-sm px-4">
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden h-8 w-8"
        onClick={onMenuClick}
        aria-label="Open sidebar"
      >
        <Menu className="h-5 w-5" />
      </Button>

      <Breadcrumbs />

      <div className="ml-auto flex items-center gap-2">
        {isPremiumRole && (
          <Badge className="hidden sm:flex items-center gap-1 bg-accent text-accent-foreground border-0 text-xs h-6">
            <Crown className="h-3 w-3" />
            Premium
          </Badge>
        )}
        {isAdmin && (
          <Badge variant="destructive" className="hidden sm:flex text-xs h-6">
            Admin
          </Badge>
        )}
        {!isPremiumRole && !isAdmin && (
          <Link href="/pricing">
            <Badge variant="outline" className="hidden sm:flex text-xs h-6 cursor-pointer hover:bg-muted transition-colors">
              Upgrade
            </Badge>
          </Link>
        )}
        <ThemeToggle />
      </div>
    </header>
  )
}
