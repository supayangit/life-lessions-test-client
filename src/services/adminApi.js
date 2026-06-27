/**
 * Admin API — admin-only authenticated endpoints.
 */

// ── Overview ──────────────────────────────────────────────────────────────
export async function getAdminOverview(axiosSecure) {
  const { data } = await axiosSecure.get('/api/admin/overview')
  return data
}

// ── Users ─────────────────────────────────────────────────────────────────
export async function getAdminUsers(axiosSecure, params = {}) {
  const { data } = await axiosSecure.get('/api/admin/users', { params })
  return data
}

export async function updateUserRole(userId, role, axiosSecure) {
  const { data } = await axiosSecure.patch(`/api/admin/users/${userId}/role`, { role })
  return data
}

export async function updateUserSubscription(userId, isPremium, axiosSecure) {
  const { data } = await axiosSecure.patch(`/api/admin/users/${userId}/subscription`, { isPremium })
  return data
}

// ── Lessons ───────────────────────────────────────────────────────────────
export async function getAdminLessons(axiosSecure, params = {}) {
  const { data } = await axiosSecure.get('/api/admin/lessons', { params })
  return data
}

export async function adminToggleFeature(lessonId, axiosSecure) {
  const { data } = await axiosSecure.patch(`/api/admin/lessons/${lessonId}/feature`)
  return data
}

export async function adminToggleReview(lessonId, axiosSecure) {
  const { data } = await axiosSecure.patch(`/api/admin/lessons/${lessonId}/review`)
  return data
}

export async function adminDeleteLesson(lessonId, axiosSecure) {
  const { data } = await axiosSecure.delete(`/api/admin/lessons/${lessonId}`)
  return data
}

// ── Reported Lessons ──────────────────────────────────────────────────────
export async function getReportedLessons(axiosSecure) {
  const { data } = await axiosSecure.get('/api/admin/reported-lessons')
  return data
}

export async function deleteReportedLesson(lessonId, axiosSecure) {
  const { data } = await axiosSecure.delete(`/api/admin/reported-lessons/${lessonId}`)
  return data
}

export async function ignoreReport(lessonId, axiosSecure) {
  const { data } = await axiosSecure.patch(`/api/admin/reported-lessons/${lessonId}/ignore`)
  return data
}
