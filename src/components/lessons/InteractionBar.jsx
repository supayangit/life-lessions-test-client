'use client'

import { useEffect, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import Swal from 'sweetalert2'
import {
  FacebookShareButton,
  LinkedinShareButton,
  TwitterShareButton,
} from 'react-share'
import { Heart, Bookmark, Share2, Flag } from 'lucide-react'
import { Button, buttonVariants } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { useAuth } from '@/src/hooks/useAuth'
import { addLike, removeLike } from '@/src/services/likesApi'
import { submitReport, REPORT_REASONS } from '@/src/services/reportsApi'
import { addFavorite, removeFavorite } from '@/src/services/favoritesApi'
import { useAxiosSecure } from '@/src/hooks/useAxiosSecure'

/**
 * InteractionBar — Like, Favorite, Share (Facebook/LinkedIn/X), Report
 *
 * @param {{
 *   lessonId: string,
 *   lessonUrl: string,
 *   initialLikes?: number,
 *   initialSaves?: number,
 *   isLiked?: boolean,
 *   isFavorited?: boolean,
 * }} props
 */
export function InteractionBar({
  lessonId,
  lessonUrl,
  initialLikes = 0,
  initialSaves = 0,
  isLiked = false,
  isFavorited = false,
}) {
  const axiosSecure = useAxiosSecure()
  const queryClient = useQueryClient()
  const { isAuthenticated } = useAuth()

  const [liked, setLiked] = useState(isLiked)
  const [likesCount, setLikesCount] = useState(initialLikes)
  const [favorited, setFavorited] = useState(isFavorited)
  const [savesCount, setSavesCount] = useState(initialSaves)

  useEffect(() => {
    console.log('InteractionBar mounted with:', {
      lessonId,
      isLiked,
      isFavorited,
      initialLikes,
      initialSaves,
      isAuthenticated,
    })
    setLiked(isLiked)
    setFavorited(isFavorited)
  }, [isLiked, isFavorited, isAuthenticated, initialLikes, initialSaves, lessonId])

  const shareUrl = lessonUrl || (typeof window !== 'undefined' ? window.location.href : '')

  /* ── Like (optimistic) ── */
  const likeMutation = useMutation({
    mutationFn: ({ nextLiked }) =>
      nextLiked ? addLike(lessonId, axiosSecure) : removeLike(lessonId, axiosSecure),
    onMutate: ({ nextLiked }) => {
      console.log('Like toggle requested:', {
        lessonId,
        currentLiked: liked,
        nextLiked,
      })
      setLiked(nextLiked)
      setLikesCount((prev) => (nextLiked ? prev + 1 : prev - 1))
      return { previousLiked: liked, previousLikesCount: likesCount, nextLiked }
    },
    onError: (_err, _variables, ctx) => {
      console.log('Like toggle failed, reverting:', {
        lessonId,
        error: _err,
        ctx,
      })
      if (ctx) {
        setLiked(ctx.previousLiked)
        setLikesCount(ctx.previousLikesCount)
      }
      toast.error('Failed to update like')
    },
    onSuccess: (data, variables) => {
      const { nextLiked } = variables || {}
      console.log('Like toggle succeeded:', {
        lessonId,
        nextLiked,
        response: data,
      })
      const likesCountFromApi = data?.lesson?.likesCount ?? data?.likesCount
      if (typeof nextLiked === 'boolean') setLiked(nextLiked)
      if (typeof likesCountFromApi === 'number') setLikesCount(likesCountFromApi)
      queryClient.invalidateQueries({ queryKey: ['lesson', lessonId] })
    },
  })

  /* ── Favorite (optimistic) ── */
  const favMutation = useMutation({
    mutationFn: ({ nextFavorited }) =>
      nextFavorited
        ? addFavorite(lessonId, axiosSecure)
        : removeFavorite(lessonId, axiosSecure),
    onMutate: ({ nextFavorited }) => {
      console.log('Favorite toggle requested:', {
        lessonId,
        currentFavorited: favorited,
        nextFavorited,
      })
      setFavorited(nextFavorited)
      setSavesCount((prev) => (nextFavorited ? prev + 1 : prev - 1))
      return {
        previousFavorited: favorited,
        previousSavesCount: savesCount,
        nextFavorited,
      }
    },
    onError: (_err, _variables, ctx) => {
      console.log('Favorite toggle failed, reverting:', {
        lessonId,
        error: _err,
        ctx,
      })
      if (ctx) {
        setFavorited(ctx.previousFavorited)
        setSavesCount(ctx.previousSavesCount)
      }
      toast.error('Failed to update favorite')
    },
    onSuccess: (data, variables) => {
      const { nextFavorited } = variables || {}
      console.log('Favorite toggle succeeded:', {
        lessonId,
        nextFavorited,
        response: data,
      })
      // Ensure UI state matches server response
      const favCount = data?.lesson?.favoritesCount ?? data?.favoritesCount
      if (typeof nextFavorited === 'boolean') setFavorited(nextFavorited)
      if (typeof favCount === 'number') setSavesCount(favCount)
      toast.success(nextFavorited ? 'Saved to favorites' : 'Removed from favorites')
      queryClient.invalidateQueries({ queryKey: ['my-favorites'] })
      queryClient.invalidateQueries({ queryKey: ['lesson', lessonId] })
    },
  })

  /* ── Report ── */
  const reportMutation = useMutation({
    mutationFn: (reason) => submitReport(lessonId, reason, axiosSecure),
    onSuccess: () => toast.success('Report submitted. Thank you for keeping our community safe.'),
    onError: () => toast.error('Failed to submit report'),
  })

  const handleLike = () => {
    if (!isAuthenticated) {
      toast.error('Please log in to like lessons')
      console.log('Like attempt blocked: unauthenticated user', { lessonId })
      return
    }

    const nextLiked = !liked
    console.log('Like button clicked', {
      lessonId,
      currentLiked: liked,
      nextLiked,
    })
    likeMutation.mutate({ nextLiked })
  }

  const handleFavorite = () => {
    if (!isAuthenticated) { toast.error('Please log in to save lessons'); return }
    const nextFavorited = !favorited
    favMutation.mutate({ nextFavorited })
  }

  const handleReport = async () => {
    if (!isAuthenticated) { toast.error('Please log in to report lessons'); return }

    const { value: reason } = await Swal.fire({
      title: 'Report this lesson',
      input: 'select',
      inputOptions: Object.fromEntries(REPORT_REASONS.map((r) => [r, r])),
      inputPlaceholder: 'Select a reason',
      showCancelButton: true,
      confirmButtonText: 'Submit Report',
      cancelButtonText: 'Cancel',
      inputValidator: (val) => { if (!val) return 'Please select a reason' },
      background: 'var(--card)',
      color: 'var(--card-foreground)',
      confirmButtonColor: 'oklch(0.52 0.13 195)',
    })

    if (reason) reportMutation.mutate(reason)
  }

  return (
    <div className="flex items-center gap-1 flex-wrap">
      {/* Like */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleLike}
        disabled={likeMutation.isPending}
        className={cn(
          'h-8 gap-1.5 text-sm px-3',
          liked ? 'text-rose-500 hover:text-rose-600' : 'text-muted-foreground hover:text-foreground'
        )}
        aria-label={liked ? 'Unlike' : 'Like'}
      >
        <Heart className={cn('h-4 w-4', liked && 'fill-current')} />
        <span>{likesCount}</span>
      </Button>

      {/* Favorite */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleFavorite}
        disabled={favMutation.isPending}
        className={cn(
          'h-8 gap-1.5 text-sm px-3',
          favorited ? 'text-primary hover:text-primary/80' : 'text-muted-foreground hover:text-foreground'
        )}
        aria-label={favorited ? 'Remove from favorites' : 'Save to favorites'}
      >
        <Bookmark className={cn('h-4 w-4', favorited && 'fill-current')} />
        <span>{savesCount}</span>
      </Button>

      {/* Social Share */}
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <button
              type="button"
              className={cn(
                buttonVariants({ variant: 'ghost', size: 'sm' }),
                'h-8 gap-1.5 text-sm px-3 text-muted-foreground hover:text-foreground'
              )}
            >
              <Share2 className="h-4 w-4" />
              Share
            </button>
          }
        />
        <DropdownMenuContent align="start" className="w-44">
          <DropdownMenuItem asChild>
            <FacebookShareButton url={shareUrl} className="w-full">
              <span className="flex items-center gap-2 text-sm cursor-pointer w-full py-0.5">
                {/* Facebook brand colour inline */}
                <svg className="h-4 w-4 text-blue-600 fill-current" viewBox="0 0 24 24" aria-hidden="true"><path d="M24 12.073C24 5.404 18.627 0 12 0S0 5.404 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.514c-1.491 0-1.956.93-1.956 1.874v2.25h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/></svg>
                Facebook
              </span>
            </FacebookShareButton>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <LinkedinShareButton url={shareUrl} className="w-full">
              <span className="flex items-center gap-2 text-sm cursor-pointer w-full py-0.5">
                {/* LinkedIn brand colour inline */}
                <svg className="h-4 w-4 text-sky-700 fill-current" viewBox="0 0 24 24" aria-hidden="true"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                LinkedIn
              </span>
            </LinkedinShareButton>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <TwitterShareButton url={shareUrl} className="w-full">
              <span className="flex items-center gap-2 text-sm cursor-pointer w-full py-0.5">
                <Share2 className="h-4 w-4 text-sky-500" />
                X (Twitter)
              </span>
            </TwitterShareButton>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Report */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleReport}
        disabled={reportMutation.isPending}
        className="h-8 gap-1.5 text-sm px-3 text-muted-foreground hover:text-destructive"
        aria-label="Report lesson"
      >
        <Flag className="h-4 w-4" />
        Report
      </Button>
    </div>
  )
}
