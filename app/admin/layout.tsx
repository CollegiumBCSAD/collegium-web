"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import AdminSidebar from "@/components/admin/AdminSidebar";

function AdminGate({ children }: { children: React.ReactNode }) {
  const { isLoggedIn, isLoaded, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const isAdmin = isLoggedIn && user?.role === "ADMIN";
  const [navOpen, setNavOpen] = useState(false);
  const [navPath, setNavPath] = useState(pathname);

  if (navPath !== pathname) {
    setNavPath(pathname);
    setNavOpen(false);
  }

  useEffect(() => {
    if (isLoaded && !isAdmin) {
      router.replace("/dashboard");
    }
  }, [isLoaded, isAdmin, router]);

  useEffect(() => {
    if (!navOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setNavOpen(false);
    }

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [navOpen]);

  if (!isLoaded || !isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="font-sans text-sm text-secondary-text">Loading…</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#000000] text-white selection:bg-emerald-500/30 selection:text-emerald-300 font-sans antialiased relative overflow-hidden admin-theme">
      {/* Top Radiant Emerald Spotlight (Emphasized) */}
      <div className="fixed top-0 left-0 right-0 h-[500px] bg-[radial-gradient(ellipse_75%_50%_at_50%_-10%,rgba(16,185,129,0.24),transparent_75%)] pointer-events-none z-0" />

      {/* Secondary Ambient Corner Aura Glows */}
      <div className="fixed top-[10%] right-[-5%] w-[650px] h-[500px] bg-emerald-500/12 rounded-full blur-[150px] pointer-events-none z-0 animate-pulse" style={{ animationDuration: "8s" }} />
      <div className="fixed bottom-[-100px] left-[30%] w-[550px] h-[400px] bg-teal-500/8 rounded-full blur-[140px] pointer-events-none z-0" />

      {/* Subtle Tactical Tech Grid Overlay */}
      <div className="fixed inset-0 bg-[radial-gradient(#1B3828_1px,transparent_1px)] [background-size:28px_28px] opacity-20 pointer-events-none z-0" />

      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-30 flex h-14 items-center justify-between gap-3 border-b border-[#171717] bg-[#050505]/95 px-3 backdrop-blur-xl">
        <button
          type="button"
          onClick={() => setNavOpen(true)}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#262626] bg-[#0A0A0A] text-neutral-300 hover:text-white"
          aria-label="Open admin navigation"
          aria-expanded={navOpen}
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div className="min-w-0 flex-1">
          <p className="font-display text-xs font-bold uppercase tracking-wider text-white truncate">
            Collegium Admin
          </p>
          <p className="text-[9px] font-mono uppercase tracking-widest text-emerald-400">
            Moderation Desk
          </p>
        </div>
        <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
          <span className="text-[9px] font-mono text-emerald-400 font-bold">ONLINE</span>
        </span>
      </div>

      {navOpen && (
        <button
          type="button"
          className="lg:hidden fixed inset-0 z-40 bg-black/70 backdrop-blur-sm"
          aria-label="Close admin navigation backdrop"
          onClick={() => setNavOpen(false)}
        />
      )}

      <AdminSidebar open={navOpen} onClose={() => setNavOpen(false)} />

      {/* Scrollable Page Content */}
      <main className="flex-1 h-full overflow-y-auto min-w-0 relative z-10 admin-theme pt-14 lg:pt-0">
        {children}
      </main>
    </div>
  );
}

export default function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <AuthProvider>
      <AdminGate>{children}</AdminGate>
    </AuthProvider>
  );
}
