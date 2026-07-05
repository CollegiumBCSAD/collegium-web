import { mockNewsArticles } from "@/lib/mock/news";
import Link from "next/link";

export default function CommunityPage() {
  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-16 lg:py-24">
      <div className="mb-12">
        <span className="font-sans text-xs font-bold tracking-widest text-primary-brand uppercase">
          LATEST NEWS
        </span>
        <h1 className="font-display text-4xl lg:text-5xl font-bold tracking-tight text-foreground mt-2">
          Stay ahead of the collegiate scene.
        </h1>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        {mockNewsArticles.map((article) => (
          <article
            key={article.id}
            className="flex flex-col justify-between rounded border border-raised-panel bg-card-bg p-6 transition-all hover:border-neutral-700"
          >
            <div>
              <div className="flex items-center justify-between gap-4 mb-4">
                <span className="font-sans text-2xs font-extrabold tracking-wider text-accent uppercase bg-accent/10 px-2 py-0.5 rounded">
                  {article.category}
                </span>
                <span className="font-sans text-2xs text-secondary-text">
                  {article.date}
                </span>
              </div>
              <h2 className="font-display text-xl font-bold tracking-wide text-foreground leading-snug">
                {article.title}
              </h2>
              <p className="mt-4 font-sans text-sm text-secondary-text leading-relaxed">
                {article.excerpt}
              </p>
            </div>
            <div className="mt-8 pt-4 border-t border-raised-panel/50">
              <Link
                href={`/community/article/${article.id}`}
                className="font-sans text-xs font-bold tracking-wide text-primary-brand hover:underline"
              >
                Read More &rarr;
              </Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
