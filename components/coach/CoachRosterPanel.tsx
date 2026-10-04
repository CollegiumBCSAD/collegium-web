"use client";

import { CoachTeamPanelProps } from "@/types";
import { getGameInfo } from "@/lib/games";
import CoachPanel from "./CoachPanel";
import RosterEditor from "@/components/rosters/RosterEditor";
import { UsersIcon } from "@/components/ui/Icons";

export default function CoachRosterPanel({ team, onChanged }: CoachTeamPanelProps) {
  return (
    <CoachPanel eyebrow="Squad" title="Roster Command" icon={<UsersIcon className="w-4 h-4" />}>
      <RosterEditor teamId={team.id} gameTitle={getGameInfo(team.gameTitle).id} onChanged={onChanged} />
    </CoachPanel>
  );
}
