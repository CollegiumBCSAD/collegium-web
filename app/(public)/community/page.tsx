"use client";

import { useState, useMemo } from "react";
import { useGame } from "@/context/GameContext";
import { mockNewsArticles } from "@/lib/mock/news";
import Link from "next/link";
import { FlameIcon, CalendarIcon, ClockIcon } from "@/components/ui/Icons";

export default function CommunityPage() {
  const { selectedGame: globalGame, selectedGameInfo, openGameSelector } = useGame();
  const [activeCategory, setActiveCategory] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const categories = [
    { id: "ALL", label: "ALL TOPICS" },
    { id: "TOURNAMENT CIRCUIT", label: "CIRCUITS" },
    { id: "TACTICAL META", label: "META" },
    { id: "RULESET & PATCH", label: "RULESETS" },
    { id: "ATHLETE SPOTLIGHT", label: "SPOTLIGHTS" },
  ];

  // Filter articles exclusively by the selected game from the game selector
  const gameFilteredArticles = useMemo(() => {
    const targetGame = globalGame || "valo";
    return mockNewsArticles.filter((a) => a.gameId === targetGame || a.gameId === "general");
  }, [globalGame]);

  const featuredArticle = useMemo(() => {
    return gameFilteredArticles.find((a) => a.isFeatured) || gameFilteredArticles[0] || mockNewsArticles[0];
  }, [gameFilteredArticles]);

  const secondaryArticles = useMemo(() => {
    return gameFilteredArticles.filter((a) => a.id !== featuredArticle?.id);
  }, [gameFilteredArticles, featuredArticle]);

  const filteredArticles = useMemo(() => {
    return secondaryArticles.filter((a) => {
      const matchesCategory = activeCategory === "ALL" || a.category.toUpperCase().includes(activeCategory.toUpperCase());
      const matchesSearch = searchQuery === "" || 
        a.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        a.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [secondaryArticles, activeCategory, searchQuery]);

  return (
    <div className="flex flex-col flex-1 game-theme-bg relative animate-page-slide-in">
      <div className="mx-auto w-full max-w-[1400px] px-4 sm:px-6 md:px-10 lg:px-16 py-8 sm:py-12 lg:py-16 space-y-8">
        
        {/* Sleek Integrated Header Section */}
        <div className="border-b border-[#1E2538] pb-6 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span 
                className="text-[9px] font-mono font-bold tracking-widest text-primary-brand uppercase px-2.5 py-0.5 bg-primary-brand/10 border border-primary-brand/30 flex items-center gap-1.5"
                style={{
                  clipPath: "polygon(4px 0, 100% 0, calc(100% - 4px) 100%, 0 100%)",
                }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-primary-brand animate-pulse" />
                EDITORIAL & DISPATCH • {selectedGameInfo?.name || "ARENA"}
              </span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white uppercase drop-shadow-sm">
              CIRCUIT NEWS & ANNOUNCEMENTS
            </h1>
            <p className="font-sans text-xs sm:text-sm text-slate-400 mt-1 max-w-xl leading-relaxed">
              Official tournament recaps, regional qualifiers, meta breakdowns, and collegiate varsity spotlights.
            </p>
          </div>

          {/* Integrated Search & Switcher Controls */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="w-full sm:w-64">
              <input
                type="text"
                placeholder={`Search ${selectedGameInfo?.shortName || "game"} news...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-9 px-3.5 bg-[#0A0D18] border border-[#1E293B] text-white text-xs font-sans placeholder-slate-500 focus:outline-none focus:border-primary-brand"
                style={{
                  clipPath: "polygon(4px 0, 100% 0, calc(100% - 4px) 100%, 0 100%)",
                }}
              />
            </div>

            <button
              onClick={openGameSelector}
              className="h-9 px-3.5 tactical-btn-secondary text-[10px] font-mono font-bold tracking-wider uppercase text-slate-300 hover:text-white shrink-0 cursor-pointer flex items-center gap-1.5"
              style={{
                clipPath: "polygon(4px 0, 100% 0, calc(100% - 4px) 100%, 0 100%)",
              }}
            >
              <span>{selectedGameInfo?.shortName || "GAME"}</span>
              <span className="text-primary-brand">▾</span>
            </button>
          </div>
        </div>

        {/* Compact Topic Segmented Filter Pill Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider mr-1.5 shrink-0">TOPIC:</span>
          {categories.map((cat) => {
            const isSelected = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3 py-1.5 font-mono text-[10px] font-black uppercase tracking-wider transition-all duration-150 cursor-pointer whitespace-nowrap ${
                  isSelected
                    ? "game-theme-btn"
                    : "bg-[#0A0D18] text-slate-400 border border-[#1E293B] hover:text-white hover:bg-[#141A29]"
                }`}
                style={{
                  clipPath: "polygon(4px 0, 100% 0, calc(100% - 4px) 100%, 0 100%)",
                }}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Featured Hero Article Spotlight */}
        {featuredArticle && activeCategory === "ALL" && !searchQuery && (
          <div 
            className="group relative overflow-hidden bg-[#0A0D18] border border-[#1E293B] shadow-2xl transition-all duration-300 hover:border-primary-brand/50"
            style={{
              clipPath: "polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px))",
            }}
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[360px]">
              
              {/* Featured Image Side */}
              <div className="lg:col-span-7 relative overflow-hidden h-64 lg:h-auto">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={featuredArticle.image}
                  alt={featuredArticle.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-[#0A0D18] via-black/40 to-transparent" />
                
                <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
                  <span
                    className="font-mono text-[9px] font-black tracking-widest uppercase px-3 py-0.5 shadow-md"
                    style={{
                      backgroundColor: "var(--primary-brand)",
                      color: "var(--game-btn-text, #FFFFFF)",
                      clipPath: "polygon(4px 0, 100% 0, calc(100% - 4px) 100%, 0 100%)",
                    }}
                  >
                    FEATURED STORY
                  </span>
                  <span className="font-mono text-[10px] font-bold text-slate-200 flex items-center gap-1.5 bg-black/70 backdrop-blur-md px-2.5 py-0.5 border border-white/10"
                    style={{
                      clipPath: "polygon(4px 0, 100% 0, calc(100% - 4px) 100%, 0 100%)",
                    }}
                  >
                    <ClockIcon className="w-3.5 h-3.5 text-primary-brand" />
                    {featuredArticle.readTime || "4 MIN READ"}
                  </span>
                </div>
              </div>

              {/* Featured Content Side */}
              <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between space-y-6 bg-gradient-to-b from-[#0D121F] to-[#080B14]">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span 
                      className="font-mono text-[9px] font-bold text-primary-brand uppercase tracking-wider bg-primary-brand/10 px-2 py-0.5 border border-primary-brand/30"
                      style={{
                        clipPath: "polygon(3px 0, 100% 0, calc(100% - 3px) 100%, 0 100%)",
                      }}
                    >
                      {featuredArticle.category}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                      <CalendarIcon className="w-3 h-3 text-slate-400" />
                      {featuredArticle.date}
                    </span>
                  </div>

                  <h2 className="font-display text-lg sm:text-xl font-black uppercase text-white leading-snug group-hover:text-primary-brand transition-colors">
                    {featuredArticle.title}
                  </h2>

                  <p className="font-sans text-xs text-slate-300 leading-relaxed line-clamp-3">
                    {featuredArticle.excerpt}
                  </p>
                </div>

                <div className="pt-4 border-t border-[#182338] flex items-center justify-between">
                  <span className="text-[10px] font-mono text-slate-400 font-bold">
                    BY {featuredArticle.author || "COLLEGIUM MEDIA"}
                  </span>
                  <Link
                    href={`/community`}
                    className="h-9 px-4 game-theme-btn font-display text-[10px] font-black uppercase tracking-wider flex items-center gap-2 shadow-md cursor-pointer"
                    style={{
                      clipPath: "polygon(4px 0, 100% 0, calc(100% - 4px) 100%, 0 100%)",
                    }}
                  >
                    <span>Read Article →</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* News Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-[#182338] pb-3">
            <h3 className="font-display text-sm sm:text-base font-black uppercase text-white tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary-brand animate-pulse" />
              <span>{activeCategory === "ALL" ? `${selectedGameInfo?.shortName || "CIRCUIT"} DISPATCHES & ARTICLES` : `${activeCategory} DISPATCHES`} ({filteredArticles.length})</span>
            </h3>
          </div>

          {filteredArticles.length === 0 ? (
            <div 
              className="p-10 bg-[#0A0D18] border border-[#1E293B] text-center space-y-2"
              style={{
                clipPath: "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))",
              }}
            >
              <p className="text-xs font-mono text-slate-400">NO {selectedGameInfo?.name?.toUpperCase() || "GAME"} DISPATCHES FOUND MATCHING TOPIC</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredArticles.map((article) => (
                <article
                  key={article.id}
                  className="group bg-[#0A0D18] border border-[#1E293B] hover:border-primary-brand/50 overflow-hidden transition-all duration-300 hover:-translate-y-1 shadow-xl flex flex-col justify-between"
                  style={{
                    clipPath: "polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 14px 100%, 0 calc(100% - 14px))",
                  }}
                >
                  <div className="relative h-44 overflow-hidden bg-[#060812]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={article.image}
                      alt={article.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0A0D18] via-transparent to-transparent" />
                    <span
                      className="absolute top-3 left-3 text-[9px] font-mono font-bold uppercase px-2 py-0.5 text-white shadow bg-primary-brand"
                      style={{
                        clipPath: "polygon(3px 0, 100% 0, calc(100% - 3px) 100%, 0 100%)",
                      }}
                    >
                      {article.category}
                    </span>
                  </div>

                  <div className="p-5 flex flex-col flex-1 justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-[9px] font-mono text-slate-400">
                        <span>{article.date}</span>
                        <span>·</span>
                        <span>{article.readTime}</span>
                      </div>
                      <h4 className="font-display text-sm font-black text-white group-hover:text-primary-brand transition-colors leading-snug uppercase">
                        {article.title}
                      </h4>
                      <p className="font-sans text-xs text-slate-400 line-clamp-2 leading-relaxed">
                        {article.excerpt}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-[#182338] flex items-center justify-between">
                      <span className="text-[9px] font-mono text-slate-500 font-bold uppercase">
                        {article.category}
                      </span>
                      <span className="font-mono text-xs font-bold text-primary-brand group-hover:translate-x-1 transition-transform flex items-center gap-1">
                        <span>READ DISPATCH →</span>
                      </span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        {/* Collegiate Community Discord Banner */}
        <div 
          className="p-6 sm:p-8 bg-[#0A0D18] border border-[#1E293B] flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl"
          style={{
            clipPath: "polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px))",
          }}
        >
          <div className="space-y-1 text-center md:text-left">
            <h3 className="font-display text-base sm:text-lg font-black uppercase text-white tracking-wide">
              COLLEGIATE BROADCAST & DISPATCH COMMUNITY
            </h3>
            <p className="font-sans text-xs text-slate-300 max-w-xl leading-relaxed">
              Join the official COLLEGIUM Discord to submit match highlights, request verified broadcast casters, and receive real-time tournament alerts for {selectedGameInfo?.name}.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <a
              href="https://discord.gg"
              target="_blank"
              rel="noreferrer"
              className="h-10 px-5 game-theme-btn font-display text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg cursor-pointer"
              style={{
                clipPath: "polygon(6px 0, 100% 0, calc(100% - 6px) 100%, 0 100%)",
              }}
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
