"use client";

import Image from "next/image";
import { CoachHubHeroProps } from "@/types";
import { GAME_ART, RAISED, BRAND_BTN } from "@/components/organize/surfaces";
import { PlusIcon, ShieldIcon, UsersIcon, ZapIcon, MessageSquareIcon } from "@/components/ui/Icons";

const PANEL_CLIP = "polygon(18% 0, 100% 0, 82% 100%, 0 100%)";

export default function CoachHubHero({ coachName, universityName, gameId, teams, invitationCount, onCreateTeam }: CoachHubHeroProps) {
  const athletes = teams.reduce((n, t) => n + t.members.length, 0);
  const requests = teams.reduce((n, t) => n + t._count.members, 0);

  const facts = [
    { label: "Squads", value: teams.length, Icon: ShieldIcon },
    { label: "Athletes", value: athletes, Icon: UsersIcon },
    { label: "Join requests", value: requests, Icon: ZapIcon, hot: requests > 0 },
    { label: "Invitations", value: invitationCount, Icon: MessageSquareIcon, hot: invitationCount > 0 },
  ];

  return (
    <header className={`relative overflow-hidden ${RAISED}`}>
      <div aria-hidden className="absolute inset-y-0 right-0 w-full lg:w-[58%] flex [mask-image:linear-gradient(to_left,black_45%,transparent)]">
        {(GAME_ART[gameId] ?? GAME_ART.valo).map((src, idx) => (
          <div key={src} className="relative flex-1 -ml-[6%] first:ml-0" style={{ clipPath: PANEL_CLIP }}>
            <Image src={src} alt="" fill priority={idx === 0} sizes="25vw" className="object-cover opacity-55 transition-opacity duration-700" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0A0D16] via-transparent to-[#0A0D16]/60" />
          </div>
        ))}
        <div className="absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-[#0A0D16] via-[#0A0D16]/80 to-transparent" />
      </div>
      <div aria-hidden className="absolute -left-32 -top-32 w-[28rem] h-[28rem] rounded-full bg-primary-brand/20 blur-[110px] transition-colors duration-700" />
      <div aria-hidden className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-primary-brand via-primary-brand/40 to-transparent" />

      <div className="relative px-6 sm:px-9 pt-9 pb-7 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="min-w-0">
          <span className="inline-flex items-center gap-2 px-2.5 py-1 text-[10px] font-mono font-black uppercase tracking-[0.25em] text-slate-300 bg-black/40 backdrop-blur-md border border-white/10">
            <span className="w-1.5 h-1.5 bg-primary-brand shadow-[0_0_8px_var(--primary-brand)]" />
            Coach / Manager
            {universityName && (
              <>
                <span className="text-slate-600">/</span>
                <span className="text-white">{universityName}</span>
              </>
            )}
          </span>
          <h1 className="mt-4 font-display text-4xl sm:text-5xl font-black uppercase tracking-tight leading-[0.9] text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-400">
            Coach
            <br />
            Hub
          </h1>
          <p className="mt-3 text-sm font-sans text-slate-400">
            Welcome back, <span className="text-white font-semibold">{coachName}</span>
          </p>
        </div>

        <button
          type="button"
          onClick={onCreateTeam}
          className={`group self-start lg:self-auto h-12 pl-5 pr-7 ${BRAND_BTN} font-display text-sm font-black uppercase tracking-wider flex items-center gap-2.5 cursor-pointer`}
          style={{ clipPath: "polygon(10px 0, 100% 0, calc(100% - 10px) 100%, 0 100%)" }}
        >
          <PlusIcon className="w-4 h-4 transition-transform duration-300 group-hover:rotate-90" />
          New Team
        </button>
      </div>

      <dl className="relative grid grid-cols-2 lg:grid-cols-4 gap-3 px-4 sm:px-9 pb-7">
        {facts.map(({ label, value, Icon, hot }) => (
          <div key={label} className="relative overflow-hidden flex items-center gap-3.5 px-4 py-3.5 bg-black/45 backdrop-blur-md border border-white/[0.07] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
            <span aria-hidden className={`absolute inset-x-0 top-0 h-px bg-gradient-to-r to-transparent ${hot ? "from-primary-brand" : "from-white/25"}`} />
            <span className={`w-10 h-10 shrink-0 flex items-center justify-center border ${hot ? "text-primary-brand border-primary-brand/40 bg-primary-brand/15" : "text-slate-300 border-white/10 bg-gradient-to-br from-white/[0.08] to-transparent"}`}>
              <Icon className="w-4 h-4" />
            </span>
            <div>
              <dd className={`font-display text-2xl font-black tabular-nums leading-none ${hot ? "text-primary-brand" : "text-white"}`}>{value}</dd>
              <dt className="mt-1 text-[9px] font-mono uppercase tracking-widest text-slate-400">{label}</dt>
            </div>
          </div>
        ))}
      </dl>
    </header>
  );
}
