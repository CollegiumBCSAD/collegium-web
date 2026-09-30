"use client";

import { useEffect, useState } from "react";
import { BeforeInstallPromptEvent } from "@/types";

const DISMISSED_KEY = "collegium:install-prompt-dismissed";

function isStandalone() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

export default function InstallAppPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [platform, setPlatform] = useState<"prompt" | "ios" | null>(null);

  useEffect(() => {
    if (isStandalone()) return;

    let dismissed = false;
    try {
      dismissed = localStorage.getItem(DISMISSED_KEY) === "1";
    } catch {
      // Privacy mode or storage disabled — just don't persist the dismissal.
    }
    if (dismissed) return;

    const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
    if (isIOS) {
      queueMicrotask(() => setPlatform("ios"));
      return;
    }

    function handleBeforeInstallPrompt(e: Event) {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setPlatform("prompt");
    }
    function handleInstalled() {
      setDeferredPrompt(null);
      setPlatform(null);
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, []);

  function dismiss() {
    setPlatform(null);
    setDeferredPrompt(null);
    try {
      localStorage.setItem(DISMISSED_KEY, "1");
    } catch {
      // Ignore — worst case it asks again next visit.
    }
  }

  async function handleInstall() {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    dismiss();
  }

  if (!platform) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-6 sm:right-auto sm:bottom-6 z-40 sm:w-[380px]">
      <div
        className="flex items-start gap-3 bg-[#0A0D18] border border-[#1E293B] shadow-2xl p-4"
        style={{
          clipPath: "polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 14px 100%, 0 calc(100% - 14px))",
        }}
      >
        <div className="w-10 h-10 rounded-lg bg-primary-brand/10 border border-primary-brand/30 flex items-center justify-center text-primary-brand shrink-0">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v12m0 0l-4-4m4 4l4-4M4 20h16" />
          </svg>
        </div>

        <div className="min-w-0 flex-1">
          <p className="font-display text-xs font-black uppercase tracking-wider text-white">
            Install Collegium
          </p>
          <p className="mt-1 font-sans text-xs text-slate-400 leading-relaxed">
            {platform === "ios"
              ? "Tap the Share icon, then “Add to Home Screen” for the full-screen app."
              : "Add it to your home screen for quicker, full-screen access."}
          </p>

          {platform === "prompt" && (
            <button
              type="button"
              onClick={handleInstall}
              className="mt-3 h-8 px-4 font-mono text-[11px] font-black uppercase tracking-wider text-white bg-primary-brand hover:brightness-110 cursor-pointer transition-all"
            >
              Install
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss install prompt"
          className="shrink-0 text-slate-500 hover:text-white transition-colors cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
