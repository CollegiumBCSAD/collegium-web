"use client";

import { useEffect } from "react";
import { MatchBoxScore } from "@/types";

interface MatchBoxScoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  boxScoreData?: MatchBoxScore;
}

export default function MatchBoxScoreModal({
  isOpen,
  onClose,
  title = "MATCH BOX SCORE",
  subtitle = "VALORANT • GRAND FINALS • ELIMINATION",
  boxScoreData,
}: MatchBoxScoreModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const team1 = boxScoreData
    ? {
        name: boxScoreData.team1.name,
        score: 1,
        result: "WIN",
        players: boxScoreData.team1.players.map((p) => ({
          name: p.name,
          roleAgent: `${p.role || "Flex"} / ${p.agent || "Agent"}`,
          k: p.kills,
          d: p.deaths,
          a: p.assists,
          kda: (p.kda || ((p.kills + p.assists) / Math.max(1, p.deaths))).toFixed(2),
          acs: p.acs || 200,
        })),
      }
    : {
        name: "UMak",
        score: 1,
        result: "WIN",
        players: [
          { name: "Dyeel", roleAgent: "Duelist / Reyna", k: 28, d: 15, a: 7, kda: "2.33", acs: 332 },
          { name: "rinkinn", roleAgent: "Flex / Jett", k: 21, d: 14, a: 12, kda: "2.36", acs: 268 },
          { name: "Ychann", roleAgent: "Initiator / Sova", k: 18, d: 13, a: 16, kda: "2.62", acs: 248 },
          { name: "kcee", roleAgent: "Sentinel / Killjoy", k: 14, d: 11, a: 10, kda: "2.18", acs: 208 },
          { name: "LEB", roleAgent: "Controller / Omen", k: 20, d: 14, a: 8, kda: "2.01", acs: 242 },
        ],
      };

  const team2 = boxScoreData
    ? {
        name: boxScoreData.team2.name,
        score: 0,
        result: "LOSS",
        players: boxScoreData.team2.players.map((p) => ({
          name: p.name,
          roleAgent: `${p.role || "Flex"} / ${p.agent || "Agent"}`,
          k: p.kills,
          d: p.deaths,
          a: p.assists,
          kda: (p.kda || ((p.kills + p.assists) / Math.max(1, p.deaths))).toFixed(2),
          acs: p.acs || 180,
        })),
      }
    : {
        name: "UP Fighting",
        score: 0,
        result: "LOSS",
        players: [
          { name: "Striker", roleAgent: "Duelist / Jett", k: 25, d: 18, a: 5, kda: "1.67", acs: 295 },
          { name: "Bulldog", roleAgent: "Controller / Astra", k: 17, d: 17, a: 9, kda: "1.53", acs: 218 },
          { name: "Phantom", roleAgent: "Initiator / Skye", k: 15, d: 16, a: 13, kda: "1.75", acs: 205 },
          { name: "Saber", roleAgent: "Sentinel / Chamber", k: 12, d: 15, a: 11, kda: "1.53", acs: 182 },
          { name: "Vortex", roleAgent: "Flex / Neon", k: 18, d: 19, a: 6, kda: "1.26", acs: 215 },
        ],
      };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 md:p-10 bg-black/80 backdrop-blur-md">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-5xl max-h-[92vh] flex flex-col rounded-2xl border border-panel-border bg-modal-bg shadow-2xl overflow-hidden z-10">
        <div className="flex items-center justify-between px-6 sm:px-8 py-5 border-b border-panel-border">
          <div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-normal text-foreground uppercase">
              {title}
            </h2>
            <p className="font-sans text-xs font-semibold tracking-wider text-secondary-text uppercase mt-1">
              {subtitle}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close Modal"
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-card-bg text-foreground transition-colors hover:text-foreground hover:bg-raised-panel"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 sm:p-8">
          <div className="flex items-center justify-center gap-6 sm:gap-10 mb-8">
            <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-success bg-[#0E1A16] px-8 sm:px-12 py-4 shadow-lg min-w-[140px] text-center">
              <span className="font-sans text-sm font-bold text-foreground">
                {team1.name}
              </span>
              <span className="font-display text-3xl sm:text-4xl font-bold text-foreground my-0.5">
                {team1.score}
              </span>
              <span className="font-sans text-xs font-bold text-success tracking-wider uppercase">
                {team1.result}
              </span>
            </div>

            <span className="font-sans text-sm font-bold text-secondary-text uppercase">
              VS
            </span>

            <div className="flex flex-col items-center justify-center rounded-2xl border border-panel-border bg-card-bg px-8 sm:px-12 py-4 shadow-lg min-w-[140px] text-center">
              <span className="font-sans text-sm font-bold text-foreground">
                {team2.name}
              </span>
              <span className="font-display text-3xl sm:text-4xl font-bold text-foreground my-0.5">
                {team2.score}
              </span>
              <span className="font-sans text-xs font-bold text-primary-brand tracking-wider uppercase">
                {team2.result}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="rounded-xl border border-panel-border bg-card-bg p-4 sm:p-5">
              <h3 className="font-sans text-base font-bold text-foreground mb-4">
                {team1.name}
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left font-sans text-xs">
                  <thead>
                    <tr className="border-b border-panel-border text-[11px] font-bold text-secondary-text tracking-wider uppercase pb-2">
                      <th className="pb-2">PLAYER</th>
                      <th className="pb-2">ROLE / AGENT</th>
                      <th className="pb-2 text-center">K</th>
                      <th className="pb-2 text-center">D</th>
                      <th className="pb-2 text-center">A</th>
                      <th className="pb-2 text-center">KDA</th>
                      <th className="pb-2 text-center">ACS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1D212E]">
                    {team1.players.map((p) => (
                      <tr key={p.name}>
                        <td className="py-2.5 font-bold text-foreground flex items-center gap-1.5">
                          <span className="text-primary-brand">•</span>
                          <span>{p.name}</span>
                        </td>
                        <td className="py-2.5 text-secondary-text font-medium">
                          {p.roleAgent}
                        </td>
                        <td className="py-2.5 text-center font-bold text-foreground">{p.k}</td>
                        <td className="py-2.5 text-center font-medium text-foreground">{p.d}</td>
                        <td className="py-2.5 text-center font-medium text-foreground">{p.a}</td>
                        <td className="py-2.5 text-center font-bold text-success">{p.kda}</td>
                        <td className="py-2.5 text-center font-medium text-foreground">{p.acs}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="rounded-xl border border-panel-border bg-card-bg p-4 sm:p-5">
              <h3 className="font-sans text-base font-bold text-foreground mb-4">
                {team2.name}
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left font-sans text-xs">
                  <thead>
                    <tr className="border-b border-panel-border text-[11px] font-bold text-secondary-text tracking-wider uppercase pb-2">
                      <th className="pb-2">PLAYER</th>
                      <th className="pb-2">ROLE / AGENT</th>
                      <th className="pb-2 text-center">K</th>
                      <th className="pb-2 text-center">D</th>
                      <th className="pb-2 text-center">A</th>
                      <th className="pb-2 text-center">KDA</th>
                      <th className="pb-2 text-center">ACS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1D212E]">
                    {team2.players.map((p) => (
                      <tr key={p.name}>
                        <td className="py-2.5 font-bold text-foreground flex items-center gap-1.5">
                          <span className="text-primary-brand">•</span>
                          <span>{p.name}</span>
                        </td>
                        <td className="py-2.5 text-secondary-text font-medium">
                          {p.roleAgent}
                        </td>
                        <td className="py-2.5 text-center font-bold text-foreground">{p.k}</td>
                        <td className="py-2.5 text-center font-medium text-foreground">{p.d}</td>
                        <td className="py-2.5 text-center font-medium text-foreground">{p.a}</td>
                        <td className="py-2.5 text-center font-medium text-foreground">{p.kda}</td>
                        <td className="py-2.5 text-center font-medium text-foreground">{p.acs}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-panel-border text-center">
            <p className="font-sans text-xs text-secondary-text">
              Individual player statistics for Tournament Mode matches. KDA = (Kills + Assists) / Deaths
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
