"use client";

import { useState } from "react";
import { EventInvite, EventTeam, RosterPlayer } from "@/types";
import { eventsService } from "@/services/eventsService";
import RosterPlayerFields from "./RosterPlayerFields";

interface EventSignupFormProps {
  invite: EventInvite;
  code: string;
  onSubmitted: (team: EventTeam) => void;
}

const STARTERS = 5;

const FIELD =
  "w-full rounded-lg bg-black/40 border border-white/10 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-primary-brand/70 focus:ring-1 focus:ring-primary-brand/40 transition";

const blankPlayer = (isSubstitute: boolean): RosterPlayer => ({
  fullName: "",
  studentNumber: "",
  ign: "",
  isSubstitute,
});

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

  return (
    <form onSubmit={submit} className="flex flex-col gap-6">
      <section className="grid gap-3 sm:grid-cols-3">
        <div>
          <label
            htmlFor="team-name"
            className="block text-[11px] uppercase tracking-wider text-white/40 mb-1"
          >
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
          <label
            htmlFor="captain-name"
            className="block text-[11px] uppercase tracking-wider text-white/40 mb-1"
          >
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
          <label
            htmlFor="captain-email"
            className="block text-[11px] uppercase tracking-wider text-white/40 mb-1"
          >
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
      </section>

      <section className="flex flex-col gap-3">
        {roster.map((player, index) => (
          <RosterPlayerFields
            key={index}
            index={index}
            player={player}
            onChange={updatePlayer}
            onRemove={player.isSubstitute ? removePlayer : undefined}
          />
        ))}

        {substitutes.length < invite.maxSubs && (
          <button
            type="button"
            onClick={addSubstitute}
            className="self-start rounded-lg border border-dashed border-white/20 px-4 py-2 text-sm text-white/60 hover:text-white hover:border-white/40 transition"
          >
            Add substitute ({substitutes.length}/{invite.maxSubs})
          </button>
        )}
      </section>

      {error && (
        <p className="rounded-lg border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="self-start rounded-lg bg-primary-brand px-6 py-3 font-display text-sm tracking-wide text-[var(--game-btn-text,#fff)] shadow-[inset_0_1px_0_rgba(255,255,255,0.35)] hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition"
      >
        {submitting ? "Sending…" : "Send sign-up"}
      </button>
    </form>
  );
}
