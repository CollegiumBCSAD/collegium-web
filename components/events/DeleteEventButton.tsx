"use client";

import { useCallback, useState } from "react";
import { eventsService } from "@/services/eventsService";
import { TrashIcon } from "@/components/ui/Icons";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

interface DeleteEventButtonProps {
  eventId: string;
  eventName: string;
  /** Squads signed up, shown in the confirmation so the organizer knows what goes. */
  squadCount?: number;
  onDeleted: () => void;
  /** "icon" for tight card footers, "full" for page headers. */
  variant?: "icon" | "full";
}

// Deleting also removes every squad, match and uploaded document, so it goes
// through a confirmation dialog rather than a single click.
export default function DeleteEventButton({
  eventId,
  eventName,
  squadCount,
  onDeleted,
  variant = "icon",
}: DeleteEventButtonProps) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const close = useCallback(() => {
    setOpen(false);
    setError(null);
  }, []);

  const remove = async () => {
    setBusy(true);
    setError(null);
    try {
      await eventsService.deleteEvent(eventId);
      setOpen(false);
      onDeleted();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete it.");
    } finally {
      setBusy(false);
    }
  };

  const squads =
    squadCount === undefined
      ? "Every registered squad and its roster"
      : `${squadCount} registered squad${squadCount === 1 ? "" : "s"} and their rosters`;

  return (
    <>
      {variant === "icon" ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label={`Delete ${eventName}`}
          title="Delete event"
          className="w-10 h-10 flex items-center justify-center rounded-lg border border-white/10 text-slate-500 hover:text-rose-300 hover:border-rose-400/40 hover:bg-rose-500/10 transition"
        >
          <TrashIcon className="w-4 h-4" />
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-2 h-9 px-4 rounded-lg border border-white/10 text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400 hover:text-rose-300 hover:border-rose-400/40 hover:bg-rose-500/10 transition"
        >
          <TrashIcon className="w-3.5 h-3.5" />
          Delete event
        </button>
      )}

      <ConfirmDialog
        isOpen={open}
        tone="danger"
        title="Delete event?"
        message={
          <>
            <span className="font-semibold text-white">{eventName}</span> will
            be permanently deleted. This can&apos;t be undone.
          </>
        }
        details={[
          squads,
          "The bracket and every reported result",
          "All uploaded CORs and school IDs",
        ]}
        confirmLabel="Delete event"
        busyLabel="Deleting…"
        busy={busy}
        error={error}
        onConfirm={remove}
        onCancel={close}
      />
    </>
  );
}
