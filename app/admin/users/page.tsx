"use client";

import { useEffect, useState } from "react";
import { adminService } from "@/services";
import { AdminUser } from "@/types";
import UserManagementTable from "@/components/admin/UserManagementTable";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    adminService
      .getUsers()
      .then(setUsers)
      .catch(() => setUsers([]))
      .finally(() => setIsLoading(false));
  }, []);

  const handleUpdateStatus = (id: string, status: string) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, status } : u)));
    adminService.updateUserStatus(id, status).catch(() => {
      adminService.getUsers().then(setUsers).catch(() => {});
    });
  };

  return (
    <div className="px-12 py-10">
      <h1 className="font-display text-3xl font-bold text-foreground">User Management</h1>
      <p className="mt-2 text-base font-sans text-secondary-text">
        Search, edit, suspend, or reassign the role of any user on the platform.
      </p>

      <div className="mt-8">
        {isLoading ? (
          <p className="text-sm font-sans text-secondary-text">Loading users…</p>
        ) : (
          <UserManagementTable users={users} onUpdateStatus={handleUpdateStatus} />
        )}
      </div>
    </div>
  );
}
