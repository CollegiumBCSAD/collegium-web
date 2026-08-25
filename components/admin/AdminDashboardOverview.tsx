"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { adminService, tournamentsService, scrimsService } from "@/services";
import {
  mockFlaggedMatches,
} from "@/lib/mock/admin";
import {
  TrophyIcon,
  SwordsIcon,
  UsersIcon,
  AlertTriangleIcon,
  ShieldIcon,
  FlameIcon,
} from "@/components/ui/Icons";

export default function AdminDashboardOverview() {
  const [totalUsers, setTotalUsers] = useState<number | null>(null);
  const [pendingTournamentsCount, setPendingTournamentsCount] = useState<number>(0);
  const [scrimsCount, setScrimsCount] = useState<number>(0);

  useEffect(() => {
    adminService
      .getUsers()
      .then((users) => setTotalUsers(users.length))
      .catch(() => setTotalUsers(null));

    tournamentsService
      .getPendingTournaments()
      .then((tourneys) => setPendingTournamentsCount(tourneys.length))
      .catch(() => setPendingTournamentsCount(0));

    scrimsService
      .getScrims()
      .then((scrims) => setScrimsCount(scrims.length))
      .catch(() => setScrimsCount(0));
  }, []);

  const flaggedMatches = mockFlaggedMatches.length;

  const STAT_CARDS = [
    {
      label: "Pending Tournaments",
      value: pendingTournamentsCount,
      sublabel: "Awaiting sanction review",
      icon: <TrophyIcon className="w-5 h-5" />,
      accent: pendingTournamentsCount > 0 ? "border-emerald-500/40 text-emerald-400" : "border-[#1A1A1A] text-neutral-400",
      badge: pendingTournamentsCount > 0 ? "ACTION REQUIRED" : "CLEAR",
      badgeStyle: pendingTournamentsCount > 0 ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30 animate-pulse" : "bg-neutral-900 text-neutral-500 border-neutral-800",
      href: "/admin/tournaments",
    },
    {
      label: "Active Scrim Posts",
      value: scrimsCount,
      sublabel: "Live campus challenges",
      icon: <SwordsIcon className="w-5 h-5" />,
      accent: "border-[#1A1A1A] text-emerald-400",
      badge: "LIVE FEED",
      badgeStyle: "bg-teal-500/10 text-teal-300 border-teal-500/30",
      href: "/admin/scrim-board",
    },
    {
      label: "Disputed Matches",
      value: flaggedMatches,
      sublabel: "Flagged for resolution",
      icon: <AlertTriangleIcon className="w-5 h-5" />,
      accent: flaggedMatches > 0 ? "border-rose-500/40 text-rose-400" : "border-[#1A1A1A] text-neutral-400",
      badge: flaggedMatches > 0 ? "CRITICAL" : "CLEAR",
      badgeStyle: flaggedMatches > 0 ? "bg-rose-500/10 text-rose-300 border-rose-500/30" : "bg-neutral-900 text-neutral-500 border-neutral-800",
      href: "/admin/disputes",
    },
    {
      label: "Registered Users",
      value: totalUsers ?? "—",
      sublabel: "Athletes & organizers",
      icon: <UsersIcon className="w-5 h-5" />,
      accent: "border-[#1A1A1A] text-emerald-400",
      badge: "VERIFIED",
      badgeStyle: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
      href: "/admin/users",
    },
  ];

  const TRIAGE_ROWS = [
    {
      title: "Tournament Sanctioning Queue",
      description: "Organizer-submitted collegiate brackets awaiting sanction approval",
      count: pendingTournamentsCount,
      href: "/admin/tournaments",
      icon: <TrophyIcon className="w-5 h-5" />,
      urgency: pendingTournamentsCount > 0 ? "ACTION REQUIRED" : "NOMINAL",
      urgencyStyle:
        pendingTournamentsCount > 0
          ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30"
          : "bg-[#141414] text-neutral-400 border-[#222222]",
    },
    {
      title: "Campus Scrim Feed",
      description: "Live varsity challenges & matchmaking practice board",
      count: scrimsCount,
      href: "/admin/scrim-board",
      icon: <SwordsIcon className="w-5 h-5" />,
      urgency: "MONITORED",
      urgencyStyle: "bg-[#141414] text-neutral-400 border-[#222222]",
    },
    {
      title: "Match Disputes & Claims",
      description: "Score conflicts and screenshot verification disputes",
      count: flaggedMatches,
      href: "/admin/disputes",
      icon: <AlertTriangleIcon className="w-5 h-5" />,
      urgency: flaggedMatches > 0 ? "REVIEW FLAGGED" : "NOMINAL",
      urgencyStyle:
        flaggedMatches > 0
          ? "bg-rose-500/10 text-rose-300 border-rose-500/30"
          : "bg-[#141414] text-neutral-400 border-[#222222]",
    },
  ];

  const QUICK_ACTIONS = [
    {
      label: "Register New University",
      desc: "Provision accredited .edu.ph domain",
      href: "/admin/universities",
      icon: <ShieldIcon className="w-4 h-4 text-emerald-400" />,
    },
    {
      label: "Sanction Tournaments",
      desc: "Approve pending circuit submissions",
      href: "/admin/tournaments",
      icon: <TrophyIcon className="w-4 h-4 text-emerald-400" />,
    },
    {
      label: "Manage Athlete Rosters",
      desc: "Inspect role permissions & accounts",
      href: "/admin/users",
      icon: <UsersIcon className="w-4 h-4 text-emerald-400" />,
    },
    {
      label: "Newsfeed Moderation",
      desc: "Verify campus news and headlines",
      href: "/admin/newsfeed",
      icon: <FlameIcon className="w-4 h-4 text-emerald-400" />,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Telemetry Status Strip */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#0A0A0A] via-[#0D1410] to-[#0A0A0A] border border-[#1A1A1A] shadow-md flex items-center justify-between flex-wrap gap-4 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-emerald-400 to-teal-500" />
        
        <div className="flex items-center gap-3 pl-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-400 shadow-[0_0_10px_#34d399]" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display text-sm font-bold text-white uppercase tracking-wider">
                CORE DISPATCH ACTIVE
              </span>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 uppercase">
                NOMINAL
              </span>
            </div>
            <p className="font-mono text-xs text-neutral-400 mt-0.5">
              Live telemetry monitoring all varsity matches, tournament brackets, and registered roster records.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono text-neutral-400 shrink-0">
          <div className="px-3 py-1.5 rounded-xl bg-[#050505] border border-[#171717] flex items-center gap-2">
            <span className="text-neutral-500 uppercase text-[10px]">PING</span>
            <strong className="text-emerald-400 font-bold">12ms</strong>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-[#050505] border border-[#171717] flex items-center gap-2">
            <span className="text-neutral-500 uppercase text-[10px]">SYNC</span>
            <strong className="text-white font-bold">LIVE</strong>
          </div>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {STAT_CARDS.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="p-5 sm:p-6 bg-[#0A0A0A] border border-[#1A1A1A] hover:border-emerald-500/40 rounded-2xl transition-all duration-300 group shadow-sm hover:shadow-[0_0_20px_rgba(16,185,129,0.1)] relative overflow-hidden flex flex-col justify-between"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-all pointer-events-none" />

            <div>
              <div className="flex items-start justify-between gap-3">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-400">
                  {card.label}
                </span>
                <div className="w-9 h-9 rounded-xl bg-[#141414] border border-[#222222] text-emerald-400 flex items-center justify-center group-hover:scale-110 group-hover:border-emerald-500/40 transition-all shadow-inner">
                  {card.icon}
                </div>
              </div>

              <p className="font-display text-3xl sm:text-4xl font-extrabold text-white mt-4 tracking-tight">
                {card.value}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-[#171717] flex items-center justify-between">
              <span className="text-[11px] font-mono text-neutral-400 truncate">
                {card.sublabel}
              </span>
              <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border uppercase ${card.badgeStyle}`}>
                {card.badge}
              </span>
            </div>
          </Link>
        ))}
      </div>

      {/* Triage Queues */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-[#1A1A1A] pb-3">
          <div className="flex items-center gap-2">
            <h2 className="font-display text-base font-bold text-white uppercase tracking-wider">
              Moderation Queues
            </h2>
            <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30">
              TRIAGE DESK
            </span>
          </div>
          <span className="text-xs font-mono text-neutral-400">
            Real-Time Queue Dispatch
          </span>
        </div>

        <div className="rounded-2xl border border-[#1A1A1A] overflow-hidden bg-[#0A0A0A] divide-y divide-[#141414] shadow-sm">
          {TRIAGE_ROWS.map((row) => (
            <Link
              key={row.href}
              href={row.href}
              className="flex items-center justify-between gap-4 p-5 hover:bg-[#111A15]/40 transition-all group cursor-pointer"
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-[#141414] border border-[#222222] text-emerald-400 flex items-center justify-center shrink-0 group-hover:border-emerald-500/40 group-hover:scale-105 transition-all shadow-inner">
                  {row.icon}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="font-display text-base font-bold text-white group-hover:text-emerald-300 transition-colors truncate">
                      {row.title}
                    </span>
                    <span className={`text-[9px] font-mono font-bold px-2.5 py-0.5 rounded-full border uppercase ${row.urgencyStyle}`}>
                      {row.urgency}
                    </span>
                  </div>
                  <span className="text-xs font-mono text-neutral-400 mt-1 block truncate">
                    {row.description}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4 shrink-0">
                <span className="text-xs font-mono font-black text-white bg-[#141414] border border-[#222222] px-3.5 py-1.5 rounded-xl shadow-inner">
                  {row.count}
                </span>
                <span className="text-xs font-mono font-bold text-emerald-400 group-hover:text-emerald-300 group-hover:translate-x-1 transition-all flex items-center gap-1.5">
                  <span>Review</span>
                  <span>→</span>
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Quick Ops Hub */}
      <div className="space-y-4">
        <div className="border-b border-[#1A1A1A] pb-3">
          <h2 className="font-display text-base font-bold text-white uppercase tracking-wider">
            Quick Operations &amp; Tools
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {QUICK_ACTIONS.map((act) => (
            <Link
              key={act.label}
              href={act.href}
              className="p-4 rounded-2xl bg-[#0A0A0A] border border-[#1A1A1A] hover:border-emerald-500/40 hover:bg-[#111A15]/20 transition-all duration-200 group flex items-start gap-3 shadow-sm"
            >
              <div className="w-8 h-8 rounded-xl bg-[#141414] border border-[#222222] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                {act.icon}
              </div>
              <div className="min-w-0">
                <p className="font-display text-xs font-bold text-white group-hover:text-emerald-300 transition-colors truncate">
                  {act.label}
                </p>
                <p className="text-[11px] font-mono text-neutral-400 mt-0.5 truncate">
                  {act.desc}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
