"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

interface BackLinkProps {
  /** Where to go. With `useHistory`, only used when there's no page to go back to. */
  href: string;
  label: string;
  /** For pages reached from many places (invite links, brackets): go back in history. */
  useHistory?: boolean;
}

const CLASS =
  "group inline-flex items-center gap-2.5 text-[11px] font-mono font-bold uppercase tracking-[0.2em] text-slate-400 hover:text-white transition-colors";

const Arrow = () => (
  <span className="w-7 h-7 flex items-center justify-center rounded-lg border border-white/10 bg-black/30 text-primary-brand transition-all group-hover:-translate-x-0.5 group-hover:border-primary-brand/50">
    ←
  </span>
);

export default function BackLink({ href, label, useHistory = false }: BackLinkProps) {
  const router = useRouter();

  if (useHistory) {
    return (
      <button
        type="button"
        onClick={() => (window.history.length > 1 ? router.back() : router.push(href))}
        className={CLASS}
      >
        <Arrow />
        {label}
      </button>
    );
  }

  return (
    <Link href={href} className={CLASS}>
      <Arrow />
      {label}
    </Link>
  );
}
