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
    ? [{ teamId: scrim.opponentTeamId || "op-id", teamName: scrim.opponentTeamName }]
    : [{ teamId: "op-default", teamName: "Challenger Squad" }];

  const formattedTime = new Date(scrim.scheduledAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <div
      className={`p-5 rounded-3xl bg-[#0D121F]/95 border transition-all duration-200 shadow-xl relative flex flex-col justify-between group ${
        isCancelled
          ? "border-rose-900/30 opacity-70"
          : "border-[#1E293B] hover:border-primary-brand/50"
      }`}
    >
      <div className="space-y-4">
        {/* Header Row: Game Logo, Team Name, University & Badges */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3.5 min-w-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={game.image}
              alt={game.name}
              className="w-10 h-10 rounded-xl object-cover ring-1 ring-white/15 shrink-0 shadow-md"
            />
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-display text-base font-black uppercase text-white truncate">
                  {scrim.hostTeamName}
                </h3>
                {isHost && (
                  <span className="text-[9px] font-mono font-extrabold uppercase px-2 py-0.5 rounded bg-primary-brand/15 text-primary-brand border border-primary-brand/30 shrink-0">
                    YOU (HOST)
                  </span>
                )}
              </div>
              <span className="text-[11px] font-sans font-semibold text-slate-400 truncate block mt-0.5">
                {scrim.universityName || "UNIVERSITY"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Status Pill */}
            {isBooked ? (
              <span className="inline-flex items-center gap-1.5 text-[10px] font-sans font-extrabold uppercase px-3 py-1 rounded-full bg-[#141A29] text-emerald-400 border border-[#232D44]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                MATCH BOOKED
              </span>
            ) : isPending ? (
              <span className="inline-flex items-center gap-1.5 text-[10px] font-sans font-extrabold uppercase px-3 py-1 rounded-full bg-[#141A29] text-amber-400 border border-[#232D44]">
                <ClockIcon className="w-3 h-3 text-amber-400" />
                PENDING
              </span>
            ) : isCancelled ? (
              <span className="text-[10px] font-sans font-extrabold uppercase px-3 py-1 rounded-full bg-rose-950/50 text-rose-400 border border-rose-900/40">
                CANCELLED
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-[10px] font-sans font-extrabold uppercase px-3 py-1 rounded-full bg-[#141A29] text-slate-300 border border-[#232D44]">
                <ZapIcon className="w-3 h-3 text-amber-400" />
                OPEN OFFER
              </span>
            )}

            {/* Game Tag */}
            <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-1 rounded-full bg-[#141A29] text-slate-300 border border-[#232D44]">
              {game.shortName}
            </span>

            {/* Delete Icon */}
            {isHost && onDelete && (
              <button
                onClick={() => setDeleteConfirmOpen(true)}
                className="w-7 h-7 rounded-lg bg-[#141A29] hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 flex items-center justify-center text-xs transition-all border border-[#232D44] hover:border-rose-500/40"
                title="Delete Scrim Offer"
              >
                <TrashIcon className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Spec Inline Bar (Clean 1-line format, no nested boxes!) */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 py-2 px-3 rounded-xl bg-[#080C14] border border-[#1C2538] text-xs font-mono">
          <span className="text-slate-400">FORMAT: <strong className="text-white">{scrim.format}</strong></span>
          <span className="text-slate-600">·</span>
          <span className="text-slate-400">TIER: <strong className="text-white">{scrim.rankRange}</strong></span>
          <span className="text-slate-600">·</span>
          <span className="text-slate-400">MAP / TIME: <strong className="text-white">{scrim.mapPreference ? `${scrim.mapPreference} @ ` : ""}{formattedTime}</strong></span>
        </div>

        {/* Notes */}
        {scrim.notes && (
          <p className="text-xs font-sans text-slate-300 italic">
            &quot;{scrim.notes}&quot;
          </p>
        )}
      </div>

      {/* Action Footer */}
      <div className="pt-4 mt-3 border-t border-[#1C2538]">
        {isCancelled ? (
          <div className="text-xs font-sans text-rose-400 font-semibold flex items-center justify-between">
            <span>Scrim offer cancelled</span>
            {isHost && (
              <button onClick={() => setDeleteConfirmOpen(true)} className="hover:underline font-bold text-rose-400">
                Delete
              </button>
            )}
          </div>
        ) : isPending ? (
          isHost ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-sans font-bold text-amber-400 uppercase">
                <span>INCOMING REQUESTS ({pendingList.length})</span>
              </div>
              <div className="space-y-1.5 max-h-36 overflow-y-auto">
                {pendingList.map((req) => (
                  <div key={req.teamId} className="flex items-center justify-between gap-2 p-2 rounded-xl bg-[#080C14] border border-[#1C2538]">
                    <span className="text-xs font-sans font-bold text-white truncate">{req.teamName}</span>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => onDeclineRequest ? onDeclineRequest(scrim.id, req.teamId) : onCancel && onCancel(scrim.id)}
                        className="px-2.5 py-1 rounded-lg bg-[#141A29] hover:bg-[#1F273D] text-slate-300 hover:text-rose-400 text-[10px] font-bold uppercase transition-all"
                      >
                        Decline
                      </button>
                      <button
                        onClick={() => onConfirmBooking && onConfirmBooking(scrim.id, req.teamId)}
                        className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-black uppercase tracking-wider transition-all shadow-md"
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
                  className="px-3 py-1 rounded-lg bg-[#141A29] hover:bg-rose-950/40 text-slate-300 hover:text-rose-400 text-[10px] font-bold uppercase border border-[#232D44]"
                >
                  Cancel
                </button>
              )}
            </div>
          ) : (
            <button
              onClick={() => onAccept(scrim.id)}
              className="w-full h-10 rounded-xl game-theme-btn font-sans text-xs font-extrabold uppercase tracking-wider transition-all active:scale-[0.98] shadow-lg flex items-center justify-center gap-2"
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
                className="h-10 px-5 rounded-xl game-theme-btn font-sans text-xs font-black uppercase tracking-wider transition-all shrink-0 shadow-lg flex items-center gap-2"
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
              <span className="text-[10px] font-bold uppercase text-emerald-400">CONFIRMED</span>
            </div>
          )
        ) : isHost ? (
          <div className="text-xs font-sans text-slate-400 flex items-center gap-1.5">
            <ZapIcon className="w-3.5 h-3.5 text-amber-400" />
            <span>Open offer visible to collegiate varsity squads</span>
          </div>
        ) : (
          <button
            onClick={() => onAccept(scrim.id)}
            className="w-full h-10 rounded-xl game-theme-btn font-sans text-xs font-extrabold uppercase tracking-wider transition-all active:scale-[0.98] shadow-lg flex items-center justify-center gap-2"
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
                className="h-9 px-4 rounded-xl bg-[#141A29] text-slate-300 font-sans text-xs font-bold uppercase border border-[#232D44]"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setDeleteConfirmOpen(false);
                  if (onDelete) onDelete(scrim.id);
                }}
                className="h-9 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-sans text-xs font-bold uppercase shadow-lg"
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
