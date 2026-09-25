"use client";

import { TournamentsFilterTabsProps } from "@/types";
import SegmentedControl from "@/components/ui/SegmentedControl";

export default function TournamentsFilterTabs({ tabs, active, onChange }: TournamentsFilterTabsProps) {
  return (
    <SegmentedControl
      ariaLabel="Filter tournaments"
      value={active}
      onChange={onChange}
      options={tabs.map((t) => ({ id: t.id, label: t.label, count: t.count, live: t.id === "LIVE" && t.count > 0 }))}
    />
  );
}
