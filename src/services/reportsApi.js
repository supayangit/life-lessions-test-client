/**
 * Reports API — endpoint.
 */
import axiosPublic from './axios'

export const REPORT_REASONS = [
  'Spam',
  'Harassment',
  'Misleading',
  'Inappropriate',
  'Other',
]

export async function submitReport(lessonId, reason) {
  const { data } = await axiosPublic.post('/api/reports', { lessonId, reason })
  return data
}
