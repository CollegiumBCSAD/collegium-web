import { OctagonAvatarProps } from "@/types";

const OCTAGON = "polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)";

// Initial-letter avatar in the app's faceted octagon. A 1px ring is drawn by
// layering two clipped shapes, since borders don't follow clip-path.
export default function OctagonAvatar({ label, highlight = false, className = "w-10 h-10" }: OctagonAvatarProps) {
  return (
    <div
      className={`relative shrink-0 p-px ${highlight ? "bg-amber-400/70" : "bg-white/15"} ${className}`}
      style={{ clipPath: OCTAGON }}
    >
      <div
        className="w-full h-full flex items-center justify-center bg-gradient-to-b from-[#1A2236] to-[#0B0F1A] font-display text-sm font-black uppercase text-white"
        style={{ clipPath: OCTAGON }}
      >
        {label.charAt(0) || "?"}
      </div>
    </div>
  );
}
