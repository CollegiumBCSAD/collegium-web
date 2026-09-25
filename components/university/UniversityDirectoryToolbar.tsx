"use client";

import { UniversityDirectoryToolbarProps, UniversitySortKey } from "@/types";
import SegmentedControl from "@/components/ui/SegmentedControl";

const SORT_OPTIONS: { key: UniversitySortKey; label: string }[] = [
  { key: "name", label: "A–Z" },
  { key: "rating", label: "By rating" },
];

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

// Typographic controls: plain letters and labels, with an accent underline
// marking the active choice instead of filled buttons.
export default function UniversityDirectoryToolbar({
  sortKey,
  onSortChange,
  resultCount,
  availableLetters,
  activeLetter,
  onLetterChange,
}: UniversityDirectoryToolbarProps) {
  const available = new Set(availableLetters);
  const tab = (active: boolean) =>
    `relative pb-2 transition-colors after:absolute after:inset-x-0 after:bottom-0 after:h-[2px] after:rounded-full after:transition-colors ${
      active ? "text-white after:bg-primary-brand" : "after:bg-transparent"
    }`;

  return (
    <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between border-b border-white/[0.06]">
      <nav aria-label="Filter universities by letter" className="flex items-end gap-3 overflow-x-auto [scrollbar-width:none]">
        <button
          type="button"
          onClick={() => onLetterChange(null)}
          aria-pressed={activeLetter === null}
          className={`shrink-0 text-[11px] font-mono font-bold uppercase tracking-[0.2em] text-slate-400 hover:text-white ${tab(activeLetter === null)}`}
        >
          All
        </button>
        {ALPHABET.map((letter) => {
          const enabled = available.has(letter);
          const active = activeLetter === letter;
          return (
            <button
              key={letter}
              type="button"
              disabled={!enabled}
              onClick={() => onLetterChange(active ? null : letter)}
              aria-pressed={active}
              aria-label={`Schools starting with ${letter}`}
              className={`shrink-0 font-display text-base font-black ${
                enabled ? "text-slate-300 hover:text-white" : "text-slate-700 cursor-default"
              } ${tab(active)}`}
            >
              {letter}
            </button>
          );
        })}
      </nav>

      <div className="flex items-center gap-4 shrink-0 mb-2.5">
        <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-slate-500">
          <span className="text-white font-bold">{resultCount}</span> {resultCount === 1 ? "school" : "schools"}
          {activeLetter && <span className="text-primary-brand"> · {activeLetter}</span>}
        </span>
        <SegmentedControl
          ariaLabel="Order universities"
          value={sortKey}
          onChange={onSortChange}
          options={SORT_OPTIONS.map((o) => ({ id: o.key, label: o.label }))}
        />
      </div>
    </div>
  );
}
