"use client";

import React, { useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircleIcon } from "@/components/ui/Icons";

function AuthPendingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const message = searchParams.get("message") || "Your account has been created via Google OAuth.";

  useEffect(() => {
    const userSession = {
      displayName: "Verified Athlete",
      email: "athlete@umak.edu.ph",
      university: "University of Makati (UMAK)",
      role: "ATHLETE",
      status: "ACTIVE",
      provider: "GOOGLE_WORKSPACE",
      createdAt: new Date().toISOString(),
    };
    try {
      localStorage.setItem("collegium_user_session", JSON.stringify(userSession));
    } catch {}
  }, []);

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center px-4 py-12 bg-background">
      <div className="w-full max-w-md bg-card-bg border border-raised-panel rounded-2xl p-6 sm:p-8 shadow-2xl text-center space-y-6">
        <div className="w-14 h-14 rounded-2xl bg-success/10 border border-success/30 text-success inline-flex items-center justify-center font-bold">
          <CheckCircleIcon className="w-8 h-8 text-success" />
        </div>

        <div>
          <span className="text-xs font-sans font-extrabold uppercase tracking-widest text-secondary-brand block mb-1">
            Philippine Collegiate Circuit
          </span>
          <h1 className="font-display text-2xl font-bold uppercase text-foreground">
            Google Account Verified
          </h1>
          <p className="text-xs font-sans text-secondary-text mt-2 leading-relaxed">
            {message}
          </p>
        </div>

        <div className="p-4 rounded-xl bg-background border border-panel-border text-left space-y-2">
          <div className="flex items-center justify-between text-xs font-sans">
            <span className="text-secondary-text">Domain Verification:</span>
            <span className="font-semibold text-success">.edu.ph Verified</span>
          </div>
          <div className="flex items-center justify-between text-xs font-sans">
            <span className="text-secondary-text">Assigned Role:</span>
            <span className="font-bold text-foreground">Athlete</span>
          </div>
        </div>

        <div className="pt-2">
          <button
            onClick={() => router.push("/team/create")}
            className="w-full h-11 rounded-lg bg-primary-brand hover:bg-primary-brand/90 text-foreground font-sans text-xs font-bold uppercase tracking-widest transition-colors flex items-center justify-center cursor-pointer"
          >
            Proceed to Team Onboarding
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AuthPendingPage() {
  return (
    <Suspense fallback={<div className="min-h-[85vh] flex items-center justify-center text-xs font-sans text-secondary-text">Loading status...</div>}>
      <AuthPendingContent />
    </Suspense>
  );
}
