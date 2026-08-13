"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { configureApiClient, api } from "@/lib/api";

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  role: string;
  status: string;
  universityId: string;
  university: {
    id: string;
    name: string;
    domain: string;
  };
  createdAt: string;
}

interface AuthContextType {
  user: UserProfile | null;
  accessToken: string | null;
  isLoggedIn: boolean;
  isLoaded: boolean;
  loginWithToken: (token: string) => Promise<void>;
  logoutUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = "collegium_access_token";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const getToken = useCallback(() => accessToken, [accessToken]);

  const clearAuth = useCallback(() => {
    setUser(null);
    setAccessToken(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
  }, []);

  const fetchProfile = useCallback(async (token: string): Promise<UserProfile | null> => {
    try {
      const profile = await api.get<UserProfile>("/auth/me");
      return profile;
    } catch {
      return null;
    }
  }, []);

  const loginWithToken = useCallback(async (token: string) => {
    setAccessToken(token);
    try {
      localStorage.setItem(STORAGE_KEY, token);
    } catch {}

    configureApiClient(() => token, clearAuth);

    const profile = await fetchProfile(token);
    if (profile) {
      setUser(profile);
    } else {
      clearAuth();
    }
  }, [clearAuth, fetchProfile]);

  const logoutUser = useCallback(async () => {
    try {
      await api.post("/auth/logout", {});
    } catch {}
    clearAuth();
  }, [clearAuth]);

  useEffect(() => {
    const storedToken = (() => {
      try {
        return localStorage.getItem(STORAGE_KEY);
      } catch {
        return null;
      }
    })();

    if (storedToken) {
      configureApiClient(() => storedToken, clearAuth);
      setAccessToken(storedToken);
      fetchProfile(storedToken).then((profile) => {
        if (profile) {
          setUser(profile);
        } else {
          clearAuth();
        }
        setIsLoaded(true);
      });
    } else {
      setIsLoaded(true);
    }
  }, [clearAuth, fetchProfile]);

  useEffect(() => {
    configureApiClient(getToken, clearAuth);
  }, [getToken, clearAuth]);

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
