"use client";

import React, { useEffect } from "react";
import Link from "next/link";

export default function GlobalErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Uncaught application error:", error);
  }, [error]);

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center p-6 text-center bg-background text-foreground">
      <div className="max-w-md w-full p-8 rounded-2xl bg-card-bg border border-raised-panel shadow-2xl space-y-6">
        <div className="w-14 h-14 rounded-2xl bg-primary-brand/10 border border-primary-brand/20 text-primary-brand flex items-center justify-center text-2xl mx-auto">
          ⚠️
        </div>

        <div>
          <span className="text-[10px] font-sans font-extrabold uppercase tracking-widest text-secondary-brand block mb-1">
            System Fault Detected
          </span>
          <h1 className="font-display text-2xl font-bold uppercase tracking-wider text-foreground">
            Something Went Wrong
          </h1>
          <p className="font-sans text-xs text-secondary-text mt-2 leading-relaxed">
            An unexpected error occurred while processing your request. Please try again or return to the main dashboard.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={() => reset()}
            className="w-full sm:w-auto h-10 px-5 rounded-lg bg-gradient-to-r from-[#E53A4C] to-[#B91C1C] hover:from-[#EF4444] hover:to-[#991B1B] text-foreground font-sans text-xs font-bold uppercase tracking-wider transition-all shadow-md shadow-primary-brand/20 cursor-pointer"
          >
            Try Again
          </button>
          <Link
            href="/"
            className="w-full sm:w-auto h-10 px-5 rounded-lg border border-raised-panel bg-card-bg hover:bg-raised-panel text-secondary-text hover:text-foreground font-sans text-xs font-bold uppercase tracking-wider flex items-center justify-center transition-colors"
          >
            Return Home
          </Link>
        </div>
      </div>
    </div>
  );
}
