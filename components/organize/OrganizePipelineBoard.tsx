"use client";

import { useMemo, useState } from "react";
import { OrganizePipelineBoardProps, OrganizeStage } from "@/types";
import { ORGANIZE_STAGES, stageOf } from "@/lib/organize";
import { Skeleton } from "@/components/ui/Skeleton";
import OrganizeTournamentTile from "./OrganizeTournamentTile";
import OrganizeSectionHeading from "./OrganizeSectionHeading";
import { RAISED, RECESSED } from "./surfaces";

// Only the active stage (Live) carries the game accent; the rest stay neutral
// so the lanes read as one system rather than four competing colors.
const isAccent = (stage: OrganizeStage) => stage === "live";

export default function OrganizePipelineBoard({
  gameShortName,
  tournaments,
  isLoading,
  handlers,
  onHost,
}: OrganizePipelineBoardProps) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return tournaments.filter(
      (t) => !q || t.title.toLowerCase().includes(q) || (t.bracketFormat || "").toLowerCase().includes(q)
    );
  }, [tournaments, query]);

  return (
    <section aria-labelledby="organize-pipeline" className="space-y-5">
      <OrganizeSectionHeading
        index="02"
        id="organize-pipeline"
        title="Pipeline"
        subtitle={`Every ${gameShortName} tournament you host, by where it is in its lifecycle.`}
      >
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={`Search ${gameShortName} tournaments…`}
          aria-label="Search hosted tournaments"
          className={`h-9 w-full md:w-64 px-3 ${RECESSED} border border-white/[0.06] text-white text-xs font-sans placeholder:text-slate-600 focus:outline-none focus:border-primary-brand/60`}
        />
      </OrganizeSectionHeading>

      {!isLoading && tournaments.length === 0 && (
        <button
          type="button"
          onClick={onHost}
          className={`w-full py-12 ${RAISED} border-dashed !border-primary-brand/30 text-xs font-mono font-bold uppercase tracking-widest text-primary-brand/90 hover:text-primary-brand hover:!border-primary-brand/60 transition-colors`}
        >
          + Host your first {gameShortName} tournament
        </button>
      )}

      {/* One lane per lifecycle stage; empty lanes collapse to a single line so
          a lopsided pipeline (e.g. everything live) doesn't leave dead space. */}
      <div className="space-y-3">
        {ORGANIZE_STAGES.map((stage) => {
          const lane = filtered.filter((t) => stageOf(t) === stage.id);
          const collapsed = !isLoading && lane.length === 0;
          return (
            <div
              key={stage.id}
              className={`overflow-hidden ${RAISED} ${collapsed ? "opacity-60" : ""}`}
            >
              <div className={`relative flex items-center gap-3 px-4 py-3 bg-gradient-to-r ${isAccent(stage.id) && !collapsed ? "from-primary-brand/15 via-primary-brand/[0.03]" : "from-white/[0.05]"} to-transparent`}>
                <span className="relative flex w-2.5 h-2.5 shrink-0">
                  {stage.id === "live" && !collapsed && (
                    <span className="absolute inset-0 rounded-full bg-primary-brand animate-ping opacity-70" />
                  )}
                  <span className={`relative w-2.5 h-2.5 rounded-full ${isAccent(stage.id) ? "bg-primary-brand shadow-[0_0_10px_var(--primary-brand)]" : "bg-slate-500"}`} />
                </span>
                <span className="font-display text-sm font-black uppercase tracking-wide text-white">{stage.label}</span>
                <span className={`px-1.5 min-w-5 text-center text-[10px] font-mono font-bold tabular-nums border ${isAccent(stage.id) ? "text-primary-brand bg-primary-brand/10 border-primary-brand/30" : "text-slate-300 bg-white/5 border-white/10"}`}>
                  {isLoading ? "–" : lane.length}
                </span>
                <span className="hidden sm:inline text-[10px] font-mono text-slate-500 truncate">{stage.hint}</span>
                {collapsed && (
                  <span className="ml-auto text-[10px] font-mono uppercase tracking-widest text-slate-600">Nothing here</span>
                )}
              </div>

              {!collapsed && (
                <div className={`p-3.5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5 ${RECESSED}`}>
                  {isLoading ? (
                    <Skeleton className="h-64 rounded-none" />
                  ) : (
                    lane.map((t) => (
                      <OrganizeTournamentTile key={t.id} tournament={t} stage={stage.id} handlers={handlers} />
                    ))
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
