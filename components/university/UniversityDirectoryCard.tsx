"use client";

import type { CSSProperties } from "react";
import Link from "next/link";
import { UniversityDirectoryCardProps } from "@/types";
import { getUniversityBranding } from "@/lib/universityBranding";

const OCTAGON = "polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)";

export default function UniversityDirectoryCard({
  university,
  gameShortName,
  rank,
}: UniversityDirectoryCardProps) {
  const brand = getUniversityBranding(university.name, university.domain);
  const wins = university.wins ?? 0;
  const losses = university.losses ?? 0;
  const rating = university.glicko2_rating;
  const streak = university.streak && university.streak !== "-" ? university.streak : null;

  const stats = [
    { label: "Rating", value: rating !== undefined ? Math.round(rating) : "—" },
    { label: "Record", value: `${wins}–${losses}` },
    { label: "Streak", value: streak ?? "—", tone: streak?.endsWith("W") ? "text-success" : undefined },
  ];

  return (
    <Link
      href={`/university/${university.id}`}
      style={{ "--school": brand.primary, "--school-2": brand.secondary } as CSSProperties}
      className="group relative flex flex-col overflow-hidden bg-[#0B0E17] border border-white/[0.06] shadow-2xl transition-all duration-300 hover:-translate-y-1 hover:border-[color-mix(in_srgb,var(--school)_60%,transparent)] hover:shadow-[0_24px_60px_-24px_var(--school)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-brand"
    >
      {/* Soft school-color glow carried down into the body */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-50 transition-opacity duration-300 group-hover:opacity-90"
        style={{
          background:
            "radial-gradient(120% 70% at 0% 0%, color-mix(in srgb, var(--school) 22%, transparent), transparent 70%)",
        }}
      />

      {/* School-color banner */}
      <div
        className="relative h-28 overflow-hidden"
        style={{
          background:
            "linear-gradient(120deg, var(--school) 0%, color-mix(in srgb, var(--school) 60%, #0B0E17) 50%, color-mix(in srgb, var(--school) 18%, #0B0E17) 100%)",
        }}
      >
        <div
          aria-hidden
          className="absolute inset-0 opacity-50 transition-opacity duration-300 group-hover:opacity-90"
          style={{
            backgroundImage:
              "repeating-linear-gradient(120deg, rgba(255,255,255,0.07) 0 2px, transparent 2px 14px)",
          }}
        />
        <span
          aria-hidden
          className="absolute right-4 top-1/2 -translate-y-[60%] font-display font-black italic text-[4.75rem] leading-none tracking-tighter text-white/[0.12] select-none transition-transform duration-500 group-hover:-translate-x-1.5"
        >
          {brand.abbr}
        </span>
        <span aria-hidden className="absolute left-0 top-0 h-full w-1 bg-[var(--school-2)]" />
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#0B0E17] via-[#0B0E17]/60 to-transparent" />

        <div className="absolute top-3 left-4 flex items-center gap-1.5">
          <span className="px-2 py-0.5 text-[9px] font-mono font-bold uppercase tracking-widest text-white/85 bg-black/35 backdrop-blur-md border border-white/15">
            {gameShortName}
          </span>
          {rank !== undefined && (
            <span className="px-2 py-0.5 text-[9px] font-mono font-black text-black bg-white/90">#{rank}</span>
          )}
        </div>
      </div>

      {/* Crest overlapping the banner edge */}
      <div className="relative px-5 -mt-10">
        <div
          className="w-[72px] h-[72px] p-[3px] shadow-xl transition-transform duration-300 group-hover:scale-105"
          style={{ clipPath: OCTAGON, background: "linear-gradient(135deg, var(--school-2), var(--school))" }}
        >
          <div
            className="w-full h-full p-[3px] bg-[#0B0E17]"
            style={{ clipPath: OCTAGON }}
          >
            <div
              className="w-full h-full flex items-center justify-center font-display font-black text-white tracking-tight text-sm"
              style={{
                clipPath: OCTAGON,
                background: "linear-gradient(160deg, color-mix(in srgb, var(--school) 45%, #0B0E17), #0B0E17 75%)",
              }}
            >
              {brand.abbr}
            </div>
          </div>
        </div>
      </div>

      <div className="relative flex flex-1 flex-col px-5 pt-3 pb-4">
        <h3 className="font-display text-lg leading-tight font-black uppercase text-white">{university.name}</h3>
        <p className="mt-1 flex items-center gap-1.5 text-[11px] font-mono text-slate-500">
          <span className="w-1.5 h-1.5 bg-[var(--school)]" aria-hidden />
          {university.domain}
        </p>

        {/* Varsity squad */}
        <div className="mt-4 flex items-center gap-3 px-3 py-2.5 bg-black/30 border border-white/[0.05] border-l-2 border-l-[var(--school)] transition-colors group-hover:bg-black/45">
          <div className="min-w-0 flex-1">
            <span className="block text-[9px] font-mono uppercase tracking-widest text-slate-500">Varsity squad</span>
            <span className="block mt-0.5 text-sm font-sans font-semibold text-slate-100 truncate">
              {university.teamName || "No registered squad"}
            </span>
          </div>
          {university.isProvisional && (
            <span
              className="shrink-0 px-1.5 py-0.5 text-[8px] font-mono font-bold uppercase tracking-widest text-amber-400/90 border border-amber-400/25"
              title="Provisional rating — settles after more verified tournament matches"
            >
              Provisional
            </span>
          )}
        </div>

        {/* Season snapshot */}
        <dl className="mt-auto pt-4 grid grid-cols-3 text-center">
          {stats.map((stat, idx) => (
            <div key={stat.label} className={idx > 0 ? "border-l border-white/[0.06]" : ""}>
              <dd className={`font-display text-base font-black tabular-nums ${stat.tone ?? "text-white"}`}>
                {stat.value}
              </dd>
              <dt className="text-[8px] font-mono uppercase tracking-widest text-slate-500">{stat.label}</dt>
            </div>
          ))}
        </dl>
      </div>

      <div className="relative flex items-center justify-between px-5 py-2.5 border-t border-white/[0.06] text-[9px] font-mono uppercase tracking-widest text-slate-500 transition-colors group-hover:text-white group-hover:bg-[color-mix(in_srgb,var(--school)_14%,transparent)]">
        <span>View program</span>
        <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
      </div>
    </Link>
  );
}
