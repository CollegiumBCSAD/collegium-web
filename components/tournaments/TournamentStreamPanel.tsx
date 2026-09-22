"use client";

import { useState } from "react";
import { tournamentsService } from "@/services/tournamentsService";
import { BracketRound } from "@/types";

interface TournamentStreamPanelProps {
  tournamentId: string;
  streamUrl?: string | null;
  streamIsLive?: boolean;
  featuredMatchId?: string | null;
  rounds: BracketRound[];
  onSaved: () => void;
}

function matchLabel(rounds: BracketRound[], matchId: string): string {
  for (const round of rounds) {
    const match = round.matches.find((m) => m.id === matchId);
    if (match) {
      return `${round.name}: ${match.team1.name} vs ${match.team2.name}`;
    }
  }
  return matchId;
}

export default function TournamentStreamPanel({
  tournamentId,
  streamUrl,
  streamIsLive,
  featuredMatchId,
  rounds,
  onSaved,
}: TournamentStreamPanelProps) {
  const [url, setUrl] = useState(streamUrl ?? "");
  const [live, setLive] = useState(Boolean(streamIsLive));
  const [featured, setFeatured] = useState(featuredMatchId ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  const allMatches = rounds.flatMap((r) =>
    r.matches.map((m) => ({ id: m.id, label: `${r.name}: ${m.team1.name} vs ${m.team2.name}` }))
  );

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setOk(false);
    try {
      await tournamentsService.updateStream(tournamentId, {
        streamUrl: url.trim() || null,
        streamIsLive: live,
        featuredMatchId: featured.trim() || null,
      });
      setOk(true);
      onSaved();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save stream settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-5 bg-[#0A0D18] border border-rose-500/30 space-y-4">
      <div>
        <span className="text-[10px] font-mono text-rose-400 uppercase tracking-widest block mb-1">
          Official Broadcast
        </span>
        <p className="font-sans text-xs text-slate-400">
          One stream for this tournament. Paste YouTube / Twitch / public Facebook Live. Set &quot;On stream now&quot; so the Watch desk highlights that match.
        </p>
      </div>

      <label className="block space-y-1.5">
        <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">
          Stream URL
        </span>
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://twitch.tv/…"
          className="w-full h-10 px-3 bg-[#05070E] border border-[#1E293B] text-xs font-mono text-white placeholder:text-slate-600 focus:outline-none focus:border-rose-500/50"
        />
      </label>

      <label className="flex items-center gap-2 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={live}
          onChange={(e) => setLive(e.target.checked)}
          className="accent-rose-500"
        />
        <span className="text-xs font-mono text-slate-300 uppercase tracking-wider">
          We&apos;re live now
        </span>
      </label>

      <label className="block space-y-1.5">
        <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">
          On stream now (optional)
        </span>
        <select
          value={featured}
          onChange={(e) => setFeatured(e.target.value)}
          className="w-full h-10 px-3 bg-[#05070E] border border-[#1E293B] text-xs font-mono text-white focus:outline-none focus:border-rose-500/50"
        >
          <option value="">— none —</option>
          {allMatches.map((m) => (
            <option key={m.id} value={m.id}>
              {m.label}
            </option>
          ))}
        </select>
        {featuredMatchId && !allMatches.some((m) => m.id === featuredMatchId) && (
          <p className="text-[10px] font-mono text-slate-500">
            Current: {matchLabel(rounds, featuredMatchId)}
          </p>
        )}
      </label>

      {error && <p className="text-xs font-mono text-rose-400">{error}</p>}
      {ok && <p className="text-xs font-mono text-emerald-400">Stream settings saved.</p>}

      <button
        type="button"
        onClick={handleSave}
        disabled={saving}
        className="h-10 px-5 font-mono text-xs font-black uppercase tracking-wider text-white bg-rose-600 hover:bg-rose-500 disabled:opacity-50 cursor-pointer"
      >
        {saving ? "Saving…" : "Save Stream"}
      </button>
    </div>
  );
}
