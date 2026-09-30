"use client";

import React, { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useOnboarding } from "@/context/OnboardingContext";
import { isGuardExemptPath, ONBOARDING_ROUTES } from "@/lib/onboarding";

/**
 * Sends a signed-in user who hasn't finished onboarding to their role's
 * onboarding screen, from any page except onboarding and the sign-in steps.
 *
 * The decision is computed during render from already-hydrated auth state, so
 * the blocked page never paints before the redirect. It can't loop: this guard
 * only redirects when `isOnboarded` is false, the onboarding screens only
 * redirect away once it is true, and both read the same derived profile.
 */
export default function OnboardingGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { profile } = useOnboarding();

  const redirectTo =
    profile && !profile.isOnboarded && !isGuardExemptPath(pathname) ? ONBOARDING_ROUTES[profile.role] : null;

  useEffect(() => {
    if (redirectTo) router.replace(redirectTo);
  }, [redirectTo, router]);

  if (redirectTo) {
    return (
      <div className="flex flex-1 min-h-[70vh] items-center justify-center text-xs font-mono text-slate-500 animate-pulse">
        Finishing your account setup…
      </div>
    );
  }

  return <>{children}</>;
}
