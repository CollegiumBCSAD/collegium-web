"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { createPortal } from "react-dom";
import { Team } from "@/types";
import { GAMES } from "@/lib/games";
import { maxRosterFor } from "@/lib/teams";
import { useAuth } from "@/context/AuthContext";
import { teamsService } from "@/services/teamsService";
import RosterEditor from "@/components/rosters/RosterEditor";
import LineupGrid from "@/components/dashboard/LineupGrid";
import { CrownIcon, ShieldIcon, UsersIcon } from "@/components/ui/Icons";

interface RosterDetailsModalProps {
  team: Team | null;
  isOpen: boolean;
  onClose: () => void;
  onRosterUpdated?: () => void;
}

export default function RosterDetailsModal({ team, isOpen, onClose, onRosterUpdated }: RosterDetailsModalProps) {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [confirmLeave, setConfirmLeave] = useState(false);
  const [leaveError, setLeaveError] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", onKey);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !team) return null;

  const game = GAMES[team.gameTitle] || GAMES.valo;
  const accepted = team.members.filter((m) => m.status === "ACCEPTED");
  // The captain edits the roster in place; everyone else gets the read-only lineup.
  const isCaptain = Boolean(user?.id && team.captainId === user.id);
  const isMember = Boolean(user?.id && (isCaptain || team.members.some((m) => m.userId === user.id)));

  const inviteUrl = typeof window === "undefined" ? "" : `${window.location.origin}/team/join?invite=${team.inviteCode}`;

  const copyInviteLink = () => {
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLeaveTeam = async () => {
    if (!user) return;
    setIsLeaving(true);
    setLeaveError("");
    try {
      await teamsService.leaveTeam(team.id, user.id);
      onClose();
      if (onRosterUpdated) onRosterUpdated();
      else window.location.reload();
    } catch (err: unknown) {
      setLeaveError(err instanceof Error ? err.message : "Failed to leave squad.");
    } finally {
      setIsLeaving(false);
    }
  };

  const stats = [
    { label: "Players", value: `${accepted.length}/${maxRosterFor(team.gameTitle)}`, icon: <UsersIcon className="w-3.5 h-3.5" /> },
    { label: "Captain", value: team.captainName, icon: <CrownIcon className="w-3.5 h-3.5 text-amber-400" /> },
    { label: "Coach", value: team.coachName || "None", icon: <ShieldIcon className="w-3.5 h-3.5" /> },
  ];

  const modalContent = (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-backdrop-fade-in" onClick={onClose}>
      <div
        className="animate-modal-pop-in w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl bg-[#0B0F1A] border border-white/10 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header: game art wash behind the squad identity */}
        <div className="relative shrink-0 px-6 pt-6 pb-5 overflow-hidden">
          <Image src={game.image} alt="" fill className="object-cover opacity-20 scale-110 blur-[1px]" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0B0F1A]/40 via-[#0B0F1A]/80 to-[#0B0F1A]" />
          <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-primary-brand to-transparent" />

          <div className="relative flex items-start justify-between gap-4">
            <div className="flex items-center gap-4 min-w-0">
              <div
                className="relative w-14 h-14 shrink-0 overflow-hidden border border-white/15"
                style={{ clipPath: "polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)" }}
              >
                <Image src={game.image} alt={game.name} fill className="object-cover" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-primary-brand truncate">
                  {team.universityName} · {game.shortName}
                </p>
                <h2 className="font-display text-2xl sm:text-3xl font-black uppercase tracking-wide text-white truncate">{team.name}</h2>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close Modal"
              className="w-9 h-9 shrink-0 rounded-lg border border-white/10 bg-black/40 text-slate-400 hover:text-white hover:border-white/25 flex items-center justify-center cursor-pointer"
            >
              ✕
            </button>
          </div>

          <dl className="relative grid grid-cols-3 gap-2 mt-5">
            {stats.map((s) => (
              <div key={s.label} className="rounded-xl bg-black/40 border border-white/[0.07] px-3 py-2.5 min-w-0">
                <dt className="text-[9px] font-mono font-bold uppercase tracking-widest text-slate-500 flex items-center gap-1.5">
                  {s.icon}
                  {s.label}
                </dt>
                <dd className="font-display text-sm sm:text-base font-black uppercase text-white truncate mt-0.5">{s.value}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-5">
          {isCaptain ? (
            <RosterEditor teamId={team.id} gameTitle={team.gameTitle} onChanged={onRosterUpdated} />
          ) : (
            <LineupGrid
              members={accepted}
              captainId={team.captainId}
              gameTitle={team.gameTitle}
            />
          )}

          <div className="rounded-xl bg-black/30 border border-white/[0.07] p-3 flex items-center gap-2">
            <div className="min-w-0 flex-1">
              <p className="text-[9px] font-mono font-bold uppercase tracking-widest text-slate-500">Invite Link</p>
              <p className="text-xs font-mono text-slate-300 truncate select-all">{inviteUrl}</p>
            </div>
            <button
              type="button"
              onClick={copyInviteLink}
              className="h-9 px-4 rounded-lg game-theme-btn text-[11px] font-mono font-black uppercase tracking-wider shrink-0 cursor-pointer"
            >
              {copied ? "Copied ✓" : "Copy"}
            </button>
          </div>

          {leaveError && <p className="text-xs font-sans text-rose-400">{leaveError}</p>}
        </div>

        {/* Footer */}
        {isMember && (
          <div className="shrink-0 px-6 py-4 border-t border-white/[0.07] bg-black/30">
            {confirmLeave ? (
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <p className="flex-1 text-xs font-sans text-rose-200">
                  Leave <strong>{team.name}</strong>? If you&apos;re captain, the armband passes to the next player.
                </p>
                <div className="flex gap-2 shrink-0">
                  <button type="button" onClick={() => setConfirmLeave(false)} className="h-9 px-4 rounded-lg text-[11px] font-mono font-bold uppercase text-slate-300 bg-white/5 hover:bg-white/10 cursor-pointer">
                    Cancel
                  </button>
                  <button type="button" onClick={handleLeaveTeam} disabled={isLeaving} className="h-9 px-4 rounded-lg text-[11px] font-mono font-black uppercase text-white bg-rose-600 hover:bg-rose-500 cursor-pointer disabled:opacity-50">
                    {isLeaving ? "Leaving..." : "Leave Squad"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-sans text-slate-500">Need to exit this squad?</span>
                <button
                  type="button"
                  onClick={() => setConfirmLeave(true)}
                  className="h-9 px-4 rounded-lg text-[11px] font-mono font-bold uppercase text-rose-300 border border-rose-500/30 hover:bg-rose-500/10 cursor-pointer"
                >
                  Leave Squad
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  if (typeof document === "undefined") return null;
  return createPortal(modalContent, document.body);
}
