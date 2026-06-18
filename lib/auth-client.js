import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
    baseURL:
        process.env.NEXT_PUBLIC_AUTH_URL ||
        "http://localhost:3000",
});

// Google login helper (optional wrapper)
export const signInWithGoogle = async () => {
    return await authClient.signIn.social({
        provider: "google",
    });
};

// Re-export hooks and methods from SAME client
export const { signIn, signUp, useSession } = authClient;