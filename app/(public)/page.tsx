"use client";

import Link from "next/link";
import Image from "next/image";
import { useGame } from "@/context/GameContext";
import { GAME_LIST } from "@/lib/games";

export default function LandingPage() {
  const { selectedGame, selectedGameInfo, openGameSelector } = useGame();

  const stats = [
    { value: "48", label: "UNIVERSITIES" },
    { value: "312", label: "ACTIVE TEAMS" },
    { value: "1,204", label: "MATCHES LOGGED" },
  ];

  const matches = [
    {
      team1: { code: "UST", name: "Salinggawi", score: 2 },
      team2: { code: "FEU", name: "Tamaraws", score: 0 },
    },
    {
      team1: { code: "NU", name: "Bulldogs", score: 1 },
      team2: { code: "ADU", name: "Falcons", score: 2 },
    },
  ];

  return (
    <div className="flex flex-col flex-1 bg-gradient-to-b md:bg-gradient-to-r from-[#CC0000]/20 from-0% to-[#0A0C10] to-[50%] md:to-[40%]">
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
                  className="text-[10px] font-sans font-bold tracking-widest uppercase px-2.5 py-1 rounded-full text-white flex items-center gap-1.5"
                  style={{ backgroundColor: selectedGameInfo.accentColor }}
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
                className="inline-flex h-12 items-center justify-center rounded bg-primary-brand px-6 text-sm font-normal text-foreground transition-colors hover:bg-opacity-90 w-full sm:w-auto text-center"
              >
                Explore Tournaments
              </Link>
              <button
                onClick={openGameSelector}
                className="inline-flex h-12 items-center justify-center rounded border border-raised-panel bg-transparent px-6 text-sm font-normal text-foreground transition-colors hover:bg-raised-panel w-full sm:w-auto text-center cursor-pointer"
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

          <div className="lg:col-span-5 w-full mt-2 lg:mt-24">
            <div className="rounded-lg border border-raised-panel bg-card-bg/15 p-4 sm:p-6 shadow-xl backdrop-blur-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-3 text-xs font-normal uppercase tracking-wider mb-4 sm:mb-6">
                <span className="text-secondary-text truncate">
                  UAAP–NCAA INVITATIONAL · {selectedGameInfo ? selectedGameInfo.name : "VALORANT"}
                </span>
                <span className="text-secondary-text shrink-0">SEMIFINALS</span>
              </div>

              <div className="flex flex-col gap-3 sm:gap-4">
                {matches.map((m) => {
                  const t1Wins = m.team1.score > m.team2.score;
                  return (
                    <div
                      key={m.team1.code}
                      className="flex items-center gap-1.5 sm:gap-3 font-sans text-xs sm:text-sm"
                    >
                      <div
                        className={`flex-1 min-w-0 grid grid-cols-[auto_1fr_auto] items-center gap-1.5 sm:gap-2 border rounded px-2.5 sm:px-4 py-2 sm:py-2.5 bg-card-bg ${
                          t1Wins ? "border-secondary-brand" : "border-raised-panel"
                        }`}
                      >
                        <span className="text-[10px] sm:text-xs text-secondary-text font-normal whitespace-nowrap">
                          {m.team1.code}
                        </span>
                        <span className="font-semibold text-foreground truncate">
                          {m.team1.name}
                        </span>
                        <span
                          className={`font-display font-normal justify-self-end text-sm sm:text-base ${
                            t1Wins ? "text-secondary-brand" : "text-foreground"
                          }`}
                        >
                          {m.team1.score}
                        </span>
                      </div>
                      <span className="shrink-0 text-[10px] sm:text-2xs text-secondary-text px-0.5 sm:px-1 lowercase">vs</span>
                      <div
                        className={`flex-1 min-w-0 grid grid-cols-[auto_1fr_auto] items-center gap-1.5 sm:gap-2 border rounded px-2.5 sm:px-4 py-2 sm:py-2.5 bg-card-bg ${
                          !t1Wins ? "border-secondary-brand" : "border-raised-panel"
                        }`}
                      >
                        <span className="text-[10px] sm:text-xs text-secondary-text font-normal whitespace-nowrap">
                          {m.team2.code}
                        </span>
                        <span className="font-semibold text-foreground truncate">
                          {m.team2.name}
                        </span>
                        <span
                          className={`font-display font-normal justify-self-end text-sm sm:text-base ${
                            !t1Wins ? "text-secondary-brand" : "text-foreground"
                          }`}
                        >
                          {m.team2.score}
                        </span>
                      </div>
                    </div>
                  );
                })}

                <div className="mt-2 border border-secondary-brand bg-card-bg rounded px-4 sm:px-6 py-3 sm:py-4 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-6 font-sans text-center">
                  <span className="font-display text-xs sm:text-sm font-normal tracking-wider text-secondary-text text-opacity-95">
                    GRAND FINAL
                  </span>
                  <span className="font-display text-[11px] sm:text-xs font-normal text-secondary-text tracking-widest uppercase">
                    Sat - 3:00PM
                  </span>
                </div>
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
              className="text-xs font-sans font-semibold tracking-wider text-secondary-text hover:text-white uppercase flex items-center gap-2 underline underline-offset-4"
            >
              <span>Manage Main Game Selection</span>
              <span>→</span>
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {GAME_LIST.map((game) => {
              const isSelected = selectedGame === game.id;
              return (
                <div
                  key={game.id}
                  className={`relative flex flex-col justify-between rounded-xl border bg-card-bg p-4 transition-all duration-300 ${
                    isSelected
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
                        <span>{game.activeTournaments} tournaments</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <span className="text-primary-brand font-normal">•</span>
                        <span>{game.activeTeams} teams</span>
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
