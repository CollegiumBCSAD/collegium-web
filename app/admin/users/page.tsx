"use client";

import { useEffect, useState } from "react";
import { AdminUser } from "@/types";
import { adminService } from "@/services";
import UserManagementTable from "@/components/admin/UserManagementTable";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService
      .getUsers()
      .then((data) => setUsers(data))
      .catch((err) => console.error("Failed to load users:", err))
      .finally(() => setLoading(false));
  }, []);

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const updated = await adminService.updateUserStatus(id, status);
      setUsers((prev) => prev.map((u) => (u.id === id ? updated : u)));
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  return (
    <div className="p-6 sm:p-8 lg:p-10 space-y-6 max-w-7xl">
      <div className="border-b border-[#1A1A1A] pb-5">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-[10px] font-mono font-bold tracking-widest text-emerald-400 uppercase px-3 py-0.5 bg-emerald-500/10 border border-emerald-500/30 rounded-full">
            USER DIRECTORY &amp; RBAC
          </span>
        </div>
        <h1 className="font-display text-2xl sm:text-3xl font-black tracking-tight text-white uppercase">
          User &amp; Roster Management
        </h1>
        <p className="font-sans text-xs sm:text-sm text-neutral-400 mt-1 max-w-2xl leading-relaxed">
          Search, filter, manage permissions, suspend, or reactivate user accounts across all universities.
        </p>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs font-mono text-neutral-400">Loading user registry...</div>
      ) : (
        <UserManagementTable users={users} onUpdateStatus={handleUpdateStatus} />
      )}
    </div>
  );
}
