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
    <div className="relative">
      {/* Tactical Angled Frame */}
      <div 
        className="relative bg-[#0A0D18] border border-[#1E293B] p-6 sm:p-8 shadow-2xl space-y-6"
        style={{
          clipPath: "polygon(0 0, calc(100% - 24px) 0, 100% 24px, 100% 100%, 24px 100%, 0 calc(100% - 24px))",
        }}
      >
        {/* Glowing Top Bevel Accent */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-primary-brand/90 via-primary-brand/30 to-transparent" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          
          {/* Left Side: Octagonal Varsity Emblem & Title */}
          <div className="flex items-center gap-5 min-w-0">
            
            {/* 8-Sided Octagonal Emblem */}
            <div 
              className="w-18 h-18 bg-[#141A29] p-[2px] border border-[#2B3B5C] shadow-lg flex items-center justify-center shrink-0"
              style={{
                clipPath: "polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)",
              }}
            >
              <div 
                className="w-full h-full bg-[#0B0F1C] flex items-center justify-center font-display text-2xl sm:text-3xl font-black text-white"
                style={{
                  clipPath: "polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)",
                }}
              >
                {initials}
              </div>
            </div>

            <div className="min-w-0 space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span 
                  className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-300 bg-[#141A29] px-3 py-0.5 border border-[#232D44] flex items-center gap-1.5 shrink-0"
                  style={{
                    clipPath: "polygon(8px 0, 100% 0, calc(100% - 8px) 100%, 0 100%)",
                  }}
                >
                  <CheckCircleIcon className="w-3 h-3 text-slate-400" />
                  VERIFIED VARSITY
                </span>
                {university.domain && (
                  <span 
                    className="text-[10px] font-mono font-bold text-slate-400 bg-[#0F1422] px-3 py-0.5 border border-[#1E293B] flex items-center gap-1.5"
                    style={{
                      clipPath: "polygon(8px 0, 100% 0, calc(100% - 8px) 100%, 0 100%)",
                    }}
                  >
                    <ShieldIcon className="w-3 h-3 text-slate-400" />
                    {university.domain}
                  </span>
                )}
              </div>

              <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-black uppercase text-white tracking-wide truncate">
                {university.name}
              </h1>
            </div>
          </div>

          {/* Right Side: Asymmetrical Slanted Telemetry Pod */}
          <div 
            className="grid grid-cols-3 gap-2 p-3 bg-[#060812] border border-[#1C2538] shrink-0 text-center shadow-inner"
            style={{
              clipPath: "polygon(14px 0, 100% 0, calc(100% - 14px) 100%, 0 100%)",
            }}
          >
            <div className="px-4 py-1">
              <span className="text-[9px] font-mono uppercase tracking-widest text-slate-400 block font-bold">
                GLICKO-2
              </span>
              <span className="font-display text-xl sm:text-2xl font-black text-white block mt-0.5">
                {university.glicko2_rating.toFixed(1)}
              </span>
              <span className="text-[9px] font-mono text-slate-400 block mt-0.5">
                ±{university.glicko2_rd?.toFixed(0) || "42"} RD
              </span>
            </div>

            <div className="px-4 py-1 border-x border-[#1C2538]">
              <span className="text-[9px] font-mono uppercase tracking-widest text-slate-400 block font-bold">
                WIN RATE
              </span>
              <span className="font-display text-xl sm:text-2xl font-black text-slate-200 block mt-0.5">
                {winRate}%
              </span>
              <span className="text-[9px] font-mono text-slate-400 block mt-0.5">
                {totalMatches} MATCHES
              </span>
            </div>

            <div className="px-4 py-1">
              <span className="text-[9px] font-mono uppercase tracking-widest text-slate-400 block font-bold">
                RECORD
              </span>
              <span className="font-display text-lg sm:text-xl font-black text-slate-200 block mt-1">
                {wins}W - {losses}L
              </span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
