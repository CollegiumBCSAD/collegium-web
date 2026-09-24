"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useGame } from "@/context/GameContext";
import { AlertTriangleIcon, TrophyIcon } from "@/components/ui/Icons";
import { tournamentsService } from "@/services/tournamentsService";
import { GameId, HostTournamentDraft, Tournament } from "@/types";
import { draftFrom } from "@/lib/hostTournament";
import HostStepBasics from "@/components/organize/host/HostStepBasics";
import HostStepFormat from "@/components/organize/host/HostStepFormat";
import HostStepDetails from "@/components/organize/host/HostStepDetails";
import HostPreviewCard from "@/components/organize/host/HostPreviewCard";

interface PostTournamentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTournamentCreated: () => void;
  initialTournament?: Tournament | null;
}

const STEPS = [
  { title: "Name", Body: HostStepBasics },
  { title: "Format & schedule", Body: HostStepFormat },
  { title: "Cover & rules", Body: HostStepDetails },
];

export default function PostTournamentModal({ isOpen, onClose, onTournamentCreated, initialTournament }: PostTournamentModalProps) {
  const { selectedGame } = useGame();
  const isEditing = Boolean(initialTournament?.id);
  const isRejected = initialTournament?.status === "REJECTED";

  const [draft, setDraft] = useState<HostTournamentDraft>(() => draftFrom(initialTournament, selectedGame as GameId));
  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Reset the wizard whenever it opens for a different tournament (or a new one).
  const openKey = isOpen ? `${initialTournament?.id || "new"}-${selectedGame || "none"}` : null;
  const [prevKey, setPrevKey] = useState<string | null>(null);
  if (prevKey !== openKey) {
    setPrevKey(openKey);
    if (isOpen) {
      setDraft(draftFrom(initialTournament, selectedGame as GameId));
      setStep(0);
      setErrorMsg("");
    }
  }

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

  if (!isOpen) return null;

  const update = (patch: Partial<HostTournamentDraft>) => setDraft((prev) => ({ ...prev, ...patch }));
  const canAdvance = step !== 0 || draft.name.trim().length > 0;
  const isLast = step === STEPS.length - 1;
  const StepBody = STEPS[step].Body;

  const submit = async () => {
    setIsSubmitting(true);
    setErrorMsg("");
    const payload = {
      name: draft.name.trim(),
      gameTitle: draft.gameTitle,
      imageFile: draft.imageFile || undefined,
      bracketFormat: draft.bracketFormat,
      teamQuota: draft.teamQuota,
      rules: draft.rules.trim() || undefined,
      startDate: draft.startDate ? new Date(draft.startDate).toISOString() : undefined,
    };
    try {
      if (isEditing && initialTournament) {
        await tournamentsService.updateTournament(initialTournament.id, { ...payload, reapply: isRejected });
      } else {
        await tournamentsService.createTournament(payload);
      }
      onTournamentCreated();
      onClose();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Couldn't save the tournament. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canAdvance) return;
    if (isLast) void submit();
    else setStep((s) => s + 1);
  };

  // Portaled to <body>: a transformed ancestor (e.g. the page slide-in
  // animation) would otherwise trap this fixed overlay inside the page.
  return createPortal(
    <div
      onClick={(e) => e.target === e.currentTarget && onClose()}
      className="fixed inset-0 z-[100] overflow-y-auto bg-black/80 backdrop-blur-md animate-fade-in"
    >
      <div className="min-h-full flex items-center justify-center p-3 sm:p-6" onClick={(e) => e.target === e.currentTarget && onClose()}>
        <form
          onSubmit={handleSubmit}
          role="dialog"
          aria-modal="true"
          aria-labelledby="host-title"
          className="relative w-full max-w-4xl grid lg:grid-cols-[280px_1fr] bg-gradient-to-b from-[#121827] to-[#090C15] border border-white/10 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.9),0_0_60px_-20px_rgba(var(--game-glow-rgb),0.25)] animate-modal-pop-in"
        >
          <span aria-hidden className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary-brand to-transparent" />

          <aside className="hidden lg:block p-6 border-r border-white/[0.06] bg-black/25">
            <HostPreviewCard draft={draft} />
          </aside>

          <div className="flex flex-col min-w-0">
            <header className="flex items-start justify-between gap-4 px-6 pt-6">
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 flex items-center justify-center text-primary-brand bg-primary-brand/10 border border-primary-brand/30">
                  <TrophyIcon className="w-5 h-5" />
                </span>
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-[0.25em] text-primary-brand">
                    Step {step + 1} of {STEPS.length}
                  </span>
                  <h2 id="host-title" className="font-display text-xl font-black uppercase text-white leading-tight">
                    {isEditing ? (isRejected ? "Revise & resubmit" : "Edit tournament") : "Host a tournament"}
                  </h2>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close Modal"
                className="w-9 h-9 flex items-center justify-center text-slate-400 hover:text-white border border-white/10 hover:border-white/30 transition-colors"
              >
                ✕
              </button>
            </header>

            <ol className="grid grid-cols-3 gap-2 px-6 pt-5">
              {STEPS.map((s, i) => (
                <li key={s.title}>
                  <button
                    type="button"
                    disabled={i > step && !canAdvance}
                    onClick={() => setStep(i)}
                    className="w-full text-left disabled:cursor-not-allowed"
                  >
                    <span className={`block h-1 transition-colors ${i <= step ? "bg-primary-brand shadow-[0_0_8px_rgba(var(--game-glow-rgb),0.6)]" : "bg-white/10"}`} />
                    <span className={`mt-1.5 block text-[10px] font-mono font-bold uppercase tracking-wider ${i === step ? "text-white" : "text-slate-500"}`}>
                      {s.title}
                    </span>
                  </button>
                </li>
              ))}
            </ol>

            <div className="px-6 py-6 space-y-4">
              {isRejected && step === 0 && (
                <div className="flex gap-3 px-4 py-3 border border-rose-500/40 bg-rose-500/10">
                  <AlertTriangleIcon className="w-4 h-4 mt-0.5 shrink-0 text-rose-400" />
                  <p className="text-[11px] font-sans leading-relaxed text-rose-100/90">
                    <span className="font-bold">Admin feedback:</span> {initialTournament?.rejectionReason || "Please revise and resubmit."}
                  </p>
                </div>
              )}
              <div key={step} className="animate-fade-in">
                <StepBody draft={draft} onChange={update} />
              </div>
              {errorMsg && (
                <p className="flex items-center gap-2 px-3 py-2 text-xs font-mono text-rose-200 border border-rose-500/40 bg-rose-500/10">
                  <AlertTriangleIcon className="w-4 h-4 shrink-0 text-rose-400" />
                  {errorMsg}
                </p>
              )}
            </div>

            <footer className="mt-auto flex items-center justify-between gap-3 px-6 py-4 border-t border-white/[0.06] bg-black/20">
              <button
                type="button"
                onClick={() => (step === 0 ? onClose() : setStep((s) => s - 1))}
                className="h-10 px-5 text-[11px] font-mono font-bold uppercase tracking-wider text-slate-300 hover:text-white border border-white/10 hover:border-white/30 transition-colors"
              >
                {step === 0 ? "Cancel" : "← Back"}
              </button>
              <button
                type="submit"
                disabled={!canAdvance || isSubmitting}
                className="h-10 px-6 flex items-center gap-2 bg-primary-brand text-[var(--game-btn-text,#fff)] font-display text-xs font-black uppercase tracking-wider shadow-[inset_0_1px_0_rgba(255,255,255,0.6),0_10px_26px_-8px_rgba(var(--game-glow-rgb),0.7)] disabled:opacity-40 disabled:shadow-none transition"
              >
                {isSubmitting && <span className="w-3.5 h-3.5 border-2 border-black/30 border-t-black rounded-full animate-spin" />}
                {!isLast ? "Continue →" : isEditing ? (isRejected ? "Resubmit for review" : "Save changes") : "Submit for approval"}
              </button>
            </footer>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
