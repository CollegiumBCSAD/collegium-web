"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { notificationsService, ServerNotification, NotificationCategory, NotificationType } from "@/services/notificationsService";

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
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    seenIdsRef.current = new Set();
    setActiveConfirmedModal(null);
    setNotifications([]);
    setDismissedToastIds(loadDismissedToastIds(userId));
  }, [userId]);

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
    if (!isLoggedIn || !userId) {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
      return;
    }

    const poll = async () => {
      const raw = await notificationsService.getNotifications();
      const mapped = raw.map(mapNotification);

      const freshlySeen = mapped.filter((n) => !seenIdsRef.current.has(n.id));
      mapped.forEach((n) => seenIdsRef.current.add(n.id));

      const newAccepted = freshlySeen.find(
        (n) => n.type === "SCRIM_REQUEST_ACCEPTED" && !n.read
      );
      if (newAccepted) {
        setActiveConfirmedModal(newAccepted);
      }

      setNotifications(mapped);
    };

    poll();
    pollRef.current = setInterval(poll, 5000);

    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
  }, [isLoggedIn, userId]);

  const closeConfirmedModal = useCallback(() => {
    setActiveConfirmedModal(null);
  }, []);

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
