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
        className="w-9 h-9 rounded-xl border border-[#1E293B] bg-[#0A0D18] hover:border-primary-brand/60 hover:bg-[#101524] text-slate-300 hover:text-white flex items-center justify-center transition-all duration-200 cursor-pointer relative shadow-md group"
        title="War Room Chats"
      >
        <SwordsIcon className="w-4 h-4 text-slate-300 group-hover:scale-110 group-hover:text-primary-brand transition-all duration-200" />
        {chats.length > 0 && (
          <span
            className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full text-[9px] font-mono font-black flex items-center justify-center ring-2 ring-[#070912] animate-pulse shadow-md"
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
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl bg-[#0A0D18] border border-[#1E293B] shadow-2xl z-50 overflow-hidden flex flex-col max-h-[480px] animate-dropdown-pop">
          <div className="p-4 border-b border-[#182338] flex items-center justify-between bg-[#060812]">
            <div className="flex items-center gap-2">
              <SwordsIcon className="w-4 h-4 text-primary-brand" />
              <span className="font-display text-xs font-black uppercase text-white tracking-wider">
                WAR ROOM CHATS
              </span>
            </div>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-primary-brand/20 text-primary-brand border border-primary-brand/30">
              {chats.length} ACTIVE
            </span>
          </div>

          <div className="overflow-y-auto divide-y divide-[#141A29]">
            {isLoading ? (
              <div className="p-6 text-center text-xs font-mono text-slate-400 animate-pulse">
                LOADING CHATS...
              </div>
            ) : chats.length === 0 ? (
              <div className="p-6 text-center space-y-2">
                <p className="text-xs font-mono text-slate-400">NO ACTIVE WAR ROOM CHATS</p>
                <p className="text-[11px] font-sans text-slate-400">
                  Confirmed scrims automatically spawn dedicated War Room communication channels.
                </p>
              </div>
            ) : (
              chats.map(({ scrim, isHost, opponentLabel }) => (
                <div
                  key={scrim.id}
                  onClick={() => {
                    openWarRoom(scrim, isHost);
                    setIsOpen(false);
                  }}
                  className="p-3.5 hover:bg-[#101524] transition-colors cursor-pointer flex items-center justify-between gap-3 group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-[#141A29] border border-[#232D44] flex items-center justify-center shrink-0 group-hover:border-primary-brand">
                      <FlameIcon className="w-4 h-4 text-amber-400" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-display text-xs font-black text-white uppercase truncate group-hover:text-primary-brand">
                          vs {opponentLabel}
                        </span>
                        <span className="font-mono text-[9px] px-1.5 py-0.2 rounded bg-[#141A29] text-slate-300 border border-[#232D44]">
                          {scrim.gameTitle}
                        </span>
                      </div>
                      <p className="text-[10px] font-mono text-slate-400 truncate mt-0.5">
                        {scrim.scheduledAt || "Live War Room Lobby"}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-mono text-primary-brand font-bold shrink-0">
                    OPEN →
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
