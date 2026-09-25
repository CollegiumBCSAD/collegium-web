import { OrganizeActionItem, OrganizeStage, Tournament } from "@/types";

// Lane order is by urgency: running brackets first, archives last.
export const ORGANIZE_STAGES: { id: OrganizeStage; label: string; hint: string }[] = [
  { id: "live", label: "Live", hint: "Bracket running, results pending" },
  { id: "registration", label: "Registration", hint: "Squads applying & rosters locking" },
  { id: "review", label: "In Review", hint: "Awaiting admin sanction" },
  { id: "completed", label: "Completed", hint: "Closed & rated" },
];

export function stageOf(tournament: Tournament): OrganizeStage {
  switch (tournament.status) {
    case "PENDING_APPROVAL":
    case "REJECTED":
      return "review";
    case "LIVE":
      return "live";
    case "COMPLETED":
      return "completed";
    default:
      return "registration";
  }
}

// Tournament.applications is typed loosely on the client; only the status is
// needed here, so read it defensively.
export function pendingApplicationCount(tournament: Tournament): number {
  return (tournament.applications ?? []).filter(
    (app) => typeof app === "object" && app !== null && (app as { status?: unknown }).status === "PENDING"
  ).length;
}

// Matches with both sides filled in but no verified result yet — what the
// organizer can actually report right now.
export function reportableMatchCount(tournament: Tournament): number {
  return (tournament.matches ?? []).filter((raw) => {
    const m = raw as { isVerified?: boolean; winnerId?: string | null; loserId?: string | null };
    return typeof m === "object" && m !== null && !m.isVerified && !!m.winnerId && !!m.loserId;
  }).length;
}

export function matchProgress(tournament: Tournament): { played: number; total: number } {
  const matches = (tournament.matches ?? []) as { isVerified?: boolean }[];
  return { played: matches.filter((m) => m?.isVerified).length, total: matches.length };
}

export function approvedTeamCount(tournament: Tournament): number {
  return tournament.universities?.length ?? 0;
}

export function tournamentCover(tournament: Tournament): string {
  if (tournament.image) return tournament.image;
  const g = (tournament.gameTitle || tournament.game || "").toUpperCase();
  if (g.includes("LOL") || g.includes("LEAGUE")) return "/lol-art-1.png";
  if (g.includes("MLBB") || g.includes("MOBILE LEGENDS")) return "/ml-art-1.jpg";
  if (g.includes("CODM") || g.includes("CALL OF DUTY")) return "/codm-art-1.png";
  return "/valorant-art-1.png";
}

export function formatStart(dateStr?: string): string | null {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

const plural = (n: number, word: string, many = `${word}s`) => `${n} ${n === 1 ? word : many}`;

// Turns the organizer's tournaments into a prioritized to-do list: fix
// rejections first, then unblock registration, then keep live brackets moving.
export function buildActionQueue(tournaments: Tournament[]): OrganizeActionItem[] {
  const items: OrganizeActionItem[] = [];

  for (const t of tournaments) {
    if (t.status === "REJECTED") {
      items.push({
        id: `${t.id}:edit`,
        kind: "edit",
        tone: "danger",
        title: "Revise & resubmit",
        detail: t.rejectionReason || "An admin asked for changes before sanctioning.",
        cta: "Edit",
        tournament: t,
      });
    }

    if (t.status === "UPCOMING") {
      const pending = pendingApplicationCount(t);
      if (pending > 0) {
        items.push({
          id: `${t.id}:applications`,
          kind: "applications",
          tone: "warn",
          title: `Review ${plural(pending, "squad application")}`,
          detail: `${plural(approvedTeamCount(t), "team")} approved so far`,
          cta: "Review",
          tournament: t,
        });
      } else if (approvedTeamCount(t) >= 2) {
        items.push({
          id: `${t.id}:start`,
          kind: "start",
          tone: "go",
          title: "Ready to go live",
          detail: `${plural(approvedTeamCount(t), "team")} locked in — seed the bracket when you're set.`,
          cta: "Start",
          tournament: t,
        });
      }
    }

    const reportable = t.status === "LIVE" ? reportableMatchCount(t) : 0;
    if (reportable > 0) {
      items.push({
        id: `${t.id}:bracket`,
        kind: "bracket",
        tone: "live",
        title: `${plural(reportable, "match", "matches")} to report`,
        detail: "Both sides are set — close them to advance the bracket.",
        cta: "Report results",
        tournament: t,
      });
    }
  }

  const priority = { danger: 0, warn: 1, live: 2, go: 3 } as const;
  return items.sort((a, b) => priority[a.tone] - priority[b.tone]);
}
