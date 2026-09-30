"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { OnboardingScreenGateProps } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { useOnboarding } from "@/context/OnboardingContext";

/**
 * Renders an onboarding screen only for a signed-in user of `role` who still
 * needs it. Anyone else is sent on: logged-out users to the gateway, finished
 * or other-role users to their home. Finishing onboarding flips the derived
 * profile, and this same effect then routes the user onward.
 */
export default function OnboardingScreenGate({ role, children }: OnboardingScreenGateProps) {
  const router = useRouter();
  const { isLoaded, isLoggedIn } = useAuth();
  const { profile, homeRoute } = useOnboarding();

  const belongsHere = profile?.role === role && !profile.isOnboarded;
  const redirectTo = !isLoaded || belongsHere ? null : isLoggedIn ? homeRoute : "/gateway";

  useEffect(() => {
    if (redirectTo) router.replace(redirectTo);
  }, [redirectTo, router]);

  if (!belongsHere) {
    return (
      <div className="flex flex-1 min-h-screen items-center justify-center bg-[#080A10]">
        <div className="w-8 h-8 border-2 border-primary-brand/30 border-t-primary-brand rounded-full animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}
