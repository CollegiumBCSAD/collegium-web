"use client";

import { useState } from "react";
import { OrganizeTournamentTileProps } from "@/types";
import { CalendarIcon, TrashIcon } from "@/components/ui/Icons";
import { approvedTeamCount, formatStart, matchProgress, tournamentCover } from "@/lib/organize";
import { pendingApplicationCount, reportableMatchCount } from "@/lib/organize";
import { BRAND_BTN, RAISED } from "./surfaces";

const secondaryBtn =
  "h-9 flex-1 px-3 text-[10px] font-mono font-bold uppercase tracking-wider bg-gradient-to-b from-white/[0.07] to-white/[0.02] border border-white/10 text-slate-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] hover:text-white hover:border-white/30 transition-colors";
const primaryBtn =
  "h-9 flex-1 px-3 text-[11px] font-display font-black uppercase tracking-wider";

export default function OrganizeTournamentTile({ tournament: t, stage, handlers }: OrganizeTournamentTileProps) {
  const [confirm, setConfirm] = useState<"start" | "delete" | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const teams = approvedTeamCount(t);
  const pending = pendingApplicationCount(t);
  const reportable = stage === "live" ? reportableMatchCount(t) : 0;
  const progress = matchProgress(t);
  const quota = t.teamQuota ?? 0;
  const start = formatStart(t.startDate);

  const runConfirmed = async () => {
    setBusy(true);
    setError(null);
    try {
      if (confirm === "start") await handlers.onStart(t.id);
      if (confirm === "delete") await handlers.onDelete(t.id);
      setConfirm(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <article
      className={`group relative flex flex-col ${RAISED} transition-all duration-300 hover:-translate-y-1 hover:border-white/20 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_28px_50px_-20px_rgba(0,0,0,0.95)]`}
    >
      <div className="relative h-36 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={tournamentCover(t)}
          alt=""
          className="w-full h-full object-cover opacity-75 group-hover:opacity-95 group-hover:scale-105 transition-all duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0D1120] via-[#0D1120]/55 to-black/20" />
        <div className="absolute inset-0 shadow-[inset_0_0_40px_rgba(0,0,0,0.6)]" />
        <h3 className="absolute inset-x-3.5 bottom-3 font-display text-[15px] font-black uppercase text-white leading-tight line-clamp-2 drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]">
          {t.title}
        </h3>
        {stage === "live" && (
          <span className="absolute top-2 left-2 flex items-center gap-1 px-1.5 py-0.5 text-[8px] font-mono font-black uppercase tracking-widest text-emerald-300 bg-black/50 backdrop-blur-md border border-emerald-400/40">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Live
          </span>
        )}
        <button
          type="button"
          onClick={() => setConfirm(confirm === "delete" ? null : "delete")}
          aria-label="Remove tournament"
          title="Remove tournament"
          className="absolute top-2 right-2 w-7 h-7 flex items-center justify-center bg-black/50 backdrop-blur-md border border-white/15 text-slate-400 hover:text-rose-300 hover:border-rose-400/50 opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity"
        >
          <TrashIcon className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex flex-1 flex-col px-3.5 pt-3 pb-3.5 gap-3">
        <p className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400">
          <span className="truncate">{t.bracketFormat || "Single Elimination"}</span>
          {start && (
            <>
              <span className="text-slate-700">·</span>
              <CalendarIcon className="w-3 h-3 shrink-0" />
              <span className="shrink-0">{start}</span>
            </>
          )}
        </p>

        {stage === "registration" && (
          <div>
            <div className="flex justify-between text-[9px] font-mono uppercase tracking-widest text-slate-500">
              <span>Teams</span>
              <span className="text-slate-300 tabular-nums">
                {teams}
                {quota > 0 && ` / ${quota}`}
              </span>
            </div>
            <div className="mt-1.5 h-1.5 bg-black/50 shadow-[inset_0_1px_2px_rgba(0,0,0,0.8)]">
              <div
                className="h-full bg-primary-brand shadow-[0_0_10px_rgba(var(--game-glow-rgb),0.6)]"
                style={{ width: `${quota > 0 ? Math.min(100, (teams / quota) * 100) : teams > 0 ? 100 : 0}%` }}
              />
            </div>
          </div>
        )}

        {(stage === "live" || stage === "completed") && progress.total > 0 && (
          <div>
            <div className="flex justify-between text-[9px] font-mono uppercase tracking-widest text-slate-500">
              <span>{teams} teams · Bracket</span>
              <span className="text-slate-300 tabular-nums">
                {progress.played} / {progress.total}
              </span>
            </div>
            <div className="mt-1.5 flex gap-0.5">
              {Array.from({ length: progress.total }, (_, i) => (
                <span
                  key={i}
                  className={`h-1.5 flex-1 ${
                    i < progress.played
                      ? "bg-primary-brand shadow-[0_0_6px_rgba(var(--game-glow-rgb),0.6)]"
                      : "bg-black/50 shadow-[inset_0_1px_2px_rgba(0,0,0,0.8)]"
                  }`}
                />
              ))}
            </div>
          </div>
        )}

        {t.status === "REJECTED" && (
          <p className="px-2.5 py-2 text-[11px] font-sans text-rose-200/90 bg-rose-500/10 border-l-2 border-rose-500 line-clamp-3">
            {t.rejectionReason || "An admin requested changes."}
          </p>
        )}
        {t.status === "PENDING_APPROVAL" && (
          <p className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-wider text-slate-400">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-pulse" />
            Waiting on admin review
          </p>
        )}

        {confirm ? (
          <div className={`mt-auto p-2.5 space-y-2 border ${confirm === "delete" ? "border-rose-500/40 bg-rose-500/10" : "border-primary-brand/40 bg-primary-brand/10"}`}>
            <p className="text-[11px] font-sans text-slate-200">
              {confirm === "delete" ? "Remove this tournament for good?" : "Seed the bracket and go live?"}
            </p>
            {error && <p className="text-[10px] font-mono text-rose-400">{error}</p>}
            <div className="flex gap-2">
              <button
                type="button"
                disabled={busy}
                onClick={runConfirmed}
                className={`${primaryBtn} disabled:opacity-50 ${confirm === "delete" ? "bg-rose-600 hover:bg-rose-500 text-white" : BRAND_BTN}`}
              >
                {busy ? "Working…" : confirm === "delete" ? "Remove" : "Go live"}
              </button>
              <button type="button" onClick={() => setConfirm(null)} className={secondaryBtn}>
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-auto flex gap-2">
            {t.status === "REJECTED" && (
              <button type="button" onClick={() => handlers.onEdit(t)} className={`${primaryBtn} ${BRAND_BTN}`}>
                Edit & resubmit
              </button>
            )}
            {stage === "registration" && (
              <>
                <button type="button" onClick={() => handlers.onReviewApplications(t)} className={secondaryBtn}>
                  Squads{pending > 0 && <span className="ml-1 text-primary-brand">({pending})</span>}
                </button>
                <button type="button" onClick={() => setConfirm("start")} className={`${primaryBtn} ${BRAND_BTN}`}>
                  Go live
                </button>
              </>
            )}
            {stage === "live" && (
              <button
                type="button"
                onClick={() => handlers.onOpenBracket(t)}
                className={reportable > 0 ? `${primaryBtn} ${BRAND_BTN}` : secondaryBtn}
              >
                {reportable > 0 ? `Report ${reportable} result${reportable === 1 ? "" : "s"}` : "Manage bracket"}
              </button>
            )}
            {stage === "completed" && (
              <button type="button" onClick={() => handlers.onOpenBracket(t)} className={secondaryBtn}>
                View results
              </button>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
