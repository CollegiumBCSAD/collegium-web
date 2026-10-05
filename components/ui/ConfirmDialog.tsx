"use client";

import { ReactNode, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { AlertTriangleIcon } from "@/components/ui/Icons";

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  /** Body copy; can include emphasis. */
  message: ReactNode;
  /** Optional list of what the action affects, shown as a checklist. */
  details?: string[];
  confirmLabel?: string;
  busyLabel?: string;
  cancelLabel?: string;
  busy?: boolean;
  error?: string | null;
  /** "danger" for destructive actions. */
  tone?: "danger" | "default";
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  details,
  confirmLabel = "Confirm",
  busyLabel = "Working…",
  cancelLabel = "Cancel",
  busy = false,
  error,
  tone = "default",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const cancelRef = useRef<HTMLButtonElement>(null);

  // Scroll lock, Escape to close, and focus the safe choice first.
  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    cancelRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !busy) onCancel();
    };
    window.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [isOpen, busy, onCancel]);

  if (!isOpen || typeof document === "undefined") return null;

  const danger = tone === "danger";

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        aria-hidden
        onClick={() => !busy && onCancel()}
        className="absolute inset-0 bg-black/75 backdrop-blur-sm animate-backdrop-fade-in"
      />

      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby="confirm-message"
        className="relative w-full max-w-md overflow-hidden rounded-2xl border border-white/[0.1] bg-[#090C14] bg-[radial-gradient(rgba(100,116,160,0.13)_1px,transparent_1px)] bg-[size:12px_12px] shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_40px_80px_-20px_rgba(0,0,0,0.95)] animate-modal-pop-in"
      >
        {/* Tone wash + accent rule */}
        <span
          aria-hidden
          className={`pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b to-transparent ${
            danger ? "from-rose-500/15" : "from-primary-brand/15"
          }`}
        />
        <span
          aria-hidden
          className={`absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent to-transparent ${
            danger ? "via-rose-400" : "via-primary-brand"
          }`}
        />

        <div className="relative p-6 sm:p-7">
          <div className="flex items-start gap-4">
            <span
              className={`w-12 h-12 shrink-0 flex items-center justify-center rounded-xl border ${
                danger
                  ? "border-rose-400/40 bg-rose-500/15 text-rose-300 shadow-[0_0_24px_-6px_rgba(251,113,133,0.6)]"
                  : "border-primary-brand/40 bg-primary-brand/15 text-primary-brand"
              }`}
            >
              <AlertTriangleIcon className="w-5 h-5" />
            </span>
            <div className="min-w-0 pt-0.5">
              <h2
                id="confirm-title"
                className="font-display text-2xl font-black uppercase leading-tight tracking-tight text-white"
              >
                {title}
              </h2>
              <div id="confirm-message" className="mt-1.5 text-sm leading-relaxed text-slate-400">
                {message}
              </div>
            </div>
          </div>

          {details && details.length > 0 && (
            <ul className="mt-5 space-y-2 rounded-xl border border-white/[0.06] bg-black/35 px-4 py-3">
              {details.map((item) => (
                <li key={item} className="flex items-center gap-2.5 text-xs text-slate-300">
                  <span className={`w-1 h-1 rounded-full ${danger ? "bg-rose-400" : "bg-primary-brand"}`} />
                  {item}
                </li>
              ))}
            </ul>
          )}

          {error && (
            <p className="mt-4 rounded-xl border border-rose-400/30 bg-rose-500/10 px-3.5 py-2.5 text-xs text-rose-200">
              {error}
            </p>
          )}

          <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
            <button
              ref={cancelRef}
              type="button"
              onClick={onCancel}
              disabled={busy}
              className="tactical-btn-secondary h-11 px-6 text-xs disabled:opacity-50 disabled:pointer-events-none"
            >
              {cancelLabel}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={busy}
              className={
                danger
                  ? "h-11 px-6 rounded-lg bg-gradient-to-b from-rose-500 to-rose-700 font-display text-xs font-black uppercase tracking-wider text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_10px_26px_-8px_rgba(244,63,94,0.75)] hover:brightness-110 disabled:opacity-50 disabled:pointer-events-none transition"
                  : "game-theme-btn h-11 px-6 text-xs disabled:opacity-50 disabled:pointer-events-none"
              }
            >
              {busy ? busyLabel : confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
