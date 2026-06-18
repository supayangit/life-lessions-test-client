import axiosPublic from './axios'

/**
 * Payments API — Stripe checkout integration.
 */

/**
 * Create a Stripe Checkout session for the Premium plan.
 * Returns { url } — the Stripe-hosted checkout URL.
 */
export async function createCheckoutSession(axiosSecure) {
  const instance = axiosSecure || axiosPublic
  const { data } = await instance.post('/api/payments/create-checkout-session')
  return data
}
