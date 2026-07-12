'use client'

import { useState, useEffect, useRef } from 'react'
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { MessageSquare, Trash2, Send, Loader2 } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { useAuth } from '@/hooks/useAuth'
import { getComments, addComment, deleteComment } from '@/services/commentsApi'

const MOCK_COMMENTS = [
  {
    _id: 'c1',
    content: 'This resonated deeply with me. I went through something similar three years ago.',
    author: { name: 'Sarah K.', image: null },
    createdAt: '2025-06-12T10:00:00Z',
  },
  {
    _id: 'c2',
    content: 'Beautifully written. Thank you for sharing such a personal experience.',
    author: { name: 'James R.', image: null },
    createdAt: '2025-06-11T14:30:00Z',
  },
]

function CommentItem({ comment, currentUserId, onDelete }) {
  const authorName = comment.author?.name || comment.userName || comment.user?.name || 'Anonymous'
  const authorImage = comment.author?.image || comment.userPhoto || comment.user?.image || null
  const authorId = comment.author?._id || comment.userId || comment.user?._id

  const initials = authorName
    ? authorName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U'

  const isOwn = currentUserId && authorId === currentUserId

  return (
    <div className="flex gap-3">
      <Avatar className="h-8 w-8 flex-shrink-0 mt-0.5">
        <AvatarImage src={authorImage} alt={authorName} />
        <AvatarFallback className="text-[10px] bg-muted text-muted-foreground">{initials}</AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-sm font-medium text-foreground">{authorName}</span>
          <span className="text-xs text-muted-foreground flex-shrink-0">
            {new Date(comment.createdAt).toLocaleDateString()}
          </span>
        </div>
        <p className="text-sm text-foreground/80 mt-0.5 leading-relaxed">{comment.content}</p>
      </div>
      {isOwn && (
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 flex-shrink-0 text-muted-foreground hover:text-destructive mt-0.5"
          onClick={() => onDelete(comment._id)}
          aria-label="Delete comment"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      )}
    </div>
  )
}

/**
 * CommentsSection — real-time refresh via React Query refetchInterval.
 * @param {{ lessonId: string }} props
 */
export function CommentsSection({ lessonId }) {
  const queryClient = useQueryClient()
  const { user, isAuthenticated } = useAuth()
  const [draft, setDraft] = useState('')
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
  const [commentToDelete, setCommentToDelete] = useState(null)

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
    queryKey: ['comments', lessonId],
    queryFn: ({ pageParam = 1 }) => getComments(lessonId, pageParam, 10),
    getNextPageParam: (lastPage) => {
      if (lastPage?.pagination?.hasNextPage) return lastPage.pagination.page + 1
      return undefined
    },
    refetchInterval: 15000,
    retry: false,
    onSuccess: (d) => {
      const count = d?.pages?.flatMap((p) => p.comments ?? []).length ?? 0
      console.log(`[CommentsSection] Loaded comments for lesson ${lessonId}`, count, 'items')
    },
    onError: (err) => {
      console.error(`[CommentsSection] Failed to load comments for lesson ${lessonId}`, err)
    },
  })

  const commentPages = data?.pages ?? []
  const commentList = commentPages.flatMap((p) => p?.comments ?? [])

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
      { root: null, rootMargin: '200px', threshold: 0.1 }
    )

    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [fetchNextPage, hasNextPage, isFetchingNextPage])

  const postMutation = useMutation({
    mutationFn: (content) => addComment(lessonId, content),
    onMutate: async (content) => {
      console.log(`[CommentsSection] Optimistically adding comment for lesson ${lessonId}`, { content })
      await queryClient.cancelQueries({ queryKey: ['comments', lessonId] })
      const previous = queryClient.getQueryData(['comments', lessonId])
      const optimistic = {
        _id: `opt-${Date.now()}`,
        content,
        userId: user?._id,
        userName: user?.name,
        userPhoto: user?.image,
        createdAt: new Date().toISOString(),
      }

      const newData = previous
        ? {
            ...previous,
            pages: previous.pages.map((pg, idx) =>
              idx === 0
                ? { ...pg, comments: [...(pg.comments || []), optimistic] }
                : pg
            ),
          }
        : { pages: [{ comments: [optimistic], pagination: { page: 1, hasNextPage: false } }], pageParams: [1] }

      queryClient.setQueryData(['comments', lessonId], newData)
      setDraft('')
      return { previous }
    },
    onError: (_err, _content, ctx) => {
      console.error(`[CommentsSection] Failed to post comment for lesson ${lessonId}`, _err)
      const previous = ctx?.previous ?? queryClient.getQueryData(['comments', lessonId])
      if (previous) queryClient.setQueryData(['comments', lessonId], previous)
      toast.error('Failed to post comment')
    },
    onSuccess: () => {
      console.log(`[CommentsSection] Comment posted successfully for lesson ${lessonId}`)
      queryClient.invalidateQueries({ queryKey: ['comments', lessonId] })
      queryClient.invalidateQueries({ queryKey: ['lesson', lessonId] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (commentId) => deleteComment(commentId),
    onMutate: async (commentId) => {
      console.log(`[CommentsSection] Optimistically deleting comment ${commentId} for lesson ${lessonId}`)
      await queryClient.cancelQueries({ queryKey: ['comments', lessonId] })
      const previous = queryClient.getQueryData(['comments', lessonId])
      const newData = previous
        ? { ...previous, pages: previous.pages.map((pg) => ({ ...pg, comments: (pg.comments || []).filter((c) => c._id !== commentId) })) }
        : previous
      queryClient.setQueryData(['comments', lessonId], newData)
      return { previous }
    },
    onError: (_err, _id, ctx) => {
      console.error(`[CommentsSection] Failed to delete comment for lesson ${lessonId}`, _err)
      const previous = ctx?.previous ?? queryClient.getQueryData(['comments', lessonId])
      if (previous) queryClient.setQueryData(['comments', lessonId], previous)
      toast.error('Failed to delete comment')
    },
    onSuccess: () => {
      console.log(`[CommentsSection] Comment deleted successfully for lesson ${lessonId}`)
      toast.success('Comment deleted')
      queryClient.invalidateQueries({ queryKey: ['comments', lessonId] })
    },
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!draft.trim()) return
    if (!isAuthenticated) { toast.error('Please log in to comment'); return }
    postMutation.mutate(draft.trim())
  }

  const handleConfirmDelete = () => {
    if (!commentToDelete) return
    deleteMutation.mutate(commentToDelete)
    setOpenDeleteDialog(false)
    setCommentToDelete(null)
  }

  const displayComments = commentList

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <MessageSquare className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold font-serif text-foreground">
          Comments ({displayComments.length})
        </h2>
      </div>

      <Separator />

      {/* Comment input */}
      {isAuthenticated ? (
        <form onSubmit={handleSubmit} className="flex gap-3">
          <Avatar className="h-8 w-8 flex-shrink-0 mt-1">
            <AvatarImage src={user?.image} alt={user?.name || 'You'} />
            <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-2">
            <Textarea
              placeholder="Share your thoughts on this lesson..."
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              rows={2}
              className="resize-none text-sm"
            />
            <Button
              type="submit"
              size="sm"
              disabled={!draft.trim() || postMutation.isPending}
              className="h-8"
            >
              {postMutation.isPending
                ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                : <Send className="h-3.5 w-3.5 mr-1.5" />
              }
              Post Comment
            </Button>
          </div>
        </form>
      ) : (
        <p className="text-sm text-muted-foreground py-2">
          <a href="/auth/login" className="text-primary hover:underline">Log in</a> to join the conversation.
        </p>
      )}

      {/* Comments list */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="flex gap-3">
              <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : displayComments.length === 0 ? (
        <p className="text-sm text-muted-foreground py-4 text-center">
          No comments yet. Be the first to share your thoughts!
        </p>
      ) : (
        <>
          <div className="space-y-5">
            {displayComments.map((comment) => (
              <CommentItem
                key={comment._id}
                comment={comment}
                currentUserId={user?.id || user?._id}
                onDelete={(id) => {
                  setCommentToDelete(id)
                  setOpenDeleteDialog(true)
                }}
              />
            ))}
          </div>

          <div ref={sentinelRef} className="h-1" />

          <div className="mt-4 flex flex-col items-center gap-2">
            {isFetchingNextPage && (
              <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                <span className="inline-block rounded-full border-primary/30 border-t-primary animate-spin h-5 w-5" aria-hidden="true" />
                Loading more comments…
              </span>
            )}

            {!isFetchingNextPage && !hasNextPage && (
              <span className="text-sm text-muted-foreground">No more comments.</span>
            )}
          </div>
        </>
      )}

      <Dialog open={openDeleteDialog} onOpenChange={(value) => {
        setOpenDeleteDialog(value)
        if (!value) setCommentToDelete(null)
      }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete comment?</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this comment? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-6 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpenDeleteDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleConfirmDelete}
              disabled={deleteMutation.isPending}
              className="h-9"
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
