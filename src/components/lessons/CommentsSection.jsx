'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { MessageSquare, Trash2, Send, Loader2 } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { useAuth } from '@/src/hooks/useAuth'
import { useAxiosSecure } from '@/src/hooks/useAxiosSecure'
import { getComments, addComment, deleteComment } from '@/src/services/commentsApi'

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
  const initials = comment.author?.name
    ? comment.author.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U'

  const isOwn = currentUserId && comment.author?._id === currentUserId

  return (
    <div className="flex gap-3">
      <Avatar className="h-8 w-8 flex-shrink-0 mt-0.5">
        <AvatarImage src={comment.author?.image} alt={comment.author?.name || 'User'} />
        <AvatarFallback className="text-[10px] bg-muted text-muted-foreground">{initials}</AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-sm font-medium text-foreground">{comment.author?.name || 'Anonymous'}</span>
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
  const axiosSecure = useAxiosSecure()
  const queryClient = useQueryClient()
  const { user, isAuthenticated } = useAuth()
  const [draft, setDraft] = useState('')

  const { data: comments, isLoading } = useQuery({
    queryKey: ['comments', lessonId],
    queryFn: () => getComments(lessonId),
    placeholderData: MOCK_COMMENTS,
    refetchInterval: 15000,       // real-time: refresh every 15 s
    retry: false,
  })

  const postMutation = useMutation({
    mutationFn: (content) => addComment(lessonId, content, axiosSecure),
    onMutate: async (content) => {
      await queryClient.cancelQueries({ queryKey: ['comments', lessonId] })
      const prev = queryClient.getQueryData(['comments', lessonId])
      const optimistic = {
        _id: `opt-${Date.now()}`,
        content,
        author: { _id: user?._id, name: user?.name, image: user?.image },
        createdAt: new Date().toISOString(),
      }
      queryClient.setQueryData(['comments', lessonId], (old) => [
        ...(old || MOCK_COMMENTS),
        optimistic,
      ])
      setDraft('')
      return { prev }
    },
    onError: (_err, _content, ctx) => {
      queryClient.setQueryData(['comments', lessonId], ctx.prev)
      toast.error('Failed to post comment')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', lessonId] })
      queryClient.invalidateQueries({ queryKey: ['lesson', lessonId] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (commentId) => deleteComment(commentId, axiosSecure),
    onMutate: async (commentId) => {
      await queryClient.cancelQueries({ queryKey: ['comments', lessonId] })
      const prev = queryClient.getQueryData(['comments', lessonId])
      queryClient.setQueryData(['comments', lessonId], (old) =>
        (old || MOCK_COMMENTS).filter((c) => c._id !== commentId)
      )
      return { prev }
    },
    onError: (_err, _id, ctx) => {
      queryClient.setQueryData(['comments', lessonId], ctx.prev)
      toast.error('Failed to delete comment')
    },
    onSuccess: () => {
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

  const displayComments = Array.isArray(comments)
    ? comments
    : Array.isArray(comments?.comments)
    ? comments.comments
    : MOCK_COMMENTS

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
        <div className="space-y-5">
          {displayComments.map((comment) => (
            <CommentItem
              key={comment._id}
              comment={comment}
              currentUserId={user?.id || user?._id}
              onDelete={(id) => deleteMutation.mutate(id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
