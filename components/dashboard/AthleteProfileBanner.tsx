"use client";

import React from "react";
import Link from "next/link";
import { UserProfile } from "@/types";

interface AthleteProfileBannerProps {
  user: UserProfile;
}

export default function AthleteProfileBanner({ user }: AthleteProfileBannerProps) {
  const isUnregistered = user.university?.name?.toLowerCase().includes("unregistered");

  return (
    <div className="p-6 sm:p-8 rounded-2xl bg-card-bg border border-raised-panel shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-primary-brand/20 text-primary-brand border border-primary-brand/30 flex items-center justify-center font-display text-2xl font-bold uppercase">
          {user.displayName.charAt(0)}
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            {isUnregistered ? (
              <span className="text-[10px] font-sans font-extrabold uppercase tracking-widest text-warning px-2 py-0.5 rounded bg-warning/10 border border-warning/20">
                ⚠️ Pending Institution Verification
              </span>
            ) : (
              <span className="text-[10px] font-sans font-extrabold uppercase tracking-widest text-success px-2 py-0.5 rounded bg-success/10 border border-success/20">
                ✓ Verified Athlete
              </span>
            )}
            <span className="text-[10px] font-sans font-bold uppercase text-secondary-brand px-2 py-0.5 rounded bg-secondary-brand/10 border border-secondary-brand/20">
              {user.role}
            </span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold uppercase text-foreground">
            {user.displayName}
          </h1>
          <p className="font-sans text-xs text-secondary-text mt-0.5">
            {user.email} · {user.university?.name || "University of Makati"}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 w-full md:w-auto">
        <Link
          href="/team/create"
          className="flex-1 md:flex-initial h-11 px-5 rounded-lg bg-gradient-to-r from-[#E53A4C] to-[#B91C1C] hover:from-[#EF4444] hover:to-[#991B1B] text-foreground font-sans text-xs font-bold uppercase tracking-wider transition-all shadow-md shadow-primary-brand/20 active:scale-[0.98] flex items-center justify-center"
        >
          ➕ Create Squad
        </Link>
        <Link
          href="/team/join"
          className="flex-1 md:flex-initial h-11 px-5 rounded-lg border border-raised-panel bg-gradient-to-r from-[#191D27] to-[#121520] hover:from-[#232836] hover:to-[#191D27] text-foreground font-sans text-xs font-bold uppercase tracking-wider transition-all active:scale-[0.98] flex items-center justify-center"
        >
          🤝 Join Squad
        </Link>
      </div>
    </div>
  );
}
