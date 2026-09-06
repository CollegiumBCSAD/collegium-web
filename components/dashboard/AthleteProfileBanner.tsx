"use client";

import React, { useState } from "react";
import Link from "next/link";
import { UserProfile } from "@/types";
import { CheckCircleIcon, ShieldIcon, PlusIcon, UsersIcon, TrophyIcon } from "@/components/ui/Icons";
import EditGameHandlesModal from "./EditGameHandlesModal";

interface AthleteProfileBannerProps {
  user: UserProfile;
  squadsCount?: number;
}

export default function AthleteProfileBanner({ user, squadsCount = 0 }: AthleteProfileBannerProps) {
  const [isEditIgnOpen, setIsEditIgnOpen] = useState(false);
  const initial = (user.displayName || "A").charAt(0).toUpperCase();

  return (
    <div className="relative group">
      {/* Soft Ambient Glow Behind Banner */}
      <div 
        className="absolute -inset-1 opacity-20 blur-xl transition-opacity duration-500 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 20% 50%, var(--primary-brand) 0%, transparent 60%)`,
        }}
      />

      {/* Main Athlete Command Card */}
      <div 
        className="relative overflow-hidden bg-[#0A0D18] border border-[#1C253D] shadow-2xl p-6 sm:p-7"
        style={{
          clipPath: "polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px))",
        }}
      >
        {/* Top Game Specular Highlight Strip */}
        <div 
          className="absolute top-0 left-0 right-0 h-[2px]"
          style={{
            background: `linear-gradient(90deg, transparent 0%, var(--primary-brand) 30%, var(--primary-brand) 70%, transparent 100%)`,
            boxShadow: `0 0 12px var(--primary-brand)`,
          }}
        />

        {/* Subtle Background Tactical Watermark */}
        <div className="absolute right-0 top-0 bottom-0 w-80 opacity-[0.03] pointer-events-none">
          <div className="w-full h-full bg-[radial-gradient(#FFFFFF_1px,transparent_1px)] [background-size:12px_12px]" />
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          
          {/* Athlete Identity: Octagonal Crest & Details */}
          <div className="flex items-center gap-5 min-w-0">
            
            {/* Octagonal Avatar Crest with Game Ring */}
            <div className="relative shrink-0">
              <div 
                className="w-18 h-18 sm:w-20 sm:h-20 bg-gradient-to-br from-[#1E293B] via-[#121929] to-[#0A0D18] p-[2px] shadow-2xl flex items-center justify-center"
                style={{
                  clipPath: "polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)",
                  boxShadow: `0 0 20px rgba(0,0,0,0.6)`,
                }}
              >
                <div 
                  className="w-full h-full bg-[#080B14] flex items-center justify-center font-display text-2xl sm:text-3xl font-black text-white"
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

            {/* Athlete Name, University & Verified Badge */}
            <div className="min-w-0 space-y-1.5">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="font-display text-2xl sm:text-3xl font-black text-white tracking-wide uppercase truncate drop-shadow-sm">
                  {user.displayName}
                </h1>
                <span 
                  className={`text-[9px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 border flex items-center gap-1.5 shrink-0 ${
                    user.role === "ORGANIZER"
                      ? "bg-amber-950/50 text-amber-300 border-amber-500/40"
                      : user.role === "ATHLETE"
                      ? "bg-emerald-950/40 text-emerald-300 border-emerald-500/30"
                      : user.role === "ADMIN"
                      ? "bg-purple-950/40 text-purple-300 border-purple-500/30"
                      : "bg-[#121929] text-slate-400 border-[#243350]"
                  }`}
                  style={{
                    clipPath: "polygon(4px 0, 100% 0, calc(100% - 4px) 100%, 0 100%)",
                  }}
                >
                  {user.role === "ORGANIZER" ? (
                    <TrophyIcon className="w-3 h-3 text-amber-400" />
                  ) : (
                    <CheckCircleIcon className={`w-3 h-3 ${user.role === "ATHLETE" ? "text-emerald-400" : user.role === "ADMIN" ? "text-purple-400" : "text-slate-400"}`} />
                  )}
                  {user.role === "ORGANIZER"
                    ? "TOURNAMENT ORGANIZER"
                    : user.role === "ATHLETE"
                    ? "VERIFIED ATHLETE"
                    : user.role === "ADMIN"
                    ? "ADMINISTRATOR"
                    : "STUDENT MEMBER"}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 font-sans">
                <span className="text-slate-200 font-bold flex items-center gap-1">
                  <ShieldIcon className="w-3.5 h-3.5 text-primary-brand shrink-0" />
                  {user.university?.name || "University of Makati"}
                </span>
                <span className="text-slate-600">•</span>
                <span className="font-mono text-slate-400 text-[11px]">{user.email}</span>
              </div>

              {/* Game Handles (IGN) Badges Row — Athletes & Student Members only */}
              {user.role !== "ORGANIZER" && user.role !== "ADMIN" && (
                <div className="pt-1.5 flex flex-wrap items-center gap-2">
                  {user.gameHandles && user.gameHandles.length > 0 ? (
                    user.gameHandles.map((gh) => (
                      <span
                        key={gh.gameTitle}
                        className="text-[10px] font-mono font-bold px-2 py-0.5 bg-[#070A14] border border-[#1E2942] text-slate-200 rounded flex items-center gap-1.5"
                      >
                        <span className="text-primary-brand font-extrabold">{gh.gameTitle}:</span>
                        <span className="text-white">{gh.handle}</span>
                      </span>
                    ))
                  ) : (
                    <span className="text-[10px] font-mono text-slate-300 italic">
                      No IGN set yet
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => setIsEditIgnOpen(true)}
                    className="text-[10px] font-mono font-bold text-slate-300 hover:text-white bg-[#0E1322] hover:bg-[#182138] px-2.5 py-0.5 border border-[#1E2942] transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <span>✏️ {user.gameHandles && user.gameHandles.length > 0 ? "Edit IGNs" : "Set IGNs"}</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Unified Monochromatic Telemetry Pod & Primary Actions */}
          <div className="flex flex-wrap items-center gap-4 lg:gap-6 shrink-0">
            
            {/* Telemetry Metrics Pod */}
            <div 
              className="flex items-center gap-4 bg-[#050711] border border-[#162034] px-4 py-2.5 shadow-inner"
              style={{
                clipPath: "polygon(8px 0, 100% 0, calc(100% - 8px) 100%, 0 100%)",
              }}
            >
              {user.role === "ORGANIZER" ? (
                <>
                  <div className="text-center pr-4 border-r border-[#162034]">
                    <span className="text-[9px] font-mono uppercase tracking-widest text-slate-400 block font-bold">
                      ROLE
                    </span>
                    <span className="font-display text-sm font-black text-amber-400 block mt-0.5">
                      HOST
                    </span>
                  </div>
                  <div className="text-center pr-4 border-r border-[#162034]">
                    <span className="text-[9px] font-mono uppercase tracking-widest text-slate-400 block font-bold">
                      PERMISSIONS
                    </span>
                    <span className="font-display text-sm font-black text-white block mt-0.5">
                      ACTIVE
                    </span>
                  </div>
                  <div className="text-center">
                    <span className="text-[9px] font-mono uppercase tracking-widest text-slate-400 block font-bold">
                      BRACKETS
                    </span>
                    <span className="font-display text-sm font-black text-emerald-400 block mt-0.5">
                      SANCTIONED
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <div className="text-center pr-4 border-r border-[#162034]">
                    <span className="text-[9px] font-mono uppercase tracking-widest text-slate-400 block font-bold">
                      GLICKO MMR
                    </span>
                    <span className="font-display text-lg font-black text-white block mt-0.5">
                      1500.0
                    </span>
                  </div>
                  <div className="text-center pr-4 border-r border-[#162034]">
                    <span className="text-[9px] font-mono uppercase tracking-widest text-slate-400 block font-bold">
                      SQUADS
                    </span>
                    <span className="font-display text-lg font-black text-white block mt-0.5">
                      {squadsCount}
                    </span>
                  </div>
                  <div className="text-center">
                    <span className="text-[9px] font-mono uppercase tracking-widest text-slate-400 block font-bold">
                      TIER
                    </span>
                    <span className="font-display text-sm font-black text-slate-200 block mt-0.5">
                      DIV I
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* Tactical Action Buttons */}
            <div className="flex items-center gap-2.5">
              {user.role === "ORGANIZER" ? (
                <>
                  <Link
                    href="/tournaments"
                    className="h-9 px-4.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-display text-xs font-black uppercase tracking-wider transition-all shadow-lg active:scale-95 flex items-center gap-1.5 cursor-pointer shadow-amber-500/20"
                    style={{
                      clipPath: "polygon(6px 0, 100% 0, calc(100% - 6px) 100%, 0 100%)",
                    }}
                  >
                    <TrophyIcon className="w-3.5 h-3.5 text-black" />
                    <span>Host Tournament</span>
                  </Link>
                  <Link
                    href="/tournaments"
                    className="h-9 px-4.5 bg-[#121828] hover:bg-[#1A233A] text-slate-300 hover:text-white border border-[#202C48] font-display text-xs font-bold uppercase tracking-wider transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer shadow-md"
                    style={{
                      clipPath: "polygon(6px 0, 100% 0, calc(100% - 6px) 100%, 0 100%)",
                    }}
                  >
                    <span>View Brackets</span>
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/team/create"
                    className="h-9 px-4.5 game-theme-btn font-display text-xs font-black uppercase tracking-wider transition-all shadow-lg active:scale-95 flex items-center gap-1.5 cursor-pointer"
                    style={{
                      clipPath: "polygon(6px 0, 100% 0, calc(100% - 6px) 100%, 0 100%)",
                    }}
                  >
                    <PlusIcon className="w-3.5 h-3.5" />
                    <span>Create Squad</span>
                  </Link>
                  <Link
                    href="/team/join"
                    className="h-9 px-4.5 bg-[#121828] hover:bg-[#1A233A] text-slate-300 hover:text-white border border-[#202C48] font-display text-xs font-bold uppercase tracking-wider transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer shadow-md"
                    style={{
                      clipPath: "polygon(6px 0, 100% 0, calc(100% - 6px) 100%, 0 100%)",
                    }}
                  >
                    <UsersIcon className="w-3.5 h-3.5 text-slate-400" />
                    <span>Join Squad</span>
                  </Link>
                </>
              )}
            </div>

          </div>

        </div>
      </div>

      <EditGameHandlesModal
        key={`${user?.id}-${user?.gameHandles?.length ?? 0}`}
        isOpen={isEditIgnOpen}
        onClose={() => setIsEditIgnOpen(false)}
        user={user}
      />
    </div>
  );
}
