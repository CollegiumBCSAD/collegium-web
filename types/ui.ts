import type { GameId } from "./games";

export interface SegmentedOption<T extends string = string> {
  id: T;
  label: string;
  /** Optional count badge. */
  count?: number;
  /** Show a pulsing "live" dot before the label. */
  live?: boolean;
}

export interface SegmentedControlProps<T extends string = string> {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (id: T) => void;
  ariaLabel: string;
  className?: string;
}

export interface ToggleSwitchProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export interface HeaderGameSwitcherProps {
  variant?: "bar" | "menu";
  onInteract?: () => void;
}

/** Chrome/Edge's non-standard `beforeinstallprompt` event, not in lib.dom. */
export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

export interface BrandEmblemProps {
  /** Rendered width and height in pixels. */
  size?: number;
  className?: string;
}

export interface OctagonAvatarProps {
  label: string;
  /** Captain gets the gold ring. */
  highlight?: boolean;
  className?: string;
}

export interface LineupSlotProps {
  slot: number;
  gameHandle: string;
  displayName: string;
  role: string;
  isCaptain: boolean;
}

export interface LineupGridProps {
  members: Array<{ id: string; userId: string; gameHandle: string; displayName: string; preferredRole?: string | null }>;
  captainId?: string | null;
  gameTitle: GameId;
  /** Shows clickable "open slot" cards when provided. */
  onRecruit?: () => void;
}
