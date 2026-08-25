import { mockNewsfeedModerationItems } from "@/lib/mock/admin";
import NewsfeedModerationList from "@/components/admin/NewsfeedModerationList";

export default function AdminNewsfeedPage() {
  return (
    <div className="p-6 sm:p-8 lg:p-10 space-y-6 max-w-7xl">
      <div className="border-b border-[#1A1A1A] pb-5">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-[10px] font-mono font-bold tracking-widest text-emerald-400 uppercase px-3 py-0.5 bg-emerald-500/10 border border-emerald-500/30 rounded-full">
            EDITORIAL &amp; CONTENT
          </span>
        </div>
        <h1 className="font-display text-2xl sm:text-3xl font-black tracking-tight text-white uppercase">
          Newsfeed Content Moderation
        </h1>
        <p className="font-sans text-xs sm:text-sm text-neutral-400 mt-1 max-w-2xl leading-relaxed">
          Keep what collegiate athletes and guests see on the public Newsfeed accurate and verified.
        </p>
      </div>

      <div>
        <NewsfeedModerationList initialData={mockNewsfeedModerationItems} />
      </div>
    </div>
  );
}
