'use client'

import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { BookOpen } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Container } from '@/components/shared/Container'
import { SectionHeading } from '@/components/shared/SectionHeading'
import { ContributorSkeleton } from '@/components/shared/SkeletonLoader'
import { ErrorState } from '@/components/shared/ErrorState'
import { getTopContributors } from '@/services/lessonApi'

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09 } },
}

const itemVariants = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.45, ease: 'easeOut' } },
}

export function TopContributors() {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['lessons', 'top-contributors'],
    queryFn: getTopContributors,
    onSuccess: (data) => console.log('[TopContributors] rendered data', data),
  })

  const contributors = data?.contributors || data || []

  return (
    <section className="py-16 bg-background">
      <Container>
        <SectionHeading
          title="Top Contributors"
          subtitle="The incredible people who share the most wisdom with our community."
        />

        {isLoading && (
          <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <ContributorSkeleton key={i} />
            ))}
          </div>
        )}

        {isError && (
          <ErrorState
            title="Could not load contributors"
            error={error}
            onRetry={refetch}
          />
        )}

        {!isLoading && !isError && contributors.length > 0 && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6"
          >
            {contributors.slice(0, 12).map((contributor, index) => {
              const initials = contributor.creatorName
                ? contributor.creatorName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
                : 'U'

              return (
                <Link
                  key={contributor.creatorId || index}
                  href={`/user/profile?userId=${contributor.creatorId}`}
                  className="group"
                >
                  <motion.div
                    variants={itemVariants}
                    className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-card p-4 text-center hover:shadow-sm transition-shadow hover:border-primary/30"
                  >
                    <div className="relative">
                      <Avatar className="h-14 w-14">
                        <AvatarImage src={contributor.creatorPhoto} alt={contributor.creatorName || 'Contributor'} />
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      {index < 3 && (
                        <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-accent-foreground text-[10px] font-bold shadow-sm">
                          {index + 1}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0 w-full">
                      <p className="text-sm font-medium text-foreground truncate">{contributor.creatorName}</p>
                      <div className="mt-1 flex items-center justify-center gap-1 text-xs text-muted-foreground">
                        <BookOpen className="h-3 w-3" />
                        <span>{contributor.lessonCount || 0} lessons</span>
                      </div>
                    </div>
                  </motion.div>
                </Link>
              )
            })}
          </motion.div>
        )}
      </Container>
    </section>
  )
}
