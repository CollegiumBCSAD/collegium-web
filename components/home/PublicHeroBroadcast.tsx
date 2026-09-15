"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { GameInfo, GameId, NewsArticle } from "@/types";
import { TrophyIcon, ClockIcon } from "@/components/ui/Icons";

interface PublicHeroBroadcastProps {
  activeGame: GameId;
  selectedGameInfo: GameInfo | null;
  openGameSelector: () => void;
  stats: { value: string; label: string }[];
  articles: NewsArticle[];
}

export default function PublicHeroBroadcast({
  activeGame,
  selectedGameInfo,
  openGameSelector,
  stats,
  articles,
}: PublicHeroBroadcastProps) {
  const [selectedIdx, setSelectedIdx] = React.useState(0);
  const [isPaused, setIsPaused] = React.useState(false);
  const [isFading, setIsFading] = React.useState(false);

  // Filter for active game or general
  const gameArticles = React.useMemo(() => {
    const list = articles.filter(
      (a) => a.gameId === activeGame || a.gameId === "general"
    );
    return list.length > 0 ? list : articles;
  }, [articles, activeGame]);

  const count = Math.min(gameArticles.length, 3);

  const changeSlide = React.useCallback(
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
  React.useEffect(() => {
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

  // Ensure selectedIdx is in range when game changes
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

  return (
    <section className="relative pt-8 sm:pt-12 pb-6 sm:pb-8">
      {/* Top Black Vignette Blending into Game Glow Beneath */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A0C10]/70 via-transparent to-transparent" />
      </div>

      {/* Authentic Collegiate Esports Circuit Telemetry & Tournament Matrix Watermark */}
      <div className="pointer-events-none absolute -top-12 left-1/2 -translate-x-1/2 w-full max-w-[1500px] h-[580px] opacity-[0.11] overflow-hidden z-0 select-none">
        <svg
          viewBox="0 0 1200 500"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          <defs>
            <linearGradient id="collegiumCircuitGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="var(--primary-brand, #EF4444)" stopOpacity="0.9" />
              <stop offset="50%" stopColor="var(--secondary-brand, #3B82F6)" stopOpacity="0.5" />
              <stop offset="100%" stopColor="var(--primary-brand, #EF4444)" stopOpacity="0.2" />
            </linearGradient>
            <radialGradient id="circuitCenterGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="var(--primary-brand, #EF4444)" stopOpacity="0.12" />
              <stop offset="100%" stopColor="transparent" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Central Tactical Collegiate Crest & Bracket Nexus */}
          <g transform="translate(600, 240)">
            {/* Center Radial Glow */}
            <circle cx="0" cy="0" r="240" fill="url(#circuitCenterGlow)" />

            {/* Rotating Outer Telemetry Ring with Precision Dashes */}
            <circle
              cx="0"
              cy="0"
              r="210"
              stroke="url(#collegiumCircuitGrad)"
              strokeWidth="1"
              strokeDasharray="10 14 3 14"
              className="animate-spin-slow"
            />
            <circle
              cx="0"
              cy="0"
              r="170"
              stroke="currentColor"
              strokeWidth="0.8"
              strokeDasharray="40 20 8 20"
              className="text-slate-500/40"
            />

            {/* Tactical Compass / Degree Tick Marks */}
            <g stroke="currentColor" strokeWidth="1" className="text-slate-400/40">
              <line x1="0" y1="-220" x2="0" y2="-200" />
              <line x1="0" y1="200" x2="0" y2="220" />
              <line x1="-220" y1="0" x2="-200" y2="0" />
              <line x1="200" y1="0" x2="220" y2="0" />
              <line x1="-148" y1="-148" x2="-136" y2="-136" strokeDasharray="3 3" />
              <line x1="136" y1="136" x2="148" y2="148" strokeDasharray="3 3" />
              <line x1="136" y1="-136" x2="148" y2="-148" strokeDasharray="3 3" />
              <line x1="-148" y1="136" x2="-136" y2="148" strokeDasharray="3 3" />
            </g>

            {/* Inner Angular Collegiate Crest / Shield */}
            <polygon
              points="0,-125 105,-62 105,62 0,125 -105,62 -105,-62"
              stroke="url(#collegiumCircuitGrad)"
              strokeWidth="1.5"
              fill="none"
            />
            <polygon
              points="0,-90 75,-45 75,45 0,90 -75,45 -75,-45"
              stroke="currentColor"
              strokeWidth="0.8"
              strokeDasharray="4 4"
              className="text-slate-400/40"
              fill="none"
            />

            {/* Tactical Circuit / Tournament Bracket Matrix Branches */}
            <path
              d="M-105,0 L-220,0 L-270,-45 L-380,-45"
              stroke="url(#collegiumCircuitGrad)"
              strokeWidth="1.2"
              fill="none"
            />
            <circle cx="-380" cy="-45" r="2.5" fill="var(--primary-brand, #EF4444)" />
            <path
              d="M-220,0 L-270,45 L-380,45"
              stroke="url(#collegiumCircuitGrad)"
              strokeWidth="1.2"
              fill="none"
            />
            <circle cx="-380" cy="45" r="2.5" fill="var(--secondary-brand, #3B82F6)" />

            <path
              d="M105,0 L220,0 L270,-45 L380,-45"
              stroke="url(#collegiumCircuitGrad)"
              strokeWidth="1.2"
              fill="none"
            />
            <circle cx="380" cy="-45" r="2.5" fill="var(--primary-brand, #EF4444)" />
            <path
              d="M220,0 L270,45 L380,45"
              stroke="url(#collegiumCircuitGrad)"
              strokeWidth="1.2"
              fill="none"
            />
            <circle cx="380" cy="45" r="2.5" fill="var(--secondary-brand, #3B82F6)" />

            {/* Subtle Collegiate Telemetry Labels */}
            <text
              x="0"
              y="-138"
              textAnchor="middle"
              fill="currentColor"
              className="text-slate-400 font-mono text-[8px] font-bold tracking-[0.25em] uppercase"
            >
              COLLEGIUM CIRCUIT PROTOCOL // PH-ESPORTS
            </text>
            <text
              x="-220"
              y="-10"
              textAnchor="end"
              fill="currentColor"
              className="text-slate-500 font-mono text-[7.5px] font-bold tracking-wider uppercase"
            >
              BRACKET_MATRIX
            </text>
            <text
              x="220"
              y="-10"
              textAnchor="start"
              fill="currentColor"
              className="text-slate-500 font-mono text-[7.5px] font-bold tracking-wider uppercase"
            >
              TELEMETRY_FEED
            </text>
          </g>
        </svg>
      </div>

      <div className="relative z-10 mx-auto w-full max-w-[1600px] px-4 sm:px-6 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          {/* Left: Cinematic Title & Dynamic Circular Stats */}
          <div className="lg:col-span-7 flex flex-col items-start text-left space-y-5">
            {/* Arena Switcher Pill */}
            <div className="flex items-center gap-3">
              <span className="font-mono text-[10px] sm:text-xs font-bold tracking-widest text-secondary-brand uppercase flex items-center gap-2">
                <span className="h-0.5 w-5 bg-secondary-brand shrink-0" />
                PHILIPPINE COLLEGIATE ESPORTS
              </span>

              {selectedGameInfo && (
                <button
                  type="button"
                  onClick={openGameSelector}
                  className="group inline-flex items-center gap-2 px-3 py-1 bg-[#0E1526] hover:bg-[#141E34] border border-[#202C48] hover:border-primary-brand/80 transition-all rounded-full shadow-md cursor-pointer"
                >
                  <div className="relative w-4 h-4 rounded-full overflow-hidden shrink-0">
                    <Image
                      src={selectedGameInfo.image}
                      alt={selectedGameInfo.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <span
                    className="font-display text-xs font-bold uppercase tracking-wider leading-none"
                    style={{ color: selectedGameInfo.accentColor }}
                  >
                    {selectedGameInfo.name}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 group-hover:text-white">▾</span>
                </button>
              )}
            </div>

            {/* Headline */}
            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tight text-white leading-none">
              ONE CIRCUIT.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-400">
                EVERY UNIVERSITY.
              </span><br />
              <span className="text-primary-brand">LIVE TELEMETRY.</span>
            </h1>

            <p className="max-w-xl font-sans text-xs sm:text-sm text-slate-400 leading-relaxed">
              Official varsity championship brackets, real-time match scoring, player telemetry, and verified collegiate scrims across top Philippine universities.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Link
                href="/tournaments"
                className="inline-flex h-11 items-center justify-center gap-2 game-theme-btn px-6 text-xs font-black uppercase tracking-wider shadow-lg transition-all active:scale-95"
                style={{
                  clipPath: "polygon(6px 0, 100% 0, calc(100% - 6px) 100%, 0 100%)",
                }}
              >
                <TrophyIcon className="w-3.5 h-3.5" />
                <span>Explore Brackets</span>
              </Link>

              <Link
                href="/community"
                className="inline-flex h-11 items-center justify-center gap-2 bg-[#121828] hover:bg-[#1A253D] text-slate-200 hover:text-white border border-[#232F4A] px-6 text-xs font-bold uppercase tracking-wider transition-all shadow-md active:scale-95"
                style={{
                  clipPath: "polygon(6px 0, 100% 0, calc(100% - 6px) 100%, 0 100%)",
                }}
              >
                <span>Circuit News</span>
              </Link>
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

          {/* Right: Futuristic Carousel Circuit Dispatch Terminal */}
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

              {/* Indicator Lines / Progress Dashes (Clean lines instead of numbers) */}
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
                    aria-label={`Go to dispatch ${idx + 1}`}
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
                  {/* Subtle Fade Transition Container */}
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
  );
}
