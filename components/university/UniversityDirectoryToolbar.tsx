"use client";

import { UniversityDirectoryToolbarProps, UniversitySortKey } from "@/types";

const SORT_OPTIONS: { key: UniversitySortKey; label: string }[] = [
  { key: "name", label: "A–Z" },
  { key: "rating", label: "By Rating" },
];

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

export default function UniversityDirectoryToolbar({
  sortKey,
  onSortChange,
  resultCount,
  availableLetters,
  activeLetter,
  onLetterChange,
}: UniversityDirectoryToolbarProps) {
  const available = new Set(availableLetters);

  return (
    <div className="space-y-3">
      {/* Yearbook-style index: jump straight to schools by starting letter */}
      <nav
        aria-label="Filter universities by letter"
        className="flex items-center gap-0.5 overflow-x-auto border border-white/[0.06] bg-black/30 backdrop-blur-md p-1 [scrollbar-width:none]"
      >
        <button
          type="button"
          onClick={() => onLetterChange(null)}
          aria-pressed={activeLetter === null}
          className={`shrink-0 px-3 h-8 text-[10px] font-mono font-bold uppercase tracking-widest transition-colors ${
            activeLetter === null ? "bg-primary-brand text-white" : "text-slate-400 hover:text-white hover:bg-white/5"
          }`}
        >
          All
        </button>
        <span aria-hidden className="shrink-0 w-px h-5 mx-1 bg-white/10" />
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
              className={`shrink-0 flex-1 min-w-7 h-8 font-display text-sm font-black transition-colors ${
                active
                  ? "bg-primary-brand text-white"
                  : enabled
                    ? "text-slate-200 hover:bg-white/10 hover:text-white"
                    : "text-slate-700 cursor-default"
              }`}
            >
              {letter}
            </button>
          );
        })}
      </nav>

      <div className="flex items-center justify-between gap-3">
        <p className="text-[10px] font-mono uppercase tracking-widest text-slate-500">
          <span className="text-white font-bold">{resultCount}</span>{" "}
          {resultCount === 1 ? "institution" : "institutions"}
          {activeLetter && (
            <>
              {" "}
              under <span className="text-primary-brand font-bold">{activeLetter}</span>
            </>
          )}
        </p>

        <div role="group" aria-label="Order universities" className="flex border border-white/10 bg-black/30">
          {SORT_OPTIONS.map((option) => {
            const active = option.key === sortKey;
            return (
              <button
                key={option.key}
                type="button"
                onClick={() => onSortChange(option.key)}
                aria-pressed={active}
                className={`px-3.5 py-1.5 text-[10px] font-mono font-bold uppercase tracking-wider transition-colors ${
                  active ? "bg-white text-black" : "text-slate-400 hover:text-white"
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
