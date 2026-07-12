/**
 * Dashboard API — endpoints.
 */
import axiosPublic from './axios'

export async function getDashboardOverview() {
  const { data } = await axiosPublic.get('/api/dashboard/overview')
  console.log('dashboard overview', data)
  return data
}
