"use client";

import React from "react";
import Link from "next/link";
import { GAMES } from "@/lib/games";
import { Team } from "@/types";

interface TeamRosterCardProps {
  team: Team;
}

export default function TeamRosterCard({ team }: TeamRosterCardProps) {
  const game = GAMES[team.gameTitle];

  return (
    <div className="p-5 rounded-2xl bg-card-bg border border-raised-panel hover:border-primary-brand/50 transition-all space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={game.image} alt={game.name} className="w-10 h-10 rounded-lg object-cover" />
          <div>
            <h3 className="font-display text-base font-bold uppercase text-foreground">
              {team.name}
            </h3>
            <span className="text-[10px] font-sans text-secondary-text">
              Captain: {team.captainName}
            </span>
          </div>
        </div>
        <span
          className="text-[10px] font-sans font-bold uppercase px-2.5 py-1 rounded-full text-white"
          style={{ backgroundColor: game.accentColor }}
        >
          {game.shortName}
        </span>
      </div>

      <div className="pt-2 border-t border-raised-panel flex items-center justify-between text-xs font-sans">
        <span className="text-secondary-text">{team.members.length} Members</span>
        <Link
          href={`/team/join?invite=${team.inviteCode}`}
          className="text-primary-brand font-semibold hover:underline"
        >
          Roster Details →
        </Link>
      </div>
    </div>
  );
}
