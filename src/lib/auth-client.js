import { createAuthClient } from "better-auth/react";
import axios from "axios";

/**
 * Unified Auth Client
 * Connects to the frontend's /api/auth endpoint (localhost:3000)
 */
export const authClient = createAuthClient({
  baseURL: "http://localhost:5000",
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
    const response = await axios.put(
      "http://localhost:5000/api/users/me",
      profileData,
      {
        withCredentials: true,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Update profile error:", error);
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