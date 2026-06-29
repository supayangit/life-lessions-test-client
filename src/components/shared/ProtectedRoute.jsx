'use client'

import { redirect } from 'next/navigation'
import { useEffect } from 'react'
import { LoadingSpinner } from './LoadingSpinner'
import { useAuth } from '@/hooks/useAuth'

/**
 * ProtectedRoute: Wraps protected page content.
 * - Shows spinner while checking auth state
 * - Redirects to login if not authenticated
 * - Renders children if authenticated
 */
export function ProtectedRoute({ children, fallback = <LoadingSpinner /> }) {
  const { user, isPending } = useAuth()

  useEffect(() => {
    // Redirect if auth check completed and user is not authenticated
    if (!isPending && !user) {
      redirect('/auth/login')
    }
  }, [user, isPending])

  // Show loading state while checking auth
  if (isPending) {
    return fallback
  }

  // User is authenticated, render children
  return <>{children}</>
}
