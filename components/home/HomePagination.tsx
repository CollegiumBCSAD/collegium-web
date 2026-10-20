import { HomePaginationProps } from "@/types";

const BTN =
  "h-7 min-w-7 rounded-md border border-white/[0.08] bg-white/[0.03] px-2 font-mono text-[11px] font-bold text-slate-300 transition-colors hover:bg-white/[0.08] hover:text-white disabled:cursor-not-allowed disabled:opacity-40";

/** Page numbers with the current page's neighbours; the ends collapse into an ellipsis. */
const pageList = (page: number, total: number): (number | "gap")[] => {
  const out: (number | "gap")[] = [];
  for (let p = 1; p <= total; p++) {
    if (p === 1 || p === total || Math.abs(p - page) <= 1) out.push(p);
    else if (out[out.length - 1] !== "gap") out.push("gap");
  }
  return out;
};

export default function HomePagination({ page, totalPages, total, onChange }: HomePaginationProps) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex flex-col items-center justify-between gap-2 border-t border-white/[0.06] bg-white/[0.015] px-3.5 py-2.5 sm:flex-row">
      <span className="font-mono text-[10px] uppercase tracking-wider text-slate-500">
        Page <b className="text-slate-200">{page}</b> / {totalPages} · {total} matches
      </span>
      <div className="flex items-center gap-1">
        <button type="button" className={BTN} disabled={page <= 1} onClick={() => onChange(page - 1)} aria-label="Previous page">
          ‹
        </button>
        {pageList(page, totalPages).map((p, i) =>
          p === "gap" ? (
            <span key={`gap-${i}`} className="px-1 font-mono text-xs text-slate-600">
              …
            </span>
          ) : (
            <button
              key={p}
              type="button"
              onClick={() => onChange(p)}
              className={`${BTN} ${p === page ? "!border-primary-brand !bg-primary-brand !text-white" : ""}`}
            >
              {p}
            </button>
          ),
        )}
        <button type="button" className={BTN} disabled={page >= totalPages} onClick={() => onChange(page + 1)} aria-label="Next page">
          ›
        </button>
      </div>
    </div>
  );
}
