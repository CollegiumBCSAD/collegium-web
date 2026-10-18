import Link from "next/link";
import Image from "next/image";
import { HomeNewsHubProps, NEWS_CATEGORY_LABELS } from "@/types";
import HomePanel from "./HomePanel";

const LIST_SIZE = 8;

export default function HomeNewsHub({ articles, activeGame }: HomeNewsHubProps) {
  const list = articles.filter((a) => a.gameId === activeGame || a.gameId === "general");
  const featured = list.find((a) => a.isFeatured) ?? list[0];
  const rest = list.filter((a) => a.id !== featured?.id).slice(0, LIST_SIZE);

  return (
    <HomePanel title="Circuit News" href="/community" hrefLabel="All news">
      {!featured ? (
        <p className="px-4 py-10 text-center font-mono text-[11px] uppercase tracking-wider text-slate-500">No dispatches yet</p>
      ) : (
        <>
          <Link href={`/community/${featured.id}`} className="group relative block h-44 overflow-hidden border-b border-white/[0.06]">
            {featured.image && (
              <Image
                src={featured.image}
                alt=""
                fill
                sizes="320px"
                className="object-cover opacity-50 transition-transform duration-500 group-hover:scale-105"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#070A12] via-[#070A12]/60 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-3.5">
              <span className="font-mono text-[9px] font-black uppercase tracking-wider text-primary-brand">
                {NEWS_CATEGORY_LABELS[featured.category]}
              </span>
              <h3 className="mt-1 line-clamp-3 font-display text-[15px] font-black uppercase leading-tight text-white group-hover:text-primary-brand">
                {featured.title}
              </h3>
            </div>
          </Link>
          <ul className="divide-y divide-white/[0.04]">
            {rest.map((a) => (
              <li key={a.id}>
                <Link href={`/community/${a.id}`} className="group block px-3.5 py-2.5 transition-colors hover:bg-white/[0.025]">
                  <h4 className="line-clamp-2 font-sans text-[13px] font-semibold leading-snug text-slate-200 group-hover:text-white">
                    {a.title}
                  </h4>
                  <p className="mt-1 font-mono text-[9px] uppercase tracking-wider text-slate-500">
                    <span className="text-primary-brand/80">{NEWS_CATEGORY_LABELS[a.category]}</span> · {a.date}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </HomePanel>
  );
}
