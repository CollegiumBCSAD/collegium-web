"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { NewsArticle, GameId } from "@/types";
import { ClockIcon, CalendarIcon } from "@/components/ui/Icons";

interface HomeNewsHubProps {
  articles: NewsArticle[];
  activeGame: GameId;
}

export default function HomeNewsHub({ articles, activeGame }: HomeNewsHubProps) {
  const gameArticles = articles.filter(
    (a) => a.gameId === activeGame || a.gameId === "general"
  );

  const featured = gameArticles.find((a) => a.isFeatured) || gameArticles[0];
  const sideArticles = gameArticles.filter((a) => a.id !== featured?.id).slice(0, 3);

  return (
    <div className="w-full space-y-3.5">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#202C48]/50 pb-2.5">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-primary-brand animate-pulse" />
          <h2 className="font-display text-base sm:text-lg font-black uppercase tracking-wider text-white">
            Circuit News & Dispatches
          </h2>
        </div>

        <Link
          href="/community"
          className="font-mono text-xs font-bold text-primary-brand hover:underline flex items-center gap-1 uppercase tracking-wider"
        >
          <span>All News</span>
          <span>→</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
        {/* Main Featured News Card */}
        {featured && (
          <div className="lg:col-span-7">
            <Link
              href="/community"
              className="group relative flex flex-col justify-end overflow-hidden rounded-xl bg-[#0D1220] hover:bg-[#121828] border border-[#18233B] hover:border-primary-brand/50 transition-all duration-200 h-[260px] sm:h-[290px] p-5 shadow-md"
            >
              {/* Background Cover Image */}
              <div className="absolute inset-0 z-0">
                <Image
                  src={featured.image}
                  alt={featured.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500 opacity-40"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#090D18] via-[#090D18]/80 to-transparent" />
              </div>

              {/* Content Overlay */}
              <div className="relative z-10 space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-primary-brand text-white font-mono text-[9px] font-black uppercase tracking-wider">
                    {featured.category}
                  </span>
                  <span className="flex items-center gap-1 font-mono text-[10px] text-slate-400">
                    <CalendarIcon className="w-3 h-3" />
                    {featured.date}
                  </span>
                </div>

                <h3 className="font-display text-base sm:text-lg font-black uppercase text-white tracking-wide group-hover:text-primary-brand transition-colors line-clamp-2">
                  {featured.title}
                </h3>

                <p className="font-sans text-xs text-slate-300 line-clamp-2 leading-relaxed">
                  {featured.excerpt}
                </p>

                <div className="flex items-center justify-between pt-2 border-t border-[#18233B] text-[10px] font-mono text-slate-400">
                  <span>BY {featured.author || "COLLEGIUM DESK"}</span>
                  {featured.readTime && (
                    <span className="flex items-center gap-1">
                      <ClockIcon className="w-3 h-3" />
                      {featured.readTime}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          </div>
        )}

        {/* Side News Stream */}
        <div className="lg:col-span-5 flex flex-col gap-2">
          {sideArticles.map((article) => (
            <Link
              key={article.id}
              href="/community"
              className="group flex items-center gap-3 p-2.5 rounded-xl bg-[#0D1220] hover:bg-[#121828] border border-[#18233B] hover:border-primary-brand/40 transition-all duration-150 shadow-sm"
            >
              {/* Thumbnail */}
              <div className="relative w-20 h-16 shrink-0 overflow-hidden rounded bg-[#070A12] border border-[#1E2942]">
                <Image
                  src={article.image}
                  alt={article.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              {/* Text */}
              <div className="flex flex-col flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-[9px] font-mono font-bold text-primary-brand uppercase">
                    {article.category}
                  </span>
                  <span className="text-[8px] font-mono text-slate-500">•</span>
                  <span className="text-[9px] font-mono text-slate-400">
                    {article.date}
                  </span>
                </div>

                <h4 className="font-display text-xs font-bold uppercase text-slate-200 group-hover:text-white line-clamp-2 leading-tight">
                  {article.title}
                </h4>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
