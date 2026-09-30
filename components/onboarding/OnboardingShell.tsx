"use client";

import React from "react";
import { OnboardingShellProps } from "@/types";
import { useAuth } from "@/context/AuthContext";

/** Full-screen frame for the onboarding screens, matching the gateway page. */
export default function OnboardingShell({ stepLabel, accent, children }: OnboardingShellProps) {
  const { user, logoutUser } = useAuth();
  const glow = accent === "amber" ? "bg-amber-500/20" : "bg-primary-brand/20";

  return (
    <div className="relative w-full min-h-screen flex flex-col bg-[#080A10] text-foreground overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className={`absolute top-1/4 left-1/2 -translate-x-1/2 w-[40rem] h-[26rem] rounded-full blur-[140px] ${glow}`} />
      </div>

      <header className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Collegium Logo" className="w-8 h-8 object-contain rounded-md shadow-md shadow-primary-brand/30" />
          <span className="min-w-0">
            <span className="block font-display text-lg font-black tracking-wider text-white leading-none">COLLEGIUM</span>
            <span className="block text-[9px] font-mono text-slate-400 truncate">
              Signed in as {user?.displayName ?? "…"}
            </span>
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="hidden sm:inline px-3 py-1.5 rounded-full border border-[#232D44] bg-[#0D121F]/90 text-[10px] font-mono text-slate-300">
            {stepLabel}
          </span>
          <button
            type="button"
            onClick={() => logoutUser()}
            className="px-3 py-1.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 transition-colors cursor-pointer"
          >
            Sign Out
          </button>
        </div>
      </header>

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center w-full max-w-5xl mx-auto px-4 sm:px-6 py-8 animate-modal-pop-in">
        {children}
      </main>
    </div>
  );
}
