"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useGame } from "@/context/GameContext";
import { GAME_LIST } from "@/lib/games";
import { universitiesService, scrimsService, tournamentsService } from "@/services";
import { fetchTeamsApi, Team } from "@/lib/teams";
import { University, ScrimOffer, Tournament, GameId } from "@/types";

interface DisplayMatch {
  title: string;
  stage: string;
  team1: { code: string; name: string; score: number };
  team2: { code: string; name: string; score: number };
  statusText: string;
}

export default function LandingPage() {
  const { selectedGame, selectedGameInfo, openGameSelector } = useGame();
  const activeGame: GameId = selectedGame || "valo";

  const [universities, setUniversities] = useState<University[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [scrims, setScrims] = useState<ScrimOffer[]>([]);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);

  useEffect(() => {
    let isMounted = true;
    Promise.allSettled([
      universitiesService.getUniversities(),
      fetchTeamsApi(),
      scrimsService.getScrims(),
      tournamentsService.getTournaments(),
    ]).then(([uniRes, teamsRes, scrimsRes, tourneyRes]) => {
      if (!isMounted) return;
      if (uniRes.status === "fulfilled") setUniversities(uniRes.value || []);
      if (teamsRes.status === "fulfilled") setTeams(teamsRes.value || []);
      if (scrimsRes.status === "fulfilled") setScrims(scrimsRes.value || []);
      if (tourneyRes.status === "fulfilled") setTournaments(tourneyRes.value || []);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  // Compute dynamic circuit stats
  const stats = useMemo(() => {
    const uniCount = universities.length > 0
      ? universities.length
      : new Set(teams.map((t) => t.universityName).filter(Boolean)).size || 12;

    const teamCount = teams.length > 0 ? teams.length : 24;
    const matchCount = scrims.length > 0 ? scrims.length + 15 : 42;

    return [
      { value: uniCount.toLocaleString(), label: "UNIVERSITIES" },
      { value: teamCount.toLocaleString(), label: "ACTIVE TEAMS" },
      { value: matchCount.toLocaleString(), label: "MATCHES LOGGED" },
    ];
  }, [universities, teams, scrims]);

  // Compute dynamic featured matches for the selected game
  const featuredMatches = useMemo((): DisplayMatch[] => {
    const filteredScrims = scrims.filter((s) => {
      if (!s.gameTitle) return true;
      const title = s.gameTitle.toLowerCase();
      if (activeGame === "valo") return title.includes("val");
      if (activeGame === "lol") return title.includes("lol") || title.includes("league");
      if (activeGame === "codm") return title.includes("cod") || title.includes("call");
      if (activeGame === "ml") return title.includes("ml") || title.includes("mobile");
      return true;
    });

    if (filteredScrims.length > 0) {
      return filteredScrims.slice(0, 2).map((s) => {
        const team1Code = s.hostTeamName ? s.hostTeamName.slice(0, 4).toUpperCase() : "HOST";
        const team2Code = s.opponentTeamName ? s.opponentTeamName.slice(0, 4).toUpperCase() : "TBD";
        return {
          title: `${selectedGameInfo?.name || "COLLEGIATE"} MATCH BOARD`,
          stage: s.status === "CONFIRMED" ? "MATCH BOOKED" : s.status === "PENDING" ? "REQUEST PENDING" : "OPEN CHALLENGE",
          team1: { code: team1Code, name: s.hostTeamName || "Varsity Squad", score: s.status === "CONFIRMED" ? 1 : 0 },
          team2: { code: team2Code, name: s.opponentTeamName || "Open Opponent", score: 0 },
          statusText: s.format || "BO3",
        };
      });
    }

    const gameTeams = teams.filter((t) => {
      const g = (t.gameTitle || "").toLowerCase();
      if (activeGame === "valo") return g.includes("val");
      if (activeGame === "lol") return g.includes("lol") || g.includes("league");
      if (activeGame === "codm") return g.includes("cod") || g.includes("call");
      if (activeGame === "ml") return g.includes("ml") || g.includes("mobile");
      return true;
    });

    const t1 = gameTeams[0] || { name: "Varsity Alpha", universityName: "UMAK" };
    const t2 = gameTeams[1] || { name: "Varsity Beta", universityName: "UST" };

    return [
      {
        title: `${selectedGameInfo?.name || "ESPORTS"} MATCHMAKING`,
        stage: "FEATURED SQUAD",
        team1: { code: (t1.universityName || "UMAK").slice(0, 4), name: t1.name, score: 2 },
        team2: { code: (t2.universityName || "UST").slice(0, 4), name: t2.name, score: 1 },
        statusText: "BO3",
      },
    ];
  }, [scrims, teams, activeGame, selectedGameInfo]);

  // Compute dynamic per-game metrics
  const gameStats = useMemo(() => {
    const map: Record<string, { tourneys: number; teamsCount: number }> = {
      valo: { tourneys: 0, teamsCount: 0 },
      lol: { tourneys: 0, teamsCount: 0 },
      codm: { tourneys: 0, teamsCount: 0 },
      ml: { tourneys: 0, teamsCount: 0 },
    };

    teams.forEach((t) => {
      const g = (t.gameTitle || "").toLowerCase();
      if (g.includes("val")) map.valo.teamsCount++;
      else if (g.includes("lol") || g.includes("league")) map.lol.teamsCount++;
      else if (g.includes("cod")) map.codm.teamsCount++;
      else if (g.includes("ml") || g.includes("mobile")) map.ml.teamsCount++;
    });

    tournaments.forEach((t) => {
      const g = (t.game || "").toLowerCase();
      if (g.includes("val")) map.valo.tourneys++;
      else if (g.includes("lol") || g.includes("league")) map.lol.tourneys++;
      else if (g.includes("cod")) map.codm.tourneys++;
      else if (g.includes("ml") || g.includes("mobile")) map.ml.tourneys++;
    });

    return map;
  }, [teams, tournaments]);

  return (
    <div className="flex flex-col flex-1 game-theme-bg">
      <section className="mx-auto max-w-[1800px] w-full px-4 sm:px-6 md:px-10 lg:px-16 py-10 sm:py-16 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12 lg:gap-16 items-start">
          <div className="lg:col-span-7 flex flex-col items-start text-left">
            <div className="flex items-center gap-3 mb-4 sm:mb-6 flex-wrap">
              <span className="font-sans text-xs font-normal tracking-widest text-secondary-brand uppercase flex items-center gap-2">
                <span className="h-0.5 w-6 bg-secondary-brand shrink-0" />
                PHILIPPINE COLLEGIATE ESPORTS CIRCUIT
              </span>
              {selectedGameInfo && (
                <span
                  className="text-[10px] font-sans font-bold tracking-widest uppercase px-2.5 py-1 rounded-full flex items-center gap-1.5"
                  style={{
                    backgroundColor: selectedGameInfo.accentColor,
                    color: selectedGameInfo.id === "codm" ? "#0A0C10" : "#FFFFFF",
                  }}
                >
                  <span>MAIN:</span>
                  <span>{selectedGameInfo.shortName}</span>
                </span>
              )}
            </div>

            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl xl:text-6xl font-semibold tracking-tight text-foreground leading-tight sm:leading-none">
              ONE CIRCUIT.<br />
              <span className="sm:whitespace-nowrap">EVERY <span className="text-primary-brand">UNIVERSITY.</span></span><br />
              EVERY GAME.
            </h1>
            <p className="mt-4 sm:mt-6 max-w-lg font-sans text-sm md:text-base text-secondary-text leading-relaxed">
              Collegium brings scrim scheduling, tournament brackets, and live rankings for Valorant, League of Legends, MLBB, and CODM into a single home for the Philippine collegiate scene.
            </p>
            <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row w-full sm:w-auto gap-3 sm:gap-4">
              <Link
                href="/tournaments"
                className="inline-flex h-12 items-center justify-center rounded game-theme-btn px-6 text-sm font-bold uppercase tracking-wider transition-all active:scale-[0.98] shadow-lg w-full sm:w-auto text-center font-display"
              >
                Explore Tournaments
              </Link>
              <button
                onClick={openGameSelector}
                className="inline-flex h-12 items-center justify-center rounded border border-raised-panel bg-gradient-to-r from-[#191D27] to-[#121520] hover:from-[#232836] hover:to-[#191D27] px-6 text-sm font-bold uppercase tracking-wider text-foreground transition-all active:scale-[0.98] w-full sm:w-auto text-center cursor-pointer font-display"
              >
                Switch Game Title
              </button>
            </div>

            <div className="mt-10 sm:mt-16 w-full pt-6 sm:pt-8 border-t border-raised-panel/30 sm:border-t-0">
              <div className="grid grid-cols-3 gap-4 sm:flex sm:flex-wrap sm:gap-12">
                {stats.map((stat) => (
                  <div key={stat.label} className="flex flex-col">
                    <span className="font-display text-xl sm:text-2xl font-bold text-foreground">
                      {stat.value}
                    </span>
                    <span className="mt-1 font-sans text-[10px] sm:text-xs tracking-wider sm:tracking-widest text-secondary-text uppercase">
                      {stat.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Hero Live Esports Broadcast & Match Hub Showcase */}
          <div className="lg:col-span-5 w-full mt-6 lg:mt-0">
            <div className="relative overflow-hidden rounded-3xl bg-[#0D121F]/95 border border-[#1E293B] shadow-2xl backdrop-blur-2xl space-y-5 p-6 group hover:border-primary-brand/40 transition-all duration-300">
              
              {/* Dynamic Game Background Artwork Banner Overlay */}
              <div className="relative w-full h-28 rounded-2xl overflow-hidden border border-[#1C2538] shadow-lg">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={selectedGameInfo?.image || "/valorant.png"}
                  alt="Game Title Artwork"
                  className="w-full h-full object-cover object-center opacity-45 group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#080C14] via-[#080C14]/70 to-transparent" />
                
                {/* Header Title & Game Switcher Selector */}
                <div className="absolute inset-0 p-4 flex flex-col justify-between">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-mono font-bold tracking-widest text-primary-brand bg-[#080C14]/90 px-2.5 py-1 rounded-full border border-primary-brand/30 flex items-center gap-1.5 shadow-sm">
                      <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                      LIVE MATCHDAY SHOWCASE
                    </span>

                    <button
                      onClick={openGameSelector}
                      className="text-[10px] font-mono font-bold text-slate-200 bg-[#080C14]/90 hover:bg-[#141A29] px-2.5 py-1 rounded-full border border-[#232D44] transition-all cursor-pointer"
                    >
                      {selectedGameInfo?.shortName || "VALO"} TITLE ▾
                    </button>
                  </div>

                  <div className="flex items-end justify-between">
                    <div>
                      <span className="text-xs font-display font-bold uppercase text-white tracking-wide block">
                        {selectedGameInfo?.name || "VALORANT"} CIRCUIT
                      </span>
                      <span className="text-[10px] font-mono text-slate-300">
                        Official Inter-University Scrim Board
                      </span>
                    </div>

                    <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-950/60 px-2.5 py-0.5 rounded border border-amber-500/30">
                      MAP 3 · ASCENT
                    </span>
                  </div>
                </div>
              </div>

              {/* Featured Head-to-Head Team VS Stage */}
              <div className="p-4 rounded-2xl bg-[#080C14] border border-[#1C2538] space-y-4 shadow-inner">
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 border-b border-[#1C2538] pb-2">
                  <span className="text-amber-400 font-bold uppercase tracking-wider">
                    {featuredMatches[0]?.stage || "FEATURED MATCHDAY"}
                  </span>
                  <span className="text-slate-300 font-bold bg-[#141A29] px-2 py-0.5 rounded border border-[#232D44]">
                    {featuredMatches[0]?.statusText || "BO3"}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-3">
                  {/* Team 1 Crest */}
                  <div className="flex flex-col items-center text-center space-y-1.5 flex-1 min-w-0">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-brand/80 to-rose-700 text-white flex items-center justify-center font-display text-base font-bold shadow-lg border border-white/10 shrink-0">
                      {featuredMatches[0]?.team1.code || "UMAK"}
                    </div>
                    <span className="font-sans text-xs font-bold text-white truncate max-w-full block">
                      {featuredMatches[0]?.team1.name || "UMak Varsity"}
                    </span>
                    <span className="text-[9px] font-mono text-slate-400">Host Squad</span>
                  </div>

                  {/* Score & VS Badge */}
                  <div className="flex flex-col items-center justify-center shrink-0 px-2">
                    <div className="flex items-center gap-2 bg-[#141A29] px-3.5 py-1.5 rounded-2xl border border-[#232D44]">
                      <span className="font-display text-2xl font-bold text-primary-brand">
                        {featuredMatches[0]?.team1.score ?? 2}
                      </span>
                      <span className="font-mono text-xs text-slate-500 font-bold">:</span>
                      <span className="font-display text-2xl font-bold text-white">
                        {featuredMatches[0]?.team2.score ?? 1}
                      </span>
                    </div>
                    <span className="text-[9px] font-mono text-emerald-400 font-bold mt-1">
                      MATCH IN PROGRESS
                    </span>
                  </div>

                  {/* Team 2 Crest */}
                  <div className="flex flex-col items-center text-center space-y-1.5 flex-1 min-w-0">
                    <div className="w-12 h-12 rounded-2xl bg-[#141A29] text-white flex items-center justify-center font-display text-base font-bold shadow-md border border-[#232D44] shrink-0">
                      {featuredMatches[0]?.team2.code || "DLSU"}
                    </div>
                    <span className="font-sans text-xs font-bold text-white truncate max-w-full block">
                      {featuredMatches[0]?.team2.name || "Challenger"}
                    </span>
                    <span className="text-[9px] font-mono text-slate-400">Challenger</span>
                  </div>
                </div>
              </div>

              {/* Circuit Top Leaderboard Ticker */}
              <div className="p-3 rounded-xl bg-[#080C14] border border-[#1C2538] space-y-2">
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                  <span>CIRCUIT LEADERBOARD STANDINGS</span>
                  <Link href="/leaderboard" className="text-primary-brand hover:underline font-bold">
                    View Rankings →
                  </Link>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-mono">
                  <div className="p-2 rounded-lg bg-[#141A29] border border-[#232D44]">
                    <span className="text-amber-400 font-bold block">#1 UMAK</span>
                    <span className="text-slate-300 block">1,500.0 PTS</span>
                  </div>
                  <div className="p-2 rounded-lg bg-[#141A29] border border-[#232D44]">
                    <span className="text-slate-300 font-bold block">#2 DLSU</span>
                    <span className="text-slate-400 block">1,480.0 PTS</span>
                  </div>
                  <div className="p-2 rounded-lg bg-[#141A29] border border-[#232D44]">
                    <span className="text-amber-600 font-bold block">#3 UST</span>
                    <span className="text-slate-400 block">1,450.0 PTS</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-1 grid grid-cols-2 gap-3">
                <Link
                  href="/scrims"
                  className="h-10 rounded-xl game-theme-btn font-sans text-xs font-bold uppercase tracking-wider shadow-lg flex items-center justify-center gap-1.5 transition-all active:scale-[0.98]"
                >
                  <span>Enter War Room</span>
                </Link>

                <Link
                  href="/scrims"
                  className="h-10 rounded-xl bg-[#141A29] hover:bg-[#1C243A] text-white font-sans text-xs font-semibold uppercase tracking-wider border border-[#232D44] transition-all flex items-center justify-center gap-1.5 shadow-md"
                >
                  <span>Browse Scrims →</span>
                </Link>
              </div>

            </div>
          </div>
        </div>
      </section>

      <section className="py-10 sm:py-16 lg:py-24">
        <div className="mx-auto max-w-[1800px] w-full px-4 sm:px-6 md:px-10 lg:px-16">
          <hr className="border-t border-raised-panel mb-8 sm:mb-12" />
          <div className="mb-8 sm:mb-12 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="font-sans text-2xl sm:text-3xl font-bold tracking-widest uppercase block">
                FEATURED GAMES
              </span>
              <h2 className="font-display text-xs sm:text-sm font-normal tracking-tight text-primary-brand mt-1 sm:mt-2">
                Multi-game competition, all in one home.
              </h2>
            </div>
            <button
              onClick={openGameSelector}
              className="text-xs font-sans font-semibold tracking-wider text-secondary-text hover:text-white uppercase flex items-center gap-2 underline underline-offset-4 cursor-pointer"
            >
              <span>Manage Main Game Selection</span>
              <span>→</span>
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {GAME_LIST.map((game) => {
              const isSelected = selectedGame === game.id;
              const gStat = gameStats[game.id] || { tourneys: 0, teamsCount: 0 };
              const displayTournaments = gStat.tourneys > 0 ? gStat.tourneys : game.activeTournaments;
              const displayTeams = gStat.teamsCount > 0 ? gStat.teamsCount : game.activeTeams;

              return (
                <div
                  key={game.id}
                  className={`relative flex flex-col justify-between rounded-xl border bg-card-bg p-4 transition-all duration-300 ${isSelected
                      ? `${game.borderColor} border-2`
                      : "border-raised-panel hover:border-raised-panel/80"
                    }`}
                >
                  {isSelected && (
                    <div
                      className="absolute -top-3 right-4 text-[10px] font-sans font-bold tracking-widest uppercase px-2.5 py-0.5 rounded-full text-white"
                      style={{ backgroundColor: game.accentColor }}
                    >
                      Selected Main
                    </div>
                  )}

                  <div>
                    <div className="relative w-full aspect-[16/9] overflow-hidden rounded-xl mb-4">
                      <Image
                        src={game.image}
                        alt={game.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <h3 className="font-display text-sm sm:text-base font-normal tracking-wide text-foreground px-1 mb-3">
                      {game.name}
                    </h3>
                    <ul className="space-y-1 text-xs text-secondary-text font-sans px-1">
                      <li className="flex items-center gap-1.5">
                        <span className="text-primary-brand font-normal">•</span>
                        <span>{displayTournaments} tournaments</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <span className="text-primary-brand font-normal">•</span>
                        <span>{displayTeams} active teams</span>
                      </li>
                    </ul>
                  </div>
                  <div className="mt-6 border-t border-raised-panel/50 pt-4 flex items-center justify-between px-1">
                    <span className="font-sans text-xs font-bold text-foreground tracking-wide uppercase">
                      ACTIVE
                    </span>
                    {isSelected && (
                      <span className="text-xs font-sans font-bold" style={{ color: game.accentColor }}>
                        ✓ PRIMARY
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
