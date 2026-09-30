"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { GameProvider, useGame } from "@/context/GameContext";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { NotificationProvider } from "@/context/NotificationContext";
import { WarRoomProvider, useWarRoom } from "@/context/WarRoomContext";
import NotificationBell from "@/components/NotificationBell";
import FloatingNotificationToast from "@/components/FloatingNotificationToast";
import ChatQuickAccess from "@/components/ChatQuickAccess";
import ScrimWarRoomModal from "@/components/scrims/ScrimWarRoomModal";
import TournamentBracketModal from "@/components/tournaments/TournamentBracketModal";
import GameSelectorModal from "@/components/GameSelectorModal";
import HeaderGameSwitcher from "@/components/HeaderGameSwitcher";
import OrganizeNavButton from "@/components/OrganizeNavButton";
import { HomeIcon, PlusIcon, UsersIcon, SwordsIcon, ShieldIcon } from "@/components/ui/Icons";
import { fetchTeamsApi } from "@/lib/teams";

function HeaderAuthControls({ mobile = false }: { mobile?: boolean }) {
  const { user, isLoggedIn, logoutUser, isLoaded } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [hasSquad, setHasSquad] = useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  React.useEffect(() => {
    if (!user) return;
    let isMounted = true;
    fetchTeamsApi().then((teams) => {
      if (!isMounted) return;
      const myId = user.id;
      const myEmail = user.email ? user.email.toLowerCase().trim() : "";
      const myName = user.displayName ? user.displayName.toLowerCase().trim() : "";

      const found = teams.some(
        (t) =>
          (myId && t.captainId === myId) ||
          (myName && t.captainName && t.captainName.toLowerCase().trim() === myName) ||
          t.members?.some(
            (m) =>
              m.status === "ACCEPTED" &&
              ((myId && m.userId === myId) ||
                (myEmail && m.email && m.email.toLowerCase().trim() === myEmail) ||
                (myName && m.displayName && m.displayName.toLowerCase().trim() === myName))
          )
      );
      setHasSquad(found);
    }).catch(() => {
      if (isMounted) setHasSquad(false);
    });

    return () => {
      isMounted = false;
    };
  }, [user]);

  if (!isLoaded) {
    return (
      <div
        className={`h-9 rounded-xl bg-[#141A29] border border-[#232D44] animate-pulse ${
          mobile ? "w-full" : "w-28"
        }`}
      />
    );
  }

  if (isLoggedIn && user) {
    if (mobile) {
      return (
        <div className="flex flex-col gap-1">
          <div className="px-4 py-2 mb-1">
            <span className="text-xs font-display font-black text-white uppercase block">
              {user.displayName}
            </span>
            <span className="text-[10px] font-mono text-slate-400 block mt-0.5 truncate">
              {user.email}
            </span>
          </div>
          <Link
            href="/dashboard"
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-mono font-bold uppercase tracking-wider text-slate-300 hover:text-white hover:bg-[#141A29] rounded-lg transition-all"
          >
            <HomeIcon className="w-3.5 h-3.5 text-primary-brand" />
            <span>My Dashboard</span>
          </Link>
          {user.role !== "ADMIN" && user.role !== "ORGANIZER" && !hasSquad && (
            <>
              <Link
                href="/team/create"
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-mono font-bold uppercase tracking-wider text-slate-300 hover:text-white hover:bg-[#141A29] rounded-lg transition-all"
              >
                <PlusIcon className="w-3.5 h-3.5 text-primary-brand" />
                <span>Create Squad</span>
              </Link>
              <Link
                href="/team/join"
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-mono font-bold uppercase tracking-wider text-slate-300 hover:text-white hover:bg-[#141A29] rounded-lg transition-all"
              >
                <UsersIcon className="w-3.5 h-3.5 text-primary-brand" />
                <span>Join Squad</span>
              </Link>
            </>
          )}
          {user.role !== "ORGANIZER" && (
            <Link
              href="/scrims"
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-mono font-bold uppercase tracking-wider text-slate-300 hover:text-white hover:bg-[#141A29] rounded-lg transition-all"
            >
              <SwordsIcon className="w-3.5 h-3.5 text-primary-brand" />
              <span>Scrims Board</span>
            </Link>
          )}
          {user.role === "ORGANIZER" && (
            <Link
              href="/organize"
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-mono font-bold uppercase tracking-wider text-amber-400 hover:text-white hover:bg-[#141A29] rounded-lg transition-all"
            >
              <ShieldIcon className="w-3.5 h-3.5 text-amber-400" />
              <span>Manage Tournaments</span>
            </Link>
          )}
          {user.role === "ADMIN" && (
            <Link
              href="/admin"
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-mono font-bold uppercase tracking-wider text-slate-300 hover:text-white hover:bg-[#141A29] rounded-lg transition-all"
            >
              <ShieldIcon className="w-3.5 h-3.5 text-primary-brand" />
              <span>Admin Console</span>
            </Link>
          )}
          <button
            onClick={() => logoutUser()}
            className="w-full flex items-center gap-2.5 px-4 py-2.5 mt-1 text-xs font-mono font-bold uppercase tracking-wider text-rose-400 hover:bg-rose-950/40 hover:text-rose-300 transition-all rounded-lg cursor-pointer"
          >
            Sign Out
          </button>
        </div>
      );
    }

    return (
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center gap-2.5 px-2.5 sm:px-3 py-1.5 rounded-xl border border-[#1E293B] bg-[#0A0D18] hover:border-primary-brand/60 hover:bg-[#101524] transition-all duration-200 focus:outline-none shadow-md cursor-pointer group"
        >
          {/* Athlete Avatar Badge */}
          <div 
            className="w-7 h-7 rounded-lg flex items-center justify-center font-display font-black text-xs shrink-0 shadow-sm group-hover:scale-105 transition-transform duration-200 overflow-hidden"
            style={{
              backgroundColor: "var(--primary-brand)",
              color: "var(--game-btn-text, #FFFFFF)",
            }}
          >
            {user.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.avatar}
                alt={user.displayName}
                className="w-full h-full object-cover"
              />
            ) : (
              user.displayName.charAt(0)
            )}
          </div>
          <div className="hidden sm:flex flex-col text-left leading-tight pr-1">
            <span className="text-xs font-display font-black tracking-wide text-white uppercase group-hover:text-primary-brand transition-colors">
              {user.displayName}
            </span>
            <span className="text-[10px] font-mono text-slate-400">
              {user.university?.name?.split(" ")[0] || "University"} • <span className="text-slate-300 font-bold uppercase">{user.role || "ATHLETE"}</span>
            </span>
          </div>
          <svg
            className={`w-3.5 h-3.5 text-slate-400 group-hover:text-white transition-transform duration-200 ${
              dropdownOpen ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {dropdownOpen && (
          <div className="absolute right-0 mt-2 w-56 rounded-xl bg-[#0A0D18] border border-[#1E293B] shadow-2xl z-50 py-2 animate-dropdown-pop overflow-hidden">
            <div className="px-4 py-2 border-b border-[#182338]">
              <span className="text-xs font-display font-black text-white uppercase block">
                {user.displayName}
              </span>
              <span className="text-[10px] font-mono text-slate-400 block mt-0.5 truncate">
                {user.email}
              </span>
            </div>
            <div className="py-1">
              <Link
                href="/dashboard"
                onClick={() => setDropdownOpen(false)}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-mono font-bold uppercase tracking-wider text-slate-300 hover:text-white hover:bg-[#141A29] hover:translate-x-1 transition-all duration-150"
              >
                <HomeIcon className="w-3.5 h-3.5 text-primary-brand" />
                <span>My Dashboard</span>
              </Link>
              {user.role !== "ADMIN" && user.role !== "ORGANIZER" && !hasSquad && (
                <>
                  <Link
                    href="/team/create"
                    onClick={() => setDropdownOpen(false)}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-mono font-bold uppercase tracking-wider text-slate-300 hover:text-white hover:bg-[#141A29] hover:translate-x-1 transition-all duration-150"
                  >
                    <PlusIcon className="w-3.5 h-3.5 text-primary-brand" />
                    <span>Create Squad</span>
                  </Link>
                  <Link
                    href="/team/join"
                    onClick={() => setDropdownOpen(false)}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-mono font-bold uppercase tracking-wider text-slate-300 hover:text-white hover:bg-[#141A29] hover:translate-x-1 transition-all duration-150"
                  >
                    <UsersIcon className="w-3.5 h-3.5 text-primary-brand" />
                    <span>Join Squad</span>
                  </Link>
                </>
              )}
              {user.role !== "ORGANIZER" && (
                <Link
                  href="/scrims"
                  onClick={() => setDropdownOpen(false)}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-mono font-bold uppercase tracking-wider text-slate-300 hover:text-white hover:bg-[#141A29] hover:translate-x-1 transition-all duration-150"
                >
                  <SwordsIcon className="w-3.5 h-3.5 text-primary-brand" />
                  <span>Scrims Board</span>
                </Link>
              )}
              {user.role === "ORGANIZER" && (
                <Link
                  href="/organize"
                  onClick={() => setDropdownOpen(false)}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-mono font-bold uppercase tracking-wider text-amber-400 hover:text-white hover:bg-[#141A29] hover:translate-x-1 transition-all duration-150"
                >
                  <ShieldIcon className="w-3.5 h-3.5 text-amber-400" />
                  <span>Manage Tournaments</span>
                </Link>
              )}
              {user.role === "ADMIN" && (
                <Link
                  href="/admin"
                  onClick={() => setDropdownOpen(false)}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-mono font-bold uppercase tracking-wider text-slate-300 hover:text-white hover:bg-[#141A29] hover:translate-x-1 transition-all duration-150"
                >
                  <ShieldIcon className="w-3.5 h-3.5 text-primary-brand" />
                  <span>Admin Console</span>
                </Link>
              )}
            </div>
            <div className="pt-1 border-t border-[#182338] px-2 mt-1">
              <button
                onClick={() => {
                  setDropdownOpen(false);
                  logoutUser();
                }}
                className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider text-rose-400 hover:bg-rose-950/40 hover:text-rose-300 transition-all rounded-lg cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (mobile) {
    return (
      <div className="flex flex-col gap-2">
        <Link
          href="/login"
          className="inline-flex h-11 w-full items-center justify-center tactical-btn-secondary px-5 text-xs font-bold uppercase tracking-wider text-white"
        >
          Log In
        </Link>
        <Link
          href="/register"
          className="inline-flex h-11 w-full items-center justify-center game-theme-btn px-5 text-xs font-bold uppercase tracking-wider shadow-md"
        >
          Sign Up
        </Link>
      </div>
    );
  }

  return (
    <div className="hidden lg:flex items-center gap-3">
      <Link href="/login" className="inline-flex h-9 items-center justify-center tactical-btn-secondary px-5 text-xs font-bold uppercase tracking-wider text-white">
        Log In
      </Link>
      <Link
        href="/register"
        className="inline-flex h-9 items-center justify-center game-theme-btn px-5 text-xs font-bold uppercase tracking-wider shadow-md"
      >
        Sign Up
      </Link>
    </div>
  );
}

function NavigationLinks({ mobile = false, onClose }: { mobile?: boolean; onClose?: () => void }) {
  const { isLoggedIn, user } = useAuth();
  const pathname = usePathname();
  const isOrganizer = user?.role === "ORGANIZER";

  const navItems = [
    { name: "Home", href: "/" },
    { name: "Tournaments", href: "/tournaments" },
    { name: "Rankings", href: "/leaderboard" },
    { name: "Universities", href: "/universities" },
    ...(isLoggedIn && !isOrganizer ? [{ name: "Scrims", href: "/scrims" }] : []),
    { name: "News", href: "/community" },
  ];

  if (mobile) {
    return (
      <nav className="flex flex-col gap-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`font-display text-sm font-black uppercase tracking-wider transition-all duration-200 px-4 py-2.5 rounded-lg ${
                isActive 
                  ? "text-primary-brand bg-primary-brand/10 border border-primary-brand/30" 
                  : "text-slate-300 hover:text-white"
              }`}
            >
              {item.name}
            </Link>
          );
        })}
      </nav>
    );
  }

  return (
    <nav className="hidden lg:flex items-center gap-1 xl:gap-2 h-16">
      {navItems.map((item) => {
        const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`font-display text-xs xl:text-sm font-black tracking-wider uppercase transition-all duration-200 relative flex items-center h-10 px-3 xl:px-4 cursor-pointer group ${
              isActive
                ? "text-white"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <span className="relative z-10 transition-transform duration-200 group-hover:scale-105">
              {item.name}
            </span>

            {/* Sleek Underline Cyber Lightbar */}
            {isActive && (
              <span 
                className="absolute bottom-1 left-2.5 right-2.5 h-[2px] rounded-full"
                style={{
                  backgroundColor: "var(--primary-brand)",
                  boxShadow: "0 0 10px var(--primary-brand)",
                }}
              />
            )}
          </Link>
        );
      })}
    </nav>
  );
}

function GlobalWarRoomModal() {
  const { activeWarRoom, closeWarRoom } = useWarRoom();

  return (
    <ScrimWarRoomModal
      scrim={activeWarRoom?.scrim ?? null}
      isOpen={!!activeWarRoom}
      onClose={closeWarRoom}
      isHost={activeWarRoom?.isHost ?? false}
    />
  );
}

function GlobalTournamentModal() {
  const { activeTournamentBracketId, closeTournamentBracket } = useWarRoom();

  return (
    <TournamentBracketModal
      isOpen={!!activeTournamentBracketId}
      onClose={closeTournamentBracket}
      tournamentId={activeTournamentBracketId ?? undefined}
      title="TOURNAMENT WAR ROOM & BRACKET"
      subtitle="SANCTIONED COLLEGIATE CIRCUIT"
    />
  );
}

function PublicLayoutContent({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const [menuPath, setMenuPath] = useState(pathname);
  const { user } = useAuth();
  const { selectedGame, isLoaded } = useGame();

  if (menuPath !== pathname) {
    setMenuPath(pathname);
    setMobileMenuOpen(false);
  }

  const showNavbar = !(pathname === "/" && !selectedGame && isLoaded && !user);

  return (
    <div className="flex min-h-screen min-w-0 flex-col bg-background text-foreground relative overflow-x-clip">
      <GameSelectorModal />

      {showNavbar && (
        <header className="sticky top-0 z-40 border-b border-[#182338] bg-[#070912]/95 backdrop-blur-md">
          <div className="flex h-14 lg:h-16 items-center justify-between gap-3 px-4 sm:px-6 lg:px-10">
            <div className="flex min-w-0 items-center gap-6 lg:gap-8">
              <Link href="/" className="flex items-center gap-2.5 font-display text-lg lg:text-xl font-black tracking-wider text-white group shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/logo.png" alt="Collegium Logo" className="w-7 h-7 object-contain rounded-md shadow-md shadow-primary-brand/30 transition-transform duration-200 group-hover:scale-110 shrink-0" />
                <span className="group-hover:text-primary-brand transition-colors">COLLEGIUM</span>
              </Link>
              <NavigationLinks />
            </div>

            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <div className="hidden lg:flex items-center gap-3">
                <OrganizeNavButton />
                <HeaderGameSwitcher />
              </div>
              <NotificationBell />
              <div className="hidden lg:block">
                <HeaderAuthControls />
              </div>

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="flex lg:hidden h-9 w-9 items-center justify-center rounded-xl bg-[#141A29] border border-[#232D44] text-slate-300 hover:text-white"
                aria-label="Toggle mobile navigation menu"
                aria-expanded={mobileMenuOpen}
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {mobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>

          {mobileMenuOpen && (
            <div className="border-b border-[#182338] bg-[#0A0D18] p-4 lg:hidden animate-page-slide-in max-h-[calc(100dvh-3.5rem)] overflow-y-auto">
              <div className="mb-3">
                <HeaderGameSwitcher variant="menu" onInteract={() => setMobileMenuOpen(false)} />
              </div>
              <div className="mb-3 empty:hidden">
                <OrganizeNavButton variant="menu" onNavigate={() => setMobileMenuOpen(false)} />
              </div>
              <NavigationLinks mobile onClose={() => setMobileMenuOpen(false)} />
              <div className="mt-4 pt-4 border-t border-[#182338] flex flex-col gap-2">
                <HeaderAuthControls mobile />
              </div>
            </div>
          )}
        </header>
      )}

      <main className="flex min-w-0 flex-1 flex-col">{children}</main>

      <ChatQuickAccess />
      <GlobalWarRoomModal />
      <GlobalTournamentModal />
      <FloatingNotificationToast />
    </div>
  );
}

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthProvider>
      <GameProvider>
        <NotificationProvider>
          <WarRoomProvider>
            <PublicLayoutContent>{children}</PublicLayoutContent>
          </WarRoomProvider>
        </NotificationProvider>
      </GameProvider>
    </AuthProvider>
  );
}
