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

  return (
    <div className="p-6 rounded-2xl bg-card-bg border border-raised-panel space-y-4 hover:border-primary-brand/50 transition-all shadow-xl">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={game.image} alt={game.name} className="w-10 h-10 rounded-lg object-cover" />
          <div>
            <span className="text-[10px] font-sans font-extrabold uppercase tracking-widest text-secondary-brand block">
              {scrim.universityName}
            </span>
            <h3 className="font-display text-lg font-bold uppercase text-foreground">
              {scrim.hostTeamName}
            </h3>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {scrim.mapPreference && (
            <span className="text-[10px] font-sans font-extrabold uppercase px-2 py-0.5 rounded bg-raised-panel text-secondary-text border border-panel-border">
              🗺️ {scrim.mapPreference}
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
          <span className="text-[9px] font-sans text-secondary-text uppercase block">Scheduled</span>
          <span className="text-xs font-sans font-bold text-success">
            {new Date(scrim.scheduledAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </span>
        </div>
      </div>

      {scrim.notes && (
        <p className="text-xs font-sans text-secondary-text bg-background/50 p-2.5 rounded-lg border border-panel-border">
          &quot;{scrim.notes}&quot;
        </p>
      )}

      <div className="pt-2 flex items-center justify-between gap-3">
        {scrim.status === "CANCELLED" ? (
          <div className="w-full p-2.5 rounded-lg bg-error/10 border border-error/30 text-error text-xs font-sans font-bold text-center">
            ✕ Scrim Offer Cancelled
          </div>
        ) : scrim.status === "CONFIRMED" ? (
          <div className="w-full p-2.5 rounded-lg bg-success/10 border border-success/30 text-success text-xs font-sans font-bold text-center">
            ✓ Match Booked vs {scrim.opponentTeamName || "Opponent"}
          </div>
        ) : isHost && onCancel ? (
          <button
            onClick={() => onCancel(scrim.id)}
            className="w-full h-10 rounded-lg bg-error/10 hover:bg-error/20 text-error border border-error/30 font-sans text-xs font-bold uppercase tracking-wider transition-all active:scale-[0.98] cursor-pointer"
          >
            Cancel Offer
          </button>
        ) : (
          <button
            onClick={() => onAccept(scrim.id)}
            className="w-full h-10 rounded-lg bg-gradient-to-r from-[#E53A4C] to-[#B91C1C] hover:from-[#EF4444] hover:to-[#991B1B] text-foreground font-sans text-xs font-bold uppercase tracking-wider transition-all active:scale-[0.98] cursor-pointer shadow-md shadow-primary-brand/20"
          >
            Accept Scrim Offer
          </button>
        )}
      </div>
    </div>
  );
}
