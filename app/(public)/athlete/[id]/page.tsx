"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { athletesService } from "@/services/athletesService";
import { AthleteProfile } from "@/types";
import { CrownIcon, ShieldIcon, SwordsIcon } from "@/components/ui/Icons";

function formatDate(iso: string): string {
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return "Date unknown";
  return parsed.toLocaleDateString(undefined, {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
}

export default function AthleteProfilePage() {
  const params = useParams();
  const athleteId = params?.id as string;

  const [profile, setProfile] = useState<AthleteProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!athleteId) return;
    let isMounted = true;

    athletesService
      .getPublicProfile(athleteId)
      .then((data) => {
        if (!isMounted) return;
        setProfile(data);
        setLoading(false);
      })
      .catch(() => {
        if (!isMounted) return;
        setNotFound(true);
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [athleteId]);

  if (loading) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center text-xs font-mono text-slate-400 animate-pulse">
        Loading Athlete Profile...
      </div>
    );
  }

  if (notFound || !profile) {
    return (
      <div className="min-h-[85vh] flex flex-col items-center justify-center p-6 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-[#141926] border border-[#232B3E] flex items-center justify-center text-rose-400 text-2xl shadow-xl">
          ⚠️
        </div>
        <h2 className="font-display text-2xl font-black uppercase text-white">Athlete Not Found</h2>
        <p className="text-xs font-sans text-slate-400 max-w-sm">
          No collegiate esports athlete profile exists for this account.
        </p>
        <Link
          href="/leaderboard"
          className="h-10 px-5 rounded-xl game-theme-btn font-sans text-xs font-bold uppercase tracking-wider inline-flex items-center gap-2 shadow-md"
        >
          Return to Leaderboard
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 game-theme-bg py-8 sm:py-12 px-4 sm:px-6 lg:px-12 relative animate-page-slide-in">
      <div className="max-w-4xl mx-auto space-y-8 w-full">
        {/* Identity Banner */}
        <div
          className="p-6 sm:p-8 bg-[#090C16] border border-[#1E293B] shadow-2xl relative"
          style={{
            clipPath: "polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px))",
          }}
        >
          <div
            className="absolute top-0 left-0 right-0 h-[2px]"
            style={{
              background: "linear-gradient(90deg, transparent 0%, var(--primary-brand) 50%, transparent 100%)",
              boxShadow: "0 0 12px var(--primary-brand)",
            }}
          />
          <div className="flex items-center gap-4">
            <div
              className="w-16 h-16 bg-[#121828] text-white flex items-center justify-center font-display font-black text-2xl border border-white/10 shrink-0"
              style={{
                clipPath: "polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)",
              }}
            >
              {profile.displayName.charAt(0)}
            </div>
            <div className="min-w-0">
              <h1 className="font-display text-xl sm:text-2xl font-black uppercase text-white tracking-wide truncate">
                {profile.displayName}
              </h1>
              <Link
                href={`/university/${profile.university.id}`}
                className="text-xs font-mono text-primary-brand hover:underline truncate block"
              >
                {profile.university.name}
              </Link>
              <span className="text-[10px] font-mono text-slate-500 block mt-0.5">
                Collegium Member Since {formatDate(profile.memberSince)}
              </span>
            </div>
          </div>

          {profile.gameHandles.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-5">
              {profile.gameHandles.map((h) => (
                <span
                  key={h.gameTitle}
                  className="text-[10px] font-mono font-bold text-slate-300 bg-[#101626] px-2.5 py-1 border border-[#202C45]"
                  style={{
                    clipPath: "polygon(6px 0, 100% 0, calc(100% - 6px) 100%, 0 100%)",
                  }}
                >
                  {h.gameTitle}: <span className="text-white">{h.handle}</span>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Team Rosters */}
        <div
          className="p-6 sm:p-8 bg-[#090C16] border border-[#1E293B] shadow-2xl space-y-4"
          style={{
            clipPath: "polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px))",
          }}
        >
          <h3 className="font-display text-sm font-black uppercase text-white tracking-wider flex items-center gap-2">
            <ShieldIcon className="w-4 h-4 text-primary-brand" />
            <span>Varsity Rosters</span>
          </h3>

          {profile.teams.length === 0 ? (
            <div className="p-6 bg-[#050711] border border-dashed border-[#2A3550] text-center">
              <p className="text-xs font-sans text-slate-400">
                {profile.displayName} isn&apos;t rostered on any varsity squad yet.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {profile.teams.map((team) => (
                <div
                  key={team.id}
                  className="p-4 bg-[#050711] border border-[#182338] flex items-center justify-between gap-3 shadow-inner"
                  style={{
                    clipPath: "polygon(10px 0, 100% 0, calc(100% - 10px) 100%, 0 100%)",
                  }}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-display text-xs font-bold uppercase text-white truncate">
                        {team.name}
                      </span>
                      {team.isCaptain && <CrownIcon className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 block truncate">
                      {team.gameHandle} {team.preferredRole ? `· ${team.preferredRole}` : ""}
                    </span>
                    <span className="text-[9px] font-mono text-slate-500 block mt-0.5">
                      Rating {Math.round(team.glicko2_rating)} ± {Math.round(team.glicko2_rd)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Match Log */}
        <div
          className="p-6 sm:p-8 bg-[#090C16] border border-[#1E293B] shadow-2xl space-y-3"
          style={{
            clipPath: "polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px))",
          }}
        >
          <h3 className="font-display text-sm font-black uppercase text-white tracking-wider flex items-center gap-2">
            <SwordsIcon className="w-4 h-4 text-primary-brand" />
            <span>Recent Match Log</span>
          </h3>

          {profile.recentMatches.length === 0 ? (
            <div className="p-6 bg-[#050711] border border-dashed border-[#2A3550] text-center">
              <p className="text-xs font-sans text-slate-400">No verified matches recorded yet.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {profile.recentMatches.map((match) => {
                const isVictory = match.result === "WIN";
                return (
                  <div
                    key={match.matchId}
                    className="p-3.5 bg-[#050711] border border-[#182338] flex items-center justify-between gap-4 shadow-inner"
                    style={{
                      clipPath: "polygon(10px 0, 100% 0, calc(100% - 10px) 100%, 0 100%)",
                    }}
                  >
                    <div className="min-w-0">
                      <span className="font-display text-sm font-bold uppercase text-white block truncate">
                        VS {match.opponentName || "Unknown Opponent"}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400 block truncate">
                        {match.tournamentName || (match.matchMode === "SCRIM" ? "Scrim" : "Tournament")} ·{" "}
                        {formatDate(match.playedAt)} · {match.kills}/{match.deaths}/{match.assists}
                      </span>
                    </div>
                    <span
                      className={`text-[9px] font-mono font-bold px-2.5 py-0.5 border shrink-0 ${
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
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
