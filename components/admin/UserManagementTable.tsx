"use client";

import { useState } from "react";
import { AdminUser } from "@/types";

const ROLE_FILTERS = ["All Roles", "ATHLETE", "NON_ATHLETE", "ADMIN"] as const;

const STATUS_STYLES: Record<string, string> = {
  ACTIVE: "text-success",
  PENDING: "text-secondary-brand",
  SUSPENDED: "text-error",
  REJECTED: "text-error",
};

function nextAction(status: string): { label: string; nextStatus: string } | null {
  switch (status) {
    case "PENDING":
      return { label: "Approve", nextStatus: "ACTIVE" };
    case "ACTIVE":
      return { label: "Suspend", nextStatus: "SUSPENDED" };
    case "SUSPENDED":
    case "REJECTED":
      return { label: "Reactivate", nextStatus: "ACTIVE" };
    default:
      return null;
  }
}

interface UserManagementTableProps {
  users: AdminUser[];
  onUpdateStatus: (id: string, status: string) => void;
}

export default function UserManagementTable({ users, onUpdateStatus }: UserManagementTableProps) {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<(typeof ROLE_FILTERS)[number]>("All Roles");

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
    <div className="space-y-4">
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search by name, university, or email..."
        className="w-full h-14 px-4 rounded-[10px] bg-card-bg border border-panel-border text-foreground text-sm font-sans placeholder:text-secondary-text focus:outline-none"
      />

      <div className="flex items-center gap-3">
        {ROLE_FILTERS.map((role) => (
          <button
            key={role}
            onClick={() => setRoleFilter(role)}
            className={`h-[46px] px-5 rounded-[10px] text-xs font-sans font-bold uppercase tracking-wide border transition-colors cursor-pointer ${
              roleFilter === role
                ? "bg-primary-brand/20 border-primary-brand text-foreground"
                : "border-panel-border text-secondary-text hover:text-foreground"
            }`}
          >
            {role === "All Roles" ? "All Roles" : role.replace("_", "-")}
          </button>
        ))}
      </div>

      <div className="rounded-[10px] border border-panel-border overflow-hidden">
        <div className="grid grid-cols-[2fr_2fr_1fr_1fr_1fr] gap-4 px-6 py-4 bg-[#17191f] text-[13px] font-display font-semibold text-secondary-text uppercase">
          <span>Name</span>
          <span>University</span>
          <span>Role</span>
          <span>Status</span>
          <span className="text-right">Action</span>
        </div>

        {filtered.length === 0 ? (
          <div className="px-6 py-10 text-center text-sm font-sans text-secondary-text">
            No users match your filters.
          </div>
        ) : (
          filtered.map((user) => {
            const action = nextAction(user.status);
            return (
              <div
                key={user.id}
                className="grid grid-cols-[2fr_2fr_1fr_1fr_1fr] gap-4 px-6 py-4 items-center border-t border-panel-border bg-card-bg"
              >
                <span className="text-sm font-display font-medium text-foreground truncate">
                  {user.displayName}
                </span>
                <span className="text-sm font-display font-medium text-foreground/80 truncate">
                  {user.university?.name ?? "—"}
                </span>
                <span className="inline-flex items-center justify-center w-fit px-2.5 py-1 rounded-md border border-panel-border bg-raised-panel text-[11px] font-sans font-bold text-foreground">
                  {user.role.replace("_", "-")}
                </span>
                <span className={`text-xs font-sans font-semibold ${STATUS_STYLES[user.status] ?? "text-secondary-text"}`}>
                  {user.status}
                </span>
                <div className="flex justify-end">
                  {action && (
                    <button
                      onClick={() => onUpdateStatus(user.id, action.nextStatus)}
                      className="px-3 py-1.5 rounded-md border border-panel-border text-[11px] font-sans font-bold uppercase text-foreground hover:bg-white/5 transition-colors cursor-pointer"
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
  );
}
