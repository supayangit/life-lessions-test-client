'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, BookOpen, LayoutDashboard, Home, Plus, Bookmark, User, Crown, X } from 'lucide-react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'
import { useRole } from '@/hooks/useRole'
import { useDebounce } from '@/hooks/useDebounce'
import { getLessons } from '@/services/lessonApi'
import { useQuery } from '@tanstack/react-query'

const STATIC_LINKS = [
  { label: 'Home', href: '/', icon: Home, group: 'Navigation' },
  { label: 'Public Lessons', href: '/public-lessons', icon: BookOpen, group: 'Navigation' },
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, group: 'Navigation', auth: true },
  { label: 'Add Lesson', href: '/dashboard/add-lesson', icon: Plus, group: 'Navigation', auth: true },
  { label: 'My Favorites', href: '/dashboard/my-favorites', icon: Bookmark, group: 'Navigation', auth: true },
  { label: 'My Profile', href: '/dashboard/profile', icon: User, group: 'Navigation', auth: true },
  { label: 'Pricing', href: '/pricing', icon: Crown, group: 'Navigation', freeOnly: true },
]

export function CommandPalette({ open, onClose }) {
  const router = useRouter()
  const { isAuthenticated } = useAuth()
  const { isPremium } = useRole()
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const debouncedQuery = useDebounce(query, 300)
  const inputRef = useRef(null)

  // Reset on open
  useEffect(() => {
    if (open) {
      setQuery('')
      setActiveIndex(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  const { data: lessonResults, isFetching } = useQuery({
    queryKey: ['cmd-lessons', debouncedQuery],
    queryFn: () => getLessons({ search: debouncedQuery, limit: 5 }),
    enabled: Boolean(debouncedQuery.trim()),
    placeholderData: (prev) => prev,
  })

  const visibleLinks = STATIC_LINKS.filter((l) => {
    if (l.auth && !isAuthenticated) return false
    // `freeOnly` links should be hidden for premium users
    if (l.freeOnly && isPremium) return false
    if (query && !l.label.toLowerCase().includes(query.toLowerCase())) return false
    return true
  })

  const lessons = (Array.isArray(lessonResults) ? lessonResults : lessonResults?.lessons || []).slice(0, 5)

  const allItems = [
    ...visibleLinks.map((l) => ({ type: 'link', ...l })),
    ...lessons.map((l) => ({ type: 'lesson', label: l.title, href: `/lesson/${l._id}`, icon: BookOpen, group: 'Lessons', category: l.category })),
  ]

  const navigate = useCallback((href) => {
    onClose()
    router.push(href)
  }, [onClose, router])

  useEffect(() => {
    setActiveIndex(0)
  }, [query])

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIndex((i) => Math.min(i + 1, allItems.length - 1)) }
      if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIndex((i) => Math.max(i - 1, 0)) }
      if (e.key === 'Enter' && allItems[activeIndex]) navigate(allItems[activeIndex].href)
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [activeIndex, allItems, navigate, onClose])

  const groups = [...new Set(allItems.map((i) => i.group))]

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="p-0 overflow-hidden max-w-lg gap-0 top-[20%] translate-y-0 sm:top-[20%]">
        {/* Search bar */}
        <div className="flex items-center gap-3 border-b border-border px-4 py-3">
          <Search className="h-4 w-4 text-muted-foreground flex-shrink-0" aria-hidden="true" />
          <Input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search pages and lessons..."
            className="border-0 bg-transparent p-0 text-sm focus-visible:ring-0 shadow-none h-auto"
            aria-label="Command palette search"
          />
          {query && (
            <button onClick={() => setQuery('')} className="text-muted-foreground hover:text-foreground" aria-label="Clear search">
              <X className="h-4 w-4" />
            </button>
          )}
          <Badge variant="outline" className="text-[10px] px-1.5 py-0.5 font-mono">ESC</Badge>
        </div>

        {/* Results */}
        <div className="max-h-[60vh] overflow-y-auto py-2">
          {allItems.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-sm text-muted-foreground">
                {isFetching ? 'Searching...' : 'No results found'}
              </p>
            </div>
          ) : (
            groups.map((group) => {
              const groupItems = allItems.filter((i) => i.group === group)
              if (!groupItems.length) return null
              return (
                <div key={group}>
                  <p className="px-4 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {group}
                  </p>
                  {groupItems.map((item) => {
                    const idx = allItems.indexOf(item)
                    const isActive = idx === activeIndex
                    return (
                      <button
                        key={item.href}
                        onClick={() => navigate(item.href)}
                        onMouseEnter={() => setActiveIndex(idx)}
                        className={cn(
                          'w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors',
                          isActive ? 'bg-muted text-foreground' : 'text-muted-foreground hover:bg-muted/50'
                        )}
                      >
                        <item.icon className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
                        <span className="text-sm font-medium flex-1">{item.label}</span>
                        {item.category && (
                          <Badge variant="secondary" className="text-[10px] h-4 px-1.5">{item.category}</Badge>
                        )}
                      </button>
                    )
                  })}
                </div>
              )
            })
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-border px-4 py-2 flex items-center gap-3 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1"><Badge variant="outline" className="text-[10px] font-mono px-1.5 py-0.5">↑↓</Badge> navigate</span>
          <span className="flex items-center gap-1"><Badge variant="outline" className="text-[10px] font-mono px-1.5 py-0.5">↵</Badge> select</span>
          <span className="flex items-center gap-1"><Badge variant="outline" className="text-[10px] font-mono px-1.5 py-0.5">ESC</Badge> close</span>
        </div>
      </DialogContent>
    </Dialog>
  )
}

import { createContext, useContext } from 'react'

// ── Shared context so multiple consumers share one open/close state ────────
const CommandPaletteContext = createContext({ open: false, setOpen: () => {} })

export function CommandPaletteProvider({ children }) {
  const [open, setOpen] = useState(false)

  // Global ⌘K / Ctrl+K shortcut registered once at the provider level
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen((v) => !v)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  return (
    <CommandPaletteContext.Provider value={{ open, setOpen }}>
      {children}
      <CommandPalette open={open} onClose={() => setOpen(false)} />
    </CommandPaletteContext.Provider>
  )
}

/**
 * Hook to open/close the shared command palette.
 */
export function useCommandPalette() {
  return useContext(CommandPaletteContext)
}
