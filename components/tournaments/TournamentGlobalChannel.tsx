"use client";

import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { tournamentsService } from "@/services/tournamentsService";
import { getSocket } from "@/services/socket";
import { CrownIcon, ShieldIcon, ZapIcon, TrashIcon } from "@/components/ui/Icons";

export interface TournamentChatMessage {
  id: string;
  tournamentId: string;
  senderId: string;
  senderName: string;
  teamName?: string;
  text: string;
  isPinned: boolean;
  isAnnouncement: boolean;
  createdAt: string;
}

interface TournamentGlobalChannelProps {
  tournamentId: string;
  tournamentTitle?: string;
  isOrganizerOrAdmin?: boolean;
}

export default function TournamentGlobalChannel({
  tournamentId,
  tournamentTitle = "Collegiate Tournament",
  isOrganizerOrAdmin = false,
}: TournamentGlobalChannelProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<TournamentChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [isAnnouncement, setIsAnnouncement] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);

  // Editing state for organizers adjusting announcements
  const [editingMsgId, setEditingMsgId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [editIsPinned, setEditIsPinned] = useState(false);
  const [editIsAnnouncement, setEditIsAnnouncement] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isOrganizer = isOrganizerOrAdmin || user?.role === "ORGANIZER" || user?.role === "ADMIN";

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (!tournamentId) return;
    let isMounted = true;

    // Load message history from REST API
    tournamentsService
      .getTournamentMessages(tournamentId)
      .then((history) => {
        if (isMounted) {
          setMessages(history || []);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setMessages([]);
          setIsLoading(false);
        }
      });

    // Connect to Socket.io tournament room
    const socket = getSocket();
    socket.emit("tournament:join", tournamentId);

    const handleNewMessage = (msg: TournamentChatMessage) => {
      if (!isMounted) return;
      setMessages((prev) => {
        if (prev.some((m) => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
    };

    const handleMessageUpdated = (updated: TournamentChatMessage) => {
      if (!isMounted) return;
      setMessages((prev) =>
        prev.map((m) => (m.id === updated.id ? { ...m, ...updated } : m))
      );
    };

    const handleMessageDeleted = ({ messageId }: { messageId: string }) => {
      if (!isMounted) return;
      setMessages((prev) => prev.filter((m) => m.id !== messageId));
    };

    socket.on("tournament:new_message", handleNewMessage);
    socket.on("tournament:message_updated", handleMessageUpdated);
    socket.on("tournament:message_deleted", handleMessageDeleted);

    return () => {
      isMounted = false;
      socket.emit("tournament:leave", tournamentId);
      socket.off("tournament:new_message", handleNewMessage);
      socket.off("tournament:message_updated", handleMessageUpdated);
      socket.off("tournament:message_deleted", handleMessageDeleted);
    };
  }, [tournamentId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = inputText.trim();
    if (!text || isSending) return;

    setIsSending(true);
    try {
      const created = (await tournamentsService.createTournamentMessage(tournamentId, {
        text,
        isAnnouncement: isOrganizer ? isAnnouncement : false,
        isPinned: isOrganizer ? isPinned : false,
      })) as TournamentChatMessage;

      if (created && created.id) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === created.id)) return prev;
          return [...prev, created];
        });
      }

      setInputText("");
      setIsAnnouncement(false);
      setIsPinned(false);
    } catch (err) {
      console.error("Failed to send tournament message:", err);
    } finally {
      setIsSending(false);
    }
  };

  const handleStartEdit = (msg: TournamentChatMessage) => {
    setEditingMsgId(msg.id);
    setEditText(msg.text);
    setEditIsPinned(msg.isPinned);
    setEditIsAnnouncement(msg.isAnnouncement);
  };

  const handleCancelEdit = () => {
    setEditingMsgId(null);
    setEditText("");
  };

  const handleSaveEdit = async (msgId: string) => {
    const text = editText.trim();
    if (!text) return;
    try {
      await tournamentsService.updateTournamentMessage(tournamentId, msgId, {
        text,
        isPinned: editIsPinned,
        isAnnouncement: editIsAnnouncement,
      });

      setMessages((prev) =>
        prev.map((m) =>
          m.id === msgId
            ? { ...m, text, isPinned: editIsPinned, isAnnouncement: editIsAnnouncement }
            : m
        )
      );
      setEditingMsgId(null);
    } catch (err) {
      console.error("Failed to update tournament message:", err);
    }
  };

  const handleDeleteMessage = async (msgId: string) => {
    if (!confirm("Delete this tournament message?")) return;
    try {
      await tournamentsService.deleteTournamentMessage(tournamentId, msgId);
      setMessages((prev) => prev.filter((m) => m.id !== msgId));
    } catch (err) {
      console.error("Failed to delete message:", err);
    }
  };

  const pinnedAnnouncements = messages.filter((m) => m.isPinned);

  return (
    <div className="flex flex-col h-full bg-[#070A12] border border-[#182338] rounded-xl overflow-hidden shadow-2xl">
      {/* Top Channel Header Bar */}
      <div className="px-5 py-3.5 bg-[#0A0D18] border-b border-[#182338] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <div>
            <h4 className="font-display text-sm font-black uppercase text-white tracking-wide">
              Global Tournament Channel
            </h4>
            <p className="font-mono text-[10px] text-slate-400">
              Centralized text & official bulletins for {tournamentTitle}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isOrganizer && (
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/15 border border-amber-500/30 text-amber-300 font-bold uppercase flex items-center gap-1">
              <CrownIcon className="w-3 h-3 text-amber-400" />
              <span>Organizer Controls Active</span>
            </span>
          )}
          <span className="text-[10px] font-mono text-slate-500">
            {messages.length} Messages
          </span>
        </div>
      </div>

      {/* Pinned Announcements High-Priority Banner */}
      {pinnedAnnouncements.length > 0 && (
        <div className="bg-[#0D1222] border-b border-amber-500/30 p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-amber-400 flex items-center gap-1.5">
              <ZapIcon className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span>PINNED OFFICIAL ANNOUNCEMENT</span>
            </span>
            <span className="text-[9px] font-mono text-amber-500/70">
              {pinnedAnnouncements.length} Pinned
            </span>
          </div>

          <div className="space-y-2">
            {pinnedAnnouncements.map((pinned) => (
              <div
                key={`pinned-${pinned.id}`}
                className="p-3 bg-amber-950/20 border border-amber-500/40 rounded-lg flex items-start justify-between gap-3"
              >
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] font-bold text-amber-300 uppercase">
                      {pinned.senderName}
                    </span>
                    <span className="text-[9px] font-mono text-slate-500">
                      {new Date(pinned.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <p className="font-sans text-xs text-slate-100 whitespace-pre-wrap leading-relaxed">
                    {pinned.text}
                  </p>
                </div>

                {isOrganizer && (
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleStartEdit(pinned)}
                      className="px-2 py-0.5 text-[9px] font-mono font-bold uppercase bg-[#141A29] hover:bg-amber-950/40 text-amber-400 border border-amber-500/40 rounded transition-colors cursor-pointer"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        tournamentsService
                          .updateTournamentMessage(tournamentId, pinned.id, { isPinned: false })
                          .then(() =>
                            setMessages((prev) =>
                              prev.map((m) => (m.id === pinned.id ? { ...m, isPinned: false } : m))
                            )
                          )
                      }
                      className="px-2 py-0.5 text-[9px] font-mono text-slate-400 hover:text-white bg-[#141A29] rounded transition-colors cursor-pointer"
                    >
                      Unpin
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Message Stream */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {isLoading ? (
          <div className="text-center py-16 text-xs font-mono text-slate-500 animate-pulse">
            Connecting to tournament frequency...
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-16 space-y-2">
            <ShieldIcon className="w-8 h-8 text-slate-600 mx-auto" />
            <h5 className="font-display text-xs font-bold uppercase text-slate-400">
              Tournament Channel Online
            </h5>
            <p className="font-sans text-[11px] text-slate-500 max-w-sm mx-auto">
              Welcome to the central tournament feed. Organizers can broadcast announcements, and teams can coordinate directly here.
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isEditing = editingMsgId === msg.id;

            return (
              <div
                key={msg.id}
                className={`p-3 rounded-lg transition-colors ${
                  msg.isAnnouncement
                    ? "bg-amber-950/20 border border-amber-500/40"
                    : "bg-[#0B101E] border border-[#162032] hover:border-[#22314E]"
                }`}
              >
                {/* Header info */}
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`font-display text-xs font-bold uppercase ${
                        msg.isAnnouncement ? "text-amber-400" : "text-white"
                      }`}
                    >
                      {msg.senderName}
                    </span>

                    {msg.teamName && (
                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700">
                        {msg.teamName}
                      </span>
                    )}

                    {msg.isAnnouncement && (
                      <span className="text-[9px] font-mono font-bold uppercase px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        Announcement
                      </span>
                    )}

                    {msg.isPinned && (
                      <span className="text-[9px] font-mono font-bold uppercase px-1.5 py-0.2 rounded bg-cyan-950/60 text-cyan-300 border border-cyan-500/30">
                        Pinned
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-slate-500">
                      {new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>

                    {isOrganizer && !isEditing && (
                      <div className="flex items-center gap-1 opacity-70 hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={() => handleStartEdit(msg)}
                          className="text-[10px] font-mono text-slate-400 hover:text-amber-400 px-1 py-0.5 transition-colors cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteMessage(msg.id)}
                          className="text-[10px] font-mono text-slate-400 hover:text-rose-400 px-1 py-0.5 transition-colors cursor-pointer"
                        >
                          <TrashIcon className="w-3 h-3 inline" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Content or Edit Box */}
                {isEditing ? (
                  <div className="mt-2 space-y-2 bg-[#060912] p-3 rounded-lg border border-amber-500/40">
                    <textarea
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      rows={3}
                      className="w-full bg-[#0A0D18] border border-[#1E293B] rounded p-2 text-xs font-sans text-white focus:outline-none focus:border-amber-500 resize-none"
                    />

                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-4 text-xs font-mono">
                        <label className="flex items-center gap-1.5 text-slate-300 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={editIsAnnouncement}
                            onChange={(e) => setEditIsAnnouncement(e.target.checked)}
                            className="rounded border-slate-700 bg-slate-900 text-amber-500 focus:ring-0"
                          />
                          <span>Announcement</span>
                        </label>

                        <label className="flex items-center gap-1.5 text-slate-300 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={editIsPinned}
                            onChange={(e) => setEditIsPinned(e.target.checked)}
                            className="rounded border-slate-700 bg-slate-900 text-amber-500 focus:ring-0"
                          />
                          <span>Pinned</span>
                        </label>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleCancelEdit}
                          className="px-3 py-1 bg-[#141A29] text-slate-300 rounded text-xs font-mono cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSaveEdit(msg.id)}
                          className="px-3 py-1 bg-amber-600 hover:bg-amber-500 text-white rounded text-xs font-mono font-bold uppercase cursor-pointer"
                        >
                          Save Changes
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="font-sans text-xs text-slate-200 whitespace-pre-wrap leading-relaxed">
                    {msg.text}
                  </p>
                )}
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Composition Input Form */}
      <form
        onSubmit={handleSendMessage}
        className="p-3 bg-[#0A0E1A] border-t border-[#182338] space-y-2.5"
      >
        {isOrganizer && (
          <div className="flex items-center gap-4 px-1 text-xs font-mono">
            <label className="flex items-center gap-1.5 text-amber-400 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isAnnouncement}
                onChange={(e) => setIsAnnouncement(e.target.checked)}
                className="rounded border-amber-500/50 bg-amber-950/40 text-amber-500 focus:ring-0 cursor-pointer"
              />
              <span className="font-bold">Broadcast Announcement</span>
            </label>

            <label className="flex items-center gap-1.5 text-cyan-400 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isPinned}
                onChange={(e) => setIsPinned(e.target.checked)}
                className="rounded border-cyan-500/50 bg-cyan-950/40 text-cyan-500 focus:ring-0 cursor-pointer"
              />
              <span className="font-bold">Pin to Top Banner</span>
            </label>
          </div>
        )}

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={
              isAnnouncement
                ? "Type official tournament announcement..."
                : "Type message to global tournament channel..."
            }
            className={`flex-1 h-10 px-3.5 rounded-lg bg-[#070912] border text-xs font-sans text-white focus:outline-none transition-colors ${
              isAnnouncement
                ? "border-amber-500/50 focus:border-amber-400 placeholder:text-amber-500/40"
                : "border-[#1E293B] focus:border-primary-brand placeholder:text-slate-500"
            }`}
          />

          <button
            type="submit"
            disabled={!inputText.trim() || isSending}
            className={`h-10 px-5 rounded-lg font-mono text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-40 cursor-pointer flex items-center gap-1.5 ${
              isAnnouncement
                ? "bg-amber-600 hover:bg-amber-500 text-white shadow-md shadow-amber-900/30"
                : "bg-primary-brand hover:bg-rose-500 text-white shadow-md"
            }`}
          >
            <span>{isSending ? "Posting..." : isAnnouncement ? "Broadcast" : "Send"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
