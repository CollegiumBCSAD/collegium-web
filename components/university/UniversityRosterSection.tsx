"use client";

import React, { useState } from "react";
import Link from "next/link";
import { University } from "@/types";
import { TrophyIcon, CrownIcon, CheckCircleIcon } from "@/components/ui/Icons";

interface UniversityRosterSectionProps {
  university: University;
}

export default function UniversityRosterSection({ university }: UniversityRosterSectionProps) {
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
    <div className="p-6 sm:p-8 rounded-2xl bg-[#0D121F]/90 border border-[#1E293B] space-y-6 shadow-xl backdrop-blur-xl">
      
      {/* Header & Interactive Tab Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1C2538] pb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary-brand/10 border border-primary-brand/20 flex items-center justify-center text-primary-brand">
            <TrophyIcon className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-display text-base font-bold uppercase text-white tracking-wide">
              Varsity Rosters & Match History
            </h3>
            <p className="text-xs font-sans text-slate-400">
              Verified via Riot API & Peer-Validated Scrimmage Logs
            </p>
          </div>
        </div>

        {/* Tab Switcher Pills */}
        <div className="flex items-center gap-1 p-1 rounded-lg bg-[#080C14] border border-[#1C2538]">
          <button
            onClick={() => setActiveTab("ROSTER")}
            className={`px-3 py-1 rounded-md text-xs font-sans font-semibold uppercase transition-all ${
              activeTab === "ROSTER"
                ? "bg-primary-brand text-white shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Roster
          </button>
          <button
            onClick={() => setActiveTab("MATCHES")}
            className={`px-3 py-1 rounded-md text-xs font-sans font-semibold uppercase transition-all ${
              activeTab === "MATCHES"
                ? "bg-primary-brand text-white shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Matches
          </button>
          <button
            onClick={() => setActiveTab("CERTIFICATION")}
            className={`px-3 py-1 rounded-md text-xs font-sans font-semibold uppercase transition-all ${
              activeTab === "CERTIFICATION"
                ? "bg-primary-brand text-white shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Info
          </button>
        </div>
      </div>

      {/* Tab Content Display */}
      {activeTab === "ROSTER" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 animate-in fade-in duration-200">
          {mockAthletes.map((a, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl bg-[#080C14] border border-[#1C2538] flex items-center justify-between gap-3 hover:border-slate-400 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#141A29] text-white flex items-center justify-center font-semibold text-xs border border-white/10 shrink-0">
                  {a.name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-sans font-bold text-xs text-white">{a.name}</span>
                    {a.isCaptain && <CrownIcon className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                  </div>
                  <span className="text-[11px] font-sans text-slate-400 block">{a.handle}</span>
                  <span className="text-[10px] font-sans text-slate-400 flex items-center gap-1 mt-0.5 font-normal">
                    <CheckCircleIcon className="w-3 h-3 text-slate-400" /> {a.status}
                  </span>
                </div>
              </div>

              <span className="text-[10px] font-sans font-medium text-slate-300 bg-[#141A29] px-2 py-0.5 rounded-md border border-[#232D44] shrink-0">
                {a.role.split(" / ")[0]}
              </span>
            </div>
          ))}
        </div>
      )}

      {activeTab === "MATCHES" && (
        <div className="space-y-2.5 animate-in fade-in duration-200">
          {mockMatches.map((m, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl bg-[#080C14] border border-[#1C2538] flex items-center justify-between gap-4 hover:border-slate-400 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-sans font-semibold ${
                  m.result === "VICTORY" ? "bg-[#141A29] text-white border border-[#232D44]" : "bg-[#141A29] text-slate-400 border border-[#232D44]"
                }`}>
                  {m.result === "VICTORY" ? "WIN" : "LOSS"}
                </div>
                <div>
                  <span className="font-sans font-semibold text-xs text-white block">
                    vs {m.opponent}
                  </span>
                  <span className="text-[10px] font-sans text-slate-400">
                    {m.title} · {m.type} · {m.date}
                  </span>
                </div>
              </div>

              <span className="font-sans text-xs font-semibold text-white bg-[#141A29] px-2.5 py-1 rounded-md border border-[#232D44]">
                {m.score}
              </span>
            </div>
          ))}
        </div>
      )}

      {activeTab === "CERTIFICATION" && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 animate-in fade-in duration-200">
          <div className="p-3.5 rounded-xl bg-[#080C14] border border-[#1C2538] space-y-1">
            <span className="text-[10px] font-sans font-semibold text-amber-400 uppercase tracking-wider block">
              Roster Status
            </span>
            <span className="font-sans text-xs font-medium text-white block">Verified Active Lineup</span>
          </div>
          <div className="p-3.5 rounded-xl bg-[#080C14] border border-[#1C2538] space-y-1">
            <span className="text-[10px] font-sans font-semibold text-primary-brand uppercase tracking-wider block">
              Match Engine
            </span>
            <span className="font-sans text-xs font-medium text-white block">Dual-Mode VCS & Glicko-2</span>
          </div>
          <div className="p-3.5 rounded-xl bg-[#080C14] border border-[#1C2538] space-y-1">
            <span className="text-[10px] font-sans font-semibold text-slate-300 uppercase tracking-wider block">
              Official Division
            </span>
            <span className="font-sans text-xs font-medium text-white block">Philippine Collegiate Circuit</span>
          </div>
        </div>
      )}

      {/* Footer Navigation Back Link */}
      <div className="pt-3 border-t border-[#1C2538] flex items-center justify-between">
        <Link
          href="/leaderboard"
          className="h-9 px-4 rounded-lg bg-[#141A29] hover:bg-[#1F273D] text-white font-sans text-xs font-semibold uppercase tracking-wider transition-all border border-[#232D44] inline-flex items-center gap-1.5 shadow-sm"
        >
          <span>← Back to Rankings</span>
        </Link>
      </div>

    </div>
  );
}
