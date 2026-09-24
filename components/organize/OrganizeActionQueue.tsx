"use client";

import { useState } from "react";
import { OrganizeActionItem, OrganizeActionQueueProps } from "@/types";
import { AlertTriangleIcon, CheckCircleIcon, TrophyIcon, UsersIcon, ZapIcon } from "@/components/ui/Icons";
import { tournamentCover } from "@/lib/organize";
import OrganizeSectionHeading from "./OrganizeSectionHeading";
import { BRAND_BTN, BRAND_GLOW_HOVER, RAISED } from "./surfaces";


const ICONS = { edit: AlertTriangleIcon, applications: UsersIcon, bracket: TrophyIcon, start: ZapIcon };

export default function OrganizeActionQueue({ items, isLoading, handlers }: OrganizeActionQueueProps) {
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const run = async (item: OrganizeActionItem) => {
    const t = item.tournament;
    if (item.kind === "edit") return handlers.onEdit(t);
    if (item.kind === "applications") return handlers.onReviewApplications(t);
    if (item.kind === "bracket") return handlers.onOpenBracket(t);
    if (confirmingId !== item.id) return setConfirmingId(item.id);
    setBusyId(item.id);
    setError(null);
    try {
      await handlers.onStart(t.id);
      setConfirmingId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't start the tournament.");
    } finally {
      setBusyId(null);
    }
  };

  if (isLoading) return null;

  return (
    <section aria-labelledby="organize-queue" className="space-y-5">
      <OrganizeSectionHeading
        index="01"
        id="organize-queue"
        title="Needs your attention"
        subtitle={items.length > 0 ? `${items.length} open ${items.length === 1 ? "item" : "items"}, most urgent first` : undefined}
      />

      {items.length === 0 ? (
        <div className={`flex items-center gap-3 px-5 py-4 ${RAISED}`}>
          <span className="w-9 h-9 flex items-center justify-center bg-white/[0.06] border border-white/15">
            <CheckCircleIcon className="w-5 h-5 text-slate-200" />
          </span>
          <p className="text-sm font-sans text-slate-300">All caught up. Nothing is waiting on you right now.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {items.map((item) => {
            const Icon = ICONS[item.kind];
            const confirming = confirmingId === item.id;
            return (
              <article
                key={item.id}
                className={`group relative overflow-hidden flex flex-col gap-3 pl-5 pr-4 py-4 ${RAISED} transition-all duration-300 hover:-translate-y-0.5 hover:border-primary-brand/35 ${BRAND_GLOW_HOVER}`}
              >
                {/* Tournament art bleeding in from the right */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={tournamentCover(item.tournament)}
                  alt=""
                  className="absolute inset-y-0 right-0 w-1/2 h-full object-cover opacity-25 group-hover:opacity-40 transition-opacity [mask-image:linear-gradient(to_left,black,transparent)]"
                />
                <div aria-hidden className="absolute inset-0 bg-gradient-to-r from-primary-brand/10 to-transparent" />
                <span aria-hidden className="absolute left-0 top-0 h-full w-1 bg-primary-brand shadow-[0_0_14px_rgba(var(--game-glow-rgb),0.8)]" />

                <div className="relative flex items-start gap-3">
                  <span className="w-9 h-9 shrink-0 flex items-center justify-center text-primary-brand bg-primary-brand/10 border border-primary-brand/35">
                    <Icon className="w-4 h-4" />
                  </span>
                  <div className="min-w-0">
                    <h3 className="font-display text-base font-black uppercase text-white leading-tight">{item.title}</h3>
                    <p className="mt-0.5 text-[11px] font-mono text-slate-400 truncate">{item.tournament.title}</p>
                    <p className="mt-2 text-xs font-sans text-slate-300/80 line-clamp-2">
                      {confirming ? "This seeds the bracket and opens it to the public. Continue?" : item.detail}
                    </p>
                  </div>
                </div>
                {confirming && error && <p className="relative text-[11px] font-mono text-rose-400">{error}</p>}
                <div className="relative mt-auto flex items-center gap-2 pl-12">
                  <button
                    type="button"
                    disabled={busyId === item.id}
                    onClick={() => run(item)}
                    className={`h-8 px-4 text-[11px] font-display font-black uppercase tracking-wider ${BRAND_BTN} disabled:opacity-50`}
                  >
                    {busyId === item.id ? "Starting…" : confirming ? "Confirm & go live" : `${item.cta} →`}
                  </button>
                  {confirming && (
                    <button
                      type="button"
                      onClick={() => {
                        setConfirmingId(null);
                        setError(null);
                      }}
                      className="h-8 px-3 text-[11px] font-mono font-bold uppercase text-slate-400 hover:text-white"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
