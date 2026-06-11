import { createContext, useContext, useEffect, useState } from "react";
import { createAuthClient } from "@neondatabase/neon-js/auth";
export const authClient = createAuthClient(import.meta.env.VITE_NEON_AUTH_URL);

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authClient.getSession().then((result) => {
      setSession(result.data?.session ?? null);
      setUser(result.data?.user ?? null);
      setLoading(false);
    });
  }, []);

  const refreshSession = async () => {
    const result = await authClient.getSession();

    setSession(result.data?.session ?? null);
    setUser(result.data?.user ?? null);
  };

  const signOut = async () => {
    await authClient.signOut();
    setSession(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        loading,
        refreshSession,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

// import {
//   createContext,
//   useCallback,
//   useContext,
//   useEffect,
//   useMemo,
//   useState,
// } from "react";
// import { authApi } from "../services/api.js";

// const AuthContext = createContext(null);

// const STORAGE_TOKEN_KEY = "wine_prediction_token";
// const STORAGE_USER_KEY = "wine_prediction_user";

// function readStoredSession() {
//   if (typeof window === "undefined") {
//     return { token: null, user: null };
//   }
//   try {
//     const token = window.localStorage.getItem(STORAGE_TOKEN_KEY);
//     const userRaw = window.localStorage.getItem(STORAGE_USER_KEY);
//     const user = userRaw ? JSON.parse(userRaw) : null;
//     return { token, user };
//   } catch (error) {
//     console.warn("Could not read stored session", error);
//     return { token: null, user: null };
//   }
// }

// function persistSession(token, user) {
//   if (typeof window === "undefined") {
//     return;
//   }
//   if (token) {
//     window.localStorage.setItem(STORAGE_TOKEN_KEY, token);
//   } else {
//     window.localStorage.removeItem(STORAGE_TOKEN_KEY);
//   }
//   if (user) {
//     window.localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(user));
//   } else {
//     window.localStorage.removeItem(STORAGE_USER_KEY);
//   }
// }

// export function AuthProvider({ children }) {
//   const [{ token, user }, setSession] = useState(() => readStoredSession());
//   const [status, setStatus] = useState("idle");
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     persistSession(token, user);
//   }, [token, user]);

//   const signIn = useCallback(async ({ email, password }) => {
//     setStatus("loading");
//     setError(null);
//     try {
//       const response = await authApi.signIn({ email, password });
//       const nextToken = response.token || response.access_token || response.jwt;
//       const nextUser = response.user || {
//         email,
//         name: response.name || email.split("@")[0],
//       };

//       if (!nextToken) {
//         throw new Error("Authentication response did not include a token.");
//       }

//       setSession({ token: nextToken, user: nextUser });
//       setStatus("authenticated");
//       return nextUser;
//     } catch (signInError) {
//       setStatus("error");
//       setError(signInError.message);
//       throw signInError;
//     }
//   }, []);

//   const signUp = useCallback(async ({ email, password, name }) => {
//     setStatus("loading");
//     setError(null);
//     try {
//       const response = await authApi.signUp({ email, password, name });
//       const nextToken = response.token || response.access_token || response.jwt;
//       const nextUser = response.user || {
//         email,
//         name: name || email.split("@")[0],
//       };

//       if (nextToken) {
//         setSession({ token: nextToken, user: nextUser });
//       }
//       setStatus("authenticated");
//       return nextUser;
//     } catch (signUpError) {
//       setStatus("error");
//       setError(signUpError.message);
//       throw signUpError;
//     }
//   }, []);

//   const signOut = useCallback(() => {
//     setSession({ token: null, user: null });
//     setStatus("idle");
//     setError(null);
//   }, []);

//   const value = useMemo(
//     () => ({
//       token,
//       currentUser: user,
//       isAuthenticated: Boolean(token),
//       status,
//       error,
//       signIn,
//       signUp,
//       signOut,
//     }),
//     [token, user, status, error, signIn, signUp, signOut],
//   );

//   return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
// }

// export function useAuth() {
//   const context = useContext(AuthContext);
//   if (!context) {
//     throw new Error("useAuth must be used within an AuthProvider");
//   }
//   return context;
// }
