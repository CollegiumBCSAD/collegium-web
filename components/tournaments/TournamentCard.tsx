"use client";

import Image from "next/image";
import { TournamentCardProps } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { approvedTeamCount, formatStart, matchProgress, tournamentCover } from "@/lib/organize";
import { DOT_SURFACE } from "@/components/university/surface";
import { ShieldIcon } from "@/components/ui/Icons";
import TournamentApplicationState from "./TournamentApplicationState";

const STATUS: Record<string, { label: string; className: string; pulse?: boolean }> = {
  LIVE: { label: "Live now", className: "text-primary-brand", pulse: true },
  UPCOMING: { label: "Registration open", className: "text-sky-300" },
  COMPLETED: { label: "Completed", className: "text-slate-400" },
  PENDING_APPROVAL: { label: "Awaiting approval", className: "text-amber-300" },
  REJECTED: { label: "Changes requested", className: "text-rose-300" },
};

export default function TournamentCard({ tournament: t, onSelect, onApply, onWithdraw, isApplied, isApplying }: TournamentCardProps) {
  const { user } = useAuth();
  const isHost = Boolean(user?.id && (t.organizerId === user.id || t.organizer?.id === user.id));
  const isLive = t.status === "LIVE";
  const status = STATUS[t.status] ?? STATUS.UPCOMING;
  const start = formatStart(t.startDate);
  const squads = approvedTeamCount(t);
  const quota = t.teamQuota ?? 0;
  const progress = matchProgress(t);

  const stats = [
    { label: "Format", value: t.bracketFormat || "Single Elim" },
    { label: "Squads", value: quota ? `${squads}/${quota}` : `${squads}`, bar: quota ? squads / quota : undefined },
    { label: "Matches", value: progress.total ? `${progress.played}/${progress.total}` : "—", bar: progress.total ? progress.played / progress.total : undefined },
  ];

  return (
    <article
      className={`group relative flex flex-col md:flex-row overflow-hidden rounded-2xl border ${DOT_SURFACE} transition-all duration-300 hover:-translate-y-0.5 ${
        isLive
          ? "border-primary-brand/40 shadow-[0_24px_60px_-30px_rgba(var(--game-glow-rgb),0.7)]"
          : "border-white/[0.07] shadow-[0_18px_40px_-24px_rgba(0,0,0,0.9)] hover:border-white/[0.14]"
      }`}
    >
      {isLive && <span aria-hidden className="absolute left-0 inset-y-0 w-1 bg-primary-brand shadow-[0_0_16px_var(--primary-brand)] z-10" />}

      {/* Cover art */}
      <div className="relative md:w-80 h-44 md:h-auto shrink-0 overflow-hidden">
        <Image
          src={t.image || tournamentCover(t)}
          alt=""
          fill
          sizes="(min-width: 768px) 320px, 100vw"
          className="object-cover opacity-70 transition-all duration-700 group-hover:opacity-90 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-transparent via-[#090C14]/30 to-[#090C14]" />
        <div className="absolute top-3.5 left-3.5 flex flex-wrap gap-1.5">
          <span className="px-2.5 py-1 rounded-full text-[9px] font-mono font-bold uppercase tracking-widest text-white bg-black/55 backdrop-blur-md border border-white/15">
            {t.game}
          </span>
          {t.streamIsLive && t.streamUrl && (
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-mono font-bold uppercase tracking-widest text-white bg-rose-600/90">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              On stream
            </span>
          )}
        </div>
      </div>

      {/* Details */}
      <div className="relative flex-1 flex flex-col p-6 sm:p-7">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] font-mono font-bold uppercase tracking-[0.2em]">
          <span className={`flex items-center gap-2 ${status.className}`}>
            {status.pulse && <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />}
            {status.label}
          </span>
          {start && <span className="text-slate-500">Starts {start}</span>}
          {isHost && <span className="text-slate-300">· Hosted by you</span>}
        </div>

        <h2 className="mt-2 font-display text-2xl sm:text-3xl font-black uppercase leading-tight tracking-tight text-white">{t.title}</h2>

        <dl className="mt-5 grid grid-cols-3 max-w-lg">
          {stats.map((s, i) => (
            <div key={s.label} className={i > 0 ? "pl-5 border-l border-white/[0.07]" : "pr-5"}>
              <dt className="text-[9px] font-mono uppercase tracking-[0.2em] text-slate-500">{s.label}</dt>
              <dd className="mt-1 font-display text-lg font-black leading-tight text-white truncate">{s.value}</dd>
              {s.bar !== undefined && (
                <span className="mt-1.5 block h-1 rounded-full bg-white/[0.07] overflow-hidden">
                  <span className="block h-full rounded-full bg-primary-brand" style={{ width: `${Math.min(100, s.bar * 100)}%` }} />
                </span>
              )}
            </div>
          ))}
        </dl>

        <div className="mt-6 pt-5 border-t border-white/[0.06] flex flex-wrap items-center justify-between gap-3">
          <TournamentApplicationState
            tournament={t}
            onApply={onApply}
            onWithdraw={onWithdraw}
            isApplied={isApplied}
            isApplying={isApplying}
          />

          <div className="ml-auto flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => onSelect(t, "overview")}
              className="tactical-btn-secondary h-10 px-5 gap-2 text-xs"
            >
              <ShieldIcon className="w-3.5 h-3.5" />
              Rules & overview
            </button>
            <button type="button" onClick={() => onSelect(t, "bracket")} className="game-theme-btn h-10 px-5 gap-2 text-xs">
              {isLive ? "Open bracket" : t.status === "COMPLETED" ? "View results" : "View bracket"}
              <span>→</span>
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
