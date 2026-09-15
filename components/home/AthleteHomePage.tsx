"use client";

import React, { useMemo, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { UserProfile, GameInfo, GameId, University, Tournament, ScrimOffer, NewsArticle } from "@/types";
import { Team, fetchTeamsApi } from "@/lib/teams";
import { mockNewsArticles } from "@/lib/mock/news";
import {
  TrophyIcon,
  SwordsIcon,
  UsersIcon,
  ClockIcon,
  FlameIcon,
} from "@/components/ui/Icons";

import { universitiesService, scrimsService } from "@/services";
import RosterDetailsModal from "@/components/dashboard/RosterDetailsModal";

interface AthleteHomePageProps {
  user: UserProfile | null;
  activeGame: GameId;
  selectedGameInfo: GameInfo | null;
  openGameSelector: () => void;
  selectGame: (gameId: GameId) => void;
  stats: { value: string; label: string }[];
  teams?: Team[];
  tournaments: Tournament[];
  scrims?: ScrimOffer[];
  universities?: University[];
  articles?: NewsArticle[];
}

export default function AthleteHomePage({
  user,
  activeGame,
  selectedGameInfo,
  stats,
  teams = [],
  tournaments,
  scrims = [],
  universities = [],
  articles = mockNewsArticles,
}: AthleteHomePageProps) {
  const router = useRouter();
  const [scrimFilter, setScrimFilter] = useState<"ALL" | "BO3" | "TIER1">("ALL");
  const [liveScrims, setLiveScrims] = useState<ScrimOffer[]>(scrims);
  const [liveUniversities, setLiveUniversities] = useState<University[]>(universities);
  const [liveTeams, setLiveTeams] = useState<Team[]>(teams);
  const [isRosterModalOpen, setIsRosterModalOpen] = useState(false);
  const [selectedSquad, setSelectedSquad] = useState<Team | null>(null);

  const refreshTeams = useCallback(() => {
    fetchTeamsApi().then((data) => {
      if (Array.isArray(data)) setLiveTeams(data);
    });
  }, []);

  const [prevTeams, setPrevTeams] = useState(teams);
  if (prevTeams !== teams) {
    setPrevTeams(teams);
    if (teams && teams.length > 0) {
      setLiveTeams(teams);
    }
  }

  useEffect(() => {
    refreshTeams();
  }, [refreshTeams]);

  // Find athlete's squad (matching activeGame first, then fallback to any squad)
  const userSquad = useMemo(() => {
    if (!user || liveTeams.length === 0) return null;
    const myId = user.id;
    const myEmail = user.email ? user.email.toLowerCase().trim() : "";
    const myName = user.displayName ? user.displayName.toLowerCase().trim() : "";

    // 1. First priority: Squad for active game
    const activeGameSquad = liveTeams.find(
      (t) =>
        t.gameTitle === activeGame &&
        ((myId && t.captainId === myId) ||
          (myName && t.captainName && t.captainName.toLowerCase().trim() === myName) ||
          t.members?.some(
            (m) =>
              m.status === "ACCEPTED" &&
              ((myId && m.userId === myId) ||
                (myEmail && m.email && m.email.toLowerCase().trim() === myEmail) ||
                (myName && m.displayName && m.displayName.toLowerCase().trim() === myName))
          ))
    );
    if (activeGameSquad) return activeGameSquad;

    // 2. Second priority: Any accepted squad the user belongs to
    return liveTeams.find(
      (t) =>
        (myId && t.captainId === myId) ||
        (myName && t.captainName && t.captainName.toLowerCase().trim() === myName) ||
        t.members?.some(
          (m) =>
            m.status === "ACCEPTED" &&
            ((myId && m.userId === myId) ||
              (myEmail && m.email && m.email.toLowerCase().trim() === myEmail) ||
              (myName && m.displayName && m.displayName.toLowerCase().trim() === myName))
        )
    ) || null;
  }, [user, liveTeams, activeGame]);

  const handleManageSquadClick = () => {
    if (userSquad) {
      setSelectedSquad(userSquad);
      setIsRosterModalOpen(true);
    } else {
      router.push("/team/create");
    }
  };

  // Synchronize live data from server for the active game
  useEffect(() => {
    let isMounted = true;
    scrimsService.getScrims(activeGame).then((data) => {
      if (isMounted && Array.isArray(data)) setLiveScrims(data);
    });
    universitiesService.getUniversities().then((data) => {
      if (isMounted && Array.isArray(data)) setLiveUniversities(data);
    });
    return () => {
      isMounted = false;
    };
  }, [activeGame]);

  // News Carousel state
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isFading, setIsFading] = useState(false);

  // Filter articles for active game or general
  const gameArticles = useMemo(() => {
    const list = articles.filter(
      (a) => a.gameId === activeGame || a.gameId === "general"
    );
    return list.length > 0 ? list : articles;
  }, [articles, activeGame]);

  const count = Math.min(gameArticles.length, 3);

  const changeSlide = useCallback(
    (newIdx: number) => {
      if (newIdx === selectedIdx || isFading) return;
      setIsFading(true);
      setTimeout(() => {
        setSelectedIdx(newIdx);
        setTimeout(() => {
          setIsFading(false);
        }, 30);
      }, 180);
    },
    [selectedIdx, isFading]
  );

  // Auto-play timer every 4.5 seconds (pauses on hover)
  useEffect(() => {
    if (isPaused || count <= 1) return;

    const interval = setInterval(() => {
      setIsFading(true);
      setTimeout(() => {
        setSelectedIdx((prev) => (prev + 1) % count);
        setTimeout(() => {
          setIsFading(false);
        }, 30);
      }, 180);
    }, 4500);

    return () => clearInterval(interval);
  }, [isPaused, count]);

  const activeArticle = gameArticles[selectedIdx] || gameArticles[0] || articles[0];

  const handlePrev = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    changeSlide((selectedIdx - 1 + count) % count);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    changeSlide((selectedIdx + 1) % count);
  };

  // Filter real scrims for active game without mock fallback
  const activeScrims = useMemo(() => {
    const sourceList = liveScrims.length > 0 ? liveScrims : scrims;
    return sourceList.filter(
      (s) => {
        const gameMatch = !s.gameTitle || s.gameTitle.toLowerCase().includes(activeGame);
        return gameMatch && s.status === "OPEN";
      }
    );
  }, [liveScrims, scrims, activeGame]);

  const filteredScrims = useMemo(() => {
    if (scrimFilter === "BO3") {
      return activeScrims.filter((s) => s.format.includes("BO3"));
    }
    if (scrimFilter === "TIER1") {
      return activeScrims.filter(
        (s) => s.rankRange.includes("Radiant") || s.rankRange.includes("Immortal")
      );
    }
    return activeScrims;
  }, [activeScrims, scrimFilter]);

  // Filter real tournaments for active game without mock fallback
  const activeTournaments = useMemo(() => {
    return tournaments.filter((t) => {
      const g = (t.game || t.gameTitle || "").toLowerCase();
      if (activeGame === "valo") return g.includes("val");
      if (activeGame === "lol") return g.includes("lol") || g.includes("league");
      if (activeGame === "codm") return g.includes("cod") || g.includes("call");
      if (activeGame === "ml") return g.includes("ml") || g.includes("mobile");
      return true;
    });
  }, [tournaments, activeGame]);

  // Real leaderboard ranking from universities
  const activeLeaderboard = useMemo(() => {
    const sourceList = liveUniversities.length > 0 ? liveUniversities : universities;
    if (!sourceList || sourceList.length === 0) return [];

    return [...sourceList]
      .sort((a, b) => (b.glicko2_rating || 0) - (a.glicko2_rating || 0))
      .slice(0, 5)
      .map((u, idx) => ({
        id: u.id,
        rank: idx + 1,
        university: u.name.toUpperCase(),
        rating: u.glicko2_rating || 1000,
        winRate:
          (u.wins || 0) + (u.losses || 0) > 0
            ? Math.round(((u.wins || 0) / ((u.wins || 0) + (u.losses || 0))) * 100)
            : 0,
        streak:
          (u.wins || 0) > 0
            ? `${Math.min(u.wins, 9)}W`
            : `${Math.min(u.losses || 0, 9)}L`,
      }));
  }, [liveUniversities, universities]);

  return (
    <div className="flex flex-col flex-1 game-theme-bg">
      {/* 1. HERO ATHLETE COMMAND STATION */}
      <section className="relative pt-8 sm:pt-12 pb-8 sm:pb-12">
        {/* Background Tactical Collegiate Watermark */}
        <div className="pointer-events-none absolute -top-12 left-1/2 -translate-x-1/2 w-full max-w-[1500px] h-[580px] opacity-[0.09] overflow-hidden z-0 select-none">
          <svg viewBox="0 0 1200 500" fill="none" className="w-full h-full">
            <g transform="translate(600, 240)">
              <circle cx="0" cy="0" r="210" stroke="var(--primary-brand, #EF4444)" strokeWidth="1" strokeDasharray="10 14 3 14" className="animate-spin-slow" />
              <polygon points="0,-125 105,-62 105,62 0,125 -105,62 -105,-62" stroke="var(--primary-brand, #EF4444)" strokeWidth="1.5" fill="none" />
              <path d="M-105,0 L-220,0 L-270,-45 L-380,-45" stroke="var(--primary-brand, #EF4444)" strokeWidth="1.2" fill="none" />
              <circle cx="-380" cy="-45" r="3" fill="var(--primary-brand, #EF4444)" />
              <path d="M105,0 L220,0 L270,-45 L380,-45" stroke="var(--primary-brand, #EF4444)" strokeWidth="1.2" fill="none" />
              <circle cx="380" cy="45" r="3" fill="var(--primary-brand, #EF4444)" />
            </g>
          </svg>
        </div>

        <div className="relative z-10 mx-auto w-full max-w-[1600px] px-4 sm:px-6 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
            {/* Left Column: Hero Title & Competitor Action Deck */}
            <div className="lg:col-span-7 flex flex-col items-start text-left space-y-5">
              {/* Header Status Rail */}
              <div className="flex items-center gap-3">
                <span className="font-mono text-[10px] sm:text-xs font-bold tracking-widest text-secondary-brand uppercase flex items-center gap-2">
                  <span className="h-0.5 w-5 bg-secondary-brand shrink-0" />
                  PHILIPPINE COLLEGIATE ESPORTS
                </span>
              </div>

              {/* Sophisticated High-Impact Headline */}
              <h1 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tight text-white leading-none">
                YOUR VARSITY ARENA.<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-400">
                  ONE CIRCUIT.
                </span><br />
                <span className="text-primary-brand">LIVE TELEMETRY.</span>
              </h1>

              <p className="max-w-xl font-sans text-xs sm:text-sm text-slate-400 leading-relaxed">
                Official varsity championship brackets, real-time match scoring, player telemetry, and verified collegiate scrims across top Philippine universities.
              </p>

              {/* Action Buttons for Athletes */}
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <Link
                  href="/tournaments"
                  className="inline-flex h-11 items-center justify-center gap-2 game-theme-btn px-6 text-xs font-black uppercase tracking-wider shadow-lg transition-all active:scale-95"
                  style={{
                    clipPath: "polygon(6px 0, 100% 0, calc(100% - 6px) 100%, 0 100%)",
                  }}
                >
                  <TrophyIcon className="w-3.5 h-3.5" />
                  <span>Explore Tournaments</span>
                </Link>

                <Link
                  href="/scrims"
                  className="inline-flex h-11 items-center justify-center gap-2 bg-[#121828] hover:bg-[#1A253D] text-slate-200 hover:text-white border border-[#232F4A] px-6 text-xs font-bold uppercase tracking-wider transition-all shadow-md active:scale-95"
                  style={{
                    clipPath: "polygon(6px 0, 100% 0, calc(100% - 6px) 100%, 0 100%)",
                  }}
                >
                  <SwordsIcon className="w-3.5 h-3.5 text-primary-brand" />
                  <span>Open Scrim Board</span>
                </Link>

                <button
                  type="button"
                  onClick={handleManageSquadClick}
                  className="inline-flex h-11 items-center justify-center gap-2 bg-[#121828] hover:bg-[#1A253D] text-slate-200 hover:text-white border border-[#232F4A] px-5 text-xs font-bold uppercase tracking-wider transition-all shadow-md active:scale-95 cursor-pointer"
                  style={{
                    clipPath: "polygon(6px 0, 100% 0, calc(100% - 6px) 100%, 0 100%)",
                  }}
                  title={userSquad ? `Manage ${userSquad.name} roster` : "Create or join a varsity squad"}
                >
                  <UsersIcon className="w-3.5 h-3.5 text-sky-400" />
                  <span>Manage Squad</span>
                </button>
              </div>

              {/* Live Circuit Telemetry Counters */}
              <div className="pt-2 w-full">
                <div className="flex flex-wrap items-center gap-6 sm:gap-10">
                  {stats.map((stat, idx) => (
                    <div key={idx} className="flex items-center gap-4 sm:gap-6">
                      <div className="flex flex-col">
                        <div className="flex items-baseline">
                          <span className="font-display text-2xl sm:text-3xl font-black text-white tracking-tight leading-none">
                            {stat.value}
                          </span>
                        </div>
                        <span className="font-mono text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                          {stat.label}
                        </span>
                      </div>
                      {idx < stats.length - 1 && (
                        <div className="hidden sm:block h-8 w-px bg-gradient-to-b from-transparent via-[#253556] to-transparent" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Futuristic Carousel Circuit Dispatch Terminal (News Display) */}
            <div 
              className="lg:col-span-5 w-full flex flex-col gap-3"
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
            >
              {/* Terminal Top Control Rail */}
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
                  <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-300">
                    CIRCUIT INTEL
                  </span>
                </div>

                {/* Indicator Lines / Progress Dashes */}
                <div className="flex items-center gap-1.5 bg-[#090D18]/90 px-2.5 py-1.5 rounded-full border border-[#1C2742]">
                  {gameArticles.slice(0, count).map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => changeSlide(idx)}
                      className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                        selectedIdx === idx
                          ? "w-6 bg-primary-brand shadow-sm shadow-primary-brand/50"
                          : "w-2.5 bg-[#202C48] hover:bg-slate-400"
                      }`}
                      aria-label={`Go to slide ${idx + 1}`}
                    />
                  ))}
                </div>
              </div>

              {/* Main Interactive Dispatch Showcase with Left/Right Arrows */}
              {activeArticle && (
                <div className="relative group/carousel">
                  {/* Left Arrow Button */}
                  <button
                    type="button"
                    onClick={handlePrev}
                    className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-[#070A12]/80 hover:bg-primary-brand text-slate-300 hover:text-white border border-[#202C48] hover:border-primary-brand flex items-center justify-center transition-all shadow-xl backdrop-blur-md cursor-pointer hover:scale-110 active:scale-95"
                    aria-label="Previous Dispatch"
                  >
                    <span className="font-bold text-sm leading-none -ml-0.5">‹</span>
                  </button>

                  {/* Right Arrow Button */}
                  <button
                    type="button"
                    onClick={handleNext}
                    className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-[#070A12]/80 hover:bg-primary-brand text-slate-300 hover:text-white border border-[#202C48] hover:border-primary-brand flex items-center justify-center transition-all shadow-xl backdrop-blur-md cursor-pointer hover:scale-110 active:scale-95"
                    aria-label="Next Dispatch"
                  >
                    <span className="font-bold text-sm leading-none -mr-0.5">›</span>
                  </button>

                  <Link
                    href="/community"
                    className="relative flex flex-col justify-end overflow-hidden bg-gradient-to-b from-[#0E1526]/90 via-[#0A0F1D]/90 to-[#070A12] border border-[#1E2B48]/80 group-hover/carousel:border-primary-brand/60 shadow-2xl p-5 sm:p-6 min-h-[300px] sm:min-h-[330px] rounded-2xl block"
                  >
                    {/* Subtle Fade-in Container */}
                    <div
                      className={`transition-opacity duration-300 ease-in-out ${
                        isFading ? "opacity-0" : "opacity-100"
                      }`}
                    >
                      {/* Background Artwork with Smooth Dark Vignette */}
                      <div className="absolute inset-0 z-0">
                        <Image
                          src={activeArticle.image}
                          alt={activeArticle.title}
                          fill
                          className="object-cover opacity-35 group-hover/carousel:scale-105 group-hover/carousel:opacity-45 transition-all duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#070A12] via-[#070A12]/80 to-transparent" />
                        <div className="absolute inset-0 bg-gradient-to-r from-[#070A12]/80 via-transparent to-transparent" />
                      </div>

                      {/* Content Overlay */}
                      <div className="relative z-10 space-y-3 px-6 sm:px-8">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-full bg-primary-brand/20 border border-primary-brand/50 text-primary-brand font-mono text-[9px] font-black uppercase tracking-wider">
                            {activeArticle.category || "CIRCUIT DISPATCH"}
                          </span>
                          <span className="flex items-center gap-1 font-mono text-[10px] text-slate-400">
                            <ClockIcon className="w-3 h-3 text-slate-400" />
                            {activeArticle.date}
                          </span>
                        </div>

                        <h3 className="font-display text-lg sm:text-xl font-black uppercase text-white tracking-wide group-hover/carousel:text-primary-brand transition-colors line-clamp-2 leading-tight">
                          {activeArticle.title}
                        </h3>

                        <p className="font-sans text-xs text-slate-300 line-clamp-2 leading-relaxed">
                          {activeArticle.excerpt}
                        </p>

                        <div className="pt-2.5 border-t border-[#1C2844] flex items-center justify-between font-mono text-[10px] text-slate-400">
                          <span className="text-slate-400 truncate">BY {activeArticle.author || "COLLEGIUM DESK"}</span>
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#10172B] group-hover/carousel:bg-primary-brand text-slate-200 group-hover/carousel:text-white font-mono text-[9px] font-bold tracking-wider uppercase border border-[#223154] group-hover/carousel:border-primary-brand transition-all">
                            <span>READ ARTICLE</span>
                            <span>→</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 2. CORE OPERATIONS MATRIX (DIMENSIONAL & SOPHISTICATED) */}
      <section className="py-8 sm:py-12 border-t border-[#182338] relative">
        <div className="mx-auto w-full max-w-[1600px] px-4 sm:px-6 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
            {/* Left 8 Cols: Live Varsity Scrimmage Radar */}
            <div className="lg:col-span-8 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#182338]">
                <div className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-primary-brand animate-ping" />
                  <h2 className="font-display text-lg sm:text-xl font-black uppercase text-white tracking-wide">
                    LIVE VARSITY SCRIM RADAR
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#111828] text-slate-300 font-mono text-[10px] font-bold border border-[#1E2B48]">
                    {filteredScrims.length} OPEN
                  </span>
                </div>

                <div className="flex items-center gap-2.5">
                  {/* Refined Segmented Filter Rail */}
                  <div className="flex items-center gap-1 bg-[#080D18] p-1 rounded-xl border border-[#1A253D]">
                    <button
                      type="button"
                      onClick={() => setScrimFilter("ALL")}
                      className={`px-3 py-1 rounded-lg font-mono text-[10px] font-bold uppercase transition-all cursor-pointer ${
                        scrimFilter === "ALL"
                          ? "bg-[#18243C] text-white border border-[#273A60] shadow-sm"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      ALL
                    </button>
                    <button
                      type="button"
                      onClick={() => setScrimFilter("BO3")}
                      className={`px-3 py-1 rounded-lg font-mono text-[10px] font-bold uppercase transition-all cursor-pointer ${
                        scrimFilter === "BO3"
                          ? "bg-[#18243C] text-white border border-[#273A60] shadow-sm"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      BO3 ONLY
                    </button>
                    <button
                      type="button"
                      onClick={() => setScrimFilter("TIER1")}
                      className={`px-3 py-1 rounded-lg font-mono text-[10px] font-bold uppercase transition-all cursor-pointer ${
                        scrimFilter === "TIER1"
                          ? "bg-[#18243C] text-white border border-[#273A60] shadow-sm"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      TIER 1
                    </button>
                  </div>

                  <Link
                    href="/scrims"
                    className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-[#12192B] hover:bg-primary-brand text-slate-200 hover:text-white border border-[#22314E] hover:border-primary-brand font-mono text-[10px] font-bold uppercase transition-all shadow-sm"
                  >
                    <span>+ Post Scrim</span>
                  </Link>
                </div>
              </div>

              {/* Scrims Cards Grid: Rich Layered Glassmorphism */}
              {filteredScrims.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 sm:p-12 rounded-2xl bg-gradient-to-b from-[#0F1628]/80 via-[#0B101D]/80 to-[#070A12] border border-dashed border-[#1E2B48] text-center space-y-3">
                  <div className="w-12 h-12 rounded-xl bg-[#141C30] border border-[#233150] flex items-center justify-center text-slate-400">
                    <SwordsIcon className="w-6 h-6 text-slate-400" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-display text-base font-black uppercase text-white tracking-wide">
                      No Open Scrim Offers in {selectedGameInfo?.name || "Circuit"}
                    </h4>
                    <p className="font-sans text-xs text-slate-400 max-w-md leading-relaxed">
                      There are currently no active scrim lobbies matching your criteria. Post the first challenge to find a varsity practice opponent!
                    </p>
                  </div>
                  <Link
                    href="/scrims"
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl game-theme-btn font-mono text-[10px] font-black uppercase tracking-wider shadow-md hover:scale-105 active:scale-95 transition-all"
                  >
                    <span>+ Post Scrim Offer</span>
                    <span>→</span>
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                  {filteredScrims.map((scrim) => {
                    const initialLetters = scrim.hostTeamName
                      .split(" ")
                      .slice(0, 2)
                      .map((w) => w.charAt(0))
                      .join("");

                    return (
                      <div
                        key={scrim.id}
                        className="flex flex-col justify-between p-5 rounded-2xl bg-gradient-to-b from-[#0F1628]/95 via-[#0B101D]/95 to-[#070A12] border border-[#1C2742] hover:border-slate-400/40 shadow-[0_8px_30px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.05)] hover:-translate-y-0.5 transition-all duration-300 group"
                      >
                        <div className="space-y-3.5">
                          {/* Card Top Header */}
                          <div className="flex items-center justify-between">
                            <span className="px-2.5 py-0.5 rounded-full bg-emerald-950/40 border border-emerald-500/20 text-emerald-300 font-mono text-[9px] font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                              OPEN FOR CHALLENGE
                            </span>

                            <span className="font-mono text-[10px] text-slate-400 flex items-center gap-1 bg-[#090E1B] px-2.5 py-0.5 rounded-full border border-[#1A253D]">
                              <ClockIcon className="w-3 h-3 text-slate-400" />
                              {new Date(scrim.scheduledAt).toLocaleDateString([], { month: "short", day: "numeric" })}
                            </span>
                          </div>

                          {/* Team Info & University Avatar */}
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#18233C] to-[#0D1424] border border-[#253556] text-white flex items-center justify-center font-display font-black text-xs shrink-0 shadow-inner group-hover:border-primary-brand/50 transition-colors">
                              {initialLetters || "VS"}
                            </div>

                            <div className="min-w-0 flex-1">
                              <h4 className="font-display text-base font-black uppercase text-white tracking-wide group-hover:text-primary-brand transition-colors truncate">
                                {scrim.hostTeamName}
                              </h4>
                              <p className="font-mono text-[10px] text-slate-400 font-bold uppercase truncate">
                                {scrim.universityName}
                              </p>
                            </div>
                          </div>

                          {/* Match Specifications Strip */}
                          <div className="flex flex-wrap items-center gap-2 pt-0.5">
                            <span className="px-2.5 py-1 rounded-lg bg-[#0A0F1D] border border-[#1B2740] text-slate-300 font-mono text-[10px] font-bold">
                              {scrim.format}
                            </span>
                            <span className="px-2.5 py-1 rounded-lg bg-[#0A0F1D] border border-[#1B2740] text-sky-300 font-mono text-[10px] font-bold">
                              {scrim.rankRange}
                            </span>
                          </div>

                          {scrim.notes && (
                            <p className="font-sans text-xs text-slate-400 line-clamp-2 leading-relaxed">
                              &ldquo;{scrim.notes}&rdquo;
                            </p>
                          )}
                        </div>

                        {/* Card Footer */}
                        <div className="pt-3.5 mt-3.5 border-t border-[#182338] flex items-center justify-between">
                          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                            WAR ROOM READY
                          </span>

                          <Link
                            href="/scrims"
                            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full game-theme-btn font-mono text-[10px] font-black uppercase tracking-wider shadow-md hover:scale-105 active:scale-95 transition-all"
                          >
                            <span>Challenge Squad</span>
                            <span>→</span>
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Right 4 Cols: Sanctioned Tournaments & Power Rankings */}
            <div className="lg:col-span-4 space-y-6">
              {/* Sanctioned Tournaments Widget */}
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-[#182338]">
                  <div className="flex items-center gap-2">
                    <TrophyIcon className="w-4 h-4 text-amber-400" />
                    <h3 className="font-display text-base font-black uppercase text-white tracking-wide">
                      SANCTIONED BRACKETS
                    </h3>
                  </div>
                  <Link href="/tournaments" className="font-mono text-[10px] font-bold text-primary-brand hover:underline">
                    VIEW ALL →
                  </Link>
                </div>

                {activeTournaments.length === 0 ? (
                  <div className="p-6 rounded-2xl bg-gradient-to-b from-[#0F1628]/80 via-[#0B101D]/80 to-[#070A12] border border-dashed border-[#1E2B48] text-center space-y-2">
                    <p className="font-mono text-xs font-bold text-slate-300 uppercase tracking-wider">
                      No Active Brackets Found
                    </p>
                    <p className="font-sans text-[11px] text-slate-400 leading-relaxed">
                      Sanctioned collegiate tournament brackets will be displayed here as organizers launch upcoming qualifiers.
                    </p>
                    <Link
                      href="/tournaments"
                      className="inline-flex items-center gap-1 text-primary-brand font-mono text-[10px] font-bold uppercase hover:underline pt-1"
                    >
                      <span>View All Tournaments</span>
                      <span>→</span>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {activeTournaments.map((tourney) => (
                      <div
                        key={tourney.id}
                        className="p-4 rounded-2xl bg-gradient-to-b from-[#0F1628]/95 via-[#0B101D]/95 to-[#070A12] border border-[#1C2742] hover:border-slate-400/40 shadow-[0_4px_20px_rgba(0,0,0,0.4)] transition-all space-y-2.5 group"
                      >
                        <div className="flex items-center justify-between">
                          <span className="px-2.5 py-0.5 rounded-full bg-[#121A2D] text-slate-300 border border-[#202E4C] font-mono text-[9px] font-bold uppercase">
                            {tourney.bracketFormat || "Tournament"}
                          </span>
                          <span className="text-[9px] font-mono text-emerald-300 bg-emerald-950/40 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold uppercase">
                            {tourney.statusText || tourney.status || "LIVE"}
                          </span>
                        </div>

                        <h4 className="font-display text-sm font-black uppercase text-white tracking-wide group-hover:text-primary-brand transition-colors leading-tight">
                          {tourney.title}
                        </h4>

                        <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-1.5 border-t border-[#182338]">
                          <span>Quota: {tourney.teamQuota || 16} Squads</span>
                          <Link
                            href="/tournaments"
                            className="text-primary-brand font-bold hover:underline inline-flex items-center gap-1"
                          >
                            <span>View Bracket</span>
                            <span>→</span>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Power Rankings Snapshot */}
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-[#182338]">
                  <div className="flex items-center gap-2">
                    <FlameIcon className="w-4 h-4 text-primary-brand" />
                    <h3 className="font-display text-base font-black uppercase text-white tracking-wide">
                      POWER RANKINGS (TOP 5)
                    </h3>
                  </div>
                  <Link href="/leaderboard" className="font-mono text-[10px] font-bold text-primary-brand hover:underline">
                    FULL BOARD →
                  </Link>
                </div>

                {activeLeaderboard.length === 0 ? (
                  <div className="p-6 rounded-2xl bg-gradient-to-b from-[#0F1628]/80 via-[#0B101D]/80 to-[#070A12] border border-dashed border-[#1E2B48] text-center space-y-1">
                    <p className="font-mono text-xs font-bold text-slate-300 uppercase tracking-wider">
                      Awaiting Ranking Data
                    </p>
                    <p className="font-sans text-[11px] text-slate-400">
                      Rankings will populate as universities compete in collegiate matches.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {activeLeaderboard.map((entry, idx) => (
                      <div
                        key={entry.id}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-gradient-to-r from-[#0C1221] to-[#070B14] border border-[#1A253D] hover:border-[#27385C] transition-all text-[11px]"
                      >
                        <div className="flex items-center gap-2.5">
                          <span
                            className={`w-5 h-5 rounded-md text-[10px] font-black flex items-center justify-center ${
                              idx === 0
                                ? "bg-amber-400/20 border border-amber-400/40 text-amber-300"
                                : idx === 1
                                ? "bg-slate-300/20 border border-slate-300/40 text-slate-200"
                                : idx === 2
                                ? "bg-amber-700/20 border border-amber-700/40 text-amber-400"
                                : "bg-[#111829] border border-[#1A253D] text-slate-400"
                            }`}
                          >
                            {idx + 1}
                          </span>
                          <div>
                            <span className="font-display font-black text-white uppercase block leading-none truncate max-w-[150px]">
                              {entry.university}
                            </span>
                            <span className="text-[9px] font-mono text-slate-400 block mt-0.5">
                              Streak: {entry.streak} • {entry.winRate}% WR
                            </span>
                          </div>
                        </div>

                        <span className="font-mono font-black text-white bg-[#101728] px-2 py-0.5 rounded border border-[#1E2B48]">
                          {entry.rating.toFixed(1)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Squad Roster Management Modal */}
      {selectedSquad && (
        <RosterDetailsModal
          team={selectedSquad}
          isOpen={isRosterModalOpen}
          onClose={() => setIsRosterModalOpen(false)}
          onRosterUpdated={refreshTeams}
        />
      )}
    </div>
  );
}
