"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { GAME_LIST, GameId, GAMES } from "@/lib/games";

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
  const [activeTab, setActiveTab] = useState<"LFT" | "LFP">("LFT");
  const [selectedGame, setSelectedGame] = useState<GameId | "all">("all");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [posts, setPosts] = useState<RecruitPost[]>([
    {
      id: "post-1",
      type: "LFT",
      gameTitle: "valo",
      title: "Isiah Baldesco",
      subtitle: "Main Initiator / IGL",
      universityName: "University of Makati",
      roles: ["Initiator", "IGL"],
      rankTier: "Ascendant 3",
      availability: "Weekdays 6 PM - 11 PM",
      bio: "Former varsity captain with tournament LAN experience. High comms and vocal caller.",
      contactHandle: "Heron#UMAK",
      createdAt: "2026-08-14T10:00:00.000Z",
    },
    {
      id: "post-2",
      type: "LFP",
      gameTitle: "valo",
      title: "UMAK Herons Alpha",
      subtitle: "Looking for Controller & Duelist",
      universityName: "University of Makati",
      roles: ["Controller", "Duelist"],
      rankTier: "Diamond+",
      availability: "Mon/Wed/Fri 7 PM Scrims",
      bio: "Forming active roster for collegiate league circuit. Dedicated coaching & vod reviews.",
      contactHandle: "Captain#UMAK",
      createdAt: "2026-08-14T11:30:00.000Z",
    },
    {
      id: "post-3",
      type: "LFT",
      gameTitle: "ml",
      title: "Lance Alvares",
      subtitle: "Gold Lane Specialist",
      universityName: "University of Santo Tomas",
      roles: ["Gold Lane", "Jungler"],
      rankTier: "Mythic Glory 75★",
      availability: "Flexible Daily",
      bio: "Top regional hero power. Looking for serious squad pushing for collegiate championships.",
      contactHandle: "Lance#UST",
      createdAt: "2026-08-14T12:15:00.000Z",
    },
  ]);

  const [formType, setFormType] = useState<"LFT" | "LFP">("LFT");
  const [formGame, setFormGame] = useState<GameId>("valo");
  const [formTitle, setFormTitle] = useState("");
  const [formRoles, setFormRoles] = useState("");
  const [formRank, setFormRank] = useState("Ascendant");
  const [formAvailability, setFormAvailability] = useState("Weekdays 7 PM+");
  const [formBio, setFormBio] = useState("");
  const [formContact, setFormContact] = useState("");

  const filteredPosts = posts.filter(
    (p) => p.type === activeTab && (selectedGame === "all" || p.gameTitle === selectedGame)
  );

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
    <div className="flex flex-col flex-1 bg-gradient-to-b md:bg-gradient-to-r from-[#CC0000]/20 from-0% to-[#0A0C10] to-[50%] md:to-[40%] py-10 px-4 sm:px-6 lg:px-10">
      <div className="max-w-6xl mx-auto space-y-8 w-full">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-raised-panel pb-6">
          <div>
            <span className="text-xs font-sans font-extrabold uppercase tracking-widest text-secondary-brand block mb-1">
              Gankster-Style Recruitment Hub
            </span>
            <h1 className="font-display text-3xl font-bold uppercase tracking-wider text-foreground">
              Collegiate LFT / LFP Board
            </h1>
            <p className="font-sans text-xs text-secondary-text mt-1">
              Connect with free-agent collegiate athletes and active university squads looking to complete their rosters
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="h-11 px-6 rounded-lg bg-gradient-to-r from-[#E53A4C] to-[#B91C1C] hover:from-[#EF4444] hover:to-[#991B1B] text-foreground font-sans text-xs font-bold uppercase tracking-wider transition-all active:scale-[0.98] flex items-center justify-center cursor-pointer shadow-lg shadow-primary-brand/20"
          >
            📢 Post LFT / LFP Listing
          </button>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex border border-raised-panel rounded-xl bg-card-bg p-1 w-full sm:w-auto">
            <button
              onClick={() => setActiveTab("LFT")}
              className={`flex-1 sm:flex-initial px-6 py-2 rounded-lg font-sans text-xs font-bold uppercase tracking-wider transition-all ${
                activeTab === "LFT"
                  ? "bg-gradient-to-r from-[#E53A4C] to-[#B91C1C] text-foreground shadow-md shadow-primary-brand/20"
                  : "text-secondary-text hover:text-foreground"
              }`}
            >
              🙋 Looking for Team (LFT)
            </button>
            <button
              onClick={() => setActiveTab("LFP")}
              className={`flex-1 sm:flex-initial px-6 py-2 rounded-lg font-sans text-xs font-bold uppercase tracking-wider transition-all ${
                activeTab === "LFP"
                  ? "bg-gradient-to-r from-[#E53A4C] to-[#B91C1C] text-foreground shadow-md shadow-primary-brand/20"
                  : "text-secondary-text hover:text-foreground"
              }`}
            >
              🎯 Looking for Players (LFP)
            </button>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
            <button
              onClick={() => setSelectedGame("all")}
              className={`px-3 py-1.5 rounded-lg font-sans text-xs font-bold uppercase tracking-wider ${
                selectedGame === "all"
                  ? "bg-raised-panel text-foreground"
                  : "text-secondary-text hover:text-foreground"
              }`}
            >
              All
            </button>
            {GAME_LIST.map((g) => (
              <button
                key={g.id}
                onClick={() => setSelectedGame(g.id)}
                className={`px-3 py-1.5 rounded-lg font-sans text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                  selectedGame === g.id
                    ? `${g.borderColor} border bg-card-bg text-foreground`
                    : "text-secondary-text hover:text-foreground"
                }`}
              >
                <img src={g.image} alt={g.name} className="w-3.5 h-3.5 rounded object-cover" />
                <span>{g.shortName}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredPosts.map((post) => {
            const game = GAMES[post.gameTitle];
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
                  "{post.bio}"
                </p>

                <div className="pt-2 border-t border-raised-panel flex items-center justify-between text-xs font-sans">
                  <span className="text-secondary-text">Tag: {post.contactHandle}</span>
                  <span className="font-bold text-success">{post.availability}</span>
                </div>
              </div>
            );
          })}
        </div>

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

                <div>
                  <label className="block text-xs font-sans font-semibold uppercase tracking-wider text-secondary-text mb-1">
                    In-Game Tag / Contact
                  </label>
                  <input
                    type="text"
                    value={formContact}
                    onChange={(e) => setFormContact(e.target.value)}
                    placeholder="Riot ID / Discord Handle"
                    className="w-full h-11 px-4 rounded-lg bg-background border border-panel-border text-foreground text-sm font-sans focus:outline-none"
                  />
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
