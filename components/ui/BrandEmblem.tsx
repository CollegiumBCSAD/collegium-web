import { BrandEmblemProps } from "@/types";

// Collegium mark: a hexagonal "C" (the collegiate crest) with a forward
// chevron in its mouth (advancing through the bracket). Drawn in a single
// color, --primary-brand, so it re-tints with the selected game title.
export default function BrandEmblem({ size = 56, className = "" }: BrandEmblemProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      role="img"
      aria-label="Collegium"
      fill="var(--primary-brand)"
      className={`drop-shadow-[0_0_10px_rgba(var(--game-glow-rgb),0.45)] ${className}`}
    >
      <path d="M46.55 12.4 L32 4 L7.75 18 L7.75 46 L32 60 L46.55 51.6 L41.87 45.3 L32 51 L15.55 41.5 L15.55 22.5 L32 13 L41.87 18.7 Z" />
      <path d="M26 20.5 L33.5 20.5 L45 32 L33.5 43.5 L26 43.5 L37.5 32 Z" />
    </svg>
  );
}
