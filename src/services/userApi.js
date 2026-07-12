import axiosPublic from './axios'

/**
 * Fetch the current user's profile.
 */
export async function getMyProfile() {
  const { data } = await axiosPublic.get('/api/users/me', { withCredentials: true })
  return data
}

/**
 * Update the current user's profile.
 */
export async function updateMyProfile(profileData) {
  const { data } = await axiosPublic.put('/api/users/me', profileData)
  return data
}

/**
 * Fetch the current user's created lessons.
 */
export async function getMyLessons(page = 1, limit = 6) {
  const { data } = await axiosPublic.get('/api/users/me/public-lessons', {
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
