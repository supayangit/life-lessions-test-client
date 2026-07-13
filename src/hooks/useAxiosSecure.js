'use client'


import { useMemo } from 'react'
import axios from 'axios'
import { useAuth } from './useAuth'
import { getStoredAuthToken } from '@/lib/auth-client'

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

    // Request interceptor — attach bearer token if available.
    instance.interceptors.request.use(async (config) => {
      const token = getStoredAuthToken()
      if (token) {
        config.headers = config.headers || {}
        if (!config.headers.Authorization) {
          config.headers.Authorization = `Bearer ${token}`
        }
      }
      try {
        console.log('[http] axiosSecure.attachToken', { tokenPresent: !!token })
      } catch (e) {}
      return config
    })

    // Response interceptor — sign out on 401
    instance.interceptors.response.use(
      (response) => response,
      async (error) => {
        try {
          if (error.response?.status === 401) {
            console.warn('[http] axiosSecure.response.401', { url: error.config?.url })
            await logout()
          }
        } catch (e) {}
        return Promise.reject(error)
      }
    )

    return instance
  }, [logout])

  return axiosSecure
}
