"use client";

import React, { useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

function GoogleCallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { loginWithToken } = useAuth();
  const token = searchParams.get("token");

  useEffect(() => {
    loginWithToken(token || undefined)
      .then(() => {
        router.push("/dashboard");
      })
      .catch(() => {
        router.push("/login?error=profile_failed");
      });
  }, [token, loginWithToken, router]);

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center px-4 bg-background">
      <div className="p-8 rounded-2xl bg-card-bg border border-raised-panel text-center max-w-sm w-full space-y-4 shadow-2xl">
        <div className="w-12 h-12 border-2 border-primary-brand/30 border-t-primary-brand rounded-full animate-spin mx-auto" />
        <h2 className="font-display text-xl font-bold uppercase tracking-wider text-foreground">
          Authenticating
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
    <Suspense fallback={
      <div className="min-h-[85vh] flex items-center justify-center text-xs font-sans text-secondary-text">
        Verifying account...
      </div>
    }>
      <GoogleCallbackContent />
    </Suspense>
  );
}
