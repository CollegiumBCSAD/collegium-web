import { mockNewsArticles } from "@/lib/mock/news";
import Link from "next/link";

export default function CommunityPage() {
  return (
    <div className="flex flex-col flex-1 game-theme-bg">
      <div className="mx-auto w-full max-w-[1400px] px-4 sm:px-6 md:px-10 lg:px-16 py-8 sm:py-12 lg:py-16">
        <div className="border-t border-raised-panel/50 pt-8 mb-8 sm:mb-10">
          <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-foreground uppercase">
            LATEST NEWS
          </h1>
          <p className="font-sans text-xs sm:text-sm text-primary-brand mt-1 font-normal tracking-tight">
            Stay ahead of the collegiate scene.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {mockNewsArticles.map((article) => (
            <article
              key={article.id}
              className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-raised-panel bg-[#0E1119] p-5 sm:p-6 shadow-xl transition-all hover:border-raised-panel/80 min-h-[380px]"
            >
              <div>
                <div
                  className={`w-full h-44 rounded-lg overflow-hidden bg-gradient-to-b ${article.bgGradient} mb-5 relative`}
                >
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0E1119]/50" />
                </div>

                <h2 className="font-sans text-sm sm:text-base font-bold tracking-wide text-foreground uppercase leading-snug">
                  {article.title}
                </h2>

                <p className="mt-3 font-sans text-xs sm:text-sm text-secondary-text leading-relaxed">
                  {article.excerpt}
                </p>
              </div>

              <div className="mt-6 flex items-center justify-between pt-4 border-t border-[#1E2333]/60">
                <span className="font-sans text-xs font-semibold text-secondary-text">
                  {article.date}
                </span>
                <Link
                  href={`/community/article/${article.id}`}
                  className="font-sans text-xs font-semibold text-secondary-text underline hover:text-primary-brand transition-colors"
                >
                  Read More
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}

