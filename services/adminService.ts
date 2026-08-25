import { apiClient } from "./apiClient";
import { AdminUser } from "@/types";

export const adminService = {
  getUsers: (): Promise<AdminUser[]> => {
    return apiClient.get<AdminUser[]>("/auth/users");
  },

  updateUserStatus: (id: string, status: string): Promise<AdminUser> => {
    return apiClient.patch<AdminUser>(`/auth/users/${id}/status`, { status });
  },

  approveTournament: (id: string): Promise<unknown> => {
    return apiClient.patch(`/tournaments/${id}/status`, { status: "UPCOMING" });
  },

  rejectTournament: (id: string, reason?: string): Promise<unknown> => {
    return apiClient.patch(`/tournaments/${id}/status`, { status: "REJECTED", reason });
  },
};
