"use client";

import { useState } from "react";
import Image from "next/image";
import { Tournament } from "@/types";
import { TrophyIcon, ShieldIcon } from "@/components/ui/Icons";
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

          <div className="flex items-center gap-2.5 flex-wrap w-full sm:w-auto">
            {!isCompleted && isApplied && (
              <div className="w-full sm:w-auto">
                {showUndoConfirm ? (
                  <div className="p-3 bg-rose-950/70 border border-rose-500/40 rounded-xl space-y-2 animate-fade-in w-full">
                    <p className="text-[11px] font-sans text-rose-200">
                      Are you sure you want to withdraw your squad registration application?
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={isApplying}
                        onClick={() => {
                          setShowUndoConfirm(false);
                          if (onWithdraw) onWithdraw(tournament);
                        }}
                        className="flex-1 h-8 bg-rose-600 hover:bg-rose-500 text-white rounded text-[11px] font-mono font-bold uppercase transition-colors cursor-pointer"
                      >
                        {isApplying ? "Withdrawing..." : "Yes, Withdraw"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowUndoConfirm(false)}
                        className="flex-1 h-8 bg-[#121828] text-slate-300 hover:text-white rounded text-[11px] font-mono font-bold uppercase transition-colors cursor-pointer border border-[#222E48]"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] font-mono font-bold px-3 py-2 rounded bg-amber-950/60 text-amber-300 border border-amber-500/30 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                      Application Pending Organizer Approval
                    </span>
                    {onWithdraw && (
                      <button
                        type="button"
                        disabled={isApplying}
                        onClick={() => setShowUndoConfirm(true)}
                        className="h-10 px-3.5 bg-rose-950/40 hover:bg-rose-900/50 text-rose-300 border border-rose-500/30 rounded text-xs font-mono font-bold uppercase transition-colors cursor-pointer"
                      >
                        Undo Application
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
                className="h-10 px-5 text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md bg-[#141A29] hover:bg-[#1E293B] text-slate-200 border border-[#232D44]"
                style={{
                  clipPath: "polygon(4px 0, 100% 0, calc(100% - 4px) 100%, 0 100%)",
                }}
              >
                {isApplying ? (
                  <span>Submitting...</span>
                ) : (
                  <span>+ Apply / Register Squad</span>
                )}
              </button>
            )}

            <button
              onClick={() => onSelect(tournament)}
              className="h-10 px-6 game-theme-btn text-xs font-bold uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 cursor-pointer shrink-0"
              style={{
                clipPath: "polygon(4px 0, 100% 0, calc(100% - 4px) 100%, 0 100%)",
              }}
            >
              <span>View Bracket & Details</span>
              <span>→</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
