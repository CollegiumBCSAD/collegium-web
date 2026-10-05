import { CoachPanelProps } from "@/types";
import { RAISED } from "@/components/organize/surfaces";

const CUT = "polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 14px 100%, 0 calc(100% - 14px))";

// Shared shell for every Coach Hub panel: cut-corner raised surface, a lit
// top edge in the game accent, and an icon + eyebrow + title header.
export default function CoachPanel({ title, eyebrow, icon, action, children, className = "" }: CoachPanelProps) {
  return (
    <section className={`relative overflow-hidden ${RAISED} ${className}`} style={{ clipPath: CUT }}>
      <span aria-hidden className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-primary-brand/80 via-primary-brand/20 to-transparent" />
      <div className="p-5 sm:p-6 space-y-4">
        <header className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {icon && (
              <span className="w-9 h-9 shrink-0 flex items-center justify-center text-primary-brand bg-primary-brand/10 border border-primary-brand/30">
                {icon}
              </span>
            )}
            <div className="min-w-0">
              {eyebrow && <p className="text-[9px] font-mono font-bold uppercase tracking-[0.25em] text-slate-500">{eyebrow}</p>}
              <h2 className="font-display text-base font-black uppercase tracking-wider text-white truncate">{title}</h2>
            </div>
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </header>
        {children}
      </div>
    </section>
  );
}
