import { createAuthClient } from "better-auth/react";
import axios from "axios";

const AUTH_URL = process.env.NEXT_PUBLIC_AUTH_URL || process.env.NEXT_PUBLIC_API_URL || ''

/**
 * Unified Auth Client
 * Connects to the frontend's /api/auth endpoint (localhost:3000)
 */
export const authClient = createAuthClient({
  baseURL: AUTH_URL,
});

// ============ AUTHENTICATION FUNCTIONS ============
/**
 * Sign up a new user with email and password
 */
export async function signup({ name, image, email, password }) {
  try {
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
    const response = await authClient.signIn.email({
      email,
      password,
    });
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
    return await authClient.signIn.social({
      provider: "google",
      callbackURL: `${typeof window !== "undefined" ? window.location.origin : ""}/`,
    });
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
    return await authClient.signOut();
  } catch (error) {
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
    const response = await axios.put(
      `${process.env.NEXT_PUBLIC_API_URL}/api/users/me`,
      profileData,
      {
        withCredentials: true,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
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
    return session;
  } catch (error) {
    console.error("Get session error:", error);
    return null;
  }
}

// ============ RE-EXPORTS ============
export const { useSession, signIn, signUp, signOut } = authClient;