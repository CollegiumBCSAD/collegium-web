"use client";

import { useMemo } from "react";
import { resolveStreamEmbed } from "@/lib/streamEmbed";

interface TournamentStreamPlayerProps {
  streamUrl: string;
  streamIsLive?: boolean;
  className?: string;
}

export default function TournamentStreamPlayer({
  streamUrl,
  streamIsLive = false,
  className = "",
}: TournamentStreamPlayerProps) {
  const embed = useMemo(() => {
    const host =
      typeof window !== "undefined" ? window.location.hostname : "localhost";
    return resolveStreamEmbed(streamUrl, host);
  }, [streamUrl]);

  if (!streamIsLive) {
    return (
      <div
        className={`flex flex-col items-center justify-center gap-2 bg-[#05070E] border border-[#1E293B] aspect-video w-full ${className}`}
      >
        <p className="font-mono text-xs text-slate-400 uppercase tracking-widest">
          Stream offline
        </p>
        <a
          href={streamUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] font-mono text-rose-400 hover:text-rose-300 underline"
        >
          Open source page
        </a>
      </div>
    );
  }

  if (!embed.embedSrc) {
    return (
      <div
        className={`flex flex-col items-center justify-center gap-3 bg-[#05070E] border border-[#1E293B] aspect-video w-full p-6 text-center ${className}`}
      >
        <p className="font-mono text-xs text-slate-300 uppercase tracking-widest">
          Can&apos;t embed this link
        </p>
        <p className="font-sans text-xs text-slate-500 max-w-md">
          Use a YouTube, Twitch, or public Facebook Live URL. Open the broadcast
          externally instead.
        </p>
        <a
          href={streamUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="h-9 px-4 font-mono text-[10px] font-black uppercase tracking-wider text-white bg-rose-600 hover:bg-rose-500 inline-flex items-center"
        >
          Open stream
        </a>
      </div>
    );
  }

  return (
    <div
      className={`relative w-full h-full min-h-[240px] flex flex-col bg-black border border-rose-500/30 ${className}`}
    >
      <div className="absolute top-2 left-2 z-10 flex items-center gap-1.5 px-2 py-0.5 bg-rose-950/90 border border-rose-500/50">
        <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
        <span className="text-[9px] font-mono font-black uppercase tracking-widest text-rose-200">
          Live · {embed.platform}
        </span>
      </div>
      {/* Fixed 16:9 box at full modal width — avoids tiny iframe upscaled soft. */}
      <div className="relative w-full flex-1 min-h-0 bg-black flex items-center justify-center">
        <div className="w-full max-h-full aspect-video">
          <iframe
            title="Tournament live stream"
            src={embed.embedSrc}
            className="w-full h-full"
            style={{ border: 0 }}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
      </div>
      <div className="flex items-center justify-between px-3 py-2 bg-[#0A0D18] border-t border-[#1E293B] shrink-0">
        <span className="text-[10px] font-mono text-slate-500 truncate max-w-[70%]">
          {streamUrl}
        </span>
        <a
          href={streamUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] font-mono text-rose-400 hover:text-rose-300 uppercase tracking-wider shrink-0"
        >
          Open externally
        </a>
      </div>
    </div>
  );
}
