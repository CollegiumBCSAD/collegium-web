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
    <div className="flex h-screen bg-[#040605] text-white selection:bg-emerald-500/30 selection:text-emerald-300 font-sans antialiased relative overflow-hidden admin-theme">
      {/* One soft emerald wash and a faint dot grid; content stays the focus. */}
      <div className="pointer-events-none fixed inset-x-0 top-0 z-0 h-[420px] bg-[radial-gradient(ellipse_70%_55%_at_50%_-15%,rgba(16,185,129,0.14),transparent_75%)]" />
      <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(rgba(255,255,255,0.035)_1px,transparent_1px)] [background-size:24px_24px]" />

      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-30 flex h-14 items-center justify-between gap-3 border-b border-white/[0.06] bg-[#060807]/95 px-3 backdrop-blur-xl">
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
        <p className="min-w-0 flex-1 truncate font-display text-sm font-black uppercase tracking-wider text-white">
          Collegium <span className="text-emerald-400">Admin</span>
        </p>
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
