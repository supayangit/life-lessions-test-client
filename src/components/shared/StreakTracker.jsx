'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Flame, Trophy } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

const STREAK_KEY = 'll_visit_streak'
const DATES_KEY = 'll_visit_dates'

function getTodayStr() {
  return new Date().toISOString().slice(0, 10)
}

function getYesterdayStr() {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return d.toISOString().slice(0, 10)
}

/**
 * Streak Tracker — tracks consecutive daily visits using localStorage.
 * Shows a flame badge with the current streak count.
 */
export function StreakTracker({ className = '' }) {
  const [streak, setStreak] = useState(0)
  const [showBurst, setShowBurst] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const today = getTodayStr()
    const yesterday = getYesterdayStr()

    const storedDates = JSON.parse(localStorage.getItem(DATES_KEY) || '[]')
    const storedStreak = parseInt(localStorage.getItem(STREAK_KEY) || '0', 10)

    if (storedDates.includes(today)) {
      // Already visited today — just show streak
      setStreak(storedStreak)
      return
    }

    let newStreak = 1
    if (storedDates.includes(yesterday)) {
      newStreak = storedStreak + 1
      setShowBurst(true)
      setTimeout(() => setShowBurst(false), 2000)
    }

    const updatedDates = [...storedDates.slice(-29), today]
    localStorage.setItem(DATES_KEY, JSON.stringify(updatedDates))
    localStorage.setItem(STREAK_KEY, String(newStreak))
    setStreak(newStreak)
  }, [])

  if (!mounted || streak === 0) return null

  return (
    <div className={cn('relative inline-flex', className)}>
      <Badge
        className={cn(
          'flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium border-0 cursor-default select-none',
          streak >= 7
            ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
            : 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400'
        )}
        aria-label={`${streak}-day streak`}
      >
        {streak >= 7 ? <Trophy className="h-3.5 w-3.5" /> : <Flame className="h-3.5 w-3.5" />}
        {streak} day{streak !== 1 ? 's' : ''} streak
      </Badge>

      {/* Burst animation on new streak day */}
      <AnimatePresence>
        {showBurst && (
          <motion.div
            initial={{ scale: 0.5, opacity: 1 }}
            animate={{ scale: 2, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="absolute inset-0 rounded-full bg-orange-400/30 pointer-events-none"
            aria-hidden="true"
          />
        )}
      </AnimatePresence>
    </div>
  )
}
