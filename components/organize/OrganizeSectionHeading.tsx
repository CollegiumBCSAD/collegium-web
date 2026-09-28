"use client";

import { OrganizeSectionHeadingProps } from "@/types";

export default function OrganizeSectionHeading({ index, title, subtitle, id, children }: OrganizeSectionHeadingProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
      <div className="flex items-end gap-4">
        <span
          aria-hidden
          className="font-display text-5xl font-black leading-[0.8] text-transparent [-webkit-text-stroke:1px_rgba(var(--game-glow-rgb),0.6)]"
        >
          {index}
        </span>
        <div>
          <h2 id={id} className="font-display text-xl font-black uppercase text-white tracking-wide leading-none">
            {title}
          </h2>
          {subtitle && <p className="mt-1.5 text-xs font-sans text-slate-500">{subtitle}</p>}
        </div>
      </div>
      {children}
    </div>
  );
}
