"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { tournamentsService, scrimsService } from "@/services";
import {
  mockFlaggedMatches,
} from "@/lib/mock/admin";
import {
  TrophyIcon,
  SwordsIcon,
  UsersIcon,
  ShieldIcon,
  FlameIcon,
  AlertTriangleIcon,
} from "@/components/ui/Icons";

interface AdminNavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: number;
  badgeType?: "warning" | "alert" | "neutral";
}

export default function AdminSidebar() {
  const pathname = usePathname();
  const { user, logoutUser } = useAuth();
  const [pendingTournamentsCount, setPendingTournamentsCount] = useState<number>(0);
  const [scrimsCount, setScrimsCount] = useState<number>(0);

  useEffect(() => {
    tournamentsService
      .getPendingTournaments()
      .then((tourneys) => setPendingTournamentsCount(tourneys.length))
      .catch(() => setPendingTournamentsCount(0));

    scrimsService
      .getScrims()
      .then((scrims) => setScrimsCount(scrims.length))
      .catch(() => setScrimsCount(0));
  }, [pathname]);

  const NAV_ITEMS: AdminNavItem[] = [
    {
      label: "Command Hub",
      href: "/admin",
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      ),
    },
    {
      label: "Tournaments",
      href: "/admin/tournaments",
      icon: <TrophyIcon className="w-4 h-4" />,
      badge: pendingTournamentsCount,
      badgeType: "warning",
    },
    {
      label: "Universities",
      href: "/admin/universities",
      icon: <ShieldIcon className="w-4 h-4" />,
    },
    {
      label: "Scrim Board",
      href: "/admin/scrim-board",
      icon: <SwordsIcon className="w-4 h-4" />,
      badge: scrimsCount,
      badgeType: "neutral",
    },
    {
      label: "Rosters & Users",
      href: "/admin/users",
      icon: <UsersIcon className="w-4 h-4" />,
    },
    {
      label: "Campus Newsfeed",
      href: "/admin/newsfeed",
      icon: <FlameIcon className="w-4 h-4" />,
    },
    {
      label: "Match Disputes",
      href: "/admin/disputes",
      icon: <AlertTriangleIcon className="w-4 h-4" />,
      badge: mockFlaggedMatches.length,
      badgeType: "alert",
    },
  ];

  return (
    <aside className="w-64 shrink-0 bg-[#050505]/95 backdrop-blur-xl border-r border-[#171717] flex flex-col h-full relative z-20 shadow-2xl">
      {/* Brand Header */}
      <div className="p-4 border-b border-[#171717] bg-[#070707]/90">
        <div className="flex items-center justify-between">
          <Link href="/admin" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center font-display font-black text-black text-sm shadow-[0_0_15px_rgba(52,211,153,0.35)] group-hover:scale-105 transition-transform">
              C
            </div>
            <div>
              <span className="font-display text-xs font-bold tracking-wider text-white block uppercase">
                COLLEGIUM
              </span>
              <span className="text-[9px] font-mono font-medium tracking-widest text-emerald-400 block uppercase">
                ADMIN CONSOLE
              </span>
            </div>
          </Link>
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
            <span className="text-[9px] font-mono text-emerald-400 font-bold">ONLINE</span>
          </div>
        </div>
      </div>

      {/* Moderation Desk Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-4 overflow-y-auto">
        <div className="space-y-1">
          <div className="px-3 pb-2 flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-neutral-500">
              MODERATION DESK
            </span>
          </div>

          <div className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/admin" && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-sans font-medium transition-all group ${
                    isActive
                      ? "bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/25 shadow-sm"
                      : "text-neutral-400 hover:text-white hover:bg-white/[0.04] border border-transparent"
                  }`}
                >
                  <span
                    className={`transition-colors shrink-0 ${
                      isActive
                        ? "text-emerald-400"
                        : "text-neutral-500 group-hover:text-neutral-300"
                    }`}
                  >
                    {item.icon}
                  </span>

                  <span className="flex-1 truncate">{item.label}</span>

                  {typeof item.badge === "number" && item.badge > 0 && (
                    <span
                      className={`min-w-5 h-5 px-1.5 rounded-md text-[10px] font-mono font-bold flex items-center justify-center border shrink-0 ${
                        item.badgeType === "alert"
                          ? "bg-rose-500/15 border-rose-500/30 text-rose-300"
                          : item.badgeType === "warning"
                          ? "bg-amber-500/15 border-amber-500/30 text-amber-300"
                          : "bg-[#171717] border-[#262626] text-neutral-400"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Quick App Link */}
        <div className="pt-3 border-t border-[#171717]">
          <Link
            href="/dashboard"
            className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-[#0A0A0A] hover:bg-[#141414] text-neutral-400 hover:text-white border border-[#1A1A1A] hover:border-[#2A2A2A] text-xs font-sans transition-all group"
          >
            <span>Exit to Main App</span>
            <span className="text-emerald-400 group-hover:translate-x-1 transition-transform">→</span>
          </Link>
        </div>
      </nav>

      {/* Admin Profile Footer */}
      {user && (
        <div className="p-3 border-t border-[#171717] bg-[#050505]/95">
          <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[#0A0A0A] border border-[#1A1A1A]">
            <div className="w-7 h-7 rounded-lg bg-emerald-400 text-black flex items-center justify-center font-display font-black text-xs shrink-0 shadow-sm">
              {user.displayName.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-display font-bold text-white truncate">
                {user.displayName}
              </p>
              <span className="text-[9px] font-mono text-emerald-400 block uppercase font-bold">
                ROOT CLEARANCE
              </span>
            </div>
          </div>
          <button
            onClick={() => logoutUser()}
            className="w-full mt-2 px-3 py-1.5 rounded-lg text-left text-[10px] font-mono font-medium uppercase text-neutral-400 hover:text-rose-400 hover:bg-[#190D10] transition-colors cursor-pointer flex items-center justify-between"
          >
            <span>Terminate Session</span>
            <span>⏻</span>
          </button>
        </div>
      )}
    </aside>
  );
}
