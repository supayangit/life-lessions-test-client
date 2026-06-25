'use client'


import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import {
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Plus,
  Heart,
  Bookmark,
  MessageSquare,
  ArrowUpRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { useAxiosSecure } from '@/src/hooks/useAxiosSecure'
import { getMyLessons, deleteLesson, toggleVisibility, toggleAccessLevel } from '@/src/services/lessonApi'

function LessonRowSkeleton() {
  return (
    <TableRow>
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <TableCell key={i}><Skeleton className="h-5 w-full" /></TableCell>
      ))}
    </TableRow>
  )
}

export default function MyLessonsPage() {
  const axiosSecure = useAxiosSecure()
  const queryClient = useQueryClient()

  const sentinelRef = useRef(null)
  const nextPageRequestRef = useRef(false)

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [lessonToDelete, setLessonToDelete] = useState(null)

  const [visibilityDialogOpen, setVisibilityDialogOpen] = useState(false)
  const [lessonToToggleVisibility, setLessonToToggleVisibility] = useState(null)

  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['my-lessons'],
    queryFn: ({ pageParam = 1 }) => getMyLessons(axiosSecure, pageParam, 10),
    getNextPageParam: (lastPage) => {
      if (lastPage?.pagination?.hasNextPage) {
        return lastPage.pagination.page + 1
      }
      return undefined
    },
    retry: false,
    onSuccess: (response) => {
      const loaded = response?.pages?.flatMap((page) => page.lessons ?? []) ?? []
      console.log('[MyLessonsPage] Loaded lessons count:', loaded.length, 'pages:', response?.pages?.length)
    },
    onError: (err) => {
      console.error('[MyLessonsPage] Failed to load my lessons', err)
    },
  })

  const lessons = data?.pages?.flatMap((page) => page.lessons ?? []) ?? []

  const updateMyLessonsPages = (old, callback) => {
    if (!old) return old
    if (Array.isArray(old)) return old.map(callback)
    return {
      ...old,
      pages: old.pages?.map((page) => ({
        ...page,
        lessons: callback(page.lessons ?? []),
      })) ?? [],
    }
  }

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
    return () => observer.disconnect()
  }, [fetchNextPage, hasNextPage, isFetchingNextPage])

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteLesson(id, axiosSecure),
    onSuccess: () => {
      toast.success('Lesson deleted')
      queryClient.invalidateQueries({ queryKey: ['my-lessons'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-overview'] })
    },
    onError: () => toast.error('Failed to delete lesson'),
  })

  const visibilityMutation = useMutation({
    mutationFn: (id) => toggleVisibility(id, axiosSecure),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['my-lessons'] })
      const prev = queryClient.getQueryData(['my-lessons'])
      queryClient.setQueryData(['my-lessons'], (old) =>
        updateMyLessonsPages(old, (lessons) =>
          lessons.map((l) =>
            l._id === id ? { ...l, visibility: l.visibility === 'public' ? 'private' : 'public' } : l
          )
        )
      )
      return { prev }
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.prev) {
        queryClient.setQueryData(['my-lessons'], ctx.prev)
      }
      toast.error('Failed to update visibility')
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['my-lessons'] }),
  })

  const accessMutation = useMutation({
    mutationFn: (id) => toggleAccessLevel(id, axiosSecure),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['my-lessons'] })
      const prev = queryClient.getQueryData(['my-lessons'])
      queryClient.setQueryData(['my-lessons'], (old) =>
        updateMyLessonsPages(old, (lessons) =>
          lessons.map((l) =>
            l._id === id ? { ...l, accessLevel: l.accessLevel === 'free' ? 'premium' : 'free' } : l
          )
        )
      )
      return { prev }
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.prev) {
        queryClient.setQueryData(['my-lessons'], ctx.prev)
      }
      toast.error('Failed to update access level')
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['my-lessons'] }),
  })

  const handleDeleteClick = (id, title) => {
    setLessonToDelete({ id, title })
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = () => {
    if (lessonToDelete) {
      deleteMutation.mutate(lessonToDelete.id)
      setDeleteDialogOpen(false)
      setLessonToDelete(null)
    }
  }

  const handleVisibilityToggleClick = (id) => {
    const lesson = lessons.find((l) => l._id === id)
    setLessonToToggleVisibility(lesson)
    setVisibilityDialogOpen(true)
  }

  const handleConfirmVisibilityToggle = () => {
    if (lessonToToggleVisibility) {
      visibilityMutation.mutate(lessonToToggleVisibility._id)
      setVisibilityDialogOpen(false)
      setLessonToToggleVisibility(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold font-serif text-foreground">My Lessons</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{lessons.length} lesson{lessons.length !== 1 ? 's' : ''} published</p>
        </div>
        <Button asChild size="sm">
          <Link href="/dashboard/add-lesson">
            <Plus className="h-4 w-4 mr-1.5" />
            Add Lesson
          </Link>
        </Button>
      </div>

      <div className="rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead className="min-w-[180px]">Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Visibility</TableHead>
              <TableHead>Access</TableHead>
              <TableHead>Stats</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              [1, 2, 3].map((i) => <LessonRowSkeleton key={i} />)
            ) : lessons.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                  No lessons yet.{' '}
                  <Link href="/dashboard/add-lesson" className="text-primary hover:underline">
                    Add your first lesson
                  </Link>
                </TableCell>
              </TableRow>
            ) : (
              lessons.map((lesson) => (
                <TableRow key={lesson._id} className="group">
                  {/* Title */}
                  <TableCell className="font-medium">
                    <div className="flex items-start gap-1.5 max-w-[220px]">
                      <span className="line-clamp-2 text-sm">{lesson.title}</span>
                      <Link href={`/lesson/${lesson._id}`} className="opacity-0 group-hover:opacity-100 flex-shrink-0 mt-0.5 transition-opacity">
                        <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground" />
                      </Link>
                    </div>
                    <span className="text-xs text-muted-foreground mt-0.5 block">
                      {new Date(lesson.createdAt).toLocaleDateString()}
                    </span>
                  </TableCell>

                  {/* Category */}
                  <TableCell>
                    <Badge variant="secondary" className="text-xs whitespace-nowrap">{lesson.category}</Badge>
                  </TableCell>

                  {/* Visibility toggle */}
                  <TableCell>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className={`h-7 gap-1.5 text-xs px-2 ${lesson.visibility === 'public' ? 'text-primary' : 'text-muted-foreground'}`}
                          onClick={() => handleVisibilityToggleClick(lesson._id)}
                          disabled={visibilityMutation.isPending}
                        >
                          {lesson.visibility === 'public'
                            ? <><Eye className="h-3.5 w-3.5" /> Public</>
                            : <><EyeOff className="h-3.5 w-3.5" /> Private</>
                          }
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Toggle visibility</TooltipContent>
                    </Tooltip>
                  </TableCell>

                  {/* Access Level toggle */}
                  <TableCell>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className={`h-7 gap-1.5 text-xs px-2 ${lesson.accessLevel === 'premium' ? 'text-accent-foreground' : 'text-muted-foreground'}`}
                          onClick={() => accessMutation.mutate(lesson._id)}
                          disabled={accessMutation.isPending}
                        >
                          {lesson.accessLevel === 'premium'
                            ? <><Lock className="h-3.5 w-3.5" /> Premium</>
                            : <><Unlock className="h-3.5 w-3.5" /> Free</>
                          }
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Toggle access level</TooltipContent>
                    </Tooltip>
                  </TableCell>

                  {/* Stats */}
                  <TableCell>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Heart className="h-3.5 w-3.5" /> {lesson.likesCount ?? 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <Bookmark className="h-3.5 w-3.5" /> {lesson.favoritesCount ?? 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="h-3.5 w-3.5" /> {lesson.commentsCount ?? 0}
                      </span>
                    </div>
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7" asChild>
                            <Link href={`/dashboard/my-lessons/${lesson._id}`}>
                              <Edit2 className="h-3.5 w-3.5" />
                              <span className="sr-only">Edit</span>
                            </Link>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Edit lesson</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive hover:text-destructive"
                            onClick={() => handleDeleteClick(lesson._id, lesson.title)}
                            disabled={deleteMutation.isPending}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Delete lesson</TooltipContent>
                      </Tooltip>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div ref={sentinelRef} className="h-1" />

      <div className="mt-4 flex flex-col items-center gap-2">
        {isFetchingNextPage && (
          <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
            <span className="inline-block h-4 w-4 animate-spin rounded-full border border-t-primary" aria-hidden="true" />
            Loading more lessons…
          </span>
        )}
        {!isFetchingNextPage && !hasNextPage && lessons.length > 0 && (
          <span className="text-sm text-muted-foreground">End of lessons.</span>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <Dialog open={deleteDialogOpen} onOpenChange={(value) => {
        setDeleteDialogOpen(value)
        if (!value) setLessonToDelete(null)
      }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete lesson?</DialogTitle>
            <DialogDescription>
              "{lessonToDelete?.title}" will be permanently removed. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-6 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={deleteMutation.isPending}
              className="h-9"
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Visibility Toggle Confirmation Modal */}
      <Dialog open={visibilityDialogOpen} onOpenChange={(value) => {
        setVisibilityDialogOpen(value)
        if (!value) setLessonToToggleVisibility(null)
      }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Change visibility?</DialogTitle>
            <DialogDescription>
              Change "{lessonToToggleVisibility?.title}" from {lessonToToggleVisibility?.visibility === 'public' ? 'public' : 'private'} to {lessonToToggleVisibility?.visibility === 'public' ? 'private' : 'public'}?
            </DialogDescription>
          </DialogHeader>
          <div className="mt-6 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setVisibilityDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleConfirmVisibilityToggle}
              disabled={visibilityMutation.isPending}
              className="h-9"
            >
              {visibilityMutation.isPending ? 'Changing...' : 'Change'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
