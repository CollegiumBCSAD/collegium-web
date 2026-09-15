"use client";

import { useMemo, useState } from "react";
import { useGame } from "@/context/GameContext";
import { GAMES, GAME_ID_TO_ENUM } from "@/lib/games";
import { GameId, UniversityMatchHistoryEntry, UniversityRosterSectionProps } from "@/types";
import { TrophyIcon, CrownIcon, CheckCircleIcon, SwordsIcon } from "@/components/ui/Icons";
import MatchBoxScoreModal from "@/components/MatchBoxScoreModal";

function formatPlayedAt(iso: string): string {
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return "Date unknown";
  return parsed.toLocaleDateString(undefined, {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
}

export default function UniversityRosterSection({
  university,
  matches,
  isLoadingMatches = false,
}: UniversityRosterSectionProps) {
  const { selectedGame } = useGame();
  const activeGameKey = (selectedGame || "valo") as GameId;
  const game = GAMES[activeGameKey] || GAMES.valo;
  const activeEnum = GAME_ID_TO_ENUM[activeGameKey];

  const [activeTab, setActiveTab] = useState<"ROSTER" | "MATCHES" | "CERTIFICATION">("ROSTER");
  const [activeMatch, setActiveMatch] = useState<UniversityMatchHistoryEntry | null>(null);

  const team = useMemo(
    () => (university.teams || []).find((t) => t.gameTitle === activeEnum),
    [university.teams, activeEnum]
  );
  const athletes = team?.members || [];

  return (
    <div
      className="p-6 sm:p-8 bg-[#090C16] border border-[#1E293B] space-y-6 shadow-2xl relative"
      style={{
        clipPath: "polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px))",
      }}
    >
      {/* Top Specular Ambient Line */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px]"
        style={{
          background: `linear-gradient(90deg, transparent 0%, var(--primary-brand) 50%, transparent 100%)`,
          boxShadow: `0 0 12px var(--primary-brand)`,
        }}
      />

      {/* Header & Interactive Tactical Tab Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#182338] pb-4 relative z-10">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 bg-[#141A29] border border-[#232D44] flex items-center justify-center text-primary-brand shrink-0"
            style={{
              clipPath: "polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)",
            }}
          >
            <SwordsIcon className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-display text-base font-black uppercase text-white tracking-wide">
              {game.name} Varsity Roster &amp; Match Log
            </h3>
            <p className="text-xs font-sans text-slate-400">
              Official Collegiate Verification &amp; Peer-Validated Match History
            </p>
          </div>
        </div>

        {/* Tactical Slanted Tab Switcher */}
        <div className="flex items-center gap-2">
          {(["ROSTER", "MATCHES", "CERTIFICATION"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 text-xs font-display font-black uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === tab ? "game-theme-btn shadow-md" : "tactical-btn-secondary text-slate-400"
              }`}
              style={{
                clipPath: "polygon(4px 0, 100% 0, calc(100% - 4px) 100%, 0 100%)",
              }}
            >
              {tab === "CERTIFICATION" ? "Info" : tab === "ROSTER" ? "Roster" : "Matches"}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content Display */}
      {activeTab === "ROSTER" && (
        <div className="relative z-10 animate-in fade-in duration-200">
          {athletes.length === 0 ? (
            <div className="p-6 bg-[#050711] border border-dashed border-[#2A3550] text-center">
              <p className="text-xs font-sans text-slate-400">
                {university.name} has no registered {game.name} squad yet.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {athletes.map((athlete) => (
                <div
                  key={athlete.id}
                  className="p-4 bg-[#050711] border border-[#182338] flex items-center justify-between gap-3 shadow-inner hover:border-primary-brand/50 transition-all duration-200 group"
                  style={{
                    clipPath: "polygon(10px 0, 100% 0, calc(100% - 10px) 100%, 0 100%)",
                  }}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Octagonal Avatar Emblem */}
                    <div
                      className="w-10 h-10 bg-[#121828] text-white flex items-center justify-center font-display font-black text-xs border border-white/10 shrink-0 group-hover:border-primary-brand/60"
                      style={{
                        clipPath: "polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)",
                      }}
                    >
                      {athlete.displayName.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-display text-xs font-bold uppercase text-white truncate group-hover:text-primary-brand transition-colors">
                          {athlete.displayName}
                        </span>
                        {athlete.isCaptain && <CrownIcon className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                      </div>
                      <span className="text-[10px] font-mono text-slate-400 block truncate">{athlete.gameHandle}</span>
                      <span className="text-[9px] font-mono text-emerald-400 flex items-center gap-1 mt-0.5">
                        <CheckCircleIcon className="w-2.5 h-2.5 text-emerald-400" /> Verified Varsity
                      </span>
                    </div>
                  </div>

                  {/* Slanted Role Tag */}
                  {athlete.preferredRole && (
                    <span
                      className="text-[9px] font-mono font-bold text-slate-300 bg-[#101626] px-2.5 py-0.5 border border-[#202C45] shrink-0"
                      style={{
                        clipPath: "polygon(6px 0, 100% 0, calc(100% - 6px) 100%, 0 100%)",
                      }}
                    >
                      {athlete.preferredRole}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "MATCHES" && (
        <div className="space-y-3 relative z-10 animate-in fade-in duration-200">
          {isLoadingMatches ? (
            <div className="p-6 text-center text-xs font-mono text-slate-400 animate-pulse">
              Loading peer-verified match log...
            </div>
          ) : matches.length === 0 ? (
            <div className="p-6 bg-[#050711] border border-dashed border-[#2A3550] text-center">
              <p className="text-xs font-sans text-slate-400">
                No verified {game.name} tournament matches recorded yet. Results appear here once an
                organizer reports them.
              </p>
            </div>
          ) : (
            matches.map((match) => {
              const isVictory = match.result === "WIN";
              return (
                <button
                  key={match.id}
                  type="button"
                  onClick={() => setActiveMatch(match)}
                  className="w-full text-left p-4 bg-[#050711] border border-[#182338] flex items-center justify-between gap-4 shadow-inner hover:border-[#2A3B58] transition-colors cursor-pointer"
                  style={{
                    clipPath: "polygon(10px 0, 100% 0, calc(100% - 10px) 100%, 0 100%)",
                  }}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className="text-xs font-mono font-bold px-2.5 py-0.5 text-slate-300 bg-[#121828] border border-[#202C45] shrink-0"
                      style={{
                        clipPath: "polygon(6px 0, 100% 0, calc(100% - 6px) 100%, 0 100%)",
                      }}
                    >
                      {match.roundLabel}
                    </span>
                    <div className="min-w-0">
                      <span className="font-display text-sm font-bold uppercase text-white block truncate">
                        VS {match.opponent?.name || "Unknown Opponent"}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400 block truncate">
                        {match.tournamentName || "Tournament"} · {formatPlayedAt(match.playedAt)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest hidden sm:block">
                      Box Score →
                    </span>
                    <span
                      className={`text-[9px] font-mono font-bold px-2.5 py-0.5 border ${
                        isVictory
                          ? "bg-emerald-950/60 text-emerald-400 border-emerald-500/40"
                          : "bg-rose-950/60 text-rose-400 border-rose-500/40"
                      }`}
                      style={{
                        clipPath: "polygon(6px 0, 100% 0, calc(100% - 6px) 100%, 0 100%)",
                      }}
                    >
                      {isVictory ? "VICTORY" : "DEFEAT"}
                    </span>
                  </div>
                </button>
              );
            })
          )}
        </div>
      )}

      {activeTab === "CERTIFICATION" && (
        <div className="p-6 bg-[#050711] border border-[#182338] space-y-3 relative z-10 animate-in fade-in duration-200">
          <h4 className="font-display text-sm font-black uppercase text-white tracking-wider flex items-center gap-2">
            <TrophyIcon className="w-4 h-4 text-primary-brand" />
            <span>Collegiate Eligibility &amp; Verification Standards</span>
          </h4>
          <p className="text-xs font-sans text-slate-400 leading-relaxed">
            All varsity athletes listed under {game.name} have been authenticated with valid institution
            email credentials, official Riot Games / Moonton / Activision ID linkages, and verified minimum
            semester GPA standing.
          </p>
        </div>
      )}

      {activeMatch && (
        <MatchBoxScoreModal
          isOpen
          onClose={() => setActiveMatch(null)}
          title="MATCH BOX SCORE"
          subtitle={`${activeMatch.tournamentName || "TOURNAMENT"} • ${activeMatch.roundLabel}`}
          matchInfo={{
            team1Name: university.name,
            team2Name: activeMatch.opponent?.name || "Unknown Opponent",
            team1UniversityId: university.id,
            team2UniversityId: activeMatch.opponent?.id,
            isTeam1Winner: activeMatch.result === "WIN",
            isTeam2Winner: activeMatch.result === "LOSS",
            status: "COMPLETED",
            playerStats: activeMatch.playerStats,
          }}
        />
      )}
    </div>
  );
}
