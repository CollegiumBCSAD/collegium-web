import { UniversityBranding } from "@/types";

// Official school colors for the institutions we know, keyed by email domain
// slug. Anything else gets a stable generated color from its domain.
const SCHOOL_COLORS: Record<string, [primary: string, secondary: string]> = {
  umak: ["#1B3A8C", "#F2C230"],
  dlsu: ["#0A7A3F", "#E8E8E8"],
  admu: ["#0B3D91", "#E8E8E8"],
  ust: ["#E0A30F", "#1A1A1A"],
  up: ["#7B1113", "#0B6E35"],
  feu: ["#0A6B3A", "#F2C230"],
  nu: ["#2E3C8F", "#F7D117"],
  adamson: ["#0057B8", "#E8E8E8"],
  adu: ["#0057B8", "#E8E8E8"],
  mapua: ["#C8102E", "#F2C230"],
};

const NAME_STOPWORDS = new Set(["of", "the", "de", "la", "and"]);

function domainSlug(domain: string): string {
  return (domain.split(".")[0] ?? "").toLowerCase();
}

// Schools are known by their domain slug (UMAK, DLSU, ADMU, UST), which reads
// better than naive name initials. Long slugs fall back to name initials.
function abbreviate(name: string, slug: string): string {
  if (slug.length >= 2 && slug.length <= 5) return slug.toUpperCase();
  const initials = name
    .split(/\s+/)
    .filter((word) => /^[A-Za-z]/.test(word) && !NAME_STOPWORDS.has(word.toLowerCase()))
    .slice(0, 4)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
  return initials || "UNI";
}

function generatedColors(slug: string): [string, string] {
  let hash = 0;
  for (const char of slug) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  const hue = hash % 360;
  return [`hsl(${hue} 55% 38%)`, `hsl(${(hue + 40) % 360} 70% 60%)`];
}

export function getUniversityBranding(name: string, domain: string): UniversityBranding {
  const slug = domainSlug(domain);
  const [primary, secondary] = SCHOOL_COLORS[slug] ?? generatedColors(slug);
  return { abbr: abbreviate(name, slug), primary, secondary };
}
