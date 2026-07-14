'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { Crown, BookOpen, ArrowRight, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'

function SuccessCheckmark() {
  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
      className="relative mx-auto mb-8 flex h-24 w-24 items-center justify-center"
    >
      {/* Outer ring pulse */}
      <motion.div
        initial={{ opacity: 0.6, scale: 1 }}
        animate={{ opacity: 0, scale: 2 }}
        transition={{ duration: 1.4, repeat: Infinity, ease: 'easeOut', delay: 0.6 }}
        className="absolute inset-0 rounded-full bg-primary/30"
      />
      <div className="relative z-10 flex h-24 w-24 items-center justify-center rounded-full bg-primary shadow-lg">
        <Crown className="h-10 w-10 text-primary-foreground" aria-hidden="true" />
      </div>
    </motion.div>
  )
}

const NEXT_STEPS = [
  { icon: Crown, label: 'Browse Premium Lessons', href: '/public-lessons?filter=premium' },
  { icon: BookOpen, label: 'Go to Dashboard', href: '/dashboard' },
  { icon: ArrowRight, label: 'Back to Home', href: '/' },
]

export default function PaymentSuccessPage() {
  const { refetch } = useAuth()

  useEffect(() => {
    if (typeof window === 'undefined') return

    const searchParams = new URLSearchParams(window.location.search)
    const sessionId = searchParams.get('session_id')
    if (!sessionId) return

    const confirmPremium = async () => {
      try {
        const response = await fetch(`/api/payments/confirm-checkout-session?session_id=${encodeURIComponent(sessionId)}`, {
          method: 'GET',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        })

        if (response.ok) {
          await refetch()
        } else {
          const errorData = await response.json().catch(() => null)
          console.error('Failed to confirm premium session:', errorData || response.statusText)
        }
      } catch (error) {
        console.error('Failed to confirm premium session:', error)
      }
    }

    confirmPremium()
  }, [refetch])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-lg w-full text-center py-20">
        <SuccessCheckmark />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className="flex items-center justify-center gap-2 mb-3">
            <Sparkles className="h-4 w-4 text-accent" aria-hidden="true" />
            <span className="text-sm font-medium text-accent">Welcome to Premium</span>
            <Sparkles className="h-4 w-4 text-accent" aria-hidden="true" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold font-serif text-foreground text-balance">
            Your upgrade was successful!
          </h1>
          <p className="mt-4 text-muted-foreground text-balance leading-relaxed">
            You now have lifetime access to all premium lessons, PDF exports, social sharing tools, and every future feature we build.
          </p>
        </motion.div>

        {/* Perks list */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-8 rounded-xl border border-border bg-card p-5 text-left space-y-3"
        >
          {[
            'Access every premium lesson instantly',
            'Export any lesson to PDF',
            'Share lessons to social media',
            'Exclusive contributor spotlight eligibility',
            'Priority support from our team',
          ].map((perk) => (
            <div key={perk} className="flex items-center gap-2.5">
              <div className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
              <span className="text-sm text-foreground">{perk}</span>
            </div>
          ))}
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="mt-8 flex flex-col sm:flex-row gap-3 justify-center"
        >
          <Button asChild size="lg">
            <Link href="/public-lessons">
              <BookOpen className="h-4 w-4 mr-2" />
              Explore Premium Lessons
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/dashboard">
              Go to Dashboard
            </Link>
          </Button>
        </motion.div>
      </div>
    </div>
  )
}
