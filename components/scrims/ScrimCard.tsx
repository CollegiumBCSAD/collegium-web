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
  CheckCircleIcon,
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

  const scheduleDateObj = new Date(scrim.scheduledAt);
  const isValidDate = !isNaN(scheduleDateObj.getTime());
  const formattedTime = isValidDate
    ? scheduleDateObj.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : "TBD";
  const formattedDate = isValidDate
    ? scheduleDateObj.toLocaleDateString([], { month: "short", day: "numeric" })
    : "";
  const displaySchedule = formattedDate
    ? `${scrim.mapPreference ? `${scrim.mapPreference} @ ` : ""}${formattedDate}, ${formattedTime}`
    : `${scrim.mapPreference ? `${scrim.mapPreference} @ ` : ""}${formattedTime}`;

  return (
    <div
      className={`p-6 bg-gradient-to-b from-[#0A0D18] via-[#080B14] to-[#05070E] border shadow-2xl relative flex flex-col justify-between overflow-hidden transition-all duration-300 ${
        isCancelled
          ? "border-rose-950/40 opacity-70"
          : "border-[#1E293B] hover:border-slate-500/40"
      }`}
      style={{
        clipPath: "polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px))",
      }}
    >
      {/* Dynamic Game Background Aura Accent */}
      <div
        className="absolute top-0 right-0 w-32 h-32 pointer-events-none opacity-20"
        style={{
          background: `radial-gradient(circle at top right, ${game.accentColor} 0%, transparent 70%)`,
        }}
      />

      {/* Top Game Color Accent Border Indicator */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px]"
        style={{
          backgroundColor: game.accentColor,
        }}
      />

      <div className="space-y-4">
        {/* Header: Team & Status Telemetry */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3.5 min-w-0">
            {/* Game Badge Logo */}
            <div
              className="w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-[#1E293B] bg-[#0E131F]"
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
                <h3 className="font-display text-sm sm:text-base font-black uppercase text-white truncate tracking-wide">
                  {scrim.hostTeamName}
                </h3>
                {isHost && (
                  <span className="text-[8px] font-mono font-bold uppercase px-1.5 py-0.2 bg-primary-brand/10 text-primary-brand border border-primary-brand/30 shrink-0">
                    HOST
                  </span>
                )}
              </div>
              <span className="text-[11px] font-sans text-slate-400 truncate block mt-0.5">
                {scrim.universityName || "Collegiate Varsity"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Status Pills */}
            {isBooked ? (
              <span className="inline-flex items-center gap-1 text-[9px] font-mono font-bold uppercase px-2.5 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                BOOKED
              </span>
            ) : isPending ? (
              <span className="inline-flex items-center gap-1 text-[9px] font-mono font-bold uppercase px-2.5 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/30">
                <ClockIcon className="w-3 h-3 text-amber-400" />
                PENDING
              </span>
            ) : isCancelled ? (
              <span className="text-[9px] font-mono font-bold uppercase px-2.5 py-0.5 bg-rose-950/40 text-rose-400 border border-rose-900/40">
                CANCELLED
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[9px] font-mono font-bold uppercase px-2.5 py-0.5 bg-[#141A29] text-slate-200 border border-[#232D44]">
                <ZapIcon className="w-3 h-3 text-amber-400" />
                OPEN OFFER
              </span>
            )}

            {/* Trash Bin for Host */}
            {isHost && onDelete && (
              <button
                type="button"
                onClick={() => setDeleteConfirmOpen(true)}
                className="w-7 h-7 bg-[#141A29] border border-[#232D44] hover:border-rose-500/50 text-slate-400 hover:text-rose-400 flex items-center justify-center transition-colors cursor-pointer rounded"
                title="Delete Scrim Offer"
              >
                <TrashIcon className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* In-Card Delete Confirmation Banner */}
        {deleteConfirmOpen && (
          <div className="p-3 bg-rose-950/95 border border-rose-500/50 rounded-xl space-y-2 text-left animate-fade-in shadow-xl">
            <span className="text-xs font-mono font-bold text-rose-300 flex items-center gap-1.5">
              <TrashIcon className="w-3.5 h-3.5 text-rose-400 shrink-0" />
              Are you sure you want to delete this scrimmage?
            </span>
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setDeleteConfirmOpen(false);
                  if (onDelete) onDelete(scrim.id);
                }}
                className="flex-1 h-8 bg-rose-600 hover:bg-rose-500 text-white font-mono text-xs font-black uppercase rounded-lg shadow-md cursor-pointer transition-colors"
              >
                Yes, Delete
              </button>
              <button
                type="button"
                onClick={() => setDeleteConfirmOpen(false)}
                className="flex-1 h-8 bg-[#141A29] hover:bg-[#1E293B] text-slate-300 font-mono text-xs font-bold uppercase rounded-lg border border-[#232D44] cursor-pointer transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Versus Duel Split HUD */}
        {(isBooked || isPending) && (
          <div 
            className="p-3.5 bg-[#060912] border border-[#182338] flex items-center justify-between gap-3 shadow-inner"
            style={{
              clipPath: "polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))",
            }}
          >
            <div className="flex items-center gap-2 min-w-0">
              <div 
                className="w-7 h-7 bg-[#141A29] border border-[#232D44] text-slate-200 flex items-center justify-center font-display text-[10px] font-black shrink-0"
                style={{
                  clipPath: "polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)",
                }}
              >
                {scrim.hostTeamName.slice(0, 3).toUpperCase()}
              </div>
              <div className="min-w-0">
                <span className="text-[8px] font-mono text-slate-500 block uppercase">HOST</span>
                <span className="text-xs font-sans font-bold text-white truncate block">{scrim.hostTeamName}</span>
              </div>
            </div>

            <div 
              className="px-2 py-0.5 bg-[#141A29] border border-[#232D44] text-[9px] font-mono font-black text-slate-400 shrink-0"
              style={{
                clipPath: "polygon(3px 0, 100% 0, calc(100% - 3px) 100%, 0 100%)",
              }}
            >
              VS
            </div>

            <div className="flex items-center gap-2 min-w-0 text-right justify-end">
              <div className="min-w-0">
                <span className="text-[8px] font-mono text-slate-500 block uppercase">CHALLENGER</span>
                <span className="text-xs font-sans font-bold text-white truncate block">
                  {scrim.opponentTeamName || (isBooked ? "Varsity Opponent" : "Pending Selection")}
                </span>
              </div>
              <div 
                className="w-7 h-7 bg-[#141A29] border border-[#232D44] text-slate-200 flex items-center justify-center font-display text-[10px] font-black shrink-0"
                style={{
                  clipPath: "polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)",
                }}
              >
                {(scrim.opponentTeamName || "OPP").slice(0, 3).toUpperCase()}
              </div>
            </div>
          </div>
        )}

        {/* Specification Dashboard Grid */}
        <div 
          className="grid grid-cols-3 gap-3 p-3.5 bg-[#060912] border border-[#1E293B] text-xs font-mono shadow-inner"
          style={{
            clipPath: "polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))",
          }}
        >
          <div className="flex flex-col">
            <span className="text-[8px] text-slate-400 uppercase tracking-wider font-semibold">FORMAT</span>
            <span className="font-bold text-white text-xs mt-0.5">{scrim.format}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[8px] text-slate-400 uppercase tracking-wider font-semibold">TARGET TIER</span>
            <span className="font-bold text-white text-xs mt-0.5">{scrim.rankRange}</span>
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[8px] text-slate-400 uppercase tracking-wider font-semibold">MAP & SCHEDULE</span>
            <span className="font-bold text-white text-xs mt-0.5 truncate" title={displaySchedule}>
              {displaySchedule}
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
      <div className="pt-4 mt-4 border-t border-[#182338]">
        {isCancelled ? (
          <div className="text-xs font-sans text-rose-400 font-semibold flex items-center justify-between">
            <span>Scrim offer cancelled</span>
            {isHost && (
              <button 
                type="button"
                onClick={() => setDeleteConfirmOpen(true)} 
                className="hover:underline font-bold text-rose-400 cursor-pointer"
              >
                Delete
              </button>
            )}
          </div>
        ) : isPending ? (
          isHost ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-[10px] font-mono font-bold text-amber-400 uppercase">
                <span className="flex items-center gap-1.5">
                  <ClockIcon className="w-3.5 h-3.5 text-amber-400" />
                  INCOMING REQUESTS ({pendingList.length})
                </span>
              </div>
              <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                {pendingList.map((req) => (
                  <div 
                    key={req.teamId} 
                    className="flex items-center justify-between gap-3 p-2.5 bg-[#060912] border border-[#182338] shadow-inner"
                    style={{
                      clipPath: "polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))",
                    }}
                  >
                    <div className="min-w-0">
                      <span className="font-sans text-xs font-bold text-white block truncate">{req.teamName}</span>
                      {req.universityName && (
                        <span className="text-[10px] font-mono text-slate-400 block truncate">{req.universityName}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {onConfirmBooking && (
                        <button
                          type="button"
                          onClick={() => onConfirmBooking(scrim.id, req.teamId)}
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-[10px] font-bold uppercase transition-colors shadow-sm cursor-pointer"
                          style={{
                            clipPath: "polygon(3px 0, 100% 0, calc(100% - 3px) 100%, 0 100%)",
                          }}
                        >
                          Accept
                        </button>
                      )}
                      {onDeclineRequest && (
                        <button
                          type="button"
                          onClick={() => onDeclineRequest(scrim.id, req.teamId)}
                          className="px-2.5 py-1 bg-[#141A29] hover:bg-rose-950/50 text-slate-400 hover:text-rose-300 font-mono text-[10px] font-bold uppercase border border-[#232D44] transition-colors cursor-pointer"
                          style={{
                            clipPath: "polygon(3px 0, 100% 0, calc(100% - 3px) 100%, 0 100%)",
                          }}
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : isOpponent ? (
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-amber-400 flex items-center gap-1.5">
                <ClockIcon className="w-4 h-4 text-amber-400 animate-spin" />
                <span>Request sent. Waiting for Host...</span>
              </span>
              {onCancel && (
                <button
                  type="button"
                  onClick={() => onCancel(scrim.id)}
                  className="text-slate-400 hover:text-rose-400 underline font-semibold text-[11px] cursor-pointer"
                >
                  Withdraw Request
                </button>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-between text-xs font-mono text-slate-400">
              <span className="flex items-center gap-1.5 text-amber-400">
                <ClockIcon className="w-3.5 h-3.5" />
                <span>Pending host review</span>
              </span>
              <button
                type="button"
                onClick={() => onAccept(scrim.id)}
                className="px-3 py-1 bg-[#141A29] hover:bg-[#1E293B] text-slate-200 font-mono text-[10px] font-bold uppercase border border-[#232D44] cursor-pointer"
              >
                Join Queue
              </button>
            </div>
          )
        ) : isBooked ? (
          isHost || isOpponent || isChosenOpponent ? (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="text-xs font-sans text-emerald-400 font-bold flex items-center gap-1.5">
                <CheckCircleIcon className="w-4 h-4 text-emerald-400" />
                <span>Match Confirmed</span>
              </div>
              <div className="flex items-center gap-2">
                {onOpenWarRoom && (
                  <button
                    type="button"
                    onClick={() => onOpenWarRoom(scrim)}
                    className="flex-1 sm:flex-initial h-9 px-5 game-theme-btn font-display text-xs font-black uppercase tracking-wider transition-all active:scale-[0.98] shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                    style={{
                      clipPath: "polygon(6px 0, 100% 0, calc(100% - 6px) 100%, 0 100%)",
                    }}
                  >
                    <SwordsIcon className="w-3.5 h-3.5" />
                    <span>Enter War Room →</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="text-xs font-mono text-slate-400 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <LockIcon className="w-3.5 h-3.5 text-slate-500" />
                Booked by another varsity squad
              </span>
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">
                CONFIRMED
              </span>
            </div>
          )
        ) : isHost ? (
          <div className="text-[10px] font-mono text-slate-400 flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-slate-400">
              <ZapIcon className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              Open offer visible to collegiate varsity squads
            </span>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => onAccept(scrim.id)}
            className="w-full h-10 game-theme-btn font-display text-xs font-black uppercase tracking-wider transition-all active:scale-[0.98] shadow-xl flex items-center justify-center gap-2 cursor-pointer"
            style={{
              clipPath: "polygon(6px 0, 100% 0, calc(100% - 6px) 100%, 0 100%)",
            }}
          >
            <SwordsIcon className="w-4 h-4" />
            <span>Request Scrim Match</span>
          </button>
        )}
      </div>
    </div>
  );
}
