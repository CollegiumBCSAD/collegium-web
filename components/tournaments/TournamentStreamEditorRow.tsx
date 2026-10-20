"use client";

import { useState } from "react";
import { TournamentStreamEditorRowProps } from "@/types";

const INPUT =
  "w-full h-10 px-3 bg-[#05070E] border border-[#1E293B] text-xs font-mono text-white placeholder:text-slate-600 focus:outline-none focus:border-rose-500/50";
const LABEL = "text-[10px] font-mono text-slate-400 uppercase tracking-widest";

/** Edits one stream, or drafts a new one when no `stream` is given. */
export default function TournamentStreamEditorRow({ stream, matchOptions, onSubmit, onRemove, onCancel }: TournamentStreamEditorRowProps) {
  const [url, setUrl] = useState(stream?.url ?? "");
  const [label, setLabel] = useState(stream?.label ?? "");
  const [matchId, setMatchId] = useState(stream?.matchId ?? "");
  const [isLive, setIsLive] = useState(stream?.isLive ?? true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = async (action: () => Promise<void>) => {
    setBusy(true);
    setError(null);
    try {
      await action();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't save this stream");
    } finally {
      setBusy(false);
    }
  };

  const save = () => {
    if (!url.trim()) {
      setError("Paste the stream link first.");
      return;
    }
    void run(() => onSubmit({ url: url.trim(), label: label.trim() || null, matchId: matchId || null, isLive }));
  };

  return (
    <div className={`p-4 border space-y-3 ${stream ? "border-[#1E293B] bg-[#070A12]" : "border-dashed border-rose-500/40 bg-rose-500/[0.03]"}`}>
      <div className="grid gap-3 sm:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <label className="block space-y-1.5">
          <span className={LABEL}>Stream link</span>
          <input type="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://youtube.com/live/…" className={INPUT} />
        </label>
        <label className="block space-y-1.5">
          <span className={LABEL}>Name (optional)</span>
          <input value={label} onChange={(e) => setLabel(e.target.value)} maxLength={60} placeholder="Main stage" className={INPUT} />
        </label>
      </div>

      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
        <label className="block space-y-1.5">
          <span className={LABEL}>Showing match (optional)</span>
          <select value={matchId} onChange={(e) => setMatchId(e.target.value)} className={INPUT}>
            <option value="">— none —</option>
            {matchOptions.map((m) => (
              <option key={m.id} value={m.id}>
                {m.label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex h-10 items-center gap-2 cursor-pointer select-none">
          <input type="checkbox" checked={isLive} onChange={(e) => setIsLive(e.target.checked)} className="accent-rose-500" />
          <span className="text-xs font-mono text-slate-300 uppercase tracking-wider">Live now</span>
        </label>
      </div>

      {error && <p className="text-xs font-mono text-rose-400">{error}</p>}

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={save}
          disabled={busy}
          className="h-9 px-4 font-mono text-[11px] font-black uppercase tracking-wider text-white bg-rose-600 hover:bg-rose-500 disabled:opacity-50"
        >
          {busy ? "Saving…" : stream ? "Save" : "Add stream"}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} disabled={busy} className="h-9 px-3 font-mono text-[11px] font-bold uppercase tracking-wider text-slate-400 hover:text-white">
            Cancel
          </button>
        )}
        {onRemove && (
          <button
            type="button"
            onClick={() => void run(onRemove)}
            disabled={busy}
            className="ml-auto h-9 px-3 font-mono text-[11px] font-bold uppercase tracking-wider text-slate-500 hover:text-rose-400"
          >
            Remove
          </button>
        )}
      </div>
    </div>
  );
}
