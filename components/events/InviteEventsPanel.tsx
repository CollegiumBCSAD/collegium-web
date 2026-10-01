"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MyEventSquad } from "@/types";
import { eventsService } from "@/services/eventsService";
import { LockIcon } from "@/components/ui/Icons";
import { CARD, MONO_LABEL, TEAM_STATUS, eventCover } from "./eventSurfaces";

/** Accepts a bare code or a pasted invite link and returns the code. */
const parseInviteCode = (raw: string) => {
  const value = raw.trim();
  const fromUrl = value.match(/\/events\/([^/?#\s]+)/i)?.[1];
  return (fromUrl ?? value).replace(/[^A-Za-z0-9]/g, "").toUpperCase();
};

// Rendered only for signed-in athletes. Squads come from the account (matched
// by verified captain email), never from this browser, so a shared computer
// can't leak someone else's sign-up.
export default function InviteEventsPanel() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState<string | null>(null);
  const [squads, setSquads] = useState<MyEventSquad[]>([]);

  useEffect(() => {
    let cancelled = false;
    eventsService
      .getMySquads()
      .then((data) => {
        if (cancelled || !Array.isArray(data)) return;
        setSquads([...data].sort((x, y) => y.createdAt.localeCompare(x.createdAt)));
      })
      .catch(() => !cancelled && setSquads([]));
    return () => {
      cancelled = true;
    };
  }, []);

  const join = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseInviteCode(code);
    if (parsed.length < 4) {
      setCodeError("Enter the invite code your organizer shared.");
      return;
    }
    setCodeError(null);
    router.push(`/events/${parsed}`);
  };

  return (
    <section className={`relative overflow-hidden ${CARD}`}>
      <span aria-hidden className="absolute left-6 top-0 h-[3px] w-12 rounded-b-full bg-primary-brand" />

      <div className={`grid ${squads.length ? "lg:grid-cols-[minmax(0,340px)_1fr]" : ""}`}>
        {/* Code entry */}
        <form onSubmit={join} className="p-6 sm:p-7 flex flex-col justify-center">
          <span className="flex items-center gap-2 text-[10px] font-mono font-bold uppercase tracking-[0.25em] text-primary-brand">
            <LockIcon className="w-3 h-3" />
            Invite-only events
          </span>
          <div className={squads.length ? "" : "sm:flex sm:items-end sm:justify-between sm:gap-8"}>
            <div>
              <h2 className="mt-2 font-display text-2xl font-black uppercase leading-tight text-white">
                Got a department code?
              </h2>
              <p className="mt-1 text-xs text-slate-400">
                Intra-department cups don&apos;t affect rankings. Paste the code or link
                your organizer shared.
              </p>
            </div>

            <div className={`mt-4 ${squads.length ? "" : "sm:mt-0 sm:w-[380px] sm:shrink-0"}`}>
              <div className="flex gap-2">
                <label htmlFor="invite-code" className="sr-only">
                  Invite code
                </label>
                <input
                  id="invite-code"
                  value={code}
                  onChange={(e) => {
                    setCode(e.target.value);
                    setCodeError(null);
                  }}
                  placeholder="XGTPHWY2"
                  autoComplete="off"
                  spellCheck={false}
                  className="h-11 min-w-0 flex-1 rounded-xl bg-[#0E121C] border border-white/10 px-4 font-mono text-sm uppercase tracking-[0.2em] text-white placeholder:text-slate-600 placeholder:tracking-[0.2em] focus:outline-none focus:border-primary-brand/70 transition"
                />
                <button type="submit" className="game-theme-btn h-11 px-5 gap-2 text-xs shrink-0">
                  Join
                  <span>→</span>
                </button>
              </div>
              {codeError && <p className="mt-2 text-xs text-rose-300">{codeError}</p>}
            </div>
          </div>
        </form>

        {/* Squads this user captains */}
        {squads.length > 0 && (
          <div className="border-t lg:border-t-0 lg:border-l border-white/[0.06] p-6 sm:p-7 min-w-0">
            <div className="flex items-baseline justify-between gap-3">
              <span className={MONO_LABEL}>Your squads</span>
              <span className="text-[10px] font-mono uppercase tracking-widest text-slate-600">
                {squads.length} registered
              </span>
            </div>

            <ul className="mt-3 flex gap-3 overflow-x-auto pb-1 snap-x">
              {squads.map((squad) => {
                const status = TEAM_STATUS[squad.status];
                return (
                  <li key={squad.id} className="snap-start shrink-0 w-[260px]">
                    <Link
                      href={`/events/team/${squad.editToken}`}
                      className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-white/[0.08] bg-black/40 transition-all duration-300 hover:-translate-y-0.5 hover:border-white/20"
                    >
                      <span aria-hidden className={`absolute left-0 inset-y-0 w-1 z-10 ${status.bar}`} />
                      <div className="relative h-16 overflow-hidden">
                        <Image
                          src={eventCover(squad.event.gameTitle)}
                          alt=""
                          fill
                          sizes="260px"
                          className="object-cover opacity-50 transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0D16] to-transparent" />
                        <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-widest text-white bg-black/55 backdrop-blur-md border border-white/15">
                          {squad.event.gameTitle}
                        </span>
                      </div>
                      <div className="relative flex-1 px-4 pb-4 -mt-3">
                        <p className="truncate text-[10px] font-mono uppercase tracking-[0.2em] text-slate-500">
                          {squad.event.name}
                        </p>
                        <p className="mt-0.5 truncate font-display text-lg font-black uppercase leading-tight text-white">
                          {squad.name}
                        </p>
                        <div className="mt-3 flex items-center justify-between gap-2">
                          <span
                            className={`flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-[0.15em] ${status.text}`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full bg-current ${squad.status === "PENDING" ? "animate-pulse" : ""}`} />
                            {status.label}
                          </span>
                          <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-slate-500 group-hover:text-white transition-colors">
                            Open <span className="text-primary-brand">→</span>
                          </span>
                        </div>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
