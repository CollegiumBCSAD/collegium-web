import {
  AthleteOnboardingProfile,
  GameId,
  OnboardingCohort,
  OnboardingProfile,
  OrganizerOnboardingProfile,
  OrganizerSetupRecord,
  RosterGameCheck,
  UserProfile,
  UserRole,
} from "@/types";
import { GAMES, GAME_ENUM_TO_ID, getGameInfo } from "@/lib/games";

// Accounts created before this instant are prototype accounts (see
// OnboardingCohort). Re-seeding the database gives the mock accounts fresh
// createdAt values, so bump NEXT_PUBLIC_ONBOARDING_ENFORCED_FROM after a
// reseed to keep them exempt.
const ENFORCED_FROM = Date.parse(
  process.env.NEXT_PUBLIC_ONBOARDING_ENFORCED_FROM || "2026-10-01T00:00:00+08:00"
);

export const ONBOARDING_ROUTES: Record<UserRole, string> = {
  athlete: "/onboarding/athlete",
  organizer: "/onboarding/organizer",
};

export const ROLE_HOME_ROUTES: Record<UserRole, string> = {
  athlete: "/dashboard",
  organizer: "/organize",
};

// Pages the onboarding guard never redirects away from: the onboarding
// screens themselves and every step of signing in.
const GUARD_EXEMPT_PREFIXES = [
  "/onboarding",
  "/gateway",
  "/login",
  "/register",
  "/verify-email",
  "/auth",
];

export function isGuardExemptPath(pathname: string): boolean {
  return GUARD_EXEMPT_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

export function resolveUserRole(role: string | undefined): UserRole | null {
  if (role === "ORGANIZER") return "organizer";
  if (role === "ATHLETE" || role === "NON_ATHLETE") return "athlete";
  return null;
}

export function resolveCohort(createdAt: string | undefined): OnboardingCohort {
  const created = createdAt ? Date.parse(createdAt) : NaN;
  // An unreadable timestamp is treated as prototype so the flow never touches it.
  if (Number.isNaN(created) || Number.isNaN(ENFORCED_FROM)) return "prototype";
  return created < ENFORCED_FROM ? "prototype" : "enforced";
}

function toGameId(gameTitle: string | undefined): GameId | undefined {
  if (!gameTitle) return undefined;
  return GAME_ENUM_TO_ID[gameTitle] ?? getGameInfo(gameTitle).id;
}

export function deriveAthleteProfile(user: UserProfile): AthleteOnboardingProfile {
  const cohort = resolveCohort(user.createdAt);
  const memberships = user.teamMemberships ?? [];
  const accepted = memberships.find((m) => m.status === "ACCEPTED" && m.team);
  const anyRoster = accepted ?? memberships.find((m) => m.status === "PENDING" && m.team);

  // A roster is the strongest signal of the athlete's title, then the IGN they
  // saved during onboarding. Enforced accounts can only ever hold one IGN (the
  // handle editor is limited to the primary title), so "first" is unambiguous.
  const primaryGameId = toGameId(anyRoster?.team?.gameTitle) ?? toGameId(user.gameHandles?.[0]?.gameTitle);

  const isEnforced = cohort === "enforced";
  return {
    role: "athlete",
    cohort,
    primaryGameId,
    teamId: accepted?.team?.id,
    isOnboarded: !isEnforced || Boolean(primaryGameId),
    isGameLocked: isEnforced && Boolean(primaryGameId),
  };
}

export function deriveOrganizerProfile(
  user: UserProfile,
  setup: OrganizerSetupRecord | null
): OrganizerOnboardingProfile {
  const cohort = resolveCohort(user.createdAt);
  return {
    role: "organizer",
    cohort,
    isOnboarded: cohort === "prototype" || Boolean(setup),
    hostedGameIds: setup?.hostedGameIds ?? [],
    organizationName: setup?.organizationName || undefined,
  };
}

export function deriveOnboardingProfile(
  user: UserProfile | null,
  organizerSetup: OrganizerSetupRecord | null
): OnboardingProfile | null {
  if (!user) return null;
  const role = resolveUserRole(user.role);
  if (role === "athlete") return deriveAthleteProfile(user);
  if (role === "organizer") return deriveOrganizerProfile(user, organizerSetup);
  return null;
}

/** Where a user belongs right after authenticating: onboarding first, then their home. */
export function resolveHomeRoute(user: UserProfile | null, profile: OnboardingProfile | null): string {
  if (user?.role === "ADMIN") return "/admin";
  if (user?.role === "COACH") return "/coach";
  if (!profile) return "/";
  return profile.isOnboarded ? ROLE_HOME_ROUTES[profile.role] : ONBOARDING_ROUTES[profile.role];
}

/**
 * The route to send a user to straight after sign-in. Used by the auth pages,
 * which need an answer before the context has re-rendered with the new user.
 */
export function resolvePostAuthRoute(user: UserProfile | null): string {
  const setup = user ? parseOrganizerSetup(readOrganizerSetupRaw(user.id)) : null;
  return resolveHomeRoute(user, deriveOnboardingProfile(user, setup));
}

/**
 * Enforces the one-title rule for athletes: an enforced athlete may only
 * create or join rosters under their primary title. Prototype accounts and
 * organizers are always allowed.
 */
export function checkRosterGame(
  profile: OnboardingProfile | null,
  targetGameId: GameId,
  action: string
): RosterGameCheck {
  if (!profile || profile.role !== "athlete" || !profile.isGameLocked || !profile.primaryGameId) {
    return { allowed: true };
  }
  if (profile.primaryGameId === targetGameId) return { allowed: true };

  const locked = GAMES[profile.primaryGameId];
  return {
    allowed: false,
    lockedGameId: profile.primaryGameId,
    reason: `Your athlete account is locked to ${locked.name}. Athletes compete under one title, so you can't ${action} a ${GAMES[targetGameId].name} squad.`,
  };
}

// ── Organizer setup record (device-local) ─────────────────────────────────
// There is no server field for organizer setup, so it is kept per user in
// localStorage. Reads go through useSyncExternalStore (see OnboardingContext)
// so a refresh resolves it in the same render as the profile, with no flash.

const ORGANIZER_SETUP_EVENT = "collegium:organizer-setup";

function organizerSetupKey(userId: string): string {
  return `collegium_organizer_setup:${userId}`;
}

export function readOrganizerSetupRaw(userId: string | undefined): string | null {
  if (!userId) return null;
  try {
    return localStorage.getItem(organizerSetupKey(userId));
  } catch {
    return null;
  }
}

export function parseOrganizerSetup(raw: string | null): OrganizerSetupRecord | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<OrganizerSetupRecord>;
    if (!Array.isArray(parsed.hostedGameIds)) return null;
    return {
      hostedGameIds: parsed.hostedGameIds.filter((id): id is GameId => id in GAMES),
      organizationName: typeof parsed.organizationName === "string" ? parsed.organizationName : "",
      completedAt: typeof parsed.completedAt === "string" ? parsed.completedAt : "",
    };
  } catch {
    return null;
  }
}

export function writeOrganizerSetup(userId: string, record: OrganizerSetupRecord): void {
  try {
    localStorage.setItem(organizerSetupKey(userId), JSON.stringify(record));
  } catch {}
  window.dispatchEvent(new Event(ORGANIZER_SETUP_EVENT));
}

export function subscribeOrganizerSetup(onChange: () => void): () => void {
  window.addEventListener("storage", onChange);
  window.addEventListener(ORGANIZER_SETUP_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(ORGANIZER_SETUP_EVENT, onChange);
  };
}
