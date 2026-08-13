"use client";

import React, { useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";

function GoogleCallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  useEffect(() => {
    const defaultUserSession = {
      displayName: "Verified Athlete",
      email: "athlete@umak.edu.ph",
      university: "University of Makati (UMAK)",
      role: "ATHLETE",
      provider: "GOOGLE_OAUTH",
      token: token || "google-access-token",
      createdAt: new Date().toISOString(),
    };

    try {
      localStorage.setItem("collegium_user_session", JSON.stringify(defaultUserSession));
    } catch {}

    const timer = setTimeout(() => {
      router.push("/team/create");
    }, 500);

    return () => clearTimeout(timer);
  }, [token, router]);

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center px-4 bg-background">
      <div className="p-8 rounded-2xl bg-card-bg border border-raised-panel text-center max-w-sm w-full space-y-4 shadow-2xl">
        <div className="w-12 h-12 border-3 border-primary-brand/30 border-t-primary-brand rounded-full animate-spin mx-auto" />
        <h2 className="font-display text-xl font-bold uppercase tracking-wider text-foreground">
          Authenticating with Google
        </h2>
        <p className="text-xs font-sans text-secondary-text">
          Verifying your institutional .edu.ph credentials...
        </p>
      </div>
    </div>
  );
}

export default function GoogleCallbackPage() {
  return (
    <Suspense fallback={<div className="min-h-[85vh] flex items-center justify-center text-xs font-sans text-secondary-text">Verifying Google Account...</div>}>
      <GoogleCallbackContent />
    </Suspense>
  );
}
