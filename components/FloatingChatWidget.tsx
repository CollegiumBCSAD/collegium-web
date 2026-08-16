"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useGame } from "@/context/GameContext";

export default function FloatingChatWidget() {
  const { user, isLoggedIn, isLoaded } = useAuth();
  const { selectedGame } = useGame();
  const [isOpen, setIsOpen] = useState(false);

  const isLightAccent = selectedGame === "codm";
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "Isiah Baldesco (UMAK)",
      text: "Hey everyone! Any teams available for VALORANT BO3 scrim tonight at 8 PM?",
      time: "7:12 PM",
      isMe: false,
    },
    {
      id: 2,
      sender: "You",
      text: "We might be available after our draft practice!",
      time: "7:14 PM",
      isMe: true,
    },
    {
      id: 3,
      sender: "UST Captain",
      text: "We can take that slot if you guys want Ascendant+ lobby.",
      time: "7:18 PM",
      isMe: false,
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");

  if (!isLoaded) return null;

  // Do not render for guests (unauthenticated or GUEST role) or admins (ADMIN role)
  if (!isLoggedIn || !user) return null;

  const roleUpper = user.role?.toUpperCase() || "";
  if (roleUpper === "ADMIN" || roleUpper === "GUEST") return null;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        sender: "You",
        text: inputMessage.trim(),
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        isMe: true,
      },
    ]);
    setInputMessage("");
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {isOpen && (
        <div className="mb-4 w-80 sm:w-96 bg-card-bg border border-raised-panel rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[420px] transition-all animate-in fade-in slide-in-from-bottom-5">
          {/* Header */}
          <div className="p-4 bg-raised-panel border-b border-panel-border flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-success" />
              </div>
              <div>
                <h4 className="font-display text-sm font-bold uppercase text-foreground tracking-wide">
                  Circuit Athlete Chat
                </h4>
                <span className="text-[10px] font-sans text-secondary-text block">
                  {user.university?.name || "Collegiate Hub"} · {user.displayName}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="w-7 h-7 rounded-lg hover:bg-white/10 text-secondary-text hover:text-foreground flex items-center justify-center text-sm transition-colors cursor-pointer"
              title="Close chat"
            >
              ✕
            </button>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-background/50 text-xs font-sans">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${m.isMe ? "items-end" : "items-start"}`}
              >
                <span className="text-[10px] text-secondary-text mb-1 px-1">
                  {m.sender} · {m.time}
                </span>
                <div
                  className={`p-3 rounded-xl max-w-[85%] leading-relaxed ${
                    m.isMe
                      ? "game-theme-btn rounded-tr-none shadow-md"
                      : "bg-raised-panel text-foreground border border-panel-border rounded-tl-none"
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
          </div>

          {/* Input Form */}
          <form onSubmit={handleSend} className="p-3 bg-card-bg border-t border-panel-border flex gap-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Message collegiate athletes..."
              className="flex-1 h-9 px-3 rounded-lg bg-background border border-panel-border text-foreground text-xs font-sans focus:outline-none focus:border-primary-brand transition-colors"
            />
            <button
              type="submit"
              className="h-9 px-4 rounded-lg game-theme-btn font-sans text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
            >
              Send
            </button>
          </form>
        </div>
      )}

      {/* Floating Action Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full game-theme-btn shadow-2xl flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer border-2 border-white/20 relative group"
        title="Athlete Chat"
        aria-label="Open Athlete Chat"
      >
        <svg
          className={`w-7 h-7 fill-current transition-transform group-hover:scale-110 ${
            isLightAccent ? "text-[#0A0C10]" : "text-white"
          }`}
          viewBox="0 0 24 24"
        >
          <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 9h12v2H6V9zm8 5H6v-2h8v2zm4-6H6V6h12v2z" />
        </svg>
        <span className="absolute top-0.5 right-0.5 w-3.5 h-3.5 bg-success rounded-full border-2 border-background" />
      </button>
    </div>
  );
}
