"use client";

import React from "react";
import Link from "next/link";
import { GameId } from "@/types";
import { getGameInfo } from "@/lib/games";
import { ShieldIcon } from "@/components/ui/Icons";

interface NoSquadModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameTitle: GameId;
}

export default function NoSquadModal({
  isOpen,
  onClose,
  gameTitle,
}: NoSquadModalProps) {
  if (!isOpen) return null;

  const game = getGameInfo(gameTitle);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in zoom-in-95 duration-200">
      <div className="w-full max-w-md bg-[#11141C] border border-[#F59E0B]/50 rounded-3xl p-6 shadow-2xl space-y-5 text-center relative overflow-hidden">
        
        {/* Warning Icon */}
        <div className="w-16 h-16 rounded-full bg-[#F59E0B]/20 border border-[#F59E0B]/40 flex items-center justify-center text-3xl mx-auto animate-bounce">
          <ShieldIcon className="w-8 h-8 text-[#F59E0B]" />
        </div>

        {/* Modal Header & Message */}
        <div className="space-y-2">
          <span className="text-[10px] font-sans font-extrabold uppercase tracking-widest text-[#FBBF24] block">
            SQUAD REGISTRATION REQUIRED
          </span>
          <h3 className="font-display text-xl font-extrabold uppercase text-[#F8FAFC]">
            You Don&apos;t Have a Squad!
          </h3>
          <p className="font-sans text-xs text-[#94A3B8] leading-relaxed px-2">
            You don&apos;t have an active team registered for{" "}
            <span className="font-bold text-[#F8FAFC]">{game.name}</span>. You must register or join an official varsity squad first before requesting practice scrim matches.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5 pt-2">
          <Link
            href="/team/create"
            onClick={onClose}
            className="w-full h-11 rounded-xl bg-gradient-to-r from-[#F59E0B] to-[#D97706] hover:from-[#FBBF24] hover:to-[#F59E0B] text-white font-sans text-xs font-bold uppercase tracking-wider transition-all active:scale-[0.98] cursor-pointer shadow-lg shadow-amber-950/40 flex items-center justify-center gap-2"
          >
            <span><ShieldIcon className="w-4 h-4" /></span>
            <span>Register / Create Squad First</span>
          </Link>

          <button
            onClick={onClose}
            className="w-full h-10 rounded-xl bg-[#1E2433] hover:bg-[#2A3142] text-[#94A3B8] hover:text-[#F8FAFC] font-sans text-xs font-bold uppercase tracking-wider transition-all cursor-pointer border border-[#2B3245]"
          >
            Cancel
          </button>
        </div>

      </div>
    </div>
  );
}
