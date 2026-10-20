"use client";

import { useConfirm } from "@/context/ConfirmContext";
import { useState } from "react";
import { tournamentsService } from "@/services/tournamentsService";
import { TournamentStreamPanelProps } from "@/types";
import TournamentStreamEditorRow from "./TournamentStreamEditorRow";

/** Organizer controls for every broadcast this tournament runs. */
export default function TournamentStreamPanel({ tournamentId, streams, rounds, onSaved }: TournamentStreamPanelProps) {
  const confirm = useConfirm();
  const [adding, setAdding] = useState(streams.length === 0);

  const matchOptions = rounds.flatMap((r) =>
    r.matches.map((m) => ({ id: m.id, label: `${r.name}: ${m.team1.name} vs ${m.team2.name}` })),
  );

  return (
    <div className="p-5 bg-[#0A0D18] border border-rose-500/30 space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <span className="text-[10px] font-mono text-rose-400 uppercase tracking-widest block mb-1">
            Live streams · {streams.length}
          </span>
          <p className="font-sans text-xs text-slate-400 max-w-xl">
            Add one stream per broadcast — YouTube, Twitch, or public Facebook Live. Running matches in parallel? Add a
            stream for each; viewers see them side by side and can pick one. Link a stream to its match so the bracket
            marks it as on stream.
          </p>
        </div>
        {!adding && (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="h-9 px-4 font-mono text-[11px] font-black uppercase tracking-wider text-white bg-rose-600 hover:bg-rose-500 shrink-0"
          >
            + Add stream
          </button>
        )}
      </div>

      {streams.map((s) => (
        <TournamentStreamEditorRow
          key={`${s.id}-${s.url}-${s.matchId ?? ""}-${s.isLive}-${s.label ?? ""}`}
          stream={s}
          matchOptions={matchOptions}
          onSubmit={async (input) => {
            await tournamentsService.updateStreamEntry(tournamentId, s.id, input);
            onSaved();
          }}
          onRemove={async () => {
            if (!(await confirm({ title: "Remove this stream?", message: "Viewers will no longer see it on the Watch tab.", confirmLabel: "Remove", tone: "danger" }))) return;
            await tournamentsService.removeStream(tournamentId, s.id);
            onSaved();
          }}
        />
      ))}

      {adding && (
        <TournamentStreamEditorRow
          matchOptions={matchOptions}
          onSubmit={async (input) => {
            await tournamentsService.addStream(tournamentId, input);
            setAdding(false);
            onSaved();
          }}
          onCancel={streams.length > 0 ? () => setAdding(false) : undefined}
        />
      )}
    </div>
  );
}
