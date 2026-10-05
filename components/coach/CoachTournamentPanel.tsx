"use client";

import { useEffect, useState } from "react";
import { tournamentsService } from "@/services";
import { CoachTeamPanelProps, Tournament } from "@/types";
import { getGameInfo } from "@/lib/games";
import { BRAND_BTN } from "@/components/organize/surfaces";
import { TrophyIcon } from "@/components/ui/Icons";
import CoachPanel from "./CoachPanel";

const STATUS_STYLE: Record<string, string> = {
  PENDING: "text-amber-300 border-amber-400/40 bg-amber-400/10",
  APPROVED: "text-emerald-300 border-emerald-400/40 bg-emerald-400/10",
  REJECTED: "text-rose-300 border-rose-400/40 bg-rose-400/10",
};

// Tournament registration is the coach's exclusive call for their squads.
export default function CoachTournamentPanel({ team, onChanged }: CoachTeamPanelProps) {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const game = getGameInfo(team.gameTitle);

  useEffect(() => {
    tournamentsService.getTournaments().then(setTournaments).catch(() => setTournaments([]));
  }, []);

  const applications = new Map(team.tournamentApplications.map((a) => [a.tournament.id, a]));
  const open = tournaments.filter((t) => t.status === "UPCOMING" && getGameInfo(t.gameTitle || t.game).id === game.id);
  const rosterShort = team.members.length < team.min_roster_size;

  const act = async (tournamentId: string, register: boolean) => {
    setBusyId(tournamentId);
    setError("");
    try {
      if (register) await tournamentsService.applyForTournament(tournamentId, team.id);
      else await tournamentsService.withdrawApplication(tournamentId, team.id);
      onChanged();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Could not update the registration.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <CoachPanel eyebrow="Seeded by Glicko-2" title="Tournament Registration" icon={<TrophyIcon className="w-4 h-4" />}>
      {rosterShort && (
        <p className="text-[11px] font-sans text-amber-300 bg-amber-400/10 border border-amber-400/25 px-3 py-2">
          You need at least {team.min_roster_size} athletes before you can register this squad.
        </p>
      )}
      {error && <p className="text-xs font-sans text-rose-400">{error}</p>}

      {open.length === 0 ? (
        <p className="text-xs font-sans text-slate-500">No open {game.shortName} tournaments right now.</p>
      ) : (
        <ul className="space-y-2">
          {open.map((t) => {
            const app = applications.get(t.id);
            return (
              <li key={t.id} className="flex items-center gap-3 p-3 bg-black/25 border border-white/[0.05] hover:border-primary-brand/30 transition-colors">
                <span className="w-10 h-10 shrink-0 flex items-center justify-center bg-primary-brand/10 border border-primary-brand/25 text-primary-brand">
                  <TrophyIcon className="w-4 h-4" />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-sans font-semibold text-white truncate">{t.title}</p>
                  <p className="text-[11px] font-mono text-slate-500 flex items-center gap-2">
                    {t.startDate ? new Date(t.startDate).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) : "Date TBA"}
                    {app && (
                      <span className={`px-1.5 border text-[9px] font-black uppercase tracking-wider ${STATUS_STYLE[app.status] ?? ""}`}>{app.status}</span>
                    )}
                  </p>
                </div>
                <button
                  type="button"
                  disabled={busyId === t.id || (!app && rosterShort)}
                  onClick={() => act(t.id, !app)}
                  className={`shrink-0 h-9 px-4 text-[10px] font-mono font-black uppercase tracking-wider cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                    app ? "border border-white/10 text-slate-300 hover:border-rose-400/50 hover:text-rose-300" : BRAND_BTN
                  }`}
                >
                  {busyId === t.id ? "..." : app ? "Withdraw" : "Register"}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </CoachPanel>
  );
}
