"use client";

import AdminPageHeader from "@/components/admin/AdminPageHeader";
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
    <div className="mx-auto w-full max-w-6xl space-y-8 px-5 py-8 sm:px-8 lg:px-10 lg:py-10">
      <AdminPageHeader
        eyebrow="Content"
        title="Campus newsroom"
        description="Write the articles collegiate athletes and guests read on the public Newsroom. Drafts stay private until you publish them."
      />

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
