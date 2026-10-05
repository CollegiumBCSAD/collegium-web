"use client";

import { useState } from "react";
import { rostersService } from "@/services";
import { RosterMemberRowProps } from "@/types";
import OctagonAvatar from "@/components/ui/OctagonAvatar";
import { CrownIcon, LockIcon, PencilIcon, TrashIcon } from "@/components/ui/Icons";

const ICON_BTN =
  "w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed";
const INPUT =
  "h-9 px-3 rounded-lg bg-black/40 border border-white/10 focus:border-primary-brand text-xs text-white font-sans focus:outline-none min-w-0";

export default function RosterMemberRow({ teamId, member, slot, defaultRole, isCaptain, lockedIn, onChanged }: RosterMemberRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [gameHandle, setGameHandle] = useState(member.gameHandle);
  const [preferredRole, setPreferredRole] = useState(member.preferredRole ?? "");
  const [confirmRemove, setConfirmRemove] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState("");
  const isLocked = lockedIn.length > 0;

  const run = async (action: () => Promise<unknown>) => {
    setIsBusy(true);
    setError("");
    try {
      await action();
      setIsEditing(false);
      setConfirmRemove(false);
      onChanged();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsBusy(false);
    }
  };

  const save = () =>
    run(() =>
      rostersService.updateMember(teamId, member.id, {
        gameHandle: gameHandle.trim() || undefined,
        preferredRole: preferredRole.trim(),
      }),
    );

  return (
    <li
      className={`group relative rounded-xl border overflow-hidden transition-colors ${
        isCaptain
          ? "border-amber-400/30 bg-gradient-to-r from-amber-400/[0.07] to-transparent"
          : "border-white/[0.06] bg-gradient-to-r from-white/[0.03] to-transparent hover:border-primary-brand/40"
      }`}
    >
      <span className={`absolute left-0 inset-y-0 w-[3px] ${isCaptain ? "bg-amber-400" : "bg-primary-brand/60"}`} />

      <div className="flex items-center gap-3 py-2.5 pr-2">
        <span className="w-9 pl-2 text-center font-display text-xl font-black tabular-nums text-white/15 shrink-0">
          {String(slot).padStart(2, "0")}
        </span>
        <OctagonAvatar label={member.gameHandle} highlight={isCaptain} />

        {isEditing ? (
          <div className="flex-1 min-w-0 flex flex-wrap items-center gap-1.5">
            <input className={`${INPUT} flex-1 basis-32`} value={gameHandle} maxLength={40} onChange={(e) => setGameHandle(e.target.value)} aria-label="In-game name" autoFocus />
            <input className={`${INPUT} w-32`} value={preferredRole} maxLength={40} onChange={(e) => setPreferredRole(e.target.value)} placeholder={defaultRole} aria-label="Role" />
            <button type="button" disabled={isBusy} onClick={save} className="h-9 px-3 rounded-lg game-theme-btn text-[10px] font-mono font-black uppercase cursor-pointer disabled:opacity-50">
              Save
            </button>
            <button type="button" onClick={() => setIsEditing(false)} className="h-9 px-2 text-[10px] font-mono font-bold uppercase text-slate-400 hover:text-white cursor-pointer">
              Cancel
            </button>
          </div>
        ) : (
          <>
            <div className="flex-1 min-w-0">
              <p className="font-display text-sm font-black uppercase tracking-wide text-white truncate flex items-center gap-1.5">
                <span className="truncate">{member.gameHandle}</span>
                {isCaptain && <CrownIcon className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
              </p>
              <p className="text-[11px] font-sans text-slate-400 truncate flex items-center gap-2">
                <span className="truncate">{member.user.displayName}</span>
                {isLocked && (
                  <span className="inline-flex items-center gap-1 text-sky-300 shrink-0" title={`Locked in: ${lockedIn.join(", ")}`}>
                    <LockIcon className="w-2.5 h-2.5" />
                    Locked
                  </span>
                )}
              </p>
            </div>

            <span className="hidden sm:inline-block shrink-0 px-2 py-0.5 rounded-md text-[9px] font-mono font-bold uppercase tracking-wider text-primary-brand bg-primary-brand/10 border border-primary-brand/25">
              {member.preferredRole || defaultRole}
            </span>

            <div className="flex items-center shrink-0">
              <button type="button" onClick={() => setIsEditing(true)} className={`${ICON_BTN} hover:text-white hover:bg-white/10`} title="Edit IGN and role" aria-label={`Edit ${member.gameHandle}`}>
                <PencilIcon className="w-3.5 h-3.5" />
              </button>
              {!isCaptain && (
                <button type="button" disabled={isBusy} onClick={() => run(() => rostersService.transferCaptaincy(teamId, member.id))} className={`${ICON_BTN} hover:text-amber-300 hover:bg-amber-400/10`} title="Make captain" aria-label={`Make ${member.gameHandle} captain`}>
                  <CrownIcon className="w-3.5 h-3.5" />
                </button>
              )}
              {!isCaptain &&
                (confirmRemove ? (
                  <button type="button" disabled={isBusy} onClick={() => run(() => rostersService.removeMember(teamId, member.id))} onBlur={() => setConfirmRemove(false)} autoFocus className="h-8 px-2.5 rounded-lg text-[10px] font-mono font-black uppercase text-white bg-rose-600 hover:bg-rose-500 cursor-pointer">
                    Remove?
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={isBusy || isLocked}
                    onClick={() => setConfirmRemove(true)}
                    className={`${ICON_BTN} hover:text-rose-300 hover:bg-rose-500/10`}
                    title={isLocked ? "On a submitted lineup — use Last-Minute Change" : "Remove from roster"}
                    aria-label={`Remove ${member.gameHandle}`}
                  >
                    <TrashIcon className="w-3.5 h-3.5" />
                  </button>
                ))}
            </div>
          </>
        )}
      </div>
      {error && <p className="px-3 pb-2 text-[11px] font-sans text-rose-400">{error}</p>}
    </li>
  );
}
