'use client'

import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Container } from '@/components/shared/Container'
import { SectionHeading } from '@/components/shared/SectionHeading'
import { LessonGridSkeleton } from '@/components/shared/SkeletonLoader'
import { ErrorState } from '@/components/shared/ErrorState'
import { LessonCard } from '@/components/lessons/LessonCard'
import { getMostSavedLessons } from '@/services/lessonApi'
import { usePremium } from '@/hooks/usePremium'

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
}

export function MostSavedLessons() {
  const { isPremium } = usePremium()

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['lessons', 'most-saved'],
    queryFn: getMostSavedLessons,
    onSuccess: (data) => console.log('[MostSavedLessons] rendered data', data),
  })

  const lessons = data?.lessons || data || []

  return (
    <section className="py-16 bg-muted/30">
      <Container>
        <SectionHeading
          title="Most Saved Lessons"
          subtitle="The lessons the community saves and comes back to again and again."
        />

        {isLoading && <LessonGridSkeleton count={3} />}

        {isError && (
          <ErrorState
            title="Could not load saved lessons"
            error={error}
            onRetry={refetch}
          />
        )}

        {!isLoading && !isError && lessons.length > 0 && (
          <>
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-50px' }}
              className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
            >
              {lessons.slice(0, 6).map((lesson) => (
                <motion.div key={lesson._id} variants={cardVariants}>
                  <LessonCard lesson={lesson} isPremiumUser={isPremium} />
                </motion.div>
              ))}
            </motion.div>

            <div className="mt-10 flex justify-center">
              <Button variant="outline" asChild className="gap-2">
                <Link href="/public-lessons?sort=most-saved">
                  See all saved lessons
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </>
        )}
      </Container>
    </section>
  )
}
