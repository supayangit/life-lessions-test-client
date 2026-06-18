'use client'

import { useQuery } from '@tanstack/react-query'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  Lock,
  Calendar,
  Tag,
  BookOpen,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { Container } from '@/src/components/shared/Container'
import { ErrorState } from '@/src/components/shared/ErrorState'
import { InteractionBar } from '@/src/components/lessons/InteractionBar'
import { CommentsSection } from '@/src/components/lessons/CommentsSection'
import { ScrollProgressBar } from '@/src/components/shared/ScrollProgressBar'
import { ReadingTime } from '@/src/components/shared/ReadingTime'
import { getLessonById } from '@/src/services/lessonApi'
import { usePremium } from '@/src/hooks/usePremium'
import { cn } from '@/lib/utils'

const TONE_COLORS = {
  reflective: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  hopeful: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  cautionary: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  motivational: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  melancholic: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  humorous: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
}

function LessonDetailSkeleton() {
  return (
    <div className="py-10 min-h-screen">
      <Container>
        <Skeleton className="h-5 w-24 mb-6" />
        <Skeleton className="h-10 w-3/4 mb-4" />
        <Skeleton className="h-5 w-48 mb-8" />
        <Skeleton className="h-80 w-full rounded-2xl mb-8" />
        <div className="space-y-4 max-w-3xl">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
        </div>
      </Container>
    </div>
  )
}

export default function LessonDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const { isPremium } = usePremium()

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['lesson', id],
    queryFn: () => getLessonById(id),
    enabled: Boolean(id),
  })

  const lesson = data?.lesson || data

  if (isLoading) return <LessonDetailSkeleton />

  if (isError) {
    return (
      <div className="py-20">
        <Container>
          <ErrorState title="Could not load this lesson" error={error} onRetry={refetch} />
        </Container>
      </div>
    )
  }

  if (!lesson) return null

  const {
    title,
    description,
    content,
    category,
    tone,
    image,
    author,
    isPremium: lessonIsPremium,
    likesCount = 0,
    savesCount = 0,
    createdAt,
    tags = [],
  } = lesson

  const isLocked = lessonIsPremium && !isPremium

  const authorInitials = author?.name
    ? author.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U'

  const formattedDate = createdAt
    ? new Date(createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null

  return (
    <article className="py-10 min-h-screen">
      <ScrollProgressBar />
      <Container>
        {/* Back button */}
        <Button
          variant="ghost"
          size="sm"
          className="mb-6 gap-1.5 text-muted-foreground -ml-2"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl"
        >
          {/* Badges row */}
          <div className="flex flex-wrap gap-2 mb-4">
            {category && (
              <Badge variant="secondary" className="text-xs">
                <Tag className="h-3 w-3 mr-1" />
                {category}
              </Badge>
            )}
            {tone && (
              <span
                className={cn(
                  'inline-flex items-center text-xs font-medium px-2.5 py-0.5 rounded-full',
                  TONE_COLORS[tone.toLowerCase()] || 'bg-muted text-muted-foreground'
                )}
              >
                {tone}
              </span>
            )}
            {lessonIsPremium && (
              <Badge className="text-xs bg-accent text-accent-foreground border-0">
                Premium
              </Badge>
            )}
          </div>

          {/* Title */}
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground leading-tight text-balance mb-4">
            {title}
          </h1>

          {/* Description */}
          {description && (
            <p className="text-lg text-muted-foreground leading-relaxed mb-6 max-w-2xl">
              {description}
            </p>
          )}

          {/* Author & meta row */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8 pb-8 border-b border-border">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={author?.image} alt={author?.name || 'Author'} />
                <AvatarFallback className="bg-primary/10 text-primary font-medium text-sm">
                  {authorInitials}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium text-foreground">{author?.name || 'Anonymous'}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  {formattedDate && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formattedDate}
                    </p>
                  )}
                  {content && <ReadingTime content={content} />}
                </div>
              </div>
            </div>

            {/* Actions */}
            <InteractionBar
              lessonId={id}
              lessonUrl={typeof window !== 'undefined' ? window.location.href : ''}
              initialLikes={likesCount}
              initialSaves={savesCount}
            />
          </div>

          {/* Cover image */}
          {image && (
            <div className="relative mb-8 rounded-2xl overflow-hidden aspect-video bg-muted">
              <Image
                src={image}
                alt={title}
                fill
                className={cn(
                  'object-cover',
                  isLocked && 'blur-sm scale-105'
                )}
                sizes="(max-width: 768px) 100vw, 896px"
                priority
              />
              {isLocked && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/50 backdrop-blur-[3px]">
                  <div className="rounded-full bg-background/90 p-4 shadow-md mb-3">
                    <Lock className="h-8 w-8 text-primary" />
                  </div>
                  <p className="text-base font-semibold text-foreground">Premium Content</p>
                  <p className="text-sm text-muted-foreground mt-1">Upgrade to read this lesson in full.</p>
                </div>
              )}
            </div>
          )}

          {/* Content */}
          {isLocked ? (
            <div className="rounded-2xl border border-border bg-muted/30 p-8 sm:p-12 text-center">
              <div className="inline-flex items-center justify-center rounded-full bg-primary/10 p-4 mb-4">
                <Lock className="h-8 w-8 text-primary" />
              </div>
              <h2 className="font-serif text-xl font-bold text-foreground mb-2">
                This is a Premium Lesson
              </h2>
              <p className="text-muted-foreground text-sm max-w-md mx-auto mb-6 leading-relaxed">
                Unlock access to this lesson and hundreds more by upgrading to a Premium membership.
              </p>
              <Button asChild size="lg" className="gap-2">
                <Link href="/pricing">
                  <BookOpen className="h-4 w-4" />
                  Unlock Premium Access
                </Link>
              </Button>
            </div>
          ) : (
            <div className="prose prose-neutral dark:prose-invert max-w-none text-foreground leading-relaxed">
              {content ? (
                <div
                  className="[&>p]:mb-4 [&>p]:text-base [&>p]:leading-relaxed [&>h2]:font-serif [&>h2]:text-2xl [&>h2]:font-bold [&>h2]:mt-8 [&>h2]:mb-3 [&>h3]:font-semibold [&>h3]:text-lg [&>h3]:mt-6 [&>h3]:mb-2 [&>ul]:mb-4 [&>ul]:pl-5 [&>li]:mb-1"
                  dangerouslySetInnerHTML={{ __html: content }}
                />
              ) : (
                <p className="text-muted-foreground italic">No content available for this lesson.</p>
              )}
            </div>
          )}

          {/* Tags */}
          {tags.length > 0 && !isLocked && (
            <div className="mt-10 pt-8 border-t border-border">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Tags</p>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Comments */}
          {!isLocked && (
            <div className="mt-12">
              <CommentsSection lessonId={id} />
            </div>
          )}
        </motion.div>
      </Container>
    </article>
  )
}
