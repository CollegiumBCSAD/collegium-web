"use client";

import Link from "next/link";
import { UniversityDirectoryCardProps } from "@/types";
import { TrophyIcon, ShieldIcon } from "@/components/ui/Icons";

export default function UniversityDirectoryCard({
  university,
  rank,
}: UniversityDirectoryCardProps) {
  const initials = university.name
    .split(" ")
    .filter((word) => /^[A-Za-z]/.test(word))
    .slice(0, 3)
    .map((word) => word[0])
    .join("")
    .toUpperCase();

  const hasRecord =
    university.wins !== undefined || university.losses !== undefined;
  const wins = university.wins ?? 0;
  const losses = university.losses ?? 0;

  return (
    <Link
      href={`/university/${university.id}`}
      className="group p-5 bg-[#0A0D18] border border-[#1E293B] hover:border-primary-brand/50 transition-colors shadow-xl flex flex-col gap-4 relative"
      style={{
        clipPath:
          "polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px))",
      }}
    >
      <div className="flex items-center gap-3 min-w-0">
        {/* 8-Sided Octagonal Varsity Emblem */}
        <div
          className="w-12 h-12 bg-[#121828] text-white flex items-center justify-center font-display font-black text-sm border border-white/10 shrink-0 group-hover:border-primary-brand/60 transition-colors"
          style={{
            clipPath:
              "polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)",
          }}
        >
          {initials || "UNI"}
        </div>

        <div className="min-w-0 flex-1">
          <span className="font-display text-sm font-black uppercase text-white block truncate group-hover:text-primary-brand transition-colors">
            {university.name}
          </span>
          <span className="text-[10px] font-mono text-slate-400 block truncate">
            {university.domain}
          </span>
        </div>

        {rank !== undefined && (
          <span
            className="text-[10px] font-mono font-black text-slate-300 bg-[#121828] border border-[#202C45] px-2.5 py-1 shrink-0"
            style={{
              clipPath: "polygon(6px 0, 100% 0, calc(100% - 6px) 100%, 0 100%)",
            }}
          >
            #{rank}
          </span>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2 pt-3 border-t border-[#182338]">
        <div>
          <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest block">
            Rating
          </span>
          <span className="font-display text-base font-black text-white mt-0.5 block">
            {university.glicko2_rating
              ? Math.round(university.glicko2_rating)
              : "—"}
          </span>
        </div>
        <div>
          <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest block">
            Record
          </span>
          <span className="font-display text-base font-black text-white mt-0.5 block">
            {hasRecord ? `${wins}W-${losses}L` : "—"}
          </span>
        </div>
        <div>
          <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest block">
            Squad
          </span>
          <span className="font-mono text-[11px] font-bold text-slate-300 mt-1 block truncate">
            {university.teamName || "Unregistered"}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between text-[9px] font-mono uppercase tracking-widest">
        <span className="flex items-center gap-1.5 text-slate-400">
          {university.isProvisional ? (
            <>
              <ShieldIcon className="w-3 h-3 text-amber-400" />
              <span className="text-amber-400">Provisional Rating</span>
            </>
          ) : (
            <>
              <TrophyIcon className="w-3 h-3 text-primary-brand" />
              <span>{university.streak && university.streak !== "-" ? `${university.streak} Streak` : "Accredited Varsity"}</span>
            </>
          )}
        </span>
        <span className="text-slate-500 group-hover:text-primary-brand transition-colors">
          View Profile →
        </span>
      </div>
    </Link>
  );
}
