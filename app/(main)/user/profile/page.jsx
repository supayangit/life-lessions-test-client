'use client'

import { useEffect, useMemo, useRef } from 'react'
import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { useSearchParams } from 'next/navigation'
import { BookOpen, Bookmark, Crown } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { LessonCard } from '@/components/lessons/LessonCard'
import { Container } from '@/components/shared/Container'
import { SectionHeading } from '@/components/shared/SectionHeading'
import { getUserById, getUserPublicLessons } from '@/services/userApi'
import { usePremium } from '@/hooks/usePremium'

function StatCard({ icon: Icon, value, label, color }) {
  return (
    <div className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card">
      <div className={`rounded-xl p-2.5 ${color}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <p className="text-xl font-bold text-foreground">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  )
}

export default function PublicProfilePage() {
  const searchParams = useSearchParams()
  const userId = searchParams.get('userId')
  const sentinelRef = useRef(null)
  const nextPageRequestRef = useRef(false)
  const { isPremium } = usePremium()

  const {
    data: profileData,
    isLoading: profileLoading,
    isError: profileError,
    error: profileErrorObject,
  } = useQuery({
    queryKey: ['public-user', userId],
    queryFn: () => getUserById(userId),
    enabled: Boolean(userId),
    retry: false,
  })

  const {
    data: lessonPages,
    isLoading: lessonsLoading,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteQuery({
    queryKey: ['public-user', userId, 'public-lessons'],
    queryFn: ({ pageParam = 1 }) => getUserPublicLessons(userId, pageParam, 6),
    enabled: Boolean(userId),
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
      { root: null, rootMargin: '200px', threshold: 0.1 }
    )

    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [fetchNextPage, hasNextPage, isFetchingNextPage])

  const profile = profileData ?? null
  const displayName = profile?.name || 'Contributor'
  const displayImage = profile?.image || null
  const displayBio = profile?.bio || null
  const initials = displayName
    ? displayName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U'

  const publicLessons = useMemo(
    () => lessonPages?.pages?.flatMap((page) => page.lessons ?? []) ?? [],
    [lessonPages]
  )

  if (!userId) {
    return (
      <Container>
        <div className="py-20 text-center">
          <p className="text-lg font-semibold">No contributor selected.</p>
          <p className="text-sm text-muted-foreground">Open a contributor profile from the top contributors list.</p>
        </div>
      </Container>
    )
  }

  return (
    <Container className="space-y-8 py-10">
      <SectionHeading
        title="Contributor Profile"
        subtitle="View the public profile and lessons shared by this top contributor."
      />

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className="relative shrink-0">
              {profileLoading ? (
                <Skeleton className="h-20 w-20 rounded-full" />
              ) : (
                <Avatar className="h-20 w-20">
                  <AvatarImage src={displayImage || undefined} alt={displayName} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-xl font-bold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              )}
            </div>

            <div className="flex-1 min-w-0">
              {profileLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-6 w-40" />
                  <Skeleton className="h-4 w-56" />
                </div>
              ) : profileError ? (
                <div className="space-y-2">
                  <p className="text-lg font-semibold">Profile not found.</p>
                  <p className="text-sm text-muted-foreground">Try a different contributor from the top contributors section.</p>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-xl font-bold font-serif text-foreground">{displayName}</h1>
                    {profile?.isPremium && (
                      <Badge className="flex items-center gap-1 bg-accent text-accent-foreground border-0 text-xs">
                        <Crown className="h-3 w-3" /> Premium
                      </Badge>
                    )}
                  </div>
                  {displayBio && (
                    <p className="text-sm text-foreground/80 mt-2 leading-relaxed">{displayBio}</p>
                  )}
                </>
              )}
            </div>
          </div>

          {!profileLoading && !profileError && (
            <div className="grid grid-cols-2 gap-3 mt-6">
              <StatCard
                icon={BookOpen}
                value={profile?.lessonsCount ?? 0}
                label="Lessons"
                color="bg-primary/10 text-primary"
              />
              <StatCard
                icon={Bookmark}
                value={profile?.favoritesCount ?? 0}
                label="Favorites"
                color="bg-accent/20 text-accent-foreground"
              />
            </div>
          )}
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold font-serif text-foreground">Public Lessons</h2>
          <p className="text-sm text-muted-foreground">Lessons shared publicly by this contributor.</p>
        </div>

        {lessonsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-64 rounded-xl" />
            ))}
          </div>
        ) : publicLessons.length === 0 ? (
          <p className="text-sm text-muted-foreground py-8 text-center">No public lessons found for this contributor.</p>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {publicLessons.map((lesson) => (
                <LessonCard key={lesson._id} lesson={lesson} isPremiumUser={isPremium} />
              ))}
            </div>

            <div ref={sentinelRef} className="h-1" />

            <div className="mt-6 flex flex-col items-center gap-3 text-sm text-muted-foreground">
              {isFetchingNextPage && (
                <div className="flex items-center gap-2">
                  <span>Loading more lessons…</span>
                  <span className="inline-flex rounded-full border-primary/30 border-t-primary animate-spin h-4 w-4" aria-hidden="true" />
                </div>
              )}
              {!isFetchingNextPage && !hasNextPage && publicLessons.length > 0 && (
                <span className="text-center text-sm text-muted-foreground">You have reached the end of this contributor's public lessons.</span>
              )}
            </div>
          </>
        )}
      </div>
    </Container>
  )
}
