"use client";

import { useState } from "react";
import { TrophyIcon, CrownIcon, CheckCircleIcon } from "@/components/ui/Icons";

export default function UniversityRosterSection() {
  const [activeTab, setActiveTab] = useState<"ROSTER" | "MATCHES" | "CERTIFICATION">("ROSTER");

  const mockAthletes = [
    { name: "John Lou Manuel", handle: "JLManuel#UMAK", role: "Duelist / Team Captain", isCaptain: true, status: "Verified Athlete" },
    { name: "Carlos Agoncillo", handle: "Agoncillo#PH1", role: "Initiator", isCaptain: false, status: "Verified Athlete" },
    { name: "Mark Anthony Santos", handle: "MASantos#VALO", role: "Controller", isCaptain: false, status: "Verified Athlete" },
    { name: "Kevin Ramirez", handle: "KRamirez#99", role: "Sentinel", isCaptain: false, status: "Verified Athlete" },
    { name: "Dominic Reyes", handle: "DomReyes#UMAK", role: "Flex", isCaptain: false, status: "Verified Athlete" },
  ];

  const mockMatches = [
    { opponent: "DLSU Animo Esports", title: "VALORANT", score: "2 - 1", result: "VICTORY", date: "Aug 16, 2026", type: "Collegiate Scrimmage" },
    { opponent: "Pek Varsity Squad", title: "VALORANT", score: "2 - 0", result: "VICTORY", date: "Aug 14, 2026", type: "Peer-Verified Match" },
    { opponent: "UST Teletigers", title: "VALORANT", score: "1 - 2", result: "DEFEAT", date: "Aug 10, 2026", type: "Tournament Circuit" },
  ];

  return (
    <div 
      className="p-6 sm:p-8 bg-[#0A0D18] border border-[#1E293B] space-y-6 shadow-2xl relative"
      style={{
        clipPath: "polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px))",
      }}
    >
      {/* Top Neutral Highlight Bevel */}
      <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-slate-500/40 via-slate-400/20 to-transparent" />

      {/* Header & Interactive Tactical Tab Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#182338] pb-4 relative z-10">
        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 bg-[#141A29] border border-[#232D44] flex items-center justify-center text-slate-300 shrink-0"
            style={{
              clipPath: "polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)",
            }}
          >
            <TrophyIcon className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-display text-base font-black uppercase text-white tracking-wide">
              Varsity Rosters & Match History
            </h3>
            <p className="text-xs font-sans text-slate-400">
              Verified via Riot API & Peer-Validated Scrimmage Logs
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
            >
              {tab === "CERTIFICATION" ? "Info" : tab === "ROSTER" ? "Roster" : "Matches"}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content Display */}
      {activeTab === "ROSTER" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 relative z-10 animate-in fade-in duration-200">
          {mockAthletes.map((a, idx) => (
            <div
              key={idx}
              className="p-4 bg-[#060812] border border-[#182338] flex items-center justify-between gap-3 shadow-inner hover:border-[#3A4E7A] transition-all"
              style={{
                clipPath: "polygon(10px 0, 100% 0, calc(100% - 10px) 100%, 0 100%)",
              }}
            >
              <div className="flex items-center gap-3 min-w-0">
                {/* Octagonal Avatar Emblem */}
                <div 
                  className="w-10 h-10 bg-[#141A29] text-white flex items-center justify-center font-black text-xs border border-white/10 shrink-0"
                  style={{
                    clipPath: "polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)",
                  }}
                >
                  {a.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-display text-xs font-bold uppercase text-white truncate">{a.name}</span>
                    {a.isCaptain && <CrownIcon className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 block truncate">{a.handle}</span>
                  <span className="text-[9px] font-mono text-slate-400 flex items-center gap-1 mt-0.5">
                    <CheckCircleIcon className="w-2.5 h-2.5 text-slate-400" /> {a.status}
                  </span>
                </div>
              </div>

              {/* Slanted Role Tag */}
              <span 
                className="text-[9px] font-mono font-bold text-slate-300 bg-[#141A29] px-2.5 py-0.5 border border-[#232D44] shrink-0"
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
          {mockMatches.map((m, idx) => (
            <div
              key={idx}
              className="p-4 bg-[#060812] border border-[#182338] flex items-center justify-between gap-4 shadow-inner"
              style={{
                clipPath: "polygon(10px 0, 100% 0, calc(100% - 10px) 100%, 0 100%)",
              }}
            >
              <div className="flex items-center gap-3">
                <span 
                  className="text-xs font-mono font-bold px-2.5 py-0.5 text-slate-300 bg-[#141A29] border border-[#232D44]"
                  style={{
                    clipPath: "polygon(6px 0, 100% 0, calc(100% - 6px) 100%, 0 100%)",
                  }}
                >
                  {m.title}
                </span>
                <div>
                  <span className="font-display text-sm font-bold uppercase text-white block">VS {m.opponent}</span>
                  <span className="text-[10px] font-mono text-slate-400">{m.type} · {m.date}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="font-display text-lg font-black text-white">{m.score}</span>
                <span 
                  className="text-[9px] font-mono font-bold px-2.5 py-0.5 border text-slate-300 bg-[#141A29] border-[#232D44]"
                  style={{
                    clipPath: "polygon(6px 0, 100% 0, calc(100% - 6px) 100%, 0 100%)",
                  }}
                >
                  {m.result}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
