"use client";

import { useState } from "react";
import { EventInvite, EventTeam, RosterPlayer } from "@/types";
import { eventsService } from "@/services/eventsService";
import { PlusIcon, UsersIcon } from "@/components/ui/Icons";
import RosterPlayerFields from "./RosterPlayerFields";
import { CARD, FIELD, MONO_LABEL, SECTION_TITLE } from "./eventSurfaces";

interface EventSignupFormProps {
  invite: EventInvite;
  code: string;
  onSubmitted: (team: EventTeam) => void;
}

const STARTERS = 5;

const blankPlayer = (isSubstitute: boolean): RosterPlayer => ({
  fullName: "",
  studentNumber: "",
  ign: "",
  isSubstitute,
});

const isComplete = (p: RosterPlayer) =>
  !!p.fullName.trim() && !!p.studentNumber.trim() && !!p.ign.trim();

export default function EventSignupForm({
  invite,
  code,
  onSubmitted,
}: EventSignupFormProps) {
  const [teamName, setTeamName] = useState("");
  const [captainName, setCaptainName] = useState("");
  const [captainEmail, setCaptainEmail] = useState("");
  const [roster, setRoster] = useState<RosterPlayer[]>(
    Array.from({ length: STARTERS }, () => blankPlayer(false)),
  );
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const substitutes = roster.filter((p) => p.isSubstitute);

  const updatePlayer = (index: number, patch: Partial<RosterPlayer>) =>
    setRoster((prev) =>
      prev.map((player, i) => (i === index ? { ...player, ...patch } : player)),
    );

  const addSubstitute = () =>
    setRoster((prev) => [...prev, blankPlayer(true)]);

  const removePlayer = (index: number) =>
    setRoster((prev) => prev.filter((_, i) => i !== index));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const incomplete = roster.some(
      (p) => !p.fullName.trim() || !p.studentNumber.trim() || !p.ign.trim(),
    );
    if (!teamName.trim() || !captainName.trim() || !captainEmail.trim()) {
      setError("Fill in the team name and captain details.");
      return;
    }
    if (incomplete) {
      setError("Every player needs a name, student number, and in-game name.");
      return;
    }

    setSubmitting(true);
    try {
      const team = await eventsService.submitTeam(code, {
        name: teamName.trim(),
        captainName: captainName.trim(),
        captainEmail: captainEmail.trim(),
        roster,
      });
      onSubmitted(team);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not send your sign-up. Try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Display-only progress for the summary rail.
  const squadDone = [teamName, captainName, captainEmail].filter((v) => v.trim()).length;
  const playersDone = roster.filter(isComplete).length;
  const checklist = [
    { label: "Squad details", value: `${squadDone}/3`, done: squadDone === 3 },
    { label: "Starters", value: `${roster.filter((p) => !p.isSubstitute && isComplete(p)).length}/${STARTERS}`, done: roster.filter((p) => !p.isSubstitute).every(isComplete) },
    { label: "Substitutes", value: `${substitutes.length}/${invite.maxSubs}`, done: substitutes.every(isComplete), optional: true },
  ];
  const totalFields = 3 + roster.length;
  const filled = squadDone + playersDone;

  return (
    <form onSubmit={submit} className="grid gap-8 lg:grid-cols-[1fr_320px] lg:items-start">
      <div className="space-y-10 min-w-0">
        {/* Squad */}
        <section className="space-y-5">
          <div className="flex items-baseline gap-3">
            <span className="font-display text-2xl font-black tabular-nums text-transparent [-webkit-text-stroke:1px_var(--primary-brand)]">
              01
            </span>
            <h2 className={SECTION_TITLE}>Your squad</h2>
          </div>

          <div className={`relative overflow-hidden ${CARD} p-5 sm:p-6`}>
            <span aria-hidden className="absolute left-6 top-0 h-[3px] w-12 rounded-b-full bg-primary-brand" />
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label htmlFor="team-name" className={`block mb-1.5 ${MONO_LABEL}`}>
                  Team name
                </label>
                <input
                  id="team-name"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  className={FIELD}
                  placeholder="Byte Force"
                />
              </div>
              <div>
                <label htmlFor="captain-name" className={`block mb-1.5 ${MONO_LABEL}`}>
                  Your name (captain)
                </label>
                <input
                  id="captain-name"
                  value={captainName}
                  onChange={(e) => setCaptainName(e.target.value)}
                  className={FIELD}
                  placeholder="Juan Dela Cruz"
                />
              </div>
              <div>
                <label htmlFor="captain-email" className={`block mb-1.5 ${MONO_LABEL}`}>
                  Your email
                </label>
                <input
                  id="captain-email"
                  type="email"
                  value={captainEmail}
                  onChange={(e) => setCaptainEmail(e.target.value)}
                  className={FIELD}
                  placeholder="juan@umak.edu.ph"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Roster */}
        <section className="space-y-5">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <div className="flex items-baseline gap-3">
              <span className="font-display text-2xl font-black tabular-nums text-transparent [-webkit-text-stroke:1px_var(--primary-brand)]">
                02
              </span>
              <h2 className={SECTION_TITLE}>Roster</h2>
            </div>
            <span className={MONO_LABEL}>
              {STARTERS} starters · up to {invite.maxSubs} subs
            </span>
          </div>

          <div className="space-y-3">
            {roster.map((player, index) => (
              <RosterPlayerFields
                key={index}
                index={index}
                player={player}
                onChange={updatePlayer}
                onRemove={player.isSubstitute ? removePlayer : undefined}
              />
            ))}
          </div>

          {substitutes.length < invite.maxSubs && (
            <button
              type="button"
              onClick={addSubstitute}
              className="group w-full flex items-center justify-center gap-2 rounded-2xl border border-dashed border-white/15 py-4 text-[11px] font-mono font-bold uppercase tracking-[0.2em] text-slate-400 hover:text-white hover:border-primary-brand/50 hover:bg-primary-brand/[0.05] transition"
            >
              <PlusIcon className="w-3.5 h-3.5 transition-transform duration-300 group-hover:rotate-90" />
              Add substitute ({substitutes.length}/{invite.maxSubs})
            </button>
          )}
        </section>
      </div>

      {/* Summary rail */}
      <aside className="lg:sticky lg:top-24">
        <div className={`relative overflow-hidden ${CARD} p-6`}>
          <span aria-hidden className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-primary-brand via-primary-brand/40 to-transparent" />
          <div className="flex items-center gap-2">
            <UsersIcon className="w-4 h-4 text-primary-brand" />
            <span className={MONO_LABEL}>Sign-up checklist</span>
          </div>

          <p className="mt-3 font-display text-4xl font-black tabular-nums leading-none text-white">
            {filled}
            <span className="text-slate-600">/{totalFields}</span>
          </p>
          <div className="mt-3 flex gap-1">
            {Array.from({ length: totalFields }, (_, i) => (
              <span
                key={i}
                className={`h-1.5 flex-1 rounded-full ${
                  i < filled ? "bg-primary-brand shadow-[0_0_8px_var(--primary-brand)]" : "bg-white/10"
                }`}
              />
            ))}
          </div>

          <ul className="mt-5 space-y-2.5">
            {checklist.map((item) => (
              <li key={item.label} className="flex items-center justify-between gap-3 text-sm">
                <span className="flex items-center gap-2.5 text-slate-300">
                  <span
                    className={`w-4 h-4 rounded-full border flex items-center justify-center text-[9px] ${
                      item.done
                        ? "border-emerald-400/60 bg-emerald-500/20 text-emerald-300"
                        : "border-white/15 text-transparent"
                    }`}
                  >
                    ✓
                  </span>
                  {item.label}
                  {item.optional && <span className="text-[9px] font-mono uppercase tracking-widest text-slate-600">optional</span>}
                </span>
                <span className="font-mono text-xs tabular-nums text-slate-400">{item.value}</span>
              </li>
            ))}
          </ul>

          {error && (
            <p className="mt-5 rounded-xl border border-rose-400/30 bg-rose-500/10 px-3.5 py-2.5 text-xs text-rose-200">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="game-theme-btn mt-6 h-12 w-full gap-2 text-sm disabled:opacity-50 disabled:pointer-events-none"
          >
            {submitting ? "Sending…" : "Send sign-up"}
            {!submitting && <span>→</span>}
          </button>
          <p className="mt-3 text-[11px] leading-relaxed text-slate-500">
            You&apos;ll get a private link to upload each player&apos;s documents after sending.
          </p>
        </div>
      </aside>
    </form>
  );
}
