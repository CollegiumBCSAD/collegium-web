import { apiClient } from "./apiClient";

export type NotificationCategory = "SCRIM" | "TEAM";

export type NotificationType =
  | "SCRIM_REQUEST_RECEIVED"
  | "SCRIM_REQUEST_ACCEPTED"
  | "SCRIM_REQUEST_DECLINED"
  | "SCRIM_UNBOOKED"
  | "TEAM_JOIN_REQUEST"
  | "TEAM_REQUEST_ACCEPTED"
  | "TEAM_REQUEST_DECLINED";

export interface ServerNotification {
  id: string;
  userId: string;
  category: NotificationCategory;
  type: NotificationType;
  title: string;
  message: string;
  link: string | null;
  refId: string | null;
  read: boolean;
  createdAt: string;
}

export const notificationsService = {
  getNotifications: async (): Promise<ServerNotification[]> => {
    try {
      const data = await apiClient.get<unknown>("/notifications");
      return Array.isArray(data) ? (data as ServerNotification[]) : [];
    } catch {
      return [];
    }
  },

  markAsRead: (id: string): Promise<ServerNotification> => {
    return apiClient.patch<ServerNotification>(`/notifications/${id}/read`);
  },

  markAllAsRead: (): Promise<{ success: boolean }> => {
    return apiClient.patch<{ success: boolean }>("/notifications/read-all");
  },

  clearAll: (): Promise<{ success: boolean }> => {
    return apiClient.delete<{ success: boolean }>("/notifications");
  },
};
