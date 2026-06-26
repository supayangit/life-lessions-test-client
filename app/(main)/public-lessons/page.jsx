'use client'


import { useState, useCallback, useEffect, useRef } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Container } from '@/components/shared/Container'
import { SectionHeading } from '@/components/shared/SectionHeading'
import { LessonGridSkeleton } from '@/components/shared/SkeletonLoader'
import { ErrorState } from '@/components/shared/ErrorState'
import { EmptyState } from '@/components/shared/EmptyState'
import { LessonCard } from '@/components/lessons/LessonCard'
import { getLessons } from '@/services/lessonApi'
import { usePremium } from '@/hooks/usePremium'
import { useDebounce } from '@/hooks/useDebounce'

const CATEGORIES = [
  'All',
  'Relationships',
  'Career',
  'Health',
  'Finance',
  'Family',
  'Friendship',
  'Personal Growth',
  'Parenting',
  'Loss & Grief',
  'Other',
]

const TONES = ['All', 'Reflective', 'Hopeful', 'Cautionary', 'Motivational', 'Melancholic', 'Humorous']

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'most-liked', label: 'Most Liked' },
  { value: 'most-saved', label: 'Most Saved' },
]

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
}

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } },
}

export default function PublicLessonsPage() {
  const { isPremium } = usePremium()
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [tone, setTone] = useState('All')
  const [sort, setSort] = useState('newest')
  const [showFilters, setShowFilters] = useState(false)

  const debouncedSearch = useDebounce(search, 400)

  const queryParams = {
    ...(debouncedSearch && { search: debouncedSearch }),
    ...(category !== 'All' && { category }),
    ...(tone !== 'All' && { tone }),
    sort,
  }

  const sentinelRef = useRef(null)
  const nextPageRequestRef = useRef(false)

  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useInfiniteQuery({
    queryKey: ['lessons', 'public', debouncedSearch, category, tone, sort],
    queryFn: ({ pageParam = 1 }) => getLessons({ ...queryParams, page: pageParam }),
    getNextPageParam: (lastPage) => {
      if (lastPage?.pagination?.hasNextPage) {
        return lastPage.pagination.page + 1
      }
      return undefined
    },
  })

  const lessons = data?.pages.flatMap((page) => page.lessons) ?? []

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel || !hasNextPage) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (
            entry.isIntersecting &&
            hasNextPage &&
            !isFetchingNextPage &&
            !nextPageRequestRef.current
          ) {
            nextPageRequestRef.current = true
            fetchNextPage().finally(() => {
              nextPageRequestRef.current = false
            })
          }
        })
      },
      {
        root: null,
        rootMargin: '200px',
        threshold: 0.1,
      }
    )

    observer.observe(sentinel)

    return () => {
      observer.disconnect()
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage])

  const activeFiltersCount = [
    category !== 'All',
    tone !== 'All',
    debouncedSearch.length > 0,
  ].filter(Boolean).length

  const clearFilters = useCallback(() => {
    setSearch('')
    setCategory('All')
    setTone('All')
    setSort('newest')
  }, [])

  return (
    <div className="py-10 min-h-screen">
      <Container>
        <SectionHeading
          title="Public Lessons"
          subtitle="Browse real life lessons shared by people from around the world."
        />

        {/* Search & Filter Bar */}
        <div className="mb-8 space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search lessons..."
                className="pl-9 pr-9"
                aria-label="Search lessons"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowFilters((v) => !v)}
              aria-label="Toggle filters"
              className="relative flex-shrink-0"
            >
              <SlidersHorizontal className="h-4 w-4" />
              {activeFiltersCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </Button>
          </div>

          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex flex-wrap gap-3 p-4 rounded-xl bg-muted/40 border border-border"
            >
              {/* Category */}
              <div className="flex-1 min-w-[160px]">
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Category</label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Tone */}
              <div className="flex-1 min-w-[160px]">
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Tone</label>
                <Select value={tone} onValueChange={setTone}>
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TONES.map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Sort */}
              <div className="flex-1 min-w-[160px]">
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Sort by</label>
                <Select value={sort} onValueChange={setSort}>
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SORT_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {activeFiltersCount > 0 && (
                <div className="flex items-end">
                  <Button variant="ghost" size="sm" onClick={clearFilters} className="h-9 text-xs gap-1 text-muted-foreground">
                    <X className="h-3.5 w-3.5" />
                    Clear
                  </Button>
                </div>
              )}
            </motion.div>
          )}

          {/* Active filter chips */}
          {(category !== 'All' || tone !== 'All') && (
            <div className="flex flex-wrap gap-2">
              {category !== 'All' && (
                <Badge variant="secondary" className="gap-1 text-xs pr-1">
                  {category}
                  <button
                    onClick={() => setCategory('All')}
                    className="ml-0.5 hover:text-destructive transition-colors"
                    aria-label={`Remove category filter: ${category}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {tone !== 'All' && (
                <Badge variant="secondary" className="gap-1 text-xs pr-1">
                  {tone}
                  <button
                    onClick={() => setTone('All')}
                    className="ml-0.5 hover:text-destructive transition-colors"
                    aria-label={`Remove tone filter: ${tone}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* Results */}
        {isLoading && <LessonGridSkeleton count={6} />}

        {isError && (
          <ErrorState
            title="Could not load lessons"
            error={error}
            onRetry={refetch}
          />
        )}

        {!isLoading && !isError && lessons.length === 0 && (
          <EmptyState
            title="No lessons found"
            description="Try adjusting your search or filters to find what you are looking for."
            actionLabel="Clear filters"
            onAction={clearFilters}
          />
        )}

        {!isLoading && !isError && lessons.length > 0 && (
          <>
            <p className="text-sm text-muted-foreground mb-5">
              {lessons.length} lesson{lessons.length !== 1 ? 's' : ''} found
            </p>
            <motion.div
              key={JSON.stringify(queryParams)}
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
            >
              {lessons.map((lesson) => (
                <motion.div key={lesson._id} variants={cardVariants}>
                  <LessonCard lesson={lesson} isPremiumUser={isPremium} />
                </motion.div>
              ))}
            </motion.div>

            <div ref={sentinelRef} className="h-1" />

            <div className="mt-6 flex flex-col items-center gap-3 text-sm text-muted-foreground">
              {isFetchingNextPage && (
                <div className="flex items-center gap-2">
                  <span>Loading more lessons…</span>
                  <span className="inline-flex rounded-full border-primary/30 border-t-primary animate-spin h-4 w-4" aria-hidden="true" />
                </div>
              )}
              {!isFetchingNextPage && !hasNextPage && (
                <span className="text-center text-sm text-muted-foreground">You have reached the end of the feed.</span>
              )}
            </div>
          </>
        )}
      </Container>
    </div>
  )
}
