import { createAuthClient } from "better-auth/react";
import axiosPublic from '@/services/axios';

const AUTH_URL =
  process.env.NEXT_PUBLIC_AUTH_URL ||
  (process.env.NEXT_PUBLIC_API_URL
    ? `${process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, '')}/api/auth`
    : undefined) ||
  '/api/auth'

const AUTH_TOKEN_STORAGE_KEY = 'better-auth.session_token'
const isBrowser = typeof window !== 'undefined'

const extractTokenFromSession = (session) => {
  return (
    session?.data?.session?.token ||
    session?.data?.token ||
    session?.session?.token ||
    session?.token ||
    session?.data?.session?.accessToken ||
    session?.data?.session?.access_token ||
    null
  )
}

const persistAuthTokenFromResponse = (response) => {
  if (!isBrowser || !response?.headers?.get) return
  try {
    const headerToken = response.headers.get('set-auth-token')
    if (headerToken) {
      persistAuthToken(headerToken)
      console.log('[auth] set-auth-token persisted', { preview: headerToken.slice(0, 8) })
    }
  } catch (e) {
    // ignore if response headers not accessible
  }
}

const persistAuthToken = (token) => {
  if (!isBrowser || !token) return
  try {
    window.localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token)
  } catch {
    // ignore localStorage failures
  }
}

const persistTokenFromSession = (session) => {
  const token = extractTokenFromSession(session)
  if (token) persistAuthToken(token)
}

const buildAuthHeaders = () => {
  const token = getStoredAuthToken()
  if (!token) return {}
  return { Authorization: `Bearer ${token}` }
}

const debugAuthResponse = (response, input) => {
  if (!isBrowser || !response?.headers?.get) return
  try {
    const setAuthTokenHeader = response.headers.get('set-auth-token')
    console.log('[auth] fetchWithAuthFallback.response', {
      url: String(input),
      status: response.status,
      ok: response.ok,
      hasSetAuthToken: Boolean(setAuthTokenHeader),
      setAuthTokenPreview: setAuthTokenHeader ? setAuthTokenHeader.slice(0, 8) : null,
    })
  } catch (e) {
    console.warn('[auth] fetchWithAuthFallback.response.error', e?.message || e)
  }
}

const fetchWithAuthFallback = async (input, init = {}) => {
  const headers = new Headers(init.headers || {})
  const authHeaders = buildAuthHeaders()
  if (authHeaders.Authorization && !headers.has('Authorization')) {
    headers.set('Authorization', authHeaders.Authorization)
  }

  try {
    console.log('[auth] fetchWithAuthFallback.request', {
      url: String(input),
      hasAuthorization: headers.has('Authorization'),
      authHeaderPreview: headers.has('Authorization') ? 'present' : 'absent',
    })
  } catch (e) {
    // ignore logging failures
  }

  const response = await fetch(input, {
    ...init,
    credentials: 'include',
    headers,
  })

  persistAuthTokenFromResponse(response)
  debugAuthResponse(response, input)
  return response
}

export const getStoredAuthToken = () => {
  if (!isBrowser) return null
  try {
    return window.localStorage.getItem(AUTH_TOKEN_STORAGE_KEY)
  } catch {
    return null
  }
}

const clearStoredAuthToken = () => {
  if (!isBrowser) return
  try {
    window.localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY)
  } catch {
    // ignore localStorage failures
  }
}

/**
 * Unified Auth Client
 * Connects to the backend auth endpoint for the current API host.
 */
export const authClient = createAuthClient({
  baseURL: AUTH_URL,
  fetchOptions: {
    credentials: 'include',
  },
  fetch: fetchWithAuthFallback,
});

// ============ AUTHENTICATION FUNCTIONS ============
/**
 * Sign up a new user with email and password
 */
export async function signup({ name, image, email, password }) {
  try {
    if (!isBrowser) throw new Error('signup must be called from the browser')

    const response = await authClient.signUp.email({
      name,
      image,
      email,
      password,
    });
    return response;
  } catch (error) {
    console.error("Signup error:", error);
    throw error;
  }
}

/**
 * Sign in with email and password
 */
export async function login({ email, password }) {
  try {
    if (!isBrowser) throw new Error('login must be called from the browser')

    console.log('[auth] signIn.request', { method: 'email', email })
    const response = await authClient.signIn.email({
      email,
      password,
    });

    console.log('[auth] signIn.response', { success: !response?.error, tokenPresent: !!extractTokenFromSession(response) })

    // Some environments return the token directly from the sign-in response,
    // but others require fetching the session afterwards. Try both.
    let token = extractTokenFromSession(response)
    if (!token) {
      const maxAttempts = 6
      const delayMs = 300
      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
          console.log('[auth] getSession.attempt', { attempt, maxAttempts })
          const session = await getSession()
          persistTokenFromSession(session)
          const sessionToken = extractTokenFromSession(session)
          if (sessionToken) {
            token = sessionToken
            console.log('[auth] getSession.success', { attempt })
            break
          }
        } catch (error) {
          console.warn('[auth] getSession.error', { attempt, error: error?.message })
        }
        await new Promise((r) => setTimeout(r, delayMs))
      }
    }

    if (token) {
      persistAuthToken(token)
      try {
        console.log('[auth] token.persisted', { key: AUTH_TOKEN_STORAGE_KEY, preview: token?.slice?.(0,8) })
      } catch (e) {}
    }

    return response;
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
}

/**
 * Sign in with Google OAuth
 */
export async function signInWithGoogle() {
  try {
    if (!isBrowser) throw new Error('signInWithGoogle must be called from the browser')

    console.log('[auth] signIn.request', { method: 'google' })
    const response = await authClient.signIn.social({
      provider: "google",
      callbackURL: `${typeof window !== "undefined" ? window.location.origin : ""}/`,
    });

    // Persist token if available from the immediate response or from
    // the post-redirect session fetch.
    let token = extractTokenFromSession(response)
    console.log('[auth] signIn.response', { method: 'google', tokenPresent: !!token })

    // After social sign-in (which may redirect), the cookie may not be
    // immediately visible to the client. Retry `getSession` a few times
    // to reduce flakiness where the backend has set cookies but the
    // browser hasn't attached them to subsequent requests yet.
    if (!token) {
      const maxAttempts = 8
      const delayMs = 300
      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
          console.log('[auth] getSession.attempt (social)', { attempt, maxAttempts })
          const session = await getSession()
          persistTokenFromSession(session)
          const sessionToken = extractTokenFromSession(session)
          if (sessionToken) {
            token = sessionToken
            console.log('[auth] getSession.success (social)', { attempt })
            break
          }
        } catch (error) {
          console.warn('[auth] getSession.error (social)', { attempt, error: error?.message })
        }
        await new Promise((r) => setTimeout(r, delayMs))
      }
    }

    if (token) persistAuthToken(token)

    return response;
  } catch (error) {
    console.error("Google signin error:", error);
    throw error;
  }
}

/**
 * Sign out the current user
 */
export async function logout() {
  try {
    if (!isBrowser) {
      // Still attempt server-side signout but also clear any stored token when in browser
      try {
        const response = await authClient.signOut();
        clearStoredAuthToken()
        return response
      } catch (e) {
        clearStoredAuthToken()
        throw e
      }
    }

    const response = await authClient.signOut();
    clearStoredAuthToken()
    return response;
  } catch (error) {
    clearStoredAuthToken()
    console.error("Logout error:", error);
    throw error;
  }
}

/**
 * Update current user profile via backend API
 */
export async function updateUserProfile(profileData) {
  try {
    console.log('[auth-client] Update profile - submitting payload:', profileData)
    const response = await axiosPublic.put('/api/users/me', profileData)
    console.log('[auth-client] Update profile - full response:', response.data)
    console.log('[auth-client] Update profile - returning user object:', response.data.user)
    // Backend returns { success, message, user } - extract the user object
    return response.data.user || response.data;
  } catch (error) {
    console.error('[auth-client] Update profile error:', error?.response?.status, error?.response?.data || error.message)
    throw error;
  }
}

/**
 * Get current session (server-side or client-side)
 */
export async function getSession() {
  try {
    let session = await authClient.getSession();
    if (!session?.user) {
      console.log('[auth] getSession.cookie.failed', { tokenStored: !!getStoredAuthToken() })
      const token = getStoredAuthToken()
      if (token) {
        try {
          const endpoint = `${AUTH_URL.replace(/\/$/, '')}/get-session`
          const response = await fetchWithAuthFallback(endpoint, {
            method: 'GET',
          })
          if (response.ok) {
            const json = await response.json()
            if (json?.session) {
              session = json.session
              console.log('[auth] getSession.tokenFallback.success', { endpoint })
            }
          } else {
            console.warn('[auth] getSession.tokenFallback.failed', { status: response.status, endpoint })
          }
        } catch (tokenError) {
          console.warn('[auth] getSession.tokenFallback.error', tokenError?.message)
        }
      }
    }
    persistTokenFromSession(session)
    return session;
  } catch (error) {
    console.error("Get session error:", error);
    return null;
  }
}

// ============ RE-EXPORTS ============
export const { useSession, signIn, signUp, signOut } = authClient;
export { extractTokenFromSession };
