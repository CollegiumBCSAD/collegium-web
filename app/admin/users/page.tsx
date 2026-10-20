"use client";

import AdminPageHeader from "@/components/admin/AdminPageHeader";
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
    <div className="mx-auto w-full max-w-6xl space-y-8 px-5 py-8 sm:px-8 lg:px-10 lg:py-10">
      <AdminPageHeader
        eyebrow="Circuit"
        title="Users & rosters"
        description="Search, filter, manage permissions, suspend, or reactivate user accounts across all universities."
      />

      {loading ? (
        <div className="p-12 text-center text-xs font-mono text-neutral-400">Loading user registry...</div>
      ) : (
        <UserManagementTable users={users} onUpdateStatus={handleUpdateStatus} />
      )}
    </div>
  );
}
