"use client";

import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNotifications, AppNotification } from "@/context/NotificationContext";
import { CheckCircleIcon, XCircleIcon, AlertTriangleIcon, ClockIcon, UsersIcon, SwordsIcon } from "@/components/ui/Icons";

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
      case "TEAM_REQUEST_ACCEPTED":
        return <CheckCircleIcon className="w-4 h-4 text-emerald-400" />;
      case "SCRIM_REQUEST_DECLINED":
      case "TEAM_REQUEST_DECLINED":
        return <XCircleIcon className="w-4 h-4 text-amber-400" />;
      case "SCRIM_UNBOOKED":
        return <AlertTriangleIcon className="w-4 h-4 text-rose-400" />;
      case "SCRIM_REQUEST_RECEIVED":
        return <ClockIcon className="w-4 h-4 text-slate-300" />;
      case "TEAM_JOIN_REQUEST":
        return <UsersIcon className="w-4 h-4 text-purple-400" />;
      default:
        return <SwordsIcon className="w-4 h-4 text-slate-300" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-9 h-9 rounded-xl border border-[#1E293B] bg-[#0A0D18] hover:border-primary-brand/60 hover:bg-[#101524] text-slate-300 hover:text-white flex items-center justify-center transition-all duration-200 cursor-pointer relative shadow-md group"
        title="Notifications"
      >
        <span className="text-sm group-hover:scale-110 group-hover:rotate-12 transition-transform duration-200">🔔</span>
        {unreadCount > 0 && (
          <span
            className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full text-[9px] font-mono font-black flex items-center justify-center ring-2 ring-[#070912] animate-pulse shadow-md"
            style={{
              backgroundColor: "var(--primary-brand)",
              color: "var(--game-btn-text, #FFFFFF)",
            }}
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl bg-[#0A0D18] border border-[#1E293B] shadow-2xl z-50 overflow-hidden flex flex-col max-h-[480px] animate-dropdown-pop">
          <div className="p-4 border-b border-[#182338] flex items-center justify-between bg-[#060812]">
            <div className="flex items-center gap-2">
              <span className="font-display text-xs font-black uppercase text-white tracking-wider">
                NOTIFICATIONS
              </span>
              {unreadCount > 0 && (
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-primary-brand/20 text-primary-brand border border-primary-brand/30">
                  {unreadCount} UNREAD
                </span>
              )}
            </div>
            {notifications.length > 0 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={markAllAsRead}
                  className="text-[10px] font-mono font-bold text-slate-400 hover:text-white transition-colors"
                >
                  MARK ALL READ
                </button>
                <span className="text-slate-600">•</span>
                <button
                  onClick={clearAll}
                  className="text-[10px] font-mono font-bold text-rose-400 hover:text-rose-300 transition-colors"
                >
                  CLEAR
                </button>
              </div>
            )}
          </div>

          <div className="overflow-y-auto divide-y divide-[#141A29]">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-xs font-mono text-slate-400">
                NO NOTIFICATIONS
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => markAsRead(n.id)}
                  className={`p-3.5 hover:bg-[#101524] transition-colors cursor-pointer flex items-start gap-3 group ${
                    !n.read ? "bg-[#0E1424]/60" : ""
                  }`}
                >
                  <div className="w-8 h-8 rounded-lg bg-[#141A29] border border-[#232D44] flex items-center justify-center shrink-0 mt-0.5 group-hover:border-primary-brand">
                    {getIcon(n.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-display font-black text-white uppercase group-hover:text-primary-brand transition-colors">
                      {n.title}
                    </p>
                    <p className="text-[11px] font-sans text-slate-400 mt-0.5 leading-relaxed">
                      {n.message}
                    </p>
                    <span className="text-[9px] font-mono text-slate-500 block mt-1">
                      {new Date(n.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  {!n.read && (
                    <span className="w-1.5 h-1.5 rounded-full bg-primary-brand shrink-0 mt-1.5" />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
