"use client";

import React, { useState } from "react";
import { mockNewsArticles, NewsArticle } from "@/lib/mock/news";
import Link from "next/link";
import { TrophyIcon, FlameIcon, ZapIcon, CalendarIcon, ClockIcon } from "@/components/ui/Icons";

export default function CommunityPage() {
  const [activeCategory, setActiveCategory] = useState<string>("ALL");

  const categories = ["ALL", "TOURNAMENTS", "ANNOUNCEMENTS", "RULESETS", "SPOTLIGHTS"];

  const featuredArticle = mockNewsArticles.find((a) => a.isFeatured) || mockNewsArticles[0];
  const secondaryArticles = mockNewsArticles.filter((a) => a.id !== featuredArticle.id);

  const filteredArticles = activeCategory === "ALL" 
    ? secondaryArticles 
    : secondaryArticles.filter((a) => a.category.toUpperCase().includes(activeCategory));

  return (
    <div className="flex flex-col flex-1 game-theme-bg relative">
      <div className="mx-auto w-full max-w-[1400px] px-4 sm:px-6 md:px-10 lg:px-16 py-8 sm:py-12 lg:py-16 space-y-10">
        
        {/* Page Header */}
        <div className="border-b border-[#1E2538] pb-6 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-mono font-bold tracking-widest text-primary-brand uppercase flex items-center gap-1.5">
                <ZapIcon className="w-4 h-4 text-primary-brand" />
                OFFICIAL COLLEGIUM MEDIA & NEWS
              </span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-foreground uppercase">
              CIRCUIT NEWS & ANNOUNCEMENTS
            </h1>
            <p className="font-sans text-xs sm:text-sm text-secondary-text mt-1 max-w-2xl leading-relaxed">
              Stay updated on official tournament recaps, regional qualifiers, patch rulesets, and collegiate varsity athlete spotlights.
            </p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => {
              const isActive = activeCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-xl font-sans text-xs font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap border ${
                    isActive
                      ? "bg-primary-brand text-white border-primary-brand shadow-lg shadow-primary-brand/30"
                      : "bg-[#121624] text-secondary-text border-[#222B3F] hover:text-foreground hover:bg-[#182033]"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Featured Hero Article Spotlight */}
        {featuredArticle && activeCategory === "ALL" && (
          <div className="group relative overflow-hidden rounded-2xl border border-[#1E273A] bg-[#0C101A] shadow-2xl transition-all duration-300 hover:border-primary-brand/50">
            {/* Top Accent Line */}
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary-brand via-accent to-primary-brand" />

            <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[380px]">
              {/* Media Banner Side */}
              <div className={`lg:col-span-7 relative overflow-hidden bg-gradient-to-br ${featuredArticle.bgGradient} p-8 lg:p-12 flex flex-col justify-between`}>
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-white/10 via-transparent to-black/70 pointer-events-none" />
                
                <div className="relative z-10 flex items-center justify-between">
                  <span className="font-mono text-[10px] font-extrabold tracking-widest text-white uppercase px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 shadow-md">
                    ★ FEATURED STORY
                  </span>
                  <span className="font-mono text-xs font-bold text-slate-300 flex items-center gap-1.5 bg-black/40 px-3 py-1 rounded-full border border-white/10">
                    <ClockIcon className="w-3.5 h-3.5 text-primary-brand" />
                    {featuredArticle.readTime || "4 MIN READ"}
                  </span>
                </div>

                <div className="relative z-10 mt-12 lg:mt-0">
                  <span className="font-display text-4xl sm:text-5xl font-black uppercase text-white/15 tracking-tighter block group-hover:text-white/25 transition-colors">
                    COLLEGIUM
                  </span>
                </div>
              </div>

              {/* Story Content Side */}
              <div className="lg:col-span-5 p-6 sm:p-8 lg:p-10 flex flex-col justify-between bg-[#0C101A]/95 backdrop-blur-md">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] font-bold text-primary-brand uppercase tracking-widest bg-primary-brand/10 px-2.5 py-1 rounded-md border border-primary-brand/20">
                      {featuredArticle.category}
                    </span>
                    <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
                      <CalendarIcon className="w-3.5 h-3.5 text-slate-400" />
                      {featuredArticle.date}
                    </span>
                  </div>

                  <h2 className="font-display text-xl sm:text-2xl font-extrabold uppercase text-foreground leading-snug group-hover:text-primary-brand transition-colors">
                    {featuredArticle.title}
                  </h2>

                  <p className="font-sans text-xs sm:text-sm text-secondary-text leading-relaxed">
                    {featuredArticle.excerpt}
                  </p>
                </div>

                <div className="pt-6 mt-6 border-t border-[#1E2538] flex items-center justify-between">
                  <span className="text-[11px] font-mono text-slate-400">
                    BY {featuredArticle.author || "COLLEGIUM STAFF"}
                  </span>
                  <Link
                    href={`/community/article/${featuredArticle.id}`}
                    className="h-10 px-5 rounded-xl game-theme-btn font-sans text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-md cursor-pointer"
                  >
                    <span>Read Story</span>
                    <span>→</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* News Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-base sm:text-lg font-bold uppercase text-foreground tracking-wide">
              {activeCategory === "ALL" ? "LATEST COVERAGE" : `${activeCategory} ARTICLES`} ({filteredArticles.length})
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArticles.map((article) => (
              <article
                key={article.id}
                className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-[#1E273A] bg-[#0C101A]/95 p-6 shadow-xl transition-all duration-300 hover:border-primary-brand/40 hover:bg-[#101524] min-h-[360px] backdrop-blur-md"
              >
                {/* Top Accent Line */}
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary-brand/60 via-accent/40 to-primary-brand/60 opacity-0 group-hover:opacity-100 transition-opacity" />

                <div>
                  <div
                    className={`w-full h-40 rounded-xl overflow-hidden bg-gradient-to-br ${article.bgGradient} mb-5 relative p-4 flex flex-col justify-between shadow-md`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0C101A]/80 pointer-events-none" />
                    <div className="relative z-10 flex items-center justify-between">
                      <span className="font-mono text-[9px] font-extrabold tracking-widest text-white uppercase px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md border border-white/15">
                        {article.category}
                      </span>
                      {article.readTime && (
                        <span className="font-mono text-[10px] text-slate-300 bg-black/40 px-2 py-0.5 rounded-md">
                          {article.readTime}
                        </span>
                      )}
                    </div>
                  </div>

                  <h2 className="font-display text-base font-bold tracking-wide text-foreground uppercase leading-snug group-hover:text-primary-brand transition-colors">
                    {article.title}
                  </h2>

                  <p className="mt-2.5 font-sans text-xs text-secondary-text leading-relaxed line-clamp-3">
                    {article.excerpt}
                  </p>
                </div>

                <div className="mt-6 flex items-center justify-between pt-4 border-t border-[#1E2538]">
                  <span className="font-mono text-[11px] text-slate-400 flex items-center gap-1">
                    <CalendarIcon className="w-3.5 h-3.5 text-slate-400" />
                    {article.date}
                  </span>
                  <Link
                    href={`/community/article/${article.id}`}
                    className="font-sans text-xs font-bold text-primary-brand hover:underline flex items-center gap-1"
                  >
                    <span>Read More</span>
                    <span>→</span>
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>

        {/* Collegiate Broadcast & Community Discord Join Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#141A29] via-[#0E121E] to-[#141A29] border border-[#232D44] p-8 sm:p-10 shadow-2xl backdrop-blur-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <span className="text-xs font-mono font-extrabold text-secondary-brand uppercase tracking-widest flex items-center justify-center md:justify-start gap-1.5">
              <TrophyIcon className="w-4 h-4 text-[#F2B705]" />
              COLLEGIUM BROADCAST & COMMUNITY
            </span>
            <h3 className="font-display text-xl sm:text-2xl font-black text-foreground uppercase tracking-wide">
              Want Your Varsity Match Streamed Live?
            </h3>
            <p className="font-sans text-xs sm:text-sm text-secondary-text max-w-xl">
              Join the official COLLEGIUM Discord to submit match clips, request broadcast casters, and receive real-time scrim notifications.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <a
              href="https://discord.gg"
              target="_blank"
              rel="noreferrer"
              className="h-11 px-6 rounded-xl game-theme-btn font-sans text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg cursor-pointer"
            >
              <FlameIcon className="w-4 h-4 text-white" />
              <span>Join Collegiate Discord</span>
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}


