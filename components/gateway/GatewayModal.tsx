"use client";

import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { GatewayModalProps } from "@/types";
import GatewayHero from "./GatewayHero";
import GatewayRoleCards from "./GatewayRoleCards";

// Matches the duration of .animate-modal-pop-out / .animate-backdrop-fade-out.
const EXIT_MS = 180;

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])';

export default function GatewayModal({ isOpen, intent, onClose }: GatewayModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Stay mounted for the exit animation after isOpen turns false.
  const [isRendered, setIsRendered] = useState(isOpen);
  const [prevOpen, setPrevOpen] = useState(isOpen);
  if (prevOpen !== isOpen) {
    setPrevOpen(isOpen);
    if (isOpen) setIsRendered(true);
  }
  const isClosing = isRendered && !isOpen;

  useEffect(() => {
    if (!isClosing) return;
    const timer = setTimeout(() => setIsRendered(false), EXIT_MS);
    return () => clearTimeout(timer);
  }, [isClosing]);

  // Modal lifecycle: scroll lock, Escape, focus trap, and focus restore.
  useEffect(() => {
    if (!isOpen) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab" || !dialogRef.current) return;
      const focusable = Array.from(dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
      previouslyFocused?.focus?.();
    };
  }, [isOpen, onClose]);

  if (!isRendered) return null;

  return createPortal(
    <div
      className={`fixed inset-0 z-[60] flex items-start sm:items-center justify-center overflow-y-auto p-4 sm:p-6 bg-black/80 backdrop-blur-md ${
        isClosing ? "animate-backdrop-fade-out" : "animate-backdrop-fade-in"
      }`}
      onClick={onClose}
    >
      {/* Ambient glow behind the dialog, echoing the gateway page */}
      <div
        aria-hidden
        className="pointer-events-none fixed top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40rem] h-[28rem] max-w-full rounded-full blur-[120px] opacity-25 bg-gradient-to-r from-amber-500 to-primary-brand"
      />

      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="gateway-modal-title"
        onClick={(e) => e.stopPropagation()}
        className={`relative w-full max-w-4xl my-auto rounded-3xl border border-[#1E293B] bg-[#080B13]/95 p-5 pt-12 sm:p-8 sm:pt-12 shadow-2xl ${
          isClosing ? "animate-modal-pop-out" : "animate-modal-pop-in"
        }`}
      >
        <button
          ref={closeButtonRef}
          type="button"
          onClick={onClose}
          aria-label="Close Modal"
          className="absolute top-4 right-4 w-9 h-9 rounded-xl border border-[#232D48] bg-[#0A0D18] hover:bg-[#182035] text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="space-y-7">
          <GatewayHero titleId="gateway-modal-title" />
          <GatewayRoleCards intent={intent} onNavigate={onClose} />
        </div>
      </div>
    </div>,
    document.body
  );
}
