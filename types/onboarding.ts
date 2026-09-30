import type { ReactNode } from "react";
import type { GameId } from "./games";

// ── Roles & onboarding state ──────────────────────────────────────────────

/**
 * The two entry paths offered by the gateway. Server roles map onto these:
 * ATHLETE and NON_ATHLETE are both "athlete" (a NON_ATHLETE is an athlete who
 * hasn't joined a roster yet), ORGANIZER is "organizer". ADMIN has neither and
 * is never routed through onboarding.
 */
export type UserRole = "athlete" | "organizer";

/**
 * Which onboarding rules an account falls under. Accounts created before
 * onboarding went live (the seeded mock/prototype accounts) are "prototype":
 * they are treated as already onboarded and are never validated or mutated
 * by the gateway flow. Everything created after is "enforced".
 */
export type OnboardingCohort = "prototype" | "enforced";

/**
 * Onboarding view of an athlete, derived from `/auth/me`. Named with an
 * "Onboarding" prefix because `AthleteProfile` is already the public athlete
 * profile card in `@/types/auth`.
 */
export interface AthleteOnboardingProfile {
  role: "athlete";
  cohort: OnboardingCohort;
  /** The single title this athlete registers under, once chosen. */
  primaryGameId?: GameId;
  /** Their accepted roster, if any. */
  teamId?: string;
  isOnboarded: boolean;
  /** True when roster actions must stay within `primaryGameId`. */
  isGameLocked: boolean;
}

export interface OrganizerOnboardingProfile {
  role: "organizer";
  cohort: OnboardingCohort;
  isOnboarded: boolean;
  /** Titles picked during setup. Informational only: organizers may host any title. */
  hostedGameIds: GameId[];
  organizationName?: string;
}

export type OnboardingProfile = AthleteOnboardingProfile | OrganizerOnboardingProfile;

/** What organizer setup saves on this device (there is no server field for it yet). */
export interface OrganizerSetupRecord {
  hostedGameIds: GameId[];
  organizationName: string;
  completedAt: string;
}

export interface OnboardingContextType {
  /** Null while logged out, while auth is loading, or for admins. */
  profile: OnboardingProfile | null;
  /** Where this user belongs right after authenticating. */
  homeRoute: string;
  completeOrganizerSetup: (record: Omit<OrganizerSetupRecord, "completedAt">) => void;
}

/** Result of checking whether an athlete may register under a given title. */
export type RosterGameCheck =
  | { allowed: true }
  | { allowed: false; lockedGameId: GameId; reason: string };

// ── Gateway modal ─────────────────────────────────────────────────────────

/** Which header button opened the gateway, so the athlete card can default to it. */
export type GatewayIntent = "signin" | "signup";

export interface GatewayContextType {
  isOpen: boolean;
  intent: GatewayIntent;
  openGateway: (intent?: GatewayIntent) => void;
  closeGateway: () => void;
}

export interface GatewayRoleCardsProps {
  intent: GatewayIntent;
  /** Called when a card action navigates away, so a modal host can close itself. */
  onNavigate?: () => void;
}

export interface GatewayFeatureListProps {
  items: string[];
  /** Text color class for the check icons. */
  tone: string;
}

export interface GatewayHeroProps {
  /** id for the heading, so a dialog can point aria-labelledby at it. */
  titleId: string;
}

export interface GatewayStat {
  label: string;
  value: number;
}

export interface GatewayModalProps {
  isOpen: boolean;
  intent: GatewayIntent;
  onClose: () => void;
}

// ── Onboarding screens ────────────────────────────────────────────────────

export interface OnboardingGameCardProps {
  gameId: GameId;
  isSelected: boolean;
  onSelect: (gameId: GameId) => void;
  /** Multi-select cards (organizer setup) show a checkbox instead of a radio. */
  multi?: boolean;
}

export interface GameLockNoticeProps {
  lockedGameId: GameId;
  /** Short description of the blocked action, e.g. "join this squad". */
  action: string;
}

export interface OnboardingShellProps {
  /** Small label in the header pill, e.g. "Athlete Onboarding". */
  stepLabel: string;
  /** Athletes use the game brand color, organizers amber. */
  accent: "brand" | "amber";
  children: ReactNode;
}

export interface OnboardingScreenGateProps {
  role: UserRole;
  children: ReactNode;
}
