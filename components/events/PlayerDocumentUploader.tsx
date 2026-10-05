"use client";

import { useRef, useState } from "react";
import { EventDocument, EventDocumentKind, RosterPlayer } from "@/types";
import { eventsService } from "@/services/eventsService";
import { CheckCircleIcon, UploadIcon } from "@/components/ui/Icons";
import { CARD, MONO_LABEL } from "./eventSurfaces";

interface PlayerDocumentUploaderProps {
  token: string;
  player: RosterPlayer;
  documents: EventDocument[];
  disabled: boolean;
  onChanged: (documents: EventDocument[]) => void;
}

const KINDS: { kind: EventDocumentKind; label: string; accept: string; hint: string }[] = [
  { kind: "COR", label: "Certificate of Registration", accept: "application/pdf", hint: "PDF" },
  { kind: "SCHOOL_ID", label: "School ID", accept: "image/jpeg,image/png", hint: "JPG or PNG" },
];

export default function PlayerDocumentUploader({
  token,
  player,
  documents,
  disabled,
  onChanged,
}: PlayerDocumentUploaderProps) {
  const [busy, setBusy] = useState<EventDocumentKind | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputs = useRef<Record<string, HTMLInputElement | null>>({});

  const existing = (kind: EventDocumentKind) =>
    documents.find(
      (doc) => doc.rosterPlayerId === player.id && doc.kind === kind,
    );

  const upload = async (kind: EventDocumentKind, file: File) => {
    if (!player.id) return;
    setBusy(kind);
    setError(null);
    try {
      await eventsService.uploadTeamDocument(token, player.id, kind, file);
      onChanged(await eventsService.getTeamDocuments(token));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setBusy(null);
    }
  };

  const remove = async (documentId: string) => {
    setError(null);
    try {
      await eventsService.deleteTeamDocument(token, documentId);
      onChanged(await eventsService.getTeamDocuments(token));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not remove it.");
    }
  };

  const done = KINDS.filter(({ kind }) => existing(kind)).length;

  return (
    <div className={`relative overflow-hidden ${CARD} p-5 sm:p-6`}>
      <span
        aria-hidden
        className={`absolute inset-y-0 left-0 w-1 ${done === KINDS.length ? "bg-emerald-400 shadow-[0_0_14px_rgba(52,211,153,0.6)]" : "bg-white/10"}`}
      />

      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-display text-xl font-black uppercase tracking-tight text-white truncate">
            {player.fullName}
            {player.isSubstitute && (
              <span className="ml-2 align-middle rounded-full border border-white/10 px-1.5 py-0.5 text-[9px] font-mono font-normal tracking-widest text-slate-400">
                SUB
              </span>
            )}
          </p>
          <p className="text-xs text-slate-500">
            <span className="font-mono">{player.studentNumber}</span>
            <span className="text-slate-600"> · </span>
            {player.ign}
          </p>
        </div>
        <span
          className={`shrink-0 text-[10px] font-mono font-bold uppercase tracking-widest ${
            done === KINDS.length ? "text-emerald-300" : "text-slate-500"
          }`}
        >
          {done}/{KINDS.length}
        </span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
        {KINDS.map(({ kind, label, accept, hint }) => {
          const doc = existing(kind);
          const inputId = `${player.id}-${kind}`;
          const isBusy = busy === kind;
          const isDisabled = disabled || isBusy;

          return (
            <div key={kind} className="flex flex-col gap-1.5">
              <p className={MONO_LABEL}>{label}</p>

              {doc ? (
                <div className="flex items-center justify-between gap-2 rounded-xl border border-emerald-400/25 bg-emerald-500/[0.07] px-3 py-3">
                  <span className="flex items-center gap-2 min-w-0">
                    <CheckCircleIcon className="w-4 h-4 shrink-0 text-emerald-400" />
                    <span className="truncate text-xs text-emerald-100">
                      {doc.filename}
                    </span>
                  </span>
                  {!disabled && (
                    <button
                      type="button"
                      onClick={() => remove(doc.id)}
                      className="shrink-0 text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400 hover:text-red-300 transition"
                    >
                      Replace
                    </button>
                  )}
                </div>
              ) : (
                <label
                  htmlFor={inputId}
                  className={`group flex items-center gap-3 rounded-xl border border-dashed px-3 py-3 transition ${
                    isDisabled
                      ? "border-white/10 bg-black/20 opacity-50 cursor-not-allowed"
                      : "border-white/15 bg-black/35 cursor-pointer hover:border-primary-brand/60 hover:bg-primary-brand/[0.06]"
                  }`}
                >
                  <span className="w-9 h-9 shrink-0 flex items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-slate-400 group-hover:text-primary-brand transition">
                    <UploadIcon className={`w-4 h-4 ${isBusy ? "animate-pulse" : ""}`} />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-xs text-white">
                      {isBusy ? "Uploading…" : "Choose file"}
                    </span>
                    <span className="block text-[10px] font-mono uppercase tracking-widest text-slate-500">
                      {hint}
                    </span>
                  </span>
                  <input
                    id={inputId}
                    ref={(el) => {
                      inputs.current[inputId] = el;
                    }}
                    type="file"
                    accept={accept}
                    disabled={isDisabled}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) void upload(kind, file);
                    }}
                    className="sr-only"
                  />
                </label>
              )}
            </div>
          );
        })}
      </div>

      {error && <p className="mt-3 text-xs text-red-300">{error}</p>}
    </div>
  );
}
