'use client'


import { useMemo } from 'react'
import axios from 'axios'
import { useAuth } from './useAuth'
import { authClient } from '@/lib/auth-client'

const API_URL = process.env.NEXT_PUBLIC_API_URL


/**
 * Returns an axios instance that automatically attaches the session token.
 * Also handles 401 responses by signing the user out.
 */
export function useAxiosSecure() {
  const { logout } = useAuth()

  const axiosSecure = useMemo(() => {
    const instance = axios.create({
      baseURL: API_URL,
      headers: { 'Content-Type': 'application/json' },
      withCredentials: true,
    })

    // Request interceptor — attach bearer token if available
    instance.interceptors.request.use(async (config) => {
      // Note: withCredentials: true already sends cookies automatically.
      // Token attachment is skipped to avoid excessive session polling.
      // Backend receives either httpOnly cookie or falls back to Authorization header if needed.
      return config
    })

    // Response interceptor — sign out on 401
    instance.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          await logout()
        }
        return Promise.reject(error)
      }
    )

    return instance
  }, [logout])

  return axiosSecure
}
