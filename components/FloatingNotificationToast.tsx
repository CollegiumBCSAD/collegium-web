"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useNotifications, AppNotification } from "@/context/NotificationContext";
import {
  TrophyIcon,
  SwordsIcon,
  ClockIcon,
  AlertTriangleIcon,
  UsersIcon,
  CheckCircleIcon,
  XCircleIcon,
  InfoIcon,
} from "@/components/ui/Icons";

export default function FloatingNotificationToast() {
  const { isLoggedIn } = useAuth();
  const {
    toastNotifications,
    activeConfirmedModal,
    closeConfirmedModal,
    markAsRead,
    dismissToast,
  } = useNotifications();

  const getBorderColor = (type: AppNotification["type"]) => {
    switch (type) {
      case "SCRIM_REQUEST_ACCEPTED":
      case "TEAM_REQUEST_ACCEPTED":
        return "border-[#10B981] bg-gradient-to-r from-[#0F221B] to-[#11141C]";
      case "SCRIM_REQUEST_RECEIVED":
        return "border-[#3B82F6] bg-gradient-to-r from-[#172554] to-[#11141C]";
      case "SCRIM_REQUEST_DECLINED":
      case "TEAM_REQUEST_DECLINED":
        return "border-[#F59E0B] bg-gradient-to-r from-[#221B10] to-[#11141C]";
      case "SCRIM_UNBOOKED":
        return "border-[#EF4444] bg-gradient-to-r from-[#24171A] to-[#11141C]";
      case "TEAM_JOIN_REQUEST":
        return "border-[#A855F7] bg-gradient-to-r from-[#1E1533] to-[#11141C]";
      default:
        return "border-[#2563EB] bg-[#11141C]";
    }
  };

  const getIcon = (type: AppNotification["type"]) => {
    switch (type) {
      case "SCRIM_REQUEST_ACCEPTED":
        return <TrophyIcon className="w-4 h-4 text-emerald-400" />;
      case "SCRIM_REQUEST_RECEIVED":
        return <ClockIcon className="w-4 h-4 text-blue-400" />;
      case "SCRIM_REQUEST_DECLINED":
        return <InfoIcon className="w-4 h-4 text-amber-400" />;
      case "SCRIM_UNBOOKED":
        return <AlertTriangleIcon className="w-4 h-4 text-rose-400" />;
      case "TEAM_JOIN_REQUEST":
        return <UsersIcon className="w-4 h-4 text-purple-400" />;
      case "TEAM_REQUEST_ACCEPTED":
        return <CheckCircleIcon className="w-4 h-4 text-emerald-400" />;
      case "TEAM_REQUEST_DECLINED":
        return <XCircleIcon className="w-4 h-4 text-amber-400" />;
      default:
        return <SwordsIcon className="w-4 h-4 text-blue-400" />;
    }
  };

  if (!isLoggedIn) return null;

  return (
    <>
      {/* Celebration Popup Window for Requester */}
      {activeConfirmedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in zoom-in-95 duration-200">
          <div className="w-full max-w-md bg-[#11141C] border border-[#10B981]/50 rounded-2xl p-6 shadow-2xl space-y-5 text-center relative overflow-hidden">
            <div className="w-16 h-16 rounded-full bg-[#10B981]/20 border border-[#10B981]/40 flex items-center justify-center text-3xl mx-auto animate-bounce">
              <TrophyIcon className="w-8 h-8 text-[#10B981]" />
            </div>
            <div>
              <span className="text-[10px] font-sans font-extrabold uppercase tracking-widest text-[#34D399] block mb-1">
                SCRIM REQUEST ACCEPTED!
              </span>
              <h3 className="font-display text-xl font-bold uppercase text-[#F8FAFC]">
                {activeConfirmedModal.title}
              </h3>
              <p className="font-sans text-xs text-[#94A3B8] mt-1">
                {activeConfirmedModal.message}
              </p>
            </div>

            <button
              onClick={closeConfirmedModal}
              className="w-full h-11 rounded-xl bg-gradient-to-r from-[#10B981] to-[#059669] hover:from-[#34D399] hover:to-[#10B981] text-white font-sans text-xs font-bold uppercase tracking-wider transition-all active:scale-[0.98] cursor-pointer shadow-lg shadow-emerald-950/40"
            >
              Let&apos;s Warm Up!
            </button>
          </div>
        </div>
      )}

      {/* Persistent Toast Stack */}
      {toastNotifications.length > 0 && (
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
                  <span className="shrink-0">{getIcon(item.type)}</span>
                  <div>
                    <h4 className="font-display text-xs font-bold uppercase text-[#F8FAFC]">
                      {item.title}
                    </h4>
                    <span className="text-[9px] font-sans text-[#64748B] block">
                      {new Date(item.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                </div>

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
                  href={item.link || "/dashboard"}
                  onClick={() => markAsRead(item.id)}
                  className="h-8 px-3 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-sans text-[11px] font-bold uppercase tracking-wider transition-all active:scale-[0.98] cursor-pointer shadow-md shadow-blue-950/40 flex items-center justify-center"
                >
                  {item.category === "TEAM" ? "View Roster" : "View Scrim"}
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
