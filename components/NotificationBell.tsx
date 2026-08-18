"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useNotifications, AppNotification } from "@/context/NotificationContext";

export default function NotificationBell() {
  const { isLoggedIn } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearAll } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  if (!isLoggedIn) return null;

  const getIcon = (type: AppNotification["type"]) => {
    switch (type) {
      case "SCRIM_REQUEST_ACCEPTED":
        return "🎉";
      case "SCRIM_REQUEST_DECLINED":
        return "✕";
      case "SCRIM_UNBOOKED":
        return "⚠️";
      case "SCRIM_REQUEST_RECEIVED":
        return "⏳";
      case "TEAM_JOIN_REQUEST":
        return "👥";
      case "TEAM_REQUEST_ACCEPTED":
        return "✅";
      case "TEAM_REQUEST_DECLINED":
        return "🚫";
      default:
        return "⚔️";
    }
  };

  const getBadgeStyle = (type: AppNotification["type"]) => {
    switch (type) {
      case "SCRIM_REQUEST_ACCEPTED":
      case "TEAM_REQUEST_ACCEPTED":
        return "bg-[#12241D] text-[#34D399] border-[#10B981]/30";
      case "SCRIM_REQUEST_DECLINED":
      case "TEAM_REQUEST_DECLINED":
        return "bg-[#282115] text-[#FBBF24] border-[#F59E0B]/30";
      case "SCRIM_UNBOOKED":
        return "bg-[#2A181A] text-[#F87171] border-[#EF4444]/30";
      case "TEAM_JOIN_REQUEST":
        return "bg-[#1E1533] text-[#C084FC] border-[#A855F7]/30";
      default:
        return "bg-[#161F33] text-[#60A5FA] border-[#2563EB]/30";
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 rounded-full border border-[#232A3B] bg-[#11141C] hover:bg-[#1A202C] text-[#94A3B8] hover:text-[#F8FAFC] flex items-center justify-center transition-all cursor-pointer relative"
        title="Notifications"
      >
        <span className="text-base">🔔</span>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-[#EF4444] text-white text-[10px] font-sans font-bold flex items-center justify-center ring-2 ring-[#0B0E14] animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-[#272E3F] bg-[#11141C] shadow-2xl z-50 overflow-hidden flex flex-col max-h-[480px]">
          <div className="p-3.5 border-b border-[#232A3B] flex items-center justify-between bg-[#151924]">
            <div className="flex items-center gap-2">
              <span className="font-display text-xs font-bold uppercase text-[#F8FAFC]">
                Notifications
              </span>
              {unreadCount > 0 && (
                <span className="text-[10px] font-sans font-bold px-2 py-0.5 rounded-full bg-[#EF4444]/20 text-[#F87171] border border-[#EF4444]/30">
                  {unreadCount} UNREAD
                </span>
              )}
            </div>
            {notifications.length > 0 && (
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-[10px] font-sans font-semibold text-[#60A5FA] hover:underline cursor-pointer"
                  >
                    Read All
                  </button>
                )}
                <button
                  onClick={clearAll}
                  className="text-[10px] font-sans font-semibold text-[#64748B] hover:text-[#F87171] hover:underline cursor-pointer"
                >
                  Clear
                </button>
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-[#1A202C]">
            {notifications.length === 0 ? (
              <div className="py-12 text-center text-xs font-sans text-[#64748B] space-y-1">
                <span className="text-2xl block mb-2">🔔</span>
                <p className="font-semibold text-[#94A3B8]">No Notifications Yet</p>
                <p className="text-[11px]">Scrim updates and roster activity will show up here.</p>
              </div>
            ) : (
              notifications.map((n) => (
                <Link
                  key={n.id}
                  href={n.link || "/dashboard"}
                  onClick={() => {
                    markAsRead(n.id);
                    setIsOpen(false);
                  }}
                  className={`p-3.5 transition-colors cursor-pointer flex items-start gap-3 ${
                    n.read ? "bg-[#11141C] opacity-75" : "bg-[#161B26]"
                  } hover:bg-[#1C2232]`}
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm shrink-0 border ${getBadgeStyle(
                      n.type
                    )}`}
                  >
                    {getIcon(n.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <span className="text-xs font-sans font-bold text-[#F8FAFC] truncate">
                        {n.title}
                      </span>
                      <span className="text-[9px] font-sans text-[#64748B] shrink-0">
                        {new Date(n.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                    <p className="text-[11px] font-sans text-[#94A3B8] leading-tight line-clamp-2">
                      {n.message}
                    </p>
                  </div>
                  {!n.read && (
                    <span className="w-2 h-2 rounded-full bg-[#3B82F6] shrink-0 mt-1.5" />
                  )}
                </Link>
              ))
            )}
          </div>

          <div className="p-2.5 border-t border-[#232A3B] bg-[#151924] text-center">
            <Link
              href="/dashboard"
              onClick={() => setIsOpen(false)}
              className="text-xs font-sans font-bold text-[#60A5FA] hover:text-[#93C5FD] transition-colors inline-flex items-center gap-1"
            >
              <span>🏠 Open Dashboard</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
