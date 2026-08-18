"use client";

import React from "react";
import Link from "next/link";
import { UserProfile } from "@/types";
import { CheckCircleIcon, ShieldIcon, PlusIcon, UsersIcon } from "@/components/ui/Icons";

interface AthleteProfileBannerProps {
  user: UserProfile;
}

export default function AthleteProfileBanner({ user }: AthleteProfileBannerProps) {
  const isUnregistered = user.university?.name?.toLowerCase().includes("unregistered");

  return (
    <div className="relative overflow-hidden rounded-3xl bg-[#0D121F]/95 border border-[#1E293B] p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-6">
      {/* Top Accent Line - High Potency Crimson */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-brand via-rose-500 to-primary-brand" />

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-center gap-5 min-w-0">
          {/* Avatar Emblem Crest */}
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-[#261217] via-[#1A0E13] to-[#0D121F] border border-primary-brand/40 text-primary-brand flex items-center justify-center font-display text-2xl sm:text-3xl font-black shrink-0 shadow-2xl ring-2 ring-primary-brand/20">
            {user.displayName.charAt(0).toUpperCase()}
          </div>

          <div className="min-w-0 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              {isUnregistered ? (
                <span className="text-[10px] font-mono font-extrabold uppercase tracking-widest text-amber-400 bg-amber-950/60 px-3 py-1 rounded-full border border-amber-500/40 flex items-center gap-1.5 shadow-sm">
                  ⚠️ PENDING INSTITUTION VERIFICATION
                </span>
              ) : (
                <span className="text-[10px] font-mono font-extrabold uppercase tracking-widest text-emerald-400 bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-500/40 flex items-center gap-1.5 shadow-sm">
                  <CheckCircleIcon className="w-3.5 h-3.5 text-emerald-400" />
                  VERIFIED ATHLETE
                </span>
              )}
              <span className="text-[10px] font-mono font-extrabold uppercase tracking-widest text-primary-brand bg-primary-brand/15 px-3 py-1 rounded-full border border-primary-brand/30">
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
                <ShieldIcon className="w-3.5 h-3.5 text-secondary-brand" />
                {user.university?.name || "University of Makati"}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 w-full lg:w-auto shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-[#1E2538]">
          <Link
            href="/team/create"
            className="flex-1 lg:flex-initial h-11 px-5 rounded-xl game-theme-btn font-sans text-xs font-extrabold uppercase tracking-wider transition-all shadow-lg shadow-red-950/40 active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
          >
            <PlusIcon className="w-4 h-4" />
            <span>Create Squad</span>
          </Link>
          <Link
            href="/team/join"
            className="flex-1 lg:flex-initial h-11 px-5 rounded-xl bg-[#141A29] hover:bg-[#1F273D] text-white border border-[#232D44] font-sans text-xs font-extrabold uppercase tracking-wider transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer shadow-md"
          >
            <UsersIcon className="w-4 h-4 text-slate-300" />
            <span>Join Squad</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

