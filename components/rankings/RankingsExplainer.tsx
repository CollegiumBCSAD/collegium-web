"use client";

import { DOT_SURFACE } from "@/components/university/surface";

const TERMS = [
  {
    symbol: "r",
    name: "Rating",
    body: (
      <>
        Starts at <strong className="text-white font-mono">1500</strong>. Moves on win/loss outcomes, scaled by the tournament&apos;s Event Weight.
      </>
    ),
  },
  {
    symbol: "±",
    name: "How sure the rating is",
    body: (
      <>
        Starts at <strong className="text-white font-mono">350</strong> (provisional) and shrinks as more official matches are verified.
      </>
    ),
  },
  {
    symbol: "T",
    name: "Tournaments only",
    body: <>Only verified tournament matches move a rating. Scrims stay practice and do not change it.</>,
  },
];

export default function RankingsExplainer() {
  return (
    <section className={`rounded-2xl border border-white/[0.07] ${DOT_SURFACE} p-6 sm:p-8`}>
      <p className="flex items-center gap-3 text-[11px] font-mono font-bold uppercase tracking-[0.3em] text-slate-400">
        <span className="h-px w-8 bg-primary-brand" />
        How ratings work
      </p>
      <p className="mt-3 max-w-3xl text-sm font-sans leading-relaxed text-slate-400">
        Collegium rates each varsity team from verified tournament results. A win against a stronger team moves the rating more. The ±
        figure is how sure that rating is, and it tightens as more official matches are played.
      </p>

      <div className="mt-6 grid gap-6 md:grid-cols-3">
        {TERMS.map((t) => (
          <div key={t.name} className="flex gap-4">
            <span className="w-14 shrink-0 font-display text-4xl font-black leading-none text-transparent [-webkit-text-stroke:1.5px_var(--primary-brand)]">
              {t.symbol}
            </span>
            <div>
              <h3 className="font-display text-sm font-black uppercase tracking-wide text-white">{t.name}</h3>
              <p className="mt-1 text-xs font-sans leading-relaxed text-slate-400">{t.body}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
