"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { useWarRoom } from "@/context/WarRoomContext";
import { scrimsService, ScrimChatMessage } from "@/services";
import { fetchTeamsApi, Team } from "@/lib/teams";
import { ScrimOffer } from "@/types";
import { SwordsIcon, FlameIcon, ShieldIcon } from "@/components/ui/Icons";

export function SpeechBubbleIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M4 4h16a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H8l-4 4V6a2 2 0 0 1 2-2z" />
    </svg>
  );
}

interface WarRoomChannel {
  id: string;
  scrim: ScrimOffer;
  isHost: boolean;
  channelName: string;
  opponentTeamName: string;
  myTeamName: string;
  gameTitle: string;
  format: string;
  lastMessage?: string;
  lastSender?: string;
  lastMessageTime?: string;
  messageCount: number;
  scheduledAt?: string;
  isLive: boolean;
}

export default function ChatQuickAccess() {
  const { isLoggedIn, user } = useAuth();
  const { openWarRoom } = useWarRoom();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [channels, setChannels] = useState<WarRoomChannel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const userId = user?.id;

  const loadWarRooms = useCallback(async () => {
    if (!userId) return;

    try {
      const [scrims, teams] = await Promise.all([
        scrimsService.getScrims().catch(() => [] as ScrimOffer[]),
        fetchTeamsApi().catch(() => [] as Team[]),
      ]);

      const myTeams = teams.filter(
        (t: Team) =>
          t.captainId === userId ||
          t.members.some((m) => m.userId === userId && m.status !== "DECLINED")
      );
      const myTeamIds = new Set(myTeams.map((t) => t.id));

      // Filter to all matches/scrims involving user's teams (CONFIRMED, PENDING, or OPEN)
      const userScrims = scrims.filter(
        (s) =>
          (s.teamId && myTeamIds.has(s.teamId)) ||
          (s.opponentTeamId && myTeamIds.has(s.opponentTeamId))
      );

      const channelList: WarRoomChannel[] = await Promise.all(
        userScrims.map(async (s) => {
          const isHost = !!(s.teamId && myTeamIds.has(s.teamId));
          const myTeam = myTeams.find((t) => t.id === (isHost ? s.teamId : s.opponentTeamId));
          const opponentName = isHost
            ? s.opponentTeamName || (s.status === "CONFIRMED" ? "Challenger Squad" : "Awaiting Opponent")
            : s.hostTeamName;

          let lastMsg = "";
          let lastSender = "";
          let lastTime = "";
          let count = 0;

          try {
            const chatHistory: ScrimChatMessage[] = await scrimsService.getScrimChat(s.id);
            count = chatHistory.length;
            if (chatHistory.length > 0) {
              const latest = chatHistory[chatHistory.length - 1];
              lastMsg = latest.text;
              lastSender = latest.senderName;
              lastTime = new Date(latest.createdAt).toLocaleTimeString([], {
                hour: "numeric",
                minute: "2-digit",
              });
            }
          } catch {
            // best effort
          }

          const isLive = s.status === "CONFIRMED";

          return {
            id: s.id,
            scrim: s,
            isHost,
            channelName: `War Room: vs ${opponentName}`,
            opponentTeamName: opponentName,
            myTeamName: myTeam?.name || "Your Squad",
            gameTitle: (s.gameTitle || "VALO").toUpperCase(),
            format: s.format || "BO3",
            lastMessage: lastMsg || undefined,
            lastSender: lastSender || undefined,
            lastMessageTime: lastTime || undefined,
            messageCount: count,
            scheduledAt: s.scheduledAt,
            isLive,
          };
        })
      );

      // Sort: Live / recently messaged rooms at the top
      channelList.sort((a, b) => {
        if (a.isLive && !b.isLive) return -1;
        if (!a.isLive && b.isLive) return 1;
        return b.messageCount - a.messageCount;
      });

      setChannels(channelList);
    } catch {
      setChannels([]);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

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
    loadWarRooms();

    const handleRefresh = () => {
      loadWarRooms();
    };
    window.addEventListener("scrim:completed", handleRefresh);
    window.addEventListener("focus", handleRefresh);

    return () => {
      window.removeEventListener("scrim:completed", handleRefresh);
      window.removeEventListener("focus", handleRefresh);
    };
  }, [isLoggedIn, userId, loadWarRooms]);

  const filteredChannels = useMemo(() => {
    if (!searchQuery.trim()) return channels;
    const q = searchQuery.toLowerCase();
    return channels.filter(
      (c) =>
        c.channelName.toLowerCase().includes(q) ||
        c.opponentTeamName.toLowerCase().includes(q) ||
        c.myTeamName.toLowerCase().includes(q) ||
        c.gameTitle.toLowerCase().includes(q)
    );
  }, [channels, searchQuery]);

  if (!isLoggedIn) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50" ref={containerRef}>
      {/* Floating War Room Messenger Popover */}
      {isOpen && (
        <div
          className="absolute bottom-16 right-0 w-[340px] sm:w-[400px] h-[520px] rounded-2xl bg-[#090D1A]/95 border border-[#1E293B] shadow-2xl backdrop-blur-xl flex flex-col overflow-hidden animate-modal-enter z-50 mb-2"
          style={{
            boxShadow: "0 20px 50px rgba(0, 0, 0, 0.85), 0 0 30px rgba(244, 63, 94, 0.2)",
          }}
        >
          {/* Top Accent Gradient Bar */}
          <div className="h-[2.5px] w-full bg-gradient-to-r from-rose-500 via-pink-400 to-rose-600" />

          {/* Messenger Header */}
          <div className="p-4 border-b border-[#182338] bg-[#070A14] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-rose-600 to-rose-500 flex items-center justify-center text-white shadow-md shadow-rose-500/30">
                <SpeechBubbleIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-display text-sm font-black uppercase text-white tracking-wide">
                    WAR ROOMS
                  </h3>
                  <span className="flex items-center gap-1 font-mono text-[9px] font-black px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    LIVE
                  </span>
                </div>
                <p className="font-mono text-[10px] text-slate-400 uppercase tracking-widest mt-0.5">
                  Direct Match & Lobby Chats
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 rounded-lg bg-[#141A29] hover:bg-[#1E273D] border border-[#232D44] text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
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
                    {searchQuery ? "NO MATCHING CHATS" : "NO ACTIVE WAR ROOMS"}
                  </h4>
                  <p className="font-sans text-[11px] text-slate-400 leading-relaxed">
                    {searchQuery
                      ? "No war room chats matched your search."
                      : "When you have confirmed match scrims or active tournament battles, their live chat war rooms will appear here."}
                  </p>
                </div>
              </div>
            ) : (
              filteredChannels.map((channel) => (
                <div
                  key={channel.id}
                  onClick={() => {
                    openWarRoom(channel.scrim, channel.isHost);
                    setIsOpen(false);
                  }}
                  className="p-3.5 hover:bg-[#10172D] transition-colors cursor-pointer group flex items-start gap-3 relative"
                >
                  {/* Game / Squad Avatar */}
                  <div className="relative shrink-0">
                    <div className="w-10 h-10 rounded-xl bg-[#141A29] border border-[#232D44] group-hover:border-rose-500/50 flex items-center justify-center text-white transition-colors shadow-sm">
                      <FlameIcon className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform" />
                    </div>
                    {channel.isLive && (
                      <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-[#080B14] shadow-sm" />
                    )}
                  </div>

                  {/* Channel Preview Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <h4 className="font-display text-xs font-black text-white uppercase truncate group-hover:text-rose-400 transition-colors">
                        vs {channel.opponentTeamName}
                      </h4>
                      <span className="font-mono text-[10px] text-slate-400 shrink-0">
                        {channel.lastMessageTime || (channel.isLive ? "Live" : "Scheduled")}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 mb-1.5">
                      <span className="font-mono text-[9px] font-bold px-1.5 py-0.2 rounded bg-[#141A29] text-rose-300 border border-rose-500/30 uppercase">
                        {channel.gameTitle}
                      </span>
                      <span className="font-mono text-[9px] text-slate-400 truncate">
                        {channel.myTeamName}
                      </span>
                    </div>

                    {/* Last message preview */}
                    <p className="font-sans text-[11px] text-slate-400 truncate flex items-center gap-1">
                      {channel.lastMessage ? (
                        <>
                          {channel.lastSender && (
                            <span className="font-bold text-slate-300">
                              {channel.lastSender}:
                            </span>
                          )}
                          <span className="text-slate-300 truncate">{channel.lastMessage}</span>
                        </>
                      ) : (
                        <span className="italic text-slate-500">
                          {channel.isLive ? "Lobby open — click to chat with opponent" : "Scheduled match lobby"}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
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
              onClick={() => loadWarRooms()}
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
            loadWarRooms();
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
