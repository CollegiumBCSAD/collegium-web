"use client";

import { ToggleSwitchProps } from "@/types";

// Labeled on/off switch that matches SegmentedControl's track.
export default function ToggleSwitch({ label, checked, onChange }: ToggleSwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="group inline-flex h-11 items-center gap-3 rounded-xl border border-white/[0.08] bg-[#090C14] pl-4 pr-1.5 text-[11px] font-mono font-bold uppercase tracking-[0.15em] text-slate-400 transition-colors hover:text-white"
    >
      <span className={checked ? "text-white" : ""}>{label}</span>
      <span
        className={`relative h-8 w-14 rounded-lg transition-colors duration-200 ${
          checked ? "bg-primary-brand shadow-[0_6px_18px_-6px_rgba(var(--game-glow-rgb),0.85)]" : "bg-white/[0.07]"
        }`}
      >
        <span
          className={`absolute top-1 h-6 w-6 rounded-md bg-white shadow transition-all duration-200 ${checked ? "left-7" : "left-1 opacity-70"}`}
        />
      </span>
    </button>
  );
}
