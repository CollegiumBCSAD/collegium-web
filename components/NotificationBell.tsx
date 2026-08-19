"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useNotifications, AppNotification } from "@/context/NotificationContext";
import { CheckCircleIcon, XCircleIcon, AlertTriangleIcon, ClockIcon, UsersIcon, SwordsIcon, InfoIcon } from "@/components/ui/Icons";

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

  const getBadgeStyle = (type: AppNotification["type"]) => {
    switch (type) {
      case "SCRIM_REQUEST_ACCEPTED":
      case "TEAM_REQUEST_ACCEPTED":
        return "bg-emerald-950/60 text-emerald-400 border-emerald-500/30";
      case "SCRIM_REQUEST_DECLINED":
      case "TEAM_REQUEST_DECLINED":
        return "bg-amber-950/60 text-amber-400 border-amber-500/30";
      case "SCRIM_UNBOOKED":
        return "bg-rose-950/60 text-rose-400 border-rose-500/30";
      case "TEAM_JOIN_REQUEST":
        return "bg-purple-950/60 text-purple-400 border-purple-500/30";
      default:
        return "bg-blue-950/60 text-blue-400 border-blue-500/30";
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 rounded-full border border-[#232D44] bg-[#0D121F]/90 hover:bg-[#141A29] hover:border-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-all duration-200 cursor-pointer relative group active:scale-95 shadow-md"
        title="Notifications"
      >
        <span className="text-base group-hover:scale-110 group-hover:rotate-12 transition-transform duration-200">🔔</span>
        {unreadCount > 0 && (
          <span
            className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full text-[10px] font-mono font-black flex items-center justify-center ring-2 ring-[#0A0C10] animate-pulse shadow-md"
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
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-[#1E293B] bg-[#0D121F] shadow-2xl z-50 overflow-hidden flex flex-col max-h-[480px] animate-dropdown-pop">
          <div className="p-4 border-b border-[#1C2538] flex items-center justify-between bg-[#080C14]">
            <div className="flex items-center gap-2">
              <span className="font-display text-xs font-black uppercase text-white tracking-wide">
                Notifications
              </span>
              {unreadCount > 0 && (
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-primary-brand/20 text-primary-brand border border-primary-brand/30">
                  {unreadCount} UNREAD
                </span>
              )}
            </div>
            {notifications.length > 0 && (
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-[10px] font-mono font-bold text-primary-brand hover:underline cursor-pointer"
                  >
                    Read All
                  </button>
                )}
                <button
                  onClick={clearAll}
                  className="text-[10px] font-mono font-bold text-slate-400 hover:text-rose-400 hover:underline cursor-pointer"
                >
                  Clear
                </button>
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-[#1C2538]">
            {notifications.length === 0 ? (
              <div className="py-12 text-center text-xs font-sans text-slate-400 space-y-1">
                <div className="w-10 h-10 rounded-xl bg-[#141A29] border border-[#232D44] flex items-center justify-center mx-auto mb-2 text-slate-400">
                  <InfoIcon className="w-5 h-5" />
                </div>
                <p className="font-bold text-white">No Notifications Yet</p>
                <p className="text-[11px] font-mono text-slate-400">Scrim updates and roster activity will show up here.</p>
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
                  className={`p-3.5 transition-all duration-150 cursor-pointer flex items-start gap-3 hover:translate-x-1 ${
                    n.read ? "bg-[#0D121F] opacity-75" : "bg-[#141A29]"
                  } hover:bg-[#182033]`}
                >
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm shrink-0 border ${getBadgeStyle(
                      n.type
                    )}`}
                  >
                    {getIcon(n.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <span className="text-xs font-sans font-bold text-white truncate">
                        {n.title}
                      </span>
                      <span className="text-[9px] font-mono text-slate-400 shrink-0">
                        {new Date(n.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                    <p className="text-[11px] font-sans text-slate-300 leading-tight line-clamp-2">
                      {n.message}
                    </p>
                  </div>
                  {!n.read && (
                    <span className="w-2 h-2 rounded-full bg-primary-brand shrink-0 mt-1.5 shadow-sm" />
                  )}
                </Link>
              ))
            )}
          </div>

          <div className="p-3 border-t border-[#1C2538] bg-[#080C14] text-center">
            <Link
              href="/dashboard"
              onClick={() => setIsOpen(false)}
              className="text-xs font-mono font-bold text-primary-brand hover:underline transition-colors inline-flex items-center gap-1"
            >
              <span>🏠 Open Dashboard</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
