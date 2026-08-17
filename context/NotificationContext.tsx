"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";

export interface ScrimNotification {
  id: string;
  type: "ACCEPTED" | "DECLINED" | "UNBOOKED";
  scrimId: string;
  title: string;
  message: string;
  hostTeamName: string;
  opponentTeamName?: string;
  gameTitle?: string;
  scheduledAt?: string;
  timestamp: string;
  read: boolean;
  dismissedFromToast?: boolean;
}

interface NotificationContextType {
  notifications: ScrimNotification[];
  unreadCount: number;
  toastNotifications: ScrimNotification[];
  addNotification: (notification: Omit<ScrimNotification, "id" | "timestamp" | "read">) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  dismissToast: (id: string) => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const NOTIFICATIONS_STORAGE_KEY = "collegium_scrim_notifications_v1";

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<ScrimNotification[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
        if (stored) {
          setNotifications(JSON.parse(stored));
        }
      } catch {}
    }
  }, []);

  // Save to localStorage when notifications change
  const saveNotifications = useCallback((items: ScrimNotification[]) => {
    setNotifications(items);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(items));
      } catch {}
    }
  }, []);

  const addNotification = useCallback(
    (item: Omit<ScrimNotification, "id" | "timestamp" | "read">) => {
      const newNotif: ScrimNotification = {
        ...item,
        id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        timestamp: new Date().toISOString(),
        read: false,
        dismissedFromToast: false,
      };

      setNotifications((prev) => {
        const duplicate = prev.find(
          (n) => n.scrimId === item.scrimId && n.type === item.type
        );
        if (duplicate) return prev;
        const updated = [newNotif, ...prev];
        if (typeof window !== "undefined") {
          try {
            localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(updated));
          } catch {}
        }
        return updated;
      });
    },
    []
  );

  const markAsRead = useCallback(
    (id: string) => {
      const updated = notifications.map((n) =>
        n.id === id ? { ...n, read: true, dismissedFromToast: true } : n
      );
      saveNotifications(updated);
    },
    [notifications, saveNotifications]
  );

  const markAllAsRead = useCallback(() => {
    const updated = notifications.map((n) => ({ ...n, read: true, dismissedFromToast: true }));
    saveNotifications(updated);
  }, [notifications, saveNotifications]);

  const dismissToast = useCallback(
    (id: string) => {
      const updated = notifications.map((n) =>
        n.id === id ? { ...n, dismissedFromToast: true } : n
      );
      saveNotifications(updated);
    },
    [notifications, saveNotifications]
  );

  const clearAll = useCallback(() => {
    saveNotifications([]);
  }, [saveNotifications]);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const toastNotifications = notifications.filter((n) => !n.dismissedFromToast);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        toastNotifications,
        addNotification,
        markAsRead,
        markAllAsRead,
        dismissToast,
        clearAll,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
}
