import { WarRoomChannelRowProps } from "@/types";
import { FlameIcon, TrophyIcon } from "@/components/ui/Icons";

/** One chat in the war room drawer: scrim lobby or tournament channel. */
export default function WarRoomChannelRow({ channel, onOpen }: WarRoomChannelRowProps) {
  const isTournament = channel.kind === "TOURNAMENT";
  const idleText = isTournament
    ? "Tournament channel — announcements and team chat"
    : channel.isLive
      ? "Lobby open — click to chat with opponent"
      : "Scheduled match lobby";

  return (
    <button
      type="button"
      onClick={onOpen}
      className="group relative flex w-full items-start gap-3 p-3.5 text-left transition-colors hover:bg-[#10172D]"
    >
      <div className="relative shrink-0">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl border bg-[#141A29] transition-colors ${
            isTournament ? "border-amber-500/30 group-hover:border-amber-400/60" : "border-[#232D44] group-hover:border-rose-500/50"
          }`}
        >
          {isTournament ? (
            <TrophyIcon className="h-5 w-5 text-amber-300 transition-transform group-hover:scale-110" />
          ) : (
            <FlameIcon className="h-5 w-5 text-rose-400 transition-transform group-hover:scale-110" />
          )}
        </div>
        {channel.isLive && (
          <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[#080B14] bg-emerald-500 shadow-sm" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="mb-0.5 flex items-center justify-between gap-1">
          <h4 className="truncate font-display text-xs font-black uppercase text-white transition-colors group-hover:text-rose-400">
            {channel.title}
          </h4>
          <span className="shrink-0 font-mono text-[10px] text-slate-400">
            {channel.lastMessageTime || (channel.isLive ? "Live" : isTournament ? "Upcoming" : "Scheduled")}
          </span>
        </div>

        <div className="mb-1.5 flex items-center gap-1.5">
          <span
            className={`rounded border px-1.5 font-mono text-[9px] font-bold uppercase ${
              isTournament ? "border-amber-500/30 bg-amber-500/10 text-amber-300" : "border-rose-500/30 bg-[#141A29] text-rose-300"
            }`}
          >
            {isTournament ? "Tournament" : "Scrim"}
          </span>
          <span className="rounded border border-white/10 px-1.5 font-mono text-[9px] font-bold uppercase text-slate-400">
            {channel.gameTitle}
          </span>
          <span className="truncate font-mono text-[9px] text-slate-400">{channel.myTeamName}</span>
        </div>

        <p className="flex items-center gap-1 truncate font-sans text-[11px] text-slate-400">
          {channel.lastMessage ? (
            <>
              {channel.lastSender && <span className="font-bold text-slate-300">{channel.lastSender}:</span>}
              <span className="truncate text-slate-300">{channel.lastMessage}</span>
            </>
          ) : (
            <span className="italic text-slate-500">{idleText}</span>
          )}
        </p>
      </div>
    </button>
  );
}
