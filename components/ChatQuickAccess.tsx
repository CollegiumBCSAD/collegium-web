"use client";

import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useWarRoom } from "@/context/WarRoomContext";
import { scrimsService } from "@/services";
import { fetchTeamsApi, Team } from "@/lib/teams";
import { ScrimOffer } from "@/types";

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
        className="w-10 h-10 rounded-full border border-[#232A3B] bg-[#11141C] hover:bg-[#1A202C] text-[#94A3B8] hover:text-[#F8FAFC] flex items-center justify-center transition-all cursor-pointer relative"
        title="War Room Chats"
      >
        <span className="text-base">💬</span>
        {chats.length > 0 && (
          <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-[#3B82F6] text-white text-[10px] font-sans font-bold flex items-center justify-center ring-2 ring-[#0B0E14]">
            {chats.length > 9 ? "9+" : chats.length}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-[#272E3F] bg-[#11141C] shadow-2xl z-50 overflow-hidden flex flex-col max-h-[480px]">
          <div className="p-3.5 border-b border-[#232A3B] bg-[#151924]">
            <span className="font-display text-xs font-bold uppercase text-[#F8FAFC]">
              War Room Chats
            </span>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-[#1A202C]">
            {isLoading ? (
              <div className="py-12 text-center text-xs font-sans text-[#64748B] animate-pulse">
                Loading confirmed matches...
              </div>
            ) : chats.length === 0 ? (
              <div className="py-12 text-center text-xs font-sans text-[#64748B] space-y-1">
                <span className="text-2xl block mb-2">💬</span>
                <p className="font-semibold text-[#94A3B8]">No Active War Rooms</p>
                <p className="text-[11px]">Confirmed scrim matches will show up here.</p>
              </div>
            ) : (
              chats.map(({ scrim, isHost, opponentLabel }) => (
                <button
                  key={scrim.id}
                  onClick={() => {
                    openWarRoom(scrim, isHost);
                    setIsOpen(false);
                  }}
                  className="w-full text-left p-3.5 transition-colors cursor-pointer hover:bg-[#1C2232] flex items-center gap-3"
                >
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm shrink-0 border bg-[#161F33] text-[#60A5FA] border-[#2563EB]/30">
                    🔥
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-sans font-bold text-[#F8FAFC] truncate block">
                      vs {opponentLabel}
                    </span>
                    <span className="text-[11px] font-sans text-[#94A3B8] truncate block">
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
