"use client";

import { useCallback, useEffect, useState } from "react";
import { coachService } from "@/services";
import { CoachTeamPanelProps, PracticeRecordList, PracticeSchedule } from "@/types";
import { winRate } from "@/lib/coach";
import { BRAND_BTN } from "@/components/organize/surfaces";
import { SwordsIcon } from "@/components/ui/Icons";
import CoachPanel from "./CoachPanel";
import PracticeRecordModal from "./PracticeRecordModal";

export default function PracticeRecordPanel({ team, onChanged }: CoachTeamPanelProps) {
  const [data, setData] = useState<PracticeRecordList | null>(null);
  const [schedules, setSchedules] = useState<PracticeSchedule[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const load = useCallback(() => {
    coachService.getPracticeRecords(team.id).then(setData).catch(() => setData(null));
    coachService.getSchedules(team.id).then(setSchedules).catch(() => setSchedules([]));
  }, [team.id]);

  useEffect(load, [load]);

  const closeModal = useCallback(() => setIsModalOpen(false), []);
  const summary = data?.summary ?? { wins: 0, losses: 0, total: 0 };
  const rate = winRate(summary.wins, summary.total);
  // Oldest → newest so the strip reads left to right like a form guide.
  const form = (data?.records ?? []).slice(0, 10).reverse();

  return (
    <CoachPanel
      eyebrow="Unranked"
      title="Scrim Records"
      icon={<SwordsIcon className="w-4 h-4" />}
      action={
        <button type="button" onClick={() => setIsModalOpen(true)} className={`h-8 px-3 text-[10px] font-mono font-black uppercase tracking-wider cursor-pointer ${BRAND_BTN}`}>
          Log Scrim
        </button>
      }
    >
      {summary.total === 0 ? (
        <p className="text-xs font-sans text-slate-500">No scrims logged yet. Win/loss and completion only — never touches ratings.</p>
      ) : (
        <>
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="font-display text-4xl font-black tabular-nums text-white leading-none">
                {rate}
                <span className="text-lg text-slate-500">%</span>
              </p>
              <p className="mt-1 text-[9px] font-mono uppercase tracking-widest text-slate-500">Win rate · {summary.total} scrims</p>
            </div>
            <p className="font-display text-xl font-black tabular-nums">
              <span className="text-emerald-400">{summary.wins}W</span>
              <span className="text-slate-600"> / </span>
              <span className="text-rose-400">{summary.losses}L</span>
            </p>
          </div>
          <div className="h-1.5 bg-rose-500/30 overflow-hidden">
            <div className="h-full bg-emerald-400 transition-all duration-700" style={{ width: `${rate}%` }} />
          </div>

          <div>
            <p className="text-[9px] font-mono uppercase tracking-widest text-slate-500 mb-1.5">Recent form</p>
            <div className="flex gap-1">
              {form.map((r) => (
                <span
                  key={r.id}
                  title={`${r.result}${r.opponentName ? ` vs ${r.opponentName}` : ""} · ${new Date(r.playedAt).toLocaleDateString()}`}
                  className={`w-7 h-7 flex items-center justify-center text-[10px] font-mono font-black ${
                    r.result === "WIN" ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30" : "bg-rose-500/15 text-rose-300 border border-rose-500/30"
                  } ${r.completed ? "" : "opacity-50"}`}
                >
                  {r.result === "WIN" ? "W" : "L"}
                </span>
              ))}
            </div>
          </div>

          <ul className="space-y-1">
            {(data?.records ?? []).slice(0, 4).map((r) => (
              <li key={r.id} className="flex items-center justify-between gap-3 text-xs py-1.5 border-b border-white/[0.04] last:border-0">
                <span className="font-sans text-slate-200 truncate">
                  {r.opponentName ? `vs. ${r.opponentName}` : "Scrim"}
                  <span className="text-slate-500"> · {new Date(r.playedAt).toLocaleDateString()} · {r.source === "OCR" ? "OCR" : "Manual"}</span>
                </span>
                <span className={`font-mono font-black ${r.result === "WIN" ? "text-emerald-400" : "text-rose-400"}`}>{r.result}</span>
              </li>
            ))}
          </ul>
        </>
      )}

      {/* Mounted only while open so each log starts from a blank form */}
      {isModalOpen && (
        <PracticeRecordModal
          teamId={team.id}
          schedules={schedules}
          isOpen={isModalOpen}
          onClose={closeModal}
          onSaved={() => {
            load();
            onChanged();
          }}
        />
      )}
    </CoachPanel>
  );
}
