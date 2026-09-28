"use client";

import { useCallback, useEffect, useState } from "react";
import { newsService } from "@/services";
import { NewsArticle } from "@/types";
import NewsArticleEditor from "@/components/admin/NewsArticleEditor";
import NewsArticleList from "@/components/admin/NewsArticleList";

export default function AdminNewsfeedPage() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<NewsArticle | null>(null);
  // Bumped on every save so the editor remounts, which is what clears the
  // fields and the file input without a reset effect.
  const [formGeneration, setFormGeneration] = useState(0);

  const fetchArticles = useCallback(async () => {
    try {
      const data = await newsService.getAllForAdmin();
      setArticles(data);
    } catch (err) {
      console.error("Failed to load news articles:", err);
    }
  }, []);

  useEffect(() => {
    let active = true;
    newsService
      .getAllForAdmin()
      .then((data) => {
        if (active) setArticles(data);
      })
      .catch((err) => console.error("Failed to load news articles:", err))
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const drafts = articles.filter((a) => a.status === "DRAFT");
  const published = articles.filter((a) => a.status === "PUBLISHED");

  return (
    <div className="p-6 sm:p-8 lg:p-10 space-y-6 max-w-7xl">
      <div className="border-b border-[#1A1A1A] pb-5">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-[10px] font-mono font-bold tracking-widest text-emerald-400 uppercase px-3 py-0.5 bg-emerald-500/10 border border-emerald-500/30 rounded-full">
            EDITORIAL &amp; CONTENT
          </span>
        </div>
        <h1 className="font-display text-2xl sm:text-3xl font-black tracking-tight text-white uppercase">
          Campus Newsroom
        </h1>
        <p className="font-sans text-xs sm:text-sm text-neutral-400 mt-1 max-w-2xl leading-relaxed">
          Write the articles collegiate athletes and guests read on the public
          Newsroom. Drafts stay private until you publish them.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[420px_1fr] gap-8 items-start">
        <div className="lg:sticky lg:top-8">
          <NewsArticleEditor
            key={editing?.id ?? `new-${formGeneration}`}
            article={editing}
            onSaved={() => {
              setEditing(null);
              setFormGeneration((g) => g + 1);
              fetchArticles();
            }}
            onCancelEdit={() => setEditing(null)}
          />
        </div>

        <div className="space-y-8">
          {loading && articles.length === 0 ? (
            <div className="p-12 text-center text-xs font-mono text-neutral-400">
              Loading newsroom...
            </div>
          ) : (
            <>
              {drafts.length > 0 && (
                <section className="space-y-3.5">
                  <h2 className="font-mono text-[10px] font-bold uppercase tracking-widest text-amber-300">
                    Drafts ({drafts.length})
                  </h2>
                  <NewsArticleList
                    articles={drafts}
                    editingId={editing?.id}
                    onEdit={setEditing}
                    onChanged={fetchArticles}
                  />
                </section>
              )}

              <section className="space-y-3.5">
                <h2 className="font-mono text-[10px] font-bold uppercase tracking-widest text-emerald-400">
                  Published ({published.length})
                </h2>
                <NewsArticleList
                  articles={published}
                  editingId={editing?.id}
                  onEdit={setEditing}
                  onChanged={fetchArticles}
                />
              </section>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
