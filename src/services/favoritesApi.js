/**
 * Favorites API — endpoints.
 */
import axiosPublic from './axios'

export async function getMyFavorites(params = {}) {
  const { data } = await axiosPublic.get('/api/favorites/my-favorites', { params })
  return data
}

export async function addFavorite(lessonId) {
  const { data } = await axiosPublic.post('/api/favorites', { lessonId })
  return data
}

export async function removeFavorite(lessonId) {
  const { data } = await axiosPublic.delete(`/api/favorites/${lessonId}`)
  return data
}

