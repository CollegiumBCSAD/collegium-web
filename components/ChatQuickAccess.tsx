"use client";

import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useWarRoom } from "@/context/WarRoomContext";
import { scrimsService } from "@/services";
import { fetchTeamsApi, Team } from "@/lib/teams";
import { ScrimOffer } from "@/types";
import { SwordsIcon, FlameIcon } from "@/components/ui/Icons";

interface ActiveChat {
  scrim: ScrimOffer;
  isHost: boolean;
  opponentLabel: string;
}

async function fetchActiveChats(userId: string): Promise<ActiveChat[]> {
  const [scrims, teams] = await Promise.all([
    scrimsService.getScrims(),
    fetchTeamsApi(),
  ]);

  const myTeamIds = new Set(
    teams
      .filter((t: Team) =>
        t.captainId === userId ||
        t.members.some((m) => m.userId === userId && m.status === "ACCEPTED")
      )
      .map((t: Team) => t.id)
  );

  return scrims
    .filter((s) => s.status === "CONFIRMED")
    .filter((s) => (s.teamId && myTeamIds.has(s.teamId)) || (s.opponentTeamId && myTeamIds.has(s.opponentTeamId)))
    .map((s) => {
      const isHost = !!(s.teamId && myTeamIds.has(s.teamId));
      return {
        scrim: s,
        isHost,
        opponentLabel: isHost ? (s.opponentTeamName || "Challenger Squad") : s.hostTeamName,
      };
    });
}

export default function ChatQuickAccess() {
  const { isLoggedIn, user } = useAuth();
  const { openWarRoom } = useWarRoom();
  const [isOpen, setIsOpen] = useState(false);
  const [chats, setChats] = useState<ActiveChat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const userId = user?.id;

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

  useEffect(() => {
    if (!isLoggedIn || !userId) return;

    let isMounted = true;
    fetchActiveChats(userId)
      .then((active) => {
        if (isMounted) setChats(active);
      })
      .catch(() => {
        if (isMounted) setChats([]);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isLoggedIn, userId]);

  if (!isLoggedIn) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => {
          const next = !isOpen;
          setIsOpen(next);
          if (next && userId) {
            setIsLoading(true);
            fetchActiveChats(userId)
              .then((active) => setChats(active))
              .catch(() => setChats([]))
              .finally(() => setIsLoading(false));
          }
        }}
        className="w-10 h-10 rounded-full border border-[#232D44] bg-[#0D121F]/90 hover:bg-[#141A29] hover:border-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-all duration-200 cursor-pointer relative group active:scale-95 shadow-md"
        title="War Room Chats"
      >
        <SwordsIcon className="w-4 h-4 text-slate-300 group-hover:scale-110 group-hover:text-primary-brand transition-all duration-200" />
        {chats.length > 0 && (
          <span
            className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full text-[10px] font-mono font-black flex items-center justify-center ring-2 ring-[#0A0C10] animate-pulse shadow-md"
            style={{
              backgroundColor: "var(--primary-brand)",
              color: "var(--game-btn-text, #FFFFFF)",
            }}
          >
            {chats.length > 9 ? "9+" : chats.length}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-[#1E293B] bg-[#0D121F] shadow-2xl z-50 overflow-hidden flex flex-col max-h-[480px] animate-dropdown-pop">
          <div className="p-4 border-b border-[#1C2538] bg-[#080C14]">
            <span className="font-display text-xs font-black uppercase text-white tracking-wide">
              Active War Room Chats
            </span>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-[#1C2538]">
            {isLoading ? (
              <div className="py-12 text-center text-xs font-mono text-slate-400 animate-pulse">
                Loading confirmed matches...
              </div>
            ) : chats.length === 0 ? (
              <div className="py-12 text-center text-xs font-sans text-slate-400 space-y-1 flex flex-col items-center">
                <SwordsIcon className="w-6 h-6 text-slate-500 mb-2" />
                <p className="font-bold text-white">No Active War Rooms</p>
                <p className="text-[11px] font-mono text-slate-400">Confirmed scrim matches will show up here.</p>
              </div>
            ) : (
              chats.map(({ scrim, isHost, opponentLabel }) => (
                <button
                  key={scrim.id}
                  onClick={() => {
                    openWarRoom(scrim, isHost);
                    setIsOpen(false);
                  }}
                  className="w-full text-left p-3.5 transition-all duration-150 cursor-pointer hover:bg-[#141A29] hover:translate-x-1 flex items-center gap-3"
                >
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center text-sm shrink-0 border bg-[#141A29] text-primary-brand border-primary-brand/30">
                    <FlameIcon className="w-4 h-4 text-primary-brand" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-sans font-bold text-white truncate block">
                      vs {opponentLabel}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400 truncate block">
                      {scrim.gameTitle.toUpperCase()} · {new Date(scrim.scheduledAt).toLocaleDateString([], { month: "short", day: "numeric" })}
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
