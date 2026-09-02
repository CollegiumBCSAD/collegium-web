"use client";

import { useState } from "react";
import Image from "next/image";
import { Tournament } from "@/types";
import { 
  TrophyIcon, 
  ShieldIcon, 
  ClockIcon, 
  PlusIcon, 
  AlertTriangleIcon, 
  XCircleIcon 
} from "@/components/ui/Icons";
import { GAMES } from "@/lib/games";

interface TournamentCardProps {
  tournament: Tournament;
  onSelect: (tournament: Tournament) => void;
  onApply?: (tournament: Tournament) => void;
  onWithdraw?: (tournament: Tournament) => void;
  isApplied?: boolean;
  isApplying?: boolean;
}

export default function TournamentCard({
  tournament,
  onSelect,
  onApply,
  onWithdraw,
  isApplied = false,
  isApplying = false,
}: TournamentCardProps) {
  const [showUndoConfirm, setShowUndoConfirm] = useState(false);
  const isCompleted = tournament.status?.toLowerCase() === "completed";
  const gameStr = (tournament.game || "").toLowerCase();
  const gameKey = 
    gameStr.includes("lol") || gameStr.includes("league") 
      ? "lol" 
      : gameStr.includes("codm") || gameStr.includes("call of duty") || gameStr.includes("duty")
      ? "codm" 
      : gameStr.includes("mlbb") || gameStr.includes("mobile legends") || gameStr.includes("ml")
      ? "ml" 
      : "valo";
      
  const gameInfo = GAMES[gameKey as keyof typeof GAMES] || GAMES.valo;
  const cardImage = tournament.image || gameInfo.image;

  return (
    <div 
      className="group relative flex flex-col md:flex-row bg-[#0A0D18] border border-[#1E293B] hover:border-primary-brand/60 shadow-2xl transition-all duration-300 overflow-hidden"
      style={{
        clipPath: "polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px))",
      }}
    >
      {/* Top Neutral Highlight Bevel */}
      <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-primary-brand/80 via-primary-brand/20 to-transparent" />

      {/* Left Game Artwork Banner */}
      <div className="w-full md:w-72 lg:w-80 h-48 md:h-auto shrink-0 relative overflow-hidden bg-[#060812] p-6 flex flex-col justify-between border-b md:border-b-0 md:border-r border-[#182338]">
        {/* Background Artwork */}
        <div className="absolute inset-0 opacity-30 group-hover:opacity-50 transition-opacity duration-500 scale-105 group-hover:scale-110 object-cover">
          <Image src={cardImage} alt="" fill className="object-cover" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-[#0A0D18] via-transparent to-transparent pointer-events-none" />

        {/* Game Tag & Status */}
        <div className="relative z-10 flex items-center justify-between">
          <span 
            className="font-mono text-[10px] font-bold text-white uppercase px-3 py-1 bg-[#141A29]/90 border border-white/20 shadow-md"
            style={{
              clipPath: "polygon(4px 0, 100% 0, calc(100% - 4px) 100%, 0 100%)",
            }}
          >
            {tournament.game}
          </span>
          
          <span 
            className={`font-mono text-[9px] font-bold uppercase px-2.5 py-0.5 border ${
              isCompleted 
                ? "bg-[#141A29] text-slate-300 border-[#232D44]" 
                : "bg-emerald-950/80 text-emerald-400 border-emerald-500/40 animate-pulse"
            }`}
            style={{
              clipPath: "polygon(4px 0, 100% 0, calc(100% - 4px) 100%, 0 100%)",
            }}
          >
            {isCompleted ? "COMPLETED" : "LIVE CIRCUIT"}
          </span>
        </div>

        {/* Large Game Watermark */}
        <div className="relative z-10 mt-auto pt-8">
          <span className="font-display text-2xl font-black uppercase text-white/40 tracking-tight block group-hover:text-white/70 transition-colors">
            {tournament.game}
          </span>
        </div>
      </div>

      {/* Content Section */}
      <div className="flex-1 p-6 sm:p-8 flex flex-col justify-between min-h-[220px] bg-[#0A0D18]/95 relative z-10">
        <div>
          <div className="flex flex-wrap items-center justify-between gap-4 mb-2">
            <span className="font-mono text-xs font-bold tracking-widest text-primary-brand uppercase flex items-center gap-1.5">
              <TrophyIcon className="w-4 h-4 text-primary-brand" />
              <span>OFFICIAL COLLEGIATE CIRCUIT</span>
            </span>
            <span className="font-mono text-xs text-slate-400">
              {tournament.statusText || "Final standings published"}
            </span>
          </div>

          <h2 className="font-display text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-white uppercase group-hover:text-primary-brand transition-colors">
            {tournament.title}
          </h2>

          <p className="font-sans text-xs sm:text-sm text-slate-400 mt-1 leading-relaxed">
            {tournament.statusText || "Philippine Collegiate Championship Playoff Series"}
          </p>

          {/* Telemetry Bullet Chips */}
          <div className="mt-4 flex flex-wrap gap-2">
            {tournament.bulletPoints.map((pt) => (
              <span 
                key={pt} 
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#141A29] border border-[#232D44] text-xs font-mono font-medium text-slate-300"
                style={{
                  clipPath: "polygon(6px 0, 100% 0, calc(100% - 6px) 100%, 0 100%)",
                }}
              >
                <span className="text-primary-brand font-bold">•</span>
                <span>{pt}</span>
              </span>
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-6 pt-4 border-t border-[#182338] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <ShieldIcon className="w-3.5 h-3.5 text-slate-400" />
            <span>Verified Tournament Payload</span>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap w-full sm:w-auto justify-end">
            {!isCompleted && isApplied && (
              <div className="w-full sm:w-auto">
                {showUndoConfirm ? (
                  <div 
                    className="flex items-center gap-2 p-1.5 bg-rose-950/80 border border-rose-500/50 shadow-[0_0_15px_rgba(244,63,94,0.15)] animate-fade-in"
                    style={{
                      clipPath: "polygon(4px 0, 100% 0, calc(100% - 4px) 100%, 0 100%)",
                    }}
                  >
                    <span className="text-[11px] font-mono font-bold text-rose-200 px-2 flex items-center gap-1.5">
                      <AlertTriangleIcon className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                      <span>Withdraw squad registration?</span>
                    </span>
                    <button
                      type="button"
                      disabled={isApplying}
                      onClick={() => {
                        setShowUndoConfirm(false);
                        if (onWithdraw) onWithdraw(tournament);
                      }}
                      className="h-7 px-3 bg-rose-600 hover:bg-rose-500 text-white text-[10px] font-mono font-black uppercase transition-colors cursor-pointer shadow-sm"
                      style={{
                        clipPath: "polygon(3px 0, 100% 0, calc(100% - 3px) 100%, 0 100%)",
                      }}
                    >
                      {isApplying ? "Withdrawing..." : "Confirm"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowUndoConfirm(false)}
                      className="h-7 px-2.5 bg-[#141A29] hover:bg-[#1E293B] text-slate-300 hover:text-white text-[10px] font-mono font-bold uppercase transition-colors border border-[#232D44] cursor-pointer"
                      style={{
                        clipPath: "polygon(3px 0, 100% 0, calc(100% - 3px) 100%, 0 100%)",
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Tactical Status HUD Badge */}
                    <div 
                      className="h-10 px-3.5 bg-gradient-to-r from-amber-500/15 via-amber-950/30 to-[#0A0D18] text-amber-300 border border-amber-500/40 shadow-[0_0_12px_rgba(245,158,11,0.1)] flex items-center gap-2"
                      style={{
                        clipPath: "polygon(4px 0, 100% 0, calc(100% - 4px) 100%, 0 100%)",
                      }}
                    >
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
                      </span>
                      <span className="text-[11px] font-mono font-black tracking-wider uppercase">
                        Application Pending Approval
                      </span>
                    </div>

                    {/* Integrated Undo / Withdraw Action */}
                    {onWithdraw && (
                      <button
                        type="button"
                        disabled={isApplying}
                        onClick={() => setShowUndoConfirm(true)}
                        className="h-10 px-3.5 bg-[#101524] hover:bg-rose-950/40 text-slate-400 hover:text-rose-300 border border-[#232D44] hover:border-rose-500/40 text-xs font-mono font-bold uppercase transition-all duration-200 cursor-pointer flex items-center gap-1.5 active:scale-95"
                        style={{
                          clipPath: "polygon(4px 0, 100% 0, calc(100% - 4px) 100%, 0 100%)",
                        }}
                        title="Withdraw squad application"
                      >
                        <XCircleIcon className="w-3.5 h-3.5 text-slate-400 group-hover:text-rose-400" />
                        <span>Undo</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {!isCompleted && !isApplied && onApply && (
              <button
                type="button"
                disabled={isApplying}
                onClick={() => onApply(tournament)}
                className="h-10 px-4 text-xs font-mono font-black uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(16,185,129,0.15)] bg-gradient-to-r from-emerald-950/80 via-emerald-900/40 to-[#0A0D18] hover:from-emerald-900/90 hover:via-emerald-800/50 hover:to-emerald-950/90 text-emerald-300 hover:text-emerald-100 border border-emerald-500/50 hover:border-emerald-400 active:scale-95 group/apply"
                style={{
                  clipPath: "polygon(4px 0, 100% 0, calc(100% - 4px) 100%, 0 100%)",
                }}
              >
                {isApplying ? (
                  <>
                    <ClockIcon className="w-3.5 h-3.5 text-emerald-400 animate-spin" />
                    <span>Registering...</span>
                  </>
                ) : (
                  <>
                    <PlusIcon className="w-3.5 h-3.5 text-emerald-400 group-hover/apply:scale-110 transition-transform" />
                    <span>Apply / Register Squad</span>
                  </>
                )}
              </button>
            )}

            <button
              onClick={() => onSelect(tournament)}
              className="h-10 px-6 game-theme-btn text-xs font-display font-black uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 cursor-pointer shrink-0 active:scale-95 transition-transform group/btn"
              style={{
                clipPath: "polygon(4px 0, 100% 0, calc(100% - 4px) 100%, 0 100%)",
              }}
            >
              <span>View Bracket & Details</span>
              <span className="group-hover/btn:translate-x-0.5 transition-transform">→</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
