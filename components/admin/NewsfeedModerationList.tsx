"use client";

import { useState } from "react";
import { NewsfeedModerationItem } from "@/types";

const STATUS_BADGES: Record<NewsfeedModerationItem["status"], { label: string; style: string }> = {
  PUBLISHED: {
    label: "PUBLISHED",
    style: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
  },
  PENDING: {
    label: "PENDING REVIEW",
    style: "bg-amber-500/10 text-amber-300 border-amber-500/30",
  },
  FLAGGED: {
    label: "FLAGGED",
    style: "bg-rose-500/10 text-rose-300 border-rose-500/30",
  },
};

interface NewsfeedModerationListProps {
  initialData: NewsfeedModerationItem[];
}

export default function NewsfeedModerationList({ initialData }: NewsfeedModerationListProps) {
  const [items, setItems] = useState(initialData);

  const remove = (id: string) => setItems((prev) => prev.filter((i) => i.id !== id));
  const setStatus = (id: string, status: NewsfeedModerationItem["status"]) =>
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, status } : i)));

  if (items.length === 0) {
    return <p className="text-sm font-mono text-neutral-400">No newsfeed items to moderate.</p>;
  }

  return (
    <div className="space-y-3.5">
      {items.map((item) => {
        const badge = STATUS_BADGES[item.status];
        return (
          <div
            key={item.id}
            className="rounded-2xl border border-[#1A1A1A] bg-[#0A0A0A] p-5 sm:p-6 flex flex-col sm:flex-row gap-5 shadow-sm"
          >
            <div className="w-20 h-20 rounded-xl border border-[#222222] bg-[#141414] shrink-0 flex items-center justify-center text-emerald-400 font-mono text-xs font-bold shadow-inner">
              NEWS
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4">
                <p className="font-display text-base sm:text-lg font-bold text-white">{item.headline}</p>
                <span className={`shrink-0 text-[10px] font-mono font-bold uppercase px-3 py-1 rounded-full border ${badge.style}`}>
                  {badge.label}
                </span>
              </div>
              <p className="mt-1 text-xs font-sans text-neutral-400">{item.detail}</p>
              <p className="mt-2 text-xs sm:text-sm font-sans text-neutral-300 line-clamp-2 leading-relaxed">{item.excerpt}</p>

              <div className="mt-4 pt-3.5 border-t border-[#171717] flex justify-end gap-2.5">
                <button className="px-4 py-2 rounded-xl bg-[#141414] border border-[#222222] text-xs font-mono font-semibold text-neutral-300 hover:text-white hover:bg-[#1C1C1C] transition-colors cursor-pointer">
                  Edit
                </button>
                <button
                  onClick={() => remove(item.id)}
                  className="px-4 py-2 rounded-xl bg-[#190D10] border border-rose-900/40 text-xs font-mono font-semibold text-rose-300 hover:text-white transition-colors cursor-pointer"
                >
                  Remove
                </button>
                {item.status === "PENDING" && (
                  <button
                    onClick={() => setStatus(item.id, "PUBLISHED")}
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 text-xs font-mono font-extrabold text-black uppercase transition-all cursor-pointer shadow-md shadow-emerald-500/20 active:scale-95"
                  >
                    Publish
                  </button>
                )}
                {item.status === "FLAGGED" && (
                  <button
                    onClick={() => setStatus(item.id, "PUBLISHED")}
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 text-xs font-mono font-extrabold text-black uppercase transition-all cursor-pointer shadow-md shadow-emerald-500/20 active:scale-95"
                  >
                    Keep Published
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
