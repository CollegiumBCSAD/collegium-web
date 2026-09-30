"use client";

import React from "react";
import Link from "next/link";
import { GatewayFeatureListProps, GatewayRoleCardsProps } from "@/types";
import { CheckCircleIcon, SwordsIcon, TrophyIcon } from "@/components/ui/Icons";

const ATHLETE_FEATURES = [
  "Main Athlete & Squad Dashboard",
  "Inter-Collegiate Scrim Matchmaking",
  "University Glicko-2 Standings & Rosters",
];

const ORGANIZER_FEATURES = [
  "Register Tournament Proposal for Approval",
  "Single, Double, Round Robin & 2-Stage Brackets",
  "EasyOCR Match Logging Verification",
];

const CARD =
  "group relative flex flex-col rounded-2xl border bg-[#0D121F]/95 p-5 sm:p-6 shadow-2xl backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5";

function FeatureList({ items, tone }: GatewayFeatureListProps) {
  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li key={item} className="flex items-center gap-2.5 text-xs font-sans text-slate-300">
          <CheckCircleIcon className={`w-3.5 h-3.5 shrink-0 ${tone}`} />
          {item}
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
      {/* Athlete / Player */}
      <section
        aria-labelledby="gateway-athlete-title"
        className={`${CARD} border-[#1E293B] hover:border-primary-brand/50`}
      >
        <div className="flex items-start gap-3.5">
          <span className="w-11 h-11 shrink-0 rounded-xl bg-primary-brand/10 border border-primary-brand/40 text-primary-brand flex items-center justify-center">
            <SwordsIcon className="w-5 h-5" />
          </span>
          <div className="min-w-0">
            <span className="block text-[9px] font-mono font-bold uppercase tracking-[0.2em] text-primary-brand">
              Main Athlete &amp; Fan Portal
            </span>
            <h2
              id="gateway-athlete-title"
              className="font-display text-xl sm:text-2xl font-black uppercase tracking-wide text-white leading-tight"
            >
              Open Collegium in Browser
            </h2>
          </div>
        </div>

        <p className="mt-4 text-xs font-sans text-slate-400 leading-relaxed">
          Explore varsity team rosters, book practice scrims, view Glicko-2 university leaderboards, and view
          official tournament brackets.
        </p>
        <div className="mt-4 mb-5">
          <FeatureList items={ATHLETE_FEATURES} tone="text-primary-brand" />
        </div>

        <div className="mt-auto pt-4 border-t border-[#1C2538] space-y-2.5">
          <Link
            href={athleteHref}
            onClick={onNavigate}
            className="w-full h-11 game-theme-btn rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg"
          >
            {intent === "signup" ? "Create Athlete Account" : "Open Collegium in Browser"}
            <span aria-hidden>→</span>
          </Link>
          <p className="text-center text-[11px] font-sans text-slate-500">
            {intent === "signup" ? "Already registered? " : "New athlete? "}
            <Link href={athleteAltHref} onClick={onNavigate} className="font-semibold text-primary-brand hover:underline">
              {intent === "signup" ? "Athlete sign in" : "Create an account"}
            </Link>
          </p>
        </div>
      </section>

      {/* Tournament Organizer */}
      <section
        aria-labelledby="gateway-organizer-title"
        className={`${CARD} border-amber-500/40 hover:border-amber-400/70`}
      >
        <div className="flex items-start gap-3.5">
          <span className="w-11 h-11 shrink-0 rounded-xl bg-amber-500/10 border border-amber-500/40 text-amber-400 flex items-center justify-center">
            <TrophyIcon className="w-5 h-5" />
          </span>
          <div className="min-w-0">
            <span className="block text-[9px] font-mono font-bold uppercase tracking-[0.2em] text-amber-400">
              Event Host &amp; Organizer Workspace
            </span>
            <h2
              id="gateway-organizer-title"
              className="font-display text-xl sm:text-2xl font-black uppercase tracking-wide text-white leading-tight"
            >
              Apply &amp; Host Tournament
            </h2>
          </div>
        </div>

        <p className="mt-4 text-xs font-sans text-slate-400 leading-relaxed">
          Submit event applications for admin review, manage auto-accepted team rosters, run multi-format
          bracketing, and process EasyOCR match logs.
        </p>
        <div className="mt-4 mb-5">
          <FeatureList items={ORGANIZER_FEATURES} tone="text-amber-400" />
        </div>

        <div className="mt-auto pt-4 border-t border-[#1C2538] flex flex-col sm:flex-row gap-2.5">
          <Link
            href="/register?as=organizer"
            onClick={onNavigate}
            className="flex-1 h-11 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-amber-500/10 transition-all active:scale-[0.98]"
          >
            <TrophyIcon className="w-4 h-4" />
            Apply for Tournament
            <span aria-hidden>→</span>
          </Link>
          <Link
            href="/login?as=organizer"
            onClick={onNavigate}
            className="h-11 px-5 rounded-xl border border-amber-500/40 hover:border-amber-400 hover:bg-amber-500/10 text-amber-300 text-xs font-black uppercase tracking-wider flex items-center justify-center transition-colors"
          >
            Dashboard Sign In
          </Link>
        </div>
      </section>
    </div>
  );
}
