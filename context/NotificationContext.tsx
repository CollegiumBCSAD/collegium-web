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
  activeConfirmedModal: ScrimNotification | null;
  closeConfirmedModal: () => void;
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
    isUserHostFn: (scrim: any) => boolean,
    isUserOpponentFn: (scrim: any) => boolean,
    myTeamNames?: string[]
  ) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  dismissToast: (id: string) => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const NOTIFICATIONS_STORAGE_KEY = "collegium_scrim_notifications_v3";
const STATUS_MAP_STORAGE_KEY = "collegium_scrim_status_map_v3";

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<ScrimNotification[]>([]);
  const [activeConfirmedModal, setActiveConfirmedModal] = useState<ScrimNotification | null>(null);

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

      if (item.type === "ACCEPTED") {
        setActiveConfirmedModal(newNotif);
      }
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
      isUserHostFn: (scrim: any) => boolean,
      isUserOpponentFn: (scrim: any) => boolean,
      myTeamNames: string[] = []
    ) => {
      let statusMap: Record<string, string> = {};
      if (typeof window !== "undefined") {
        try {
          const storedMap = localStorage.getItem(STATUS_MAP_STORAGE_KEY);
          if (storedMap) statusMap = JSON.parse(storedMap);
        } catch {}
      }

      let mapChanged = false;

      scrims.forEach((scrim) => {
        const lastStatus = statusMap[scrim.id];
        const isHost = isUserHostFn(scrim);
        const isOpponent = isUserOpponentFn(scrim);

        // 1. Challenger Notification ONLY: Host Accepted Scrim Request (status is CONFIRMED & lastStatus was PENDING or not CONFIRMED)
        // MUST BE isOpponent === true AND isHost === false!
        if (scrim.status === "CONFIRMED" && isOpponent && !isHost && lastStatus !== "CONFIRMED") {
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
          statusMap[scrim.id] = "CONFIRMED";
          mapChanged = true;
        }

        // 2. Challenger Notification ONLY: Host Declined Scrim Request (status is OPEN & lastStatus was PENDING)
        if (scrim.status === "OPEN" && isOpponent && !isHost && lastStatus === "PENDING") {
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
          statusMap[scrim.id] = "OPEN";
          mapChanged = true;
        }

        // 3. Challenger Notification ONLY: Host Unbooked Match (status is OPEN & lastStatus was CONFIRMED)
        if (scrim.status === "OPEN" && isOpponent && !isHost && lastStatus === "CONFIRMED") {
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
          statusMap[scrim.id] = "OPEN";
          mapChanged = true;
        }

        // 4. Host Notification ONLY: Opponent Sent Request (status is PENDING & lastStatus !== PENDING)
        if (scrim.status === "PENDING" && isHost && lastStatus !== "PENDING") {
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
          statusMap[scrim.id] = "PENDING";
          mapChanged = true;
        }

        // Initialize status map for untracked scrims
        if (!statusMap[scrim.id]) {
          statusMap[scrim.id] = scrim.status;
          mapChanged = true;
        }
      });

      if (mapChanged && typeof window !== "undefined") {
        try {
          localStorage.setItem(STATUS_MAP_STORAGE_KEY, JSON.stringify(statusMap));
        } catch {}
      }
    },
    [addNotification]
  );

  const closeConfirmedModal = useCallback(() => {
    setActiveConfirmedModal(null);
  }, []);

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
        activeConfirmedModal,
        closeConfirmedModal,
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
