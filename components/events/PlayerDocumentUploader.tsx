"use client";

import { useRef, useState } from "react";
import { EventDocument, EventDocumentKind, RosterPlayer } from "@/types";
import { eventsService } from "@/services/eventsService";

interface PlayerDocumentUploaderProps {
  token: string;
  player: RosterPlayer;
  documents: EventDocument[];
  disabled: boolean;
  onChanged: (documents: EventDocument[]) => void;
}

const KINDS: { kind: EventDocumentKind; label: string; accept: string }[] = [
  { kind: "COR", label: "Certificate of Registration", accept: "application/pdf" },
  { kind: "SCHOOL_ID", label: "School ID", accept: "image/jpeg,image/png" },
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

  return (
    <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-4">
      <div className="mb-3">
        <p className="font-display text-sm text-white">{player.fullName}</p>
        <p className="text-xs text-white/40">
          {player.studentNumber} · {player.ign}
          {player.isSubstitute && " · substitute"}
        </p>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        {KINDS.map(({ kind, label, accept }) => {
          const doc = existing(kind);
          const inputId = `${player.id}-${kind}`;

          return (
            <div
              key={kind}
              className="rounded-lg border border-white/10 bg-black/30 p-3"
            >
              <p className="text-[11px] uppercase tracking-wider text-white/40 mb-2">
                {label}
              </p>

              {doc ? (
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-xs text-emerald-200">
                    {doc.filename}
                  </span>
                  {!disabled && (
                    <button
                      type="button"
                      onClick={() => remove(doc.id)}
                      className="shrink-0 text-xs text-white/40 hover:text-red-300 transition"
                    >
                      Replace
                    </button>
                  )}
                </div>
              ) : (
                <>
                  <input
                    id={inputId}
                    ref={(el) => {
                      inputs.current[inputId] = el;
                    }}
                    type="file"
                    accept={accept}
                    disabled={disabled || busy === kind}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) void upload(kind, file);
                    }}
                    className="block w-full text-xs text-white/50 file:mr-3 file:rounded-md file:border-0 file:bg-white/10 file:px-3 file:py-1.5 file:text-xs file:text-white hover:file:bg-white/15 disabled:opacity-40"
                  />
                  {busy === kind && (
                    <p className="mt-1 text-xs text-white/40">Uploading…</p>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>

      {error && <p className="mt-2 text-xs text-red-300">{error}</p>}
    </div>
  );
}
