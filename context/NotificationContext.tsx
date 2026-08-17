"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";

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
  syncScrimState: (
    scrims: Array<{
      id: string;
      status: string;
      hostTeamName: string;
      opponentTeamName?: string;
      gameTitle?: string;
      scheduledAt?: string;
    }>,
    myTeamNames: string[]
  ) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  dismissToast: (id: string) => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const NOTIFICATIONS_STORAGE_KEY = "collegium_scrim_notifications_v1";

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<ScrimNotification[]>([]);
  const scrimStateCache = useRef<Map<string, { status: string; opponentTeamName?: string; hostTeamName: string }>>(
    new Map()
  );

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

  const syncScrimState = useCallback(
    (
      scrims: Array<{
        id: string;
        status: string;
        hostTeamName: string;
        opponentTeamName?: string;
        gameTitle?: string;
        scheduledAt?: string;
      }>,
      myTeamNames: string[]
    ) => {
      const normalizedMyTeams = myTeamNames.map((t) => t.toLowerCase().trim());

      scrims.forEach((scrim) => {
        const prev = scrimStateCache.current.get(scrim.id);

        if (prev) {
          const isMyOpponent =
            scrim.opponentTeamName &&
            normalizedMyTeams.includes(scrim.opponentTeamName.toLowerCase().trim());
          const isMyHost =
            scrim.hostTeamName &&
            normalizedMyTeams.includes(scrim.hostTeamName.toLowerCase().trim());

          // 1. Challenger Notification: Host Accepted Scrim Request (PENDING -> CONFIRMED)
          if (prev.status === "PENDING" && scrim.status === "CONFIRMED" && isMyOpponent) {
            addNotification({
              type: "ACCEPTED",
              scrimId: scrim.id,
              title: "🎉 Scrim Match Request Accepted!",
              message: `${scrim.hostTeamName} accepted your practice match request!`,
              hostTeamName: scrim.hostTeamName,
              opponentTeamName: scrim.opponentTeamName,
              gameTitle: scrim.gameTitle,
              scheduledAt: scrim.scheduledAt,
            });
          }

          // 2. Challenger Notification: Host Declined Scrim Request (PENDING -> OPEN)
          if (prev.status === "PENDING" && scrim.status === "OPEN" && isMyOpponent) {
            addNotification({
              type: "DECLINED",
              scrimId: scrim.id,
              title: "✕ Scrim Request Declined",
              message: `${scrim.hostTeamName} declined your practice match request. The offer is re-opened on the board.`,
              hostTeamName: scrim.hostTeamName,
              opponentTeamName: scrim.opponentTeamName,
              gameTitle: scrim.gameTitle,
              scheduledAt: scrim.scheduledAt,
            });
          }

          // 3. Challenger Notification: Host Unbooked Match (CONFIRMED -> OPEN)
          if (prev.status === "CONFIRMED" && scrim.status === "OPEN" && isMyOpponent) {
            addNotification({
              type: "UNBOOKED",
              scrimId: scrim.id,
              title: "⚠️ Scrim Match Cancelled",
              message: `${scrim.hostTeamName} unbooked the scheduled practice match.`,
              hostTeamName: scrim.hostTeamName,
              opponentTeamName: scrim.opponentTeamName,
              gameTitle: scrim.gameTitle,
              scheduledAt: scrim.scheduledAt,
            });
          }

          // 4. Host Notification: Opponent Sent Request (OPEN -> PENDING)
          if (prev.status === "OPEN" && scrim.status === "PENDING" && isMyHost) {
            addNotification({
              type: "ACCEPTED",
              scrimId: scrim.id,
              title: "⏳ Incoming Scrim Request!",
              message: `${scrim.opponentTeamName || "An opponent squad"} requested to book your scrim offer!`,
              hostTeamName: scrim.hostTeamName,
              opponentTeamName: scrim.opponentTeamName,
              gameTitle: scrim.gameTitle,
              scheduledAt: scrim.scheduledAt,
            });
          }
        }

        // Cache current state
        scrimStateCache.current.set(scrim.id, {
          status: scrim.status,
          opponentTeamName: scrim.opponentTeamName,
          hostTeamName: scrim.hostTeamName,
        });
      });
    },
    [addNotification]
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
        syncScrimState,
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
