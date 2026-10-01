"use client";

import { useState } from "react";
import { EventDocument } from "@/types";
import { apiClient } from "@/services/apiClient";
import { eventsService } from "@/services/eventsService";

interface EventDocumentLinkProps {
  eventId: string;
  document: EventDocument | undefined;
  label: string;
}

export default function EventDocumentLink({
  eventId,
  document: doc,
  label,
}: EventDocumentLinkProps) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!doc) {
    return <span className="text-xs text-white/25">{label}: missing</span>;
  }

  const open = async () => {
    setBusy(true);
    setError(null);
    try {
      const blob = await apiClient.getBlob(
        eventsService.documentUrl(eventId, doc.id),
      );
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank", "noopener");
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not open it.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <span className="inline-flex flex-col">
      <button
        type="button"
        onClick={open}
        disabled={busy}
        className="text-xs text-primary-brand hover:underline disabled:opacity-50 text-left"
      >
        {busy ? "Opening…" : label}
      </button>
      {error && <span className="text-[10px] text-red-300">{error}</span>}
    </span>
  );
}
