import axiosPublic from './axios'
import { authClient, updateUserProfile } from '@/lib/auth-client'

/**
 * Fetch the current user's profile.
 */
export async function getMyProfile(axiosSecure) {
  const instance = axiosSecure || axiosPublic
  const config = {}

  if (!axiosSecure) {
    const session = await authClient.getSession()
    const token = session?.data?.session?.token
    if (token) {
      config.headers = {
        Authorization: `Bearer ${token}`,
      }
    }
  }

  const { data } = await instance.get('/api/users/me', config)
  return data
}

/**
 * Update the current user's profile via backend API on port 5000.
 */
export async function updateMyProfile(profileData) {
  return await updateUserProfile(profileData)
}

/**
 * Fetch the current user's created public lessons.
 */
export async function getMyLessons(axiosSecure, page = 1, limit = 6) {
  const instance = axiosSecure || axiosPublic
  const { data } = await instance.get('/api/users/me/public-lessons', {
    params: { page, limit },
  })
  return data
}

/**
 * Fetch a public user profile by ID.
 */
export async function getUserById(id) {
  const { data } = await axiosPublic.get(`/api/users/${id}`)
  return data
}

/**
 * Fetch a public user's lessons by ID.
 */
export async function getUserPublicLessons(userId, page = 1, limit = 6) {
  const { data } = await axiosPublic.get(`/api/users/${userId}/public-lessons`, {
    params: { page, limit },
  })
  return data
}
