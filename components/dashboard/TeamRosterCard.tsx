"use client";

import React, { useState } from "react";
import { GAMES } from "@/lib/games";
import { Team } from "@/types";
import { UsersIcon, CrownIcon } from "@/components/ui/Icons";
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
        {/* Main Card with Chamfered Top-Right & Bottom-Left Cuts */}
        <div 
          className="relative overflow-hidden bg-[#0A0D18] border border-[#1C253D] p-5 shadow-2xl transition-all duration-300 group-hover:border-primary-brand/50 group-hover:-translate-y-1"
          style={{
            clipPath: "polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px))",
          }}
        >
          {/* Tactical Game Accent Top Bar */}
          <div
            className="absolute top-0 left-0 right-0 h-[2px]"
            style={{
              background: `linear-gradient(90deg, transparent 0%, var(--primary-brand) 50%, transparent 100%)`,
            }}
          />

          {/* Background Game Watermark */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={game.image}
            alt=""
            className="absolute right-0 bottom-0 w-32 h-32 object-cover opacity-[0.05] group-hover:opacity-[0.10] grayscale blur-[0.5px] transition-all duration-500 pointer-events-none"
          />

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
              className="text-[9px] font-mono font-bold uppercase px-2.5 py-0.5 text-slate-300 bg-[#0E1322] border border-[#1E2942] shrink-0"
              style={{
                clipPath: "polygon(4px 0, 100% 0, calc(100% - 4px) 100%, 0 100%)",
              }}
            >
              {game.shortName}
            </span>
          </div>

          {/* Members Preview & Invite Action */}
          <div className="pt-3.5 mt-3.5 border-t border-[#162034] flex items-center justify-between gap-3 text-xs relative z-10">
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-sans flex items-center gap-1.5">
                <UsersIcon className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-mono font-bold text-white">{team.members.length}</span> Athletes
              </span>

              <button
                type="button"
                onClick={handleCopyInvite}
                className="text-[10px] font-mono font-bold text-slate-300 hover:text-white bg-[#0E1322] hover:bg-[#161F34] px-2 py-0.5 border border-[#1E2942] transition-colors cursor-pointer"
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
              className="h-7.5 px-3.5 game-theme-btn text-xs font-display font-black uppercase tracking-wider transition-all cursor-pointer shadow-md active:scale-95 flex items-center gap-1"
              style={{
                clipPath: "polygon(4px 0, 100% 0, calc(100% - 4px) 100%, 0 100%)",
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
