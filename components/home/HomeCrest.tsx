import { HomeCrestProps } from "@/types";
import { getUniversityBranding, mutedBranding } from "@/lib/universityBranding";

const SIZE = {
  sm: "h-6 w-6 text-[8px]",
  md: "h-8 w-8 text-[9px]",
  lg: "h-16 w-16 text-base",
};

/**
 * A school's monogram in its colors. Without a known domain the name seeds the
 * generated palette, so every school still gets a distinct, stable crest.
 */
export default function HomeCrest({ name, domain, size = "md" }: HomeCrestProps) {
  const brand = getUniversityBranding(name, domain || name.toLowerCase().replace(/[^a-z]/g, ""));
  const muted = mutedBranding(brand);

  return (
    <span
      aria-hidden
      className={`${SIZE[size]} flex shrink-0 items-center justify-center rounded-md border font-display font-black tracking-tight text-white`}
      style={{
        background: `linear-gradient(140deg, ${muted.primary} 0%, color-mix(in srgb, ${brand.primary} 30%, #0B101D) 100%)`,
        borderColor: `color-mix(in srgb, ${brand.secondary} 40%, transparent)`,
      }}
    >
      {brand.abbr.slice(0, 4)}
    </span>
  );
}
