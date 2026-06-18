'use client'

import { motion } from 'framer-motion'
import { XCircle, Crown, ArrowLeft, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function PaymentCancelPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-lg w-full text-center py-20">
        {/* Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
          className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-muted"
        >
          <XCircle className="h-12 w-12 text-muted-foreground" aria-hidden="true" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <h1 className="text-3xl sm:text-4xl font-bold font-serif text-foreground text-balance">
            Payment was cancelled
          </h1>
          <p className="mt-4 text-muted-foreground text-balance leading-relaxed">
            No charges were made. Your account remains on the free plan. You can upgrade to Premium at any time.
          </p>
        </motion.div>

        {/* Info card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-8 rounded-xl border border-border bg-card p-5 text-left"
        >
          <p className="text-sm font-medium text-foreground mb-2">What you&apos;re missing with Free:</p>
          <ul className="space-y-2">
            {[
              'Locked premium lessons from top contributors',
              'PDF export of any lesson',
              'Social sharing with rich cards',
              'Contributor spotlight eligibility',
            ].map((item) => (
              <li key={item} className="flex items-center gap-2.5 text-sm text-muted-foreground">
                <XCircle className="h-3.5 w-3.5 text-destructive/60 flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="mt-8 flex flex-col sm:flex-row gap-3 justify-center"
        >
          <Button asChild size="lg">
            <Link href="/pricing">
              <Crown className="h-4 w-4 mr-2" />
              Try Again
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
          </Button>
        </motion.div>

        <p className="mt-6 text-xs text-muted-foreground">
          Questions? Contact us and we&apos;ll be happy to help.
        </p>
      </div>
    </div>
  )
}
