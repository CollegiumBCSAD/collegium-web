"use client";

import React from "react";
import Link from "next/link";
import { UserProfile } from "@/types";
import { CheckCircleIcon, ShieldIcon, PlusIcon, UsersIcon, ClockIcon } from "@/components/ui/Icons";

interface AthleteProfileBannerProps {
  user: UserProfile;
}

export default function AthleteProfileBanner({ user }: AthleteProfileBannerProps) {
  const isUnregistered = user.university?.name?.toLowerCase().includes("unregistered");

  return (
    <div className="relative overflow-hidden rounded-3xl bg-[#0D121F]/90 border border-[#1E293B] p-6 sm:p-8 shadow-xl backdrop-blur-xl space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Left Avatar & Identity Info */}
        <div className="flex items-center gap-5 min-w-0">
          {/* Avatar Emblem Crest */}
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#141A29] border border-[#232D44] text-white flex items-center justify-center font-display text-2xl sm:text-3xl font-black shrink-0 shadow-lg">
            {user.displayName.charAt(0).toUpperCase()}
          </div>

          <div className="min-w-0 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              {isUnregistered ? (
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-amber-400 bg-amber-950/60 px-3 py-1 rounded-full border border-amber-500/40 flex items-center gap-1.5 shadow-sm">
                  <ClockIcon className="w-3.5 h-3.5 text-amber-400" />
                  PENDING VERIFICATION
                </span>
              ) : (
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-300 bg-[#141A29] px-3 py-1 rounded-full border border-[#232D44] flex items-center gap-1.5 shadow-sm">
                  <CheckCircleIcon className="w-3.5 h-3.5 text-slate-400" />
                  VERIFIED ATHLETE
                </span>
              )}
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-300 bg-[#141A29] px-3 py-1 rounded-full border border-[#232D44]">
                {user.role}
              </span>
            </div>

            <h1 className="font-display text-2xl sm:text-3xl font-black uppercase text-white tracking-tight truncate">
              {user.displayName}
            </h1>

            <div className="flex items-center gap-3 text-xs font-sans text-slate-400">
              <span className="truncate">{user.email}</span>
              <span>·</span>
              <span className="text-slate-300 font-bold flex items-center gap-1 truncate">
                <ShieldIcon className="w-3.5 h-3.5 text-slate-400" />
                {user.university?.name || "University of Makati"}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 w-full lg:w-auto shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-[#1E2538]">
          <Link
            href="/team/create"
            className="flex-1 lg:flex-initial h-11 px-5 rounded-xl game-theme-btn font-sans text-xs font-bold uppercase tracking-wider transition-all shadow-lg active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
          >
            <PlusIcon className="w-4 h-4" />
            <span>Create Squad</span>
          </Link>
          <Link
            href="/team/join"
            className="flex-1 lg:flex-initial h-11 px-5 rounded-xl bg-[#141A29] hover:bg-[#1F273D] text-white border border-[#232D44] font-sans text-xs font-semibold uppercase tracking-wider transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer shadow-md"
          >
            <UsersIcon className="w-4 h-4 text-slate-300" />
            <span>Join Squad</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
