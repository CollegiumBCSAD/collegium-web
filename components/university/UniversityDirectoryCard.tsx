"use client";

import type { CSSProperties } from "react";
import Link from "next/link";
import { UniversityDirectoryCardProps } from "@/types";
import { getUniversityBranding, mutedBranding } from "@/lib/universityBranding";
import UniversityShield from "./UniversityShield";
import { DOT_SURFACE } from "./surface";

export default function UniversityDirectoryCard({
  university,
  gameShortName,
  rank,
}: UniversityDirectoryCardProps) {
  const brand = getUniversityBranding(university.name, university.domain);
  const muted = mutedBranding(brand);
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
      id={`uni-${university.id}`}
      // School colors are blended toward slate so they tint rather than shout.
      style={{ "--school": muted.primary } as CSSProperties}
      className={`group relative flex flex-col scroll-mt-24 overflow-hidden rounded-2xl border border-white/[0.07] ${DOT_SURFACE} shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_18px_40px_-24px_rgba(0,0,0,0.9)] transition-all duration-300 hover:-translate-y-1 hover:border-[color-mix(in_srgb,var(--school)_45%,transparent)] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_28px_60px_-28px_color-mix(in_srgb,var(--school)_80%,transparent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-brand`}
    >
      {/* Light source: school-tinted wash in the crest corner */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-60 transition-opacity duration-500 group-hover:opacity-100"
        style={{ background: "radial-gradient(90% 60% at 12% 0%, color-mix(in srgb, var(--school) 16%, transparent), transparent 70%)" }}
      />
      {/* Accent rule: a short school-color line that extends on hover */}
      <span
        aria-hidden
        className="absolute left-6 top-0 h-[3px] w-10 rounded-b-full bg-[var(--school)] transition-all duration-500 group-hover:w-24"
      />

      <div className="relative flex items-start gap-4 px-6 pt-6">
        <UniversityShield
          abbr={brand.abbr}
          primary={muted.primary}
          secondary={muted.secondary}
          className="w-12 h-14 shrink-0 transition-transform duration-500 group-hover:-rotate-3 group-hover:scale-105"
        />
        <div className="min-w-0 flex-1 pt-1">
          <h3 className="font-display text-lg font-black uppercase leading-tight text-white">{university.name}</h3>
          <p className="mt-1 text-[11px] font-mono text-slate-500">{university.domain}</p>
        </div>
        {rank !== undefined && (
          <span className="font-display text-2xl font-black leading-none tabular-nums text-transparent [-webkit-text-stroke:1px_rgba(148,163,184,0.5)]">
            {String(rank).padStart(2, "0")}
          </span>
        )}
      </div>

      <div className="relative mx-6 mt-5 pt-4 border-t border-white/[0.06]">
        <div className="flex items-baseline justify-between gap-3">
          <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-slate-500">{gameShortName} squad</span>
          {university.isProvisional && (
            <span
              className="text-[10px] font-mono uppercase tracking-widest text-slate-600"
              title="Provisional rating — settles after more verified tournament matches"
            >
              Provisional
            </span>
          )}
        </div>
        <p className="mt-1 text-[15px] font-sans font-semibold text-slate-100 truncate">
          {university.teamName || "No registered squad"}
        </p>
      </div>

      <dl className="relative mx-6 mt-5 grid grid-cols-3">
        {stats.map((stat, idx) => (
          <div key={stat.label} className={idx > 0 ? "pl-4 border-l border-white/[0.06]" : ""}>
            <dt className="text-[9px] font-mono uppercase tracking-[0.2em] text-slate-500">{stat.label}</dt>
            <dd className={`mt-1 font-display text-2xl font-black tabular-nums leading-none ${stat.tone ?? "text-white"}`}>
              {stat.value}
            </dd>
          </div>
        ))}
      </dl>

      <div className="relative mt-6 px-6 pb-5 flex items-center gap-2 text-[11px] font-mono font-bold uppercase tracking-[0.2em] text-slate-500 transition-colors group-hover:text-white">
        View program
        <span className="inline-block transition-transform duration-300 group-hover:translate-x-1.5 text-primary-brand">→</span>
      </div>
    </Link>
  );
}
