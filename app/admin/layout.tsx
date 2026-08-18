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
    <div className="flex min-h-screen bg-background text-foreground">
      <AdminSidebar />
      <main className="flex-1 flex flex-col">{children}</main>
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
