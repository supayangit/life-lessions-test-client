'use client'


import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LessonForm } from '@/components/dashboard/LessonForm'
import { useAxiosSecure } from '@/hooks/useAxiosSecure'
import { usePremium } from '@/hooks/usePremium'
import { createLesson } from '@/services/lessonApi'


export default function AddLessonPage() {
  const router = useRouter()
  const axiosSecure = useAxiosSecure()
  const queryClient = useQueryClient()
  const { isPremium } = usePremium()

  const { mutate, isPending } = useMutation({
    mutationFn: (lessonData) => createLesson(lessonData, axiosSecure),
    onSuccess: () => {
      toast.success('Lesson published successfully!')
      queryClient.invalidateQueries({ queryKey: ['my-lessons'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-overview'] })
      router.push('/dashboard/my-lessons')
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || 'Failed to create lesson')
    },
  })

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-serif text-foreground">Add a New Lesson</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Share a real-life experience and the lesson it taught you.
        </p>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Lesson Details</CardTitle>


          <CardDescription>
            Fill in the details below. Fields marked with{' '}
            <span className="text-destructive">*</span> are required.
          </CardDescription>


        </CardHeader>

        
        <CardContent>
          <LessonForm
            onSubmit={mutate}
            isPremiumUser={isPremium}
            isSubmitting={isPending}
            submitLabel="Publish Lesson"
          />
        </CardContent>
      </Card>
    </div>
  )
}
