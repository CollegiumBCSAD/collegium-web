"use client";

import React from "react";
import { University } from "@/types";
import { CheckCircleIcon, ShieldIcon, TrophyIcon, FlameIcon } from "@/components/ui/Icons";

interface UniversityHeaderBannerProps {
  university: University;
}

export default function UniversityHeaderBanner({ university }: UniversityHeaderBannerProps) {
  const wins = university.wins || 0;
  const losses = university.losses || 0;
  const totalMatches = wins + losses;
  const winRate = totalMatches > 0 ? Math.round((wins / totalMatches) * 100) : 0;
  const initials = university.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .substring(0, 3)
    .toUpperCase();

  return (
    <div className="relative overflow-hidden rounded-3xl bg-[#0D121F]/98 border border-[#1E293B] p-6 sm:p-8 lg:p-10 shadow-2xl backdrop-blur-2xl space-y-6">
      {/* Top Accent Line - High Potency Crimson Glow */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-brand via-rose-500 to-primary-brand" />

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        
        {/* Left Side: Varsity Crest Emblem & Title */}
        <div className="flex items-start sm:items-center gap-5 min-w-0">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-primary-brand via-rose-700 to-[#12080D] text-white flex items-center justify-center font-display text-2xl sm:text-3xl font-black shrink-0 shadow-2xl ring-2 ring-primary-brand/30 border border-white/10">
            {initials}
          </div>

          <div className="min-w-0 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-mono font-extrabold uppercase tracking-widest text-emerald-400 bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-500/30 flex items-center gap-1.5 shadow-sm">
                <CheckCircleIcon className="w-3.5 h-3.5 text-emerald-400" />
                VERIFIED COLLEGIATE VARSITY
              </span>
              {university.domain && (
                <span className="text-[10px] font-mono font-bold text-slate-300 bg-[#141A29] px-3 py-1 rounded-full border border-[#232D44] flex items-center gap-1.5">
                  <ShieldIcon className="w-3.5 h-3.5 text-amber-400" />
                  {university.domain}
                </span>
              )}
            </div>

            <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-black uppercase text-white tracking-wide truncate">
              {university.name}
            </h1>
          </div>
        </div>

        {/* Right Side: Performance Metrics Widget */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 p-4 rounded-2xl bg-[#080C14] border border-[#1C2538] shrink-0 text-center shadow-inner">
          <div className="px-2 sm:px-4">
            <span className="text-[9px] font-mono font-extrabold text-slate-400 uppercase tracking-widest block">
              GLICKO-2 RATING
            </span>
            <span className="font-display text-2xl sm:text-3xl font-black text-white block mt-0.5">
              {university.glicko2_rating.toFixed(1)}
            </span>
            <span className="text-[9px] font-mono text-emerald-400 block font-bold mt-0.5">
              ±{university.glicko2_rd?.toFixed(0) || "42"} RD
            </span>
          </div>

          <div className="px-2 sm:px-4 border-x border-[#1C2538]">
            <span className="text-[9px] font-mono font-extrabold text-slate-400 uppercase tracking-widest block">
              WIN RATE
            </span>
            <span className="font-display text-2xl sm:text-3xl font-black text-emerald-400 block mt-0.5">
              {winRate}%
            </span>
            <span className="text-[9px] font-mono text-slate-400 block mt-0.5">
              {totalMatches} Matches Logged
            </span>
          </div>

          <div className="px-2 sm:px-4">
            <span className="text-[9px] font-mono font-extrabold text-slate-400 uppercase tracking-widest block">
              SEASON RECORD
            </span>
            <span className="font-mono text-sm sm:text-base font-extrabold text-white block mt-2">
              {wins}W - {losses}L
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}
