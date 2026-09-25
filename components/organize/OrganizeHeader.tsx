"use client";

import Image from "next/image";
import { OrganizeHeaderProps } from "@/types";
import { PlusIcon, TrophyIcon, UsersIcon, ZapIcon } from "@/components/ui/Icons";
import { approvedTeamCount, pendingApplicationCount } from "@/lib/organize";
import { BRAND_BTN, GAME_ART, RAISED } from "./surfaces";

const PANEL_CLIP = "polygon(18% 0, 100% 0, 82% 100%, 0 100%)";

export default function OrganizeHeader({
  gameId,
  gameName,
  hostName,
  universityName,
  tournaments,
  onHost,
}: OrganizeHeaderProps) {
  const live = tournaments.filter((t) => t.status === "LIVE").length;
  const teams = tournaments.reduce((sum, t) => sum + approvedTeamCount(t), 0);
  const waiting = tournaments.reduce((sum, t) => sum + pendingApplicationCount(t), 0);

  const facts = [
    { label: "Hosted", value: tournaments.length, Icon: TrophyIcon },
    { label: "Live now", value: live, Icon: ZapIcon, pulse: live > 0 },
    { label: "Teams competing", value: teams, Icon: UsersIcon },
    { label: "Applications waiting", value: waiting, Icon: UsersIcon, hot: waiting > 0 },
  ];

  return (
    <header className={`relative overflow-hidden ${RAISED}`}>
      {/* Slanted strip of the selected title's key art */}
      <div
        aria-hidden
        className="absolute inset-y-0 right-0 w-full lg:w-[55%] flex [mask-image:linear-gradient(to_left,black_45%,transparent)]"
      >
        {(GAME_ART[gameId] ?? GAME_ART.valo).map((src, idx) => (
          <div key={src} className="relative flex-1 -ml-[6%] first:ml-0" style={{ clipPath: PANEL_CLIP }}>
            <Image src={src} alt="" fill priority={idx === 0} sizes="25vw" className="object-cover opacity-55" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0A0D16] via-transparent to-[#0A0D16]/60" />
          </div>
        ))}
        <div className="absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-[#0A0D16] via-[#0A0D16]/80 to-transparent" />
      </div>
      <div aria-hidden className="absolute -left-32 -top-32 w-[28rem] h-[28rem] rounded-full bg-primary-brand/20 blur-[110px]" />
      <div aria-hidden className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-primary-brand via-primary-brand/40 to-transparent" />

      <div className="relative px-6 sm:px-9 pt-9 pb-7 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="min-w-0">
          <span className="inline-flex items-center gap-2 px-2.5 py-1 text-[10px] font-mono font-black uppercase tracking-[0.25em] text-slate-300 bg-black/40 backdrop-blur-md border border-white/10">
            <span className="w-1.5 h-1.5 bg-primary-brand shadow-[0_0_8px_var(--primary-brand)]" />
            Organize
            <span className="text-slate-600">/</span>
            <span className="text-white">{gameName}</span>
          </span>
          <h1 className="mt-4 font-display text-4xl sm:text-5xl font-black uppercase tracking-tight leading-[0.9] text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-400">
            Tournament
            <br />
            Operations
          </h1>
          <p className="mt-3 text-sm font-sans text-slate-400">
            Hosting as <span className="text-white font-semibold">{hostName}</span>
            {universityName && <span className="text-slate-500"> · {universityName}</span>}
          </p>
        </div>

        <button
          type="button"
          onClick={onHost}
          className={`group relative self-start lg:self-auto h-12 pl-5 pr-7 ${BRAND_BTN} font-display text-sm font-black uppercase tracking-wider flex items-center gap-2.5`}
          style={{ clipPath: "polygon(10px 0, 100% 0, calc(100% - 10px) 100%, 0 100%)" }}
        >
          <PlusIcon className="w-4 h-4 transition-transform duration-300 group-hover:rotate-90" />
          Host a tournament
        </button>
      </div>

      <dl className="relative grid grid-cols-2 lg:grid-cols-4 gap-3 px-6 sm:px-9 pb-7">
        {facts.map(({ label, value, Icon, pulse, hot }) => (
          <div
            key={label}
            className="relative overflow-hidden flex items-center gap-3.5 px-4 py-3.5 bg-black/45 backdrop-blur-md border border-white/[0.07] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]"
          >
            <span
              aria-hidden
              className={`absolute inset-x-0 top-0 h-px bg-gradient-to-r to-transparent ${hot ? "from-primary-brand" : "from-white/25"}`}
            />
            <span
              className={`relative w-10 h-10 shrink-0 flex items-center justify-center border ${
                hot
                  ? "text-primary-brand border-primary-brand/40 bg-primary-brand/15"
                  : "text-slate-300 border-white/10 bg-gradient-to-br from-white/[0.08] to-transparent"
              }`}
            >
              <Icon className="w-4.5 h-4.5" />
              {pulse && (
                <span className="absolute -top-1 -right-1 flex w-2 h-2">
                  <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping" />
                  <span className="relative w-2 h-2 rounded-full bg-emerald-400" />
                </span>
              )}
            </span>
            <div className="relative">
              <dd className={`font-display text-2xl font-black tabular-nums leading-none ${hot ? "text-primary-brand" : "text-white"}`}>
                {value}
              </dd>
              <dt className="mt-1 text-[9px] font-mono uppercase tracking-widest text-slate-400">{label}</dt>
            </div>
          </div>
        ))}
      </dl>
    </header>
  );
}
