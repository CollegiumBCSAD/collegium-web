"use client";

import React, { useState } from "react";
import { getGameInfo } from "@/lib/games";
import { ScrimOffer } from "@/types";

interface ScrimCardProps {
  scrim: ScrimOffer;
  onAccept: (id: string) => void;
  onConfirmBooking?: (id: string) => void;
  onCancel?: (id: string) => void;
  onDelete?: (id: string) => void;
  isHost?: boolean;
  isOpponent?: boolean;
}

export default function ScrimCard({
  scrim,
  onAccept,
  onConfirmBooking,
  onCancel,
  onDelete,
  isHost,
  isOpponent,
}: ScrimCardProps) {
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const game = getGameInfo(scrim.gameTitle);

  const isBooked = scrim.status === "CONFIRMED";
  const isPending = scrim.status === "PENDING";
  const isCancelled = scrim.status === "CANCELLED";

  return (
    <div
      className={`p-5 rounded-2xl bg-[#11141C] border transition-all duration-200 shadow-xl relative overflow-hidden flex flex-col justify-between ${
        isBooked
          ? "border-[#10B981]/40 bg-gradient-to-b from-[#0F221B]/40 to-[#11141C]"
          : isPending
          ? "border-[#F59E0B]/40 bg-gradient-to-b from-[#221B10]/40 to-[#11141C]"
          : isCancelled
          ? "border-[#EF4444]/30 bg-[#161214] opacity-80"
          : "border-[#1E2433] hover:border-[#323B4E]"
      }`}
    >
      {/* Top Banner Accent Lines */}
      {isBooked && (
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-500/80 via-teal-400/60 to-emerald-500/80" />
      )}
      {isPending && (
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-500/80 via-yellow-400/60 to-amber-500/80" />
      )}

      <div className="space-y-3.5">
        {/* Card Header Row */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={game.image}
              alt={game.name}
              className="w-10 h-10 rounded-xl object-cover ring-1 ring-white/10 shrink-0"
            />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="text-[10px] font-sans font-semibold uppercase tracking-wider text-[#94A3B8] truncate">
                  {scrim.universityName}
                </span>
                {isHost && (
                  <span className="text-[9px] font-sans font-bold uppercase px-1.5 py-0.2 rounded bg-[#1E2536] text-[#94A3B8] border border-[#2D374E] shrink-0">
                    HOST
                  </span>
                )}
              </div>
              <h3 className="font-display text-base font-bold uppercase tracking-wide text-[#F8FAFC] truncate">
                {scrim.hostTeamName}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* Status Badge */}
            {isBooked ? (
              <span className="inline-flex items-center gap-1.5 text-[10px] font-sans font-bold uppercase px-2.5 py-0.5 rounded-full bg-[#12241D] text-[#34D399] border border-[#10B981]/30">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
                BOOKED
              </span>
            ) : isPending ? (
              <span className="inline-flex items-center gap-1.5 text-[10px] font-sans font-bold uppercase px-2.5 py-0.5 rounded-full bg-[#282115] text-[#FBBF24] border border-[#F59E0B]/30">
                ⏳ PENDING
              </span>
            ) : isCancelled ? (
              <span className="text-[10px] font-sans font-bold uppercase px-2.5 py-0.5 rounded-full bg-[#2A181A] text-[#F87171] border border-[#EF4444]/30">
                ✕ CANCELLED
              </span>
            ) : (
              <span className="text-[10px] font-sans font-bold uppercase px-2.5 py-0.5 rounded-full bg-[#161F33] text-[#60A5FA] border border-[#2563EB]/30">
                ⚡ OPEN SCRIM
              </span>
            )}

            {/* Game Badge */}
            <span className="text-[10px] font-sans font-extrabold uppercase px-2 py-0.5 rounded-full bg-[#1A202C] text-[#E2E8F0] border border-[#2D3748]">
              {game.shortName}
            </span>

            {/* Top-Right Delete X Button */}
            {isHost && onDelete && (
              <button
                onClick={() => setDeleteConfirmOpen(true)}
                aria-label="Delete Scrim"
                className="w-6 h-6 rounded-md bg-[#1E2433] hover:bg-[#EF4444]/20 text-[#64748B] hover:text-[#F87171] flex items-center justify-center text-xs font-bold transition-all cursor-pointer border border-[#2A3142] hover:border-[#EF4444]/40 ml-0.5"
                title="Remove/Delete this scrim"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Info Grid Box */}
        <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-[#090C12] border border-[#191D28] text-center">
          <div>
            <span className="text-[9px] font-sans text-[#64748B] uppercase block">Format</span>
            <span className="text-xs font-sans font-bold text-[#E2E8F0]">{scrim.format}</span>
          </div>
          <div>
            <span className="text-[9px] font-sans text-[#64748B] uppercase block">Rank Tier</span>
            <span className="text-xs font-sans font-bold text-[#E2E8F0]">{scrim.rankRange}</span>
          </div>
          <div>
            <span className="text-[9px] font-sans text-[#64748B] uppercase block">Map / Time</span>
            <span className="text-xs font-sans font-bold text-[#E2E8F0] truncate block">
              {scrim.mapPreference ? `${scrim.mapPreference} · ` : ""}
              {new Date(scrim.scheduledAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>
        </div>

        {/* Notes */}
        {scrim.notes && (
          <p className="text-xs font-sans text-[#94A3B8] bg-[#0E1118] p-2.5 rounded-lg border border-[#1A1F2C] italic">
            &quot;{scrim.notes}&quot;
          </p>
        )}
      </div>

      {/* Action / Notification Bottom Area */}
      <div className="pt-3">
        {isCancelled ? (
          <div className="w-full flex items-center justify-between p-2.5 rounded-lg bg-[#24171A] border border-[#EF4444]/30 text-[#F87171] text-xs font-sans font-medium">
            <span>✕ Scrim offer cancelled by host</span>
            {isHost && (
              <button
                onClick={() => setDeleteConfirmOpen(true)}
                className="text-[11px] hover:underline font-bold text-[#F87171] cursor-pointer"
              >
                Delete
              </button>
            )}
          </div>
        ) : isPending ? (
          isHost ? (
            <div className="w-full p-3 rounded-xl bg-[#181C28] border-l-2 border-l-[#F59E0B] border border-[#272E3F] space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm">⏳</span>
                  <div>
                    <span className="text-[11px] font-sans font-bold uppercase tracking-wider block text-[#FBBF24]">
                      INCOMING SCRIM REQUEST
                    </span>
                    <span className="text-xs font-sans font-semibold text-[#E2E8F0]">
                      From: {scrim.opponentTeamName || "Opponent Squad"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#252C3D]">
                {onCancel && (
                  <button
                    onClick={() => onCancel(scrim.id)}
                    className="h-8 px-3 rounded-lg bg-[#1E2330] hover:bg-[#2A3142] text-[#94A3B8] hover:text-[#F87171] border border-[#2B3245] font-sans text-[11px] font-semibold uppercase tracking-wider transition-all cursor-pointer"
                  >
                    ✕ Decline
                  </button>
                )}
                {onConfirmBooking && (
                  <button
                    onClick={() => onConfirmBooking(scrim.id)}
                    className="h-8 px-4 rounded-lg bg-[#10B981] hover:bg-[#059669] text-white font-sans text-[11px] font-bold uppercase tracking-wider transition-all active:scale-[0.98] cursor-pointer shadow-md shadow-emerald-950/40"
                  >
                    ✓ Accept Request
                  </button>
                )}
              </div>
            </div>
          ) : isOpponent ? (
            <div className="w-full p-3 rounded-xl bg-[#181C28] border-l-2 border-l-[#F59E0B] border border-[#272E3F] flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-sm">⌛</span>
                <div>
                  <span className="text-[11px] font-sans font-bold uppercase tracking-wider block text-[#FBBF24]">
                    SCRIM REQUEST SENT
                  </span>
                  <span className="text-[11px] font-sans text-[#94A3B8]">
                    Sent to {scrim.hostTeamName}. Awaiting Captain Approval.
                  </span>
                </div>
              </div>
              {onCancel && (
                <button
                  onClick={() => onCancel(scrim.id)}
                  className="h-8 px-3 rounded-lg bg-[#1E2330] hover:bg-[#2A3142] text-[#94A3B8] hover:text-[#F87171] border border-[#2B3245] font-sans text-[11px] font-semibold uppercase tracking-wider transition-all cursor-pointer shrink-0"
                >
                  Cancel Request
                </button>
              )}
            </div>
          ) : (
            <div className="w-full p-2.5 rounded-lg bg-[#181C28] border border-[#272E3F] text-[#FBBF24] text-xs font-sans font-medium text-center">
              ⏳ Scrim request pending host approval
            </div>
          )
        ) : isBooked ? (
          <div className="w-full p-3 rounded-xl bg-[#111C18] border-l-2 border-l-[#10B981] border border-[#1C2C25] flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="text-lg shrink-0">📅</span>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-sans font-bold uppercase tracking-wider block text-[#34D399]">
                    MATCH BOOKED!
                  </span>
                </div>
                <span className="text-xs font-sans font-semibold text-[#E2E8F0] block truncate">
                  {isHost
                    ? `Opponent: ${scrim.opponentTeamName || "Opponent Squad"}`
                    : `Host: ${scrim.hostTeamName}`}
                </span>
                <span className="text-[10px] font-sans text-[#94A3B8] block mt-0.5 truncate">
                  Scheduled: {new Date(scrim.scheduledAt).toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" })} at {new Date(scrim.scheduledAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            </div>
            {onCancel && (
              <button
                onClick={() => onCancel(scrim.id)}
                className="h-8 px-3 rounded-lg bg-[#1B2621] hover:bg-[#25362E] text-[#94A3B8] hover:text-[#F87171] border border-[#283C32] font-sans text-[11px] font-semibold uppercase tracking-wider transition-all cursor-pointer shrink-0"
                title="Cancel booking and re-open scrim offer"
              >
                Unbook
              </button>
            )}
          </div>
        ) : isHost ? (
          <div className="w-full flex items-center justify-between gap-3 py-1">
            <span className="text-xs font-sans text-[#64748B] italic">
              ⚡ Live on Scrims Board for challengers
            </span>
          </div>
        ) : (
          <button
            onClick={() => onAccept(scrim.id)}
            className="w-full h-10 rounded-lg bg-gradient-to-r from-[#DC2626] to-[#991B1B] hover:from-[#EF4444] hover:to-[#B91C1C] text-white font-sans text-xs font-bold uppercase tracking-wider transition-all active:scale-[0.98] cursor-pointer shadow-md shadow-red-950/40 flex items-center justify-center gap-2"
          >
            <span>⚔️</span>
            <span>Request Scrim</span>
          </button>
        )}
      </div>

      {/* Delete Confirmation Pop-Up Modal */}
      {deleteConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-[#11141C] border border-[#232A3B] rounded-2xl p-6 shadow-2xl space-y-4 text-left">
            <div className="flex items-center gap-3 border-b border-[#232A3B] pb-3">
              <div className="w-9 h-9 rounded-full bg-[#EF4444]/15 text-[#F87171] flex items-center justify-center text-base font-bold">
                🗑️
              </div>
              <div>
                <h3 className="font-display text-base font-bold uppercase text-[#F8FAFC]">
                  Remove/Delete Scrim?
                </h3>
                <span className="text-[11px] font-sans text-[#94A3B8]">
                  Permanently delete this scrim offer
                </span>
              </div>
            </div>

            <p className="font-sans text-xs text-[#94A3B8] leading-relaxed">
              Remove/delete this scrim? This action will permanently remove the post from the collegiate board.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirmOpen(false)}
                className="h-9 px-4 rounded-lg bg-[#1E2433] hover:bg-[#2A3142] text-[#94A3B8] font-sans text-xs font-bold uppercase tracking-wider transition-all cursor-pointer border border-[#2C3446]"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setDeleteConfirmOpen(false);
                  if (onDelete) onDelete(scrim.id);
                }}
                className="h-9 px-4 rounded-lg bg-[#EF4444] hover:bg-[#DC2626] text-white font-sans text-xs font-bold uppercase tracking-wider transition-all active:scale-[0.98] cursor-pointer shadow-lg shadow-red-950/40"
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
