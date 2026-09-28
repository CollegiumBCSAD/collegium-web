"use client";

import { HostStepProps } from "@/types";
import { HOST_FORMATS, HOST_QUOTAS } from "@/lib/hostTournament";
import CyberDateTimePicker from "@/components/ui/CyberDateTimePicker";

// Tiny bracket diagrams so formats are recognizable at a glance.
function formatGlyph(format: string) {
  const common = { fill: "none", stroke: "currentColor", strokeWidth: 1.5, strokeLinecap: "round" as const };
  if (format.startsWith("Double")) {
    return (
      <svg viewBox="0 0 32 32" className="w-7 h-7" {...common}>
        <path d="M3 5h6v5h6M3 13h6v-3M3 19h6v5h6M3 27h6v-3M15 7.5h5v9h5M15 21.5h5v-5" />
      </svg>
    );
  }
  if (format.startsWith("Round")) {
    return (
      <svg viewBox="0 0 32 32" className="w-7 h-7" {...common}>
        <rect x="4" y="4" width="10" height="10" />
        <rect x="18" y="4" width="10" height="10" />
        <rect x="4" y="18" width="10" height="10" />
        <path d="M18 23h10M23 18v10" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 32 32" className="w-7 h-7" {...common}>
      <path d="M3 5h7v6h7M3 17h7v-6M3 21h7v6h7M3 31h7v-4M17 11h6v8h6M17 27h6v-8" />
    </svg>
  );
}

export default function HostStepFormat({ draft, onChange }: HostStepProps) {
  return (
    <div className="space-y-6">
      <fieldset>
        <legend className="mb-2.5 text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400">
          Bracket format
        </legend>
        <div className="grid gap-2">
          {HOST_FORMATS.map((format) => {
            const selected = draft.bracketFormat === format.value;
            return (
              <button
                key={format.value}
                type="button"
                onClick={() => onChange({ bracketFormat: format.value })}
                aria-pressed={selected}
                className={`flex items-center gap-4 px-4 py-3 text-left border transition-all ${
                  selected
                    ? "border-primary-brand/70 bg-gradient-to-r from-primary-brand/15 to-transparent shadow-[inset_3px_0_0_var(--primary-brand)]"
                    : "border-white/10 bg-black/25 hover:border-white/25 hover:bg-black/40"
                }`}
              >
                <span className={selected ? "text-primary-brand" : "text-slate-500"}>
                  {formatGlyph(format.value)}
                </span>
                <span className="min-w-0">
                  <span className="block font-display text-sm font-black uppercase text-white">{format.value}</span>
                  <span className="block text-[11px] font-sans text-slate-400">{format.blurb}</span>
                </span>
              </button>
            );
          })}
        </div>
      </fieldset>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <fieldset>
          <legend className="mb-2.5 text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400">
            Squad slots
          </legend>
          <div className="grid grid-cols-3 border border-white/10 bg-black/30 p-1 gap-1">
            {HOST_QUOTAS.map((quota) => {
              const selected = draft.teamQuota === quota;
              return (
                <button
                  key={quota}
                  type="button"
                  onClick={() => onChange({ teamQuota: quota })}
                  aria-pressed={selected}
                  className={`h-10 flex flex-col items-center justify-center transition-all ${
                    selected
                      ? "bg-primary-brand text-[var(--game-btn-text,#fff)] shadow-[inset_0_1px_0_rgba(255,255,255,0.5)]"
                      : "text-slate-300 hover:bg-white/5"
                  }`}
                >
                  <span className="font-display text-base font-black leading-none">{quota}</span>
                  <span className={`text-[8px] font-mono uppercase tracking-widest ${selected ? "opacity-75" : "text-slate-500"}`}>
                    teams
                  </span>
                </button>
              );
            })}
          </div>
        </fieldset>

        <div>
          <span className="block mb-2.5 text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400">
            Start time <span className="text-slate-600 normal-case tracking-normal">(optional)</span>
          </span>
          <CyberDateTimePicker
            value={draft.startDate}
            onChange={(startDate) => onChange({ startDate })}
            placeholder="Pick date & time"
          />
        </div>
      </div>
    </div>
  );
}
