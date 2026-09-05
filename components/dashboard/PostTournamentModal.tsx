"use client";

import React, { useState, useEffect } from "react";
import { useGame } from "@/context/GameContext";
import { TrophyIcon, ShieldIcon, AlertTriangleIcon, ClockIcon, PlusIcon } from "@/components/ui/Icons";
import { tournamentsService } from "@/services/tournamentsService";
import { Tournament } from "@/types";
import CyberDateTimePicker from "@/components/ui/CyberDateTimePicker";

const GAME_ID_TO_ENUM: Record<string, string> = {
  valo: "VALORANT",
  lol: "LOL",
  ml: "MLBB",
  codm: "CODM",
};

interface PostTournamentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTournamentCreated: () => void;
  initialTournament?: Tournament | null;
}

export default function PostTournamentModal({
  isOpen,
  onClose,
  onTournamentCreated,
  initialTournament,
}: PostTournamentModalProps) {
  const { selectedGame } = useGame();
  const isEditing = Boolean(initialTournament?.id);
  const isRejected = initialTournament?.status === "REJECTED";

  const [selectedGameTitle, setSelectedGameTitle] = useState<string>("VALORANT");
  const [name, setName] = useState("");
  const [format, setFormat] = useState("Single Elimination");
  const [teamQuota, setTeamQuota] = useState("8 Universities");
  const [rules, setRules] = useState("");
  const [startDate, setStartDate] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Sync form state when modal opens or target tournament changes
  const [prevModalKey, setPrevModalKey] = useState<string | null>(null);
  const currentModalKey = isOpen ? `${initialTournament?.id || "new"}-${selectedGame || "none"}` : null;

  if (prevModalKey !== currentModalKey) {
    setPrevModalKey(currentModalKey);
    if (initialTournament && isOpen) {
      setName(initialTournament.title || "");
      setSelectedGameTitle(
        initialTournament.gameTitle ||
        (initialTournament.game ? GAME_ID_TO_ENUM[initialTournament.game.toLowerCase()] : "VALORANT") ||
        "VALORANT"
      );
      setFormat(initialTournament.bracketFormat || "Single Elimination");
      setTeamQuota(
        initialTournament.teamQuota ? `${initialTournament.teamQuota} Universities` : "8 Universities"
      );
      setRules(initialTournament.rules || "");
      if (initialTournament.startDate) {
        try {
          const d = new Date(initialTournament.startDate);
          const localIso = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
            .toISOString()
            .slice(0, 16);
          setStartDate(localIso);
        } catch {
          setStartDate("");
        }
      } else {
        setStartDate("");
      }
      setImagePreview(initialTournament.image || "");
      setImageFile(null);
    } else if (isOpen) {
      setName("");
      setSelectedGameTitle(
        selectedGame ? GAME_ID_TO_ENUM[selectedGame] || "VALORANT" : "VALORANT"
      );
      setFormat("Single Elimination");
      setTeamQuota("8 Universities");
      setRules("");
      setStartDate("");
      setImagePreview("");
      setImageFile(null);
    }
    setErrorMsg("");
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImagePreview(URL.createObjectURL(file));
    setImageFile(file);
  };

  const handleRemoveImage = () => {
    setImagePreview("");
    setImageFile(null);
  };

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    const prevBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = prevBodyOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    setErrorMsg("");

    try {
      const quotaNum = parseInt(teamQuota, 10) || undefined;
      const startDateIso = startDate ? new Date(startDate).toISOString() : undefined;

      if (isEditing && initialTournament) {
        await tournamentsService.updateTournament(initialTournament.id, {
          name: name.trim(),
          gameTitle: selectedGameTitle,
          imageFile: imageFile || undefined,
          bracketFormat: format,
          teamQuota: quotaNum,
          rules: rules.trim() || undefined,
          startDate: startDateIso,
          reapply: isRejected,
        });
      } else {
        await tournamentsService.createTournament({
          name: name.trim(),
          gameTitle: selectedGameTitle,
          imageFile: imageFile || undefined,
          bracketFormat: format,
          teamQuota: quotaNum,
          rules: rules.trim() || undefined,
          startDate: startDateIso,
        });
      }

      onTournamentCreated();
      onClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to process tournament request. Please try again.";
      setErrorMsg(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
    >
      <div
        className="w-full max-w-xl bg-[#0A0D18] border border-amber-500/40 shadow-2xl p-6 sm:p-8 space-y-6 relative rounded-3xl backdrop-blur-2xl my-auto text-white"
        style={{
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.9), 0 0 30px rgba(245, 158, 11, 0.15)",
        }}
      >
        {/* Top Tactical Gold Accent Bevel */}
        <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 shadow-[0_0_15px_rgba(245,158,11,0.6)]" />

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[#182338] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner">
              <TrophyIcon className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-black uppercase tracking-widest text-amber-400 block">
                {"// ORGANIZER PORTAL DIRECTIVE"}
              </span>
              <h3 className="font-display text-xl sm:text-2xl font-black uppercase text-white tracking-tight">
                {isEditing ? (isRejected ? "Edit & Re-Apply Tournament" : "Modify Tournament Details") : "Host Collegiate Tournament"}
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Modal"
            className="w-8 h-8 bg-[#101524] hover:bg-rose-950/80 text-slate-400 hover:text-rose-300 border border-[#222E48] hover:border-rose-500/50 flex items-center justify-center text-sm font-mono font-bold transition-all cursor-pointer shadow-md active:scale-95"
            style={{
              clipPath: "polygon(3px 0, 100% 0, calc(100% - 3px) 100%, 0 100%)",
            }}
          >
            ✕
          </button>
        </div>

        {/* Rejection Warning Banner for Rejected Tournaments */}
        {isRejected && (
          <div
            className="p-4 bg-gradient-to-b from-rose-950/70 to-[#12080D] border border-rose-500/60 shadow-[0_0_20px_rgba(244,63,94,0.2)] space-y-2 relative overflow-hidden"
            style={{
              clipPath: "polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))",
            }}
          >
            <div className="absolute top-0 left-0 bottom-0 w-1 bg-rose-500" />
            <div className="flex items-start gap-2.5 pl-1.5">
              <div className="w-7 h-7 rounded bg-rose-500/20 border border-rose-500/40 flex items-center justify-center shrink-0 text-rose-400 mt-0.5">
                <AlertTriangleIcon className="w-4 h-4" />
              </div>
              <div className="space-y-1 flex-1">
                <span className="text-[10px] font-mono font-black uppercase tracking-widest text-rose-300 block">
                  {"// ADMIN REJECTION DIRECTIVE"}
                </span>
                <p className="text-xs font-sans text-rose-100 leading-relaxed font-medium">
                  {initialTournament?.statusText || initialTournament?.rejectionReason || "Please review tournament guidelines and modify required details."}
                </p>
                <div className="flex items-center gap-1 text-[11px] text-amber-300 font-mono pt-1">
                  <span>✓</span>
                  <span>Saving updates will reset status to PENDING APPROVAL for official admin re-sanctioning.</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error Alert Box */}
        {errorMsg && (
          <div
            className="p-3.5 bg-rose-950/70 border border-rose-500/50 text-rose-200 text-xs font-mono flex items-center justify-between gap-2 shadow-lg"
            style={{
              clipPath: "polygon(4px 0, 100% 0, calc(100% - 4px) 100%, 0 100%)",
            }}
          >
            <div className="flex items-center gap-2">
              <AlertTriangleIcon className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
            <button
              type="button"
              onClick={() => setErrorMsg("")}
              className="text-slate-400 hover:text-white text-xs font-mono cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Cover Artwork Dropzone */}
          <div>
            <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center justify-between">
              <span>{"// 01. COVER ARTWORK BANNER"}</span>
              <span className="text-[10px] font-normal text-slate-500">Optional • PNG, JPG, WEBP</span>
            </label>

            {imagePreview ? (
              <div className="relative h-28 sm:h-32 w-full rounded-xl overflow-hidden border border-amber-500/40 group/cover">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imagePreview}
                  alt="Tournament Cover Preview"
                  className="w-full h-full object-cover group-hover/cover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/cover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <label className="h-8 px-3 bg-amber-500 hover:bg-amber-400 text-black text-xs font-mono font-bold uppercase rounded-lg flex items-center gap-1.5 cursor-pointer shadow-md transition-transform active:scale-95">
                    <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                    <span>Change Image</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="h-8 px-3 bg-rose-600 hover:bg-rose-500 text-white text-xs font-mono font-bold uppercase rounded-lg cursor-pointer transition-transform active:scale-95"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              <label
                className="w-full h-24 border-2 border-dashed border-[#1E293B] hover:border-amber-500/60 rounded-xl bg-[#060912]/80 hover:bg-[#0A0E1A] flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-all duration-200 group/upload"
                style={{
                  clipPath: "polygon(6px 0, 100% 0, calc(100% - 6px) 100%, 0 100%)",
                }}
              >
                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                <div className="w-8 h-8 rounded-lg bg-[#101626] border border-[#222E48] group-hover/upload:border-amber-500/50 flex items-center justify-center text-slate-400 group-hover/upload:text-amber-400 transition-colors">
                  <PlusIcon className="w-4 h-4" />
                </div>
                <div className="text-center">
                  <span className="text-xs font-mono text-slate-300 font-bold group-hover/upload:text-amber-300 transition-colors">
                    Click to browse or drop cover banner
                  </span>
                </div>
              </label>
            )}
          </div>

          {/* Tournament Name */}
          <div>
            <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              {"// 02. TOURNAMENT NAME"}
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Philippine Collegiate Invitational — Season 2"
              className="w-full h-11 px-4 bg-[#060912] border border-[#1C2538] hover:border-[#2C3A56] focus:border-amber-500 focus:shadow-[0_0_15px_rgba(245,158,11,0.15)] text-white text-xs font-sans rounded-xl focus:outline-none placeholder:text-slate-600 transition-all"
              style={{
                clipPath: "polygon(4px 0, 100% 0, calc(100% - 4px) 100%, 0 100%)",
              }}
            />
          </div>

          {/* Esports Title & Bracket Format */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                {"// 03. ESPORTS TITLE"}
              </label>
              <select
                value={selectedGameTitle}
                onChange={(e) => setSelectedGameTitle(e.target.value)}
                className="w-full h-11 px-3.5 bg-[#060912] border border-[#1C2538] hover:border-[#2C3A56] focus:border-amber-500 text-white text-xs font-mono rounded-xl focus:outline-none cursor-pointer transition-all"
                style={{
                  clipPath: "polygon(4px 0, 100% 0, calc(100% - 4px) 100%, 0 100%)",
                }}
              >
                <option value="VALORANT">VALORANT</option>
                <option value="LOL">LEAGUE OF LEGENDS</option>
                <option value="MLBB">MOBILE LEGENDS</option>
                <option value="CODM">CALL OF DUTY: MOBILE</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                {"// 04. BRACKET FORMAT"}
              </label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                className="w-full h-11 px-3.5 bg-[#060912] border border-[#1C2538] hover:border-[#2C3A56] focus:border-amber-500 text-white text-xs font-mono rounded-xl focus:outline-none cursor-pointer transition-all"
                style={{
                  clipPath: "polygon(4px 0, 100% 0, calc(100% - 4px) 100%, 0 100%)",
                }}
              >
                <option value="Single Elimination">Single Elimination</option>
                <option value="Double Elimination">Double Elimination</option>
                <option value="Round Robin + Playoffs">Round Robin + Playoffs</option>
              </select>
            </div>
          </div>

          {/* Quota & Custom Cyber Calendar Picker */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                {"// 05. SQUAD QUOTA"}
              </label>
              <select
                value={teamQuota}
                onChange={(e) => setTeamQuota(e.target.value)}
                className="w-full h-11 px-3.5 bg-[#060912] border border-[#1C2538] hover:border-[#2C3A56] focus:border-amber-500 text-white text-xs font-mono rounded-xl focus:outline-none cursor-pointer transition-all"
                style={{
                  clipPath: "polygon(4px 0, 100% 0, calc(100% - 4px) 100%, 0 100%)",
                }}
              >
                <option value="8 Universities">8 Universities</option>
                <option value="16 Universities">16 Universities</option>
                <option value="32 Universities">32 Universities</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
                <ClockIcon className="w-3.5 h-3.5 text-amber-400" />
                <span>{"// 06. SCHEDULED START"}</span>
              </label>
              <CyberDateTimePicker
                value={startDate}
                onChange={setStartDate}
                placeholder="Set Scheduled Launch Time"
              />
            </div>
          </div>

          {/* Rules & Protocols */}
          <div>
            <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              {"// 07. RULES & MATCH PROTOCOLS"}
            </label>
            <textarea
              rows={2}
              value={rules}
              onChange={(e) => setRules(e.target.value)}
              placeholder="e.g. Best of 3 Semi-Finals, BO5 Grand Finals. Official university varsity rosters only..."
              className="w-full p-3.5 bg-[#060912] border border-[#1C2538] hover:border-[#2C3A56] focus:border-amber-500 focus:shadow-[0_0_15px_rgba(245,158,11,0.15)] text-white text-xs font-mono rounded-xl focus:outline-none placeholder:text-slate-600 transition-all resize-none"
              style={{
                clipPath: "polygon(4px 0, 100% 0, calc(100% - 4px) 100%, 0 100%)",
              }}
            />
          </div>

          {/* Sanctioning Guarantee Box */}
          <div
            className="p-3.5 bg-gradient-to-r from-amber-950/25 via-[#0A0D18] to-[#0A0D18] border border-amber-500/30 rounded-xl flex items-start gap-2.5 text-xs font-sans text-amber-200/90"
            style={{
              clipPath: "polygon(4px 0, 100% 0, calc(100% - 4px) 100%, 0 100%)",
            }}
          >
            <ShieldIcon className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <span className="leading-relaxed">
              <strong>Organizer Verification:</strong> Once submitted, your tournament is queued for official Collegium Sanctioning Review. University rosters can join upon approval.
            </span>
          </div>

          {/* Modal Action Buttons */}
          <div className="pt-3 border-t border-[#182338] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="h-11 px-6 bg-[#101524] hover:bg-[#1A233A] text-slate-300 hover:text-white border border-[#222E48] text-xs font-mono font-bold uppercase transition-colors cursor-pointer active:scale-95"
              style={{
                clipPath: "polygon(4px 0, 100% 0, calc(100% - 4px) 100%, 0 100%)",
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="h-11 px-7 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 hover:from-amber-400 hover:to-amber-300 text-black font-display text-xs font-black uppercase tracking-wider transition-all shadow-xl shadow-amber-500/25 cursor-pointer disabled:opacity-50 flex items-center gap-2.5 active:scale-98"
              style={{
                clipPath: "polygon(4px 0, 100% 0, calc(100% - 4px) 100%, 0 100%)",
              }}
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              ) : (
                <TrophyIcon className="w-4 h-4 text-black" />
              )}
              <span>
                {isEditing
                  ? isRejected
                    ? "⚡ Re-Submit for Sanctioning"
                    : "Save Changes"
                  : "Submit for Approval"}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
