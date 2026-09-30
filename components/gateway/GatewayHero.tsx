import React from "react";
import { GatewayHeroProps } from "@/types";
import { ZapIcon } from "@/components/ui/Icons";

/** Heading block shared by the gateway page and the gateway modal. */
export default function GatewayHero({ titleId }: GatewayHeroProps) {
  return (
    <div className="text-center space-y-3">
      <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#232D44] bg-[#0D121F]/90 text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-amber-400">
        <ZapIcon className="w-3.5 h-3.5" />
        Welcome to Collegium PH
      </span>
      <h1
        id={titleId}
        className="font-display text-3xl sm:text-5xl font-black uppercase tracking-tight text-white leading-none"
      >
        How will you use{" "}
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-500 to-primary-brand">
          Collegium?
        </span>
      </h1>
      <p className="max-w-lg mx-auto text-xs sm:text-sm font-sans text-slate-300 leading-relaxed">
        Join as a player, coach, or fan, or apply to host a tournament. All accounts use a verified .edu.ph
        email.
      </p>
    </div>
  );
}
