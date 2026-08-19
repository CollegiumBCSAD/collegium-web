"use client";

import React, { useState } from "react";
import { getGameInfo } from "@/lib/games";
import { ScrimOffer } from "@/types";
import {
  SwordsIcon,
  FlameIcon,
  ClockIcon,
  LockIcon,
  TrashIcon,
  ZapIcon,
} from "@/components/ui/Icons";

interface ScrimCardProps {
  scrim: ScrimOffer;
  onAccept: (id: string) => void;
  onConfirmBooking?: (id: string, selectedOpponentId?: string) => void;
  onDeclineRequest?: (id: string, opponentId?: string) => void;
  onCancel?: (id: string) => void;
  onDelete?: (id: string) => void;
  onOpenWarRoom?: (scrim: ScrimOffer) => void;
  isHost?: boolean;
  isOpponent?: boolean;
  isChosenOpponent?: boolean;
}

export default function ScrimCard({
  scrim,
  onAccept,
  onConfirmBooking,
  onDeclineRequest,
  onCancel,
  onDelete,
  onOpenWarRoom,
  isHost,
  isOpponent,
  isChosenOpponent,
}: ScrimCardProps) {
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const game = getGameInfo(scrim.gameTitle);

  const isBooked = scrim.status === "CONFIRMED";
  const isPending = scrim.status === "PENDING";
  const isCancelled = scrim.status === "CANCELLED";

  const pendingList = scrim.pendingRequests && scrim.pendingRequests.length > 0
    ? scrim.pendingRequests
    : scrim.opponentTeamName
    ? [{ teamId: scrim.opponentTeamId || "op-id", teamName: scrim.opponentTeamName, universityName: undefined }]
    : [{ teamId: "op-default", teamName: "Challenger Squad", universityName: undefined }];

  const formattedTime = new Date(scrim.scheduledAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <div
      className={`p-5 sm:p-6 rounded-3xl bg-gradient-to-b from-[#101628]/95 via-[#0B0E1B]/95 to-[#070A14]/98 border transition-all duration-300 shadow-2xl relative flex flex-col justify-start h-auto overflow-hidden group hover:-translate-y-1 ${
        isCancelled
          ? "border-rose-900/30 opacity-70"
          : "border-[#1E2C48]/90 hover:border-slate-400/50 hover:shadow-[0_15px_40px_rgba(0,0,0,0.5)]"
      }`}
    >
      {/* Background Watermark Image Overlay for Rich Depth */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={game.image}
        alt=""
        className="absolute -right-8 -bottom-8 w-48 h-48 object-cover opacity-[0.06] grayscale group-hover:grayscale-0 group-hover:opacity-[0.12] group-hover:scale-110 transition-all duration-500 pointer-events-none rounded-full blur-[1px]"
      />

      {/* Top Corner Radial Accent Glow */}
      <div
        className="absolute top-0 right-0 w-44 h-44 pointer-events-none opacity-40 group-hover:opacity-75 transition-opacity duration-500"
        style={{
          background: `radial-gradient(circle at top right, ${game.accentColor}25 0%, transparent 70%)`,
        }}
      />

      {/* Top Glowing Game Accent Line */}
      <div
        className="absolute top-0 left-0 right-0 h-[2.5px] transition-all duration-300"
        style={{
          backgroundColor: game.accentColor,
          boxShadow: `0 0 12px ${game.accentColor}88`,
        }}
      />

      <div className="space-y-4 relative z-10">
        {/* Header Row: Game Logo, Team Name, University & Badges */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3.5 min-w-0">
            <div
              className="relative w-11 h-11 rounded-2xl overflow-hidden shrink-0 border border-[#2B3B5B] shadow-lg bg-[#0F1422] group-hover:border-white/40 transition-colors"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={game.image}
                alt={game.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-display text-base sm:text-lg font-black uppercase text-white truncate tracking-wide drop-shadow-sm">
                  {scrim.hostTeamName}
                </h3>
                {isHost && (
                  <span className="text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-[#162035] text-slate-300 border border-[#2B3C5E] shrink-0 shadow-sm">
                    YOU (HOST)
                  </span>
                )}
              </div>
              <span className="text-xs font-sans font-semibold text-slate-400 truncate block mt-0.5">
                {scrim.universityName || "Collegiate Varsity"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Status Pill */}
            {isBooked ? (
              <span className="inline-flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase px-3 py-1 rounded-full bg-[#0D1B17] text-emerald-400 border border-emerald-500/30 shadow-md">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                BOOKED
              </span>
            ) : isPending ? (
              <span className="inline-flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase px-3 py-1 rounded-full bg-[#1B160E] text-amber-400 border border-amber-500/30 shadow-md">
                <ClockIcon className="w-3 h-3 text-amber-400" />
                PENDING
              </span>
            ) : isCancelled ? (
              <span className="text-[10px] font-mono font-bold uppercase px-3 py-1 rounded-full bg-rose-950/40 text-rose-400 border border-rose-900/40">
                CANCELLED
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase px-3 py-1 rounded-full bg-[#131A2B] text-slate-200 border border-[#243350] shadow-md">
                <ZapIcon className="w-3 h-3 text-amber-400" />
                OPEN OFFER
              </span>
            )}

            {/* Game Tag */}
            <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-1 rounded-full bg-[#131A2B] text-slate-200 border border-[#243350] shadow-md">
              {game.shortName}
            </span>

            {/* Delete Icon */}
            {isHost && onDelete && (
              <button
                onClick={() => setDeleteConfirmOpen(true)}
                className="w-8 h-8 rounded-xl bg-[#131A2B] hover:bg-rose-950/50 text-slate-400 hover:text-rose-400 flex items-center justify-center text-xs transition-all border border-[#243350] hover:border-rose-500/40 cursor-pointer shadow-md"
                title="Delete Scrim Offer"
              >
                <TrashIcon className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Versus Banner for Booked/Pending Matchups */}
        {(isBooked || isPending) && (
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-[#080C16]/90 via-[#0E1526]/90 to-[#080C16]/90 border border-[#1F2C46] flex items-center justify-between gap-3 shadow-inner backdrop-blur-md">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-[#162035] border border-[#2B3C5E] text-slate-200 flex items-center justify-center font-display text-xs font-black shrink-0 shadow-sm">
                {scrim.hostTeamName.slice(0, 3).toUpperCase()}
              </div>
              <div className="min-w-0">
                <span className="text-[9px] font-mono text-slate-400 block uppercase">HOST</span>
                <span className="text-xs font-sans font-bold text-white truncate block">{scrim.hostTeamName}</span>
              </div>
            </div>

            <div className="px-2.5 py-1 rounded-lg bg-[#131A2B] border border-[#243350] text-[10px] font-mono font-black text-slate-300 shrink-0 shadow-sm">
              VS
            </div>

            <div className="flex items-center gap-2.5 min-w-0 text-right justify-end">
              <div className="min-w-0">
                <span className="text-[9px] font-mono text-slate-400 block uppercase">OPPONENT</span>
                <span className="text-xs font-sans font-bold text-slate-200 truncate block">
                  {scrim.opponentTeamName || "TBD Challenger"}
                </span>
              </div>
              <div className="w-7 h-7 rounded-lg bg-[#162035] border border-[#2B3C5E] text-slate-200 flex items-center justify-center font-display text-xs font-black shrink-0 shadow-sm">
                {(scrim.opponentTeamName || "TBD").slice(0, 3).toUpperCase()}
              </div>
            </div>
          </div>
        )}

        {/* Spec Grid Pills with Recessed Metallic Glass Look */}
        <div className="grid grid-cols-3 gap-2.5 p-3.5 rounded-2xl bg-[#060912]/90 border border-[#19243C] text-xs font-mono shadow-inner backdrop-blur-md">
          <div className="flex flex-col">
            <span className="text-[9px] text-slate-400 uppercase tracking-wider font-semibold">FORMAT</span>
            <span className="font-bold text-slate-100 text-xs mt-0.5">{scrim.format}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] text-slate-400 uppercase tracking-wider font-semibold">TARGET TIER</span>
            <span className="font-bold text-slate-100 text-xs mt-0.5">{scrim.rankRange}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] text-slate-400 uppercase tracking-wider font-semibold">MAP & SCHEDULE</span>
            <span className="font-bold text-slate-100 text-xs mt-0.5 truncate">
              {scrim.mapPreference ? `${scrim.mapPreference} @ ` : ""}{formattedTime}
            </span>
          </div>
        </div>

        {/* Notes */}
        {scrim.notes && (
          <p className="text-xs font-sans text-slate-400 italic px-1">
            &quot;{scrim.notes}&quot;
          </p>
        )}
      </div>

      {/* Action Footer */}
      <div className="pt-4 mt-4 border-t border-[#1B2740] relative z-10">
        {isCancelled ? (
          <div className="text-xs font-sans text-rose-400 font-semibold flex items-center justify-between">
            <span>Scrim offer cancelled</span>
            {isHost && (
              <button onClick={() => setDeleteConfirmOpen(true)} className="hover:underline font-bold text-rose-400 cursor-pointer">
                Delete
              </button>
            )}
          </div>
        ) : isPending ? (
          isHost ? (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs font-mono font-bold text-amber-400 uppercase">
                <span className="flex items-center gap-1.5">
                  <ClockIcon className="w-3.5 h-3.5 text-amber-400" />
                  INCOMING REQUESTS ({pendingList.length})
                </span>
              </div>
              <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                {pendingList.map((req) => (
                  <div key={req.teamId} className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-[#060912] border border-[#18233A] shadow-inner">
                    <div className="min-w-0">
                      <span className="text-xs font-sans font-bold text-white block truncate">{req.teamName}</span>
                      {req.universityName && (
                        <span className="text-[10px] font-sans text-slate-400 block truncate">{req.universityName}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => onDeclineRequest ? onDeclineRequest(scrim.id, req.teamId) : onCancel && onCancel(scrim.id)}
                        className="px-3 py-1.5 rounded-xl bg-[#131A2B] hover:bg-[#1C263C] text-slate-300 hover:text-rose-400 text-[10px] font-mono font-bold uppercase transition-all border border-[#243350] cursor-pointer"
                      >
                        Decline
                      </button>
                      <button
                        onClick={() => onConfirmBooking && onConfirmBooking(scrim.id, req.teamId)}
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-mono font-black uppercase tracking-wider transition-all shadow-md cursor-pointer"
                      >
                        Accept
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : isOpponent ? (
            <div className="flex items-center justify-between gap-3 text-xs font-sans">
              <span className="text-amber-400 font-bold flex items-center gap-1.5">
                <ClockIcon className="w-3.5 h-3.5" />
                Request Sent — Awaiting Host Captain
              </span>
              {onCancel && (
                <button
                  onClick={() => onCancel(scrim.id)}
                  className="px-3 py-1.5 rounded-xl bg-[#131A2B] hover:bg-rose-950/40 text-slate-300 hover:text-rose-400 text-[10px] font-mono font-bold uppercase border border-[#243350] cursor-pointer"
                >
                  Cancel
                </button>
              )}
            </div>
          ) : (
            <button
              onClick={() => onAccept(scrim.id)}
              className="w-full h-11 game-theme-btn font-display text-xs font-black uppercase tracking-wider transition-all active:scale-[0.98] shadow-xl flex items-center justify-center gap-2 cursor-pointer"
            >
              <SwordsIcon className="w-4 h-4" />
              <span>Request Scrim Match</span>
            </button>
          )
        ) : isBooked ? (
          isHost || isChosenOpponent ? (
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <span className="text-[10px] font-mono font-bold text-emerald-400 block uppercase">MATCH CONFIRMED</span>
                <span className="text-xs font-sans font-bold text-white truncate block">
                  VS {isHost ? (scrim.opponentTeamName || "Opponent Squad") : scrim.hostTeamName}
                </span>
              </div>
              <button
                onClick={() => onOpenWarRoom && onOpenWarRoom(scrim)}
                className="h-11 px-6 game-theme-btn font-display text-xs font-black uppercase tracking-wider transition-all shrink-0 shadow-xl flex items-center gap-2 cursor-pointer"
              >
                <FlameIcon className="w-4 h-4 text-white" />
                <span>Enter War Room →</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between text-xs font-sans text-slate-400">
              <span className="flex items-center gap-1.5">
                <LockIcon className="w-3.5 h-3.5 text-slate-400" />
                Booked by another varsity squad
              </span>
              <span className="text-[10px] font-mono font-bold uppercase text-emerald-400">CONFIRMED</span>
            </div>
          )
        ) : isHost ? (
          <div className="text-xs font-sans text-slate-400 flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-slate-400">
              <ZapIcon className="w-3.5 h-3.5 text-amber-400" />
              Open offer visible to collegiate varsity squads
            </span>
          </div>
        ) : (
          <button
            onClick={() => onAccept(scrim.id)}
            className="w-full h-11 game-theme-btn font-display text-xs font-black uppercase tracking-wider transition-all active:scale-[0.98] shadow-xl flex items-center justify-center gap-2 cursor-pointer"
          >
            <SwordsIcon className="w-4 h-4" />
            <span>Request Scrim Match</span>
          </button>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-[#0E131F] border border-[#232D44] rounded-2xl p-6 shadow-2xl space-y-4 text-left">
            <div className="flex items-center gap-3 border-b border-[#1C2538] pb-3">
              <div className="w-8 h-8 rounded-full bg-rose-950/60 text-rose-400 flex items-center justify-center border border-rose-500/30">
                <TrashIcon className="w-4 h-4" />
              </div>
              <h3 className="font-display text-base font-bold uppercase text-white">
                Delete Scrim Offer?
              </h3>
            </div>
            <p className="font-sans text-xs text-slate-300 leading-relaxed">
              Are you sure you want to delete this scrimmage post?
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirmOpen(false)}
                className="h-9 px-4 rounded-xl bg-[#141A29] text-slate-300 font-sans text-xs font-bold uppercase border border-[#232D44] cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setDeleteConfirmOpen(false);
                  if (onDelete) onDelete(scrim.id);
                }}
                className="h-9 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-sans text-xs font-bold uppercase shadow-lg cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
