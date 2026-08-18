"use client";

import React, { useState } from "react";
import { getGameInfo } from "@/lib/games";
import { ScrimOffer } from "@/types";

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
    ? [{ teamId: scrim.opponentTeamId || "op-id", teamName: scrim.opponentTeamName }]
    : [{ teamId: "op-default", teamName: "Challenger Squad" }];

  return (
    <div
      className={`p-5 rounded-2xl bg-[#0C101A]/95 border transition-all duration-300 shadow-2xl backdrop-blur-md relative overflow-hidden flex flex-col justify-between group ${
        isBooked
          ? "border-emerald-500/40 bg-gradient-to-b from-emerald-950/20 via-[#0C101A] to-[#0C101A]"
          : isPending
          ? "border-amber-500/30 bg-[#0C101A]"
          : isCancelled
          ? "border-rose-500/30 bg-[#140D0F]/90 opacity-80"
          : "border-[#1E273A] hover:border-primary-brand/40 hover:bg-[#101524]"
      }`}
    >
      {/* Top Accent Lines */}
      {isBooked && (
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-500/80 via-teal-400/60 to-emerald-500/80" />
      )}
      {isPending && (
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-500/80 via-yellow-400/60 to-amber-500/80" />
      )}
      {!isBooked && !isPending && !isCancelled && (
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary-brand/40 via-accent/30 to-primary-brand/40 opacity-0 group-hover:opacity-100 transition-opacity" />
      )}

      <div className="space-y-4">
        {/* Card Header Row */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3.5 min-w-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={game.image}
              alt={game.name}
              className="w-11 h-11 rounded-xl object-cover ring-1 ring-white/10 shrink-0 shadow-md"
            />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400 truncate">
                  {scrim.universityName || "UNIVERSITY"}
                </span>
                {isHost && (
                  <span className="text-[9px] font-sans font-extrabold uppercase px-1.5 py-0.2 rounded bg-primary-brand/20 text-primary-brand border border-primary-brand/30 shrink-0">
                    HOST SQUAD
                  </span>
                )}
              </div>
              <h3 className="font-display text-base sm:text-lg font-bold uppercase tracking-wide text-foreground truncate">
                {scrim.hostTeamName}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* Status Badge */}
            {isBooked ? (
              <span className="inline-flex items-center gap-1.5 text-[10px] font-sans font-extrabold uppercase px-2.5 py-1 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-500/40 shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                BOOKED
              </span>
            ) : isPending ? (
              isHost || isOpponent ? (
                <span className="inline-flex items-center gap-1.5 text-[10px] font-sans font-extrabold uppercase px-2.5 py-1 rounded-full bg-amber-950/80 text-amber-400 border border-amber-500/40 shadow-sm">
                  ⏳ PENDING
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-[10px] font-sans font-extrabold uppercase px-2.5 py-1 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-500/40">
                  🔒 BOOKED
                </span>
              )
            ) : isCancelled ? (
              <span className="text-[10px] font-sans font-extrabold uppercase px-2.5 py-1 rounded-full bg-rose-950/80 text-rose-400 border border-rose-500/40">
                ✕ CANCELLED
              </span>
            ) : (
              <span className="text-[10px] font-sans font-extrabold uppercase px-2.5 py-1 rounded-full bg-blue-950/80 text-blue-400 border border-blue-500/40 shadow-sm">
                ⚡ OPEN SCRIM
              </span>
            )}

            {/* Game Badge */}
            <span className="text-[10px] font-mono font-extrabold uppercase px-2 py-1 rounded-full bg-[#141926] text-slate-300 border border-[#232B3E]">
              {game.shortName}
            </span>

            {/* Top-Right Delete X Button */}
            {isHost && onDelete && (
              <button
                onClick={() => setDeleteConfirmOpen(true)}
                aria-label="Delete Scrim"
                className="w-6 h-6 rounded-md bg-[#161C2C] hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 flex items-center justify-center text-xs font-bold transition-all cursor-pointer border border-[#242E46] hover:border-rose-500/40 ml-0.5"
                title="Remove/Delete this scrim"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Info Grid Box */}
        <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-[#080B12] border border-[#181F30] text-center">
          <div>
            <span className="text-[9px] font-sans font-bold text-slate-500 uppercase tracking-widest block">Format</span>
            <span className="text-xs font-mono font-bold text-foreground">{scrim.format}</span>
          </div>
          <div>
            <span className="text-[9px] font-sans font-bold text-slate-500 uppercase tracking-widest block">Rank Tier</span>
            <span className="text-xs font-mono font-bold text-foreground">{scrim.rankRange}</span>
          </div>
          <div>
            <span className="text-[9px] font-sans font-bold text-slate-500 uppercase tracking-widest block">Map / Time</span>
            <span className="text-xs font-mono font-bold text-foreground truncate block">
              {scrim.mapPreference ? `${scrim.mapPreference} · ` : ""}
              {new Date(scrim.scheduledAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>
        </div>

        {/* Notes */}
        {scrim.notes && (
          <p className="text-xs font-sans text-slate-300 bg-[#0A0D15] p-2.5 rounded-lg border border-[#161D2E] italic">
            &quot;{scrim.notes}&quot;
          </p>
        )}
      </div>

      {/* Action Bottom Area */}
      <div className="pt-4 mt-2 border-t border-[#161D2E]">
        {isCancelled ? (
          <div className="w-full flex items-center justify-between p-2.5 rounded-xl bg-rose-950/30 border border-rose-500/30 text-rose-300 text-xs font-sans font-medium">
            <span>✕ Scrim offer cancelled by host</span>
            {isHost && (
              <button
                onClick={() => setDeleteConfirmOpen(true)}
                className="text-[11px] hover:underline font-bold text-rose-400 cursor-pointer"
              >
                Delete
              </button>
            )}
          </div>
        ) : isPending ? (
          isHost ? (
            <div className="w-full p-3 rounded-xl bg-[#121624] border border-[#222B40] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm">⏳</span>
                  <div>
                    <span className="text-[11px] font-sans font-bold uppercase tracking-wider block text-amber-400">
                      INCOMING SCRIM REQUESTS ({pendingList.length})
                    </span>
                    <span className="text-[10px] font-sans text-slate-400">
                      Select a team to accept
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto pr-0.5">
                {pendingList.map((req) => (
                  <div
                    key={req.teamId}
                    className="p-2.5 rounded-lg bg-[#0A0D15] border border-[#1E2538] flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <span className="text-xs font-sans font-bold text-foreground block truncate">
                        {req.teamName}
                      </span>
                      {req.universityName && (
                        <span className="text-[10px] font-sans text-slate-400 block truncate">
                          {req.universityName}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => onDeclineRequest ? onDeclineRequest(scrim.id, req.teamId) : onCancel && onCancel(scrim.id)}
                        className="h-7 px-2.5 rounded-lg bg-[#161C2C] hover:bg-[#20283D] text-slate-400 hover:text-rose-400 border border-[#263048] font-sans text-[10px] font-bold uppercase transition-all cursor-pointer"
                      >
                        ✕ Decline
                      </button>
                      <button
                        onClick={() => onConfirmBooking && onConfirmBooking(scrim.id, req.teamId)}
                        className="h-7 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-sans text-[10px] font-extrabold uppercase tracking-wider transition-all cursor-pointer shadow-md shadow-emerald-950/50"
                      >
                        ✓ Accept Request
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : isOpponent ? (
            <div className="w-full p-3 rounded-xl bg-[#121624] border-l-4 border-l-amber-500 border border-[#222B40] flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-sm">⌛</span>
                <div>
                  <span className="text-[11px] font-sans font-bold uppercase tracking-wider block text-amber-400">
                    SCRIM REQUEST SENT
                  </span>
                  <span className="text-[11px] font-sans text-slate-400">
                    Sent to {scrim.hostTeamName}. Awaiting Captain Approval.
                  </span>
                </div>
              </div>
              {onCancel && (
                <button
                  onClick={() => onCancel(scrim.id)}
                  className="h-8 px-3 rounded-lg bg-[#161C2C] hover:bg-[#20283D] text-slate-400 hover:text-rose-400 border border-[#263048] font-sans text-[11px] font-semibold uppercase tracking-wider transition-all cursor-pointer shrink-0"
                >
                  Cancel Request
                </button>
              )}
            </div>
          ) : (
            <button
              onClick={() => onAccept(scrim.id)}
              className="w-full h-10 rounded-xl bg-gradient-to-r from-primary-brand via-rose-600 to-[#D02436] hover:brightness-110 text-white font-sans text-xs font-bold uppercase tracking-wider transition-all active:scale-[0.98] cursor-pointer shadow-lg shadow-primary-brand/30 flex items-center justify-center gap-2"
            >
              <span>⚔️</span>
              <span>Request Scrim Match</span>
            </button>
          )
        ) : isBooked ? (
          isHost || isChosenOpponent ? (
            <div className="w-full p-3.5 rounded-xl bg-emerald-950/30 border-l-4 border-l-emerald-500 border border-emerald-500/30 flex flex-col gap-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="text-lg shrink-0">📅</span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-sans font-bold uppercase tracking-wider block text-emerald-400">
                        MATCH BOOKED & VERIFIED!
                      </span>
                    </div>
                    <span className="text-xs font-sans font-semibold text-foreground block truncate">
                      {isHost
                        ? `Opponent: ${scrim.opponentTeamName || "Opponent Squad"}`
                        : `Host: ${scrim.hostTeamName}`}
                    </span>
                    <span className="text-[10px] font-sans text-slate-400 block mt-0.5 truncate">
                      Scheduled: {new Date(scrim.scheduledAt).toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" })} at {new Date(scrim.scheduledAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                </div>
                {isHost && onCancel && (
                  <button
                    onClick={() => onCancel(scrim.id)}
                    className="h-8 px-3 rounded-lg bg-emerald-900/40 hover:bg-emerald-900/80 text-slate-300 hover:text-rose-400 border border-emerald-500/40 font-sans text-[11px] font-semibold uppercase tracking-wider transition-all cursor-pointer shrink-0"
                    title="Cancel booking and re-open scrim offer"
                  >
                    Unbook
                  </button>
                )}
              </div>

              <button
                onClick={() => onOpenWarRoom && onOpenWarRoom(scrim)}
                className="w-full h-10 rounded-xl bg-gradient-to-r from-primary-brand via-rose-600 to-[#D02436] hover:brightness-110 text-white font-sans text-xs font-bold uppercase tracking-wider transition-all active:scale-[0.98] cursor-pointer shadow-lg shadow-primary-brand/40 flex items-center justify-center gap-2"
              >
                <span>🔥</span>
                <span>Enter Scrim War Room</span>
              </button>
            </div>
          ) : (
            <div className="w-full p-3 rounded-xl bg-[#0A0D15] border border-[#1C2336] flex items-center justify-between gap-3 text-xs font-sans">
              <div className="flex items-center gap-2 text-slate-400">
                <span>🔒</span>
                <span className="font-bold uppercase tracking-wider text-slate-300">
                  BOOKED BY ANOTHER TEAM
                </span>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-500/40 text-[10px] font-bold uppercase">
                MATCH BOOKED
              </span>
            </div>
          )
        ) : isHost ? (
          <div className="w-full flex items-center justify-between gap-3 py-1">
            <span className="text-xs font-sans text-slate-400 italic">
              ⚡ Live on Scrims Board for collegiate challengers
            </span>
          </div>
        ) : (
          <button
            onClick={() => onAccept(scrim.id)}
            className="w-full h-10 rounded-xl bg-gradient-to-r from-primary-brand via-rose-600 to-[#D02436] hover:brightness-110 text-white font-sans text-xs font-bold uppercase tracking-wider transition-all active:scale-[0.98] cursor-pointer shadow-lg shadow-primary-brand/30 flex items-center justify-center gap-2"
          >
            <span>⚔️</span>
            <span>Request Scrim Match</span>
          </button>
        )}
      </div>

      {/* Delete Confirmation Pop-Up Modal */}
      {deleteConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-[#0C101A] border border-[#222B40] rounded-2xl p-6 shadow-2xl space-y-4 text-left">
            <div className="flex items-center gap-3 border-b border-[#1E273A] pb-3">
              <div className="w-9 h-9 rounded-full bg-rose-950/60 text-rose-400 flex items-center justify-center text-base font-bold border border-rose-500/30">
                🗑️
              </div>
              <div>
                <h3 className="font-display text-base font-bold uppercase text-foreground">
                  Remove Scrim Offer?
                </h3>
                <span className="text-[11px] font-sans text-slate-400">
                  Permanently delete this practice offer
                </span>
              </div>
            </div>

            <p className="font-sans text-xs text-slate-300 leading-relaxed">
              Are you sure you want to delete this scrim offer? This action will permanently remove the post from the inter-university board.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirmOpen(false)}
                className="h-9 px-4 rounded-xl bg-[#161C2C] hover:bg-[#20283D] text-slate-300 font-sans text-xs font-bold uppercase tracking-wider transition-all cursor-pointer border border-[#263048]"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setDeleteConfirmOpen(false);
                  if (onDelete) onDelete(scrim.id);
                }}
                className="h-9 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-sans text-xs font-bold uppercase tracking-wider transition-all active:scale-[0.98] cursor-pointer shadow-lg shadow-rose-950/50"
              >
                Delete Scrim
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

