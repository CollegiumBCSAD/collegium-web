"use client";

import { ReactNode, useEffect, useState } from "react";
import Link from "next/link";
import { adminService } from "@/services";
import { useAdminQueueCounts } from "@/lib/useAdminQueueCounts";
import AdminPageHeader from "./AdminPageHeader";
import {
  AlertTriangleIcon,
  CheckCircleIcon,
  FlameIcon,
  LockIcon,
  ShieldIcon,
  SwordsIcon,
  TrophyIcon,
  UsersIcon,
} from "@/components/ui/Icons";

type QueueRow = { title: string; detail: string; count: number; href: string; icon: ReactNode; alert?: boolean };

const QUICK_ACTIONS = [
  { label: "Register a university", desc: "Add an accredited .edu.ph domain", href: "/admin/universities", icon: <ShieldIcon className="h-4 w-4" /> },
  { label: "Manage users", desc: "Roles, rosters and accounts", href: "/admin/users", icon: <UsersIcon className="h-4 w-4" /> },
  { label: "Moderate scrims", desc: "Cancel or remove board posts", href: "/admin/scrim-board", icon: <SwordsIcon className="h-4 w-4" /> },
  { label: "Write news", desc: "Publish campus headlines", href: "/admin/newsfeed", icon: <FlameIcon className="h-4 w-4" /> },
];

export default function AdminDashboardOverview() {
  const { counts, pendingTotal, loaded } = useAdminQueueCounts();
  const [totalUsers, setTotalUsers] = useState<number | null>(null);

  useEffect(() => {
    adminService
      .getUsers()
      .then((users) => setTotalUsers(users.length))
      .catch(() => setTotalUsers(null));
  }, []);

  const queues: QueueRow[] = [
    { title: "Public tournaments", detail: "Waiting for sanction", count: counts.tournaments, href: "/admin/tournaments", icon: <TrophyIcon className="h-5 w-5" /> },
    { title: "Invite-only events", detail: "Need approval before sign-ups open", count: counts.events, href: "/admin/tournaments", icon: <LockIcon className="h-5 w-5" /> },
    { title: "Coach accounts", detail: "Coach / manager sign-ups", count: counts.coaches, href: "/admin/coaches", icon: <ShieldIcon className="h-5 w-5" /> },
    { title: "Match disputes", detail: "Score conflicts to resolve", count: counts.disputes, href: "/admin/disputes", icon: <AlertTriangleIcon className="h-5 w-5" />, alert: true },
  ].sort((a, b) => Number(b.count > 0) - Number(a.count > 0));

  return (
    <div className="space-y-10">
      <AdminPageHeader
        eyebrow="Overview"
        title="Command hub"
        description="What needs your attention across the circuit, and shortcuts to everything else."
        stats={[
          { label: "Waiting for review", value: loaded ? pendingTotal : "—", tone: pendingTotal > 0 ? "warn" : "good" },
          { label: "Registered users", value: totalUsers ?? "—" },
          { label: "Scrim posts", value: loaded ? counts.scrims : "—" },
          { label: "Open disputes", value: loaded ? counts.disputes : "—", tone: counts.disputes > 0 ? "alert" : "default" },
        ]}
      />

      {/* Review queues */}
      <section className="space-y-3">
        <div className="flex items-baseline justify-between">
          <h2 className="font-display text-lg font-black uppercase tracking-wide text-white">Needs your attention</h2>
          {loaded && pendingTotal === 0 && (
            <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-300">
              <CheckCircleIcon className="h-4 w-4" /> Everything reviewed
            </span>
          )}
        </div>

        <ul className="overflow-hidden rounded-xl border border-white/[0.07] bg-[#0A0C0B] divide-y divide-white/[0.05]">
          {queues.map((q) => {
            const waiting = q.count > 0;
            const tone = !waiting ? "text-neutral-500" : q.alert ? "text-rose-300" : "text-amber-300";
            return (
              <li key={q.title}>
                <Link href={q.href} className="group flex items-center gap-4 px-5 py-4 transition-colors hover:bg-white/[0.025]">
                  <span
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ring-1 ${
                      !waiting
                        ? "bg-white/[0.03] text-neutral-500 ring-white/[0.06]"
                        : q.alert
                          ? "bg-rose-500/10 text-rose-300 ring-rose-500/25"
                          : "bg-amber-400/10 text-amber-300 ring-amber-400/25"
                    }`}
                  >
                    {q.icon}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold text-white">{q.title}</span>
                    <span className="block truncate text-xs text-neutral-500">{q.detail}</span>
                  </span>
                  <span className={`font-display text-2xl font-black tabular-nums ${tone}`}>{loaded ? q.count : "—"}</span>
                  <span
                    className={`hidden w-20 text-right text-xs font-bold uppercase tracking-wider sm:block ${
                      waiting ? "text-emerald-400 group-hover:text-emerald-300" : "text-neutral-600"
                    }`}
                  >
                    {waiting ? "Review →" : "Clear"}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      {/* Shortcuts */}
      <section className="space-y-3">
        <h2 className="font-display text-lg font-black uppercase tracking-wide text-white">Shortcuts</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {QUICK_ACTIONS.map((a) => (
            <Link
              key={a.label}
              href={a.href}
              className="group flex items-start gap-3 rounded-xl border border-white/[0.07] bg-[#0A0C0B] p-4 transition-colors hover:border-emerald-500/35"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20">
                {a.icon}
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-white group-hover:text-emerald-300">{a.label}</span>
                <span className="block truncate text-xs text-neutral-500">{a.desc}</span>
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
