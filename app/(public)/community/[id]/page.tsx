"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { newsService } from "@/services/newsService";
import { NewsArticle, NEWS_CATEGORY_LABELS } from "@/types";
import { CalendarIcon, ClockIcon } from "@/components/ui/Icons";
import ArticleBody from "@/components/news/ArticleBody";

const CUT_CORNER = {
  clipPath:
    "polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px))",
};

export default function NewsArticlePage() {
  const params = useParams();
  const articleId = params?.id as string;

  const [article, setArticle] = useState<NewsArticle | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!articleId) return;
    let isMounted = true;

    newsService
      .getArticleById(articleId)
      .then((data) => {
        if (!isMounted) return;
        setArticle(data);
        setLoading(false);
      })
      .catch(() => {
        if (!isMounted) return;
        setArticle(null);
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [articleId]);

  if (loading) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center text-xs font-mono text-slate-400 animate-pulse">
        Loading Dispatch...
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-[85vh] flex flex-col items-center justify-center p-6 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-[#141926] border border-[#232B3E] flex items-center justify-center text-rose-400 text-2xl shadow-xl">
          ⚠️
        </div>
        <h2 className="font-display text-2xl font-black uppercase text-white">
          Dispatch Not Found
        </h2>
        <p className="text-xs font-sans text-slate-400 max-w-sm">
          This article is no longer published, or the link is out of date.
        </p>
        <Link
          href="/community"
          className="h-10 px-5 rounded-xl game-theme-btn font-sans text-xs font-bold uppercase tracking-wider inline-flex items-center gap-2 shadow-md"
        >
          Back to Newsroom
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 game-theme-bg relative animate-page-slide-in">
      <div className="mx-auto w-full max-w-3xl px-4 sm:px-6 md:px-10 py-8 sm:py-12 space-y-8">
        <Link
          href="/community"
          className="inline-flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-primary-brand transition-colors"
        >
          <span>←</span>
          <span>All dispatches</span>
        </Link>

        <header className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className="font-mono text-[9px] font-black tracking-widest uppercase px-3 py-0.5 shadow-md"
              style={{
                backgroundColor: "var(--primary-brand)",
                color: "var(--game-btn-text, #FFFFFF)",
                clipPath:
                  "polygon(4px 0, 100% 0, calc(100% - 4px) 100%, 0 100%)",
              }}
            >
              {NEWS_CATEGORY_LABELS[article.category]}
            </span>
            <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
              <CalendarIcon className="w-3 h-3 text-slate-400" />
              {article.date}
            </span>
            <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
              <ClockIcon className="w-3 h-3 text-slate-400" />
              {article.readTime}
            </span>
          </div>

          <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-black uppercase leading-tight tracking-tight text-white">
            {article.title}
          </h1>

          <p className="font-sans text-sm sm:text-base text-slate-300 leading-relaxed">
            {article.excerpt}
          </p>

          <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-slate-500 pt-1 border-t border-[#1E2538]">
            By {article.author || "Collegium Media"}
          </p>
        </header>

        {article.image && (
          <div
            className="relative overflow-hidden border border-[#1E293B] bg-[#060812]"
            style={CUT_CORNER}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={article.image}
              alt={article.title}
              className="w-full max-h-[420px] object-cover"
            />
          </div>
        )}

        <article
          className="p-5 sm:p-8 bg-[#0A0D18] border border-[#1E293B] shadow-xl"
          style={CUT_CORNER}
        >
          <ArticleBody body={article.body} />
        </article>
      </div>
    </div>
  );
}
