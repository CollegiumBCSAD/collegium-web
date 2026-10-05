"use client";

import { useEffect, useState } from "react";
import { NextPracticeCardProps } from "@/types";
import { countdownParts } from "@/lib/coach";
import { RAISED } from "@/components/organize/surfaces";
import { ClockIcon } from "@/components/ui/Icons";

// "Next up" countdown to the squad's nearest practice. Ticks every 30s.
export default function NextPracticeCard({ schedules }: NextPracticeCardProps) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(id);
  }, []);

  const next = schedules
    .filter((s) => new Date(s.endsAt ?? s.startsAt).getTime() > now)
    .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime())[0];

  const shell = `relative overflow-hidden ${RAISED}`;
  const clip = { clipPath: "polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 14px 100%, 0 calc(100% - 14px))" };

  if (!next) {
    return (
      <section className={`${shell} p-5`} style={clip}>
        <p className="text-[9px] font-mono font-bold uppercase tracking-[0.25em] text-slate-500">Next up</p>
        <p className="mt-2 font-display text-lg font-black uppercase text-slate-300">Nothing on the calendar</p>
        <p className="text-xs font-sans text-slate-500">Schedule a session below and your roster gets notified.</p>
      </section>
    );
  }

  const { days, hours, minutes, total } = countdownParts(next.startsAt, now);
  const isLive = total === 0;
  const soon = !isLive && total < 60 * 60 * 1000;
  const units = [
    { value: days, label: "Days" },
    { value: hours, label: "Hrs" },
    { value: minutes, label: "Min" },
  ];
  const start = new Date(next.startsAt);

  return (
    <section className={shell} style={clip}>
      <div aria-hidden className="absolute -right-16 -top-16 w-56 h-56 rounded-full bg-primary-brand/25 blur-[70px]" />
      <span aria-hidden className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-primary-brand via-primary-brand/40 to-transparent" />
      <div className="relative p-5 space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-[9px] font-mono font-bold uppercase tracking-[0.25em] text-slate-400">Next up</p>
          {(isLive || soon) && (
            <span className="flex items-center gap-1.5 text-[9px] font-mono font-black uppercase tracking-widest text-emerald-300">
              <span className="relative flex w-2 h-2">
                <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping" />
                <span className="relative w-2 h-2 rounded-full bg-emerald-400" />
              </span>
              {isLive ? "Live now" : "Starting soon"}
            </span>
          )}
        </div>

        <div>
          <h3 className="font-display text-xl font-black uppercase tracking-wide text-white leading-tight">{next.title}</h3>
          <p className="mt-1 text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
            <ClockIcon className="w-3 h-3 text-primary-brand" />
            {start.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })} ·{" "}
            {start.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}
            {next.location && <span className="text-slate-500 truncate"> · {next.location}</span>}
          </p>
        </div>

        {!isLive && (
          <div className="grid grid-cols-3 gap-2">
            {units.map((u) => (
              <div key={u.label} className="py-2.5 bg-black/45 border border-white/[0.07] text-center">
                <p className="font-display text-3xl font-black tabular-nums text-white leading-none">{String(u.value).padStart(2, "0")}</p>
                <p className="mt-1 text-[9px] font-mono uppercase tracking-widest text-slate-500">{u.label}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
