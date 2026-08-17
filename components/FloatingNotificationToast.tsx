"use client";

import React from "react";
import Link from "next/link";
import { useNotifications, ScrimNotification } from "@/context/NotificationContext";

export default function FloatingNotificationToast() {
  const { toastNotifications, markAsRead, dismissToast } = useNotifications();

  if (toastNotifications.length === 0) return null;

  const getBorderColor = (type: ScrimNotification["type"]) => {
    switch (type) {
      case "ACCEPTED":
        return "border-[#10B981] bg-gradient-to-r from-[#0F221B] to-[#11141C]";
      case "DECLINED":
        return "border-[#F59E0B] bg-gradient-to-r from-[#221B10] to-[#11141C]";
      case "UNBOOKED":
        return "border-[#EF4444] bg-gradient-to-r from-[#24171A] to-[#11141C]";
      default:
        return "border-[#2563EB] bg-[#11141C]";
    }
  };

  const getIcon = (type: ScrimNotification["type"]) => {
    switch (type) {
      case "ACCEPTED":
        return "🏆";
      case "DECLINED":
        return "ℹ️";
      case "UNBOOKED":
        return "⚠️";
      default:
        return "⚔️";
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-auto animate-in slide-in-from-bottom-4 duration-300">
      {toastNotifications.slice(0, 3).map((item) => (
        <div
          key={item.id}
          className={`p-4 rounded-2xl border-l-4 border-y border-r border-t-[#272E3F] border-b-[#272E3F] border-r-[#272E3F] shadow-2xl space-y-2.5 backdrop-blur-md ${getBorderColor(
            item.type
          )}`}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <span className="text-xl shrink-0">{getIcon(item.type)}</span>
              <div>
                <h4 className="font-display text-xs font-bold uppercase text-[#F8FAFC]">
                  {item.title}
                </h4>
                <span className="text-[9px] font-sans text-[#64748B] block">
                  {new Date(item.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            </div>

            {/* Close / Dismiss Button - User explicitly interacts to close */}
            <button
              onClick={() => dismissToast(item.id)}
              className="w-6 h-6 rounded-md bg-[#1E2433] hover:bg-[#EF4444]/20 text-[#64748B] hover:text-[#F87171] flex items-center justify-center text-xs font-bold transition-all cursor-pointer border border-[#2B3245]"
              title="Dismiss Notification"
            >
              ✕
            </button>
          </div>

          <p className="text-xs font-sans text-[#CBD5E1] leading-relaxed">
            {item.message}
          </p>

          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              onClick={() => markAsRead(item.id)}
              className="h-8 px-3 rounded-lg bg-[#1E2433] hover:bg-[#2A3142] text-[#94A3B8] hover:text-[#F8FAFC] font-sans text-[11px] font-semibold uppercase tracking-wider transition-all cursor-pointer border border-[#2B3245]"
            >
              Mark Read
            </button>
            <Link
              href="/scrims"
              onClick={() => markAsRead(item.id)}
              className="h-8 px-3 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-sans text-[11px] font-bold uppercase tracking-wider transition-all active:scale-[0.98] cursor-pointer shadow-md shadow-blue-950/40 flex items-center justify-center"
            >
              ⚔️ View Scrim
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}
