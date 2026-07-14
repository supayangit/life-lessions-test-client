export function normalizeHeaders(headers) {
  if (!headers) return {}

  if (typeof headers.get === 'function' && typeof headers.entries === 'function') {
    return Object.fromEntries(
      [...headers.entries()].map(([key, value]) => [String(key).toLowerCase(), value])
    )
  }

  if (typeof headers === 'object') {
    return Object.fromEntries(
      Object.entries(headers).map(([key, value]) => [String(key).toLowerCase(), value])
    )
  }

  return {}
}

export function getBearerTokenFromHeaders(headers) {
  const authHeader = headers?.authorization || headers?.Authorization || ''
  const token = String(authHeader || '').replace(/^Bearer\s+/i, '').trim()
  return token || null
}

export async function resolveAuthSession(auth, headers) {
  const normalizedHeaders = normalizeHeaders(headers)
  const sessionHeaders = { ...normalizedHeaders }

  try {
    const session = await auth.api.getSession({ headers: sessionHeaders })
    if (session?.user) {
      return session
    }
  } catch (initialError) {
    console.warn('[auth-utils] initial getSession failed', initialError?.message || initialError)
  }

  const authHeader = normalizedHeaders.authorization
  if (authHeader) {
    try {
      const session = await auth.api.getSession({ headers: { authorization: authHeader } })
      if (session?.user) {
        return session
      }
    } catch (authHeaderError) {
      console.warn('[auth-utils] auth-header getSession failed', authHeaderError?.message || authHeaderError)
    }
  }

  const token = getBearerTokenFromHeaders(normalizedHeaders)
  if (token) {
    try {
      const cookieHeader = `__Secure-better-auth.session_token=${token}`
      const session = await auth.api.getSession({ headers: { cookie: cookieHeader, authorization: authHeader } })
      if (session?.user) {
        return session
      }
    } catch (cookieSimError) {
      console.warn('[auth-utils] cookie-simulated getSession failed', cookieSimError?.message || cookieSimError)
    }
  }

  return null
}
