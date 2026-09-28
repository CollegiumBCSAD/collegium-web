"use client";

import { useState } from "react";
import { newsService } from "@/services";
import { GAME_ID_TO_ENUM, GAME_LIST } from "@/lib/games";
import {
  GameId,
  NewsArticleEditorProps,
  NewsCategory,
  NEWS_CATEGORIES,
  NEWS_CATEGORY_LABELS,
} from "@/types";

const FIELD =
  "w-full px-4 rounded-xl bg-[#050505] border border-[#171717] text-white text-xs font-mono placeholder:text-neutral-600 focus:border-emerald-500/60 focus:outline-none";
const LABEL =
  "block text-xs font-mono font-bold uppercase tracking-wider text-neutral-300 mb-1.5";

export default function NewsArticleEditor({
  article,
  onSaved,
  onCancelEdit,
}: NewsArticleEditorProps) {
  // The caller remounts this form with a key when the edited article changes,
  // so the initial state below is all the reset that is needed.
  const [title, setTitle] = useState(article?.title ?? "");
  const [excerpt, setExcerpt] = useState(article?.excerpt ?? "");
  const [body, setBody] = useState(article?.body ?? "");
  const [category, setCategory] = useState<NewsCategory>(
    article?.category ?? "TOURNAMENT_CIRCUIT"
  );
  const [gameId, setGameId] = useState<GameId | "general">(
    article?.gameId ?? "general"
  );
  const [isFeatured, setIsFeatured] = useState(article?.isFeatured ?? false);
  const [image, setImage] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const isEditing = !!article;

  const save = async (publish: boolean) => {
    if (!title.trim() || !excerpt.trim() || !body.trim()) {
      setError("Title, excerpt and body are all required.");
      return;
    }

    setIsSubmitting(true);
    setError("");
    try {
      const form = new FormData();
      form.set("title", title.trim());
      form.set("excerpt", excerpt.trim());
      form.set("body", body);
      form.set("category", category);
      // An empty gameTitle means the article is general and shows under every
      // division.
      form.set("gameTitle", gameId === "general" ? "" : GAME_ID_TO_ENUM[gameId]);
      form.set("isFeatured", String(isFeatured));
      form.set("status", publish ? "PUBLISHED" : "DRAFT");
      if (image) form.set("image", image);

      if (article) {
        await newsService.updateArticle(article.id, form);
      } else {
        await newsService.createArticle(form);
      }
      onSaved?.();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save article.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={(e) => e.preventDefault()}
      className="rounded-2xl border border-[#1A1A1A] bg-[#0A0A0A] p-6 space-y-5 shadow-sm"
    >
      <div>
        <span className="text-[10px] font-mono font-bold text-emerald-400 block mb-1">
          {isEditing ? "// EDITING DISPATCH" : "// NEW DISPATCH"}
        </span>
        <h2 className="font-display text-base font-bold text-white uppercase tracking-wider">
          {isEditing ? "Edit Article" : "Write an Article"}
        </h2>
      </div>

      {error && (
        <p className="text-xs font-mono text-rose-300 bg-rose-500/10 border border-rose-500/30 rounded-xl px-4 py-2.5">
          {error}
        </p>
      )}

      <div>
        <label className={LABEL}>Headline</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Metro Manila qualifiers announced"
          className={`${FIELD} h-11`}
        />
      </div>

      <div>
        <label className={LABEL}>Excerpt</label>
        <textarea
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          rows={2}
          placeholder="One or two sentences shown on the article cards."
          className={`${FIELD} py-3 resize-y leading-relaxed`}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={LABEL}>Topic</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as NewsCategory)}
            className={`${FIELD} h-11 cursor-pointer`}
          >
            {NEWS_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {NEWS_CATEGORY_LABELS[c]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={LABEL}>Division</label>
          <select
            value={gameId}
            onChange={(e) => setGameId(e.target.value as GameId | "general")}
            className={`${FIELD} h-11 cursor-pointer`}
          >
            <option value="general">GENERAL (ALL DIVISIONS)</option>
            {GAME_LIST.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name.toUpperCase()}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className={LABEL}>Body — Markdown</label>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={14}
          placeholder={"## A heading\n\nA paragraph with **bold**, *italic* and a [link](https://example.com).\n\n- a bullet\n- another bullet\n\n> a pull quote"}
          className={`${FIELD} py-3 resize-y leading-relaxed`}
        />
        <p className="mt-1.5 text-[10px] font-mono text-neutral-500">
          Supported: # ## ### headings, - bullets, &gt; quotes, **bold**,
          *italic*, [text](url)
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
        <div>
          <label className={LABEL}>
            Hero image {isEditing && "— leave empty to keep current"}
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files?.[0] ?? null)}
            className="w-full text-xs font-mono text-neutral-400 file:mr-3 file:h-9 file:px-4 file:rounded-xl file:border-0 file:bg-[#141414] file:text-xs file:font-mono file:font-bold file:text-neutral-200 file:cursor-pointer hover:file:bg-[#1C1C1C]"
          />
        </div>
        <label className="flex items-center gap-2.5 cursor-pointer select-none pb-1">
          <input
            type="checkbox"
            checked={isFeatured}
            onChange={(e) => setIsFeatured(e.target.checked)}
            className="w-4 h-4 accent-emerald-400 cursor-pointer"
          />
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-300">
            Feature on the newsroom
          </span>
        </label>
      </div>

      <div className="flex flex-wrap gap-2.5 pt-1">
        <button
          type="button"
          onClick={() => save(false)}
          disabled={isSubmitting}
          className="h-11 px-5 rounded-xl bg-[#141414] border border-[#222222] text-xs font-mono font-bold text-neutral-200 uppercase hover:bg-[#1C1C1C] hover:text-white transition-colors cursor-pointer disabled:opacity-50"
        >
          {isSubmitting ? "Saving..." : "Save Draft"}
        </button>
        <button
          type="button"
          onClick={() => save(true)}
          disabled={isSubmitting}
          className="h-11 px-6 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 text-xs font-mono font-extrabold text-black uppercase transition-all cursor-pointer disabled:opacity-50 shadow-lg shadow-emerald-500/20 active:scale-95"
        >
          {isSubmitting ? "Publishing..." : isEditing ? "Save & Publish" : "Publish"}
        </button>
        {isEditing && (
          <button
            type="button"
            onClick={onCancelEdit}
            disabled={isSubmitting}
            className="h-11 px-5 rounded-xl bg-transparent border border-[#222222] text-xs font-mono font-bold text-neutral-400 uppercase hover:text-white transition-colors cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
