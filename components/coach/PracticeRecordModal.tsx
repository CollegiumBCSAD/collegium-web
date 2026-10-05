"use client";

import { useEffect, useState } from "react";
import { coachService } from "@/services";
import { PracticeRecordModalProps, PracticeResult, PracticeScanResult } from "@/types";
import { RAISED, RECESSED, BRAND_BTN } from "@/components/organize/surfaces";
import { UploadIcon, AlertTriangleIcon, CheckCircleIcon } from "@/components/ui/Icons";

const INPUT = `${RECESSED} h-10 px-3 rounded-lg border border-white/[0.06] focus:border-primary-brand text-sm text-white font-sans focus:outline-none w-full`;

// Scrim OCR logging: upload a scoreboard, let OCR read the outcome, and have
// the coach confirm (or correct) it before an unranked practice record is saved.
export default function PracticeRecordModal({ teamId, schedules, isOpen, onClose, onSaved }: PracticeRecordModalProps) {
  const [scheduleId, setScheduleId] = useState("");
  const [opponentName, setOpponentName] = useState("");
  const [result, setResult] = useState<PracticeResult | null>(null);
  const [completed, setCompleted] = useState(true);
  const [scan, setScan] = useState<PracticeScanResult | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

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

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setIsScanning(true);
    setError("");
    try {
      const res = await coachService.scanPracticeRecord(teamId, file);
      setScan(res);
      setResult(res.detectedResult);
      setCompleted(res.completed);
    } catch (err: unknown) {
      setScan(null);
      setError(`${err instanceof Error ? err.message : "Scan failed."} You can still enter the result manually.`);
    } finally {
      setIsScanning(false);
    }
  };

  const handleSave = async () => {
    if (!result) {
      setError("Pick the result before saving.");
      return;
    }
    setIsSaving(true);
    setError("");
    // A record counts as OCR-sourced only when the coach kept the OCR's reading.
    const keptOcr = scan?.detectedResult !== null && scan?.detectedResult === result;
    try {
      await coachService.createPracticeRecord(teamId, {
        scheduleId: scheduleId || undefined,
        opponentName: opponentName.trim() || undefined,
        result,
        completed,
        source: keptOcr ? "OCR" : "MANUAL",
        ocrConfidence: keptOcr ? scan?.confidence : undefined,
      });
      onSaved();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Could not save the record.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md" onClick={onClose}>
      <div className={`${RAISED} w-full max-w-md rounded-2xl p-5 space-y-4 max-h-[90vh] overflow-y-auto`} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="font-display text-lg font-black uppercase tracking-wide text-white">Log Scrim Result</h2>
            <p className="text-[11px] font-sans text-slate-400">Unranked practice entry — never affects Glicko-2 ratings.</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close Modal" className="text-slate-400 hover:text-white text-xl leading-none cursor-pointer">
            ×
          </button>
        </div>

        <select value={scheduleId} onChange={(e) => setScheduleId(e.target.value)} aria-label="Practice session" className={INPUT}>
          <option value="" className="bg-[#0A0D16]">No linked practice session</option>
          {schedules.map((s) => (
            <option key={s.id} value={s.id} className="bg-[#0A0D16]">
              {s.title} — {new Date(s.startsAt).toLocaleDateString()}
            </option>
          ))}
        </select>
        <input className={INPUT} value={opponentName} maxLength={80} onChange={(e) => setOpponentName(e.target.value)} placeholder="Opponent (optional)" />

        <label className={`${RECESSED} flex flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-white/15 p-4 cursor-pointer hover:border-primary-brand`}>
          <UploadIcon className="w-5 h-5 text-primary-brand" />
          <span className="text-xs font-sans text-slate-300">{isScanning ? "Reading scoreboard..." : "Upload scoreboard screenshot"}</span>
          <input type="file" accept="image/*" className="hidden" disabled={isScanning} onChange={(e) => handleFile(e.target.files?.[0])} />
        </label>

        {scan && (
          <div className={`flex items-start gap-2 p-3 rounded-xl text-xs font-sans ${scan.isConfident ? "bg-emerald-500/10 text-emerald-300" : "bg-amber-500/10 text-amber-300"}`}>
            {scan.isConfident ? <CheckCircleIcon className="w-4 h-4 shrink-0" /> : <AlertTriangleIcon className="w-4 h-4 shrink-0" />}
            <span>
              {scan.isConfident
                ? `Read ${scan.detectedResult} with ${Math.round(scan.confidence * 100)}% confidence (${scan.rosterMatched} of your players recognised).`
                : "Low confidence read — confirm or set the result yourself below."}
            </span>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2">
          {(["WIN", "LOSS"] as PracticeResult[]).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setResult(r)}
              className={`h-10 rounded-lg text-xs font-mono font-black uppercase cursor-pointer border ${
                result === r
                  ? r === "WIN" ? "border-emerald-400 bg-emerald-500/15 text-emerald-300" : "border-rose-400 bg-rose-500/15 text-rose-300"
                  : "border-white/[0.07] bg-black/30 text-slate-400"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
        <label className="flex items-center gap-2 text-xs font-sans text-slate-300">
          <input type="checkbox" checked={completed} onChange={(e) => setCompleted(e.target.checked)} />
          Scrim was played to completion
        </label>

        {error && <p className="text-xs font-sans text-rose-400">{error}</p>}

        <button type="button" onClick={handleSave} disabled={isSaving || isScanning} className={`w-full h-10 rounded-lg text-xs font-mono font-black uppercase tracking-wider cursor-pointer disabled:opacity-50 ${BRAND_BTN}`}>
          {isSaving ? "Saving..." : "Confirm Record"}
        </button>
      </div>
    </div>
  );
}
