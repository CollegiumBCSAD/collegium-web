"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { ScrimOffer } from "@/types";
import { scrimsService, ScrimChatMessage as ServerChatMessage } from "@/services";
import { getStoredTeams, fetchTeamsApi, Team } from "@/lib/teams";
import { getSocket } from "@/services/socket";
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
    "Lobby created! Join code above.",
    "Join our Discord voice channel.",
    "Pausing 3 mins, reconnecting.",
    "GLHF! Ready to start.",
  ];

  const hostInitial = scrim.hostTeamName.charAt(0).toUpperCase();
  const oppInitial = (scrim.opponentTeamName || "C").charAt(0).toUpperCase();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="w-full max-w-4xl bg-[#090D16] border border-[#1E293B] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] relative">
        
        {/* Top Header Navigation Bar */}
        <div className="p-4 sm:p-5 bg-[#0D121F]/95 border-b border-[#1C2538] flex items-center justify-between gap-4 backdrop-blur-md">
          
          {/* Head-to-Head Squad Badge */}
          <div className="flex items-center gap-3">
            <div className="flex items-center -space-x-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-brand to-rose-700 text-white flex items-center justify-center font-display text-sm font-black shadow-md ring-2 ring-[#0D121F]">
                {hostInitial}
              </div>
              <div className="w-9 h-9 rounded-xl bg-[#1A2338] text-white flex items-center justify-center font-display text-sm font-black shadow-md ring-2 ring-[#0D121F] border border-white/10">
                {oppInitial}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display text-sm sm:text-base font-black uppercase text-white tracking-wide">
                  {scrim.hostTeamName} <span className="text-primary-brand">VS</span> {scrim.opponentTeamName || "Challenger"}
                </h2>
                <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-[#141A29] text-slate-300 border border-[#232D44]">
                  {scrim.status === "CONFIRMED" ? "MATCH BOOKED" : "WAR ROOM ACTIVE"}
                </span>
              </div>
              <p className="text-xs font-mono text-slate-400 mt-0.5">
                {scrim.gameTitle.toUpperCase()} · {scrim.format} · MAP: {scrim.mapPreference || "Ascent"}
              </p>
            </div>
          </div>

          {/* Action Controls */}
          <div className="flex items-center gap-2.5">
            <div className="hidden sm:flex items-center gap-2 bg-[#141A29] px-3.5 py-1.5 rounded-xl border border-[#232D44]">
              <span className="text-[10px] font-mono text-slate-400">LOBBY ID:</span>
              <code className="font-mono text-xs font-bold text-white tracking-wider">{lobbyCode}</code>
              <button
                onClick={handleCopyCode}
                className="text-[10px] font-mono font-bold text-primary-brand hover:text-white transition-colors cursor-pointer pl-1"
              >
                {isCopied ? "✓ COPIED" : "COPY"}
              </button>
            </div>

            {/* Lineups Button */}
            <button
              onClick={() => setIsLineupModalOpen(true)}
              className="h-9 px-4 rounded-xl bg-[#141A29] hover:bg-[#1F273D] text-slate-200 border border-[#232D44] font-sans text-xs font-bold uppercase transition-all cursor-pointer flex items-center gap-1.5 shadow-md"
              title="Open Squad Roster Lineups Window"
            >
              <UsersIcon className="w-4 h-4 text-slate-300" />
              <span>Lineups</span>
            </button>

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-[#141A29] hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 flex items-center justify-center text-sm font-bold transition-all cursor-pointer border border-[#232D44]"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Mobile Room Code Bar */}
        <div className="sm:hidden px-4 py-2 bg-[#080C14] border-b border-[#1C2538] flex items-center justify-between text-xs font-mono">
          <span className="text-slate-400">LOBBY CODE: <strong className="text-white font-bold">{lobbyCode}</strong></span>
          <button onClick={handleCopyCode} className="text-primary-brand font-bold">
            {isCopied ? "✓ COPIED" : "COPY CODE"}
          </button>
        </div>

        {/* Tactical Stream & Messages Container */}
        <div className="flex flex-col flex-1 bg-[#060911] overflow-hidden">
          
          {/* Chat Messages Stream */}
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 min-h-[300px] max-h-[460px]">
            {messages.map((msg) => {
              const isSys = msg.senderName === "WAR ROOM SYSTEM" || msg.senderName === "SYSTEM ANNOUNCER";
              if (isSys) {
                return (
                  <div key={msg.id} className="mx-auto max-w-xl p-3.5 rounded-2xl bg-[#0D121F] border border-[#1E293B] text-center text-xs font-mono text-slate-300 leading-relaxed shadow-md my-2">
                    {msg.message}
                  </div>
                );
              }

              const isMyMessage = isHost ? msg.isHostTeam : !msg.isHostTeam;

              return (
                <div key={msg.id} className={`flex flex-col ${isMyMessage ? "items-end" : "items-start"} space-y-1`}>
                  
                  {/* Sender Metadata */}
                  <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400 px-1">
                    <span className="font-bold uppercase text-slate-300">
                      [{msg.teamName}] {msg.senderName}
                    </span>
                    <span>{msg.timestamp}</span>
                  </div>

                  {/* Speech Bubble */}
                  <div className="flex items-end gap-2 max-w-[80%]">
                    {!isMyMessage && (
                      <div className="w-8 h-8 rounded-xl bg-[#141A29] border border-[#232D44] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-md">
                        {msg.teamName.charAt(0).toUpperCase()}
                      </div>
                    )}

                    <div
                      className={`px-4 py-2.5 rounded-2xl text-xs font-sans leading-relaxed shadow-md ${
                        isMyMessage
                          ? "bg-[#1E273A] border border-[#2D3B58] text-white rounded-tr-xs"
                          : "bg-[#0D121F] border border-[#1E293B] text-slate-200 rounded-tl-xs"
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

          {/* Quick Send Chips */}
          <div className="px-4 py-2.5 bg-[#0D121F] border-t border-[#1C2538] flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase shrink-0">
              QUICK SEND:
            </span>
            {quickChats.map((qc, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(qc)}
                className="px-3.5 py-1 rounded-xl bg-[#141A29] hover:bg-[#1F273D] text-slate-300 hover:text-white text-xs font-sans transition-all cursor-pointer border border-[#232D44]"
              >
                {qc}
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <div className="p-4 bg-[#0D121F] border-t border-[#1C2538]">
            <div className="h-12 px-4 rounded-xl bg-[#141A29] border border-[#232D44] flex items-center gap-3 shadow-inner focus-within:border-slate-400 transition-colors">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder="Type a message to both teams..."
                className="flex-1 bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none font-sans"
              />

              <button
                onClick={() => handleSendMessage()}
                className="h-8 px-5 rounded-lg game-theme-btn font-sans text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-md shrink-0 flex items-center gap-1.5"
              >
                <span>Send</span>
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* Roster Lineups Popup Modal */}
      {isLineupModalOpen && (
        <div
          onClick={() => setIsLineupModalOpen(false)}
          className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-3xl bg-[#0D121F] border border-[#1E293B] rounded-3xl shadow-2xl overflow-hidden flex flex-col p-6 sm:p-8 space-y-6 relative"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#1C2538] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#141A29] border border-[#232D44] flex items-center justify-center text-white shadow-md">
                  <UsersIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display text-base font-bold uppercase text-white tracking-wide">
                    VARSITY ATHLETE LINEUPS
                  </h3>
                  <p className="text-xs font-mono text-slate-400">
                    Match Verification · {scrim.gameTitle.toUpperCase()} · {scrim.format}
                  </p>
                </div>
              </div>

              {/* Roster Filter Tabs Switcher */}
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center gap-1 p-1 rounded-xl bg-[#080C14] border border-[#1C2538]">
                  <button
                    onClick={() => setActiveRosterTab("ALL")}
                    className={`px-3 py-1 rounded-lg text-xs font-mono font-bold uppercase transition-all ${
                      activeRosterTab === "ALL"
                        ? "bg-primary-brand text-white shadow-sm"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    BOTH
                  </button>
                  <button
                    onClick={() => setActiveRosterTab("HOST")}
                    className={`px-3 py-1 rounded-lg text-xs font-mono font-bold uppercase transition-all ${
                      activeRosterTab === "HOST"
                        ? "bg-primary-brand text-white shadow-sm"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    HOST
                  </button>
                  <button
                    onClick={() => setActiveRosterTab("CHALLENGER")}
                    className={`px-3 py-1 rounded-lg text-xs font-mono font-bold uppercase transition-all ${
                      activeRosterTab === "CHALLENGER"
                        ? "bg-primary-brand text-white shadow-sm"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    CHALLENGER
                  </button>
                </div>

                <button
                  onClick={() => setIsLineupModalOpen(false)}
                  className="w-9 h-9 rounded-xl bg-[#141A29] hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 flex items-center justify-center text-sm font-bold transition-all cursor-pointer border border-[#232D44]"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Roster Cards Container */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-h-[60vh] overflow-y-auto">
              
              {/* Host Squad Roster Card */}
              {(activeRosterTab === "ALL" || activeRosterTab === "HOST") && (
                <div className="p-5 rounded-2xl bg-[#080C14] border border-[#1C2538] space-y-4 shadow-xl">
                  <div className="flex items-center justify-between border-b border-[#1C2538] pb-3">
                    <div>
                      <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest block">
                        HOST SQUAD
                      </span>
                      <h4 className="font-display text-base font-bold uppercase text-white mt-0.5">
                        {scrim.hostTeamName}
                      </h4>
                      <p className="text-[11px] font-sans text-slate-400">
                        {scrim.universityName || "University of Makati"}
                      </p>
                    </div>

                    {isHost && (
                      <span className="px-2.5 py-1 rounded-full bg-[#141A29] text-slate-300 border border-[#232D44] text-[9px] font-mono font-bold">
                        YOUR SQUAD
                      </span>
                    )}
                  </div>

                  <div className="space-y-2">
                    {hostSquad && hostSquad.members && hostSquad.members.length > 0 ? (
                      hostSquad.members.map((m, idx) => {
                        const isCapt = m.userId === hostSquad.captainId || idx === 0;
                        const initial = (m.displayName || m.gameHandle || "P").charAt(0).toUpperCase();

                        return (
                          <div
                            key={m.id || idx}
                            className="flex items-center justify-between p-3 rounded-xl bg-[#0D121F] border border-[#1E293B] transition-all hover:border-slate-500/40"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-xl bg-[#141A29] text-white flex items-center justify-center font-bold text-xs border border-white/10">
                                {initial}
                              </div>
                              <div>
                                <span className={`text-xs font-sans flex items-center gap-1.5 ${isCapt ? "font-bold text-white" : "text-slate-200"}`}>
                                  {isCapt && <CrownIcon className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                                  <span>{m.displayName || m.gameHandle || `Player ${idx + 1}`}</span>
                                </span>
                                <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1 mt-0.5">
                                  <CheckCircleIcon className="w-3 h-3 text-slate-400" /> Verified Athlete
                                </span>
                              </div>
                            </div>

                            <span className="text-[10px] font-mono text-slate-300 bg-[#141A29] px-2.5 py-1 rounded-lg border border-[#232D44]">
                              {m.preferredRole || "Varsity"}
                            </span>
                          </div>
                        );
                      })
                    ) : (
                      <div className="flex items-center justify-between p-3 rounded-xl bg-[#0D121F] border border-[#1E293B]">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-[#141A29] text-white flex items-center justify-center font-bold text-xs">
                            H
                          </div>
                          <span className="font-bold text-white text-xs flex items-center gap-1.5">
                            <CrownIcon className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                            <span>{scrim.hostTeamName} Captain</span>
                          </span>
                        </div>
                        <span className="text-[10px] font-mono text-slate-300 bg-[#141A29] px-2.5 py-1 rounded-lg border border-[#232D44]">
                          Varsity
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Challenger Squad Roster Card */}
              {(activeRosterTab === "ALL" || activeRosterTab === "CHALLENGER") && (
                <div className="p-5 rounded-2xl bg-[#080C14] border border-[#1C2538] space-y-4 shadow-xl">
                  <div className="flex items-center justify-between border-b border-[#1C2538] pb-3">
                    <div>
                      <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest block">
                        CHALLENGER SQUAD
                      </span>
                      <h4 className="font-display text-base font-bold uppercase text-white mt-0.5">
                        {scrim.opponentTeamName || "Challenger Squad"}
                      </h4>
                      <p className="text-[11px] font-sans text-slate-400">
                        {opponentSquad?.universityName || "Challenger Varsity"}
                      </p>
                    </div>

                    {!isHost && (
                      <span className="px-2.5 py-1 rounded-full bg-[#141A29] text-slate-300 border border-[#232D44] text-[9px] font-mono font-bold">
                        YOUR SQUAD
                      </span>
                    )}
                  </div>

                  <div className="space-y-2">
                    {opponentSquad && opponentSquad.members && opponentSquad.members.length > 0 ? (
                      opponentSquad.members.map((m, idx) => {
                        const isCapt = m.userId === opponentSquad.captainId || idx === 0;
                        const initial = (m.displayName || m.gameHandle || "P").charAt(0).toUpperCase();

                        return (
                          <div
                            key={m.id || idx}
                            className="flex items-center justify-between p-3 rounded-xl bg-[#0D121F] border border-[#1E293B] transition-all hover:border-slate-500/40"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-xl bg-[#141A29] text-white flex items-center justify-center font-bold text-xs border border-white/10">
                                {initial}
                              </div>
                              <div>
                                <span className={`text-xs font-sans flex items-center gap-1.5 ${isCapt ? "font-bold text-white" : "text-slate-200"}`}>
                                  {isCapt && <CrownIcon className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                                  <span>{m.displayName || m.gameHandle || `Player ${idx + 1}`}</span>
                                </span>
                                <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1 mt-0.5">
                                  <CheckCircleIcon className="w-3 h-3 text-slate-400" /> Verified Athlete
                                </span>
                              </div>
                            </div>

                            <span className="text-[10px] font-mono text-slate-300 bg-[#141A29] px-2.5 py-1 rounded-lg border border-[#232D44]">
                              {m.preferredRole || "Varsity"}
                            </span>
                          </div>
                        );
                      })
                    ) : (
                      <div className="flex items-center justify-between p-3 rounded-xl bg-[#0D121F] border border-[#1E293B]">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-[#141A29] text-white flex items-center justify-center font-bold text-xs">
                            C
                          </div>
                          <span className="font-bold text-white text-xs flex items-center gap-1.5">
                            <CrownIcon className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                            <span>{scrim.opponentTeamName || "Challenger"} Captain</span>
                          </span>
                        </div>
                        <span className="text-[10px] font-mono text-slate-300 bg-[#141A29] px-2.5 py-1 rounded-lg border border-[#232D44]">
                          Varsity
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

            </div>

            {/* Bottom Modal Actions */}
            <div className="pt-4 border-t border-[#1C2538] flex items-center justify-end">
              <button
                onClick={() => setIsLineupModalOpen(false)}
                className="h-10 px-6 rounded-xl bg-[#141A29] hover:bg-[#1F273D] text-white font-sans text-xs font-bold uppercase tracking-wider transition-all border border-[#232D44] cursor-pointer"
              >
                Close Lineup Window
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
