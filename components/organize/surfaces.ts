import { GameId } from "@/types";

// Shared depth treatments for the Organize workspace so every panel reads as
// a lit, raised surface instead of a flat box.

/** Raised panel: top-lit gradient, hairline top highlight, soft drop shadow. */
export const RAISED =
  "bg-gradient-to-b from-[#141A2A] to-[#0A0D16] border border-white/[0.07] shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_24px_48px_-24px_rgba(0,0,0,0.9)]";

/** Recessed well: darker than its parent, shadow pressed inward. */
export const RECESSED = "bg-black/35 shadow-[inset_0_2px_12px_rgba(0,0,0,0.6)]";

/**
 * Primary action in the selected game's accent. Everything on Organize keys
 * off --primary-brand so the page matches the game-tinted background instead
 * of fighting it with a second palette.
 */
export const BRAND_BTN =
  "bg-primary-brand text-[var(--game-btn-text,#fff)] shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_10px_26px_-8px_rgba(var(--game-glow-rgb),0.75)] hover:brightness-110 transition";

/** Soft accent glow for hover states. */
export const BRAND_GLOW_HOVER = "hover:shadow-[0_24px_50px_-22px_rgba(var(--game-glow-rgb),0.55)]";

/** Three key-art pieces per title for the header strip. */
export const GAME_ART: Record<GameId, string[]> = {
  valo: ["/valorant-art-1.png", "/valorant-art-2.png", "/valorant-art-3.jpg"],
  lol: ["/lol-art-1.png", "/lol-art-2.jpg", "/lol-art-3.png"],
  codm: ["/codm-art-1.png", "/codm-art-2.jpg", "/codm-art-3.jpg"],
  ml: ["/ml-art-1.jpg", "/ml-art-2.png", "/ml-art-3.jpg"],
};
