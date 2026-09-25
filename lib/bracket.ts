import { BracketMatch, BracketTreeRound } from "@/types";

const nextPow2 = (n: number) => 2 ** Math.ceil(Math.log2(Math.max(1, n)));

function roundLabel(positionFromEnd: number, index: number): string {
  if (positionFromEnd === 0) return "Grand Final";
  if (positionFromEnd === 1) return "Semifinals";
  if (positionFromEnd === 2) return "Quarterfinals";
  return `Round ${index + 1}`;
}

function placeholderMatch(id: string, top: string, bottom: string): BracketMatch {
  return {
    id,
    team1: { name: top, score: 0 },
    team2: { name: bottom, score: 0 },
    status: "UPCOMING",
  };
}

/** Global "M1, M2…" labels, numbered left to right, top to bottom. */
export function matchLabels(rounds: BracketTreeRound[]): string[][] {
  let n = 0;
  return rounds.map((round) => round.matches.map(() => `M${++n}`));
}

// A bracket generated only up to its current round (or seeded without the
// full skeleton) still gets its path to the final drawn, as placeholder
// "Winner of Mx" matches, so the tree reads as a tree.
export function projectToFinal(rounds: BracketTreeRound[]): BracketTreeRound[] {
  if (rounds.length === 0 || rounds.some((r) => r.name.toUpperCase() === "GROUP STAGE")) return rounds;
  const result = [...rounds];
  while (result[result.length - 1].matches.length > 1) {
    const prev = result[result.length - 1];
    const prevLabels = matchLabels(result)[result.length - 1];
    const count = Math.ceil(prev.matches.length / 2);
    result.push({
      name: "",
      isProjected: true,
      matches: Array.from({ length: count }, (_, k) =>
        placeholderMatch(
          `projected-${result.length}-${k}`,
          `Winner ${prevLabels[2 * k]}`,
          prevLabels[2 * k + 1] ? `Winner ${prevLabels[2 * k + 1]}` : "TBD"
        )
      ),
    });
  }
  return result.map((round, i) => ({ ...round, name: roundLabel(result.length - 1 - i, i) }));
}

/**
 * Slot count per round. Round 0 is padded to a power of two and each later
 * round halves it, so every match sits exactly between the two it's fed by.
 * Rounds that don't halve (e.g. losers brackets) just get one slot per match.
 */
export function slotCounts(rounds: BracketTreeRound[]): number[] {
  const base = nextPow2(rounds[0]?.matches.length ?? 1);
  return rounds.map((round, i) => Math.max(round.matches.length, Math.max(1, base / 2 ** i)));
}

export function isUnknownTeam(name: string): boolean {
  return !name || name === "TBD" || name === "BYE" || name.startsWith("Winner") || name.startsWith("Finalist");
}

// Schools are known by these short names, not by their initials.
const KNOWN_SHORT_NAMES: Record<string, string> = {
  "university of makati": "UMAK",
  "ateneo de manila university": "ADMU",
  "de la salle university": "DLSU",
  "university of santo tomas": "UST",
  "university of the philippines": "UP",
  "far eastern university": "FEU",
  "national university": "NU",
  "adamson university": "ADU",
  "mapúa university": "MAP",
  "mapua university": "MAP",
};

export function teamInitials(name: string): string {
  if (isUnknownTeam(name)) return "?";
  const known = KNOWN_SHORT_NAMES[name.trim().toLowerCase()];
  if (known) return known;
  return name
    .split(/\s+/)
    .filter((w) => /^[A-Za-z]/.test(w) && !["of", "the", "de", "la"].includes(w.toLowerCase()))
    .slice(0, 3)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}
