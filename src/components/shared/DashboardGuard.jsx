'use client'

import { useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { LoadingSpinner } from './LoadingSpinner'
import { ErrorState } from './ErrorState'

/**
 * DashboardGuard — protects the /dashboard subtree using /api/users/me.
 * Logs successful user lookups for the dashboard auth check.
 */
export function DashboardGuard({ children, fallback = null }) {
  const { user, isLoading, isAuthenticated } = useAuth()

  useEffect(() => {
    if (isLoading) return

    if (isAuthenticated && user) {
      console.log('[DashboardGuard] /api/users/me returned user data:', {
        id: user._id ?? user.id,
        email: user.email,
        name: user.name,
      })
    } else {
      console.log('[DashboardGuard] /api/users/me did not return authenticated user')
    }
  }, [isLoading, isAuthenticated, user])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner />
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    return fallback || (
      <ErrorState
        title="Access Denied"
        message="You must be logged in to access this content."
      />
    )
  }

  return children
}
