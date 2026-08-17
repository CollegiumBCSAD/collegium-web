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

  return (
    <div
      className={`p-6 rounded-2xl bg-card-bg border space-y-4 transition-all shadow-xl relative overflow-hidden ${
        isBooked
          ? "border-success/50 bg-gradient-to-b from-success/5 to-transparent shadow-success/10"
          : isPending
          ? "border-warning/50 bg-gradient-to-b from-warning/5 to-transparent shadow-warning/10"
          : "border-raised-panel hover:border-primary-brand/50"
      }`}
    >
      {/* Top Banner Accent for Booked Scrims */}
      {isBooked && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-success via-emerald-400 to-success" />
      )}
      {isPending && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-warning via-amber-400 to-warning" />
      )}

      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={game.image} alt={game.name} className="w-10 h-10 rounded-lg object-cover" />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-sans font-extrabold uppercase tracking-widest text-secondary-brand block">
                {scrim.universityName}
              </span>
              {isHost && (
                <span className="text-[9px] font-sans font-bold uppercase px-1.5 py-0.2 rounded bg-primary-brand/20 text-primary-brand border border-primary-brand/30">
                  HOST
                </span>
              )}
            </div>
            <h3 className="font-display text-lg font-bold uppercase text-foreground">
              {scrim.hostTeamName}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isBooked ? (
            <span className="inline-flex items-center gap-1.5 text-[10px] font-sans font-extrabold uppercase px-2.5 py-1 rounded-full bg-success/20 text-success border border-success/30 animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-success animate-ping" />
              🟢 BOOKED
            </span>
          ) : isPending ? (
            <span className="inline-flex items-center gap-1.5 text-[10px] font-sans font-extrabold uppercase px-2.5 py-1 rounded-full bg-warning/20 text-warning border border-warning/30 animate-pulse">
              ⏳ PENDING REQUEST
            </span>
          ) : scrim.status === "CANCELLED" ? (
            <span className="text-[10px] font-sans font-extrabold uppercase px-2.5 py-1 rounded-full bg-error/20 text-error border border-error/30">
              ✕ CANCELLED
            </span>
          ) : (
            <span className="text-[10px] font-sans font-extrabold uppercase px-2.5 py-1 rounded-full bg-raised-panel text-secondary-brand border border-panel-border">
              ⚡ OPEN SCRIM
            </span>
          )}

          <span
            className="text-[10px] font-sans font-bold uppercase px-2.5 py-1 rounded-full text-white"
            style={{ backgroundColor: game.accentColor }}
          >
            {game.shortName}
          </span>

          {/* Top-Right Close/Delete X Button */}
          {isHost && onDelete && (
            <button
              onClick={() => setDeleteConfirmOpen(true)}
              aria-label="Delete Scrim"
              className="w-7 h-7 rounded-full bg-raised-panel hover:bg-error/20 text-secondary-text hover:text-error flex items-center justify-center text-xs font-bold transition-all cursor-pointer border border-panel-border hover:border-error/40 shrink-0 ml-1"
              title="Remove/Delete this scrim"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-background border border-panel-border text-center">
        <div>
          <span className="text-[9px] font-sans text-secondary-text uppercase block">Format</span>
          <span className="text-xs font-sans font-bold text-foreground">{scrim.format}</span>
        </div>
        <div>
          <span className="text-[9px] font-sans text-secondary-text uppercase block">Rank Tier</span>
          <span className="text-xs font-sans font-bold text-foreground">{scrim.rankRange}</span>
        </div>
        <div>
          <span className="text-[9px] font-sans text-secondary-text uppercase block">Map / Time</span>
          <span className="text-xs font-sans font-bold text-success truncate block">
            {scrim.mapPreference ? `${scrim.mapPreference} · ` : ""}
            {new Date(scrim.scheduledAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </span>
        </div>
      </div>

      {scrim.notes && (
        <p className="text-xs font-sans text-secondary-text bg-background/50 p-2.5 rounded-lg border border-panel-border">
          &quot;{scrim.notes}&quot;
        </p>
      )}

      {/* Action / Notification Bottom Area */}
      <div className="pt-2 flex items-center justify-between gap-3">
        {scrim.status === "CANCELLED" ? (
          <div className="w-full flex items-center justify-between p-2.5 rounded-lg bg-error/10 border border-error/30 text-error text-xs font-sans font-bold">
            <span>✕ Scrim Offer Cancelled</span>
            {isHost && (
              <button
                onClick={() => setDeleteConfirmOpen(true)}
                className="text-[11px] hover:underline font-bold cursor-pointer"
              >
                Delete
              </button>
            )}
          </div>
        ) : isPending ? (
          isHost ? (
            <div className="w-full p-3 rounded-xl bg-warning/15 border border-warning/40 text-warning space-y-2.5 shadow-inner">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-base">⏳</span>
                  <div>
                    <span className="text-xs font-sans font-extrabold uppercase tracking-wider block text-warning">
                      INCOMING SCRIM REQUEST!
                    </span>
                    <span className="text-xs font-sans font-bold text-foreground">
                      From: {scrim.opponentTeamName || "Opponent Squad"}
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-sans font-extrabold uppercase px-2 py-0.5 rounded bg-warning/20 text-warning border border-warning/30">
                  AWAITING YOU
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-warning/20">
                {onCancel && (
                  <button
                    onClick={() => onCancel(scrim.id)}
                    className="h-8 px-3 rounded-lg bg-error/20 hover:bg-error/30 text-error border border-error/40 font-sans text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer"
                  >
                    ✕ Decline Request
                  </button>
                )}
                {onConfirmBooking && (
                  <button
                    onClick={() => onConfirmBooking(scrim.id)}
                    className="h-8 px-4 rounded-lg bg-success hover:bg-success/90 text-white font-sans text-[11px] font-bold uppercase tracking-wider transition-all active:scale-[0.98] cursor-pointer shadow-md shadow-success/20"
                  >
                    ✓ Accept Request
                  </button>
                )}
              </div>
            </div>
          ) : isOpponent ? (
            <div className="w-full p-3 rounded-xl bg-warning/15 border border-warning/40 text-warning flex items-center justify-between gap-3 shadow-inner">
              <div className="flex items-center gap-2">
                <span className="text-base">⌛</span>
                <div>
                  <span className="text-xs font-sans font-extrabold uppercase tracking-wider block text-warning">
                    SCRIM REQUEST SENT
                  </span>
                  <span className="text-[11px] font-sans text-secondary-text">
                    Sent to {scrim.hostTeamName}. Awaiting Captain Approval.
                  </span>
                </div>
              </div>
              {onCancel && (
                <button
                  onClick={() => onCancel(scrim.id)}
                  className="h-8 px-3 rounded-lg bg-error/20 hover:bg-error/30 text-error border border-error/40 font-sans text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer shrink-0"
                >
                  Cancel Request
                </button>
              )}
            </div>
          ) : (
            <div className="w-full p-2.5 rounded-lg bg-warning/10 border border-warning/30 text-warning text-xs font-sans font-bold text-center">
              ⏳ Scrim request pending host approval
            </div>
          )
        ) : isBooked ? (
          <div className="w-full p-3 rounded-xl bg-success/15 border border-success/40 text-success flex items-center justify-between shadow-inner gap-3">
            <div className="flex items-center gap-2.5 flex-1 min-w-0">
              <span className="text-xl shrink-0">📅</span>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-sans font-extrabold uppercase tracking-wider block text-success">
                    MATCH BOOKED!
                  </span>
                  <span className="text-[9px] font-sans font-extrabold uppercase px-1.5 py-0.2 rounded bg-success/20 text-success border border-success/30">
                    CONFIRMED
                  </span>
                </div>
                <span className="text-xs font-sans font-bold text-foreground block truncate">
                  {isHost
                    ? `Opponent: ${scrim.opponentTeamName || "Opponent Squad"}`
                    : `Host: ${scrim.hostTeamName}`}
                </span>
                <span className="text-[10px] font-sans font-extrabold text-secondary-text block mt-0.5 truncate">
                  ⏰ Scheduled: {new Date(scrim.scheduledAt).toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" })} at {new Date(scrim.scheduledAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {onCancel && (
                <button
                  onClick={() => onCancel(scrim.id)}
                  className="h-9 px-3 rounded-lg bg-secondary-brand/20 hover:bg-secondary-brand/30 text-secondary-brand border border-secondary-brand/40 font-sans text-[11px] font-bold uppercase tracking-wider transition-all active:scale-[0.98] cursor-pointer"
                  title="Cancel booking and re-open scrim offer"
                >
                  Unbook
                </button>
              )}
            </div>
          </div>
        ) : isHost ? (
          <div className="w-full flex items-center justify-between gap-3">
            <span className="text-xs font-sans text-secondary-brand font-semibold italic">
              ⚡ Live on Scrims Board for challengers
            </span>
          </div>
        ) : (
          <button
            onClick={() => onAccept(scrim.id)}
            className="w-full h-10 rounded-lg bg-gradient-to-r from-[#E53A4C] to-[#B91C1C] hover:from-[#EF4444] hover:to-[#991B1B] text-foreground font-sans text-xs font-bold uppercase tracking-wider transition-all active:scale-[0.98] cursor-pointer shadow-md shadow-primary-brand/20 flex items-center justify-center gap-2"
          >
            <span>⚔️</span>
            <span>Request Scrim</span>
          </button>
        )}
      </div>

      {/* Delete Confirmation Pop-Up Modal */}
      {deleteConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-card-bg border border-raised-panel rounded-2xl p-6 shadow-2xl space-y-4 text-left">
            <div className="flex items-center gap-3 border-b border-raised-panel pb-3">
              <div className="w-9 h-9 rounded-full bg-error/20 text-error flex items-center justify-center text-lg font-bold">
                🗑️
              </div>
              <div>
                <h3 className="font-display text-base font-bold uppercase text-foreground">
                  Remove/Delete Scrim?
                </h3>
                <span className="text-[11px] font-sans text-secondary-text">
                  Permanently delete this scrim offer
                </span>
              </div>
            </div>

            <p className="font-sans text-xs text-secondary-text leading-relaxed">
              Remove/delete this scrim? This action will permanently remove the post from the collegiate board.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirmOpen(false)}
                className="h-9 px-4 rounded-lg bg-raised-panel hover:bg-raised-panel/80 text-secondary-text font-sans text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setDeleteConfirmOpen(false);
                  if (onDelete) onDelete(scrim.id);
                }}
                className="h-9 px-4 rounded-lg bg-error hover:bg-error/90 text-white font-sans text-xs font-bold uppercase tracking-wider transition-all active:scale-[0.98] cursor-pointer shadow-lg shadow-error/20"
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
