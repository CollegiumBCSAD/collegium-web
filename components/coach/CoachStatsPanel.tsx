"use client";

import { useEffect, useState } from "react";
import { coachService } from "@/services";
import { CoachTeamIdProps, CoachTeamStats } from "@/types";
import OctagonAvatar from "@/components/ui/OctagonAvatar";
import { ZapIcon } from "@/components/ui/Icons";
import CoachPanel from "./CoachPanel";

export default function CoachStatsPanel({ teamId }: CoachTeamIdProps) {
  const [stats, setStats] = useState<CoachTeamStats | null>(null);

  useEffect(() => {
    coachService.getTeamStats(teamId).then(setStats).catch(() => setStats(null));
  }, [teamId]);

  const ranked = [...(stats?.players ?? [])].sort((a, b) => b.kda - a.kda || b.games - a.games);
  const topKda = Math.max(1, ...ranked.map((p) => p.kda));

  return (
    <CoachPanel
      eyebrow={stats ? `${stats.matchesPlayed} verified tournament matches` : "Loading"}
      title="Player Performance"
      icon={<ZapIcon className="w-4 h-4" />}
    >
      {stats && stats.matchesPlayed === 0 ? (
        <p className="text-xs font-sans text-slate-500">No verified tournament matches yet. Stats appear once an organizer closes your first match.</p>
      ) : (
        <ul className="space-y-1.5">
          {ranked.map((p, i) => (
            <li key={p.userId} className="grid grid-cols-[auto_auto_1fr_auto] items-center gap-3 px-3 py-2 bg-black/25 border border-white/[0.04]">
              <span className="w-5 text-center font-display text-sm font-black text-white/25 tabular-nums">{i + 1}</span>
              <OctagonAvatar label={p.gameHandle} className="w-8 h-8" highlight={i === 0 && p.games > 0} />
              <div className="min-w-0">
                <p className="text-xs font-sans font-semibold text-white truncate">{p.gameHandle}</p>
                <div className="mt-1 h-1 bg-white/10 overflow-hidden">
                  <div className="h-full bg-primary-brand transition-all duration-700" style={{ width: `${p.games ? (p.kda / topKda) * 100 : 0}%` }} />
                </div>
              </div>
              <div className="text-right">
                <p className="font-display text-base font-black tabular-nums text-white leading-none">{p.games ? p.kda.toFixed(2) : "—"}</p>
                <p className="text-[9px] font-mono text-slate-500 tabular-nums">
                  {p.kills}/{p.deaths}/{p.assists} · {p.wins}-{p.games - p.wins}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </CoachPanel>
  );
}
