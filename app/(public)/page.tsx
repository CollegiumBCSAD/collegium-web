"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useGame } from "@/context/GameContext";
import { useAuth } from "@/context/AuthContext";
import { GAME_LIST } from "@/lib/games";
import { universitiesService, scrimsService, tournamentsService } from "@/services";
import { fetchTeamsApi, Team } from "@/lib/teams";
import { University, ScrimOffer, Tournament, GameId } from "@/types";
import { GamepadIcon, CheckCircleIcon } from "@/components/ui/Icons";

export default function LandingPage() {
  const { selectedGame, selectedGameInfo, openGameSelector, selectGame } = useGame();
  const { user } = useAuth();
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

  // Game-scoped scrims
  const gameScrims = useMemo(() => {
    return scrims.filter((s) => {
      if (!s.gameTitle) return true;
      const title = s.gameTitle.toLowerCase();
      if (activeGame === "valo") return title.includes("val");
      if (activeGame === "lol") return title.includes("lol") || title.includes("league");
      if (activeGame === "codm") return title.includes("cod") || title.includes("call");
      if (activeGame === "ml") return title.includes("ml") || title.includes("mobile");
      return true;
    });
  }, [scrims, activeGame]);

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
            <div className="w-full mb-6">
              <span className="font-sans text-xs font-normal tracking-widest text-secondary-brand uppercase flex items-center gap-2 mb-3">
                <span className="h-0.5 w-6 bg-secondary-brand shrink-0" />
                PHILIPPINE COLLEGIATE ESPORTS CIRCUIT
              </span>

              {selectedGameInfo && (
                <button
                  type="button"
                  onClick={openGameSelector}
                  className="group relative overflow-hidden inline-flex items-center gap-3.5 px-4 py-2.5 bg-[#080C16] border border-[#1E293B] hover:border-primary-brand/80 transition-all duration-300 hover:scale-[1.02] cursor-pointer shadow-xl backdrop-blur-xl"
                  style={{
                    boxShadow: `0 4px 20px rgba(0, 0, 0, 0.6), 0 0 20px ${selectedGameInfo.accentColor}25, inset 0 1px 1px rgba(255, 255, 255, 0.15)`,
                    clipPath: "polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))",
                  }}
                >
                  {/* Subtle dynamic ambient background glow */}
                  <div 
                    className="absolute -right-4 -bottom-4 w-24 h-24 rounded-full opacity-20 blur-xl pointer-events-none group-hover:opacity-40 transition-opacity"
                    style={{ backgroundColor: selectedGameInfo.accentColor }}
                  />

                  {/* Game Crest */}
                  <div 
                    className="relative w-9 h-9 overflow-hidden shrink-0 border border-white/20 shadow-md group-hover:scale-105 transition-transform"
                    style={{
                      clipPath: "polygon(3px 0, 100% 0, calc(100% - 3px) 100%, 0 100%)",
                    }}
                  >
                    <Image
                      src={selectedGameInfo.image}
                      alt={selectedGameInfo.name}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                  </div>

                  <div className="flex flex-col text-left">
                    <div className="flex items-center gap-1.5 leading-none mb-1">
                      <span 
                        className="w-1.5 h-1.5 rounded-full animate-ping shrink-0" 
                        style={{ backgroundColor: selectedGameInfo.accentColor }}
                      />
                      <span className="text-[8px] font-mono font-black tracking-widest text-slate-400 uppercase">
                        ACTIVE ARENA
                      </span>
                      <span className="text-[8px] font-mono text-slate-500">•</span>
                      <span className="text-[8px] font-mono font-bold text-slate-300 uppercase">
                        {selectedGameInfo.genre}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className="font-display text-base sm:text-lg font-black uppercase tracking-wider leading-none transition-colors"
                        style={{
                          color: selectedGameInfo.accentColor,
                          textShadow: `0 0 12px ${selectedGameInfo.accentColor}50`,
                        }}
                      >
                        {selectedGameInfo.name}
                      </span>
                      <span className="text-[8px] font-mono font-bold text-slate-400 group-hover:text-white uppercase tracking-wider bg-[#141A29] px-1.5 py-0.5 border border-[#232D44] flex items-center gap-0.5 transition-colors">
                        <span>SWITCH</span>
                        <span className="text-primary-brand">▾</span>
                      </span>
                    </div>
                  </div>
                </button>
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
            <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center w-full sm:w-auto gap-3 sm:gap-4">
              <Link
                href="/tournaments"
                className="inline-flex h-12 items-center justify-center game-theme-btn px-7 text-sm font-bold uppercase tracking-wider transition-all active:scale-[0.98] shadow-lg w-full sm:w-auto text-center font-display cursor-pointer"
              >
                Explore Tournaments
              </Link>

              <button
                type="button"
                onClick={openGameSelector}
                className="inline-flex h-12 items-center justify-center gap-2.5 tactical-btn-secondary px-7 text-sm font-bold uppercase tracking-wider text-white transition-all active:scale-[0.98] shadow-md w-full sm:w-auto text-center font-display cursor-pointer group"
                style={{
                  borderColor: selectedGameInfo ? `${selectedGameInfo.accentColor}66` : undefined,
                  boxShadow: selectedGameInfo ? `0 0 15px ${selectedGameInfo.accentColor}20` : undefined,
                }}
              >
                <GamepadIcon className="w-4 h-4 text-primary-brand group-hover:scale-110 transition-transform" />
                <span>Switch Game</span>
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

          {/* Unified High-Tech Esports Console & Live Matchmaking Hub */}
          <div className="lg:col-span-5 w-full mt-6 lg:mt-0">
            <div 
              className="relative overflow-hidden bg-[#0A0D18] border border-[#1E293B] shadow-2xl transition-all duration-300 hover:border-primary-brand/50"
              style={{
                clipPath: "polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px))",
              }}
            >
              {/* Dynamic Game Background Artwork Banner */}
              <div className="relative w-full h-32 overflow-hidden border-b border-[#182338]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={selectedGameInfo?.image || "/valorant.png"}
                  alt="Game Title Artwork"
                  className="w-full h-full object-cover object-center opacity-40 transition-transform duration-700 hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0D18] via-[#0A0D18]/60 to-transparent" />

                {/* Banner Header Overlay */}
                <div className="absolute inset-0 p-4 flex flex-col justify-between z-10">
                  <div className="flex items-center justify-between gap-2">
                    <span 
                      className="text-[9px] font-mono font-black tracking-widest text-primary-brand bg-black/80 backdrop-blur-md px-2.5 py-1 border border-primary-brand/40 flex items-center gap-1.5 shadow-md"
                      style={{
                        clipPath: "polygon(3px 0, 100% 0, calc(100% - 3px) 100%, 0 100%)",
                      }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-primary-brand animate-pulse" />
                      CIRCUIT TELEMETRY
                    </span>

                    <button
                      onClick={openGameSelector}
                      className="text-[9px] font-mono font-bold text-slate-200 bg-black/80 hover:bg-[#141A29] px-2.5 py-1 border border-[#232D44] transition-all cursor-pointer flex items-center gap-1"
                      style={{
                        clipPath: "polygon(3px 0, 100% 0, calc(100% - 3px) 100%, 0 100%)",
                      }}
                    >
                      <span>{selectedGameInfo?.shortName || "VALO"} TITLE</span>
                      <span className="text-primary-brand">▾</span>
                    </button>
                  </div>

                  <div className="flex items-end justify-between">
                    <div>
                      <h3 className="text-sm font-display font-black uppercase text-white tracking-wider block">
                        {selectedGameInfo?.name || "VALORANT"} CIRCUIT
                      </h3>
                      <span className="text-[9px] font-mono text-slate-400">
                        Official Inter-University Scrim Board & Brackets
                      </span>
                    </div>

                    <span 
                      className="text-[8px] font-mono font-bold text-emerald-400 bg-emerald-950/40 px-2 py-0.5 border border-emerald-800/50"
                      style={{
                        clipPath: "polygon(2px 0, 100% 0, calc(100% - 2px) 100%, 0 100%)",
                      }}
                    >
                      MATCHMAKING ONLINE
                    </span>
                  </div>
                </div>
              </div>

              {/* Console Body: Live Matchmaking Hub */}
              <div className="p-4 sm:p-5 space-y-4 bg-gradient-to-b from-[#0A0D18] via-[#080B14] to-[#0A0D18]">
                <div 
                  className="p-4 bg-[#060912] border border-[#182338] shadow-inner space-y-3.5"
                  style={{
                    clipPath: "polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))",
                  }}
                >
                  {user?.role === "ORGANIZER" ? (
                    <>
                      <div className="flex items-center justify-between text-[9px] font-mono text-slate-400 border-b border-[#141A29] pb-2">
                        <span className="text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                          ORGANIZER CONTROL HUB
                        </span>
                        <span className="text-emerald-400 font-bold">SANCTIONED ACCESS</span>
                      </div>

                      <div className="space-y-1.5 py-1">
                        <span className="text-xs font-display font-black uppercase text-white tracking-wide block">
                          Host & Direct Tournaments
                        </span>
                        <p className="text-xs font-sans text-slate-400 leading-relaxed">
                          Establish official collegiate brackets, manage varsity registrations, oversee live scores, and sanction championship matches.
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <Link
                          href="/dashboard"
                          className="flex items-center justify-center gap-1.5 h-10 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-mono text-xs font-black uppercase tracking-wider transition-all shadow-md shadow-amber-500/20"
                          style={{
                            clipPath: "polygon(6px 0, 100% 0, calc(100% - 6px) 100%, 0 100%)",
                          }}
                        >
                          <span>Host Tournament</span>
                        </Link>

                        <Link
                          href="/tournaments"
                          className="flex items-center justify-center gap-1.5 h-10 bg-[#141A29] hover:bg-[#1E293B] text-slate-200 border border-[#232D44] font-mono text-xs font-bold uppercase tracking-wider transition-all"
                          style={{
                            clipPath: "polygon(6px 0, 100% 0, calc(100% - 6px) 100%, 0 100%)",
                          }}
                        >
                          <span>Explore Brackets</span>
                        </Link>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center justify-between text-[9px] font-mono text-slate-400 border-b border-[#141A29] pb-2">
                        <span className="text-slate-300 font-bold uppercase tracking-wider flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                          {selectedGameInfo?.name || "COLLEGIATE"} MATCHMAKING
                        </span>
                        <span className="text-emerald-400 font-bold">READY FOR MATCHES</span>
                      </div>

                      <div className="space-y-1.5 py-1">
                        <span className="text-xs font-display font-black uppercase text-white tracking-wide block">
                          Collegiate Practice & Warm-ups
                        </span>
                        <p className="text-xs font-sans text-slate-400 leading-relaxed">
                          Find verified collegiate opponents for {selectedGameInfo?.name || "VALORANT"} custom lobby practice, veto testing, and tournament preparation.
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <Link
                          href="/scrims"
                          className="flex items-center justify-center gap-1.5 h-10 game-theme-btn font-mono text-xs font-bold uppercase tracking-wider transition-all"
                          style={{
                            clipPath: "polygon(6px 0, 100% 0, calc(100% - 6px) 100%, 0 100%)",
                          }}
                        >
                          <span>Open Scrim Board</span>
                        </Link>

                        <Link
                          href="/tournaments"
                          className="flex items-center justify-center gap-1.5 h-10 bg-[#141A29] hover:bg-[#1E293B] text-slate-200 border border-[#232D44] font-mono text-xs font-bold uppercase tracking-wider transition-all"
                          style={{
                            clipPath: "polygon(6px 0, 100% 0, calc(100% - 6px) 100%, 0 100%)",
                          }}
                        >
                          <span>Tournaments</span>
                        </Link>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Redesigned Premium Featured Esports Circuits Section */}
      <section className="py-12 sm:py-20 lg:py-28 relative overflow-hidden">
        {/* Soft Ambient Background Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-7xl h-[500px] bg-primary-brand/5 blur-[120px] pointer-events-none rounded-full" />

        <div className="mx-auto max-w-[1800px] w-full px-4 sm:px-6 md:px-10 lg:px-16 relative z-10 space-y-8 sm:space-y-12">
          
          {/* Header Bar */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[#182338]">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary-brand animate-ping" />
                <span className="text-[10px] font-mono font-extrabold uppercase tracking-widest text-primary-brand">
                  SANCTIONED COLLEGIATE CIRCUITS
                </span>
              </div>
              <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white uppercase">
                FEATURED ESPORTS TITLES
              </h2>
              <p className="font-sans text-xs sm:text-sm text-slate-400 max-w-xl leading-relaxed">
                Official inter-collegiate brackets, peer-verified scrimmages, and varsity Glicko-2 rankings across four premier esports.
              </p>
            </div>

            <button
              type="button"
              onClick={openGameSelector}
              className="h-10 px-5 bg-[#121828] hover:bg-[#1C253D] text-slate-300 hover:text-white border border-[#222E48] hover:border-primary-brand/50 font-display text-xs font-bold uppercase tracking-wider transition-all active:scale-95 flex items-center gap-2 cursor-pointer shadow-md shrink-0 self-start md:self-auto"
              style={{
                clipPath: "polygon(6px 0, 100% 0, calc(100% - 6px) 100%, 0 100%)",
              }}
            >
              <span>Manage Active Title</span>
              <span className="text-primary-brand font-bold">→</span>
            </button>
          </div>

          {/* 4 Games Grid */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {GAME_LIST.map((game) => {
              const isSelected = selectedGame === game.id;
              const gStat = gameStats[game.id] || { tourneys: 0, teamsCount: 0 };
              const displayTournaments = gStat.tourneys > 0 ? gStat.tourneys : game.activeTournaments;
              const displayTeams = gStat.teamsCount > 0 ? gStat.teamsCount : game.activeTeams;

              return (
                <div
                  key={game.id}
                  onClick={() => selectGame(game.id)}
                  className={`group relative flex flex-col justify-between overflow-hidden bg-[#0A0D18] border transition-all duration-300 cursor-pointer ${
                    isSelected
                      ? "border-primary-brand shadow-2xl shadow-primary-brand/10 -translate-y-1"
                      : "border-[#1E293B] hover:border-slate-500/60 hover:-translate-y-1 hover:shadow-xl"
                  }`}
                  style={{
                    clipPath: "polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px))",
                  }}
                >
                  {/* Top Specular Neon Strip in Game Accent Color */}
                  <div
                    className="absolute top-0 left-0 right-0 h-[2.5px] transition-opacity"
                    style={{
                      background: `linear-gradient(90deg, transparent 0%, ${game.accentColor} 50%, transparent 100%)`,
                      boxShadow: `0 0 12px ${game.accentColor}`,
                      opacity: isSelected ? 1 : 0.4,
                    }}
                  />

                  {/* Selected Active Main Badge */}
                  {isSelected && (
                    <div className="absolute top-3 right-3 z-20">
                      <span
                        className="text-[9px] font-mono font-black tracking-wider uppercase px-2.5 py-1 text-white shadow-lg flex items-center gap-1.5"
                        style={{
                          backgroundColor: game.accentColor,
                          clipPath: "polygon(4px 0, 100% 0, calc(100% - 4px) 100%, 0 100%)",
                        }}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                        ACTIVE TITLE
                      </span>
                    </div>
                  )}

                  <div className="p-5 sm:p-6 space-y-4">
                    {/* Hero Artwork with subtle zoom on hover */}
                    <div className="relative w-full aspect-[16/9] overflow-hidden bg-[#060810] border border-white/10 shadow-inner group-hover:border-white/20 transition-all">
                      <Image
                        src={game.image}
                        alt={game.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0A0D18] via-transparent to-black/20" />
                      
                      {/* Genre Pill Tag */}
                      <span className="absolute bottom-2 left-2 px-2 py-0.5 text-[9px] font-mono font-bold uppercase tracking-wider bg-black/80 backdrop-blur-md text-slate-300 border border-white/15">
                        {game.genre}
                      </span>
                    </div>

                    {/* Title & Tagline */}
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-display text-base sm:text-lg font-black tracking-wide text-white uppercase group-hover:text-primary-brand transition-colors truncate">
                          {game.name}
                        </h3>
                      </div>
                      <p className="text-[11px] font-sans text-slate-400 truncate mt-0.5">
                        {game.tagline || game.subtitle}
                      </p>
                    </div>

                    {/* Metrics Badges */}
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <div className="p-2 bg-[#060812] border border-[#182338] text-left">
                        <span className="text-[9px] font-mono uppercase tracking-widest text-slate-400 block font-bold">
                          TOURNAMENTS
                        </span>
                        <span className="font-display text-sm font-black text-white block mt-0.5">
                          {displayTournaments}
                        </span>
                      </div>

                      <div className="p-2 bg-[#060812] border border-[#182338] text-left">
                        <span className="text-[9px] font-mono uppercase tracking-widest text-slate-400 block font-bold">
                          SQUADS
                        </span>
                        <span className="font-display text-sm font-black text-white block mt-0.5">
                          {displayTeams}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card Action Footer */}
                  <div className="p-4 sm:p-5 pt-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        selectGame(game.id);
                      }}
                      className={`w-full h-9 font-display text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
                        isSelected
                          ? "game-theme-btn shadow-md"
                          : "bg-[#121828] hover:bg-[#1A253D] text-slate-300 hover:text-white border border-[#202C48]"
                      }`}
                      style={{
                        clipPath: "polygon(6px 0, 100% 0, calc(100% - 6px) 100%, 0 100%)",
                      }}
                    >
                      {isSelected ? (
                        <>
                          <CheckCircleIcon className="w-3.5 h-3.5" />
                          <span>Active Circuit</span>
                        </>
                      ) : (
                        <>
                          <span>Select {game.shortName}</span>
                          <span className="text-primary-brand">→</span>
                        </>
                      )}
                    </button>
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
