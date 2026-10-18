import { AdminPageHeaderProps, AdminStat } from "@/types";

const TONE: Record<NonNullable<AdminStat["tone"]>, string> = {
  default: "text-white",
  warn: "text-amber-300",
  alert: "text-rose-300",
  good: "text-emerald-300",
};

/** Shared header for every admin page: eyebrow, title, blurb, optional actions and live stats. */
export default function AdminPageHeader({ eyebrow, title, description, stats, actions }: AdminPageHeaderProps) {
  return (
    <header className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <p className="flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.25em] text-emerald-400">
            <span className="h-px w-6 bg-emerald-400/70" />
            {eyebrow}
          </p>
          <h1 className="mt-2 font-display text-3xl font-black uppercase tracking-tight text-white sm:text-4xl">{title}</h1>
          {description && <p className="mt-2 max-w-2xl text-sm leading-relaxed text-neutral-400">{description}</p>}
        </div>
        {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
      </div>

      {stats && stats.length > 0 && (
        <dl className="grid grid-cols-2 overflow-hidden rounded-xl border border-white/[0.06] bg-[#0A0C0B]/80 sm:flex">
          {stats.map((s) => (
            <div key={s.label} className="min-w-0 flex-1 border-b border-r border-white/[0.06] px-5 py-4 sm:border-b-0 last:border-r-0">
              <dd className={`font-display text-3xl font-black leading-none tabular-nums ${TONE[s.tone ?? "default"]}`}>{s.value}</dd>
              <dt className="mt-1.5 truncate font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-neutral-500">{s.label}</dt>
            </div>
          ))}
        </dl>
      )}
    </header>
  );
}
