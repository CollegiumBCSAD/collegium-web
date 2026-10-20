import Link from "next/link";
import { HomePanelProps } from "@/types";

/** Flat, dense content block shared by every column of the home hub. */
export default function HomePanel({
  title,
  actions,
  href,
  hrefLabel = "View all",
  badge,
  live,
  children,
  className = "",
}: HomePanelProps) {
  return (
    <section
      className={`overflow-hidden rounded-xl border border-white/[0.06] bg-[#0A0E19]/90 shadow-[0_20px_50px_-30px_rgba(0,0,0,0.9)] backdrop-blur-md ${className}`}
    >
      <header className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-white/[0.06] px-4 py-3">
        <div className="flex min-w-0 items-center gap-2.5">
          {live ? (
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary-brand opacity-70" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary-brand" />
            </span>
          ) : (
            <span aria-hidden className="h-3.5 w-[3px] shrink-0 rounded-full bg-primary-brand" />
          )}
          <h2 className="truncate font-display text-sm font-black uppercase tracking-[0.12em] text-white">{title}</h2>
          {badge && (
            <span className="shrink-0 rounded bg-white/[0.06] px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider text-slate-400">
              {badge}
            </span>
          )}
        </div>
        {actions}
        {href && (
          <Link
            href={href}
            className="shrink-0 font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400 transition-colors hover:text-primary-brand"
          >
            {hrefLabel} <span className="text-primary-brand">→</span>
          </Link>
        )}
      </header>
      {children}
    </section>
  );
}
