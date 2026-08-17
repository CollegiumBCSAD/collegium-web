"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useGame } from "@/context/GameContext";
import { GAME_LIST, GameId, getGameInfo } from "@/lib/games";

interface RecruitPost {
  id: string;
  type: "LFT" | "LFP";
  gameTitle: GameId;
  title: string;
  subtitle: string;
  universityName: string;
  roles: string[];
  rankTier: string;
  availability: string;
  bio: string;
  contactHandle: string;
  createdAt: string;
}

export default function RecruitPage() {
  const { user } = useAuth();
  const { selectedGame: globalGame, selectedGameInfo } = useGame();
  const activeGame: GameId = globalGame || "valo";

  const [activeTab, setActiveTab] = useState<"LFT" | "LFP">("LFT");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [posts, setPosts] = useState<RecruitPost[]>([]);

  const [formType, setFormType] = useState<"LFT" | "LFP">("LFT");
  const [formGame, setFormGame] = useState<GameId>(activeGame);
  const [formTitle, setFormTitle] = useState("");
  const [formRoles, setFormRoles] = useState("");
  const [formRank, setFormRank] = useState("Ascendant");
  const [formAvailability, setFormAvailability] = useState("Weekdays 7 PM+");
  const [formBio, setFormBio] = useState("");
  const [formContact, setFormContact] = useState("");

  const filteredPosts = posts.filter((p) => {
    if (p.type !== activeTab) return false;
    const info = getGameInfo(p.gameTitle);
    return info.id === activeGame;
  });

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    const newPost: RecruitPost = {
      id: `post-${Date.now()}`,
      type: formType,
      gameTitle: formGame,
      title: formTitle.trim(),
      subtitle: formType === "LFT" ? `Main ${formRoles || "Flex"}` : `Need ${formRoles || "Athletes"}`,
      universityName: user?.university?.name || "University of Makati",
      roles: formRoles ? formRoles.split(",").map((r) => r.trim()) : ["Flex"],
      rankTier: formRank,
      availability: formAvailability,
      bio: formBio,
      contactHandle: formContact || "In-Game Tag",
      createdAt: new Date().toISOString(),
    };

    setPosts([newPost, ...posts]);
    setIsModalOpen(false);
    setFormTitle("");
    setFormBio("");
  };

  return (
    <div className="flex flex-col flex-1 game-theme-bg py-10 px-4 sm:px-6 lg:px-10">
      <div className="max-w-6xl mx-auto space-y-8 w-full">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-raised-panel pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-sans font-extrabold uppercase tracking-widest text-secondary-brand">
                Gankster-Style Recruitment Hub
              </span>
              {selectedGameInfo && (
                <span
                  className="text-[10px] font-sans font-bold tracking-widest uppercase px-2.5 py-0.5 rounded-full text-white"
                  style={{ backgroundColor: selectedGameInfo.accentColor, color: selectedGameInfo.id === "codm" ? "#0A0C10" : "#FFFFFF" }}
                >
                  {selectedGameInfo.shortName}
                </span>
              )}
            </div>
            <h1 className="font-display text-3xl font-bold uppercase tracking-wider text-foreground">
              Collegiate LFT / LFP Board
            </h1>
            <p className="font-sans text-xs text-secondary-text mt-1">
              Connect with free-agent collegiate athletes and active university squads looking to complete their rosters in {selectedGameInfo?.name || "Valorant"}
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="h-11 px-6 rounded-lg game-theme-btn font-sans text-xs font-bold uppercase tracking-wider transition-all active:scale-[0.98] flex items-center justify-center cursor-pointer shadow-lg"
          >
            📢 Post LFT / LFP Listing
          </button>
        </div>

        <div className="flex border border-raised-panel rounded-xl bg-card-bg p-1 max-w-md">
          <button
            onClick={() => setActiveTab("LFT")}
            className={`flex-1 px-6 py-2.5 rounded-lg font-sans text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === "LFT"
                ? "game-theme-btn shadow-md"
                : "text-secondary-text hover:text-foreground"
            }`}
          >
            🙋 Looking for Team (LFT)
          </button>
          <button
            onClick={() => setActiveTab("LFP")}
            className={`flex-1 px-6 py-2.5 rounded-lg font-sans text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === "LFP"
                ? "game-theme-btn shadow-md"
                : "text-secondary-text hover:text-foreground"
            }`}
          >
            🎯 Looking for Players (LFP)
          </button>
        </div>

        {filteredPosts.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-16 px-4 max-w-md mx-auto space-y-4 rounded-2xl border border-panel-border bg-card-bg/60 p-8 shadow-2xl backdrop-blur-md">
            <div className="w-16 h-16 rounded-full bg-raised-panel border border-panel-border flex items-center justify-center text-3xl shadow-inner">
              📢
            </div>
            <div className="space-y-1">
              <h3 className="font-display text-xl font-bold text-foreground uppercase tracking-wide">
                NO RECRUITMENT POSTINGS FOUND FOR {selectedGameInfo?.shortName || "THIS TITLE"}
              </h3>
              <p className="font-sans text-xs text-secondary-text leading-relaxed">
                There are currently no active {activeTab} listings for {selectedGameInfo?.name || "this game"}. Click &quot;Post LFT / LFP Listing&quot; to create a new recruitment post!
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredPosts.map((post) => {
              const game = getGameInfo(post.gameTitle);
              return (
                <div
                  key={post.id}
                  className="p-6 rounded-2xl bg-card-bg border border-raised-panel space-y-4 hover:border-primary-brand/50 transition-all shadow-xl"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-sans font-extrabold uppercase tracking-widest text-secondary-brand block">
                        {post.universityName}
                      </span>
                      <h3 className="font-display text-lg font-bold uppercase text-foreground">
                        {post.title}
                      </h3>
                      <p className="text-xs font-sans text-secondary-text mt-0.5">{post.subtitle}</p>
                    </div>
                    <span
                      className="text-[10px] font-sans font-bold uppercase px-2.5 py-1 rounded-full text-white"
                      style={{ backgroundColor: game.accentColor }}
                    >
                      {game.shortName}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {post.roles.map((r) => (
                      <span
                        key={r}
                        className="text-[10px] font-sans font-bold uppercase px-2.5 py-1 rounded bg-primary-brand/10 text-primary-brand border border-primary-brand/20"
                      >
                        {r}
                      </span>
                    ))}
                    <span className="text-[10px] font-sans font-bold uppercase px-2.5 py-1 rounded bg-raised-panel text-foreground">
                      {post.rankTier}
                    </span>
                  </div>

                  <p className="text-xs font-sans text-secondary-text leading-relaxed">
                    &quot;{post.bio}&quot;
                  </p>

                  <div className="pt-2 border-t border-raised-panel flex items-center justify-between text-xs font-sans">
                    <span className="text-secondary-text">Tag: {post.contactHandle}</span>
                    <span className="font-bold text-success">{post.availability}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="w-full max-w-md bg-card-bg border border-raised-panel rounded-2xl p-6 shadow-2xl space-y-5">
              <div className="flex items-center justify-between border-b border-raised-panel pb-3">
                <h3 className="font-display text-lg font-bold uppercase text-foreground">
                  Create Recruitment Listing
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-secondary-text hover:text-foreground text-sm"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreatePost} className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormType("LFT")}
                    className={`py-2 rounded-lg font-sans text-xs font-bold uppercase border ${
                      formType === "LFT"
                        ? "bg-primary-brand text-foreground border-primary-brand"
                        : "bg-background border-panel-border text-secondary-text"
                    }`}
                  >
                    Looking for Team (LFT)
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormType("LFP")}
                    className={`py-2 rounded-lg font-sans text-xs font-bold uppercase border ${
                      formType === "LFP"
                        ? "bg-primary-brand text-foreground border-primary-brand"
                        : "bg-background border-panel-border text-secondary-text"
                    }`}
                  >
                    Looking for Players (LFP)
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-sans font-semibold uppercase tracking-wider text-secondary-text mb-1">
                    Target Esports Title
                  </label>
                  <select
                    value={formGame}
                    onChange={(e) => setFormGame(e.target.value as GameId)}
                    className="w-full h-11 px-3 rounded-lg bg-background border border-panel-border text-foreground text-xs font-sans focus:outline-none"
                  >
                    {GAME_LIST.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-sans font-semibold uppercase tracking-wider text-secondary-text mb-1">
                    {formType === "LFT" ? "Athlete Name / Gamer Tag" : "Squad / Team Name"}
                  </label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder={formType === "LFT" ? "e.g. Christian Baldesco" : "e.g. UMAK Herons Alpha"}
                    className="w-full h-11 px-4 rounded-lg bg-background border border-panel-border text-foreground text-sm font-sans focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-sans font-semibold uppercase tracking-wider text-secondary-text mb-1">
                      Roles Needed / Offered
                    </label>
                    <input
                      type="text"
                      value={formRoles}
                      onChange={(e) => setFormRoles(e.target.value)}
                      placeholder="Duelist, Controller"
                      className="w-full h-11 px-3 rounded-lg bg-background border border-panel-border text-foreground text-xs font-sans focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-sans font-semibold uppercase tracking-wider text-secondary-text mb-1">
                      Rank Requirement
                    </label>
                    <input
                      type="text"
                      value={formRank}
                      onChange={(e) => setFormRank(e.target.value)}
                      placeholder="Ascendant+"
                      className="w-full h-11 px-3 rounded-lg bg-background border border-panel-border text-foreground text-xs font-sans focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-sans font-semibold uppercase tracking-wider text-secondary-text mb-1">
                      In-Game Tag / Contact
                    </label>
                    <input
                      type="text"
                      value={formContact}
                      onChange={(e) => setFormContact(e.target.value)}
                      placeholder="Riot ID / Discord Handle"
                      className="w-full h-11 px-3 rounded-lg bg-background border border-panel-border text-foreground text-xs font-sans focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-sans font-semibold uppercase tracking-wider text-secondary-text mb-1">
                      Availability
                    </label>
                    <input
                      type="text"
                      value={formAvailability}
                      onChange={(e) => setFormAvailability(e.target.value)}
                      placeholder="Weekdays 7 PM+"
                      className="w-full h-11 px-3 rounded-lg bg-background border border-panel-border text-foreground text-xs font-sans focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-sans font-semibold uppercase tracking-wider text-secondary-text mb-1">
                    Listing Description / Bio
                  </label>
                  <textarea
                    rows={2}
                    value={formBio}
                    onChange={(e) => setFormBio(e.target.value)}
                    placeholder="Highlight playstyle, tournament goals, or team requirements..."
                    className="w-full p-3 rounded-lg bg-background border border-panel-border text-foreground text-xs font-sans focus:outline-none"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="h-10 px-4 rounded-lg border border-raised-panel text-secondary-text hover:text-foreground text-xs font-bold uppercase"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="h-10 px-6 rounded-lg bg-gradient-to-r from-[#E53A4C] to-[#B91C1C] hover:from-[#EF4444] hover:to-[#991B1B] text-foreground text-xs font-bold uppercase transition-all active:scale-[0.98] shadow-md shadow-primary-brand/20 cursor-pointer"
                  >
                    Publish Listing
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
