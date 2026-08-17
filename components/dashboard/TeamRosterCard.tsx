"use client";

import React, { useState } from "react";
import { GAMES } from "@/lib/games";
import { Team } from "@/types";
import RosterDetailsModal from "./RosterDetailsModal";

interface TeamRosterCardProps {
  team: Team;
}

export default function TeamRosterCard({ team }: TeamRosterCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const game = GAMES[team.gameTitle];

  return (
    <>
      <div className="p-5 rounded-2xl bg-card-bg border border-raised-panel hover:border-primary-brand/50 transition-all space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={game.image} alt={game.name} className="w-10 h-10 rounded-xl object-cover border border-panel-border" />
            <div>
              <h3 className="font-display text-base font-bold uppercase text-foreground">
                {team.name}
              </h3>
              <span className="text-[10px] font-sans text-secondary-text block">
                Captain: {team.captainName}
              </span>
            </div>
          </div>
          <span
            className="text-[10px] font-sans font-bold uppercase px-2.5 py-1 rounded-full text-white shadow-sm"
            style={{ backgroundColor: game.accentColor }}
          >
            {game.shortName}
          </span>
        </div>

        <div className="pt-3 border-t border-raised-panel flex items-center justify-between text-xs font-sans">
          <span className="text-secondary-text font-medium">{team.members.length} {team.members.length === 1 ? "Member" : "Members"}</span>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="text-primary-brand font-bold hover:text-primary-brand/80 hover:underline cursor-pointer flex items-center gap-1 transition-colors"
          >
            Roster Details →
          </button>
        </div>
      </div>

      <RosterDetailsModal
        team={team}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
