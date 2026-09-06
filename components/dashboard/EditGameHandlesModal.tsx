"use client";

import React, { useState, useEffect } from "react";
import { UserProfile, UserGameHandle } from "@/types";
import { GAMES } from "@/lib/games";
import { authService } from "@/services/authService";
import { useAuth } from "@/context/AuthContext";

interface EditGameHandlesModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
}

const GAME_TITLES = [
  { key: "VALORANT", label: "Valorant", gameId: "valo" },
  { key: "LOL", label: "League of Legends", gameId: "lol" },
  { key: "MLBB", label: "Mobile Legends: BB", gameId: "ml" },
  { key: "CODM", label: "Call of Duty: Mobile", gameId: "codm" },
];

export default function EditGameHandlesModal({
  isOpen,
  onClose,
  user,
}: EditGameHandlesModalProps) {
  const { loginWithToken } = useAuth();
  const [handles, setHandles] = useState<Record<string, string>>(() => {
    const initialMap: Record<string, string> = {};
    if (user?.gameHandles) {
      user.gameHandles.forEach((gh: UserGameHandle) => {
        initialMap[gh.gameTitle] = gh.handle;
      });
    }
    return initialMap;
  });
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [successKey, setSuccessKey] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>("");

  // Modal Lifecycle: Scroll Locking & Escape Key Handler
  useEffect(() => {
    if (!isOpen) return;

    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || user?.role === "ORGANIZER" || user?.role === "ADMIN") return null;

  const handleSave = async (gameTitle: string) => {
    const handle = handles[gameTitle]?.trim();
    if (!handle) return;

    setSavingKey(gameTitle);
    setErrorMsg("");
    setSuccessKey(null);

    try {
      await authService.updateGameHandle(gameTitle, handle);
      setSuccessKey(gameTitle);
      await loginWithToken();
      setTimeout(() => setSuccessKey(null), 3000);
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { message?: string } }; message?: string };
      setErrorMsg(
        errorObj?.response?.data?.message ||
          errorObj?.message ||
          `Failed to update handle for ${gameTitle}.`
      );
    } finally {
      setSavingKey(null);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-[#0F1322] border border-[#232D48] rounded-2xl p-6 sm:p-7 shadow-2xl space-y-6 relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1C2640] pb-4">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-primary-brand block">
              ATHLETE IDENTITY DOSSIER
            </span>
            <h2 className="font-display text-xl font-black uppercase text-white tracking-wide">
              Manage In-Game Names (IGN)
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Modal"
            className="w-8 h-8 rounded-xl border border-[#232D48] bg-[#0A0D18] hover:bg-[#182035] text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer text-sm font-bold"
          >
            ✕
          </button>
        </div>

        <p className="text-xs text-slate-300 font-sans">
          Set your default handle for each title. These will auto-populate when joining rosters, creating teams, or participating in tournaments.
        </p>

        {errorMsg && (
          <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs font-sans">
            {errorMsg}
          </div>
        )}

        {/* List of Game Titles & Handles */}
        <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
          {GAME_TITLES.map(({ key, label, gameId }) => {
            const gameInfo = GAMES[gameId as keyof typeof GAMES] || GAMES.valo;
            const currentVal = handles[key] || "";
            const isSaving = savingKey === key;
            const isSuccess = successKey === key;

            return (
              <div
                key={key}
                className="p-4 rounded-xl bg-[#090C16] border border-[#1C2640] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={gameInfo.image}
                    alt={label}
                    className="w-9 h-9 rounded-lg object-cover border border-[#232D48] shrink-0"
                  />
                  <div>
                    <span className="font-display text-xs font-bold uppercase text-white block">
                      {label}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 block">
                      Title Code: {key}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <input
                    type="text"
                    placeholder="e.g. TenZ#1234"
                    value={currentVal}
                    onChange={(e) =>
                      setHandles((prev) => ({ ...prev, [key]: e.target.value }))
                    }
                    className="flex-1 sm:w-44 h-9 px-3 rounded-lg bg-[#050711] border border-[#1F2B48] text-white text-xs font-mono placeholder:text-slate-600 focus:border-primary-brand focus:outline-none transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => handleSave(key)}
                    disabled={isSaving || !currentVal.trim()}
                    className="h-9 px-3.5 game-theme-btn text-xs font-mono font-bold uppercase tracking-wider shrink-0 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{
                      clipPath:
                        "polygon(4px 0, 100% 0, calc(100% - 4px) 100%, 0 100%)",
                    }}
                  >
                    {isSaving ? "..." : isSuccess ? "Saved ✓" : "Save"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-[#1C2640] flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="h-9 px-5 bg-[#141C30] hover:bg-[#1D2946] border border-[#243356] text-slate-200 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
