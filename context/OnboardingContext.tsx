"use client";

import React, { createContext, useCallback, useContext, useMemo, useSyncExternalStore } from "react";
import { useAuth } from "@/context/AuthContext";
import { OnboardingContextType } from "@/types";
import {
  deriveOnboardingProfile,
  parseOrganizerSetup,
  readOrganizerSetupRaw,
  resolveHomeRoute,
  subscribeOrganizerSetup,
  writeOrganizerSetup,
} from "@/lib/onboarding";

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const userId = user?.id;

  // The raw string is the snapshot so it compares stably between renders.
  const organizerSetupRaw = useSyncExternalStore(
    subscribeOrganizerSetup,
    () => readOrganizerSetupRaw(userId),
    () => null
  );

  const profile = useMemo(
    () => deriveOnboardingProfile(user, parseOrganizerSetup(organizerSetupRaw)),
    [user, organizerSetupRaw]
  );

  const completeOrganizerSetup = useCallback<OnboardingContextType["completeOrganizerSetup"]>(
    (record) => {
      if (!userId) return;
      writeOrganizerSetup(userId, { ...record, completedAt: new Date().toISOString() });
    },
    [userId]
  );

  const value = useMemo<OnboardingContextType>(
    () => ({
      profile,
      homeRoute: resolveHomeRoute(user, profile),
      completeOrganizerSetup,
    }),
    [profile, user, completeOrganizerSetup]
  );

  return <OnboardingContext.Provider value={value}>{children}</OnboardingContext.Provider>;
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error("useOnboarding must be used within an OnboardingProvider");
  }
  return context;
}
