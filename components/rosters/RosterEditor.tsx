"use client";

import { useCallback, useEffect, useState } from "react";
import { rostersService } from "@/services";
import { RosterEditorProps, TeamRoster } from "@/types";
import RosterMemberRow from "./RosterMemberRow";
import RosterChangeModal from "./RosterChangeModal";
import RosterChangeHistory from "./RosterChangeHistory";
import { captainFirst, DEFAULT_ROLES, STARTER_COUNT } from "@/lib/teams";

// Captain/coach roster management: edit players, hand over the captaincy,
// remove bench players, and file last-minute changes for locked lineups.
export default function RosterEditor({ teamId, gameTitle, onChanged }: RosterEditorProps) {
  const [roster, setRoster] = useState<TeamRoster | null>(null);
  const [error, setError] = useState("");
  const [isChangeOpen, setIsChangeOpen] = useState(false);

  const load = useCallback(() => {
    rostersService
      .getRoster(teamId)
      .then((r) => {
        setRoster(r);
        setError("");
      })
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "Could not load the roster."));
  }, [teamId]);

  useEffect(load, [load]);

  const refresh = useCallback(() => {
    load();
    onChanged?.();
  }, [load, onChanged]);

  const closeChange = useCallback(() => setIsChangeOpen(false), []);

  if (error) return <p className="text-xs font-sans text-rose-400">{error}</p>;
  if (!roster) return <p className="text-xs font-sans text-slate-500">Loading roster...</p>;

  const members = captainFirst(roster.members, roster.team.captainId);
  const roles = DEFAULT_ROLES[gameTitle] ?? DEFAULT_ROLES.valo;

  const lockedIn = (userId: string) =>
    roster.locks.filter((l) => l.lockedUserIds.includes(userId)).map((l) => l.tournamentName);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[10px] font-mono uppercase tracking-wider text-slate-500">
          {roster.locks.length > 0
            ? `Lineup locked for ${roster.locks.length} tournament${roster.locks.length > 1 ? "s" : ""}`
            : "Edit names, roles, and the captaincy"}
        </p>
        {roster.locks.length > 0 && (
          <button
            type="button"
            onClick={() => setIsChangeOpen(true)}
            className="h-8 px-3 rounded-lg text-[10px] font-mono font-black uppercase tracking-wider text-sky-200 bg-sky-500/10 border border-sky-400/30 hover:bg-sky-500/20 cursor-pointer"
          >
            Last-Minute Change
          </button>
        )}
      </div>

      {roster.members.length === 0 ? (
        <p className="text-xs font-sans text-slate-500">No athletes yet. Share the invite link so your players can join.</p>
      ) : (
        <div className="space-y-3">
          {[
            { label: "Starting Five", rows: members.slice(0, STARTER_COUNT), offset: 0 },
            { label: "Bench", rows: members.slice(STARTER_COUNT), offset: STARTER_COUNT },
          ]
            .filter((group) => group.rows.length > 0)
            .map((group) => (
              <div key={group.label} className="space-y-1.5">
                <h4 className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-500">{group.label}</h4>
                <ul className="space-y-1.5">
                  {group.rows.map((m, i) => (
                    <RosterMemberRow
                      key={`${m.id}:${m.gameHandle}:${m.preferredRole ?? ""}`}
                      teamId={teamId}
                      member={m}
                      slot={group.offset + i + 1}
                      defaultRole={roles[group.offset + i] ?? "Substitute"}
                      isCaptain={m.userId === roster.team.captainId}
                      lockedIn={lockedIn(m.userId)}
                      onChanged={refresh}
                    />
                  ))}
                </ul>
              </div>
            ))}
        </div>
      )}

      <RosterChangeHistory teamId={teamId} changes={roster.changes} onChanged={refresh} />

      {isChangeOpen && <RosterChangeModal roster={roster} onClose={closeChange} onFiled={refresh} />}
    </div>
  );
}
