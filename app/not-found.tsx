"use client";

import React from "react";
import Link from "next/link";

export default function NotFoundPage() {
  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center p-6 text-center bg-background text-foreground">
      <div className="max-w-md w-full p-8 rounded-2xl bg-card-bg border border-raised-panel shadow-2xl space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-primary-brand/10 border border-primary-brand/30 text-primary-brand flex items-center justify-center font-display text-3xl font-bold mx-auto">
          404
        </div>

        <div>
          <span className="text-[10px] font-sans font-extrabold uppercase tracking-widest text-secondary-brand block mb-1">
            Out of Bounds
          </span>
          <h1 className="font-display text-2xl font-bold uppercase tracking-wider text-foreground">
            Page Not Found
          </h1>
          <p className="font-sans text-xs text-secondary-text mt-2 leading-relaxed">
            The page or circuit bracket you are looking for does not exist or has been relocated.
          </p>
        </div>

        <div className="pt-2 flex justify-center">
          <Link
            href="/"
            className="h-11 px-6 rounded-lg game-theme-btn font-sans text-xs font-bold uppercase tracking-wider transition-all shadow-md flex items-center justify-center"
          >
            Back to Circuit Home
          </Link>
        </div>
      </div>
    </div>
  );
}
