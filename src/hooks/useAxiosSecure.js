'use client'

import axiosPublic from '@/services/axios'

/**
 * Returns a simple axios instance (same as axiosPublic).
 * No token interceptors or auto-logout on 401.
 */
export function useAxiosSecure() {
  return axiosPublic
}
