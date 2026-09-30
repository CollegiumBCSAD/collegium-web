"use client";

import React, { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useOnboarding } from "@/context/OnboardingContext";
import { teamsService, tournamentsService, universitiesService } from "@/services";
import { GatewayStat } from "@/types";
import GatewayHero from "@/components/gateway/GatewayHero";
import GatewayRoleCards from "@/components/gateway/GatewayRoleCards";

const SPINNER = (
  <div className="flex flex-1 min-h-screen items-center justify-center bg-[#080A10]">
    <div className="w-8 h-8 border-2 border-primary-brand/30 border-t-primary-brand rounded-full animate-spin" />
  </div>
);

function GatewayContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const intent = searchParams.get("intent") === "signup" ? "signup" : "signin";
  const { isLoaded, isLoggedIn } = useAuth();
  const { homeRoute } = useOnboarding();
  const [stats, setStats] = useState<GatewayStat[]>([]);

  // Signed-in users have already chosen their gateway.
  useEffect(() => {
    if (isLoaded && isLoggedIn) router.replace(homeRoute);
  }, [isLoaded, isLoggedIn, homeRoute, router]);

  useEffect(() => {
    let isMounted = true;
    Promise.allSettled([
      universitiesService.getUniversities(),
      teamsService.getTeams(),
      tournamentsService.getTournaments(),
    ]).then(([unis, teams, tournaments]) => {
      if (!isMounted) return;
      const count = (r: PromiseSettledResult<unknown[]>) => (r.status === "fulfilled" ? r.value.length : null);
      const next = [
        { label: "Universities", value: count(unis) },
        { label: "Active Teams", value: count(teams) },
        { label: "Tournaments", value: count(tournaments) },
      ].filter((s): s is GatewayStat => s.value !== null);
      setStats(next);
    });
    return () => {
      isMounted = false;
    };
  }, []);

  if (!isLoaded || isLoggedIn) return SPINNER;

  return (
    <div className="relative w-full min-h-screen flex flex-col bg-[#080A10] text-foreground overflow-hidden">
      {/* Ambient glows: brand red on the left, amber at center */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -left-40 top-0 w-[36rem] h-full bg-primary-brand/15 blur-[140px]" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[40rem] h-[26rem] rounded-full bg-amber-500/20 blur-[140px]" />
      </div>

      <header className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-3 min-w-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Collegium Logo" className="w-8 h-8 object-contain rounded-md shadow-md shadow-primary-brand/30" />
          <span className="min-w-0">
            <span className="block font-display text-lg font-black tracking-wider text-white leading-none">COLLEGIUM</span>
            <span className="block text-[9px] font-mono text-slate-400 truncate">Philippine Collegiate Esports Network</span>
          </span>
        </Link>
        <span className="shrink-0 px-3 py-1.5 rounded-full border border-[#232D44] bg-[#0D121F]/90 text-[10px] font-mono text-slate-300">
          Onboarding Gateway
        </span>
      </header>

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center w-full max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-8 animate-modal-pop-in">
        <GatewayHero titleId="gateway-page-title" />
        <GatewayRoleCards intent={intent} />
      </main>

      <footer className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 py-4 border-t border-[#1C2538] flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] font-mono uppercase tracking-wider text-slate-500">
        <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1">
          {stats.map((s) => (
            <span key={s.label}>
              <span className="font-bold text-slate-200">{s.value.toLocaleString()}</span> {s.label}
            </span>
          ))}
        </div>
        <span className="normal-case tracking-normal font-sans">© 2026 Collegium Philippines Esports Network</span>
      </footer>
    </div>
  );
}

export default function GatewayPage() {
  return (
    <Suspense fallback={SPINNER}>
      <GatewayContent />
    </Suspense>
  );
}
