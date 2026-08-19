"use client";

import { useState } from "react";
import { useGame } from "@/context/GameContext";
import { GAMES } from "@/lib/games";
import { TrophyIcon, CrownIcon, CheckCircleIcon, SwordsIcon } from "@/components/ui/Icons";

const GAME_ROSTERS: Record<string, Array<{ name: string; handle: string; role: string; isCaptain: boolean; status: string }>> = {
  valo: [
    { name: "John Lou Manuel", handle: "JLManuel#UMAK", role: "Duelist / Captain", isCaptain: true, status: "Verified Varsity" },
    { name: "Carlos Agoncillo", handle: "Agoncillo#PH1", role: "Initiator", isCaptain: false, status: "Verified Varsity" },
    { name: "Mark Anthony Santos", handle: "MASantos#VALO", role: "Controller", isCaptain: false, status: "Verified Varsity" },
    { name: "Kevin Ramirez", handle: "KRamirez#99", role: "Sentinel", isCaptain: false, status: "Verified Varsity" },
    { name: "Dominic Reyes", handle: "DomReyes#UMAK", role: "Flex", isCaptain: false, status: "Verified Varsity" },
  ],
  lol: [
    { name: "Lance Gutierrez", handle: "LanceMid#UMAK", role: "Mid Laner / Captain", isCaptain: true, status: "Verified Varsity" },
    { name: "Jerome Bautista", handle: "JBTop#PH", role: "Top Laner", isCaptain: false, status: "Verified Varsity" },
    { name: "Rafael Cruz", handle: "RafJungle#Rift", role: "Jungler", isCaptain: false, status: "Verified Varsity" },
    { name: "Christian De Leon", handle: "CDeLeon#ADC", role: "Bot Laner", isCaptain: false, status: "Verified Varsity" },
    { name: "Angelo Ramos", handle: "AngeloSupp#PH", role: "Support", isCaptain: false, status: "Verified Varsity" },
  ],
  ml: [
    { name: "Dave Mendoza", handle: "DaveJungle#ML", role: "Jungler / Captain", isCaptain: true, status: "Verified Varsity" },
    { name: "Bryan Villanueva", handle: "BryanMage#PH", role: "Mid Laner", isCaptain: false, status: "Verified Varsity" },
    { name: "Kyle Fernandez", handle: "KyleGold#PH", role: "Gold Laner", isCaptain: false, status: "Verified Varsity" },
    { name: "Joshua Aquino", handle: "JoshEXP#ML", role: "EXP Laner", isCaptain: false, status: "Verified Varsity" },
    { name: "Patrick Salazar", handle: "PatRoam#PH", role: "Roamer", isCaptain: false, status: "Verified Varsity" },
  ],
  codm: [
    { name: "Ethan Garcia", handle: "EthanSlayer#CODM", role: "Main Slayer / Captain", isCaptain: true, status: "Verified Varsity" },
    { name: "Miguel Pascual", handle: "MigzEntry#PH", role: "SMG Entry", isCaptain: false, status: "Verified Varsity" },
    { name: "Justin Navarro", handle: "JustinAnchor#PH", role: "Anchor", isCaptain: false, status: "Verified Varsity" },
    { name: "Gabriel Tolentino", handle: "GabSniper#CODM", role: "Sniper / Flex", isCaptain: false, status: "Verified Varsity" },
    { name: "Adrian Castro", handle: "AdrianObj#PH", role: "Objective Support", isCaptain: false, status: "Verified Varsity" },
  ],
};

const GAME_MATCHES: Record<string, Array<{ opponent: string; title: string; score: string; result: string; date: string; type: string }>> = {
  valo: [
    { opponent: "DLSU Animo Esports", title: "VALORANT", score: "2 - 1", result: "VICTORY", date: "Aug 16, 2026", type: "Collegiate Scrimmage" },
    { opponent: "Pek Varsity Squad", title: "VALORANT", score: "2 - 0", result: "VICTORY", date: "Aug 14, 2026", type: "Peer-Verified Match" },
    { opponent: "UST Teletigers", title: "VALORANT", score: "1 - 2", result: "DEFEAT", date: "Aug 10, 2026", type: "Tournament Circuit" },
  ],
  lol: [
    { opponent: "ADMU Blue Eagles", title: "LEAGUE OF LEGENDS", score: "2 - 0", result: "VICTORY", date: "Aug 15, 2026", type: "Campus Clash Match" },
    { opponent: "FEU Tamaraws", title: "LEAGUE OF LEGENDS", score: "2 - 1", result: "VICTORY", date: "Aug 12, 2026", type: "Collegiate Scrimmage" },
    { opponent: "DLSU Viridis Arcus", title: "LEAGUE OF LEGENDS", score: "0 - 2", result: "DEFEAT", date: "Aug 07, 2026", type: "Tournament Group" },
  ],
  ml: [
    { opponent: "UP Gaming Guild", title: "MOBILE LEGENDS", score: "2 - 1", result: "VICTORY", date: "Aug 17, 2026", type: "Invitational Match" },
    { opponent: "UST Tiger Cubs", title: "MOBILE LEGENDS", score: "2 - 0", result: "VICTORY", date: "Aug 13, 2026", type: "Collegiate Scrimmage" },
    { opponent: "PUP Radicals", title: "MOBILE LEGENDS", score: "1 - 2", result: "DEFEAT", date: "Aug 08, 2026", type: "Metro League Group" },
  ],
  codm: [
    { opponent: "NU Bulldogs Esports", title: "CALL OF DUTY: MOBILE", score: "3 - 1", result: "VICTORY", date: "Aug 16, 2026", type: "Varsity Warfare Match" },
    { opponent: "ADMU Blue Batallion", title: "CALL OF DUTY: MOBILE", score: "3 - 0", result: "VICTORY", date: "Aug 11, 2026", type: "Collegiate Scrimmage" },
    { opponent: "PUP Cyber Warriors", title: "CALL OF DUTY: MOBILE", score: "2 - 3", result: "DEFEAT", date: "Aug 05, 2026", type: "Major Qualifiers" },
  ],
};

export default function UniversityRosterSection() {
  const { selectedGame } = useGame();
  const activeGameKey = selectedGame || "valo";
  const game = GAMES[activeGameKey as keyof typeof GAMES] || GAMES.valo;

  const [activeTab, setActiveTab] = useState<"ROSTER" | "MATCHES" | "CERTIFICATION">("ROSTER");

  const athletes = GAME_ROSTERS[activeGameKey] || GAME_ROSTERS.valo;
  const matches = GAME_MATCHES[activeGameKey] || GAME_MATCHES.valo;

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
              {game.name} Varsity Roster & Match Log
            </h3>
            <p className="text-xs font-sans text-slate-400">
              Official Collegiate Verification & Peer-Validated Match History
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
                activeTab === tab
                  ? "game-theme-btn shadow-md"
                  : "tactical-btn-secondary text-slate-400"
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 relative z-10 animate-in fade-in duration-200">
          {athletes.map((a, idx) => (
            <div
              key={idx}
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
                  {a.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-display text-xs font-bold uppercase text-white truncate group-hover:text-primary-brand transition-colors">
                      {a.name}
                    </span>
                    {a.isCaptain && <CrownIcon className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 block truncate">{a.handle}</span>
                  <span className="text-[9px] font-mono text-emerald-400 flex items-center gap-1 mt-0.5">
                    <CheckCircleIcon className="w-2.5 h-2.5 text-emerald-400" /> {a.status}
                  </span>
                </div>
              </div>

              {/* Slanted Role Tag */}
              <span 
                className="text-[9px] font-mono font-bold text-slate-300 bg-[#101626] px-2.5 py-0.5 border border-[#202C45] shrink-0"
                style={{
                  clipPath: "polygon(6px 0, 100% 0, calc(100% - 6px) 100%, 0 100%)",
                }}
              >
                {a.role.split(" / ")[0]}
              </span>
            </div>
          ))}
        </div>
      )}

      {activeTab === "MATCHES" && (
        <div className="space-y-3 relative z-10 animate-in fade-in duration-200">
          {matches.map((m, idx) => {
            const isVictory = m.result === "VICTORY";
            return (
              <div
                key={idx}
                className="p-4 bg-[#050711] border border-[#182338] flex items-center justify-between gap-4 shadow-inner hover:border-[#2A3B58] transition-colors"
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
                    {m.title}
                  </span>
                  <div className="min-w-0">
                    <span className="font-display text-sm font-bold uppercase text-white block truncate">
                      VS {m.opponent}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">{m.type} · {m.date}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="font-display text-lg font-black text-white">{m.score}</span>
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
                    {m.result}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {activeTab === "CERTIFICATION" && (
        <div className="p-6 bg-[#050711] border border-[#182338] space-y-3 relative z-10 animate-in fade-in duration-200">
          <h4 className="font-display text-sm font-black uppercase text-white tracking-wider flex items-center gap-2">
            <TrophyIcon className="w-4 h-4 text-primary-brand" />
            <span>Collegiate Eligibility & Verification Standards</span>
          </h4>
          <p className="text-xs font-sans text-slate-400 leading-relaxed">
            All varsity athletes listed under {game.name} have been authenticated with valid institution email credentials, official Riot Games / Moonton / Activision ID linkages, and verified minimum semester GPA standing.
          </p>
        </div>
      )}
    </div>
  );
}
