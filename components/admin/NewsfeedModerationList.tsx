"use client";

import { useState } from "react";
import { NewsfeedModerationItem } from "@/types";

const STATUS_STYLES: Record<NewsfeedModerationItem["status"], { border: string; text: string }> = {
  PUBLISHED: { border: "border-success", text: "text-success" },
  PENDING: { border: "border-secondary-brand", text: "text-secondary-brand" },
  FLAGGED: { border: "border-error", text: "text-error" },
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
    return <p className="text-sm font-sans text-secondary-text">No newsfeed items to moderate.</p>;
  }

  return (
    <div className="space-y-4">
      {items.map((item) => {
        const style = STATUS_STYLES[item.status];
        return (
          <div
            key={item.id}
            className={`rounded-[10px] border ${style.border} bg-card-bg px-6 py-5 flex gap-4`}
          >
            <div className="w-[100px] h-[100px] rounded-lg border border-panel-border bg-raised-panel shrink-0" />

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4">
                <p className="font-display text-lg font-bold text-foreground">{item.headline}</p>
                <span className={`shrink-0 text-[11px] font-sans font-bold uppercase ${style.text}`}>
                  {item.status === "PENDING" ? "Pending Review" : item.status}
                </span>
              </div>
              <p className="mt-1 text-xs font-sans text-secondary-text">{item.detail}</p>
              <p className="mt-2 text-sm font-sans text-foreground/80 line-clamp-2">{item.excerpt}</p>

              <div className="mt-3 flex justify-end gap-3">
                <button className="px-3 py-1.5 rounded-md bg-white/10 text-[11px] font-sans font-bold uppercase text-foreground hover:bg-white/20 transition-colors cursor-pointer">
                  Edit
                </button>
                <button
                  onClick={() => remove(item.id)}
                  className="px-3 py-1.5 rounded-md bg-white/10 text-[11px] font-sans font-bold uppercase text-foreground hover:bg-white/20 transition-colors cursor-pointer"
                >
                  Remove
                </button>
                {item.status === "PENDING" && (
                  <button
                    onClick={() => setStatus(item.id, "PUBLISHED")}
                    className="px-3 py-1.5 rounded-md bg-primary-brand/60 text-[11px] font-sans font-bold uppercase text-foreground hover:bg-primary-brand/80 transition-colors cursor-pointer"
                  >
                    Publish
                  </button>
                )}
                {item.status === "FLAGGED" && (
                  <button
                    onClick={() => setStatus(item.id, "PUBLISHED")}
                    className="px-3 py-1.5 rounded-md bg-primary-brand/60 text-[11px] font-sans font-bold uppercase text-foreground hover:bg-primary-brand/80 transition-colors cursor-pointer"
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
