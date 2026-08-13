"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export interface UserSession {
  displayName: string;
  email: string;
  university: string;
  role: string;
  createdAt?: string;
}

interface AuthContextType {
  user: UserSession | null;
  isLoggedIn: boolean;
  isLoaded: boolean;
  loginUser: (session: UserSession) => void;
  logoutUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(null);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("collegium_user_session");
      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch {
      setUser(null);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  const loginUser = (session: UserSession) => {
    setUser(session);
    try {
      localStorage.setItem("collegium_user_session", JSON.stringify(session));
    } catch {}
  };

  const logoutUser = () => {
    setUser(null);
    try {
      localStorage.removeItem("collegium_user_session");
    } catch {}
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn: !!user,
        isLoaded,
        loginUser,
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
