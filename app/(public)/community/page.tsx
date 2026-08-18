"use client";

import React, { useState } from "react";
import { mockNewsArticles, NewsArticle } from "@/lib/mock/news";
import Link from "next/link";
import { TrophyIcon, FlameIcon, ZapIcon, CalendarIcon, ClockIcon } from "@/components/ui/Icons";

export default function CommunityPage() {
  const [activeCategory, setActiveCategory] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const categories = ["ALL", "TOURNAMENTS", "ANNOUNCEMENTS", "RULESETS", "SPOTLIGHTS"];

  const featuredArticle = mockNewsArticles.find((a) => a.isFeatured) || mockNewsArticles[0];
  const secondaryArticles = mockNewsArticles.filter((a) => a.id !== featuredArticle.id);

  const filteredArticles = secondaryArticles.filter((a) => {
    const matchesCategory = activeCategory === "ALL" || a.category.toUpperCase().includes(activeCategory);
    const matchesSearch = searchQuery === "" || 
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      a.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="flex flex-col flex-1 game-theme-bg relative">
      <div className="mx-auto w-full max-w-[1400px] px-4 sm:px-6 md:px-10 lg:px-16 py-8 sm:py-12 lg:py-16 space-y-10">
        
        {/* Header Banner & Search / Filter Controls */}
        <div className="border-b border-[#1E2538] pb-6 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-mono font-bold tracking-widest text-primary-brand uppercase flex items-center gap-1.5">
                <ZapIcon className="w-4 h-4 text-primary-brand" />
                OFFICIAL COLLEGIUM MEDIA & EDITORIAL
              </span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white uppercase">
              CIRCUIT NEWS & ANNOUNCEMENTS
            </h1>
            <p className="font-sans text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Official tournament recaps, regional qualifiers, ruleset updates, and collegiate varsity spotlights.
            </p>
          </div>

          {/* Search & Category Filter Pills */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <input
              type="text"
              placeholder="Search news..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 px-4 rounded-xl bg-[#0D121F] border border-[#1E293B] text-white text-xs font-sans placeholder-slate-500 focus:outline-none focus:border-primary-brand/60"
            />

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {categories.map((cat) => {
                const isActive = activeCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-3.5 py-2 rounded-xl font-sans text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap border ${
                      isActive
                        ? "bg-primary-brand text-white border-primary-brand shadow-lg shadow-red-950/50"
                        : "bg-[#0D121F] text-slate-400 border-[#1E293B] hover:text-white hover:bg-[#141A29]"
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Featured Hero Article Spotlight */}
        {featuredArticle && activeCategory === "ALL" && !searchQuery && (
          <div className="group relative overflow-hidden rounded-3xl border border-[#1E293B] bg-[#0D121F]/95 shadow-2xl transition-all duration-300 hover:border-primary-brand/50">
            <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[380px]">
              
              {/* Featured Image Side */}
              <div className="lg:col-span-7 relative overflow-hidden h-64 lg:h-auto">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={featuredArticle.image}
                  alt={featuredArticle.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
                
                <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
                  <span className="font-mono text-[10px] font-extrabold tracking-widest text-white uppercase px-3 py-1 rounded-full bg-primary-brand/90 shadow-md">
                    FEATURED STORY
                  </span>
                  <span className="font-mono text-xs font-bold text-slate-200 flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                    <ClockIcon className="w-3.5 h-3.5 text-primary-brand" />
                    {featuredArticle.readTime || "4 MIN READ"}
                  </span>
                </div>
              </div>

              {/* Featured Content Side */}
              <div className="lg:col-span-5 p-6 sm:p-8 lg:p-10 flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] font-extrabold text-primary-brand uppercase tracking-widest bg-primary-brand/15 px-3 py-1 rounded-full border border-primary-brand/30">
                      {featuredArticle.category}
                    </span>
                    <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
                      <CalendarIcon className="w-3.5 h-3.5 text-slate-400" />
                      {featuredArticle.date}
                    </span>
                  </div>

                  <h2 className="font-display text-xl sm:text-2xl font-black uppercase text-white leading-snug group-hover:text-primary-brand transition-colors">
                    {featuredArticle.title}
                  </h2>

                  <p className="font-sans text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {featuredArticle.excerpt}
                  </p>
                </div>

                <div className="pt-6 border-t border-[#1E2538] flex items-center justify-between">
                  <span className="text-[11px] font-mono text-slate-400 font-bold">
                    BY {featuredArticle.author || "COLLEGIUM MEDIA"}
                  </span>
                  <Link
                    href={`/community`}
                    className="h-10 px-5 rounded-xl game-theme-btn font-sans text-xs font-extrabold uppercase tracking-wider flex items-center gap-2 shadow-lg cursor-pointer"
                  >
                    <span>Read Article</span>
                    <span>→</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* News Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-[#1E2538] pb-3">
            <h3 className="font-display text-base sm:text-lg font-black uppercase text-white tracking-wide">
              {activeCategory === "ALL" ? "LATEST COVERAGE" : `${activeCategory} ARTICLES`} ({filteredArticles.length})
            </h3>
          </div>

          {filteredArticles.length === 0 ? (
            <div className="p-8 rounded-3xl bg-[#0D121F]/95 border border-[#1E293B] text-center space-y-2">
              <p className="text-xs font-sans text-slate-400">No articles found matching your criteria.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredArticles.map((article) => (
                <article
                  key={article.id}
                  className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-[#1E293B] bg-[#0D121F]/95 shadow-xl transition-all duration-300 hover:border-primary-brand/50 hover:-translate-y-1"
                >
                  <div>
                    {/* Article Thumbnail Image */}
                    <div className="w-full h-44 overflow-hidden relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={article.image}
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0D121F] via-transparent to-black/30" />
                      
                      <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
                        <span className="font-mono text-[9px] font-extrabold tracking-widest text-white uppercase px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md border border-white/20">
                          {article.category}
                        </span>
                      </div>
                      {article.readTime && (
                        <div className="absolute bottom-3 right-3 z-10">
                          <span className="font-mono text-[10px] text-slate-200 bg-black/60 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-white/10">
                            {article.readTime}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="p-6 space-y-3">
                      <h2 className="font-display text-base font-black tracking-wide text-white uppercase leading-snug group-hover:text-primary-brand transition-colors">
                        {article.title}
                      </h2>

                      <p className="font-sans text-xs text-slate-300 leading-relaxed line-clamp-3">
                        {article.excerpt}
                      </p>
                    </div>
                  </div>

                  <div className="px-6 pb-6 pt-2 flex items-center justify-between border-t border-[#1C2538] mt-2">
                    <span className="font-mono text-[11px] text-slate-400 flex items-center gap-1">
                      <CalendarIcon className="w-3.5 h-3.5 text-slate-400" />
                      {article.date}
                    </span>
                    <span className="font-sans text-xs font-extrabold text-primary-brand flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      <span>Read</span>
                      <span>→</span>
                    </span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        {/* Collegiate Broadcast & Discord Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-[#0D121F]/95 border border-[#1E293B] p-8 sm:p-10 shadow-2xl backdrop-blur-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <span className="text-xs font-mono font-extrabold text-primary-brand uppercase tracking-widest flex items-center justify-center md:justify-start gap-1.5">
              <TrophyIcon className="w-4 h-4 text-[#F2B705]" />
              COLLEGIUM BROADCAST & COMMUNITY
            </span>
            <h3 className="font-display text-xl sm:text-2xl font-black text-white uppercase tracking-wide">
              Want Your Varsity Match Streamed Live?
            </h3>
            <p className="font-sans text-xs sm:text-sm text-slate-300 max-w-xl">
              Join the official COLLEGIUM Discord to submit match clips, request broadcast casters, and receive real-time scrimmage notifications.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <a
              href="https://discord.gg"
              target="_blank"
              rel="noreferrer"
              className="h-11 px-6 rounded-xl game-theme-btn font-sans text-xs font-extrabold uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg cursor-pointer"
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
