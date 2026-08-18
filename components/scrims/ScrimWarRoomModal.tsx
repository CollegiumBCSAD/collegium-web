"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { ScrimOffer } from "@/types";
import { scrimsService, ScrimChatMessage as ServerChatMessage } from "@/services";
import { getStoredTeams, fetchTeamsApi, Team } from "@/lib/teams";
import { getSocket } from "@/services/socket";

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
  const [lobbyCode, setLobbyCode] = useState("");
  const [isCopied, setIsCopied] = useState(false);
  const [teams, setTeams] = useState<Team[]>(() => getStoredTeams());
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchTeamsApi().then((data) => {
      if (Array.isArray(data) && data.length > 0) {
        setTeams(data);
      }
    });
  }, []);

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

  // Deterministic lobby code shared across ALL players & windows
  useEffect(() => {
    if (!scrim) return;
    const code = getDeterministicLobbyCode(scrim.id, scrim.hostTeamName, scrim.opponentTeamName);
    setLobbyCode(code);
  }, [scrim]);

  // Live War Room chat: history hydration + WebSocket push, no polling
  useEffect(() => {
    if (!isOpen || !scrim) return;

    let isMounted = true;
    const scrimId = scrim.id;

    const systemMsg: ChatMessage = {
      id: `sys-${scrimId}`,
      senderName: "SYSTEM ANNOUNCER",
      teamName: "COLLEGIUM SYSTEM",
      isHostTeam: true,
      message: `🎮 WAR ROOM UNLOCKED! ${scrim.hostTeamName} vs ${scrim.opponentTeamName || "Challenger Squad"}. Use this space to exchange custom lobby IDs and coordinate game servers.`,
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

  // Auto-scroll chat
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
    "⏸️ Pausing for 3 mins, player reconnecting.",
    "⚔️ GLHF! Ready to start map 1.",
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in zoom-in-95 duration-200">
      <div className="w-full max-w-4xl bg-[#11141C] border border-[#1E2433] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Top War Room Header */}
        <div className="p-5 bg-gradient-to-r from-[#171C28] via-[#11141C] to-[#171C28] border-b border-[#1E2433] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF4655] to-[#E63946] flex items-center justify-center text-xl shadow-lg shadow-red-950/40">
              🔥
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display text-base font-extrabold uppercase text-[#F8FAFC]">
                  SCRIM WAR ROOM
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-[#10B981]/20 border border-[#10B981]/40 text-[#34D399] text-[10px] font-sans font-bold uppercase tracking-wider">
                  🟢 MATCH CONFIRMED
                </span>
              </div>
              <p className="text-xs font-sans text-[#64748B]">
                {scrim.gameTitle.toUpperCase()} • {scrim.format} • {scrim.mapPreference || "Ascent"}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-[#1E2433] hover:bg-[#EF4444]/20 text-[#64748B] hover:text-[#F87171] flex items-center justify-center text-sm font-bold transition-all cursor-pointer border border-[#2B3245]"
          >
            ✕
          </button>
        </div>

        {/* Lobby Code & Match Banner */}
        <div className="px-6 py-3 bg-[#090C12] border-b border-[#191D28] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-sans text-[#94A3B8]">Custom Room ID:</span>
            <code className="px-2.5 py-1 rounded-lg bg-[#11141C] border border-[#2B3245] font-mono text-xs font-bold text-[#34D399] tracking-wider">
              {lobbyCode}
            </code>
            <button
              onClick={handleCopyCode}
              className="h-7 px-2.5 rounded-lg bg-[#1E2433] hover:bg-[#2A3142] text-[#E2E8F0] font-sans text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer border border-[#2B3245] flex items-center gap-1"
            >
              {isCopied ? "✓ Copied!" : "📋 Copy Code"}
            </button>
          </div>

          <div className="text-xs font-sans text-[#64748B]">
            📅 Match Schedule:{" "}
            <span className="text-[#E2E8F0] font-semibold">
              {new Date(scrim.scheduledAt).toLocaleDateString()} at{" "}
              {new Date(scrim.scheduledAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>
        </div>

        {/* Middle Split: Teams Roster vs Chat */}
        <div className="grid grid-cols-1 md:grid-cols-3 flex-1 overflow-hidden">
          
          {/* Left 1/3: Squads Roster */}
          <div className="p-5 bg-[#0D1017] border-r border-[#191D28] flex flex-col gap-4 overflow-y-auto">
            {/* Host Squad */}
            <div className="p-3.5 rounded-2xl bg-[#11141C] border border-[#10B981]/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-sans font-extrabold uppercase tracking-widest text-[#10B981]">
                  HOST SQUAD
                </span>
                {isHost && (
                  <span className="px-1.5 py-0.5 rounded bg-[#10B981]/20 text-[#34D399] text-[9px] font-bold">
                    YOUR TEAM
                  </span>
                )}
              </div>
              <h3 className="font-display text-sm font-bold uppercase text-[#F8FAFC]">
                {scrim.hostTeamName}
              </h3>
              <p className="text-[11px] font-sans text-[#64748B]">
                {scrim.universityName}
              </p>

              <div className="pt-2 border-t border-[#1E2433] space-y-1">
                {hostSquad && hostSquad.members && hostSquad.members.length > 0 ? (
                  hostSquad.members.map((m, idx) => {
                    const isCapt = m.userId === hostSquad.captainId || idx === 0;
                    return (
                      <div key={m.id || idx} className="flex items-center justify-between text-xs font-sans text-[#CBD5E1]">
                        <span className={isCapt ? "font-semibold text-[#34D399]" : "text-[#94A3B8]"}>
                          {isCapt ? "👑 " : ""}{m.displayName || m.gameHandle || `Player ${idx + 1}`}
                        </span>
                        <span className="text-[10px] text-[#64748B]">
                          {m.preferredRole || "Varsity"}
                        </span>
                      </div>
                    );
                  })
                ) : (
                  <div className="flex items-center justify-between text-xs font-sans text-[#CBD5E1]">
                    <span className="font-semibold text-[#34D399]">👑 {scrim.hostTeamName} Captain</span>
                    <span className="text-[10px] text-[#64748B]">Varsity</span>
                  </div>
                )}
              </div>
            </div>

            {/* VS Divider */}
            <div className="flex items-center justify-center my-1">
              <span className="px-3 py-1 rounded-full bg-[#1E2433] border border-[#2B3245] font-display text-xs font-extrabold text-[#38BDF8] tracking-widest">
                ⚡ VS ⚡
              </span>
            </div>

            {/* Opponent Squad */}
            <div className="p-3.5 rounded-2xl bg-[#11141C] border border-[#3B82F6]/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-sans font-extrabold uppercase tracking-widest text-[#3B82F6]">
                  CHALLENGER SQUAD
                </span>
                {!isHost && (
                  <span className="px-1.5 py-0.5 rounded bg-[#3B82F6]/20 text-[#60A5FA] text-[9px] font-bold">
                    YOUR TEAM
                  </span>
                )}
              </div>
              <h3 className="font-display text-sm font-bold uppercase text-[#F8FAFC]">
                {scrim.opponentTeamName || "Challenger Squad"}
              </h3>
              <p className="text-[11px] font-sans text-[#64748B]">
                {opponentSquad?.universityName || "Challenger Varsity"}
              </p>

              <div className="pt-2 border-t border-[#1E2433] space-y-1">
                {opponentSquad && opponentSquad.members && opponentSquad.members.length > 0 ? (
                  opponentSquad.members.map((m, idx) => {
                    const isCapt = m.userId === opponentSquad.captainId || idx === 0;
                    return (
                      <div key={m.id || idx} className="flex items-center justify-between text-xs font-sans text-[#CBD5E1]">
                        <span className={isCapt ? "font-semibold text-[#60A5FA]" : "text-[#94A3B8]"}>
                          {isCapt ? "👑 " : ""}{m.displayName || m.gameHandle || `Player ${idx + 1}`}
                        </span>
                        <span className="text-[10px] text-[#64748B]">
                          {m.preferredRole || "Varsity"}
                        </span>
                      </div>
                    );
                  })
                ) : (
                  <div className="flex items-center justify-between text-xs font-sans text-[#CBD5E1]">
                    <span className="font-semibold text-[#60A5FA]">👑 {scrim.opponentTeamName || "Challenger"} Captain</span>
                    <span className="text-[10px] text-[#64748B]">Varsity</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right 2/3: Live Communication Feed */}
          <div className="md:col-span-2 flex flex-col bg-[#11141C]">
            
            {/* Chat Feed */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 min-h-[250px] max-h-[380px]">
              {messages.map((msg) => {
                const isSys = msg.senderName === "SYSTEM ANNOUNCER";
                if (isSys) {
                  return (
                    <div key={msg.id} className="p-3 rounded-xl bg-[#090C12] border border-[#191D28] text-xs font-sans text-[#34D399] leading-relaxed">
                      {msg.message}
                    </div>
                  );
                }

                const isHostMsg = msg.isHostTeam;

                return (
                  <div key={msg.id} className="space-y-1">
                    <div className="flex items-center gap-2 text-[10px] font-sans">
                      <span
                        className={`font-bold uppercase ${
                          isHostMsg ? "text-[#10B981]" : "text-[#3B82F6]"
                        }`}
                      >
                        [{msg.teamName}] {msg.senderName}
                      </span>
                      <span className="text-[#64748B]">
                        {msg.timestamp}
                      </span>
                    </div>

                    <div
                      className={`p-3 rounded-2xl text-xs font-sans max-w-[85%] ${
                        isHostMsg
                          ? "bg-[#0F221B] border border-[#10B981]/30 text-[#E2E8F0] rounded-tl-none"
                          : "bg-[#172554] border border-[#3B82F6]/30 text-[#E2E8F0] rounded-tr-none ml-auto"
                      }`}
                    >
                      {msg.message}
                    </div>
                  </div>
                );
              })}
              <div ref={chatBottomRef} />
            </div>

            {/* Quick Chat Chips */}
            <div className="px-4 py-2 bg-[#090C12] border-t border-[#191D28] flex items-center gap-2 overflow-x-auto no-scrollbar">
              <span className="text-[10px] font-sans text-[#64748B] uppercase shrink-0 font-bold">
                Quick Send:
              </span>
              {quickChats.map((qc, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(qc)}
                  className="px-2.5 py-1 rounded-lg bg-[#181D29] hover:bg-[#252D3F] text-[#94A3B8] hover:text-[#F8FAFC] text-[11px] font-sans transition-all whitespace-nowrap cursor-pointer border border-[#272E3F]"
                >
                  {qc}
                </button>
              ))}
            </div>

            {/* Chat Input Bar */}
            <div className="p-3 bg-[#0D1017] border-t border-[#191D28] flex items-center gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder="Type a message to both teams..."
                className="flex-1 h-10 px-4 rounded-xl bg-[#11141C] border border-[#2B3245] text-xs text-[#F8FAFC] placeholder-[#64748B] focus:outline-none focus:border-[#38BDF8] transition-all font-sans"
              />
              <button
                onClick={() => handleSendMessage()}
                className="h-10 px-5 rounded-xl bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] hover:from-[#3B82F6] hover:to-[#2563EB] text-white font-sans text-xs font-bold uppercase tracking-wider transition-all active:scale-[0.98] cursor-pointer shadow-md shadow-blue-950/40"
              >
                Send 💬
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
