"use client";

import { useState } from "react";
import Image from "next/image";
import { coachService } from "@/services";
import { CoachInvitationsPanelProps } from "@/types";
import { getGameInfo } from "@/lib/games";
import { BRAND_BTN } from "@/components/organize/surfaces";
import { ClockIcon, MessageSquareIcon } from "@/components/ui/Icons";
import CoachPanel from "./CoachPanel";

export default function CoachInvitationsPanel({ invitations, onResponded }: CoachInvitationsPanelProps) {
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");

  if (invitations.length === 0) return null;

  const respond = async (id: string, accept: boolean) => {
    setBusyId(id);
    setError("");
    try {
      await coachService.respondToInvitation(id, accept);
      onResponded();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Could not respond to the invitation.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <CoachPanel eyebrow="A captain wants you" title={`Coaching Invitations (${invitations.length})`} icon={<MessageSquareIcon className="w-4 h-4" />}>
      {error && <p className="text-xs font-sans text-rose-400">{error}</p>}
      <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {invitations.map((inv) => {
          const game = getGameInfo(inv.team.gameTitle);
          return (
            <li key={inv.id} className="relative overflow-hidden p-4 border border-white/[0.07] space-y-3">
              <Image src={game.image} alt="" fill sizes="320px" className="object-cover opacity-20" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#0A0D16] via-[#0A0D16]/90 to-[#0A0D16]/50" />
              <div className="relative">
                <p className="text-[9px] font-mono font-black uppercase tracking-[0.2em]" style={{ color: game.accentColor }}>{game.shortName}</p>
                <p className="font-display text-lg font-black uppercase text-white leading-tight">{inv.team.name}</p>
                <p className="text-[11px] font-sans text-slate-400">From {inv.invitedBy.displayName} · {inv.team.university.name}</p>
                <p className="mt-1 text-[10px] font-mono text-amber-300/80 flex items-center gap-1">
                  <ClockIcon className="w-3 h-3" />
                  Expires {new Date(inv.expiresAt).toLocaleDateString()}
                </p>
              </div>
              <div className="relative flex gap-2">
                <button type="button" disabled={busyId === inv.id} onClick={() => respond(inv.id, false)} className="flex-1 h-9 border border-white/10 text-[10px] font-mono font-bold uppercase text-slate-300 hover:text-white cursor-pointer disabled:opacity-50">
                  Decline
                </button>
                <button type="button" disabled={busyId === inv.id} onClick={() => respond(inv.id, true)} className={`flex-1 h-9 text-[10px] font-mono font-black uppercase cursor-pointer disabled:opacity-50 ${BRAND_BTN}`}>
                  Accept & Coach
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </CoachPanel>
  );
}
