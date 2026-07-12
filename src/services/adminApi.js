/**
 * Admin API — admin endpoints.
 */
import axiosPublic from './axios'

// ── Overview ──────────────────────────────────────────────────────────────
export async function getAdminOverview() {
  const { data } = await axiosPublic.get('/api/admin/overview')
  return data
}

// ── Users ─────────────────────────────────────────────────────────────────
export async function getAdminUsers(params = {}) {
  const { data } = await axiosPublic.get('/api/admin/users', { params })
  return data
}

export async function updateUserRole(userId, role) {
  const { data } = await axiosPublic.patch(`/api/admin/users/${userId}/role`, { role })
  return data
}

export async function updateUserSubscription(userId, isPremium) {
  const { data } = await axiosPublic.patch(`/api/admin/users/${userId}/subscription`, { isPremium })
  return data
}

export async function deleteUser(userId) {
  const { data } = await axiosPublic.delete(`/api/admin/users/${userId}`)
  return data
}

// ── Lessons ───────────────────────────────────────────────────────────────
export async function getAdminLessons(params = {}) {
  const { data } = await axiosPublic.get('/api/admin/lessons', { params })
  return data
}

export async function adminToggleFeature(lessonId) {
  const { data } = await axiosPublic.patch(`/api/admin/lessons/${lessonId}/feature`)
  return data
}

export async function adminToggleReview(lessonId) {
  const { data } = await axiosPublic.patch(`/api/admin/lessons/${lessonId}/review`)
  return data
}

export async function adminDeleteLesson(lessonId) {
  const { data } = await axiosPublic.delete(`/api/admin/lessons/${lessonId}`)
  return data
}

// ── Reported Lessons ──────────────────────────────────────────────────────
export async function getReportedLessons() {
  const { data } = await axiosPublic.get('/api/admin/reported-lessons')
  return data
}

export async function deleteReportedLesson(lessonId) {
  const { data } = await axiosPublic.delete(`/api/admin/reported-lessons/${lessonId}`)
  return data
}

export async function ignoreReport(lessonId) {
  const { data } = await axiosPublic.patch(`/api/admin/reported-lessons/${lessonId}/ignore`)
  return data
}
