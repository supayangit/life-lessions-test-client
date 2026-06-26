'use client'

import { useEffect, useRef, useState } from 'react'
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { BookmarkX, Search, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { LessonCard } from '@/components/lessons/LessonCard'
import { Skeleton } from '@/components/ui/skeleton'
import { useAxiosSecure } from '@/hooks/useAxiosSecure'
import { useRole } from '@/hooks/useRole'
import { getMyFavorites, removeFavorite } from '@/services/favoritesApi'

const CATEGORIES = ['All', 'Career', 'Relationships', 'Finance', 'Health', 'Mindset', 'Education', 'Parenting', 'Travel', 'Technology', 'Other']
const TONES = ['All', 'Reflective', 'Hopeful', 'Cautionary', 'Motivational', 'Melancholic', 'Humorous']
const PAGE_SIZE = 6

export default function MyFavoritesPage() {
  const axiosSecure = useAxiosSecure()
  const queryClient = useQueryClient()
  const { isPremiumRole } = useRole()

  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [tone, setTone] = useState('All')

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
  } = useInfiniteQuery({
    queryKey: ['my-favorites', search, category, tone],
    queryFn: ({ pageParam = 1 }) =>
      getMyFavorites(
        {
          search: search.trim() || undefined,
          category: category !== 'All' ? category : undefined,
          tone: tone !== 'All' ? tone : undefined,
          page: pageParam,
          limit: PAGE_SIZE,
        },
        axiosSecure
      ),
    getNextPageParam: (lastPage) => {
      if (lastPage?.pagination?.hasNextPage) {
        return lastPage.pagination.page + 1
      }
      return undefined
    },
    retry: false,
  })

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

  const removeMutation = useMutation({
    mutationFn: (lessonId) => removeFavorite(lessonId, axiosSecure),
    onMutate: async (lessonId) => {
      await queryClient.cancelQueries({ queryKey: ['my-favorites', search, category, tone] })
      const prev = queryClient.getQueryData(['my-favorites', search, category, tone])
      queryClient.setQueryData(['my-favorites', search, category, tone], (old) => {
        if (!old) return old
        if (Array.isArray(old)) {
          return old.map((page) => page.filter((f) => f._id !== lessonId))
        }
        return {
          ...old,
          pages: old.pages?.map((page) => ({
            ...page,
            lessons: page.lessons?.filter((f) => f._id !== lessonId) ?? [],
          })) ?? [],
        }
      })
      return { prev }
    },
    onError: (_err, _id, ctx) => {
      queryClient.setQueryData(['my-favorites', search, category, tone], ctx.prev)
      toast.error('Failed to remove favorite')
    },
    onSuccess: () => {
      toast.success('Removed from favorites')
      queryClient.invalidateQueries({ queryKey: ['my-favorites'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-overview'] })
    },
  })

  const lessons = data?.pages?.flatMap((page) =>
    Array.isArray(page) ? page : page.lessons ?? []
  ) ?? []
  const totalFavorites = data?.pages?.[0]?.pagination?.total ?? lessons.length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-serif text-foreground">My Favorites</h1>
        <p className="text-sm text-muted-foreground mt-0.5">{totalFavorites} saved lesson{totalFavorites !== 1 ? 's' : ''}</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search favorites..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={tone} onValueChange={setTone}>
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TONES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: PAGE_SIZE }).map((_, i) => (
            <Skeleton key={i} className="h-72 rounded-xl" />
          ))}
        </div>
      ) : lessons.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
          <BookmarkX className="h-12 w-12 text-muted-foreground/40" />
          <p className="font-medium text-foreground">No favorites found</p>
          <p className="text-sm text-muted-foreground">Try adjusting your filters or explore lessons to save.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {lessons.map((lesson) => (
              <div key={lesson._id} className="relative group">
                <LessonCard lesson={lesson} isPremiumUser={isPremiumRole} />
                {/* Remove favorite overlay button */}
                <button
                  onClick={() => removeMutation.mutate(lesson._id)}
                  disabled={removeMutation.isPending}
                  className="absolute top-3 right-3 z-10 rounded-full bg-background/90 p-1.5 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive hover:text-destructive-foreground"
                  aria-label="Remove from favorites"
                >
                  <BookmarkX className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>

          <div ref={sentinelRef} className="h-1" />

          <div className="mt-6 flex flex-col items-center gap-3 text-sm text-muted-foreground">
            {isFetchingNextPage && (
              <div className="flex items-center gap-2">
                <span>Loading more favorites…</span>
                <span className="inline-flex rounded-full border-primary/30 border-t-primary animate-spin h-4 w-4" aria-hidden="true" />
              </div>
            )}
            {!isFetchingNextPage && !hasNextPage && (
              <span className="text-center text-sm text-muted-foreground">You have reached the end of your favorites.</span>
            )}
          </div>
        </>
      )}
    </div>
  )
}
