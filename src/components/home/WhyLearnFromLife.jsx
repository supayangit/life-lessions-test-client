'use client'

import { motion } from 'framer-motion'
import { useEffect } from 'react'
import { Heart, Users, Lightbulb, Shield } from 'lucide-react'
import { Container } from '@/components/shared/Container'
import { SectionHeading } from '@/components/shared/SectionHeading'
import { AnimatedCounter } from '@/components/shared/AnimatedCounter'

const STATS = [
  { value: 1200, suffix: '+', label: 'Members' },
  { value: 350, suffix: '+', label: 'Lessons' },
  { value: 42, suffix: '', label: 'Categories' },
  { value: 98, suffix: '%', label: 'Satisfaction' },
]

const CARDS = [
  {
    icon: Heart,
    title: 'Authentic Stories',
    description:
      'Real people sharing real experiences — unfiltered wisdom you cannot find in textbooks.',
    color: 'text-rose-500',
    bg: 'bg-rose-50 dark:bg-rose-950/30',
  },
  {
    icon: Users,
    title: 'Community Driven',
    description:
      'A growing community of lifelong learners who support each other through shared vulnerability.',
    color: 'text-primary',
    bg: 'bg-primary/5 dark:bg-primary/10',
  },
  {
    icon: Lightbulb,
    title: 'Actionable Insights',
    description:
      'Each lesson is a distilled insight you can apply immediately to improve your own journey.',
    color: 'text-accent',
    bg: 'bg-amber-50 dark:bg-amber-950/30',
  },
  {
    icon: Shield,
    title: 'Safe to Be Honest',
    description:
      'A moderated, respectful environment where honesty is welcomed and everyone learns together.',
    color: 'text-emerald-500',
    bg: 'bg-emerald-50 dark:bg-emerald-950/30',
  },
]

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
}

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut' } },
}

export function WhyLearnFromLife() {
  useEffect(() => {
    console.log('[WhyLearnFromLife] benefit cards', CARDS)
    console.log('[WhyLearnFromLife] stats', STATS)
  }, [])

  return (
    <section className="py-16 bg-muted/40">
      <Container>
        <SectionHeading
          title="Why Learning From Life Matters"
          subtitle="Experience is humanity's oldest teacher. Here is why we built a home for it."
        />

        {/* Animated stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
          {STATS.map((stat) => (
            <div key={stat.label} className="rounded-xl border border-border bg-card p-4 text-center">
              <p className="text-2xl font-bold text-primary font-serif">
                <AnimatedCounter value={stat.value} suffix={stat.suffix} />
              </p>
              <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
        >
          {CARDS.map(({ icon: Icon, title, description, color, bg }) => (
            <motion.div
              key={title}
              variants={cardVariants}
              className="rounded-2xl border border-border bg-card p-6 flex flex-col gap-4 hover:shadow-sm transition-shadow"
            >
              <div className={`inline-flex items-center justify-center rounded-xl p-3 w-12 h-12 ${bg}`}>
                <Icon className={`h-6 w-6 ${color}`} aria-hidden="true" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground text-base">{title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{description}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </Container>
    </section>
  )
}
