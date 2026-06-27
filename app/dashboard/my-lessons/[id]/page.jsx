'use client'

import { use } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { LessonForm } from '@/components/dashboard/LessonForm'
import { useAxiosSecure } from '@/hooks/useAxiosSecure'
import { usePremium } from '@/hooks/usePremium'
import { getLessonById, updateLesson } from '@/services/lessonApi'

export default function UpdateLessonPage({ params }) {
  const { id } = use(params)
  const router = useRouter()
  const axiosSecure = useAxiosSecure()
  const queryClient = useQueryClient()
  const { isPremium } = usePremium()

  const { data: lessonData, isLoading } = useQuery({
    queryKey: ['lesson', id],
    queryFn: () => getLessonById(id),
    enabled: Boolean(id),
    onSuccess: (data) => {
      console.log('[UpdateLessonPage] Lesson loaded:', data)
    },
  })

  // Handle both wrapped and unwrapped response structures
  const lesson = lessonData?.lesson || lessonData

  const { mutate, isPending } = useMutation({
    mutationFn: (lessonData) => updateLesson(id, lessonData, axiosSecure),
    onSuccess: () => {
      toast.success('Lesson updated successfully!')
      queryClient.invalidateQueries({ queryKey: ['my-lessons'] })
      queryClient.invalidateQueries({ queryKey: ['lesson', id] })
      router.push('/dashboard/my-lessons')
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || 'Failed to update lesson')
    },
  })

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-serif text-foreground">Edit Lesson</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Update your lesson details below.
        </p>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Lesson Details</CardTitle>
          <CardDescription>
            Fields marked with <span className="text-destructive">*</span> are required.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-10 w-full" />)}
            </div>
          ) : (
            <LessonForm
              defaultValues={{
                title: lesson?.title,
                description: lesson?.description,
                category: lesson?.category,
                tone: lesson?.tone,
                image: lesson?.image || '',
                visibility: lesson?.visibility || 'public',
                accessLevel: lesson?.accessLevel || 'free',
              }}
              onSubmit={mutate}
              isPremiumUser={isPremium}
              isSubmitting={isPending}
              submitLabel="Update Lesson"
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
