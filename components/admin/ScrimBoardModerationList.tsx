"use client";

import { useEffect, useState } from "react";
import { ScrimOffer } from "@/types/scrims";
import { scrimsService } from "@/services";
import { GAME_LIST, getGameInfo } from "@/lib/games";
import { SwordsIcon } from "@/components/ui/Icons";

export default function ScrimBoardModerationList() {
  const [scrims, setScrims] = useState<ScrimOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [gameFilter, setGameFilter] = useState("All Games");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const fetchScrims = () => {
    setLoading(true);
    scrimsService
      .getScrims()
      .then((data) => setScrims(data))
      .catch(() => setScrims([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    let active = true;
    scrimsService
      .getScrims()
      .then((data) => {
        if (active) setScrims(data);
      })
      .catch(() => {
        if (active) setScrims([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const handleDeleteScrim = async (id: string) => {
    setDeletingId(id);
    try {
      await scrimsService.deleteScrim(id);
      setScrims((prev) => prev.filter((s) => s.id !== id));
      setConfirmDeleteId(null);
      setFeedback({ text: "Scrim post permanently deleted from the circuit.", type: "success" });
    } catch (err) {
      console.error("Failed to delete scrim:", err);
      setFeedback({ text: "Failed to delete scrim post.", type: "error" });
    } finally {
      setDeletingId(null);
    }
  };

  const handleCancelScrim = async (id: string) => {
    setDeletingId(id);
    try {
      await scrimsService.cancelScrim(id);
      setScrims((prev) =>
        prev.map((s) => (s.id === id ? { ...s, status: "CANCELLED" } : s))
      );
      setConfirmDeleteId(null);
      setFeedback({ text: "Scrim challenge marked as cancelled.", type: "success" });
    } catch (err) {
      console.error("Failed to cancel scrim:", err);
      setFeedback({ text: "Failed to cancel scrim challenge.", type: "error" });
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = scrims.filter((s) => {
    const gameInfo = getGameInfo(s.gameTitle);
    const matchesGame =
      gameFilter === "All Games" ||
      gameInfo.shortName.toLowerCase() === gameFilter.toLowerCase() ||
      gameInfo.name.toLowerCase().includes(gameFilter.toLowerCase()) ||
      s.gameTitle.toLowerCase().includes(gameFilter.toLowerCase());

    const matchesStatus =
      statusFilter === "ALL" || s.status === statusFilter;

    const q = search.trim().toLowerCase();
    const matchesSearch =
      !q ||
      s.hostTeamName.toLowerCase().includes(q) ||
      (s.universityName && s.universityName.toLowerCase().includes(q)) ||
      (s.opponentTeamName && s.opponentTeamName.toLowerCase().includes(q)) ||
      (s.notes && s.notes.toLowerCase().includes(q)) ||
      (s.rankRange && s.rankRange.toLowerCase().includes(q));

    return matchesGame && matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-5">
      {/* Toast Feedback */}
      {feedback && (
        <div
          className={`p-4 rounded-2xl border flex items-center justify-between gap-4 transition-all duration-300 ${
            feedback.type === "success"
              ? "bg-emerald-950/40 border-emerald-500/50 text-emerald-300"
              : "bg-rose-950/40 border-rose-500/50 text-rose-300"
          }`}
        >
          <div className="flex items-center gap-3 text-xs sm:text-sm font-mono">
            {feedback.type === "success" ? "✓" : "⚠"} {feedback.text}
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-xs font-mono text-neutral-400 hover:text-white cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Search & Filter Toolbar */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by team name, university, opponent, or notes..."
              className="w-full h-12 pl-11 pr-4 rounded-2xl bg-[#0A0A0A] border border-[#1A1A1A] text-white text-xs font-mono placeholder:text-neutral-500 focus:border-emerald-500/60 focus:outline-none transition-all shadow-sm"
            />
            <svg
              className="w-4 h-4 text-neutral-500 absolute left-4 top-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-4 top-3.5 text-neutral-500 hover:text-white text-xs font-mono"
              >
                Clear
              </button>
            )}
          </div>

          <button
            onClick={fetchScrims}
            disabled={loading}
            className="h-12 px-5 rounded-2xl border border-[#1A1A1A] bg-[#0A0A0A] hover:bg-[#141414] hover:border-emerald-500/40 text-xs font-mono font-bold text-neutral-300 hover:text-white transition-all cursor-pointer disabled:opacity-50 flex items-center gap-2 shrink-0 shadow-sm"
          >
            <span>{loading ? "Syncing..." : "↻ Refresh"}</span>
          </button>
        </div>

        {/* Filters Bar */}
        <div className="flex items-center justify-between gap-4 flex-wrap pb-1 border-b border-[#1A1A1A]">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setGameFilter("All Games")}
              className={`h-9 px-4 rounded-xl text-xs font-mono font-bold uppercase tracking-wide border transition-all cursor-pointer flex items-center gap-2 ${
                gameFilter === "All Games"
                  ? "bg-[#111A15] border-emerald-500/50 text-white shadow-[0_0_10px_rgba(16,185,129,0.15)]"
                  : "border-[#1A1A1A] bg-[#0A0A0A] text-neutral-400 hover:text-white hover:bg-[#141414]"
              }`}
            >
              <span>All Disciplines</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                gameFilter === "All Games" ? "bg-emerald-500/20 text-emerald-300" : "bg-[#171717] text-neutral-500"
              }`}>
                {scrims.length}
              </span>
            </button>

            {GAME_LIST.map((g) => {
              const count = scrims.filter((s) => {
                const info = getGameInfo(s.gameTitle);
                return (
                  info.shortName.toLowerCase() === g.shortName.toLowerCase() ||
                  s.gameTitle.toLowerCase().includes(g.id.toLowerCase())
                );
              }).length;

              return (
                <button
                  key={g.id}
                  onClick={() => setGameFilter(g.shortName)}
                  className={`h-9 px-4 rounded-xl text-xs font-mono font-bold uppercase tracking-wide border transition-all cursor-pointer flex items-center gap-2 ${
                    gameFilter === g.shortName
                      ? "bg-[#111A15] border-emerald-500/50 text-white shadow-[0_0_10px_rgba(16,185,129,0.15)]"
                      : "border-[#1A1A1A] bg-[#0A0A0A] text-neutral-400 hover:text-white hover:bg-[#141414]"
                  }`}
                >
                  <span>{g.shortName}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                    gameFilter === g.shortName ? "bg-emerald-500/20 text-emerald-300" : "bg-[#171717] text-neutral-500"
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-neutral-400">
            <span>Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              aria-label="Filter scrims by status"
              className="bg-[#0A0A0A] border border-[#1A1A1A] text-neutral-200 rounded-xl px-3 py-1.5 text-xs font-mono focus:outline-none focus:border-emerald-500/60"
            >
              <option value="ALL">All Statuses ({scrims.length})</option>
              <option value="OPEN">Open</option>
              <option value="PENDING">Pending</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Admin Data Table */}
      <div className="rounded-2xl border border-[#1A1A1A] overflow-hidden bg-[#0A0A0A] shadow-md">
        {/* Table Header */}
        <div className="grid grid-cols-[2.2fr_2fr_1fr_1.8fr_1.2fr_1.4fr] gap-4 px-6 py-4 bg-[#050505] text-[11px] font-mono font-bold text-neutral-400 uppercase tracking-wider border-b border-[#171717]">
          <span>Host Team</span>
          <span>Opponent</span>
          <span>Game</span>
          <span>Match Specs</span>
          <span>Status</span>
          <span className="text-right">Actions</span>
        </div>

        {/* Rows Container */}
        <div className="divide-y divide-[#141414]">
          {loading && scrims.length === 0 ? (
            <div className="px-6 py-16 text-center text-xs font-mono text-neutral-500">
              Loading active collegiate scrim entries...
            </div>
          ) : filtered.length === 0 ? (
            <div className="px-6 py-16 text-center space-y-3">
              <div className="w-10 h-10 rounded-full bg-[#141414] border border-[#222222] text-neutral-500 mx-auto flex items-center justify-center">
                <SwordsIcon className="w-5 h-5" />
              </div>
              <p className="font-display text-sm font-bold text-white uppercase">No records found</p>
              <p className="text-xs font-mono text-neutral-400">
                {search || gameFilter !== "All Games" || statusFilter !== "ALL"
                  ? `No scrim challenges match "${search || gameFilter}"`
                  : "No scrim challenges have been created yet."}
              </p>
            </div>
          ) : (
            filtered.map((s) => {
              const gameInfo = getGameInfo(s.gameTitle);
              const isConfirming = confirmDeleteId === s.id;
              const isBusy = deletingId === s.id;
              const formattedDate = s.scheduledAt
                ? new Date(s.scheduledAt).toLocaleString("en-US", {
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })
                : "Flexible";

              return (
                <div
                  key={s.id}
                  className="grid grid-cols-[2.2fr_2fr_1fr_1.8fr_1.2fr_1.4fr] gap-4 px-6 py-4 items-center hover:bg-[#111A15]/20 transition-colors group text-xs font-mono"
                >
                  {/* Host Team */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-[#141414] border border-[#222222] text-emerald-400 flex items-center justify-center font-display font-black text-xs shrink-0 shadow-inner">
                        {s.hostTeamName.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <span className="font-display text-sm font-bold text-white group-hover:text-emerald-300 transition-colors truncate block">
                          {s.hostTeamName}
                        </span>
                        <span className="text-[11px] font-sans text-neutral-400 truncate block">
                          {s.universityName || "Varsity Team"}
                        </span>
                      </div>
                    </div>
                    {s.notes && (
                      <p className="text-[10px] text-neutral-500 italic truncate mt-1 pl-9">
                        &ldquo;{s.notes}&rdquo;
                      </p>
                    )}
                  </div>

                  {/* Opponent */}
                  <div className="min-w-0">
                    {s.opponentTeamName ? (
                      <div>
                        <span className="font-display text-sm font-bold text-teal-300 truncate block">
                          {s.opponentTeamName}
                        </span>
                        <span className="text-[10px] text-neutral-400 truncate block">
                          Confirmed Challenger
                        </span>
                      </div>
                    ) : (
                      <span className="text-neutral-500 italic text-[11px]">
                        Seeking Opponent
                      </span>
                    )}
                  </div>

                  {/* Game */}
                  <div>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg border border-[#222222] bg-[#141414] text-[10px] font-bold uppercase text-white">
                      <span
                        className="w-1.5 h-1.5 rounded-full inline-block"
                        style={{ backgroundColor: gameInfo.accentColor || "#10B981" }}
                      />
                      <span>{gameInfo.shortName}</span>
                    </span>
                  </div>

                  {/* Match Specs */}
                  <div className="min-w-0 space-y-0.5">
                    <div className="text-neutral-300 font-semibold truncate">
                      {s.format || "BO3"} {s.rankRange ? `· ${s.rankRange}` : ""}
                    </div>
                    <div className="text-[11px] text-neutral-500 truncate">
                      {formattedDate}
                    </div>
                  </div>

                  {/* Status */}
                  <div>
                    <span
                      className={`inline-flex items-center justify-center px-2.5 py-0.5 rounded-full border text-[10px] font-bold uppercase ${
                        s.status === "OPEN"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                          : s.status === "CONFIRMED"
                          ? "bg-teal-500/10 text-teal-300 border-teal-500/30"
                          : s.status === "PENDING"
                          ? "bg-amber-500/10 text-amber-300 border-amber-500/30"
                          : s.status === "COMPLETED"
                          ? "bg-neutral-900 text-neutral-400 border-neutral-800"
                          : "bg-rose-500/10 text-rose-300 border-rose-500/30"
                      }`}
                    >
                      {s.status}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end items-center gap-2">
                    {isConfirming ? (
                      <div className="flex items-center gap-1.5">
                        {s.status !== "CANCELLED" && (
                          <button
                            onClick={() => handleCancelScrim(s.id)}
                            disabled={isBusy}
                            className="px-2 py-1 rounded-lg bg-amber-950/60 border border-amber-500/40 text-[10px] font-bold text-amber-300 hover:text-white transition-colors cursor-pointer disabled:opacity-50"
                          >
                            Cancel
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteScrim(s.id)}
                          disabled={isBusy}
                          className="px-2 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-[10px] font-bold text-white transition-colors cursor-pointer disabled:opacity-50"
                        >
                          Delete
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(null)}
                          className="px-2 py-1 rounded-lg bg-[#141414] border border-[#222222] text-[10px] text-neutral-400 hover:text-white transition-colors cursor-pointer"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <>
                        <button
                          onClick={() => setConfirmDeleteId(s.id)}
                          className="px-3 py-1 rounded-xl border border-rose-900/40 bg-[#190D10] text-rose-300 hover:text-white hover:bg-rose-950/60 text-xs font-semibold transition-all cursor-pointer"
                        >
                          Moderate
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
