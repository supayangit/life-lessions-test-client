'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import {
  BookOpen, Search, Star, CheckCircle, Trash2, Filter, Loader2, Crown,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { EmptyState } from '@/components/shared/EmptyState'
import { ErrorState } from '@/components/shared/ErrorState'
import { useRole } from '@/hooks/useRole'
import { useAxiosSecure } from '@/hooks/useAxiosSecure'
import { getAdminLessons, adminToggleFeature, adminToggleReview, adminDeleteLesson } from '@/services/adminApi'
import { useDebounce } from '@/hooks/useDebounce'
import toast from 'react-hot-toast'
import Swal from 'sweetalert2'
import { cn } from '@/lib/utils'

// Format creator ID: show first 2 and last 2 chars with *** in middle (7 chars total)
function formatCreatorId(id) {
  if (!id || id.length < 7) return id
  return `${id.slice(0, 2)}***${id.slice(-2)}`
}

function LessonsTableSkeleton() {
  return (
    <div className="space-y-3 p-4 animate-pulse">
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <Skeleton className="h-4 flex-1" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-8" />
        </div>
      ))}
    </div>
  )
}

export default function AdminLessonsPage() {
  const router = useRouter()
  const { isAdmin, isPending: rolePending } = useRole()
  const axiosSecure = useAxiosSecure()
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [visibilityFilter, setVisibilityFilter] = useState('all')
  const debouncedSearch = useDebounce(search, 400)
  const sentinelRef = useRef(null)
  const nextPageRequestRef = useRef(false)

  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['admin-lessons', debouncedSearch, categoryFilter, visibilityFilter],
    queryFn: ({ pageParam = 1 }) => getAdminLessons(axiosSecure, {
      search: debouncedSearch,
      category: categoryFilter !== 'all' ? categoryFilter : undefined,
      visibility: visibilityFilter !== 'all' ? visibilityFilter : undefined,
      page: pageParam,
      limit: 10,
    }),
    getNextPageParam: (lastPage) => {
      if (lastPage?.pagination?.hasNextPage) {
        return lastPage.pagination.page + 1
      }
      return undefined
    },
    enabled: isAdmin,
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
            entry.intersectionRatio >= 0.1 &&
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
        rootMargin: '0px 0px 150px 0px',
        threshold: 0.1,
      }
    )

    observer.observe(sentinel)
    return () => {
      observer.disconnect()
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage])

  const { mutate: toggleFeature, isPending: featurePending, variables: featureVars } = useMutation({
    mutationFn: (id) => adminToggleFeature(id, axiosSecure),
    onSuccess: () => { toast.success('Feature status updated'); queryClient.invalidateQueries({ queryKey: ['admin-lessons'] }) },
    onError: () => toast.error('Failed to update feature'),
  })

  const { mutate: toggleReview, isPending: reviewPending, variables: reviewVars } = useMutation({
    mutationFn: (id) => adminToggleReview(id, axiosSecure),
    onSuccess: () => { toast.success('Review status updated'); queryClient.invalidateQueries({ queryKey: ['admin-lessons'] }) },
    onError: () => toast.error('Failed to update review'),
  })

  const { mutate: deleteLesson } = useMutation({
    mutationFn: (id) => adminDeleteLesson(id, axiosSecure),
    onSuccess: () => { toast.success('Lesson deleted'); queryClient.invalidateQueries({ queryKey: ['admin-lessons'] }) },
    onError: () => toast.error('Failed to delete lesson'),
  })

  const handleDelete = async (lesson) => {
    const result = await Swal.fire({
      title: 'Delete lesson?',
      text: `"${lesson.title}" will be permanently removed.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel',
      confirmButtonColor: 'oklch(0.577 0.245 27.325)',
    })
    if (result.isConfirmed) deleteLesson(lesson._id)
  }

  const lessons = data?.pages?.flatMap((page) => page.lessons) ?? []
  const totalLessons = data?.pages?.[0]?.pagination?.total ?? lessons.length
  const categories = ['all', ...new Set(lessons.map((l) => l.category).filter(Boolean))]

  if (rolePending) return null

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold font-serif text-foreground">Manage Lessons</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Review, feature, and moderate all lessons</p>
        </div>
        <Badge variant="secondary" className="text-sm px-3 py-1">{totalLessons} lessons</Badge>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
          <Input placeholder="Search lessons..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((c) => <SelectItem key={c} value={c}>{c === 'all' ? 'All Categories' : c}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={visibilityFilter} onValueChange={setVisibilityFilter}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Visibility" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="public">Public</SelectItem>
            <SelectItem value="private">Private</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <LessonsTableSkeleton />
          ) : error && !data ? (
            <ErrorState message="Failed to load lessons." onRetry={() => queryClient.invalidateQueries(['admin-lessons'])} />
          ) : lessons.length === 0 ? (
            <EmptyState icon={BookOpen} title="No lessons found" description="Try adjusting your filters." />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Author</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Feature</TableHead>
                    <TableHead>Review</TableHead>
                    <TableHead>Delete</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lessons.map((lesson) => (
                    <TableRow key={lesson._id} className={cn(lesson.isFlagged && 'bg-destructive/5')}>
                      <TableCell className="max-w-[200px]">
                        <div className="flex items-center gap-1.5">
                          <Link
                            href={`/lesson/${lesson._id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-medium text-foreground line-clamp-1 hover:text-primary hover:underline"
                          >
                            {lesson.title}
                          </Link>
                          {lesson.isFlagged && <Badge variant="destructive" className="text-[10px] h-4 px-1.5">Flagged</Badge>}
                          {lesson.isPremium && <Sparkles className="h-3 w-3 text-accent flex-shrink-0" aria-label="Premium" />}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-xs">{lesson.category}</Badge>
                      </TableCell>
                      <TableCell>
                        <Link
                          href={`/user/profile?userId=${lesson.creatorId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-muted-foreground hover:text-primary hover:underline"
                        >
                          {formatCreatorId(lesson.creatorId)}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Badge variant={lesson.visibility === 'public' ? 'outline' : 'secondary'} className="text-xs">
                          {lesson.visibility}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant={lesson.featured ? 'default' : 'outline'}
                          size="sm"
                          className="h-7 text-xs px-2.5 gap-1"
                          onClick={() => toggleFeature(lesson._id)}
                          disabled={featurePending && featureVars === lesson._id}
                        >
                          {featurePending && featureVars === lesson._id
                            ? <Loader2 className="h-3 w-3 animate-spin" />
                            : <Star className="h-3 w-3" />}
                          {lesson.featured ? 'Featured' : 'Feature'}
                        </Button>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant={lesson.reviewed ? 'default' : 'outline'}
                          size="sm"
                          className="h-7 text-xs px-2.5 gap-1"
                          onClick={() => toggleReview(lesson._id)}
                          disabled={reviewPending && reviewVars === lesson._id}
                        >
                          {reviewPending && reviewVars === lesson._id
                            ? <Loader2 className="h-3 w-3 animate-spin" />
                            : <CheckCircle className="h-3 w-3" />}
                          {lesson.reviewed ? 'Reviewed' : 'Review'}
                        </Button>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive hover:bg-destructive/10"
                          onClick={() => handleDelete(lesson)}
                          aria-label="Delete lesson"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div ref={sentinelRef} className="h-1" />
              {(isFetchingNextPage || hasNextPage) && (
                <div className="mt-3 flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  {isFetchingNextPage ? (
                    <>
                      <span className="inline-flex h-4 w-4 rounded-full border-t-primary border border-primary/30 animate-spin" />
                      <span>Loading more lessons…</span>
                    </>
                  ) : (
                    <span>Scroll to load more lessons</span>
                  )}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
