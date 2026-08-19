"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { ScrimOffer } from "@/types";
import { scrimsService, ScrimChatMessage as ServerChatMessage } from "@/services";
import { getStoredTeams, fetchTeamsApi, Team } from "@/lib/teams";
import { getSocket } from "@/services/socket";
import { getGameInfo } from "@/lib/games";
import { CrownIcon, CheckCircleIcon, UsersIcon } from "@/components/ui/Icons";

interface ChatMessage {
  id: string;
  senderName: string;
  teamName: string;
  isHostTeam: boolean;
  message: string;
  timestamp: string;
}

interface ScrimWarRoomModalProps {
  scrim: ScrimOffer | null;
  isOpen: boolean;
  onClose: () => void;
  isHost: boolean;
}

function getDeterministicLobbyCode(scrimId: string, hostName: string, opponentName?: string): string {
  const cleanHost = hostName.replace(/[^a-zA-Z]/g, "").substring(0, 4).toUpperCase() || "HOST";
  const cleanOpp = (opponentName || "OPP").replace(/[^a-zA-Z]/g, "").substring(0, 4).toUpperCase();
  let hash = 0;
  for (let i = 0; i < scrimId.length; i++) {
    hash = (hash << 5) - hash + scrimId.charCodeAt(i);
    hash |= 0;
  }
  const codeNum = Math.abs(hash % 9000) + 1000;
  return `${cleanHost}-${cleanOpp}-${codeNum}`;
}

export default function ScrimWarRoomModal({
  scrim,
  isOpen,
  onClose,
  isHost,
}: ScrimWarRoomModalProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isCopied, setIsCopied] = useState(false);
  const [isLineupModalOpen, setIsLineupModalOpen] = useState<boolean>(false);
  const [activeRosterTab, setActiveRosterTab] = useState<"ALL" | "HOST" | "CHALLENGER">("ALL");
  const [teams, setTeams] = useState<Team[]>(() => getStoredTeams());
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchTeamsApi().then((data) => {
      if (Array.isArray(data) && data.length > 0) {
        setTeams(data);
      }
    });
  }, []);

  const game = useMemo(() => {
    return getGameInfo(scrim?.gameTitle || "valo");
  }, [scrim]);

  // Keyboard shortcut to close lineup modal on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (isLineupModalOpen) {
          setIsLineupModalOpen(false);
        } else if (isOpen) {
          onClose();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isLineupModalOpen, isOpen, onClose]);

  const hostSquad = useMemo(() => {
    if (!scrim) return null;
    return teams.find(
      (t) =>
        (scrim.teamId && t.id === scrim.teamId) ||
        t.name.toLowerCase().trim() === scrim.hostTeamName.toLowerCase().trim()
    );
  }, [scrim, teams]);

  const opponentSquad = useMemo(() => {
    if (!scrim) return null;
    return teams.find(
      (t) =>
        (scrim.opponentTeamId && t.id === scrim.opponentTeamId) ||
        (scrim.opponentTeamName && t.name.toLowerCase().trim() === scrim.opponentTeamName.toLowerCase().trim())
    );
  }, [scrim, teams]);

  const lobbyCode = scrim
    ? getDeterministicLobbyCode(scrim.id, scrim.hostTeamName, scrim.opponentTeamName)
    : "";

  useEffect(() => {
    if (!isOpen || !scrim) return;

    let isMounted = true;
    const scrimId = scrim.id;

    const systemMsg: ChatMessage = {
      id: `sys-${scrimId}`,
      senderName: "WAR ROOM SYSTEM",
      teamName: "COLLEGIUM",
      isHostTeam: true,
      message: `WAR ROOM ONLINE · ${scrim.hostTeamName} vs ${scrim.opponentTeamName || "Challenger Squad"}. Exchange lobby codes, coordinate voice channels, and confirm map veto.`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    const formatTime = (rawTime?: string) => {
      if (!rawTime) return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      const date = new Date(rawTime);
      if (isNaN(date.getTime())) return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    };

    const toChatMessage = (raw: ServerChatMessage): ChatMessage => ({
      id: raw.id,
      senderName: raw.senderName,
      teamName: raw.teamName,
      isHostTeam: raw.teamName === scrim.hostTeamName,
      message: raw.text,
      timestamp: formatTime(raw.createdAt),
    });

    const socket = getSocket();

    const handleIncoming = (raw: ServerChatMessage) => {
      if (!isMounted) return;
      const formatted = toChatMessage(raw);
      setMessages((prev) => (prev.some((m) => m.id === formatted.id) ? prev : [...prev, formatted]));
    };

    scrimsService.getScrimChat(scrimId).then((history) => {
      if (!isMounted) return;
      setMessages([systemMsg, ...history.map(toChatMessage)]);
    });

    socket.emit("scrim:join", scrimId);
    socket.on("scrim:message", handleIncoming);

    return () => {
      isMounted = false;
      socket.emit("scrim:leave", scrimId);
      socket.off("scrim:message", handleIncoming);
    };
  }, [isOpen, scrim]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!isOpen || !scrim) return null;

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text) return;

    if (!textToSend) setInputMessage("");

    try {
      await scrimsService.sendScrimChat(scrim.id, text);
    } catch {}
  };

  const handleCopyCode = () => {
    if (!lobbyCode) return;
    navigator.clipboard.writeText(lobbyCode);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const quickChats = [
    "🎮 Lobby created! Join code above.",
    "🎧 Join our Discord voice channel.",
    "⏱️ Pausing 3 mins, reconnecting.",
    "🔥 GLHF! Ready to start.",
  ];

  const hostInitial = scrim.hostTeamName.charAt(0).toUpperCase();
  const oppInitial = (scrim.opponentTeamName || "C").charAt(0).toUpperCase();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-2xl animate-in fade-in duration-200">
      <div className="w-full max-w-4xl bg-gradient-to-b from-[#12182B]/98 via-[#0A0D18]/95 to-[#060812]/98 border border-[#202E4C] rounded-3xl shadow-[0_30px_70px_rgba(0,0,0,0.85)] overflow-hidden flex flex-col max-h-[92vh] relative backdrop-blur-2xl">
        
        {/* Top Glowing Accent Line */}
        <div
          className="absolute top-0 left-0 right-0 h-[2.5px] z-30"
          style={{
            backgroundColor: game.accentColor,
            boxShadow: `0 0 15px ${game.accentColor}`,
          }}
        />

        <div className="p-4 sm:p-5 bg-gradient-to-r from-[#0F1628]/98 via-[#0B101E]/95 to-[#0F1628]/98 border-b border-[#1F2C46] flex items-center justify-between gap-4 backdrop-blur-xl relative z-20 shadow-md">
          <div className="flex items-center gap-3.5">
            <div className="flex items-center -space-x-2.5">
              <div 
                className="w-10 h-10 game-theme-btn text-white flex items-center justify-center font-display text-sm font-black shadow-lg ring-2 ring-[#0D121F] border border-white/20"
                style={{
                  clipPath: "polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)",
                }}
              >
                {hostInitial}
              </div>
              <div 
                className="w-10 h-10 bg-[#141D30] text-white flex items-center justify-center font-display text-sm font-black shadow-lg ring-2 ring-[#0D121F] border border-white/10"
                style={{
                  clipPath: "polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)",
                }}
              >
                {oppInitial}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display text-sm sm:text-base font-black uppercase text-white tracking-wide drop-shadow-sm">
                  {scrim.hostTeamName} <span className="text-primary-brand">VS</span> {scrim.opponentTeamName || "Challenger"}
                </h2>
                <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-[#131A2B] text-emerald-400 border border-emerald-500/30 shadow-sm flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  {scrim.status === "CONFIRMED" ? "MATCH BOOKED" : "WAR ROOM ACTIVE"}
                </span>
              </div>
              <p className="text-xs font-mono text-slate-400 mt-0.5">
                {scrim.gameTitle.toUpperCase()} · {scrim.format} · MAP: {scrim.mapPreference || "Ascent"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="hidden sm:flex items-center gap-2 bg-[#060912] px-3.5 py-1.5 rounded-xl border border-[#1A263E] shadow-inner">
              <span className="text-[10px] font-mono text-slate-400 font-semibold">LOBBY ID:</span>
              <code className="font-mono text-xs font-bold text-white tracking-wider">{lobbyCode}</code>
              <button
                onClick={handleCopyCode}
                className="text-[10px] font-mono font-bold text-primary-brand hover:text-white transition-colors cursor-pointer pl-1"
              >
                {isCopied ? "✓ COPIED" : "COPY"}
              </button>
            </div>

            <button
              onClick={() => setIsLineupModalOpen(true)}
              className="h-9 px-4 rounded-xl bg-[#131A2B] hover:bg-[#1C2740] text-slate-200 border border-[#243350] font-sans text-xs font-bold uppercase transition-all cursor-pointer flex items-center gap-1.5 shadow-md active:scale-95"
              title="Open Squad Roster Lineups Window"
            >
              <UsersIcon className="w-4 h-4 text-slate-300" />
              <span>Lineups</span>
            </button>

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-[#131A2B] hover:bg-rose-950/50 text-slate-400 hover:text-rose-400 flex items-center justify-center text-sm font-bold transition-all cursor-pointer border border-[#243350] shadow-md active:scale-95"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="sm:hidden px-4 py-2 bg-[#060912] border-b border-[#1A263E] flex items-center justify-between text-xs font-mono relative z-20">
          <span className="text-slate-400">LOBBY CODE: <strong className="text-white font-bold">{lobbyCode}</strong></span>
          <button onClick={handleCopyCode} className="text-primary-brand font-bold">
            {isCopied ? "✓ COPIED" : "COPY CODE"}
          </button>
        </div>

        <div className="flex flex-col flex-1 bg-[#050711] overflow-hidden relative z-10 shadow-inner">
          <div className="absolute inset-0 bg-[radial-gradient(#202F4E_1px,transparent_1px)] [background-size:20px_20px] opacity-20 pointer-events-none" />
          <div
            className="absolute inset-0 pointer-events-none opacity-25"
            style={{
              background: `radial-gradient(circle at center, ${game.accentColor}35 0%, transparent 65%)`,
            }}
          />
          <img
            src={game.image}
            alt=""
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 object-cover opacity-[0.08] grayscale pointer-events-none rounded-full blur-[1px]"
          />
          
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 min-h-[300px] max-h-[460px] relative z-10">
            {messages.map((msg) => {
              const isSys = msg.senderName === "WAR ROOM SYSTEM" || msg.senderName === "SYSTEM ANNOUNCER";
              if (isSys) {
                return (
                  <div key={msg.id} className="mx-auto max-w-xl p-4 rounded-2xl bg-[#0C1322]/95 border border-[#213254] text-center text-xs font-mono text-slate-200 leading-relaxed shadow-xl backdrop-blur-xl relative z-10 my-3">
                    <div className="flex items-center justify-center gap-2 mb-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-[10px] font-mono font-bold tracking-widest text-emerald-400 uppercase">TACTICAL WAR ROOM ENCRYPTED</span>
                    </div>
                    {msg.message}
                  </div>
                );
              }

              const isMyMessage = isHost ? msg.isHostTeam : !msg.isHostTeam;

              return (
                <div key={msg.id} className={`flex flex-col ${isMyMessage ? "items-end" : "items-start"} space-y-1 relative z-10`}>
                  <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400 px-1">
                    <span className="font-bold uppercase text-slate-300">
                      [{msg.teamName}] {msg.senderName}
                    </span>
                    <span>{msg.timestamp}</span>
                  </div>

                  <div className="flex items-end gap-2 max-w-[80%]">
                    {!isMyMessage && (
                      <div className="w-8 h-8 rounded-xl bg-[#131A2B] border border-[#243350] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-md">
                        {msg.teamName.charAt(0).toUpperCase()}
                      </div>
                    )}

                    <div
                      className={`px-4 py-2.5 rounded-2xl text-xs font-sans leading-relaxed shadow-md ${
                        isMyMessage
                          ? "bg-gradient-to-br from-[#18233C] to-[#0E1626] border border-primary-brand/50 text-white rounded-tr-xs shadow-[0_4px_16px_rgba(0,0,0,0.5)] font-medium"
                          : "bg-[#0E1524] border border-[#1E2C48] text-slate-200 shadow-md backdrop-blur-md rounded-tl-xs font-medium"
                      }`}
                    >
                      {msg.message}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={chatBottomRef} />
          </div>

          <div className="p-4 bg-[#080C16] border-t border-[#182338] relative z-10 flex items-center gap-3">
            <input
              type="text"
              placeholder={`Transmit tactical dispatch to ${scrim.opponentTeamName || "Challenger"}...`}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSendMessage();
              }}
              className="flex-1 h-11 px-4 bg-[#050811] border border-[#1E293B] text-white text-xs font-sans placeholder-slate-500 focus:outline-none focus:border-primary-brand rounded-xl"
            />
            <button
              onClick={() => handleSendMessage()}
              className="h-11 px-6 game-theme-btn font-display text-xs font-black uppercase tracking-wider rounded-xl shadow-lg cursor-pointer"
            >
              <span>Send</span>
            </button>
          </div>
        </div>
      </div>

      {isLineupModalOpen && (
        <div
          onClick={() => setIsLineupModalOpen(false)}
          className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/85 backdrop-blur-2xl animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-4xl bg-[#080C16] border border-[#1E293B] shadow-2xl overflow-hidden flex flex-col p-6 sm:p-8 space-y-6 relative"
            style={{
              clipPath: "polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px))",
            }}
          >
            <div 
              className="absolute top-0 left-0 right-0 h-[2px]"
              style={{
                background: "linear-gradient(90deg, transparent 0%, var(--primary-brand) 50%, transparent 100%)",
                boxShadow: "0 0 12px var(--primary-brand)",
              }}
            />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#182338] pb-4 gap-4">
              <div className="flex items-center gap-3.5">
                <div 
                  className="w-10 h-10 bg-[#141A29] border border-[#232D44] flex items-center justify-center text-white shadow-md shrink-0"
                  style={{
                    clipPath: "polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)",
                  }}
                >
                  <UsersIcon className="w-5 h-5 text-primary-brand" />
                </div>
                <div>
                  <h3 className="font-display text-lg sm:text-xl font-black uppercase text-white tracking-wider flex items-center gap-2">
                    <span>VARSITY ATHLETE LINEUPS</span>
                  </h3>
                  <p className="text-[11px] font-mono text-slate-400 flex items-center gap-2 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>MATCH ROSTER VERIFICATION</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 shrink-0">
                <div 
                  className="flex items-center gap-1 p-1 bg-[#050811] border border-[#1C2538] shadow-inner"
                  style={{
                    clipPath: "polygon(4px 0, 100% 0, calc(100% - 4px) 100%, 0 100%)",
                  }}
                >
                  <button onClick={() => setActiveRosterTab("ALL")} className={`px-3 py-1 font-mono text-[10px] font-black uppercase transition-all ${activeRosterTab === "ALL" ? "game-theme-btn" : "text-slate-400"}`}>BOTH</button>
                  <button onClick={() => setActiveRosterTab("HOST")} className={`px-3 py-1 font-mono text-[10px] font-black uppercase transition-all ${activeRosterTab === "HOST" ? "game-theme-btn" : "text-slate-400"}`}>HOST</button>
                  <button onClick={() => setActiveRosterTab("CHALLENGER")} className={`px-3 py-1 font-mono text-[10px] font-black uppercase transition-all ${activeRosterTab === "CHALLENGER" ? "game-theme-btn" : "text-slate-400"}`}>CHALLENGER</button>
                </div>

                <button onClick={() => setIsLineupModalOpen(false)} className="w-8 h-8 bg-[#141A29] text-slate-400 flex items-center justify-center text-xs font-bold border border-[#232D44]" aria-label="Close modal">✕</button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-h-[62vh] overflow-y-auto pr-1">
              {(activeRosterTab === "ALL" || activeRosterTab === "HOST") && (
                <div 
                  className="p-4 sm:p-5 bg-[#060912] border border-[#182338] space-y-4 shadow-xl relative overflow-hidden flex flex-col justify-between"
                  style={{
                    clipPath: "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))",
                  }}
                >
                  <div className="flex items-center justify-between border-b border-[#141A29] pb-3">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-10 h-10 bg-gradient-to-br from-primary-brand to-[#101524] text-white flex items-center justify-center font-display text-xs font-black shadow-md border border-white/20 shrink-0"
                        style={{
                          clipPath: "polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)",
                        }}
                      >
                        {scrim.hostTeamName.slice(0, 3).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[8px] font-mono font-black text-primary-brand uppercase tracking-widest block">HOST SQUAD</span>
                          <span className="text-[9px] font-mono text-slate-400">({hostSquad?.members?.length || 1} { (hostSquad?.members?.length || 1) === 1 ? "Athlete" : "Athletes"})</span>
                        </div>
                        <h4 className="font-display text-base font-black uppercase text-white tracking-wide">{scrim.hostTeamName}</h4>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 flex-1">
                    {hostSquad && hostSquad.members && hostSquad.members.length > 0 ? (
                      hostSquad.members.map((m, idx) => {
                        const isCapt = m.userId === hostSquad.captainId || idx === 0;
                        const name = m.displayName || m.gameHandle || `Player ${idx + 1}`;
                        const initial = name.charAt(0).toUpperCase();
                        return (
                          <div key={m.id || idx} className="group flex items-center justify-between p-2.5 bg-[#0A0E1A] border border-[#182338]" style={{ clipPath: "polygon(4px 0, 100% 0, calc(100% - 4px) 100%, 0 100%)" }}>
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="w-7 h-7 bg-[#141A29] text-white flex items-center justify-center font-display text-[10px] font-black border border-white/10 shrink-0" style={{ clipPath: "polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)" }}>{initial}</div>
                              <div className="min-w-0">
                                <span className={`text-xs font-display font-black tracking-wide flex items-center gap-1.5 truncate ${isCapt ? "text-amber-400" : "text-white"}`}>
                                  {isCapt && <CrownIcon className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                                  <span className="truncate">{name}</span>
                                </span>
                              </div>
                            </div>
                            <span className="text-[9px] font-mono font-black uppercase px-2 py-0.5 bg-[#121828] border border-[#243350] text-slate-300">{m.preferredRole || (isCapt ? "Duelist" : "Varsity")}</span>
                          </div>
                        );
                      })
                    ) : (
                      <div className="group flex items-center justify-between p-2.5 bg-[#0A0E1A] border border-[#182338]" style={{ clipPath: "polygon(4px 0, 100% 0, calc(100% - 4px) 100%, 0 100%)" }}>
                        <span className="text-amber-400 text-xs">Captain: {scrim.hostTeamName}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {(activeRosterTab === "ALL" || activeRosterTab === "CHALLENGER") && (
                <div 
                  className="p-4 sm:p-5 bg-[#060912] border border-[#182338] space-y-4 shadow-xl relative overflow-hidden flex flex-col justify-between"
                  style={{
                    clipPath: "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))",
                  }}
                >
                  <div className="flex items-center justify-between border-b border-[#141A29] pb-3">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-10 h-10 bg-[#141A29] text-slate-200 flex items-center justify-center font-display text-xs font-black shadow-md border border-[#232D44] shrink-0"
                        style={{
                          clipPath: "polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)",
                        }}
                      >
                        {(scrim.opponentTeamName || "CHAL").slice(0, 3).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[8px] font-mono font-black text-slate-400 uppercase tracking-widest block">CHALLENGER SQUAD</span>
                          <span className="text-[9px] font-mono text-slate-400">({opponentSquad?.members?.length || 1} { (opponentSquad?.members?.length || 1) === 1 ? "Athlete" : "Athletes"})</span>
                        </div>
                        <h4 className="font-display text-base font-black uppercase text-white tracking-wide">{scrim.opponentTeamName || "Challenger Squad"}</h4>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 flex-1">
                    {opponentSquad && opponentSquad.members && opponentSquad.members.length > 0 ? (
                      opponentSquad.members.map((m, idx) => {
                        const isCapt = m.userId === opponentSquad.captainId || idx === 0;
                        const name = m.displayName || m.gameHandle || `Player ${idx + 1}`;
                        const initial = name.charAt(0).toUpperCase();
                        return (
                          <div key={m.id || idx} className="group flex items-center justify-between p-2.5 bg-[#0A0E1A] border border-[#182338]" style={{ clipPath: "polygon(4px 0, 100% 0, calc(100% - 4px) 100%, 0 100%)" }}>
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="w-7 h-7 bg-[#141A29] text-white flex items-center justify-center font-display text-[10px] font-black border border-white/10 shrink-0" style={{ clipPath: "polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)" }}>{initial}</div>
                              <div className="min-w-0">
                                <span className={`text-xs font-display font-black tracking-wide flex items-center gap-1.5 truncate ${isCapt ? "text-amber-400" : "text-white"}`}>
                                  {isCapt && <CrownIcon className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                                  <span className="truncate">{name}</span>
                                </span>
                              </div>
                            </div>
                            <span className="text-[9px] font-mono font-black uppercase px-2 py-0.5 bg-[#121828] border border-[#243350] text-slate-300">{m.preferredRole || (isCapt ? "Duelist" : "Varsity")}</span>
                          </div>
                        );
                      })
                    ) : (
                      <div className="group flex items-center justify-between p-2.5 bg-[#0A0E1A] border border-[#182338]" style={{ clipPath: "polygon(4px 0, 100% 0, calc(100% - 4px) 100%, 0 100%)" }}>
                        <span className="text-amber-400 text-xs">Captain: {scrim.opponentTeamName || "Challenger"}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-[#182338] flex items-center justify-between gap-4">
              <span className="text-[10px] font-mono text-slate-400">Verified athletes under collegiate eligibility standards.</span>
              <button onClick={() => setIsLineupModalOpen(false)} className="h-10 px-6 game-theme-btn text-xs font-black uppercase tracking-wider cursor-pointer" style={{ clipPath: "polygon(6px 0, 100% 0, calc(100% - 6px) 100%, 0 100%)" }}>Close Lineup Window</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
