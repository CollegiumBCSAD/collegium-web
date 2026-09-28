"use client";

import { SegmentedControlProps } from "@/types";

// Filter/sort switcher: a dark track with the active option as a solid,
// glowing pill in the selected game's color. Counts render as badges.
export default function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
  className = "",
}: SegmentedControlProps<T>) {
  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className={`inline-flex max-w-full items-center gap-1 overflow-x-auto rounded-xl border border-white/[0.08] bg-[#090C14] p-1 shadow-[inset_0_2px_8px_rgba(0,0,0,0.5)] [scrollbar-width:none] ${className}`}
    >
      {options.map((o) => {
        const active = o.id === value;
        return (
          <button
            key={o.id}
            type="button"
            onClick={() => onChange(o.id)}
            aria-pressed={active}
            className={`flex h-9 shrink-0 items-center gap-2 rounded-lg px-4 text-[11px] font-mono font-bold uppercase tracking-[0.15em] transition-all duration-200 ${
              active
                ? "bg-primary-brand text-[var(--game-btn-text,#fff)] shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_6px_18px_-6px_rgba(var(--game-glow-rgb),0.85)]"
                : "text-slate-400 hover:bg-white/[0.05] hover:text-white"
            }`}
          >
            {o.live && (
              <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${active ? "bg-current" : "bg-primary-brand"}`} />
            )}
            {o.label}
            {o.count !== undefined && (
              <span
                className={`min-w-5 h-5 px-1.5 rounded-md flex items-center justify-center text-[10px] tabular-nums ${
                  active ? "bg-black/25" : "bg-white/[0.06] text-slate-500"
                }`}
              >
                {o.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
