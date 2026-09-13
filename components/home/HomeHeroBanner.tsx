"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { UserProfile, GameInfo, GameId } from "@/types";
import { GAME_LIST } from "@/lib/games";
import { SwordsIcon, ShieldIcon, UsersIcon } from "@/components/ui/Icons";

interface HomeHeroBannerProps {
  user: UserProfile | null;
  activeGame: GameId;
  selectedGameInfo: GameInfo | null;
  selectGame: (gameId: GameId) => void;
  stats: { value: string; label: string }[];
}

export default function HomeHeroBanner({
  user,
  activeGame,
  selectedGameInfo,
  selectGame,
  stats,
}: HomeHeroBannerProps) {
  const isAthlete = user?.role === "ATHLETE" || (user && user.role !== "ORGANIZER" && user.role !== "ADMIN");
  const athleteTeam = user?.teamMemberships?.[0]?.team;

  return (
    <div className="relative border-b border-white/[0.06] bg-gradient-to-b from-[#0B0F19]/80 via-[#080C16]/60 to-transparent backdrop-blur-xl pt-5 pb-6">
      {/* Soft ambient lighting */}
      <div
        className="pointer-events-none absolute -top-12 left-1/2 -translate-x-1/2 h-44 w-full max-w-4xl opacity-20 blur-[100px]"
        style={{ backgroundColor: selectedGameInfo?.accentColor || "#E53A4C" }}
      />

      <div className="relative z-10 mx-auto w-full max-w-[1600px] px-4 sm:px-6 md:px-8 space-y-4">
        {/* Arena Pill Selector & Circuit Telemetry */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-white/[0.06] pb-3">
          {/* Game Switcher Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1">
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-widest mr-1 shrink-0 flex items-center gap-1.5">
              <span
                className="w-1.5 h-1.5 rounded-full animate-pulse"
                style={{ backgroundColor: selectedGameInfo?.accentColor || "#E53A4C" }}
              />
              ARENA:
            </span>

            {GAME_LIST.map((game) => {
              const isActive = activeGame === game.id;
              return (
                <button
                  key={game.id}
                  type="button"
                  onClick={() => selectGame(game.id as GameId)}
                  className={`group relative flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-display font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer shrink-0 ${
                    isActive
                      ? "bg-white/[0.08] text-white border border-white/[0.15] shadow-lg shadow-black/40"
                      : "bg-white/[0.02] text-slate-400 hover:text-white border border-transparent hover:border-white/[0.08] hover:bg-white/[0.04]"
                  }`}
                >
                  <div className="relative w-4 h-4 overflow-hidden rounded shrink-0">
                    <Image
                      src={game.image}
                      alt={game.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <span
                    style={{
                      color: isActive ? game.accentColor : undefined,
                      textShadow: isActive ? `0 0 10px ${game.accentColor}40` : undefined,
                    }}
                  >
                    {game.name}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-5 text-xs font-mono text-slate-400 shrink-0">
            {stats.map((s, idx) => (
              <div key={idx} className="flex items-center gap-1.5">
                <span className="font-display font-bold text-white text-sm">
                  {s.value}
                </span>
                <span className="text-[10px] uppercase tracking-wider text-slate-500">
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* User / Circuit Status Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-3.5 sm:px-5 rounded-xl bg-white/[0.02] border border-white/[0.06] backdrop-blur-md">
          <div className="flex items-center gap-3.5 min-w-0">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center font-display font-black text-xs text-white shrink-0 shadow-sm"
              style={{ backgroundColor: selectedGameInfo?.accentColor || "#E53A4C" }}
            >
              {user ? user.displayName.charAt(0) : "C"}
            </div>

            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-display text-xs sm:text-sm font-bold uppercase text-white/90 truncate">
                  {user ? user.displayName : "PHILIPPINE COLLEGIATE ESPORTS CIRCUIT"}
                </span>
                {user && (
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-[9px] font-bold uppercase tracking-wider">
                    {user.role || "ATHLETE"}
                  </span>
                )}
              </div>
              <span className="font-sans text-[11px] text-slate-400 truncate mt-0.5">
                {user
                  ? `${user.university?.name || "Varsity Circuit"} • Squad: ${athleteTeam?.name || "Active Roster"} • ${selectedGameInfo?.name || "VALORANT"}`
                  : "Official inter-university tournament brackets, live match scoring, and verified scrimmages."}
              </span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex items-center gap-2 shrink-0">
            {user && isAthlete ? (
              <>
                <Link
                  href="/scrims"
                  className="flex items-center gap-1.5 h-8 px-3.5 rounded-lg game-theme-btn font-mono text-[11px] font-bold uppercase tracking-wider shadow-sm transition-all"
                >
                  <SwordsIcon className="w-3 h-3" />
                  <span>Find Scrim</span>
                </Link>
                <Link
                  href="/dashboard"
                  className="flex items-center gap-1.5 h-8 px-3.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white border border-white/[0.08] font-mono text-[11px] font-bold uppercase tracking-wider transition-all"
                >
                  <UsersIcon className="w-3 h-3 text-primary-brand" />
                  <span>My Squad</span>
                </Link>
              </>
            ) : user && user.role === "ORGANIZER" ? (
              <Link
                href="/dashboard"
                className="flex items-center gap-1.5 h-8 px-4 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 text-black font-mono text-xs font-bold uppercase tracking-wider shadow-sm"
              >
                <ShieldIcon className="w-3.5 h-3.5" />
                <span>Host Tournament</span>
              </Link>
            ) : (
              <>
                <Link
                  href="/register"
                  className="flex items-center justify-center h-8 px-4 rounded-lg game-theme-btn font-mono text-xs font-bold uppercase tracking-wider shadow-sm transition-all"
                >
                  Join University Roster
                </Link>
                <Link
                  href="/login"
                  className="flex items-center justify-center h-8 px-3.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white border border-white/[0.08] font-mono text-xs font-bold uppercase tracking-wider transition-all"
                >
                  Log In
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
