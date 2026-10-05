"use client";

import { useCallback, useEffect, useState } from "react";
import { coachService, teamsService } from "@/services";
import { CoachJoinRequest, CoachJoinRequestsPanelProps } from "@/types";
import { BRAND_BTN } from "@/components/organize/surfaces";
import OctagonAvatar from "@/components/ui/OctagonAvatar";
import { UsersIcon } from "@/components/ui/Icons";
import CoachPanel from "./CoachPanel";

export default function CoachJoinRequestsPanel({ teamId, coachId, onChanged }: CoachJoinRequestsPanelProps) {
  const [requests, setRequests] = useState<CoachJoinRequest[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(() => {
    coachService.getJoinRequests(teamId, coachId).then(setRequests).catch(() => setRequests([]));
  }, [teamId, coachId]);

  useEffect(load, [load]);

  if (requests.length === 0) return null;

  const respond = async (requestId: string, accept: boolean) => {
    setBusyId(requestId);
    try {
      await teamsService.handleJoinRequest(teamId, requestId, coachId, accept ? "ACCEPTED" : "DECLINED");
      load();
      onChanged();
    } finally {
      setBusyId(null);
    }
  };

  return (
    <CoachPanel eyebrow={`${requests.length} waiting`} title="Join Requests" icon={<UsersIcon className="w-4 h-4" />}>
      <ul className="space-y-2">
        {requests.map((r) => (
          <li key={r.id} className="flex items-center gap-3 p-2.5 bg-black/25 border border-white/[0.05]">
            <OctagonAvatar label={r.gameHandle} className="w-9 h-9" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-sans font-semibold text-white truncate">{r.gameHandle}</p>
              <p className="text-[11px] font-sans text-slate-500 truncate">
                {r.user.displayName}
                {r.preferredRole ? ` · ${r.preferredRole}` : ""}
              </p>
            </div>
            <button type="button" disabled={busyId === r.id} onClick={() => respond(r.id, false)} className="h-8 px-3 border border-white/10 text-[10px] font-mono font-bold uppercase text-slate-400 hover:text-white cursor-pointer disabled:opacity-50">
              Decline
            </button>
            <button type="button" disabled={busyId === r.id} onClick={() => respond(r.id, true)} className={`h-8 px-3 text-[10px] font-mono font-black uppercase cursor-pointer disabled:opacity-50 ${BRAND_BTN}`}>
              Accept
            </button>
          </li>
        ))}
      </ul>
    </CoachPanel>
  );
}
