import { apiClient } from "./apiClient";
import { GAME_ENUM_TO_ID } from "@/lib/games";
import { readTimeFromBody } from "@/lib/markdown";
import { NewsArticle, NewsCategory, NewsStatus } from "@/types";

type RawNewsArticle = {
  id: string;
  title: string;
  excerpt: string;
  body: string;
  category: NewsCategory;
  gameTitle: string | null;
  status: NewsStatus;
  isFeatured: boolean;
  image: string | null;
  publishedAt: string | null;
  createdAt: string;
  author?: { id: string; displayName: string } | null;
};

function mapArticle(raw: RawNewsArticle): NewsArticle {
  const stamp = raw.publishedAt || raw.createdAt;
  return {
    id: raw.id,
    gameId: raw.gameTitle ? GAME_ENUM_TO_ID[raw.gameTitle] || "general" : "general",
    title: raw.title,
    excerpt: raw.excerpt,
    body: raw.body,
    category: raw.category,
    status: raw.status,
    date: new Date(stamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
    readTime: readTimeFromBody(raw.body),
    author: raw.author?.displayName,
    image: raw.image || undefined,
    isFeatured: raw.isFeatured,
  };
}

export const newsService = {
  getNews: async (gameTitle?: string, category?: string): Promise<NewsArticle[]> => {
    const params = new URLSearchParams();
    if (gameTitle) params.set("gameTitle", gameTitle);
    if (category) params.set("category", category);
    const query = params.toString();
    const articles = await apiClient.get<RawNewsArticle[]>(
      `/news${query ? `?${query}` : ""}`
    );
    return (articles || []).map(mapArticle);
  },

  getArticleById: async (id: string): Promise<NewsArticle> =>
    mapArticle(await apiClient.get<RawNewsArticle>(`/news/${id}`)),

  getAllForAdmin: async (): Promise<NewsArticle[]> => {
    const articles = await apiClient.get<RawNewsArticle[]>("/news/admin/all");
    return (articles || []).map(mapArticle);
  },

  createArticle: async (form: FormData): Promise<NewsArticle> =>
    mapArticle(await apiClient.postForm<RawNewsArticle>("/news", form)),

  updateArticle: async (id: string, form: FormData): Promise<NewsArticle> =>
    mapArticle(await apiClient.patchForm<RawNewsArticle>(`/news/${id}`, form)),

  deleteArticle: (id: string): Promise<void> =>
    apiClient.delete<void>(`/news/${id}`),
};
