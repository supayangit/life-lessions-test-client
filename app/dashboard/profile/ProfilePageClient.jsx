'use client'

import { useEffect, useRef, useState } from 'react'
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import {
  Crown,
  Sparkles,
  ShieldCheck,
  BookOpen,
  Bookmark,
  Camera,
  Loader2,
  Edit2,
  X,
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { LessonCard } from '@/components/lessons/LessonCard'
import { useAuth } from '@/hooks/useAuth'
import { usePremium } from '@/hooks/usePremium'
import { useRole } from '@/hooks/useRole'
import { getMyProfile, getMyLessons, updateMyProfile } from '@/services/userApi'

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(60, 'Name too long'),
  bio: z.string().max(300, 'Bio too long').optional().or(z.literal('')),
  image: z.string().url('Must be a valid URL').optional().or(z.literal('')),
})

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

export default function ProfilePageClient() {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const { role, isAdmin, isCeo } = useRole()
  const { isPremium } = usePremium()
  const [editing, setEditing] = useState(false)

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['my-profile'],
    queryFn: () => getMyProfile(),
    retry: false,
  })

  const sentinelRef = useRef(null)
  const nextPageRequestRef = useRef(false)

  const {
    data: lessonPages,
    isLoading: lessonsLoading,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteQuery({
    queryKey: ['my-public-lessons'],
    queryFn: ({ pageParam = 1 }) => getMyLessons(pageParam, 6),
    getNextPageParam: (lastPage) => {
      if (lastPage?.pagination?.hasNextPage) {
        return lastPage.pagination.page + 1
      }
      return undefined
    },
    select: (data) => data,
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
    return () => observer.disconnect()
  }, [fetchNextPage, hasNextPage, isFetchingNextPage])

  const { mutate: updateProfile, isPending } = useMutation({
    mutationFn: (profileData) => {
      console.log('[ProfilePage] Submitting profile data:', profileData)
      return updateMyProfile(profileData)
    },
    onSuccess: (updatedProfile) => {
      console.log('[ProfilePage] Update successful, returned profile:', updatedProfile)
      console.log('[ProfilePage] Profile fields - name:', updatedProfile?.name, 'bio:', updatedProfile?.bio, 'image:', updatedProfile?.image)
      toast.success('Profile updated successfully!')
      queryClient.invalidateQueries({ queryKey: ['my-profile'] })
      setEditing(false)
      // Reset form with updated profile data
      reset({
        name: updatedProfile?.name || user?.name || '',
        bio: updatedProfile?.bio || '',
        image: updatedProfile?.image || '',
      })
    },
    onError: (error) => {
      console.error('[ProfilePage] Update profile error:', error?.response?.status, error?.response?.data || error.message)
      const message = error?.response?.data?.message || 'Failed to update profile'
      toast.error(message)
    },
  })

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: profile?.name || user?.name || '',
      bio: profile?.bio || '',
      image: profile?.image || '',
    },
  })

  // Update form when profile data loads
  useEffect(() => {
    if (profile) {
      reset({
        name: profile.name || user?.name || '',
        bio: profile.bio || '',
        image: profile.image || '',
      })
    }
  }, [profile, user, reset])

  const displayProfile = profile ?? { lessonsCount: 0, favoritesCount: 0 }
  const displayLessons = lessonPages?.pages?.flatMap((page) => page.lessons ?? []) ?? []
  const publicLessons = displayLessons.filter((lesson) => lesson.visibility !== 'private')

  // Use user session data where available
  const displayName = profile?.name || user?.name || 'User'
  const displayEmail = user?.email || profile?.email || ''
  const displayImage = user?.image || profile?.image || null

  useEffect(() => {
    if (displayName) {
      document.title = `${displayName}'s Profile | Digital Life Lessons`
    } else {
      document.title = 'Profile | Digital Life Lessons'
    }
  }, [displayName])

  const initials = displayName
    ? displayName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U'

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Profile Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            {/* Avatar */}
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
              <button
                className="absolute bottom-0 right-0 rounded-full bg-primary p-1.5 text-primary-foreground shadow-sm"
                onClick={() => setEditing(true)}
                aria-label="Change avatar"
              >
                <Camera className="h-3 w-3" />
              </button>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              {profileLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-6 w-40" />
                  <Skeleton className="h-4 w-56" />
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-xl font-bold font-serif text-foreground">{displayName}</h1>
                    {isPremium && (
                      <Badge className="flex items-center gap-1 bg-amber-100 text-amber-700 border border-amber-200 text-xs">
                        <Sparkles className="h-3 w-3" /> Premium
                      </Badge>
                    )}
                    {isCeo ? (
                      <Badge className="flex items-center gap-1 bg-violet-100 text-violet-700 border border-violet-200 text-xs">
                        <Crown className="h-3 w-3" /> CEO
                      </Badge>
                    ) : isAdmin ? (
                      <Badge variant="destructive" className="flex items-center gap-1 text-xs">
                        <ShieldCheck className="h-3 w-3" /> Admin
                      </Badge>
                    ) : null}
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">{displayEmail}</p>
                  {profile?.bio && (
                    <p className="text-sm text-foreground/80 mt-2 leading-relaxed">{profile.bio}</p>
                  )}
                </>
              )}
            </div>

            <Button
              variant="outline"
              size="sm"
              className="shrink-0"
              onClick={() => setEditing(!editing)}
            >
              {editing ? <><X className="h-3.5 w-3.5 mr-1.5" /> Cancel</> : <><Edit2 className="h-3.5 w-3.5 mr-1.5" /> Edit Profile</>}
            </Button>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 gap-3 mt-6">
            <StatCard
              icon={BookOpen}
              value={displayProfile.lessonsCount ?? displayLessons.length}
              label="Lessons"
              color="bg-primary/10 text-primary"
            />
            <StatCard
              icon={Bookmark}
              value={displayProfile.favoritesCount ?? 0}
              label="Favorites"
              color="bg-accent/20 text-accent-foreground"
            />
          </div>
        </CardContent>
      </Card>

      {/* Edit Form */}
      {editing && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Edit Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(updateProfile)} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="name">Display Name</Label>
                <Input id="name" {...register('name')} />
                {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  placeholder="Tell others about yourself..."
                  rows={3}
                  className="resize-none"
                  {...register('bio')}
                />
                {errors.bio && <p className="text-xs text-destructive">{errors.bio.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="image">Avatar URL</Label>
                <Input id="image" type="url" placeholder="https://example.com/avatar.jpg" {...register('image')} />
                {errors.image && <p className="text-xs text-destructive">{errors.image.message}</p>}
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={isPending} size="sm">
                  {isPending && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
                  Save Changes
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={() => setEditing(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Public Lessons Grid */}
      <div className="space-y-4">
        <Separator />
        <div>
          <h2 className="text-lg font-semibold font-serif text-foreground">Public Lessons</h2>
          <p className="text-sm text-muted-foreground">Lessons you have shared with the community</p>
        </div>

        {lessonsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-64 rounded-xl" />)}
          </div>
        ) : publicLessons.length === 0 ? (
          <p className="text-sm text-muted-foreground py-8 text-center">No public lessons yet.</p>
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
              {!isFetchingNextPage && !hasNextPage && (
                <span className="text-center text-sm text-muted-foreground">You have reached the end of your public lessons.</span>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
