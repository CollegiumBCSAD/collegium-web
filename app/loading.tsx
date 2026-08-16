"use client";

import React from "react";

export default function GlobalLoading() {
  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center p-6 bg-background text-foreground">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-2 border-primary-brand/30 border-t-primary-brand rounded-full animate-spin" />
        <span className="font-display text-xs font-bold uppercase tracking-widest text-secondary-text animate-pulse">
          Loading Collegium...
        </span>
      </div>
    </div>
  );
}
