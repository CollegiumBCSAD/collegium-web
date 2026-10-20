"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { useWarRoom } from "@/context/WarRoomContext";
import { loadWarRoomChannels } from "@/lib/warRooms";
import { WarRoomChannel, WarRoomFilter } from "@/types";
import { SwordsIcon, ShieldIcon } from "@/components/ui/Icons";
import WarRoomChannelRow from "@/components/WarRoomChannelRow";

const FILTERS: { id: WarRoomFilter; label: string }[] = [
  { id: "ALL", label: "All" },
  { id: "TOURNAMENT", label: "Tournaments" },
  { id: "SCRIM", label: "Scrims" },
];

export function SpeechBubbleIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M4 4h16a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H8l-4 4V6a2 2 0 0 1 2-2z" />
    </svg>
  );
}

export default function ChatQuickAccess() {
  const { user, isLoggedIn } = useAuth();
  const { openWarRoom, openTournamentBracket } = useWarRoom();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<WarRoomFilter>("ALL");
  const [channels, setChannels] = useState<WarRoomChannel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const userId = user?.id;

  const triggerSync = () => {
    setRefreshKey((prev) => prev + 1);
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
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

    async function initWarRooms() {
      try {
        const list = await loadWarRoomChannels(user!);
        if (isMounted) setChannels(list);
      } catch {
        if (isMounted) setChannels([]);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    initWarRooms();

    const handleRefresh = () => {
      initWarRooms();
    };
    window.addEventListener("scrim:completed", handleRefresh);
    window.addEventListener("focus", handleRefresh);

    return () => {
      isMounted = false;
      window.removeEventListener("scrim:completed", handleRefresh);
      window.removeEventListener("focus", handleRefresh);
    };
    // user is read through userId; the profile object itself changes identity on refetch.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn, userId, refreshKey]);

  const counts = useMemo(
    () => ({
      ALL: channels.length,
      TOURNAMENT: channels.filter((c) => c.kind === "TOURNAMENT").length,
      SCRIM: channels.filter((c) => c.kind === "SCRIM").length,
    }),
    [channels],
  );

  const filteredChannels = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return channels.filter(
      (c) =>
        (filter === "ALL" || c.kind === filter) &&
        (!q ||
          c.title.toLowerCase().includes(q) ||
          c.myTeamName.toLowerCase().includes(q) ||
          c.gameTitle.toLowerCase().includes(q))
    );
  }, [channels, searchQuery, filter]);

  const openChannel = (channel: WarRoomChannel) => {
    if (channel.kind === "TOURNAMENT" && channel.tournamentId) {
      openTournamentBracket(channel.tournamentId, "channel");
    } else if (channel.scrim) {
      openWarRoom(channel.scrim, channel.isHost);
    }
    setIsOpen(false);
  };

  const unreadTotal = useMemo(() => {
    return channels.reduce((acc, c) => acc + (c.isLive ? 1 : 0), 0);
  }, [channels]);

  if (!isLoggedIn) return null;

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40" ref={containerRef}>
      {/* Floating Chat Drawer */}
      {isOpen && (
        <div
          className="absolute bottom-16 right-0 w-[min(400px,calc(100vw-2rem))] h-[min(520px,calc(100dvh-8rem))] bg-[#0A0D18] border border-[#1E293B] shadow-2xl overflow-hidden flex flex-col z-50 animate-modal-enter"
          style={{
            clipPath:
              "polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px))",
          }}
        >
          {/* Header */}
          <div className="p-4 border-b border-[#182338] bg-[#0E1322] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
                <SwordsIcon className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-display font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <span>Match War Rooms</span>
                  {unreadTotal > 0 && (
                    <span className="px-1.5 py-0.2 bg-rose-500 text-white font-mono text-[9px] font-bold rounded-full">
                      {unreadTotal} LIVE
                    </span>
                  )}
                </h3>
                <p className="text-[10px] font-mono text-slate-400">Tactical Comms Channels</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1.5 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              ✕
            </button>
          </div>

          {/* Search Channels */}
          <div className="p-3 bg-[#060812] border-b border-[#182338]">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search war room chats..."
                className="w-full bg-[#0D1222] border border-[#1E293B] rounded-xl px-3.5 py-2 text-xs font-sans text-white placeholder-slate-500 focus:outline-none focus:border-rose-500/70 transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              )}
            </div>
            <div className="mt-2.5 flex gap-1" role="tablist" aria-label="Filter war rooms">
              {FILTERS.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  role="tab"
                  aria-selected={filter === f.id}
                  onClick={() => setFilter(f.id)}
                  className={`flex-1 h-8 flex items-center justify-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-wider transition-colors ${
                    filter === f.id
                      ? "bg-rose-500/15 border border-rose-500/50 text-white"
                      : "border border-transparent text-slate-400 hover:text-white hover:bg-[#10172D]"
                  }`}
                >
                  {f.label}
                  <span className={`px-1 rounded-sm text-[9px] ${filter === f.id ? "bg-rose-500 text-white" : "bg-[#141A29] text-slate-500"}`}>
                    {counts[f.id]}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Chat Channels List */}
          <div className="flex-1 overflow-y-auto divide-y divide-[#13192B] bg-[#080B14]">
            {isLoading ? (
              <div className="py-16 text-center space-y-3">
                <div className="w-6 h-6 border-2 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="font-mono text-xs text-slate-400 uppercase tracking-wider">
                  Loading active war rooms...
                </p>
              </div>
            ) : filteredChannels.length === 0 ? (
              <div className="py-14 px-6 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-[#141A29] border border-[#232D44] flex items-center justify-center mx-auto text-slate-400">
                  <SwordsIcon className="w-6 h-6 text-slate-500" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-display text-xs font-black uppercase text-white tracking-wider">
                    {searchQuery ? "NO MATCHING CHATS" : filter === "TOURNAMENT" ? "NO TOURNAMENT CHANNELS" : filter === "SCRIM" ? "NO SCRIM WAR ROOMS" : "NO ACTIVE WAR ROOMS"}
                  </h4>
                  <p className="font-sans text-[11px] text-slate-400 leading-relaxed">
                    {searchQuery
                      ? "No war room chats matched your search."
                      : filter === "TOURNAMENT"
                        ? "Tournaments you organize or your squad is approved into will show their channel here."
                        : "When you have confirmed match scrims or active tournament battles, their live chat war rooms will appear here."}
                  </p>
                </div>
              </div>
            ) : (
              filteredChannels.map((channel) => (
                <WarRoomChannelRow key={channel.id} channel={channel} onOpen={() => openChannel(channel)} />
              ))
            )}
          </div>

          {/* Footer Status */}
          <div className="p-3 border-t border-[#182338] bg-[#070A14] flex items-center justify-between text-[10px] font-mono text-slate-400">
            <span className="flex items-center gap-1.5">
              <ShieldIcon className="w-3.5 h-3.5 text-rose-400" />
              <span>{channels.length} WAR ROOMS CONNECTED</span>
            </span>
            <button
              type="button"
              onClick={() => triggerSync()}
              className="hover:text-white transition-colors cursor-pointer text-slate-400 flex items-center gap-1"
            >
              <span>SYNC</span>
              <span>↻</span>
            </button>
          </div>
        </div>
      )}

      {/* Floating Chat Bubble Button */}
      <button
        type="button"
        onClick={() => {
          const next = !isOpen;
          setIsOpen(next);
          if (next) {
            triggerSync();
          }
        }}
        aria-label="Toggle War Room Chats"
        className={`w-14 h-14 sm:w-15 sm:h-15 rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer shadow-2xl relative group ${
          isOpen
            ? "bg-[#141A29] text-rose-400 border-2 border-rose-500 rotate-90 scale-95 shadow-rose-500/20"
            : "bg-gradient-to-tr from-[#E11D48] via-[#F43F5E] to-[#FB7185] text-white hover:scale-110 active:scale-95 shadow-[0_0_25px_rgba(244,63,94,0.45)] hover:shadow-[0_0_35px_rgba(244,63,94,0.65)]"
        }`}
      >
        {isOpen ? (
          <span className="text-xl font-bold font-mono">✕</span>
        ) : (
          <SpeechBubbleIcon className="w-7 h-7 text-white drop-shadow-md group-hover:scale-110 transition-transform duration-200" />
        )}

        {/* Pulsing Active Badge */}
        {!isOpen && channels.length > 0 && (
          <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1.5 rounded-full bg-[#070912] border-2 border-[#E11D48] text-white font-mono text-[10px] font-black flex items-center justify-center shadow-lg animate-pulse">
            {channels.length > 9 ? "9+" : channels.length}
          </span>
        )}
      </button>
    </div>
  );
}
