"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import AdminSidebar from "@/components/admin/AdminSidebar";

function AdminGate({ children }: { children: React.ReactNode }) {
  const { isLoggedIn, isLoaded, user } = useAuth();
  const router = useRouter();
  const isAdmin = isLoggedIn && user?.role === "ADMIN";

  useEffect(() => {
    if (isLoaded && !isAdmin) {
      router.replace("/dashboard");
    }
  }, [isLoaded, isAdmin, router]);

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

      {/* Fixed Sidebar */}
      <AdminSidebar />

      {/* Scrollable Page Content */}
      <main className="flex-1 h-full overflow-y-auto min-w-0 relative z-10 admin-theme">
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
