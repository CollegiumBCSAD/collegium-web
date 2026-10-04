"use client";

import { useState } from "react";
import Image from "next/image";
import { CoachTeamPanelProps } from "@/types";
import { getGameInfo } from "@/lib/games";
import { winRate } from "@/lib/coach";
import { GAME_ART, RAISED } from "@/components/organize/surfaces";
import { CrownIcon, SwordsIcon, TrophyIcon, UsersIcon, ZapIcon } from "@/components/ui/Icons";

// Active-squad banner: identity over the title's key art, plus four vitals.
export default function CoachTeamOverview({ team }: CoachTeamPanelProps) {
  const [copied, setCopied] = useState(false);
  const game = getGameInfo(team.gameTitle);
  const art = (GAME_ART[game.id] ?? GAME_ART.valo)[1];
  const { wins, losses, total } = team.practiceSummary;
  const entries = team.tournamentApplications.filter((a) => a.status !== "REJECTED");
  const approved = entries.filter((a) => a.status === "APPROVED").length;

  const copyInvite = () => {
    navigator.clipboard.writeText(`${window.location.origin}/team/join?invite=${team.inviteCode}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const vitals = [
    {
      label: "Roster",
      value: `${team.members.length}/${team.max_roster_size}`,
      Icon: UsersIcon,
      bar: team.members.length / team.max_roster_size,
      foot: team.members.length < team.min_roster_size ? `${team.min_roster_size - team.members.length} short of a lineup` : "Lineup ready",
    },
    { label: "Rating", value: Math.round(team.glicko2_rating).toString(), Icon: ZapIcon, foot: `± ${Math.round(team.glicko2_rd)} RD` },
    {
      label: "Scrim record",
      value: total ? `${wins}-${losses}` : "—",
      Icon: SwordsIcon,
      bar: total ? wins / total : undefined,
      foot: total ? `${winRate(wins, total)}% win rate` : "No scrims logged",
    },
    { label: "Tournaments", value: entries.length.toString(), Icon: TrophyIcon, foot: `${approved} approved` },
  ];

  return (
    <section className={`relative overflow-hidden ${RAISED}`} style={{ clipPath: "polygon(0 0, calc(100% - 18px) 0, 100% 18px, 100% 100%, 18px 100%, 0 calc(100% - 18px))" }}>
      <div aria-hidden className="absolute inset-y-0 right-0 w-2/3 [mask-image:linear-gradient(to_left,black_30%,transparent)]">
        <Image src={art} alt="" fill sizes="40vw" className="object-cover opacity-40" />
      </div>
      <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-[#0A0D16] via-[#0A0D16]/70 to-transparent" />
      <div aria-hidden className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-primary-brand via-primary-brand/30 to-transparent" />

      <div className="relative p-5 sm:p-7 space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[10px] font-mono font-black uppercase tracking-[0.25em] text-primary-brand">
              {game.name} · {team.university.name}
            </p>
            <h2 className="mt-1 font-display text-3xl sm:text-4xl font-black uppercase tracking-tight text-white leading-none truncate drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)]">
              {team.name}
            </h2>
            <p className="mt-2 text-xs font-sans text-slate-300 flex items-center gap-1.5">
              <CrownIcon className="w-3.5 h-3.5 text-amber-400" />
              {team.captain ? team.captain.displayName : "No captain yet — the first athlete to join takes it"}
            </p>
          </div>
          <button
            type="button"
            onClick={copyInvite}
            className="h-10 pl-3 pr-4 bg-black/50 backdrop-blur-md border border-white/10 hover:border-primary-brand/60 flex items-center gap-2.5 cursor-pointer transition-colors"
            title="Copy athlete invite link"
          >
            <span className="text-[9px] font-mono uppercase tracking-widest text-slate-500">Invite</span>
            <span className="font-mono text-sm font-bold text-white tracking-wider">{team.inviteCode}</span>
            <span className="text-[10px] font-mono text-primary-brand">{copied ? "✓ copied" : "copy"}</span>
          </button>
        </div>

        <dl className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
          {vitals.map(({ label, value, Icon, bar, foot }) => (
            <div key={label} className="relative overflow-hidden px-4 py-3.5 bg-black/50 backdrop-blur-md border border-white/[0.07]">
              <span aria-hidden className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-white/25 to-transparent" />
              <dt className="flex items-center gap-1.5 text-[9px] font-mono font-bold uppercase tracking-widest text-slate-500">
                <Icon className="w-3 h-3 text-primary-brand" />
                {label}
              </dt>
              <dd className="mt-1.5 font-display text-2xl font-black tabular-nums text-white leading-none">{value}</dd>
              {bar !== undefined && (
                <div className="mt-2 h-1 bg-white/10 overflow-hidden">
                  <div className="h-full bg-primary-brand shadow-[0_0_8px_var(--primary-brand)] transition-all duration-700" style={{ width: `${Math.min(100, bar * 100)}%` }} />
                </div>
              )}
              <p className="mt-1.5 text-[10px] font-sans text-slate-500 truncate">{foot}</p>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
