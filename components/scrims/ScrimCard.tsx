"use client";

import React from "react";
import { getGameInfo } from "@/lib/games";
import { ScrimOffer } from "@/types";

interface ScrimCardProps {
  scrim: ScrimOffer;
  onAccept: (id: string) => void;
  onCancel?: (id: string) => void;
  isHost?: boolean;
}

export default function ScrimCard({ scrim, onAccept, onCancel, isHost }: ScrimCardProps) {
  const game = getGameInfo(scrim.gameTitle);
  const isBooked = scrim.status === "CONFIRMED";

  return (
    <div
      className={`p-6 rounded-2xl bg-card-bg border space-y-4 transition-all shadow-xl relative overflow-hidden ${
        isBooked
          ? "border-success/50 bg-gradient-to-b from-success/5 to-transparent shadow-success/10"
          : "border-raised-panel hover:border-primary-brand/50"
      }`}
    >
      {/* Top Banner Accent for Booked Scrims */}
      {isBooked && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-success via-emerald-400 to-success" />
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
          <div className="w-full p-2.5 rounded-lg bg-error/10 border border-error/30 text-error text-xs font-sans font-bold text-center">
            ✕ Scrim Offer Cancelled
          </div>
        ) : isBooked ? (
          <div className="w-full p-3 rounded-xl bg-success/15 border border-success/40 text-success flex items-center justify-between shadow-inner">
            <div className="flex items-center gap-2.5">
              <span className="text-xl">📅</span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-sans font-extrabold uppercase tracking-wider block text-success">
                    MATCH BOOKED!
                  </span>
                  <span className="text-[9px] font-sans font-extrabold uppercase px-1.5 py-0.2 rounded bg-success/20 text-success border border-success/30">
                    CONFIRMED
                  </span>
                </div>
                <span className="text-xs font-sans font-bold text-foreground block">
                  {isHost
                    ? `Opponent: ${scrim.opponentTeamName || "Opponent Squad"}`
                    : `Host: ${scrim.hostTeamName}`}
                </span>
                <span className="text-[10px] font-sans font-extrabold text-secondary-text block mt-0.5">
                  ⏰ Scheduled: {new Date(scrim.scheduledAt).toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" })} at {new Date(scrim.scheduledAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            </div>
          </div>
        ) : isHost && onCancel ? (
          <div className="w-full flex items-center gap-3">
            <div className="flex-1 text-xs font-sans text-secondary-text italic">
              Your offer is live for challengers
            </div>
            <button
              onClick={() => onCancel(scrim.id)}
              className="h-10 px-4 rounded-lg bg-error/10 hover:bg-error/20 text-error border border-error/30 font-sans text-xs font-bold uppercase tracking-wider transition-all active:scale-[0.98] cursor-pointer"
            >
              Cancel Offer
            </button>
          </div>
        ) : (
          <button
            onClick={() => onAccept(scrim.id)}
            className="w-full h-10 rounded-lg bg-gradient-to-r from-[#E53A4C] to-[#B91C1C] hover:from-[#EF4444] hover:to-[#991B1B] text-foreground font-sans text-xs font-bold uppercase tracking-wider transition-all active:scale-[0.98] cursor-pointer shadow-md shadow-primary-brand/20 flex items-center justify-center gap-2"
          >
            <span>⚔️</span>
            <span>Book Scrim Match</span>
          </button>
        )}
      </div>
    </div>
  );
}
