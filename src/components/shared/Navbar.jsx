'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { BookOpen, Menu, X, Plus, BookMarked, LayoutDashboard, LogOut, User, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { ThemeToggle } from './ThemeToggle'
import { useCommandPalette } from './CommandPalette'
import { useSession, logout } from '@/lib/auth-client'
import { useRole } from '@/hooks/useRole'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/public-lessons', label: 'Public Lessons' },
]

function NavLink({ href, label, pathname, onClick }) {
  const isActive = href === '/' ? pathname === href : pathname.startsWith(href)
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        'text-sm font-medium transition-colors hover:text-primary',
        isActive ? 'text-primary' : 'text-muted-foreground'
      )}
    >
      {label}
    </Link>
  )
}

export function Navbar() {
  const pathname = usePathname()
  const { data: session, isPending, error } = useSession()
  const user = session?.user ?? null
  console.log("user data:", user);
  const isAuthenticated = Boolean(user)
  const { isPremium, isAdmin } = useRole()
  const [mobileOpen, setMobileOpen] = useState(false)
  const { open: cmdOpen, setOpen: setCmdOpen } = useCommandPalette()

  const authLinks = isAuthenticated
    ? [
        { href: '/dashboard/add-lesson', label: 'Add Lesson' },
        { href: '/dashboard/my-lessons', label: 'My Lessons' },
        { href: isAdmin ? '/dashboard/admin' : '/dashboard', label: 'Dashboard' },
      ]
    : []

  // show pricing link to non-premium users
  const pricingLink = !isPremium ? [{ href: '/pricing', label: 'Pricing' }] : []

  const visibleLinks = [...NAV_LINKS, ...authLinks, ...pricingLink]

  const handleLogout = async () => {
    try {
      await logout()
      toast.success('Logged out successfully')
    } catch {
      toast.error('Failed to log out')
    }
  }

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'U'

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/90 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-serif font-bold text-primary">
          <BookOpen className="h-6 w-6" />
          <span className="text-lg hidden sm:block">LifeLessons</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          {visibleLinks.map((link) => (
            <NavLink key={link.href} {...link} pathname={pathname} />
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* Command palette trigger */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCmdOpen(true)}
            className="hidden sm:flex items-center gap-1.5 text-muted-foreground hover:text-foreground h-8 px-2.5 text-xs"
            aria-label="Open command palette (Ctrl+K)"
          >
            <Search className="h-3.5 w-3.5" />
            <span className="hidden md:inline">Search</span>
            <kbd className="hidden md:inline text-[10px] font-mono bg-muted border border-border rounded px-1 py-0.5 ml-1">⌘K</kbd>
          </Button>
          <ThemeToggle />

          {/* Auth buttons */}
          {!isPending && (
            <>
              {isAuthenticated ? (
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={
                      <button
                        type="button"
                        className="relative inline-flex h-9 w-9 items-center justify-center rounded-full outline-none ring-ring focus-visible:ring-2"
                        aria-label="User menu"
                      />
                    }
                  >
                    <Avatar className="h-8 w-8 pointer-events-none">
                      <AvatarImage src={user?.image} alt={user?.name || 'User'} />
                      <AvatarFallback className="bg-primary text-primary-foreground text-xs font-medium">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <div className="px-2 py-1.5">
                      <p className="text-sm font-medium text-foreground truncate">{user?.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/profile" className="flex items-center gap-2 cursor-pointer">
                        <User className="h-4 w-4" /> Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/add-lesson" className="flex items-center gap-2 cursor-pointer">
                        <Plus className="h-4 w-4" /> Add Lesson
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/my-lessons" className="flex items-center gap-2 cursor-pointer">
                        <BookMarked className="h-4 w-4" /> My Lessons
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={isAdmin ? '/dashboard/admin' : '/dashboard'} className="flex items-center gap-2 cursor-pointer">
                        <LayoutDashboard className="h-4 w-4" /> Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="text-destructive focus:text-destructive cursor-pointer flex items-center gap-2"
                    >
                      <LogOut className="h-4 w-4" /> Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="hidden sm:flex items-center gap-2">
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/auth/login">Login</Link>
                  </Button>
                  <Button size="sm" asChild>
                    <Link href="/auth/register">Register</Link>
                  </Button>
                </div>
              )}
            </>
          )}

          {/* Mobile menu */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger
              render={
                <button
                  type="button"
                  className="md:hidden inline-flex items-center justify-center h-9 w-9 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                  aria-label="Open menu"
                />
              }
            >
              <Menu className="h-5 w-5" />
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between mb-6">
                  <Link
                    href="/"
                    className="flex items-center gap-2 font-serif font-bold text-primary"
                    onClick={() => setMobileOpen(false)}
                  >
                    <BookOpen className="h-5 w-5" />
                    <span>LifeLessons</span>
                  </Link>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setMobileOpen(false)}
                    className="h-8 w-8"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <nav className="flex flex-col gap-1">
                  {visibleLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        'px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                        pathname === link.href
                          ? 'bg-primary/10 text-primary'
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                      )}
                    >
                      {link.label}
                    </Link>
                  ))}
                </nav>

                <div className="mt-auto border-t border-border pt-4">
                  {isAuthenticated ? (
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={user?.image} alt={user?.name || 'User'} />
                        <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{user?.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => { handleLogout(); setMobileOpen(false) }}
                        className="h-8 w-8 text-destructive"
                      >
                        <LogOut className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <Button variant="outline" asChild onClick={() => setMobileOpen(false)}>
                        <Link href="/auth/login">Login</Link>
                      </Button>
                      <Button asChild onClick={() => setMobileOpen(false)}>
                        <Link href="/auth/register">Register</Link>
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
