"use client";

import React, { useState } from "react";
import { GAMES } from "@/lib/games";
import { Team } from "@/types";
import { UsersIcon, CrownIcon, ShieldIcon } from "@/components/ui/Icons";
import RosterDetailsModal from "./RosterDetailsModal";

interface TeamRosterCardProps {
  team: Team;
  onRosterUpdated?: () => void;
}

export default function TeamRosterCard({ team, onRosterUpdated }: TeamRosterCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const game = GAMES[team.gameTitle] || GAMES.valo;

  const handleCopyInvite = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (typeof window === "undefined") return;
    const url = `${window.location.origin}/team/join?invite=${team.inviteCode}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <div className="group relative">
        {/* Glow halo */}
        <div 
          className="absolute -inset-0.5 opacity-30 group-hover:opacity-60 transition-opacity blur-sm"
          style={{ backgroundColor: game.accentColor }}
        />

        {/* Main Card with Chamfered Top-Right & Bottom-Left Cuts */}
        <div 
          className="relative overflow-hidden bg-gradient-to-b from-[#0F1424] via-[#0B0E1B] to-[#070912] border border-[#1E293B] p-5 shadow-xl transition-all duration-300 group-hover:-translate-y-1"
          style={{
            clipPath: "polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px))",
          }}
        >
          {/* Tactical Game Accent Top Bar */}
          <div
            className="absolute top-0 left-0 right-0 h-[2.5px]"
            style={{
              backgroundColor: game.accentColor,
              boxShadow: `0 0 10px ${game.accentColor}`,
            }}
          />

          {/* Background Game Watermark */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={game.image}
            alt=""
            className="absolute right-0 bottom-0 w-36 h-36 object-cover opacity-[0.07] group-hover:opacity-[0.15] group-hover:scale-110 grayscale blur-[1px] transition-all duration-500 pointer-events-none"
          />

          {/* Corner Tick Marks */}
          <div className="absolute top-1 left-1 w-2 h-2 border-t border-l border-white/20 pointer-events-none" />
          <div className="absolute bottom-1 right-1 w-2 h-2 border-b border-r border-white/20 pointer-events-none" />

          {/* Header: Squad Identity & Game */}
          <div className="flex items-start justify-between gap-3 relative z-10">
            <div className="flex items-center gap-3 min-w-0">
              <div 
                className="w-12 h-12 overflow-hidden ring-1 ring-white/10 shrink-0 bg-[#060810]"
                style={{
                  clipPath: "polygon(20% 0%, 80% 0%, 100% 20%, 100% 80%, 80% 100%, 20% 100%, 0% 80%, 0% 20%)",
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={game.image} alt={game.name} className="w-full h-full object-cover" />
              </div>

              <div className="min-w-0">
                <h3 className="font-display text-base font-black text-white uppercase tracking-wider truncate group-hover:text-primary-brand transition-colors">
                  {team.name}
                </h3>
                <p className="text-xs text-slate-400 font-sans truncate flex items-center gap-1 mt-0.5">
                  <CrownIcon className="w-3 h-3 text-amber-400 shrink-0" />
                  <span>Captain: <strong className="text-slate-200 font-bold">{team.captainName}</strong></span>
                </p>
              </div>
            </div>

            <span
              className="text-[10px] font-mono font-bold uppercase px-3 py-0.5 text-white shrink-0 shadow-sm"
              style={{
                backgroundColor: game.accentColor,
                color: "var(--game-btn-text, #FFFFFF)",
                clipPath: "polygon(6px 0, 100% 0, calc(100% - 6px) 100%, 0 100%)",
              }}
            >
              {game.shortName}
            </span>
          </div>

          {/* Members Preview & Invite Action */}
          <div className="pt-3.5 mt-3.5 border-t border-[#182338] flex items-center justify-between gap-3 text-xs relative z-10">
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-sans flex items-center gap-1.5">
                <UsersIcon className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-mono font-bold text-white">{team.members.length}</span> Athletes
              </span>

              <button
                type="button"
                onClick={handleCopyInvite}
                className="text-[10px] font-mono font-bold text-slate-400 hover:text-white bg-[#141A29] hover:bg-[#1C263C] px-2 py-0.5 border border-[#243350] transition-colors cursor-pointer"
                style={{
                  clipPath: "polygon(4px 0, 100% 0, calc(100% - 4px) 100%, 0 100%)",
                }}
                title="Copy Team Invite Link"
              >
                {copied ? "✓ Copied" : "Copy Invite"}
              </button>
            </div>

            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="h-8 px-4 bg-[#141C2E] hover:bg-primary-brand text-slate-200 hover:text-white font-display text-xs font-black uppercase tracking-wider transition-all border border-[#22314E] hover:border-primary-brand cursor-pointer shadow-md active:scale-95 flex items-center gap-1"
              style={{
                clipPath: "polygon(6px 0, 100% 0, calc(100% - 6px) 100%, 0 100%)",
              }}
            >
              <span>Manage Roster</span>
              <span>→</span>
            </button>
          </div>
        </div>
      </div>

      <RosterDetailsModal
        team={team}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onRosterUpdated={onRosterUpdated}
      />
    </>
  );
}
