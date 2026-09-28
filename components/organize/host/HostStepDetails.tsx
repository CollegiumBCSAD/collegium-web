"use client";

import { HostStepProps } from "@/types";
import { hostGameFor } from "@/lib/hostTournament";
import { ImageIcon, ShieldIcon } from "@/components/ui/Icons";

const RULE_SNIPPETS = ["BO1 group stage", "BO3 semifinals", "BO5 grand finals", "Varsity rosters only", "15-min check-in"];

export default function HostStepDetails({ draft, onChange }: HostStepProps) {
  const cover = draft.imagePreview || hostGameFor(draft.gameTitle).art;

  const pickImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    onChange({ imageFile: file, imagePreview: URL.createObjectURL(file) });
    e.target.value = "";
  };

  const addSnippet = (snippet: string) => {
    const trimmed = draft.rules.trim();
    if (trimmed.toLowerCase().includes(snippet.toLowerCase())) return;
    onChange({ rules: trimmed ? `${trimmed}. ${snippet}` : snippet });
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="mb-2.5 flex items-baseline justify-between">
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400">Cover banner</span>
          <span className="text-[10px] font-mono text-slate-600">PNG · JPG · WEBP, up to 5MB</span>
        </div>
        <div className="group relative h-32 overflow-hidden border border-white/10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={cover} alt="" className="w-full h-full object-cover opacity-80" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          {!draft.imagePreview && (
            <span className="absolute top-2.5 left-2.5 px-2 py-0.5 text-[9px] font-mono font-bold uppercase tracking-widest text-slate-200 bg-black/60 backdrop-blur-md border border-white/15">
              Default game art
            </span>
          )}
          <div className="absolute bottom-2.5 right-2.5 flex gap-2">
            {draft.imagePreview && (
              <button
                type="button"
                onClick={() => onChange({ imageFile: null, imagePreview: "" })}
                className="h-8 px-3 text-[10px] font-mono font-bold uppercase bg-black/60 backdrop-blur-md border border-white/15 text-slate-300 hover:text-rose-300 hover:border-rose-400/50 transition-colors"
              >
                Remove
              </button>
            )}
            <label className="h-8 px-3 flex items-center gap-1.5 cursor-pointer text-[10px] font-mono font-bold uppercase bg-primary-brand hover:brightness-110 text-[var(--game-btn-text,#fff)] transition-colors">
              <input type="file" accept="image/png,image/jpeg,image/webp" onChange={pickImage} className="sr-only" />
              <ImageIcon className="w-3.5 h-3.5" />
              {draft.imagePreview ? "Replace" : "Upload"}
            </label>
          </div>
        </div>
      </div>

      <div>
        <label htmlFor="host-rules" className="block mb-2.5 text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400">
          Rules & match protocols <span className="text-slate-600 normal-case tracking-normal">(optional)</span>
        </label>
        <textarea
          id="host-rules"
          rows={3}
          value={draft.rules}
          onChange={(e) => onChange({ rules: e.target.value })}
          placeholder="Series lengths, check-in, roster eligibility…"
          className="w-full p-3.5 bg-black/40 border border-white/10 hover:border-white/20 focus:border-primary-brand focus:shadow-[0_0_0_3px_rgba(var(--game-glow-rgb),0.15)] text-white text-xs font-sans placeholder:text-slate-600 focus:outline-none resize-none transition-all"
        />
        <div className="mt-2 flex flex-wrap gap-1.5">
          {RULE_SNIPPETS.map((snippet) => (
            <button
              key={snippet}
              type="button"
              onClick={() => addSnippet(snippet)}
              className="px-2 py-1 text-[10px] font-mono text-slate-400 border border-white/10 hover:text-primary-brand hover:border-primary-brand/40 transition-colors"
            >
              + {snippet}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-start gap-3 px-4 py-3 border border-white/10 bg-white/[0.04]">
        <ShieldIcon className="w-4 h-4 mt-0.5 shrink-0 text-primary-brand" />
        <p className="text-[11px] font-sans leading-relaxed text-slate-300">
          Submitting sends this to Collegium admins for sanctioning. Squads can apply as soon as it&apos;s approved.
        </p>
      </div>
    </div>
  );
}
