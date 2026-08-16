"use client";

import React from "react";
import Link from "next/link";

interface DashboardShortcutTileProps {
  href: string;
  icon: string;
  title: string;
  description: string;
}

export default function DashboardShortcutTile({
  href,
  icon,
  title,
  description,
}: DashboardShortcutTileProps) {
  return (
    <Link
      href={href}
      className="w-full p-3 rounded-xl bg-background border border-panel-border hover:border-primary-brand flex items-center justify-between transition-colors"
    >
      <div className="flex items-center gap-3">
        <span className="text-lg">{icon}</span>
        <div>
          <h4 className="font-display text-xs font-bold uppercase text-foreground">{title}</h4>
          <span className="text-[10px] font-sans text-secondary-text">{description}</span>
        </div>
      </div>
      <span className="text-xs text-secondary-text">→</span>
    </Link>
  );
}
