"use client";

import React, { useState } from "react";
import { Team } from "@/types";
import { GAMES } from "@/lib/games";

interface RosterDetailsModalProps {
  team: Team | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function RosterDetailsModal({ team, isOpen, onClose }: RosterDetailsModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !team) return null;

  const game = GAMES[team.gameTitle];

  const getInviteUrl = () => {
    if (typeof window === "undefined") return "";
    return `${window.location.origin}/team/join?invite=${team.inviteCode}`;
  };

  const copyInviteLink = () => {
    navigator.clipboard.writeText(getInviteUrl());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-xl bg-[#121520] border border-[#272D40] rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden">
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-raised-panel pb-4">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={game.image} alt={game.name} className="w-10 h-10 rounded-xl object-cover border border-panel-border shadow-md" />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-sans font-extrabold uppercase tracking-widest text-secondary-brand">
                  {team.universityName || "University Varsity"} Squad
                </span>
                <span
                  className="text-[10px] font-sans font-bold uppercase px-2 py-0.5 rounded-full text-white"
                  style={{ backgroundColor: game.accentColor }}
                >
                  {game.shortName}
                </span>
              </div>
              <h2 className="font-display text-2xl font-bold uppercase text-foreground">
                {team.name}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl border border-panel-border bg-background hover:bg-raised-panel text-secondary-text hover:text-foreground flex items-center justify-center transition-colors cursor-pointer text-sm"
          >
            ✕
          </button>
        </div>

        {/* Squad Overview Stats */}
        <div className="grid grid-cols-3 gap-3 p-4 rounded-xl bg-background border border-panel-border text-center">
          <div>
            <span className="text-[10px] font-sans text-secondary-text uppercase block">Roster Size</span>
            <span className="font-display text-lg font-bold text-foreground">{team.members.length} Athletes</span>
          </div>
          <div className="border-x border-panel-border">
            <span className="text-[10px] font-sans text-secondary-text uppercase block">Captain</span>
            <span className="font-sans text-xs font-bold text-secondary-brand truncate block px-1">{team.captainName}</span>
          </div>
          <div>
            <span className="text-[10px] font-sans text-secondary-text uppercase block">Game Title</span>
            <span className="font-sans text-xs font-bold text-success">{game.name}</span>
          </div>
        </div>

        {/* Roster Athletes List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-sm font-bold uppercase tracking-wider text-foreground">
              Official Squad Roster ({team.members.length})
            </h3>
            <span className="text-[11px] font-sans text-secondary-text">Verified University Roster</span>
          </div>

          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {team.members.map((m) => (
              <div
                key={m.id}
                className="p-3.5 rounded-xl bg-card-bg/80 border border-raised-panel flex items-center justify-between gap-3 hover:border-panel-border transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-primary-brand/10 border border-primary-brand/20 text-primary-brand flex items-center justify-center font-display text-sm font-bold uppercase">
                    {(m.displayName || m.gameHandle || "A").charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-sans text-xs font-bold text-foreground">
                        {m.gameHandle || m.displayName}
                      </span>
                      {m.displayName && (
                        <span className="text-[10px] font-sans text-secondary-text">({m.displayName})</span>
                      )}
                    </div>
                    <span className="text-[10px] font-sans text-secondary-text block">
                      {m.preferredRole ? `Role: ${m.preferredRole}` : "Flex Roster Athlete"}
                    </span>
                  </div>
                </div>

                <span className={`text-[10px] font-sans font-extrabold uppercase px-2.5 py-1 rounded ${
                  m.status === "ACCEPTED"
                    ? "bg-success/10 text-success border border-success/20"
                    : "bg-secondary-brand/10 text-secondary-brand border border-secondary-brand/20"
                }`}>
                  {m.status === "ACCEPTED" ? "VERIFIED" : "PENDING"}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Shareable Invite Code Section */}
        <div className="p-4 rounded-xl bg-background border border-panel-border space-y-2">
          <label className="block text-[11px] font-sans font-semibold uppercase tracking-wider text-secondary-text">
            Shareable Roster Invite Link
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={getInviteUrl()}
              className="flex-1 h-10 px-3 rounded-lg bg-card-bg border border-panel-border text-foreground text-xs font-mono select-all focus:outline-none"
            />
            <button
              type="button"
              onClick={copyInviteLink}
              className="h-10 px-4 rounded-lg bg-primary-brand hover:bg-primary-brand/90 text-foreground font-sans text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer shrink-0"
            >
              {copied ? "Copied! ✓" : "Copy Link"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
