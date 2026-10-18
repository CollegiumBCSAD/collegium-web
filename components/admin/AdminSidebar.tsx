"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { CSSProperties } from "react";
import { useAuth } from "@/context/AuthContext";
import { useAdminQueueCounts } from "@/lib/useAdminQueueCounts";
import { AdminNavGroup, AdminNavItem, AdminSidebarProps } from "@/types";
import BrandEmblem from "@/components/ui/BrandEmblem";
import {
  AlertTriangleIcon,
  FlameIcon,
  LayoutGridIcon,
  ShieldIcon,
  SwordsIcon,
  TrophyIcon,
  UsersIcon,
} from "@/components/ui/Icons";

// Tints the shared Collegium mark emerald for the admin console.
const ADMIN_BRAND = { "--primary-brand": "#34D399", "--game-glow-rgb": "52, 211, 153" } as CSSProperties;

const BADGE: Record<NonNullable<AdminNavItem["badgeType"]>, string> = {
  alert: "bg-rose-500/15 text-rose-300 ring-rose-500/30",
  warning: "bg-amber-400/15 text-amber-300 ring-amber-400/30",
  neutral: "bg-white/[0.06] text-neutral-400 ring-white/10",
};

export default function AdminSidebar({ open = false, onClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const { user, logoutUser } = useAuth();
  const { counts, pendingTotal } = useAdminQueueCounts(pathname);

  const GROUPS: AdminNavGroup[] = [
    {
      label: "Overview",
      items: [{ label: "Command Hub", href: "/admin", icon: <LayoutGridIcon className="w-4 h-4" /> }],
    },
    {
      label: "Review queues",
      items: [
        {
          label: "Tournaments",
          href: "/admin/tournaments",
          icon: <TrophyIcon className="w-4 h-4" />,
          // Tournaments and invite-only events share one review page.
          badge: counts.tournaments + counts.events,
          badgeType: "warning",
        },
        {
          label: "Coach Approvals",
          href: "/admin/coaches",
          icon: <ShieldIcon className="w-4 h-4" />,
          badge: counts.coaches,
          badgeType: "warning",
        },
        {
          label: "Match Disputes",
          href: "/admin/disputes",
          icon: <AlertTriangleIcon className="w-4 h-4" />,
          badge: counts.disputes,
          badgeType: "alert",
        },
      ],
    },
    {
      label: "Circuit",
      items: [
        { label: "Universities", href: "/admin/universities", icon: <ShieldIcon className="w-4 h-4" /> },
        { label: "Rosters & Users", href: "/admin/users", icon: <UsersIcon className="w-4 h-4" /> },
        {
          label: "Scrim Board",
          href: "/admin/scrim-board",
          icon: <SwordsIcon className="w-4 h-4" />,
          badge: counts.scrims,
          badgeType: "neutral",
        },
      ],
    },
    {
      label: "Content",
      items: [{ label: "Campus Newsfeed", href: "/admin/newsfeed", icon: <FlameIcon className="w-4 h-4" /> }],
    },
  ];

  const isActive = (href: string) => pathname === href || (href !== "/admin" && pathname.startsWith(href));

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 flex h-full w-64 shrink-0 flex-col border-r border-white/[0.06] bg-[#060807]/95 backdrop-blur-xl transition-transform duration-200 ease-out lg:relative lg:translate-x-0 ${
        open ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      {/* Brand */}
      <div className="flex items-center justify-between gap-2 px-4 py-4">
        <Link href="/admin" onClick={onClose} className="group flex min-w-0 items-center gap-2.5" style={ADMIN_BRAND}>
          <BrandEmblem size={30} className="shrink-0 transition-transform group-hover:scale-105" />
          <span className="min-w-0">
            <span className="block font-display text-sm font-black uppercase tracking-wider text-white">Collegium</span>
            <span className="block font-mono text-[9px] font-bold uppercase tracking-[0.25em] text-emerald-400">Admin console</span>
          </span>
        </Link>
        <button
          type="button"
          onClick={onClose}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-neutral-400 hover:text-white lg:hidden"
          aria-label="Close admin navigation"
        >
          ✕
        </button>
      </div>

      {/* What's waiting */}
      <div className="px-3">
        <Link
          href="/admin"
          onClick={onClose}
          className={`flex items-center gap-3 rounded-xl border px-3.5 py-3 transition-colors ${
            pendingTotal > 0
              ? "border-amber-400/25 bg-amber-400/[0.06] hover:border-amber-400/45"
              : "border-emerald-500/20 bg-emerald-500/[0.05] hover:border-emerald-500/40"
          }`}
        >
          <span className={`font-display text-2xl font-black tabular-nums leading-none ${pendingTotal > 0 ? "text-amber-300" : "text-emerald-300"}`}>
            {pendingTotal}
          </span>
          <span className="min-w-0 text-[11px] leading-tight text-neutral-400">
            {pendingTotal > 0 ? (
              <>
                <span className="block font-semibold text-neutral-200">Waiting for review</span>
                across all queues
              </>
            ) : (
              <>
                <span className="block font-semibold text-neutral-200">All caught up</span>
                no pending reviews
              </>
            )}
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="mt-4 flex-1 space-y-5 overflow-y-auto px-3 pb-4">
        {GROUPS.map((group) => (
          <div key={group.label}>
            <p className="px-3 pb-1.5 font-mono text-[9px] font-bold uppercase tracking-[0.25em] text-neutral-600">{group.label}</p>
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const active = isActive(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onClose}
                      className={`group relative flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] transition-colors ${
                        active ? "bg-emerald-500/10 font-semibold text-white" : "text-neutral-400 hover:bg-white/[0.04] hover:text-white"
                      }`}
                    >
                      {active && <span aria-hidden className="absolute inset-y-1.5 left-0 w-[3px] rounded-r bg-emerald-400" />}
                      <span className={active ? "text-emerald-400" : "text-neutral-500 group-hover:text-neutral-300"}>{item.icon}</span>
                      <span className="flex-1 truncate">{item.label}</span>
                      {typeof item.badge === "number" && item.badge > 0 && (
                        <span
                          className={`min-w-5 rounded-md px-1.5 py-0.5 text-center font-mono text-[10px] font-bold ring-1 ${BADGE[item.badgeType ?? "neutral"]}`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="space-y-2 border-t border-white/[0.06] p-3">
        <Link
          href="/dashboard"
          onClick={onClose}
          className="group flex items-center justify-between rounded-lg px-3 py-2 text-xs text-neutral-400 transition-colors hover:bg-white/[0.04] hover:text-white"
        >
          Back to main app
          <span className="text-emerald-400 transition-transform group-hover:translate-x-0.5">→</span>
        </Link>
        {user && (
          <div className="flex items-center gap-2.5 rounded-xl border border-white/[0.06] bg-white/[0.02] p-2.5">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-emerald-400 font-display text-xs font-black text-black">
              {user.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.avatar} alt="" className="h-full w-full object-cover" />
              ) : (
                user.displayName.charAt(0).toUpperCase()
              )}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-xs font-semibold text-white">{user.displayName}</span>
              <span className="block font-mono text-[9px] font-bold uppercase tracking-widest text-emerald-400">Administrator</span>
            </span>
            <button
              type="button"
              onClick={() => logoutUser()}
              title="Sign out"
              aria-label="Sign out"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-500 transition-colors hover:bg-rose-500/10 hover:text-rose-300"
            >
              ⏻
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
