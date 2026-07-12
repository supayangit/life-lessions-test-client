/**
 * Comments API — public read, authenticated write/delete.
 */
import axiosPublic from './axios'

export async function getComments(lessonId, page = 1, limit = 10) {
  console.log(`[CommentsAPI] Fetching comments for lesson ${lessonId} page=${page} limit=${limit}`)
  const { data } = await axiosPublic.get(`/api/comments/${lessonId}`, {
    params: { page, limit },
  })
  console.log(`[CommentsAPI] Received comments for lesson ${lessonId}`, data)
  return data
}

export async function addComment(lessonId, content) {
  const { data } = await axiosPublic.post('/api/comments', { lessonId, content })
  console.log(`[CommentsAPI] Comment posted for lesson ${lessonId}`, data)
  return data
}

export async function deleteComment(commentId) {
  const { data } = await axiosPublic.delete(`/api/comments/${commentId}`)
  console.log(`[CommentsAPI] Deleted comment ${commentId}`, data)
  return data
}
