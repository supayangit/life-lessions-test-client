/**
 * Favorites API — authenticated endpoints.
 */

export async function getMyFavorites(params = {}, axiosSecure) {
  const { data } = await axiosSecure.get('/api/favorites/my-favorites', { params })
  return data
}

export async function addFavorite(lessonId, axiosSecure) {
  const { data } = await axiosSecure.post('/api/favorites', { lessonId })
  return data
}

export async function removeFavorite(lessonId, axiosSecure) {
  const { data } = await axiosSecure.delete(`/api/favorites/${lessonId}`)
  return data
}

