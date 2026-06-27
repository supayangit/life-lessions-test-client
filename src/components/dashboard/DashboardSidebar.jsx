'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Plus,
  BookOpen,
  Bookmark,
  User,
  BookMarked,
  Crown,
  LogOut,
  BookOpenCheck,
  ShieldCheck,
  Users,
  Flag,
  Star,
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'
import { useRole } from '@/hooks/useRole'
import { usePremium } from '@/hooks/usePremium'
import toast from 'react-hot-toast'

const USER_LINKS = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard, exact: true },
  { href: '/dashboard/add-lesson', label: 'Add Lesson', icon: Plus },
  { href: '/dashboard/my-lessons', label: 'My Lessons', icon: BookOpen },
  { href: '/dashboard/my-favorites', label: 'My Favorites', icon: Bookmark },
  { href: '/dashboard/profile', label: 'Profile', icon: User },
]

const ADMIN_LINKS = [
  { href: '/dashboard/admin', label: 'Admin Overview', icon: ShieldCheck, exact: true },
  { href: '/dashboard/admin/users', label: 'Manage Users', icon: Users },
  { href: '/dashboard/admin/lessons', label: 'Manage Lessons', icon: Star },
  { href: '/dashboard/admin/reports', label: 'Reports', icon: Flag },
  { href: '/dashboard/admin/profile', label: 'Admin Profile', icon: User },
]

function SidebarLink({ href, label, icon: Icon, exact, onClick }) {
  const pathname = usePathname()
  const isActive = exact ? pathname === href : pathname.startsWith(href)
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
        isActive
          ? 'bg-primary/10 text-primary'
          : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
      )}
    >
      <Icon className="h-4 w-4 flex-shrink-0" />
      <span>{label}</span>
    </Link>
  )
}

export function DashboardSidebar({ onClose }) {
  const { user, logout } = useAuth()
  const { isAdmin } = useRole()
  const { isPremium } = usePremium()

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U'

  const handleLogout = async () => {
    try {
      await logout()
      toast.success('Logged out successfully')
    } catch {
      toast.error('Failed to log out')
    }
  }

  return (
    <div className="flex h-full flex-col bg-sidebar border-r border-sidebar-border">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-4">
        <BookOpenCheck className="h-6 w-6 text-sidebar-primary" />
        <span className="font-serif font-bold text-sidebar-primary text-lg">LifeLessons</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {USER_LINKS.map((link) => (
          <SidebarLink key={link.href} {...link} onClick={onClose} />
        ))}

        {isAdmin && (
          <>
            <div className="pt-2 pb-1 px-1">
              <Separator className="mb-2" />
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground px-2 mb-1">Admin</p>
            </div>
            {ADMIN_LINKS.map((link) => (
              <SidebarLink key={link.href} {...link} onClick={onClose} />
            ))}
          </>
        )}
      </nav>

      {/* User footer */}
      <div className="border-t border-sidebar-border p-3">
        <div className="flex items-center gap-3 rounded-lg p-2">
          <Avatar className="h-8 w-8 flex-shrink-0">
            <AvatarImage src={user?.image} alt={user?.name || 'User'} />
            <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground text-xs font-medium">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-foreground truncate">{user?.name}</p>
            <div className="flex items-center gap-1 mt-0.5">
              {isPremium && (
                <Badge className="h-4 text-[10px] px-1.5 bg-accent text-accent-foreground border-0 gap-0.5">
                  <Crown className="h-2.5 w-2.5" />
                  Premium
                </Badge>
              )}
              {isAdmin && (
                <Badge variant="destructive" className="h-4 text-[10px] px-1.5">
                  Admin
                </Badge>
              )}
              {!isPremium && !isAdmin && (
                <span className="text-[10px] text-sidebar-foreground/60">Free</span>
              )}
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-sidebar-foreground/60 hover:text-destructive flex-shrink-0"
            onClick={handleLogout}
            aria-label="Log out"
          >
            <LogOut className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  )
}
