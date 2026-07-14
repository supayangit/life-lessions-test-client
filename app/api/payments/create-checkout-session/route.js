import Stripe from 'stripe'
import { auth, db } from '@/lib/auth'
import { ObjectId } from 'mongodb'
import { resolveAuthSession, normalizeHeaders } from '@/lib/auth-utils'

function getStripe() {
  const secretKey = process.env.STRIPE_SECRET_KEY
  if (!secretKey) {
    throw new Error('Missing STRIPE_SECRET_KEY environment variable')
  }
  return new Stripe(secretKey, {
    apiVersion: '2023-11-15',
  })
}

function getRequestOrigin(req) {
  return (
    req.headers.get('origin') ||
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    'http://localhost:3000'
  )
}

function buildUserFilter(userId) {
  if (!userId) return null
  if (ObjectId.isValid(userId)) {
    return { _id: new ObjectId(userId) }
  }
  return { id: String(userId) }
}

export async function POST(req) {
  try {
    const headers = normalizeHeaders(req.headers)
    const session = (auth.api && auth.api.getSession)
      ? await resolveAuthSession(auth, headers)
      : null

    if (!session?.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id || session.user._id || session.user.userId
    const origin = getRequestOrigin(req)
    const stripe = getStripe()
    const priceId = process.env.STRIPE_PRICE_ID
    const currency = process.env.STRIPE_CURRENCY || 'usd'
    const priceAmount = Number(process.env.STRIPE_PRICE_AMOUNT || 150000)

    const lineItems = priceId
      ? [{ price: priceId, quantity: 1 }]
      : [{
          price_data: {
            currency,
            product_data: {
              name: 'Lifetime Premium Access',
              description: 'Unlock every premium lesson and premium feature on Life Lessons.',
            },
            unit_amount: priceAmount,
          },
          quantity: 1,
        }]

    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: lineItems,
      success_url: `${origin}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/payment/cancel`,
      metadata: {
        userId: String(userId),
      },
      customer_email: session.user.email || undefined,
    })

    return Response.json({ url: checkoutSession.url })
  } catch (error) {
    console.error('POST /api/payments/create-checkout-session error:', error)
    return Response.json(
      { error: 'Unable to create Stripe checkout session' },
      { status: 500 }
    )
  }
}
