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
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#161B28] via-[#11141F] to-[#191F30] border border-[#272D40] p-6 sm:p-8 shadow-2xl space-y-6 md:space-y-0 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
      {/* Ambient background glow element */}
      <div className="absolute -top-24 -left-24 w-60 h-60 bg-primary-brand/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-60 h-60 bg-secondary-brand/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex items-center gap-5 relative z-10">
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-primary-brand/30 to-primary-brand/10 text-primary-brand border border-primary-brand/40 flex items-center justify-center font-display text-3xl font-extrabold uppercase shadow-xl ring-2 ring-primary-brand/20 shrink-0">
          {user.displayName.charAt(0)}
        </div>

        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            {isUnregistered ? (
              <span className="text-[10px] font-sans font-extrabold uppercase tracking-widest text-warning px-2.5 py-0.5 rounded-full bg-warning/10 border border-warning/30 flex items-center gap-1.5 shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-warning animate-pulse" />
                Pending Verification
              </span>
            ) : (
              <span className="text-[10px] font-sans font-extrabold uppercase tracking-widest text-success px-2.5 py-0.5 rounded-full bg-success/10 border border-success/30 flex items-center gap-1.5 shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                Verified Athlete
              </span>
            )}

            <span className="text-[10px] font-sans font-extrabold uppercase tracking-widest text-secondary-brand px-2.5 py-0.5 rounded-full bg-secondary-brand/10 border border-secondary-brand/30 shadow-sm">
              {user.role}
            </span>
          </div>

          <h1 className="font-display text-3xl sm:text-4xl font-bold uppercase tracking-wider text-foreground">
            {user.displayName}
          </h1>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-sans text-secondary-text">
            <span className="flex items-center gap-1">
              📧 {user.email}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1 font-semibold text-foreground">
              🏛️ {user.university?.name || "University of Makati"}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 w-full md:w-auto relative z-10 shrink-0">
        <Link
          href="/team/create"
          className="flex-1 md:flex-initial h-11 px-6 rounded-xl bg-gradient-to-r from-[#E53A4C] to-[#B91C1C] hover:from-[#EF4444] hover:to-[#991B1B] text-foreground font-sans text-xs font-bold uppercase tracking-wider transition-all active:scale-[0.98] shadow-lg shadow-primary-brand/25 flex items-center justify-center cursor-pointer border border-primary-brand/30"
        >
          ➕ Create Squad
        </Link>
        <Link
          href="/team/join"
          className="flex-1 md:flex-initial h-11 px-6 rounded-xl border border-panel-border bg-background/80 hover:bg-raised-panel text-foreground font-sans text-xs font-bold uppercase tracking-wider transition-all active:scale-[0.98] shadow-md flex items-center justify-center cursor-pointer"
        >
          🤝 Join Squad
        </Link>
      </div>
    </div>
  );
}
