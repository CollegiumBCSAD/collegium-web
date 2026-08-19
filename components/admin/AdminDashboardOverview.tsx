"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { adminService } from "@/services";
import {
  mockUniversityVerifications,
  mockScrimBoardPosts,
  mockPendingTournamentPosts,
  mockPendingTeamRegistrations,
  mockFlaggedMatches,
} from "@/lib/mock/admin";

const pendingUniversities = mockUniversityVerifications.filter((u) => u.status === "PENDING").length;
const pendingScrimPosts = mockScrimBoardPosts.length;
const pendingTournamentItems = mockPendingTournamentPosts.length + mockPendingTeamRegistrations.length;
const flaggedMatches = mockFlaggedMatches.length;

const TRIAGE_ROWS = [
  {
    label: `${pendingUniversities} universities awaiting domain verification`,
    href: "/admin/universities",
    dot: "bg-success",
  },
  {
    label: `${pendingScrimPosts} Scrim Board posts pending moderation`,
    href: "/admin/scrim-board",
    dot: "bg-secondary-brand",
  },
  {
    label: `${pendingTournamentItems} tournament / registration items pending approval`,
    href: "/admin/tournaments",
    dot: "bg-secondary-brand",
  },
  {
    label: `${flaggedMatches} match results flagged for dispute review`,
    href: "/admin/disputes",
    dot: "bg-error",
  },
];

export default function AdminDashboardOverview() {
  const [totalUsers, setTotalUsers] = useState<number | null>(null);

  useEffect(() => {
    adminService
      .getUsers()
      .then((users) => setTotalUsers(users.length))
      .catch(() => setTotalUsers(null));
  }, []);

  const statCards = [
    { icon: "📋", value: pendingUniversities, label: "Pending University Verifications" },
    { icon: "⏱️", value: pendingScrimPosts + pendingTournamentItems, label: "Pending Scrim / Tournament Posts" },
    { icon: "🚩", value: flaggedMatches, label: "Flagged Matches" },
    { icon: "👤", value: totalUsers ?? "—", label: "Total Registered Users" },
  ];

  return (
    <div>
      <div className="grid grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div key={card.label} className="rounded-[15px] border border-panel-border bg-card-bg p-5">
            <span className="text-xl">{card.icon}</span>
            <p className="mt-3 font-display text-3xl font-bold text-foreground">{card.value}</p>
            <p className="mt-1 text-xs font-sans text-secondary-text">{card.label}</p>
          </div>
        ))}
      </div>

      <h2 className="mt-10 font-display text-xl font-bold text-foreground mb-4">Triage Queue</h2>
      <div className="rounded-[10px] border border-panel-border overflow-hidden">
        {TRIAGE_ROWS.map((row, i) => (
          <Link
            key={row.href}
            href={row.href}
            className={`flex items-center justify-between gap-4 px-6 py-4 bg-card-bg hover:bg-raised-panel transition-colors ${
              i > 0 ? "border-t border-panel-border" : ""
            }`}
          >
            <div className="flex items-center gap-3">
              <span className={`w-2 h-2 rounded-full ${row.dot}`} />
              <span className="text-sm font-sans text-foreground">{row.label}</span>
            </div>
            <span className="text-xs font-sans font-bold uppercase text-primary-brand">Review →</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
