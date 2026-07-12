/**
 * Likes API — endpoints.
 */
import axiosPublic from './axios'

export async function getMyLikes(params = {}) {
  const { data } = await axiosPublic.get('/api/likes/my-likes', { params })
  return data
}

export async function addLike(lessonId) {
  console.log('addLike request', { lessonId })
  const { data } = await axiosPublic.post('/api/likes', { lessonId })
  console.log('addLike response', { lessonId, data })
  return data
}

export async function removeLike(lessonId) {
  console.log('removeLike request', { lessonId })
  const { data } = await axiosPublic.delete(`/api/likes/${lessonId}`)
  console.log('removeLike response', { lessonId, data })
  return data
}
