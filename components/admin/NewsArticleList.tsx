"use client";

import { useState } from "react";
import Link from "next/link";
import { newsService } from "@/services";
import {
  NewsArticle,
  NewsArticleListProps,
  NEWS_CATEGORY_LABELS,
} from "@/types";

const STATUS_BADGES: Record<NewsArticle["status"], { label: string; style: string }> = {
  PUBLISHED: {
    label: "PUBLISHED",
    style: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
  },
  DRAFT: {
    label: "DRAFT",
    style: "bg-amber-500/10 text-amber-300 border-amber-500/30",
  },
};

export default function NewsArticleList({
  articles,
  editingId,
  onEdit,
  onChanged,
}: NewsArticleListProps) {
  const [busyId, setBusyId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const run = async (id: string, action: () => Promise<unknown>) => {
    setBusyId(id);
    setError("");
    try {
      await action();
      onChanged();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Action failed.");
    } finally {
      setBusyId(null);
      setConfirmDeleteId(null);
    }
  };

  const toggleStatus = (article: NewsArticle) => {
    const form = new FormData();
    form.set("status", article.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED");
    return run(article.id, () => newsService.updateArticle(article.id, form));
  };

  if (articles.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-[#1F1F1F] bg-[#070707] p-12 text-center">
        <p className="text-xs font-mono text-neutral-400">
          No articles yet. Write the first one using the form.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3.5">
      {error && (
        <p className="text-xs font-mono text-rose-300 bg-rose-500/10 border border-rose-500/30 rounded-xl px-4 py-2.5">
          {error}
        </p>
      )}

      {articles.map((article) => {
        const badge = STATUS_BADGES[article.status];
        const busy = busyId === article.id;
        const isEditing = editingId === article.id;

        return (
          <div
            key={article.id}
            className={`rounded-2xl border bg-[#0A0A0A] p-5 sm:p-6 flex flex-col sm:flex-row gap-5 shadow-sm ${
              isEditing ? "border-emerald-500/40" : "border-[#1A1A1A]"
            }`}
          >
            <div className="w-20 h-20 rounded-xl border border-[#222222] bg-[#141414] shrink-0 overflow-hidden flex items-center justify-center text-emerald-400 font-mono text-xs font-bold shadow-inner">
              {article.image ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={article.image}
                  alt={article.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                "NEWS"
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4">
                <p className="font-display text-base sm:text-lg font-bold text-white">
                  {article.title}
                </p>
                <span
                  className={`shrink-0 text-[10px] font-mono font-bold uppercase px-3 py-1 rounded-full border ${badge.style}`}
                >
                  {badge.label}
                </span>
              </div>

              <p className="mt-1 text-xs font-mono text-neutral-500 uppercase tracking-wider">
                {NEWS_CATEGORY_LABELS[article.category]} ·{" "}
                {article.gameId === "general" ? "ALL DIVISIONS" : article.gameId.toUpperCase()} ·{" "}
                {article.date}
                {article.isFeatured && " · FEATURED"}
              </p>

              <p className="mt-2 text-xs sm:text-sm font-sans text-neutral-300 line-clamp-2 leading-relaxed">
                {article.excerpt}
              </p>

              <div className="mt-4 pt-3.5 border-t border-[#171717] flex flex-wrap justify-end gap-2.5">
                {article.status === "PUBLISHED" && (
                  <Link
                    href={`/community/${article.id}`}
                    target="_blank"
                    className="px-4 py-2 rounded-xl bg-[#141414] border border-[#222222] text-xs font-mono font-semibold text-neutral-300 hover:text-white hover:bg-[#1C1C1C] transition-colors cursor-pointer"
                  >
                    View
                  </Link>
                )}

                <button
                  onClick={() => onEdit(article)}
                  disabled={busy}
                  className="px-4 py-2 rounded-xl bg-[#141414] border border-[#222222] text-xs font-mono font-semibold text-neutral-300 hover:text-white hover:bg-[#1C1C1C] transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isEditing ? "Editing" : "Edit"}
                </button>

                {confirmDeleteId === article.id ? (
                  <>
                    <button
                      onClick={() => setConfirmDeleteId(null)}
                      disabled={busy}
                      className="px-4 py-2 rounded-xl bg-[#141414] border border-[#222222] text-xs font-mono font-semibold text-neutral-300 hover:text-white transition-colors cursor-pointer disabled:opacity-50"
                    >
                      Keep
                    </button>
                    <button
                      onClick={() =>
                        run(article.id, () => newsService.deleteArticle(article.id))
                      }
                      disabled={busy}
                      className="px-4 py-2 rounded-xl bg-[#190D10] border border-rose-900/40 text-xs font-mono font-semibold text-rose-300 hover:text-white transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {busy ? "Deleting..." : "Confirm delete?"}
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setConfirmDeleteId(article.id)}
                    disabled={busy}
                    className="px-4 py-2 rounded-xl bg-[#190D10] border border-rose-900/40 text-xs font-mono font-semibold text-rose-300 hover:text-white transition-colors cursor-pointer disabled:opacity-50"
                  >
                    Delete
                  </button>
                )}

                <button
                  onClick={() => toggleStatus(article)}
                  disabled={busy}
                  className={
                    article.status === "PUBLISHED"
                      ? "px-5 py-2 rounded-xl bg-[#141414] border border-[#222222] text-xs font-mono font-bold text-amber-300 uppercase hover:bg-[#1C1C1C] transition-colors cursor-pointer disabled:opacity-50"
                      : "px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 text-xs font-mono font-extrabold text-black uppercase transition-all cursor-pointer disabled:opacity-50 shadow-md shadow-emerald-500/20 active:scale-95"
                  }
                >
                  {busy
                    ? "Working..."
                    : article.status === "PUBLISHED"
                      ? "Unpublish"
                      : "Publish"}
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
