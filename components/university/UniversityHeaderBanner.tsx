"use client";

import React from "react";
import { University } from "@/types";
import { ShieldIcon, CheckCircleIcon } from "@/components/ui/Icons";

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
    <div className="relative overflow-hidden rounded-2xl bg-[#0D121F]/90 border border-[#1E293B] p-6 sm:p-8 shadow-xl backdrop-blur-xl space-y-6">
      {/* Top Accent Line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-brand via-rose-500 to-primary-brand" />

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        
        {/* Left Side: Varsity Emblem & Title */}
        <div className="flex items-center gap-4 min-w-0">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-gradient-to-br from-primary-brand/80 to-rose-700 text-white flex items-center justify-center font-display text-xl sm:text-2xl font-bold shrink-0 shadow-lg border border-white/10">
            {initials}
          </div>

          <div className="min-w-0 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-sans font-semibold uppercase tracking-wider text-primary-brand bg-primary-brand/10 px-2.5 py-0.5 rounded-md border border-primary-brand/20 flex items-center gap-1.5">
                <CheckCircleIcon className="w-3 h-3 text-primary-brand" />
                Verified Varsity
              </span>
              {university.domain && (
                <span className="text-[10px] font-sans font-medium text-slate-400 bg-[#141A29] px-2.5 py-0.5 rounded-md border border-[#232D44] flex items-center gap-1.5">
                  <ShieldIcon className="w-3 h-3 text-slate-400" />
                  {university.domain}
                </span>
              )}
            </div>

            <h1 className="font-display text-xl sm:text-2xl lg:text-3xl font-bold text-white tracking-wide truncate">
              {university.name}
            </h1>
          </div>
        </div>

        {/* Right Side: Performance Metrics */}
        <div className="grid grid-cols-3 gap-3 p-3.5 rounded-xl bg-[#080C14] border border-[#1C2538] shrink-0 text-center">
          <div className="px-2 sm:px-4">
            <span className="text-[10px] font-sans font-medium text-slate-400 uppercase tracking-wider block">
              Glicko-2 Rating
            </span>
            <span className="font-display text-xl sm:text-2xl font-bold text-white block mt-0.5">
              {university.glicko2_rating.toFixed(1)}
            </span>
            <span className="text-[10px] font-sans text-slate-400 block font-normal mt-0.5">
              ±{university.glicko2_rd?.toFixed(0) || "42"} RD
            </span>
          </div>

          <div className="px-2 sm:px-4 border-x border-[#1C2538]">
            <span className="text-[10px] font-sans font-medium text-slate-400 uppercase tracking-wider block">
              Win Rate
            </span>
            <span className="font-display text-xl sm:text-2xl font-bold text-white block mt-0.5">
              {winRate}%
            </span>
            <span className="text-[10px] font-sans text-slate-400 block font-normal mt-0.5">
              {totalMatches} Matches
            </span>
          </div>

          <div className="px-2 sm:px-4">
            <span className="text-[10px] font-sans font-medium text-slate-400 uppercase tracking-wider block">
              Record
            </span>
            <span className="font-sans text-sm sm:text-base font-semibold text-slate-200 block mt-1">
              {wins}W - {losses}L
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}
