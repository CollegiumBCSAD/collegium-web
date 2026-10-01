import { EventGameTitle, EventStatus, EventTeamStatus } from "@/types";

// Visual vocabulary shared by the invite-only event pages so they read like the
// Tournaments / Universities pages (editorial hero, dot-grid cards, key art).

/** Rounded dot-grid card used by tournament and university cards. */
export const CARD =
  "rounded-2xl border border-white/[0.07] bg-[#090C14] bg-[radial-gradient(rgba(100,116,160,0.13)_1px,transparent_1px)] bg-[size:12px_12px] shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_18px_40px_-24px_rgba(0,0,0,0.9)]";

/** Small uppercase mono label above fields, stats and table columns. */
export const MONO_LABEL =
  "text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-slate-500";

/** Eyebrow line above a page title. */
export const EYEBROW =
  "flex items-center gap-3 text-[11px] font-mono font-bold uppercase tracking-[0.3em] text-slate-400";

/** Big editorial page title (first line solid, second line outlined). */
export const HERO_TITLE =
  "font-display font-black uppercase leading-[0.88] tracking-tight text-[2.75rem] sm:text-7xl";
export const HERO_OUTLINE = "block text-transparent [-webkit-text-stroke:1.5px_var(--primary-brand)]";

/** Section heading row. */
export const SECTION_TITLE = "font-display text-2xl font-black uppercase tracking-tight text-white";

/** Text input / select / textarea. */
export const FIELD =
  "w-full rounded-xl bg-[#0E121C] border border-white/10 px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-primary-brand/70 transition";

/** Small inline text action (mono, uppercase). */
export const TEXT_ACTION =
  "text-[11px] font-mono font-bold uppercase tracking-[0.2em] transition-colors";

export const EVENT_STATUS: Record<EventStatus, { label: string; className: string; pulse?: boolean }> = {
  DRAFT: { label: "Draft", className: "text-slate-400" },
  OPEN: { label: "Sign-ups open", className: "text-emerald-300", pulse: true },
  LOCKED: { label: "Sign-ups locked", className: "text-amber-300" },
  ONGOING: { label: "In progress", className: "text-primary-brand", pulse: true },
  COMPLETED: { label: "Completed", className: "text-sky-300" },
};

export const TEAM_STATUS: Record<
  EventTeamStatus,
  { label: string; text: string; chip: string; bar: string }
> = {
  PENDING: {
    label: "Pending review",
    text: "text-amber-300",
    chip: "text-amber-200 border-amber-400/30 bg-amber-500/10",
    bar: "bg-amber-400 shadow-[0_0_14px_rgba(251,191,36,0.6)]",
  },
  APPROVED: {
    label: "Approved",
    text: "text-emerald-300",
    chip: "text-emerald-200 border-emerald-400/30 bg-emerald-500/10",
    bar: "bg-emerald-400 shadow-[0_0_14px_rgba(52,211,153,0.6)]",
  },
  REJECTED: {
    label: "Sent back",
    text: "text-rose-300",
    chip: "text-rose-200 border-rose-400/30 bg-rose-500/10",
    bar: "bg-rose-400 shadow-[0_0_14px_rgba(251,113,133,0.6)]",
  },
};

const COVERS: Record<EventGameTitle, string> = {
  VALORANT: "/valorant-art-1.png",
  LOL: "/lol-art-1.png",
  MLBB: "/ml-art-1.jpg",
  CODM: "/codm-art-1.png",
};

/** Key art for an event's game, same pieces the tournament cards fall back to. */
export const eventCover = (game?: string) =>
  COVERS[(game ?? "") as EventGameTitle] ?? COVERS.VALORANT;

export const GAME_LABEL: Record<string, string> = {
  MLBB: "Mobile Legends",
  CODM: "Call of Duty: Mobile",
  VALORANT: "VALORANT",
  LOL: "League of Legends",
};
