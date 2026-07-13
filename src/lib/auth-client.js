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
    session?.token ||
    session?.data?.session?.token ||
    session?.data?.token ||
    session?.data?.session?.accessToken ||
    session?.data?.session?.access_token ||
    null
  )
}

const persistAuthToken = (token) => {
  if (!isBrowser || !token) return
  try {
    window.localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token)
  } catch {
    // ignore localStorage failures
  }
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

    const response = await authClient.signIn.email({
      email,
      password,
    });

    // Some environments return the token directly from the sign-in response,
    // but others require fetching the session afterwards. Try both.
    let token = extractTokenFromSession(response)

    // If token not present immediately, retry `getSession` a few times to
    // allow the browser to store cookies from the sign-in response.
    if (!token) {
      const maxAttempts = 4
      const delayMs = 250
      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
          const session = await authClient.getSession()
          const sessionToken = extractTokenFromSession(session)
          if (sessionToken) {
            token = sessionToken
            break
          }
        } catch (error) {
          // on transient failures, keep retrying
        }
        // small backoff before next try
        await new Promise((r) => setTimeout(r, delayMs))
      }
    }

    if (token) persistAuthToken(token)

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

    const response = await authClient.signIn.social({
      provider: "google",
      callbackURL: `${typeof window !== "undefined" ? window.location.origin : ""}/`,
    });

    // Persist token if available from the immediate response or from
    // the post-redirect session fetch.
    let token = extractTokenFromSession(response)

    // After social sign-in (which may redirect), the cookie may not be
    // immediately visible to the client. Retry `getSession` a few times
    // to reduce flakiness where the backend has set cookies but the
    // browser hasn't attached them to subsequent requests yet.
    if (!token) {
      const maxAttempts = 6
      const delayMs = 300
      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
          const session = await authClient.getSession()
          const sessionToken = extractTokenFromSession(session)
          if (sessionToken) {
            token = sessionToken
            break
          }
        } catch (error) {
          // ignore and retry
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
    const session = await authClient.getSession();
    const token = extractTokenFromSession(session)
    if (token) persistAuthToken(token)
    return session;
  } catch (error) {
    console.error("Get session error:", error);
    return null;
  }
}

// ============ RE-EXPORTS ============
export const { useSession, signIn, signUp, signOut } = authClient;