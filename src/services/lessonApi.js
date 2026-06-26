import axiosPublic from './axios'


/**
 * Fetch all public lessons with optional filters.
 * @param {Object} params - { search, category, tone, sort, page, limit }
 */
export async function getLessons(params = {}) {
  const { data } = await axiosPublic.get('/api/lessons', { params })
  return data
}

/**
 * Fetch a single lesson by ID.
 */
export async function getLessonById(id) {
  try {
    const { data } = await axiosPublic.get(`/api/lessons/${id}`)
    return data
  } catch (error) {
    if (error.response?.data?.locked) {
      return error.response.data
    }
    throw error
  }
}

/**
 * Fetch featured lessons for the home page.
 */
export async function getFeaturedLessons() {
  const { data } = await axiosPublic.get('/api/lessons/featured')
  console.log('[API] Featured lessons', data)
  return data
}

/**
 * Fetch top contributors.
 */
export async function getTopContributors() {
  const { data } = await axiosPublic.get('/api/lessons/top-contributors')
  console.log('[API] Top contributors', data)
  return data
}

/**
 * Fetch most saved lessons.
 */
export async function getMostSavedLessons() {
  const { data } = await axiosPublic.get('/api/lessons/most-saved')
  console.log('[API] Most saved lessons', data)
  return data
}

/**
 * Create a new lesson (authenticated).
 */
export async function createLesson(lessonData, axiosSecure) {
  const instance = axiosSecure || axiosPublic
  const { data } = await instance.post('/api/lessons', lessonData)
  return data
}

/**
 * Update an existing lesson (authenticated).
 */
export async function updateLesson(id, lessonData, axiosSecure) {
  const instance = axiosSecure || axiosPublic
  const { data } = await instance.put(`/api/lessons/${id}`, lessonData)
  return data
}

/**
 * Delete a lesson (authenticated).
 */
export async function deleteLesson(id, axiosSecure) {
  const instance = axiosSecure || axiosPublic
  const { data } = await instance.delete(`/api/lessons/${id}`)
  return data
}

/**
 * Toggle lesson visibility (authenticated).
 */
export async function toggleVisibility(id, axiosSecure) {
  const { data } = await axiosSecure.patch(`/api/lessons/${id}/visibility`)
  return data
}

/**
 * Toggle lesson access level between free/premium (authenticated).
 */
export async function toggleAccessLevel(id, axiosSecure) {
  const { data } = await axiosSecure.patch(`/api/lessons/${id}/access-level`)
  return data
}

/**
 * Fetch user's own lessons (authenticated).
 */
export async function getMyLessons(axiosSecure, page = 1, limit = 10) {
  const { data } = await axiosSecure.get('/api/lessons/my-lessons', {
    params: { page, limit },
  })
  return data
}
