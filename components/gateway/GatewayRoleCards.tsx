"use client";

import React from "react";
import Link from "next/link";
import { GatewayFeatureListProps, GatewayRoleCardsProps } from "@/types";
import { CheckCircleIcon, SwordsIcon, TrophyIcon } from "@/components/ui/Icons";

const ATHLETE_FEATURES = [
  "Your team's verified match history",
  "Scrim board for inter-school practice",
  "Rankings built only from verified tournament results",
];

const ORGANIZER_FEATURES = [
  "Submit a proposal; admins review it before it goes live",
  "Single/double elimination, round robin, groups + playoffs",
  "Verify results by uploading scoreboard screenshots",
];

const CARD =
  "group relative flex flex-col rounded-2xl border bg-[#0D121F]/95 p-5 sm:p-6 shadow-2xl backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 overflow-hidden";

// Both cards share one primary-CTA shape: the angled brand button. The organizer
// Both cards share one primary-CTA shape: the angled brand button.
const PRIMARY_CTA =
  "group/cta w-full h-11 game-theme-btn text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg focus-visible:outline-none focus-visible:brightness-110";

// Recalibrated tournament gold for the organizer card: uses white text and rich amber
// so it matches the high-end esports finish of the primary athlete card.
const ORGANIZER_CTA_VARS = {
  "--primary-brand": "#D97706",
  "--game-glow-rgb": "217, 119, 6",
  "--game-btn-text": "#FFFFFF",
} as React.CSSProperties;

const CTA_ARROW = "transition-transform duration-200 group-hover/cta:translate-x-1";

function FeatureList({ items, tone }: GatewayFeatureListProps) {
  return (
    <ul className="space-y-2.5">
      {items.map((item) => (
        <li key={item} className="flex items-center gap-2.5 text-xs font-sans text-slate-300">
          <CheckCircleIcon className={`w-4 h-4 shrink-0 ${tone}`} />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export default function GatewayRoleCards({ intent, onNavigate }: GatewayRoleCardsProps) {
  const athleteHref = intent === "signup" ? "/register?as=athlete" : "/login?as=athlete";
  const athleteAltHref = intent === "signup" ? "/login?as=athlete" : "/register?as=athlete";

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 w-full text-left">
      {/* Athlete / Player Card */}
      <section
        aria-labelledby="gateway-athlete-title"
        className={`${CARD} border-white/[0.08] hover:border-primary-brand/50 hover:shadow-primary-brand/5`}
      >
        {/* Subtle accent line on top */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary-brand/40 to-transparent" />

        <div className="flex items-start gap-3.5">
          <span className="w-11 h-11 shrink-0 rounded-xl bg-primary-brand/10 border border-primary-brand/30 text-primary-brand flex items-center justify-center shadow-inner shadow-primary-brand/10">
            <SwordsIcon className="w-5 h-5" />
          </span>
          <div className="min-w-0 flex-1">
            <span className="block text-[10px] font-mono font-bold uppercase tracking-[0.18em] text-rose-400">
              Athletes · Teams · Coaches
            </span>
            <h2
              id="gateway-athlete-title"
              className="mt-0.5 font-display text-xl sm:text-2xl font-black uppercase tracking-wide text-white leading-tight min-h-[3rem] sm:min-h-[3.5rem] flex items-center"
            >
              Compete &amp; follow the circuit
            </h2>
          </div>
        </div>

        <p className="mt-3 text-xs font-sans text-slate-400 leading-relaxed min-h-[2.75rem] flex items-center">
          Find scrims at your level, build a verified match record, and climb official circuit rankings.
        </p>

        <div className="mt-4 mb-5 pt-3 border-t border-white/[0.05]">
          <FeatureList items={ATHLETE_FEATURES} tone="text-primary-brand" />
        </div>

        <div className="mt-auto pt-4 border-t border-white/[0.08] space-y-2.5">
          <Link href={athleteHref} onClick={onNavigate} className={PRIMARY_CTA}>
            {intent === "signup" ? "Create Athlete Account" : "Enter Collegium"}
            <span aria-hidden className={CTA_ARROW}>→</span>
          </Link>
          <div className="h-5 flex items-center justify-center text-[11px] font-sans text-slate-500">
            {intent === "signup" ? "Already registered? " : "New here? "}
            <Link href={athleteAltHref} onClick={onNavigate} className="font-semibold text-rose-400 hover:text-rose-300 hover:underline ml-1">
              {intent === "signup" ? "Athlete sign in" : "Create an account"}
            </Link>
            {intent === "signup" ? "" : " with .edu.ph"}
          </div>
        </div>
      </section>

      {/* Tournament Organizer Card */}
      <section
        aria-labelledby="gateway-organizer-title"
        className={`${CARD} border-white/[0.08] hover:border-amber-500/50 hover:shadow-amber-500/5`}
      >
        {/* Subtle accent line on top */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />

        <div className="flex items-start gap-3.5">
          <span className="w-11 h-11 shrink-0 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center shadow-inner shadow-amber-500/10">
            <TrophyIcon className="w-5 h-5" />
          </span>
          <div className="min-w-0 flex-1">
            <span className="block text-[10px] font-mono font-bold uppercase tracking-[0.18em] text-amber-400">
              Tournament Organizers
            </span>
            <h2
              id="gateway-organizer-title"
              className="mt-0.5 font-display text-xl sm:text-2xl font-black uppercase tracking-wide text-white leading-tight min-h-[3rem] sm:min-h-[3.5rem] flex items-center"
            >
              Host official tournaments
            </h2>
          </div>
        </div>

        <p className="mt-3 text-xs font-sans text-slate-400 leading-relaxed min-h-[2.75rem] flex items-center">
          Propose events for admin approval, run custom brackets, and verify match results in one place.
        </p>

        <div className="mt-4 mb-5 pt-3 border-t border-white/[0.05]">
          <FeatureList items={ORGANIZER_FEATURES} tone="text-amber-400" />
        </div>

        <div className="mt-auto pt-4 border-t border-white/[0.08] space-y-2.5">
          <Link
            href="/register?as=organizer"
            onClick={onNavigate}
            className={PRIMARY_CTA}
            style={ORGANIZER_CTA_VARS}
          >
            Apply to host
            <span aria-hidden className={CTA_ARROW}>→</span>
          </Link>
          <div className="h-5 flex items-center justify-center text-[11px] font-sans text-slate-500">
            Already approved?{" "}
            <Link href="/login?as=organizer" onClick={onNavigate} className="font-semibold text-amber-400 hover:text-amber-300 hover:underline ml-1">
              Sign in
            </Link>
          </div>
        </div>
      </section>

      <p className="md:col-span-2 text-center text-[11px] font-sans text-slate-500 pt-1">
        Scrims are practice records (unranked). Only Organizer-verified tournament matches affect rankings.
      </p>
    </div>
  );
}
