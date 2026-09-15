import { ScannedPlayerRow } from "@/types";

export interface RosterSlot {
  index: number;
  ign: string;
}

export interface MatchAssignment {
  index: number;
  scanIndex: number;
  row: ScannedPlayerRow;
}

export interface MatchOutcome {
  assignments: MatchAssignment[];
  unmatched: ScannedPlayerRow[];
}

const MATCH_THRESHOLD = 0.6;

export function normalizeIgn(value: string): string {
  const folded = value.normalize("NFKC").toLowerCase();
  const withoutTag = folded.includes("|")
    ? folded.slice(folded.lastIndexOf("|") + 1)
    : folded;
  return withoutTag.replace(/[^a-z0-9]/g, "");
}

function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 0; i < a.length; i++) {
    const curr = [i + 1];
    for (let j = 0; j < b.length; j++) {
      const cost = a[i] === b[j] ? 0 : 1;
      curr[j + 1] = Math.min(curr[j] + 1, prev[j + 1] + 1, prev[j] + cost);
    }
    prev = curr;
  }
  return prev[b.length];
}

export function similarity(a: string, b: string): number {
  if (!a || !b) return 0;
  if (a === b) return 1;
  if (a.includes(b) || b.includes(a)) return 0.9;
  const distance = levenshtein(a, b);
  const longest = Math.max(a.length, b.length);
  return longest === 0 ? 0 : 1 - distance / longest;
}

export function matchRows(
  scanned: ScannedPlayerRow[],
  roster: RosterSlot[]
): MatchOutcome {
  const pairs: { scannedIdx: number; rosterIdx: number; score: number }[] = [];

  scanned.forEach((row, scannedIdx) => {
    const scannedKey = normalizeIgn(row.ign);
    roster.forEach((slot, rosterIdx) => {
      const score = similarity(scannedKey, normalizeIgn(slot.ign));
      if (score >= MATCH_THRESHOLD) {
        pairs.push({ scannedIdx, rosterIdx, score });
      }
    });
  });

  pairs.sort((a, b) => b.score - a.score);

  const usedScanned = new Set<number>();
  const usedRoster = new Set<number>();
  const assignments: MatchAssignment[] = [];

  for (const pair of pairs) {
    if (usedScanned.has(pair.scannedIdx) || usedRoster.has(pair.rosterIdx)) {
      continue;
    }
    usedScanned.add(pair.scannedIdx);
    usedRoster.add(pair.rosterIdx);
    assignments.push({
      index: roster[pair.rosterIdx].index,
      scanIndex: pair.scannedIdx,
      row: scanned[pair.scannedIdx],
    });
  }

  const unmatched = scanned.filter((_, idx) => !usedScanned.has(idx));
  return { assignments, unmatched };
}
