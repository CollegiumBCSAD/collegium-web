"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { notificationsService, ServerNotification, NotificationCategory, NotificationType } from "@/services/notificationsService";
import { connectSocket, disconnectSocket } from "@/services/socket";

export interface AppNotification {
  id: string;
  category: NotificationCategory;
  type: NotificationType;
  title: string;
  message: string;
  link: string;
  timestamp: string;
  read: boolean;
}

function mapNotification(n: ServerNotification): AppNotification {
  return {
    id: n.id,
    category: n.category,
    type: n.type,
    title: n.title,
    message: n.message,
    link: n.link || "/dashboard",
    timestamp: n.createdAt,
    read: n.read,
  };
}

interface NotificationContextType {
  notifications: AppNotification[];
  unreadCount: number;
  toastNotifications: AppNotification[];
  activeConfirmedModal: AppNotification | null;
  closeConfirmedModal: () => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  dismissToast: (id: string) => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const TOAST_DISMISSED_STORAGE_PREFIX = "collegium_toast_dismissed_v1_";

function loadDismissedToastIds(userId: string | undefined): Set<string> {
  if (typeof window === "undefined" || !userId) return new Set();
  try {
    const stored = localStorage.getItem(TOAST_DISMISSED_STORAGE_PREFIX + userId);
    return stored ? new Set(JSON.parse(stored)) : new Set();
  } catch {
    return new Set();
  }
}

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoggedIn } = useAuth();
  const userId = user?.id;

  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [dismissedToastIds, setDismissedToastIds] = useState<Set<string>>(() => loadDismissedToastIds(userId));
  const [activeConfirmedModal, setActiveConfirmedModal] = useState<AppNotification | null>(null);
  const seenIdsRef = useRef<Set<string>>(new Set());
  const prevUserIdRef = useRef<string | undefined>(userId);

  if (prevUserIdRef.current !== userId) {
    prevUserIdRef.current = userId;
    setActiveConfirmedModal(null);
    setNotifications([]);
    setDismissedToastIds(loadDismissedToastIds(userId));
  }

  const persistDismissed = useCallback(
    (ids: Set<string>) => {
      if (typeof window !== "undefined" && userId) {
        try {
          localStorage.setItem(TOAST_DISMISSED_STORAGE_PREFIX + userId, JSON.stringify(Array.from(ids)));
        } catch {}
      }
    },
    [userId]
  );

  useEffect(() => {
    seenIdsRef.current = new Set();

    if (!isLoggedIn || !userId) {
      disconnectSocket();
      return;
    }

    const socket = connectSocket();

    const refetch = async () => {
      const raw = await notificationsService.getNotifications();
      const mapped = raw.map(mapNotification);
      mapped.forEach((n) => seenIdsRef.current.add(n.id));
      setNotifications(mapped);
    };

    const handleNew = (raw: ServerNotification) => {
      const mapped = mapNotification(raw);
      if (seenIdsRef.current.has(mapped.id)) return;
      seenIdsRef.current.add(mapped.id);

      setNotifications((prev) => [mapped, ...prev]);

      if (mapped.type === "SCRIM_REQUEST_ACCEPTED" && !mapped.read) {
        setActiveConfirmedModal(mapped);
      }
    };

    const handleUpdated = (raw: ServerNotification) => {
      const mapped = mapNotification(raw);
      setNotifications((prev) => prev.map((n) => (n.id === mapped.id ? mapped : n)));
    };

    const handleAllRead = () => {
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    };

    const handleCleared = () => {
      seenIdsRef.current = new Set();
      setNotifications([]);
    };

    socket.on("connect", refetch);
    socket.on("notification:new", handleNew);
    socket.on("notification:updated", handleUpdated);
    socket.on("notification:all-read", handleAllRead);
    socket.on("notification:cleared", handleCleared);

    if (socket.connected) {
      refetch();
    }

    return () => {
      socket.off("connect", refetch);
      socket.off("notification:new", handleNew);
      socket.off("notification:updated", handleUpdated);
      socket.off("notification:all-read", handleAllRead);
      socket.off("notification:cleared", handleCleared);
    };
  }, [isLoggedIn, userId]);

  const markAsRead = useCallback(
    (id: string) => {
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
      setDismissedToastIds((prev) => {
        const updated = new Set(prev);
        updated.add(id);
        persistDismissed(updated);
        return updated;
      });
      notificationsService.markAsRead(id).catch(() => {});
    },
    [persistDismissed]
  );

  const closeConfirmedModal = useCallback(() => {
    if (activeConfirmedModal) {
      markAsRead(activeConfirmedModal.id);
    }
    setActiveConfirmedModal(null);
  }, [activeConfirmedModal, markAsRead]);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setDismissedToastIds((prev) => {
      const updated = new Set(prev);
      notifications.forEach((n) => updated.add(n.id));
      persistDismissed(updated);
      return updated;
    });
    notificationsService.markAllAsRead().catch(() => {});
  }, [notifications, persistDismissed]);

  const dismissToast = useCallback(
    (id: string) => {
      setDismissedToastIds((prev) => {
        const updated = new Set(prev);
        updated.add(id);
        persistDismissed(updated);
        return updated;
      });
    },
    [persistDismissed]
  );

  const clearAll = useCallback(() => {
    setNotifications([]);
    notificationsService.clearAll().catch(() => {});
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const toastNotifications = notifications.filter((n) => !n.read && !dismissedToastIds.has(n.id));

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        toastNotifications,
        activeConfirmedModal,
        closeConfirmedModal,
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
