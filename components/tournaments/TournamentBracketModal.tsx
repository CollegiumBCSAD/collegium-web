"use client";

import { useEffect, useState } from "react";
import MatchBoxScoreModal from "@/components/MatchBoxScoreModal";
import MatchCard from "@/components/tournaments/MatchCard";
import { BracketMatch, BracketRound, TournamentBracketModalProps } from "@/types";
import { tournamentsService } from "@/services/tournamentsService";
import { SwordsIcon, CrownIcon, TrophyIcon } from "@/components/ui/Icons";

export default function TournamentBracketModal({
  isOpen,
  onClose,
  tournamentId,
  title = "PHILIPPINE COLLEGIATE TOURNAMENT BRACKET",
  subtitle = "SINGLE ELIMINATION CHAMPIONSHIP",
}: TournamentBracketModalProps) {
  const [activeBoxScore, setActiveBoxScore] = useState<BracketMatch | null>(null);
  const [rounds, setRounds] = useState<BracketRound[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!isOpen) return;
    let isMounted = true;

    async function loadBracketData() {
      if (!tournamentId) {
        if (isMounted) {
          setRounds([]);
          setIsLoading(false);
        }
        return;
      }

      try {
        const data = await tournamentsService.getBracket(tournamentId);
        if (isMounted) {
          setRounds(data || []);
        }
      } catch {
        if (isMounted) {
          setRounds([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadBracketData();

    return () => {
      isMounted = false;
    };
  }, [isOpen, tournamentId]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !activeBoxScore) onClose();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose, activeBoxScore]);

  if (!isOpen) return null;

  const normalizedRounds = rounds.map((round, rIdx) => ({
    name:
      round.name ||
      (rIdx === rounds.length - 1
        ? "GRAND FINALS"
        : rIdx === rounds.length - 2
        ? "SEMIFINALS"
        : `ROUND ${rIdx + 1}`),
    matches: round.matches.map((m) => ({
      id: m.id,
      team1: {
        name: m.team1.name || "TBD",
        score: m.team1.score ?? 0,
        isWinner: m.team1.isWinner,
      },
      team2: {
        name: m.team2.name || "TBD",
        score: m.team2.score ?? 0,
        isWinner: m.team2.isWinner,
      },
    })),
  }));

  const lastMatch = normalizedRounds[normalizedRounds.length - 1]?.matches[0];
  const champion = lastMatch
    ? lastMatch.team1.isWinner
      ? lastMatch.team1.name
      : lastMatch.team2.isWinner
      ? lastMatch.team2.name
      : lastMatch.team1.score > lastMatch.team2.score
      ? lastMatch.team1.name
      : lastMatch.team2.score > lastMatch.team1.score
      ? lastMatch.team2.name
      : lastMatch.team1.name
    : "TBD";

  const totalCols = normalizedRounds.length > 0 ? normalizedRounds.length + 1 : 1;

  // Exact binary tree matches
  const qfMatches = normalizedRounds[0]?.matches || [];
  const sfMatches = normalizedRounds[1]?.matches || [];
  const gfMatches = normalizedRounds[2]?.matches || [];

  const lineColor = "#334155"; // Subtle slate gray

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 md:p-10 bg-black/85 backdrop-blur-lg">
        <div className="absolute inset-0" onClick={onClose} />

        {/* Modal Window Container */}
        <div 
          className="relative w-full max-w-7xl max-h-[94vh] flex flex-col bg-[#080B14] border border-[#1E293B] shadow-2xl overflow-hidden z-10"
          style={{
            clipPath: "polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px))",
          }}
        >
          {/* Top Brand Ambient Line */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-primary-brand via-amber-500/60 to-primary-brand" />

          {/* Modal Header */}
          <div className="flex items-center justify-between px-6 sm:px-8 py-5 border-b border-[#182338] bg-[#0A0D18]/90">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span 
                  className="text-[9px] font-mono font-bold tracking-widest text-primary-brand uppercase px-2 py-0.5 bg-primary-brand/10 border border-primary-brand/30"
                  style={{
                    clipPath: "polygon(4px 0, 100% 0, calc(100% - 4px) 100%, 0 100%)",
                  }}
                >
                  OFFICIAL PLAYOFF BRACKET
                </span>
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">
                  {subtitle}
                </span>
              </div>
              <h2 className="font-display text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-white uppercase drop-shadow-sm">
                {title}
              </h2>
            </div>

            <button
              onClick={onClose}
              aria-label="Close Modal"
              className="flex h-9 w-9 items-center justify-center bg-[#141A29] border border-[#232D44] text-slate-300 hover:text-white hover:bg-[#1E273D] transition-colors cursor-pointer"
              style={{
                clipPath: "polygon(6px 0, 100% 0, calc(100% - 6px) 100%, 0 100%)",
              }}
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Bracket Canvas Area */}
          <div className="flex-1 overflow-x-auto p-6 sm:p-10 flex flex-col justify-center min-h-[580px] bg-gradient-to-b from-[#080B14] via-[#0A0D18] to-[#05070E]">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 space-y-4">
                <div className="w-10 h-10 border-3 border-primary-brand border-t-transparent rounded-full animate-spin" />
                <p className="font-sans text-xs font-bold text-slate-400 tracking-widest uppercase">
                  Loading Tournament Bracket Tree...
                </p>
              </div>
            ) : normalizedRounds.length === 0 ? (
              <div 
                className="flex flex-col items-center justify-center text-center py-16 px-6 max-w-md mx-auto space-y-4 bg-[#0A0D18] border border-[#1E293B] p-8 shadow-xl"
                style={{
                  clipPath: "polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 14px 100%, 0 calc(100% - 14px))",
                }}
              >
                <div 
                  className="w-16 h-16 bg-[#141A29] border border-[#232D44] flex items-center justify-center shadow-inner"
                  style={{
                    clipPath: "polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)",
                  }}
                >
                  <SwordsIcon className="w-8 h-8 text-primary-brand" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-display text-xl font-black text-white uppercase tracking-wide">
                    NO BRACKET SEEDS GENERATED
                  </h3>
                  <p className="font-sans text-xs text-slate-400 leading-relaxed">
                    Tournament pairings have not been published yet. Brackets will appear here dynamically once registration closes and varsity seeds are locked.
                  </p>
                </div>
              </div>
            ) : (
              <div className="min-w-[1100px] mx-auto py-2">
                
                {/* Round Header Labels */}
                <div
                  className="grid gap-14 mb-6 text-xs font-display font-black tracking-widest text-slate-300 uppercase pl-1"
                  style={{ gridTemplateColumns: `repeat(${totalCols}, minmax(0, 1fr))` }}
                >
                  {normalizedRounds.map((r, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-primary-brand" style={{ clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)" }} />
                      <span>{r.name}</span>
                    </div>
                  ))}
                  <div className="flex items-center gap-2 text-amber-400">
                    <CrownIcon className="w-4 h-4 text-amber-400" />
                    <span>CHAMPION</span>
                  </div>
                </div>

                {/* Mathematical Binary Tree Bracket (520px Fixed Unified Grid Height) */}
                <div
                  className="grid gap-14 relative h-[520px]"
                  style={{ gridTemplateColumns: `repeat(${totalCols}, minmax(0, 1fr))` }}
                >
                  
                  {/* Column 1: Quarterfinals (4 Slots x 130px = 520px) */}
                  <div className="h-full flex flex-col justify-between relative">
                    
                    {/* Pair 1 Container (Height: 260px) */}
                    <div className="h-[260px] flex flex-col justify-between relative">
                      {/* Slot 0 (130px) -> Center at 65px */}
                      <div className="h-[130px] flex items-center">
                        {qfMatches[0] && (
                          <MatchCard match={qfMatches[0]} onViewBoxScore={() => setActiveBoxScore(qfMatches[0])} />
                        )}
                      </div>

                      {/* Slot 1 (130px) -> Center at 195px */}
                      <div className="h-[130px] flex items-center">
                        {qfMatches[1] && (
                          <MatchCard match={qfMatches[1]} onViewBoxScore={() => setActiveBoxScore(qfMatches[1])} />
                        )}
                      </div>

                      {/* Precision SVG Fork from 65px and 195px to center 130px */}
                      <svg 
                        className="block absolute -right-14 top-0 w-14 h-[260px] pointer-events-none overflow-visible"
                        viewBox="0 0 56 260" 
                        preserveAspectRatio="none"
                      >
                        {/* Top Match Line (65px) -> Spine -> Bottom Match Line (195px) */}
                        <path 
                          d="M 0,65 H 28 V 195 H 0" 
                          fill="none" 
                          stroke={lineColor} 
                          strokeWidth="2" 
                          vectorEffect="non-scaling-stroke" 
                        />
                        {/* Center Stem Line at 130px bridging straight into SF 0 center */}
                        <line 
                          x1="28" 
                          y1="130" 
                          x2="56" 
                          y2="130" 
                          stroke={lineColor} 
                          strokeWidth="2" 
                          vectorEffect="non-scaling-stroke" 
                        />
                      </svg>
                    </div>

                    {/* Pair 2 Container (Height: 260px) */}
                    <div className="h-[260px] flex flex-col justify-between relative">
                      {/* Slot 2 (130px) -> Center at 65px (relative to Pair 2) */}
                      <div className="h-[130px] flex items-center">
                        {qfMatches[2] && (
                          <MatchCard match={qfMatches[2]} onViewBoxScore={() => setActiveBoxScore(qfMatches[2])} />
                        )}
                      </div>

                      {/* Slot 3 (130px) -> Center at 195px (relative to Pair 2) */}
                      <div className="h-[130px] flex items-center">
                        {qfMatches[3] && (
                          <MatchCard match={qfMatches[3]} onViewBoxScore={() => setActiveBoxScore(qfMatches[3])} />
                        )}
                      </div>

                      {/* Precision SVG Fork from 65px and 195px to center 130px */}
                      <svg 
                        className="block absolute -right-14 top-0 w-14 h-[260px] pointer-events-none overflow-visible"
                        viewBox="0 0 56 260" 
                        preserveAspectRatio="none"
                      >
                        {/* Top Match Line (65px) -> Spine -> Bottom Match Line (195px) */}
                        <path 
                          d="M 0,65 H 28 V 195 H 0" 
                          fill="none" 
                          stroke={lineColor} 
                          strokeWidth="2" 
                          vectorEffect="non-scaling-stroke" 
                        />
                        {/* Center Stem Line at 130px bridging straight into SF 1 center */}
                        <line 
                          x1="28" 
                          y1="130" 
                          x2="56" 
                          y2="130" 
                          stroke={lineColor} 
                          strokeWidth="2" 
                          vectorEffect="non-scaling-stroke" 
                        />
                      </svg>
                    </div>

                  </div>

                  {/* Column 2: Semifinals (2 Slots x 260px = 520px) */}
                  <div className="h-full flex flex-col justify-between relative">
                    
                    {/* Semifinal Slot 0 (Height: 260px) -> Centered at EXACTLY 130px */}
                    <div className="h-[260px] flex items-center relative">
                      {sfMatches[0] && (
                        <MatchCard match={sfMatches[0]} onViewBoxScore={() => setActiveBoxScore(sfMatches[0])} />
                      )}
                    </div>

                    {/* Semifinal Slot 1 (Height: 260px) -> Centered at EXACTLY 390px (130px relative to slot) */}
                    <div className="h-[260px] flex items-center relative">
                      {sfMatches[1] && (
                        <MatchCard match={sfMatches[1]} onViewBoxScore={() => setActiveBoxScore(sfMatches[1])} />
                      )}
                    </div>

                    {/* Precision SVG Fork from SF 0 (130px) and SF 1 (390px) to center 260px */}
                    <svg 
                      className="block absolute -right-14 top-0 w-14 h-[520px] pointer-events-none overflow-visible"
                      viewBox="0 0 56 520" 
                      preserveAspectRatio="none"
                    >
                      {/* SF 0 Line (130px) -> Spine -> SF 1 Line (390px) */}
                      <path 
                        d="M 0,130 H 28 V 390 H 0" 
                        fill="none" 
                        stroke={lineColor} 
                        strokeWidth="2" 
                        vectorEffect="non-scaling-stroke" 
                      />
                      {/* Center Stem Line at 260px bridging straight into Grand Finals center */}
                      <line 
                        x1="28" 
                        y1="260" 
                        x2="56" 
                        y2="260" 
                        stroke={lineColor} 
                        strokeWidth="2" 
                        vectorEffect="non-scaling-stroke" 
                      />
                    </svg>
                  </div>

                  {/* Column 3: Grand Finals (1 Slot x 520px = 520px) -> Centered at EXACTLY 260px */}
                  <div className="h-full flex items-center relative">
                    {gfMatches[0] && (
                      <MatchCard match={gfMatches[0]} onViewBoxScore={() => setActiveBoxScore(gfMatches[0])} />
                    )}

                    {/* Precision Direct Horizontal Line from GF center (260px) straight into Champion Showcase */}
                    <svg 
                      className="block absolute -right-14 top-0 w-14 h-[520px] pointer-events-none overflow-visible"
                      viewBox="0 0 56 520" 
                      preserveAspectRatio="none"
                    >
                      <line 
                        x1="0" 
                        y1="260" 
                        x2="56" 
                        y2="260" 
                        stroke={lineColor} 
                        strokeWidth="2" 
                        vectorEffect="non-scaling-stroke" 
                      />
                    </svg>
                  </div>

                  {/* Column 4: Grand Finals Championship Trophy Showcase -> Centered at EXACTLY 260px */}
                  <div className="h-full flex flex-col items-center justify-center relative z-10 pr-2">
                    
                    {/* Glowing Golden Trophy Shield (Inspired by The International Aegis) */}
                    <div className="relative mb-6 group cursor-pointer">
                      {/* Ambient Golden Glow Aura */}
                      <div className="absolute inset-0 bg-amber-500/20 blur-2xl rounded-full scale-125 pointer-events-none" />
                      
                      {/* 8-Sided Golden Aegis Shield */}
                      <div 
                        className="w-28 h-28 bg-gradient-to-br from-amber-300 via-amber-500 to-amber-700 p-[2.5px] shadow-2xl flex items-center justify-center relative transition-transform duration-300 group-hover:scale-105"
                        style={{
                          clipPath: "polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)",
                        }}
                      >
                        <div 
                          className="w-full h-full bg-[#0D0F18] flex flex-col items-center justify-center p-3 text-center space-y-1"
                          style={{
                            clipPath: "polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)",
                          }}
                        >
                          <TrophyIcon className="w-10 h-10 text-amber-400 drop-shadow-md animate-pulse" />
                          <span className="font-mono text-[8px] font-bold text-amber-300 uppercase tracking-widest block">
                            SEASON 1
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Crowned Champion Winner Card */}
                    <div 
                      className="w-56 bg-gradient-to-b from-[#1C1708] via-[#0E101B] to-[#070912] border-2 border-amber-500/80 p-4 shadow-2xl text-center space-y-2"
                      style={{
                        clipPath: "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))",
                      }}
                    >
                      <div className="flex items-center justify-center gap-1.5 text-amber-400 font-display text-[10px] font-black uppercase tracking-widest">
                        <CrownIcon className="w-3.5 h-3.5 text-amber-400" />
                        <span>TOURNAMENT CHAMPION</span>
                      </div>

                      <h3 className="font-display text-base font-black uppercase text-white tracking-wide">
                        {champion}
                      </h3>

                      <div className="pt-2 border-t border-amber-500/30">
                        <span 
                          className="px-2.5 py-0.5 bg-amber-500 text-black font-mono text-[9px] font-black uppercase tracking-wider inline-block"
                          style={{
                            clipPath: "polygon(4px 0, 100% 0, calc(100% - 4px) 100%, 0 100%)",
                          }}
                        >
                          GOLD MEDALIST
                        </span>
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <MatchBoxScoreModal
        isOpen={!!activeBoxScore}
        onClose={() => setActiveBoxScore(null)}
        title="MATCH BOX SCORE"
        subtitle={`${activeBoxScore?.team1.name} vs ${activeBoxScore?.team2.name} • TOURNAMENT MATCH`}
        matchInfo={
          activeBoxScore
            ? {
                team1Name: activeBoxScore.team1.name,
                team2Name: activeBoxScore.team2.name,
                team1Score: activeBoxScore.team1.score,
                team2Score: activeBoxScore.team2.score,
                isTeam1Winner: activeBoxScore.team1.isWinner ?? (activeBoxScore.team1.score >= activeBoxScore.team2.score),
              }
            : undefined
        }
      />
    </>
  );
}
