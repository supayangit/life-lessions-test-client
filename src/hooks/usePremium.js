'use client'

import { useRole } from './useRole'

/**
 * Returns whether the current user has premium access.
 * Derived from fresh API data (never from cache).
 */
export function usePremium() {
  const { isPremium, isAdmin, isPending } = useRole()

  // Admins get premium access
  const isPremiumUser = isPremium || isAdmin

  return {
    isPremium: isPremiumUser,
    isPending,
  }
}
