"use client";

import React, { useState } from "react";
import Image from "next/image";
import { GAMES } from "@/lib/games";
import { Team } from "@/types";
import { UsersIcon, CrownIcon } from "@/components/ui/Icons";
import RosterDetailsModal from "./RosterDetailsModal";

interface TeamRosterCardProps {
  team: Team;
  onRosterUpdated?: () => void;
}

const GAME_ART: Record<string, string> = {
  valo: "/valorant-art-1.png",
  lol: "/lol-art-3.png",
  ml: "/ml-art-3.jpg",
  codm: "/codm-art-2.jpg",
};

export default function TeamRosterCard({ team, onRosterUpdated }: TeamRosterCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const game = GAMES[team.gameTitle as keyof typeof GAMES] || GAMES.valo;
  const bannerArt = GAME_ART[team.gameTitle] || "/valorant-art-1.png";

  const handleCopyInvite = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (typeof window === "undefined") return;
    const url = `${window.location.origin}/team/join?invite=${team.inviteCode}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const membersCount = team.members.length;
  const maxMembers = 5;
  const fillPercentage = Math.min(100, Math.round((membersCount / maxMembers) * 100));

  return (
    <>
      <div className="group relative">
        {/* Ambient Backlight Glow on Hover */}
        <div 
          className="absolute -inset-1 opacity-20 group-hover:opacity-40 transition-opacity blur-lg pointer-events-none"
          style={{ background: `radial-gradient(circle, var(--primary-brand) 0%, transparent 70%)` }}
        />

        {/* 6-Sided Faceted Prestige Squad Dossier Card */}
        <div 
          className="relative overflow-hidden bg-[#090C16] border border-[#1E293B] group-hover:border-primary-brand/60 p-5 sm:p-6 shadow-2xl transition-all duration-300 group-hover:-translate-y-1"
          style={{
            clipPath: "polygon(0 0, calc(100% - 18px) 0, 100% 18px, 100% 100%, 18px 100%, 0 calc(100% - 18px))",
          }}
        >
          {/* Top Specular Line */}
          <div 
            className="absolute top-0 left-0 right-0 h-[2.5px]"
            style={{
              background: `linear-gradient(90deg, transparent 0%, var(--primary-brand) 50%, transparent 100%)`,
              boxShadow: `0 0 12px var(--primary-brand)`,
            }}
          />

          {/* Background High-Res Game Artwork Layer */}
          <div className="absolute right-0 top-0 bottom-0 w-3/5 opacity-15 group-hover:opacity-25 transition-opacity duration-500 pointer-events-none overflow-hidden">
            <Image 
              src={bannerArt} 
              alt="" 
              fill 
              className="object-cover object-right-center blur-[0.5px] scale-105 group-hover:scale-110 transition-transform duration-700" 
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#090C16] via-[#090C16]/80 to-transparent" />
          </div>

          <div className="relative z-10 space-y-4">
            {/* Squad Header: Logo, Name & Game Badge */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3.5 min-w-0">
                {/* 8-Sided Game Logo Crest */}
                <div 
                  className="w-13 h-13 overflow-hidden shrink-0 border border-white/15 bg-[#060810] shadow-xl relative"
                  style={{
                    clipPath: "polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)",
                  }}
                >
                  <Image src={game.image} alt={game.name} fill className="object-cover" />
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-display text-lg font-black text-white uppercase tracking-wider truncate group-hover:text-primary-brand transition-colors">
                      {team.name}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-300 font-sans truncate flex items-center gap-1.5 mt-0.5">
                    <CrownIcon className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>Captain: <strong className="text-white font-bold">{team.captainName}</strong></span>
                  </p>
                </div>
              </div>

              {/* Game Badge Chip */}
              <span
                className="text-[9px] font-mono font-bold uppercase px-2.5 py-0.5 text-slate-300 bg-[#0E1322] border border-[#1E2942] shrink-0"
                style={{
                  clipPath: "polygon(4px 0, 100% 0, calc(100% - 4px) 100%, 0 100%)",
                }}
              >
                {game.shortName}
              </span>
            </div>

            {/* Roster Capacity Progress Bar */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 font-bold">
                <span className="flex items-center gap-1.5">
                  <UsersIcon className="w-3 h-3 text-primary-brand" />
                  <span>VARSITY ROSTER CAPACITY</span>
                </span>
                <span className="text-white font-bold">{membersCount} / {maxMembers} Athletes</span>
              </div>

              <div 
                className="w-full bg-[#050711] h-2 overflow-hidden border border-[#182338] p-0.5"
                style={{
                  clipPath: "polygon(3px 0, 100% 0, calc(100% - 3px) 100%, 0 100%)",
                }}
              >
                <div 
                  className="h-full game-theme-btn transition-all duration-500"
                  style={{ width: `${fillPercentage}%` }}
                />
              </div>
            </div>

            {/* Roster IGN Preview Chips */}
            {team.members && team.members.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                {team.members.slice(0, 5).map((m) => (
                  <span
                    key={m.id}
                    className="text-[9px] font-mono font-bold px-2 py-0.5 bg-[#050711] border border-[#162034] text-slate-300 rounded truncate max-w-[130px]"
                    title={m.gameHandle || m.displayName || "Athlete"}
                  >
                    🎮 {m.gameHandle || m.displayName}
                  </span>
                ))}
              </div>
            )}

            {/* Bottom Actions Bar */}
            <div className="pt-3 border-t border-[#182338] flex items-center justify-between gap-3 text-xs">
              <button
                type="button"
                onClick={handleCopyInvite}
                className="text-[10px] font-mono font-bold text-slate-300 hover:text-white bg-[#0E1322] hover:bg-[#161F34] px-3 py-1 border border-[#1E2942] transition-colors cursor-pointer flex items-center gap-1.5"
                style={{
                  clipPath: "polygon(4px 0, 100% 0, calc(100% - 4px) 100%, 0 100%)",
                }}
                title="Copy Team Invite Link"
              >
                <span>{copied ? "✓ Copied Link" : `Code: ${team.inviteCode}`}</span>
              </button>

              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="h-8 px-4 game-theme-btn text-xs font-display font-black uppercase tracking-wider transition-all cursor-pointer shadow-lg active:scale-95 flex items-center gap-1.5"
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
