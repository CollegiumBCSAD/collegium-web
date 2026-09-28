"use client";

import { HostPreviewCardProps } from "@/types";
import { formatDraftStart, hostGameFor } from "@/lib/hostTournament";
import { CalendarIcon, TrophyIcon, UsersIcon } from "@/components/ui/Icons";

// Live preview of the public tournament card, updating as the organizer types.
export default function HostPreviewCard({ draft }: HostPreviewCardProps) {
  const game = hostGameFor(draft.gameTitle);
  const start = formatDraftStart(draft.startDate);

  const rows = [
    { Icon: TrophyIcon, text: draft.bracketFormat },
    { Icon: UsersIcon, text: `${draft.teamQuota} squad slots` },
    { Icon: CalendarIcon, text: start ?? "Start time not set", muted: !start },
  ];

  return (
    <div className="space-y-3">
      <span className="text-[9px] font-mono font-bold uppercase tracking-[0.25em] text-slate-500">Live preview</span>
      <div className="overflow-hidden border border-white/10 bg-gradient-to-b from-[#141A2A] to-[#0A0D16] shadow-[0_24px_48px_-20px_rgba(0,0,0,0.9)]">
        <div className="relative h-36">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            key={draft.imagePreview || game.art}
            src={draft.imagePreview || game.art}
            alt=""
            className="w-full h-full object-cover animate-fade-in"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0D1120] via-[#0D1120]/40 to-transparent" />
          <span className="absolute top-2.5 left-2.5 px-1.5 py-0.5 text-[8px] font-mono font-bold uppercase tracking-widest text-white/85 bg-black/50 backdrop-blur-md border border-white/15">
            {game.label}
          </span>
          <span className="absolute top-2.5 right-2.5 px-1.5 py-0.5 text-[8px] font-mono font-bold uppercase tracking-widest text-primary-brand bg-black/50 backdrop-blur-md border border-primary-brand/40">
            Draft
          </span>
          <h4
            className={`absolute inset-x-3 bottom-2.5 font-display text-base font-black uppercase leading-tight line-clamp-2 ${
              draft.name.trim() ? "text-white" : "text-white/35"
            }`}
          >
            {draft.name.trim() || "Your tournament name"}
          </h4>
        </div>
        <ul className="px-3 py-3 space-y-2">
          {rows.map(({ Icon, text, muted }) => (
            <li key={text} className={`flex items-center gap-2 text-[11px] font-mono ${muted ? "text-slate-600" : "text-slate-300"}`}>
              <Icon className="w-3.5 h-3.5 shrink-0 text-primary-brand/80" />
              {text}
            </li>
          ))}
        </ul>
      </div>
      {draft.rules.trim() && (
        <p className="text-[10px] font-sans text-slate-500 line-clamp-3">
          <span className="font-mono uppercase tracking-widest text-slate-600">Rules · </span>
          {draft.rules}
        </p>
      )}
    </div>
  );
}
