"use client";

import React from "react";

export default function GlobalLoading() {
  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center p-6 bg-[#080A10] text-foreground relative overflow-hidden">
      {/* Background ambient glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary-brand/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[300px] h-[300px] bg-accent/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center gap-6 text-center max-w-sm">
        {/* Pulsing Brand Logo Icon Container */}
        <div className="relative flex items-center justify-center">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-[#121624] via-[#1A2033] to-[#0F1320] border border-[#2A344D] flex items-center justify-center shadow-2xl shadow-primary-brand/20 animate-pulse">
            <span className="font-display text-3xl font-extrabold tracking-tighter text-primary-brand">
              COL
            </span>
          </div>
          <div className="absolute inset-0 rounded-2xl border border-primary-brand/40 animate-ping opacity-25" />
        </div>

        {/* Loading Message & Shimmer bar */}
        <div className="space-y-2">
          <h3 className="font-display text-lg font-bold uppercase tracking-widest text-foreground">
            COLLEGIUM CIRCUIT
          </h3>
          <p className="font-sans text-xs font-semibold text-secondary-text uppercase tracking-widest animate-pulse">
            Connecting to Verified Performance Repository...
          </p>
        </div>

        {/* Tactical Progress Bar */}
        <div className="w-48 h-1.5 bg-[#141A28] rounded-full overflow-hidden border border-[#222B40] relative">
          <div className="absolute inset-0 bg-gradient-to-r from-primary-brand via-accent to-primary-brand w-full animate-[shimmer_1.5s_infinite] -translate-x-full" />
        </div>
      </div>
    </div>
  );
}

