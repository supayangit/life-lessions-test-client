'use client'

import { useAuth } from './useAuth'

/**
 * Returns the current user's role.
 * Possible values: 'free' | 'premium' | 'admin' | null
 */
export function useRole() {
  const { user, isPending } = useAuth()

  const role = user?.role ?? null

  const isPremium = Boolean(user?.isPremium)

  return {
    role,
    isAdmin: role === 'admin',
    // Primary source of truth: user.isPremium (from fresh API call, never cached)
    isPremium,
    isPending,
  }
}
