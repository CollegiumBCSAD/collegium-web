"use client";

import { useState } from "react";
import Image from "next/image";
import { Tournament } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { 
  TrophyIcon, 
  ShieldIcon, 
  ClockIcon, 
  PlusIcon, 
  AlertTriangleIcon, 
  XCircleIcon,
  CheckCircleIcon
} from "@/components/ui/Icons";
import { GAMES } from "@/lib/games";

interface TournamentCardProps {
  tournament: Tournament;
  onSelect: (tournament: Tournament, tab?: "bracket" | "teams" | "overview") => void;
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
  const { user } = useAuth();
  const [showUndoConfirm, setShowUndoConfirm] = useState(false);
  const isCompleted = tournament.status?.toLowerCase() === "completed";
  const isMyTournament = Boolean(
    user?.id && (tournament.organizerId === user.id || tournament.organizer?.id === user.id)
  );
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

  const isOrganizerOrHost = user?.role === "ORGANIZER" || user?.role === "ADMIN" || isMyTournament;

  const isUniversityRegistered = Boolean(
    user?.universityId &&
      (tournament.universities as Array<{ id?: string }> | undefined)?.some(
        (u) => u.id === user.universityId
      )
  );

  const userApplication = (
    tournament.applications as Array<{ userId?: string; universityId?: string; teamId?: string; status?: string }> | undefined
  )?.find(
    (app) =>
      app.status !== "REJECTED" &&
      (app.userId === user?.id || (user?.universityId && app.universityId === user.universityId))
  );

  const applicationStatus =
    userApplication?.status ||
    (isUniversityRegistered ? "APPROVED" : isApplied ? "PENDING" : null);
  const isApproved = !isOrganizerOrHost && (applicationStatus === "APPROVED" || isUniversityRegistered);
  const isPending = !isOrganizerOrHost && !isApproved && (applicationStatus === "PENDING" || isApplied || Boolean(userApplication));
  const userApplied = isApproved || isPending;

  const formatDateDisplay = (dateStr?: string) => {
    if (!dateStr) return null;
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div 
      className={`group relative flex flex-col md:flex-row bg-[#0A0D18] border shadow-2xl transition-all duration-300 overflow-hidden ${
        isMyTournament
          ? "border-amber-500/60 shadow-amber-500/10"
          : "border-[#1E293B] hover:border-primary-brand/60"
      }`}
      style={{
        clipPath: "polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px))",
      }}
    >
      {/* Top Neutral Highlight Bevel */}
      <div className={`absolute top-0 left-0 right-0 h-[1.5px] ${
        isMyTournament
          ? "bg-gradient-to-r from-amber-500 via-amber-400 to-transparent"
          : "bg-gradient-to-r from-primary-brand/80 via-primary-brand/20 to-transparent"
      }`} />

      {/* Left Game Artwork Banner */}
      <div className="w-full md:w-72 lg:w-80 h-48 md:h-auto shrink-0 relative overflow-hidden bg-[#060812] p-6 flex flex-col justify-between border-b md:border-b-0 md:border-r border-[#182338]">
        {/* Background Artwork */}
        <div className="absolute inset-0 opacity-30 group-hover:opacity-50 transition-opacity duration-500 scale-105 group-hover:scale-110 object-cover">
          <Image src={cardImage} alt="" fill className="object-cover" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-[#0A0D18] via-transparent to-transparent pointer-events-none" />

        {/* Game Tag & Status */}
        <div className="relative z-10 flex items-center justify-between gap-1 flex-wrap">
          <span 
            className="font-mono text-[10px] font-bold text-white uppercase px-2.5 py-1 bg-[#141A29]/90 border border-white/20 shadow-md"
            style={{
              clipPath: "polygon(4px 0, 100% 0, calc(100% - 4px) 100%, 0 100%)",
            }}
          >
            {tournament.game}
          </span>
          
          <div className="flex items-center gap-1.5 flex-wrap">
            {isMyTournament && (
              <span 
                className="font-mono text-[9px] font-black uppercase px-2 py-0.5 bg-gradient-to-r from-amber-500/25 to-amber-600/25 text-amber-300 border border-amber-500/50 shadow-[0_0_10px_rgba(245,158,11,0.2)] flex items-center gap-1"
                style={{
                  clipPath: "polygon(3px 0, 100% 0, calc(100% - 3px) 100%, 0 100%)",
                }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                YOUR TOURNAMENT
              </span>
            )}

            <span 
              className={`font-mono text-[9px] font-bold uppercase px-2.5 py-0.5 border ${
                tournament.status === "PENDING_APPROVAL"
                  ? "bg-amber-950/90 text-amber-300 border-amber-500/50 animate-pulse"
                  : isCompleted 
                  ? "bg-[#141A29] text-slate-300 border-[#232D44]" 
                  : "bg-emerald-950/80 text-emerald-400 border-emerald-500/40 animate-pulse"
              }`}
              style={{
                clipPath: "polygon(4px 0, 100% 0, calc(100% - 4px) 100%, 0 100%)",
              }}
            >
              {tournament.status === "PENDING_APPROVAL" ? "PENDING APPROVAL" : isCompleted ? "COMPLETED" : "LIVE CIRCUIT"}
            </span>
          </div>
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

          {/* Schedule Date/Time and Telemetry Bullet Chips */}
          <div className="mt-4 flex flex-wrap gap-2">
            {tournament.startDate && (
              <span 
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-cyan-950/40 border border-cyan-500/40 text-xs font-mono font-bold text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.15)]"
                style={{
                  clipPath: "polygon(6px 0, 100% 0, calc(100% - 6px) 100%, 0 100%)",
                }}
              >
                <ClockIcon className="w-3.5 h-3.5 text-cyan-400" />
                <span>Starts: {formatDateDisplay(tournament.startDate)}</span>
              </span>
            )}

            {tournament.bracketFormat && (
              <span 
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#141A29] border border-[#232D44] text-xs font-mono font-medium text-slate-300"
                style={{
                  clipPath: "polygon(6px 0, 100% 0, calc(100% - 6px) 100%, 0 100%)",
                }}
              >
                <span className="text-primary-brand font-bold">•</span>
                <span>{tournament.bracketFormat}</span>
              </span>
            )}

            {tournament.teamQuota && (
              <span 
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#141A29] border border-[#232D44] text-xs font-mono font-medium text-slate-300"
                style={{
                  clipPath: "polygon(6px 0, 100% 0, calc(100% - 6px) 100%, 0 100%)",
                }}
              >
                <span className="text-primary-brand font-bold">•</span>
                <span>Max {tournament.teamQuota} Squads</span>
              </span>
            )}

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
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => onSelect(tournament, "overview")}
              className="h-10 px-4 rounded-xl bg-[#141A29] hover:bg-[#1E273D] border border-[#232D44] hover:border-amber-500/50 text-slate-200 hover:text-amber-300 text-xs font-display font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0 shadow-md group/rules"
              title="View tournament rules, schedule and overview"
            >
              <ShieldIcon className="w-3.5 h-3.5 text-amber-400 group-hover/rules:scale-110 transition-transform" />
              <span>Rules & Protocols</span>
            </button>
          </div>

          <div className="flex items-center gap-3 flex-wrap w-full sm:w-auto justify-end">
            {!isCompleted && isApproved && (
              <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-mono text-[11px] font-bold tracking-wide shadow-sm shrink-0">
                <CheckCircleIcon className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>SQUAD SANCTIONED</span>
              </div>
            )}

            {!isCompleted && isPending && (
              <div className="flex items-center gap-2.5 flex-wrap">
                {showUndoConfirm ? (
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-rose-950/50 border border-rose-500/40 text-rose-300 font-mono text-[11px] font-medium shadow-sm animate-fade-in">
                    <AlertTriangleIcon className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                    <span>Withdraw application?</span>
                    <button
                      type="button"
                      disabled={isApplying}
                      onClick={() => {
                        setShowUndoConfirm(false);
                        if (onWithdraw) onWithdraw(tournament);
                      }}
                      className="px-2.5 py-0.5 bg-rose-600 hover:bg-rose-500 text-white text-[10px] font-bold uppercase rounded transition-colors cursor-pointer"
                    >
                      {isApplying ? "..." : "Yes"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowUndoConfirm(false)}
                      className="px-2 py-0.5 bg-[#141A29] hover:bg-[#1E293B] text-slate-300 hover:text-white text-[10px] font-bold uppercase rounded border border-[#232D44] transition-colors cursor-pointer"
                    >
                      No
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2.5">
                    {/* Minimalist Frosted Status Pill */}
                    <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 font-mono text-[11px] font-bold tracking-wide shadow-sm">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400" />
                      </span>
                      <span>APPLICATION PENDING</span>
                    </div>

                    {/* Subtle Withdraw Link */}
                    {onWithdraw && (
                      <button
                        type="button"
                        disabled={isApplying}
                        onClick={() => setShowUndoConfirm(true)}
                        className="px-2.5 py-2 text-[11px] font-mono font-bold text-slate-400 hover:text-rose-400 hover:bg-rose-950/20 rounded-lg transition-all cursor-pointer flex items-center gap-1.5"
                        title="Withdraw squad application"
                      >
                        <XCircleIcon className="w-3.5 h-3.5" />
                        <span>Withdraw</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {!isCompleted && !userApplied && onApply && (
              <button
                type="button"
                disabled={isApplying}
                onClick={() => onApply(tournament)}
                className="h-10 px-5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-display text-xs font-black uppercase tracking-wider transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/35 active:scale-95 group/apply shrink-0"
              >
                {isApplying ? (
                  <>
                    <ClockIcon className="w-3.5 h-3.5 text-black animate-spin" />
                    <span>Registering...</span>
                  </>
                ) : (
                  <>
                    <PlusIcon className="w-4 h-4 text-black group-hover/apply:scale-110 transition-transform font-bold" />
                    <span>Apply / Register Squad</span>
                  </>
                )}
              </button>
            )}

            {/* View Bracket & Details Button */}
            <button
              type="button"
              onClick={() => onSelect(tournament, "bracket")}
              className="h-10 px-5 rounded-xl game-theme-btn text-xs font-display font-black uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 cursor-pointer shrink-0 active:scale-95 transition-all group/btn"
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
