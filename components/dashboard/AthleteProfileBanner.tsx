"use client";

import React from "react";
import Link from "next/link";
import { UserProfile } from "@/types";
import { CheckCircleIcon, ShieldIcon, PlusIcon, UsersIcon, ZapIcon, TrophyIcon } from "@/components/ui/Icons";

interface AthleteProfileBannerProps {
  user: UserProfile;
  squadsCount?: number;
}

export default function AthleteProfileBanner({ user, squadsCount = 0 }: AthleteProfileBannerProps) {
  const initial = (user.displayName || "A").charAt(0).toUpperCase();

  return (
    <div className="relative">
      {/* Main Tactical Card Container with Clean Chamfered Corners */}
      <div 
        className="relative overflow-hidden bg-[#0A0D18] border border-[#1E293B] p-6 sm:p-7 shadow-2xl"
        style={{
          clipPath: "polygon(0 0, calc(100% - 18px) 0, 100% 18px, 100% 100%, 18px 100%, 0 calc(100% - 18px))",
        }}
      >
        {/* Sleek Top Brand Accent Line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-primary-brand via-rose-500/50 to-transparent" />

        {/* Diagonal Corner Cut Accent Lines */}
        <div className="absolute top-0 right-0 w-8 h-8 pointer-events-none">
          <div className="w-full h-full border-t-2 border-r-2 border-primary-brand/60 rotate-45 transform origin-top-right translate-x-[-4px] translate-y-[4px]" />
        </div>

        {/* Subtle Background Tactical Grid */}
        <div className="absolute inset-0 bg-[radial-gradient(#1E293B_1px,transparent_1px)] [background-size:16px_16px] opacity-20 pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          
          {/* Athlete Info & Hexagonal Avatar */}
          <div className="flex items-center gap-5 min-w-0">
            
            {/* Hexagonal Avatar Emblem */}
            <div className="relative shrink-0">
              <div 
                className="w-18 h-18 sm:w-20 sm:h-20 bg-gradient-to-br from-primary-brand via-[#1E293B] to-[#0A0D18] p-[1.5px] shadow-xl flex items-center justify-center"
                style={{
                  clipPath: "polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)",
                }}
              >
                <div 
                  className="w-full h-full bg-[#0E1424] flex items-center justify-center font-display text-3xl font-black text-white"
                  style={{
                    clipPath: "polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)",
                  }}
                >
                  {initial}
                </div>
              </div>
              <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-[#0A0D18] flex items-center justify-center text-white shadow-md">
                <CheckCircleIcon className="w-3 h-3" />
              </span>
            </div>

            <div className="min-w-0 space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-display text-2xl sm:text-3xl font-black text-white tracking-wide uppercase truncate drop-shadow-sm">
                  {user.displayName}
                </h1>
                <span 
                  className="text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 bg-emerald-950/60 text-emerald-400 border border-emerald-500/40 flex items-center gap-1 shrink-0"
                  style={{
                    clipPath: "polygon(6px 0, 100% 0, calc(100% - 6px) 100%, 0 100%)",
                  }}
                >
                  <CheckCircleIcon className="w-3 h-3 text-emerald-400" />
                  VERIFIED VARSITY
                </span>
              </div>

              <p className="text-xs text-slate-400 font-sans flex items-center gap-1.5 truncate">
                <ShieldIcon className="w-3.5 h-3.5 text-primary-brand shrink-0" />
                <span className="text-slate-200 font-bold">{user.university?.name || "University of Makati"}</span>
                <span className="text-slate-600">·</span>
                <span className="text-slate-400 font-mono text-[11px]">{user.email}</span>
              </p>
            </div>
          </div>

          {/* Center Tactical Telemetry Slab */}
          <div 
            className="flex items-center gap-5 bg-[#060812] border border-[#1C263C] px-5 py-3 shadow-inner"
            style={{
              clipPath: "polygon(10px 0, 100% 0, calc(100% - 10px) 100%, 0 100%)",
            }}
          >
            <div className="text-center pr-4 border-r border-[#1C263C]">
              <span className="text-[9px] font-mono uppercase tracking-widest text-slate-400 block">COLLEGIATE MMR</span>
              <span className="font-display text-lg font-black text-white flex items-center justify-center gap-1">
                <ZapIcon className="w-3.5 h-3.5 text-primary-brand" />
                1500.0
              </span>
            </div>
            <div className="text-center pr-4 border-r border-[#1C263C]">
              <span className="text-[9px] font-mono uppercase tracking-widest text-slate-400 block">ACTIVE SQUADS</span>
              <span className="font-display text-lg font-black text-white">{squadsCount}</span>
            </div>
            <div className="text-center">
              <span className="text-[9px] font-mono uppercase tracking-widest text-slate-400 block">SEASON TIER</span>
              <span className="text-xs font-mono font-bold text-amber-400 flex items-center justify-center gap-1">
                <TrophyIcon className="w-3 h-3 text-amber-400" />
                Division I
              </span>
            </div>
          </div>

          {/* Right Action Buttons with Chamfered Edges */}
          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/team/create"
              className="h-10 px-5 bg-gradient-to-r from-primary-brand to-rose-700 hover:brightness-110 text-white font-display text-xs font-black uppercase tracking-wider transition-all shadow-lg active:scale-95 flex items-center gap-1.5 cursor-pointer"
              style={{
                clipPath: "polygon(8px 0, 100% 0, calc(100% - 8px) 100%, 0 100%)",
              }}
            >
              <PlusIcon className="w-3.5 h-3.5" />
              <span>Create Squad</span>
            </Link>
            <Link
              href="/team/join"
              className="h-10 px-5 bg-[#141A29] hover:bg-[#1C253B] text-slate-200 hover:text-white border border-[#243350] font-display text-xs font-bold uppercase tracking-wider transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer shadow-md"
              style={{
                clipPath: "polygon(8px 0, 100% 0, calc(100% - 8px) 100%, 0 100%)",
              }}
            >
              <UsersIcon className="w-3.5 h-3.5 text-slate-400" />
              <span>Join Squad</span>
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
