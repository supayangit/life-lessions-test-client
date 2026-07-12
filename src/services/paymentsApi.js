import axiosPublic from './axios'

/**
 * Payments API — Stripe checkout integration.
 */

/**
 * Create a Stripe Checkout session for the Premium plan.
 * Returns { url } — the Stripe-hosted checkout URL.
 */
export async function createCheckoutSession() {
  const { data } = await axiosPublic.post('/api/payments/create-checkout-session')
  return data
}
