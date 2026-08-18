"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { configureApiClient, authService } from "@/services";
import { UserProfile, AuthContextType } from "@/types";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = "collegium_access_token";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const clearAuth = useCallback(() => {
    setUser(null);
    setAccessToken(null);
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {}
    }
  }, []);

  const fetchProfile = useCallback(async (): Promise<UserProfile | null> => {
    try {
      const profile = await authService.getMe();
      return profile;
    } catch {
      return null;
    }
  }, []);

  const handleTokenRefreshed = useCallback((newToken: string) => {
    setAccessToken(newToken);
  }, []);

  const loginWithToken = useCallback(async (token?: string) => {
    if (token) {
      setAccessToken(token);
    }
    configureApiClient(() => token || null, clearAuth, handleTokenRefreshed);

    const profile = await fetchProfile();
    if (profile) {
      setUser(profile);
    } else {
      clearAuth();
    }
    return profile;
  }, [clearAuth, fetchProfile, handleTokenRefreshed]);

  const logoutUser = useCallback(async () => {
    try {
      await authService.logout();
    } catch {}
    clearAuth();
  }, [clearAuth]);

  useEffect(() => {
    configureApiClient(() => accessToken, clearAuth, handleTokenRefreshed);
    fetchProfile().then((profile) => {
      if (profile) {
        setUser(profile);
      } else {
        clearAuth();
      }
      setIsLoaded(true);
    });
  }, [accessToken, clearAuth, fetchProfile, handleTokenRefreshed]);

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        isLoggedIn: !!user,
        isLoaded,
        loginWithToken,
        logoutUser,
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
