"use client";

import { useState } from "react";
import { AdminUser } from "@/types";

const ROLE_FILTERS = ["All Roles", "ATHLETE", "NON_ATHLETE", "ADMIN"] as const;

function nextAction(status: string): { label: string; nextStatus: string; isDanger?: boolean } | null {
  switch (status) {
    case "PENDING":
      return { label: "Approve", nextStatus: "ACTIVE" };
    case "ACTIVE":
      return { label: "Suspend", nextStatus: "SUSPENDED", isDanger: true };
    case "SUSPENDED":
    case "REJECTED":
      return { label: "Reactivate", nextStatus: "ACTIVE" };
    default:
      return null;
  }
}

function getRoleBadgeStyle(role: string): string {
  switch (role) {
    case "ADMIN":
      return "bg-emerald-500/15 text-emerald-300 border-emerald-500/40";
    case "NON_ATHLETE":
    case "ORGANIZER":
      return "bg-amber-500/15 text-amber-300 border-amber-500/40";
    default:
      return "bg-teal-500/10 text-teal-300 border-teal-500/30";
  }
}

interface UserManagementTableProps {
  users: AdminUser[];
  onUpdateStatus: (id: string, status: string) => void;
}

export default function UserManagementTable({ users, onUpdateStatus }: UserManagementTableProps) {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<(typeof ROLE_FILTERS)[number]>("All Roles");

  const counts = {
    "All Roles": users.length,
    ATHLETE: users.filter((u) => u.role === "ATHLETE").length,
    NON_ATHLETE: users.filter((u) => u.role === "NON_ATHLETE").length,
    ADMIN: users.filter((u) => u.role === "ADMIN").length,
  };

  const filtered = users.filter((u) => {
    const matchesRole = roleFilter === "All Roles" || u.role === roleFilter;
    const q = search.trim().toLowerCase();
    const matchesSearch =
      !q ||
      u.displayName.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.university?.name.toLowerCase().includes(q) ?? false);
    return matchesRole && matchesSearch;
  });

  return (
    <div className="space-y-5">
      {/* Search Input Bar */}
      <div className="relative">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by student name, university name, or email..."
          className="w-full h-12 pl-11 pr-4 rounded-2xl bg-[#0A0A0A] border border-[#1A1A1A] text-white text-xs font-mono placeholder:text-neutral-500 focus:border-emerald-500/60 focus:outline-none transition-all shadow-sm"
        />
        <svg
          className="w-4 h-4 text-neutral-500 absolute left-4 top-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-4 top-3.5 text-neutral-500 hover:text-white text-xs font-mono"
          >
            Clear
          </button>
        )}
      </div>

      {/* Role Filter Tabs & Count */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          {ROLE_FILTERS.map((role) => (
            <button
              key={role}
              onClick={() => setRoleFilter(role)}
              className={`h-9 px-4 rounded-xl text-xs font-mono font-bold uppercase tracking-wide border transition-all cursor-pointer flex items-center gap-2 ${
                roleFilter === role
                  ? "bg-[#111A15] border-emerald-500/50 text-white shadow-[0_0_10px_rgba(16,185,129,0.15)]"
                  : "border-[#1A1A1A] bg-[#0A0A0A] text-neutral-400 hover:text-white hover:bg-[#141414]"
              }`}
            >
              <span>{role === "All Roles" ? "All Roles" : role.replace("_", "-")}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                roleFilter === role ? "bg-emerald-500/20 text-emerald-300" : "bg-[#171717] text-neutral-500"
              }`}>
                {counts[role] ?? 0}
              </span>
            </button>
          ))}
        </div>

        <span className="text-[11px] font-mono text-neutral-400">
          Showing <strong className="text-white">{filtered.length}</strong> of {users.length} accounts
        </span>
      </div>

      {/* Roster Table Card */}
      <div className="rounded-2xl border border-[#1A1A1A] overflow-hidden bg-[#0A0A0A] shadow-md flex flex-col">
        {/* Table Header */}
        <div className="grid grid-cols-[2.5fr_2fr_1.2fr_1fr_1fr] gap-4 px-6 py-4 bg-[#050505] text-[11px] font-mono font-bold text-neutral-400 uppercase tracking-wider border-b border-[#171717]">
          <span>Athlete / Account</span>
          <span>University</span>
          <span>Role</span>
          <span>Status</span>
          <span className="text-right">Action</span>
        </div>

        {/* Rows Container */}
        <div className="divide-y divide-[#141414]">
          {filtered.length === 0 ? (
            <div className="px-6 py-16 text-center text-xs font-mono text-neutral-400 space-y-2">
              <p className="text-white font-display text-sm font-bold uppercase">No records found</p>
              <p>No athlete or organizer accounts match &ldquo;{search}&rdquo;</p>
            </div>
          ) : (
            filtered.map((user) => {
              const action = nextAction(user.status);
              const roleBadge = getRoleBadgeStyle(user.role);

              return (
                <div
                  key={user.id}
                  className="grid grid-cols-[2.5fr_2fr_1.2fr_1fr_1fr] gap-4 px-6 py-4 items-center hover:bg-[#111A15]/20 transition-colors group"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-[#141414] border border-[#222222] text-white flex items-center justify-center font-display font-black text-xs shrink-0 group-hover:border-emerald-500/40 transition-colors shadow-inner">
                      {user.displayName.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs sm:text-sm font-display font-bold text-white group-hover:text-emerald-300 transition-colors truncate block">
                        {user.displayName}
                      </span>
                      <span className="text-[10px] font-mono text-neutral-400 truncate block mt-0.5">
                        {user.email}
                      </span>
                    </div>
                  </div>

                  <span className="text-xs font-sans text-neutral-300 truncate">
                    {user.university?.name ?? <span className="text-neutral-600 font-mono">—</span>}
                  </span>

                  <div>
                    <span className={`inline-flex items-center justify-center px-2.5 py-0.5 rounded-lg border text-[10px] font-mono font-bold uppercase ${roleBadge}`}>
                      {user.role.replace("_", "-")}
                    </span>
                  </div>

                  <div>
                    <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border uppercase ${
                      user.status === "ACTIVE"
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                        : user.status === "PENDING"
                        ? "bg-amber-500/10 text-amber-300 border-amber-500/30"
                        : "bg-rose-500/10 text-rose-300 border-rose-500/30"
                    }`}>
                      {user.status}
                    </span>
                  </div>

                  <div className="flex justify-end">
                    {action && (
                      <button
                        onClick={() => onUpdateStatus(user.id, action.nextStatus)}
                        className={`px-3.5 py-1.5 rounded-xl border text-xs font-mono font-semibold transition-all cursor-pointer active:scale-95 ${
                          action.isDanger
                            ? "bg-[#190D10] border-rose-900/40 text-rose-300 hover:text-white hover:bg-rose-950/60"
                            : "bg-[#141414] border-[#222222] text-neutral-300 hover:text-white hover:bg-[#1C1C1C]"
                        }`}
                      >
                        {action.label}
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
