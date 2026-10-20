"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { configureApiClient, authService } from "@/services";
import { UserProfile, AuthContextType } from "@/types";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = "collegium_access_token";

function readStoredToken(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function writeStoredToken(token: string | null) {
  try {
    if (token) localStorage.setItem(STORAGE_KEY, token);
    else localStorage.removeItem(STORAGE_KEY);
  } catch {}
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  // The API client reads the token through this ref so it always sees the
  // latest value, even mid-render. The token is also persisted: in production
  // the frontend (Vercel) and API (Render) are cross-site, and browsers that
  // block third-party cookies never send the auth cookies — the Bearer header
  // is then the only thing that keeps a session alive across reloads.
  const tokenRef = useRef<string | null>(null);

  const storeToken = useCallback((token: string | null) => {
    tokenRef.current = token;
    setAccessToken(token);
    writeStoredToken(token);
  }, []);

  const clearAuth = useCallback(() => {
    setUser(null);
    storeToken(null);
  }, [storeToken]);

  // Ignore a 401 from a request sent with an older token — e.g. the initial
  // anonymous getMe() resolving after verify-email has already logged in.
  const handleUnauthorized = useCallback(
    (rejectedToken: string | null) => {
      if (rejectedToken === tokenRef.current) clearAuth();
    },
    [clearAuth],
  );

  const fetchProfile = useCallback(async (): Promise<UserProfile | null> => {
    try {
      const profile = await authService.getMe();
      return profile;
    } catch {
      return null;
    }
  }, []);

  const loginWithToken = useCallback(async (token?: string) => {
    if (token) {
      storeToken(token);
    }
    const tokenUsed = tokenRef.current;

    const profile = await fetchProfile();
    if (profile) {
      setUser(profile);
    } else if (tokenRef.current === tokenUsed) {
      clearAuth();
    }
    return profile;
  }, [clearAuth, fetchProfile, storeToken]);

  const logoutUser = useCallback(async () => {
    try {
      await authService.logout();
    } catch {}
    // Smooth 500ms delay so logout transition feels natural & unhurried
    await new Promise((resolve) => setTimeout(resolve, 500));
    clearAuth();
  }, [clearAuth]);

  const refreshProfile = useCallback(async (): Promise<UserProfile | null> => {
    const profile = await fetchProfile();
    if (profile) {
      setUser(profile);
    }
    return profile;
  }, [fetchProfile]);

  const setUserAvatar = useCallback((avatarUrl: string | null) => {
    setUser((prev) => (prev ? { ...prev, avatar: avatarUrl } : null));
  }, []);

  useEffect(() => {
    configureApiClient(() => tokenRef.current, handleUnauthorized, storeToken);

    const stored = readStoredToken();
    tokenRef.current = stored;

    fetchProfile().then((profile) => {
      if (profile) {
        setAccessToken(tokenRef.current);
        setUser(profile);
      } else if (tokenRef.current === stored) {
        clearAuth();
      }
      setIsLoaded(true);
    });
  }, [clearAuth, fetchProfile, handleUnauthorized, storeToken]);

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        isLoggedIn: !!user,
        isLoaded,
        loginWithToken,
        logoutUser,
        refreshProfile,
        setUserAvatar,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
